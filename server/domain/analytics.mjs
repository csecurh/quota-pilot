export function clamp(value, min = 0, max = 100) {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return Math.max(min, Math.min(max, Number(value)));
}

export function remainingFromUsed(used) {
  const value = clamp(used);
  return value == null ? null : 100 - value;
}

export function burnRate(history) {
  const points = history
    .filter((x) => x?.capturedAt && x?.remainingPercent != null)
    .map((x) => ({ t: Date.parse(x.capturedAt), remaining: Number(x.remainingPercent) }))
    .filter((x) => Number.isFinite(x.t) && Number.isFinite(x.remaining))
    .sort((a, b) => a.t - b.t)
    .slice(-8);
  if (points.length < 2) return null;
  const first = points[0];
  const last = points.at(-1);
  const hours = (last.t - first.t) / 3_600_000;
  // Avoid noisy forecasts until samples span at least five minutes.
  if (hours < 5 / 60) return null;
  const consumed = first.remaining - last.remaining;
  if (consumed < 0) return null;
  return Number((consumed / hours).toFixed(2));
}

export function runwayHours(remainingPercent, burnPerHour) {
  if (remainingPercent == null || burnPerHour == null || burnPerHour <= 0) return null;
  return Number((remainingPercent / burnPerHour).toFixed(2));
}

export function deadHours({ resetsAt, runway }) {
  if (!resetsAt || runway == null) return null;
  const hoursToReset = Math.max(0, (Date.parse(resetsAt) - Date.now()) / 3_600_000);
  if (!Number.isFinite(hoursToReset)) return null;
  return Number(Math.max(0, hoursToReset - runway).toFixed(2));
}

export function risk(remainingPercent, burnPerHour) {
  if (remainingPercent == null) return 'unknown';
  if (remainingPercent <= 15) return 'critical';
  if (remainingPercent <= 30 || (burnPerHour ?? 0) >= 20) return 'watch';
  return 'healthy';
}

/**
 * Advisory-only warning. Never infer a reset timestamp or a burn rate when
 * provider data is missing. These alerts are local HUD indicators, not pushes.
 */
export function usageAlert({ remainingPercent, runway, dead, resetsAt, now = Date.now() } = {}) {
  const remaining = clamp(remainingPercent);
  if (remaining == null) return null;
  if (remaining <= 10) return { level: 'critical', code: 'quota_critical' };
  if (remaining <= 20) return { level: 'warning', code: 'quota_low' };

  const resetMs = typeof resetsAt === 'string' ? Date.parse(resetsAt) : NaN;
  if (!Number.isFinite(resetMs) || resetMs <= now) return null;
  if (!Number.isFinite(runway) || runway <= 0 || !Number.isFinite(dead) || dead < 0.25) return null;
  const hoursToReset = (resetMs - now) / 3_600_000;
  if (runway >= hoursToReset) return null;
  return { level: 'warning', code: 'pace_risk' };
}
