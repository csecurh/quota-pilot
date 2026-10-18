import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

export async function readClaudeUsage({ path = join(homedir(), '.quotapilot', 'claude-latest.json') } = {}) {
  try {
    const raw = JSON.parse(await readFile(path, 'utf8'));
    if (raw?.provider !== 'claude_code') return null;
    return {
      provider: 'claude_code',
      capturedAt: raw.capturedAt,
      modelName: raw.payload?.modelName ?? null,
      primary: raw.payload?.primary ?? null,
      secondary: raw.payload?.secondary ?? null,
      context: raw.payload?.context ?? null,
      promptCache: raw.payload?.promptCache ?? null,
      sessionCostUsdEstimate: raw.payload?.sessionCostUsdEstimate ?? null
    };
  } catch {
    return null;
  }
}
