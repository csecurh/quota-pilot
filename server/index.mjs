import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { burnRate, deadHours, risk, runwayHours } from './domain/analytics.mjs';
import { detectHostBrand, FALLBACK_BRAND } from './host.mjs';
import { readClaudeUsage } from './providers/claude.mjs';
import { readCodexUsage } from './providers/codex.mjs';
import {
  MAX_MCP_LINE_BYTES,
  boundedText,
  createWindowLimiter,
  isPlainObject,
  publicToolError,
  validateToolArguments,
} from './security.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HUD_URI = 'ui://quotapilot/live.html';
const CACHE_TTL_MS = 15_000;
const history = new Map([['codex', []], ['claude_code', []]]);
const providerCache = new Map();
const inFlight = new Map();
const allowRequest = createWindowLimiter({ limit: 240, windowMs: 60_000 });
let hostBrand = FALLBACK_BRAND;

function remember(usage) {
  if (!usage?.provider || !usage?.primary) return;
  const list = history.get(usage.provider) ?? [];
  if (list.at(-1)?.capturedAt === usage.capturedAt) return;
  list.push({ capturedAt: usage.capturedAt, remainingPercent: usage.primary.remainingPercent });
  history.set(usage.provider, list.slice(-96));
}

function intelligence(usage) {
  if (!usage) return null;
  remember(usage);
  const burn = burnRate(history.get(usage.provider) ?? []);
  const remaining = usage.primary?.remainingPercent ?? null;
  const runway = runwayHours(remaining, burn);
  return {
    ...usage,
    intelligence: {
      burnRatePercentPerHour: burn,
      runwayHours: runway,
      deadHours: deadHours({ resetsAt: usage.primary?.resetsAt, runway }),
      risk: risk(remaining, burn),
    },
  };
}

async function readProviderFresh(provider) {
  if (provider === 'codex') return intelligence(await readCodexUsage());
  if (provider === 'claude_code') return intelligence(await readClaudeUsage());
  throw new Error('Unsupported provider');
}

async function readProvider(provider) {
  if (provider !== 'codex' && provider !== 'claude_code') throw new Error('Unsupported provider');

  const cached = providerCache.get(provider);
  if (cached && Date.now() - cached.at <= CACHE_TTL_MS) return cached.value;
  if (inFlight.has(provider)) return inFlight.get(provider);

  const promise = readProviderFresh(provider)
    .then((value) => {
      providerCache.set(provider, { at: Date.now(), value });
      return value;
    })
    .finally(() => inFlight.delete(provider));

  inFlight.set(provider, promise);
  return promise;
}

async function getOverview() {
  const [codex, claude] = await Promise.allSettled([
    readProvider('codex'),
    readProvider('claude_code'),
  ]);

  const providers = [
    codex.status === 'fulfilled' ? codex.value : null,
    claude.status === 'fulfilled' ? claude.value : null,
  ].filter(Boolean);

  const constrained = providers
    .filter((value) => value.primary?.remainingPercent != null)
    .sort((a, b) => a.primary.remainingPercent - b.primary.remainingPercent)[0] ?? null;

  return {
    generatedAt: new Date().toISOString(),
    host: hostBrand,
    constrainedProvider: constrained?.provider ?? null,
    providers,
  };
}

const hudMeta = {
  ui: { resourceUri: HUD_URI },
  'openai/outputTemplate': HUD_URI,
  'openai/toolInvocation/invoking': 'Opening usage HUD',
  'openai/toolInvocation/invoked': 'Usage HUD active',
};

const readOnlyAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

const tools = [
  {
    name: 'open_hud',
    title: 'Open usage HUD',
    description: 'Use when the user wants a persistent local quota HUD. Never requests credentials and never sends usage to the public internet.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: readOnlyAnnotations,
    _meta: hudMeta,
  },
  {
    name: 'get_usage',
    title: 'Get AI usage',
    description: 'Use when the user asks for local Codex or Claude Code quota/reset data. Read-only and local-only.',
    inputSchema: {
      type: 'object',
      properties: { provider: { type: 'string', enum: ['codex', 'claude_code'] } },
      required: ['provider'],
      additionalProperties: false,
    },
    annotations: readOnlyAnnotations,
  },
  {
    name: 'get_overview',
    title: 'Get quota overview',
    description: 'Use when the user asks for an overview of local usage. Returns only minimized quota telemetry and derived estimates.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    annotations: readOnlyAnnotations,
    _meta: { ...hudMeta, 'openai/widgetAccessible': true },
  },
];

function send(message) {
  process.stdout.write(JSON.stringify(message) + '\n');
}

function ok(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: '2.0', id: id ?? null, error: { code, message } });
}

async function hudResource() {
  const html = await readFile(resolve(ROOT, 'ui/quota-widget.html'), 'utf8');
  return {
    uri: HUD_URI,
    mimeType: 'text/html;profile=mcp-app',
    text: html,
    _meta: {
      ui: {
        prefersBorder: true,
        csp: {
          connectDomains: [],
          resourceDomains: [],
        },
      },
      'openai/widgetDescription': 'Live local host-aware quota HUD.',
      'openai/ui': {
        availableDisplayModes: ['inline', 'pip', 'fullscreen'],
      },
    },
  };
}

async function toolResult(name, args) {
  if (!validateToolArguments(name, args)) {
    return {
      content: [{ type: 'text', text: 'Invalid tool arguments.' }],
      isError: true,
    };
  }

  try {
    if (name === 'get_usage') {
      const data = await readProvider(args.provider);
      return {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: { usage: data },
        isError: false,
      };
    }

    const data = await getOverview();
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      structuredContent: { overview: data },
      isError: false,
      _meta: {
        ui: { resourceUri: HUD_URI },
        'openai/outputTemplate': HUD_URI,
      },
    };
  } catch {
    return {
      content: [{ type: 'text', text: publicToolError(args.provider ?? null) }],
      isError: true,
    };
  }
}

async function handle(message) {
  if (!isPlainObject(message) || message.jsonrpc !== '2.0') return;
  if (!allowRequest()) {
    if (message.id != null) fail(message.id, -32000, 'Local request rate limit exceeded');
    return;
  }

  const method = boundedText(message.method, 96);
  if (!method) return;

  if (method === 'initialize') {
    hostBrand = detectHostBrand(isPlainObject(message.params?.clientInfo) ? message.params.clientInfo : {});
    ok(message.id, {
      protocolVersion: boundedText(message.params?.protocolVersion, 32) || '2025-06-18',
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
      },
      serverInfo: { name: 'quota-pilot', version: '0.4.0' },
      instructions: 'Local-only read-only usage HUD. Never request credentials, prompts, responses, transcripts, source code, or unrelated files. Never invent unavailable quota data.',
    });
    return;
  }

  if (method === 'notifications/initialized') return;
  if (method === 'ping') return ok(message.id, {});
  if (method === 'tools/list') return ok(message.id, { tools });

  if (method === 'resources/list') {
    return ok(message.id, {
      resources: [{
        uri: HUD_URI,
        name: 'Live usage HUD',
        title: hostBrand.displayName,
        description: 'Live quota HUD with remaining, used and reset countdowns.',
        mimeType: 'text/html;profile=mcp-app',
      }],
    });
  }

  if (method === 'resources/read') {
    if (message.params?.uri !== HUD_URI) return fail(message.id, -32002, 'Resource not found');
    return ok(message.id, { contents: [await hudResource()] });
  }

  if (method === 'tools/call') {
    const name = boundedText(message.params?.name, 64);
    if (!tools.some((tool) => tool.name === name)) return fail(message.id, -32601, 'Unknown tool');
    const args = Object.hasOwn(message.params, 'arguments') ? message.params.arguments : {};
    return ok(message.id, await toolResult(name, args));
  }

  if (message.id != null) fail(message.id, -32601, 'Method not found');
}

let buffer = '';
let oversizedFrames = 0;
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;

  if (Buffer.byteLength(buffer, 'utf8') > MAX_MCP_LINE_BYTES && !buffer.includes('\n')) {
    buffer = '';
    oversizedFrames += 1;
    fail(null, -32000, 'Request too large');
    if (oversizedFrames >= 3) process.exitCode = 1;
    return;
  }

  while (true) {
    const newline = buffer.indexOf('\n');
    if (newline < 0) break;
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;

    if (Buffer.byteLength(line, 'utf8') > MAX_MCP_LINE_BYTES) {
      fail(null, -32000, 'Request too large');
      continue;
    }

    let message;
    try { message = JSON.parse(line); }
    catch {
      fail(null, -32700, 'Parse error');
      continue;
    }

    handle(message).catch(() => {
      if (message?.id != null) fail(message.id, -32603, 'Internal error');
    });
  }
});
