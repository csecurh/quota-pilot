import { spawn } from 'node:child_process';
import { remainingFromUsed } from '../domain/analytics.mjs';

export async function readCodexUsage({ bin = process.env.CODEX_BIN || 'codex', timeoutMs = 12000 } = {}) {
  const child = spawn(bin, ['app-server', '--listen', 'stdio://'], { stdio: ['pipe', 'pipe', 'pipe'], shell: false });
  let buffer = '';
  let seq = 1;
  let stderr = '';
  const pending = new Map();

  child.stderr.on('data', (d) => { stderr += String(d); });
  child.stdout.on('data', (chunk) => {
    buffer += String(chunk);
    while (true) {
      const idx = buffer.indexOf('\n');
      if (idx < 0) break;
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      if (msg.id != null && pending.has(msg.id)) {
        const p = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
      }
    }
  });

  const send = (method, params) => new Promise((resolve, reject) => {
    const id = seq++;
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ id, method, ...(params === undefined ? {} : { params }) }) + '\n');
  });

  const timer = setTimeout(() => {
    for (const p of pending.values()) p.reject(new Error(`Codex timeout: ${stderr.slice(-300)}`));
    pending.clear();
    child.kill();
  }, timeoutMs);

  try {
    await send('initialize', {
      clientInfo: { name: 'quota-pilot', title: 'QuotaPilot', version: '0.1.0' },
      capabilities: { experimentalApi: true }
    });
    child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n');
    const result = await send('account/rateLimits/read', { excludeResetCreditDetails: true });
    const r = result?.rateLimits ?? result?.rate_limits ?? {};
    const mapWindow = (w) => w ? {
      usedPercent: w.usedPercent ?? w.used_percent ?? null,
      remainingPercent: remainingFromUsed(w.usedPercent ?? w.used_percent),
      resetsAt: w.resetsAt ?? null,
      windowDurationMins: w.windowDurationMins ?? w.window_minutes ?? null
    } : null;
    return {
      provider: 'codex',
      capturedAt: new Date().toISOString(),
      planType: r.planType ?? r.plan_type ?? null,
      primary: mapWindow(r.primary),
      secondary: mapWindow(r.secondary)
    };
  } finally {
    clearTimeout(timer);
    try { child.kill(); } catch {}
  }
}
