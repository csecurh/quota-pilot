export const MAX_MCP_LINE_BYTES = 256 * 1024;
export const MAX_PROVIDER_LINE_BYTES = 1024 * 1024;
export const MAX_CLAUDE_SNAPSHOT_BYTES = 64 * 1024;
export const MAX_CONFIG_BYTES = 1024 * 1024;

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null);
}

export function boundedText(value, max = 128) {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

export function safePercent(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : null;
}

export function normalizeReset(value) {
  let ms = null;
  if (typeof value === 'number' && Number.isFinite(value)) {
    ms = value > 10_000_000_000 ? value : value * 1000;
  } else if (typeof value === 'string' && value.length <= 64) {
    const parsed = Date.parse(value);
    if (Number.isFinite(parsed)) ms = parsed;
  }
  if (!Number.isFinite(ms)) return null;
  const now = Date.now();
  if (ms < now - 24 * 60 * 60 * 1000 || ms > now + 31 * 24 * 60 * 60 * 1000) return null;
  return new Date(ms).toISOString();
}

export function safeWindow(value, defaultDuration = null) {
  if (!isPlainObject(value)) return null;
  const usedPercent = safePercent(value.usedPercent ?? value.used_percentage ?? value.used_percent);
  const remainingPercent = safePercent(
    value.remainingPercent ?? value.remaining_percentage ?? value.remaining_percent
      ?? (usedPercent == null ? null : 100 - usedPercent)
  );
  const durationRaw = Number(value.windowDurationMins ?? value.window_minutes ?? defaultDuration);
  const windowDurationMins = Number.isFinite(durationRaw) && durationRaw >= 1 && durationRaw <= 60 * 24 * 31
    ? Math.round(durationRaw)
    : defaultDuration;
  return {
    usedPercent,
    remainingPercent,
    windowDurationMins,
    resetsAt: normalizeReset(value.resetsAt ?? value.resets_at),
  };
}

export function validateToolArguments(name, args) {
  if (!isPlainObject(args)) return false;
  const keys = Object.keys(args);
  if (name === 'get_usage') {
    return keys.length === 1
      && keys[0] === 'provider'
      && (args.provider === 'codex' || args.provider === 'claude_code');
  }
  if (name === 'get_overview' || name === 'open_hud') return keys.length === 0;
  return false;
}

export function createWindowLimiter({ limit = 120, windowMs = 60_000 } = {}) {
  let startedAt = Date.now();
  let count = 0;
  return () => {
    const now = Date.now();
    if (now - startedAt >= windowMs) {
      startedAt = now;
      count = 0;
    }
    count += 1;
    return count <= limit;
  };
}

export function publicToolError(provider = null) {
  return provider ? `${provider} usage is temporarily unavailable.` : 'Usage data is temporarily unavailable.';
}
