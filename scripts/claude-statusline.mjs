#!/usr/bin/env node
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

let raw = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', async () => {
  try {
    const input = raw ? JSON.parse(raw) : {};
    const rate = input.rate_limits ?? input.rateLimits ?? {};
    const five = rate.five_hour ?? rate.fiveHour ?? null;
    const week = rate.seven_day ?? rate.sevenDay ?? null;
    const normalizeWindow = (value, duration) => {
      if (!value) return null;
      const used = Number(value.used_percentage ?? value.usedPercent);
      const resetRaw = value.resets_at ?? value.resetsAt ?? null;
      const resetMs = typeof resetRaw === 'number' ? (resetRaw > 10000000000 ? resetRaw : resetRaw * 1000) : Date.parse(resetRaw ?? '');
      return {
        usedPercent: Number.isFinite(used) ? Math.max(0, Math.min(100, used)) : null,
        remainingPercent: Number.isFinite(used) ? Math.max(0, 100 - used) : null,
        windowDurationMins: duration,
        resetsAt: Number.isFinite(resetMs) ? new Date(resetMs).toISOString() : null,
      };
    };
    const primary = normalizeWindow(five, 300);
    const secondary = normalizeWindow(week, 10080);
    const ctx = input.context_window ?? input.contextWindow ?? {};
    const ctxUsed = Number(ctx.used_percentage ?? ctx.usedPercent);
    const ctxRemain = Number(ctx.remaining_percentage ?? ctx.remainingPercent);
    const model = input.model ?? {};
    const cache = input.prompt_cache ?? input.promptCache ?? {};
    const payload = {
      provider: 'claude_code',
      sourceType: 'measured',
      capturedAt: new Date().toISOString(),
      payload: {
        modelId: model.id ?? null,
        modelName: model.display_name ?? model.displayName ?? null,
        primary,
        secondary,
        context: {
          usedPercent: Number.isFinite(ctxUsed) ? ctxUsed : null,
          remainingPercent: Number.isFinite(ctxRemain) ? ctxRemain : null,
          windowTokens: ctx.context_window_size ?? ctx.contextWindowSize ?? null,
        },
        promptCache: {
          warm: typeof cache.warm === 'boolean' ? cache.warm : null,
          hitRatio: Number.isFinite(Number(cache.hit_ratio ?? cache.hitRatio)) ? Number(cache.hit_ratio ?? cache.hitRatio) : null,
        },
        sessionCostUsdEstimate: Number.isFinite(Number(input.cost?.total_cost_usd)) ? Number(input.cost.total_cost_usd) : null,
      },
    };

    const dir = join(homedir(), '.quotapilot');
    const target = join(dir, 'claude-latest.json');
    const temp = target + '.tmp';
    await mkdir(dir, { recursive: true });
    await writeFile(temp, JSON.stringify(payload), { mode: 0o600 });
    await rename(temp, target);

    const countdown = (window) => {
      if (!window?.resetsAt) return '—';
      let mins = Math.max(0, Math.floor((Date.parse(window.resetsAt) - Date.now()) / 60000));
      const days = Math.floor(mins / 1440); mins %= 1440;
      const hours = Math.floor(mins / 60); mins %= 60;
      return days > 0 ? days + 'd' + hours + 'h' : hours > 0 ? hours + 'h' + mins + 'm' : mins + 'm';
    };
    const fmt = (label, window) => !window ? null : label + ' usado:' + (window.usedPercent == null ? '—' : Math.round(window.usedPercent) + '%') + ' rest:' + (window.remainingPercent == null ? '—' : Math.round(window.remainingPercent) + '%') + ' reset:' + countdown(window);
    const parts = ['Claude Code', fmt('5h', primary), fmt('7d', secondary)].filter(Boolean);
    if (Number.isFinite(ctxRemain)) parts.push('ctx:' + Math.round(ctxRemain) + '%');
    process.stdout.write(parts.join(' · '));
  } catch {
    process.stdout.write('Claude Code · esperando métricas');
  }
});
