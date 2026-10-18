import { burnRate, deadHours, risk, runwayHours } from './domain/analytics.mjs';
import { readCodexUsage } from './providers/codex.mjs';
import { readClaudeUsage } from './providers/claude.mjs';

const history = new Map([['codex', []], ['claude_code', []]]);

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
    constrainedProvider: constrained?.provider ?? null,
    providers,
  };
}

const tools = [
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
    description: 'Compare local Codex and Claude Code usage and return the most constrained provider.',
    inputSchema: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
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

async function handle(message) {
  if (!message || message.jsonrpc !== '2.0') return;

  if (message.method === 'initialize') {
    ok(message.id, {
      protocolVersion: message.params?.protocolVersion ?? '2025-06-18',
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: 'quota-pilot', version: '0.1.0' },
      instructions: 'Use QuotaPilot to inspect local Codex and Claude Code quota, reset windows, burn rate, runway and predicted dead time. Never invent unavailable quota data.',
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

  if (message.method === 'tools/call') {
    try {
      const name = message.params?.name;
      const args = message.params?.arguments ?? {};
      let data;
      if (name === 'get_usage') data = await readProvider(args.provider);
      else if (name === 'get_overview') data = await getOverview();
      else {
        fail(message.id, -32601, `Unknown tool: ${name}`);
        return;
      }

      ok(message.id, {
        content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        structuredContent: name === 'get_usage' ? { usage: data } : { overview: data },
        isError: false,
      });
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
