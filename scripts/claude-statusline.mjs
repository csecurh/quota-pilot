#!/usr/bin/env node
let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  try {
    const input = raw ? JSON.parse(raw) : {};
    const rate = input.rate_limits ?? input.rateLimits ?? {};
    const five = rate.five_hour ?? rate.fiveHour ?? null;
    const week = rate.seven_day ?? rate.sevenDay ?? null;
    const fmt = (label, value) => {
      if (!value) return null;
      const used = Number(value.used_percentage ?? value.usedPercent);
      const remaining = Number.isFinite(used) ? Math.max(0, 100 - used) : null;
      const resetRaw = value.resets_at ?? value.resetsAt ?? null;
      const resetMs = typeof resetRaw === 'number' ? (resetRaw > 10000000000 ? resetRaw : resetRaw * 1000) : Date.parse(resetRaw ?? '');
      let reset = '—';
      if (Number.isFinite(resetMs)) {
        let mins = Math.max(0, Math.floor((resetMs - Date.now()) / 60000));
        const days = Math.floor(mins / 1440); mins %= 1440;
        const hours = Math.floor(mins / 60); mins %= 60;
        reset = days > 0 ? days + 'd' + hours + 'h' : hours > 0 ? hours + 'h' + mins + 'm' : mins + 'm';
      }
      return label + ' usado:' + (Number.isFinite(used) ? Math.round(used) + '%' : '—') + ' rest:' + (remaining == null ? '—' : Math.round(remaining) + '%') + ' reset:' + reset;
    };
    const parts = ['QuotaPilot', fmt('5h', five), fmt('7d', week)].filter(Boolean);
    const ctx = input.context_window ?? input.contextWindow ?? {};
    const ctxRemain = Number(ctx.remaining_percentage ?? ctx.remainingPercent);
    if (Number.isFinite(ctxRemain)) parts.push('ctx:' + Math.round(ctxRemain) + '%');
    process.stdout.write(parts.join(' · '));
  } catch {
    process.stdout.write('QuotaPilot · esperando métricas');
  }
});
