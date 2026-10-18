import { homedir } from 'node:os';
import { join } from 'node:path';
import { MAX_CLAUDE_SNAPSHOT_BYTES, isPlainObject, safePercent, safeWindow } from '../security.mjs';
import { readSafeText } from '../../scripts/secure-fs.mjs';

export async function readClaudeUsage({ path = join(homedir(), '.quotapilot', 'claude-latest.json'), maxAgeMs = 30 * 60 * 1000 } = {}) {
  try {
    const text = await readSafeText(path, { maxBytes: MAX_CLAUDE_SNAPSHOT_BYTES, allowMissing: true, requirePrivate: true });
    if (!text) return null;
    const raw = JSON.parse(text);
    if (!isPlainObject(raw) || raw.provider !== 'claude_code' || !isPlainObject(raw.payload)) return null;

    const capturedMs = Date.parse(raw.capturedAt);
    if (!Number.isFinite(capturedMs) || capturedMs > Date.now() + 5 * 60 * 1000 || Date.now() - capturedMs > maxAgeMs) return null;

    const context = isPlainObject(raw.payload.context)
      ? {
          usedPercent: safePercent(raw.payload.context.usedPercent),
          remainingPercent: safePercent(raw.payload.context.remainingPercent),
        }
      : null;

    return {
      provider: 'claude_code',
      capturedAt: new Date(capturedMs).toISOString(),
      primary: safeWindow(raw.payload.primary, 300),
      secondary: safeWindow(raw.payload.secondary, 10080),
      context,
    };
  } catch {
    return null;
  }
}
