import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { burnRate, deadHours, risk, runwayHours } from './domain/analytics.mjs';
import { readCodexUsage } from './providers/codex.mjs';
import { readClaudeUsage } from './providers/claude.mjs';
import { FALLBACK_BRAND, detectHostBrand } from './host.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const HUD_URI = 'ui://quotapilot/live.html';
const history = new Map([['codex', []], ['claude_code', []]]);
let hostBrand = FALLBACK_BRAND;

function remember(usage) {
  if (!usage?.provider || !usage?.primary) return;
  const list = history.get(usage.provider) ?? [];
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

async function readProvider(provider) {
  if (provider === 'codex') return intelligence(await readCodexUsage());
  if (provider === 'claude_code') return intelligence(await readClaudeUsage());
  throw new Error(`Unsupported provider: ${provider}`);
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
    .filter((x) => x.primary?.remainingPercent != null)
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

const tools = [
  {
    name: 'open_hud',
    title: 'Open usage HUD',
    description: 'Open the live host-aware usage HUD. In ChatGPT the component requests picture-in-picture so it can remain visible while the conversation continues.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
    _meta: hudMeta,
  },
  {
    name: 'get_usage',
    title: 'Get AI usage',
    description: 'Read local quota and reset data for Codex or Claude Code.',
    inputSchema: {
      type: 'object',
      properties: {
        provider: { type: 'string', enum: ['codex', 'claude_code'] },
      },
      required: ['provider'],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  {
    name: 'get_overview',
    title: 'Get quota overview',
    description: 'Compare local Codex and Claude Code usage and return remaining, used, reset windows and derived pacing estimates.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
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
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

async function hudResource() {
  const html = await readFile(resolve(ROOT, 'ui/quota-widget.html'), 'utf8');
  return {
    uri: HUD_URI,
    mimeType: 'text/html;profile=mcp-app',
    text: html,
    _meta: {
      ui: { prefersBorder: true },
      'openai/widgetDescription': 'Live local host-aware quota HUD.',
      'openai/ui': {
        availableDisplayModes: ['inline', 'pip', 'fullscreen'],
      },
    },
  };
}

async function toolResult(name, args) {
  if (name === 'get_usage') {
    const data = await readProvider(args.provider);
    return {
      content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
      structuredContent: { usage: data },
      isError: false,
    };
  }

  if (name === 'get_overview' || name === 'open_hud') {
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
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function handle(message) {
  if (!message || message.jsonrpc !== '2.0') return;

  if (message.method === 'initialize') {
    hostBrand = detectHostBrand(message.params?.clientInfo ?? {});
    ok(message.id, {
      protocolVersion: message.params?.protocolVersion ?? '2025-06-18',
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
      },
      serverInfo: { name: 'quota-pilot', version: '0.3.0' },
      instructions: 'This is a local host-aware usage HUD. Prefer open_hud for users who want persistent visual status. Never invent unavailable quota data.',
    });
    return;
  }

  if (message.method === 'notifications/initialized') return;

  if (message.method === 'ping') {
    ok(message.id, {});
    return;
  }

  if (message.method === 'tools/list') {
    ok(message.id, { tools });
    return;
  }

  if (message.method === 'resources/list') {
    ok(message.id, {
      resources: [{
        uri: HUD_URI,
        name: 'Live usage HUD',
        title: hostBrand.displayName,
        description: 'Live quota HUD with remaining, used and reset countdowns.',
        mimeType: 'text/html;profile=mcp-app',
      }],
    });
    return;
  }

  if (message.method === 'resources/read') {
    if (message.params?.uri !== HUD_URI) {
      fail(message.id, -32002, 'Resource not found');
      return;
    }
    ok(message.id, { contents: [await hudResource()] });
    return;
  }

  if (message.method === 'tools/call') {
    try {
      ok(message.id, await toolResult(message.params?.name, message.params?.arguments ?? {}));
    } catch (error) {
      ok(message.id, {
        content: [{ type: 'text', text: error instanceof Error ? error.message : String(error) }],
        isError: true,
      });
    }
    return;
  }

  if (message.id != null) fail(message.id, -32601, `Method not found: ${message.method}`);
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  while (true) {
    const newline = buffer.indexOf('\n');
    if (newline < 0) break;
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    let message;
    try { message = JSON.parse(line); }
    catch { continue; }
    handle(message).catch((error) => {
      if (message?.id != null) fail(message.id, -32603, error instanceof Error ? error.message : String(error));
    });
  }
});
