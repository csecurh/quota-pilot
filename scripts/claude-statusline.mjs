#!/usr/bin/env node
import { homedir } from 'node:os';
import { join } from 'node:path';
import { atomicWritePrivate } from './secure-fs.mjs';

const MAX_INPUT_BYTES = 256 * 1024;
// Local display preference only. Provider data and saved snapshot remain language-neutral.
const requestedLang = process.env.QUOTAPILOT_LANG;
const osLang = Intl.DateTimeFormat().resolvedOptions().locale;
const lang = requestedLang === 'es' || requestedLang === 'en' ? requestedLang : (osLang.toLowerCase().startsWith('es') ? 'es' : 'en');
const copy = lang === 'es'
  ? { used: 'usado', left: 'rest', reset: 'reset', missing: 'métricas no disponibles', waiting: 'esperando métricas' }
  : { used: 'used', left: 'left', reset: 'reset', missing: 'metrics unavailable', waiting: 'waiting for metrics' };
let raw = '';
let oversized = false;

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  if (oversized) return;
  if (Buffer.byteLength(raw, 'utf8') + Buffer.byteLength(chunk, 'utf8') > MAX_INPUT_BYTES) {
    oversized = true;
    raw = '';
    return;
  }
  raw += chunk;
});

function percent(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const number = typeof value === 'number' || (typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value)) ? Number(value) : NaN;
  return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : null;
}

function resetIso(value) {
  const ms = typeof value === 'number'
    ? (value > 10_000_000_000 ? value : value * 1000)
    : (typeof value === 'string' && value.length <= 64 ? Date.parse(value) : NaN);
  if (!Number.isFinite(ms) || ms < Date.now() - 86_400_000 || ms > Date.now() + 31 * 86_400_000) return null;
  return new Date(ms).toISOString();
}

function normalizeWindow(value, duration) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const suppliedUsed = percent(value.used_percentage ?? value.usedPercent);
  const suppliedRemaining = percent(value.remaining_percentage ?? value.remainingPercent);
  const usedPercent = suppliedUsed ?? (suppliedRemaining == null ? null : 100 - suppliedRemaining);
  return {
    usedPercent,
    remainingPercent: suppliedRemaining ?? (usedPercent == null ? null : Math.max(0, 100 - usedPercent)),
    windowDurationMins: duration,
    resetsAt: resetIso(value.resets_at ?? value.resetsAt),
  };
}

function countdown(window) {
  if (!window?.resetsAt) return '—';
  let mins = Math.max(0, Math.floor((Date.parse(window.resetsAt) - Date.now()) / 60000));
  const days = Math.floor(mins / 1440); mins %= 1440;
  const hours = Math.floor(mins / 60); mins %= 60;
  return days > 0 ? days + 'd' + hours + 'h' : hours > 0 ? hours + 'h' + mins + 'm' : mins + 'm';
}

process.stdin.on('end', async () => {
  if (oversized) {
    process.stdout.write('Claude Code · ' + copy.missing);
    return;
  }

  try {
    const input = raw ? JSON.parse(raw) : {};
    const rate = input.rate_limits ?? input.rateLimits ?? {};
    const primary = normalizeWindow(rate.five_hour ?? rate.fiveHour, 300);
    const secondary = normalizeWindow(rate.seven_day ?? rate.sevenDay, 10080);
    const ctx = input.context_window ?? input.contextWindow ?? {};
    const contextUsed = percent(ctx.used_percentage ?? ctx.usedPercent);
    const contextRemaining = percent(ctx.remaining_percentage ?? ctx.remainingPercent);

    const snapshot = {
      schemaVersion: 2,
      provider: 'claude_code',
      capturedAt: new Date().toISOString(),
      payload: {
        primary,
        secondary,
        context: {
          usedPercent: contextUsed,
          remainingPercent: contextRemaining,
        },
      },
    };

    await atomicWritePrivate(join(homedir(), '.quotapilot', 'claude-latest.json'), JSON.stringify(snapshot));

    const fmt = (label, window) => !window ? null
      : label + ' ' + copy.used + ':' + (window.usedPercent == null ? '—' : Math.round(window.usedPercent) + '%')
      + ' ' + copy.left + ':' + (window.remainingPercent == null ? '—' : Math.round(window.remainingPercent) + '%')
      + ' ' + copy.reset + ':' + countdown(window);

    const parts = ['Claude Code', fmt('5h', primary), fmt('7d', secondary)].filter(Boolean);
    if (contextRemaining != null) parts.push('ctx:' + Math.round(contextRemaining) + '%');
    process.stdout.write(parts.join(' · '));
  } catch {
    process.stdout.write('Claude Code · ' + copy.waiting);
  }
});
