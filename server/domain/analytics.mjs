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
  if (hours <= 0.03) return null;
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
