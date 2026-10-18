import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
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
      risk: risk(remaining, burn)
    }
  };
}

async function readProvider(provider) {
  if (provider === 'codex') return intelligence(await readCodexUsage());
  if (provider === 'claude_code') return intelligence(await readClaudeUsage());
  throw new Error(`Unsupported provider: ${provider}`);
}

const server = new McpServer(
  { name: 'quota-pilot', version: '0.1.0' },
  { instructions: 'Use QuotaPilot to inspect local Codex and Claude Code quota, reset windows, burn rate, runway and predicted dead time. Never invent unavailable quota data.' }
);

server.registerTool('get_usage', {
  title: 'Get AI usage',
  description: 'Read local quota and reset data for Codex or Claude Code.',
  inputSchema: { provider: z.enum(['codex', 'claude_code']) },
  annotations: { readOnlyHint: true, openWorldHint: false }
}, async ({ provider }) => {
  const data = await readProvider(provider);
  return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }], structuredContent: { usage: data } };
});

server.registerTool('get_overview', {
  title: 'Get quota overview',
  description: 'Compare local Codex and Claude Code usage and return the most constrained provider.',
  inputSchema: {},
  annotations: { readOnlyHint: true, openWorldHint: false }
}, async () => {
  const [codex, claude] = await Promise.allSettled([readProvider('codex'), readProvider('claude_code')]);
  const providers = [codex.status === 'fulfilled' ? codex.value : null, claude.status === 'fulfilled' ? claude.value : null].filter(Boolean);
  const constrained = providers
    .filter((x) => x.primary?.remainingPercent != null)
    .sort((a, b) => a.primary.remainingPercent - b.primary.remainingPercent)[0] ?? null;
  const overview = { generatedAt: new Date().toISOString(), constrainedProvider: constrained?.provider ?? null, providers };
  return { content: [{ type: 'text', text: JSON.stringify(overview, null, 2) }], structuredContent: { overview } };
});

await server.connect(new StdioServerTransport());
