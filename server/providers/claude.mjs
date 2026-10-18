import { lstat, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { MAX_CLAUDE_SNAPSHOT_BYTES, isPlainObject, safePercent, safeWindow } from '../security.mjs';

function validOwner(stat) {
  return typeof process.getuid !== 'function' || stat.uid === process.getuid();
}

export async function readClaudeUsage({ path = join(homedir(), '.quotapilot', 'claude-latest.json'), maxAgeMs = 30 * 60 * 1000 } = {}) {
  try {
    const stat = await lstat(path);
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_CLAUDE_SNAPSHOT_BYTES || !validOwner(stat)) return null;
    if (process.platform !== 'win32' && (stat.mode & 0o077) !== 0) return null;

    const raw = JSON.parse(await readFile(path, 'utf8'));
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
