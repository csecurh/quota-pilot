import { spawn } from 'node:child_process';
import { MAX_PROVIDER_LINE_BYTES, safeWindow } from '../security.mjs';

function rejectAll(pending, message) {
  const error = new Error(message);
  for (const waiter of pending.values()) waiter.reject(error);
  pending.clear();
}

export async function readCodexUsage({ bin = 'codex', timeoutMs = 12_000 } = {}) {
  if (typeof bin !== 'string' || !bin || bin.length > 512) throw new Error('Codex executable unavailable');

  const child = spawn(bin, ['app-server', '--listen', 'stdio://'], {
    stdio: ['pipe', 'pipe', 'ignore'],
    shell: false,
    windowsHide: true,
  });

  let buffer = '';
  let seq = 1;
  let failed = false;
  const pending = new Map();

  const abort = (message) => {
    if (failed) return;
    failed = true;
    rejectAll(pending, message);
    try { child.kill(); } catch {}
  };

  child.once('error', () => abort('Codex executable unavailable'));
  child.once('exit', () => {
    if (pending.size) abort('Codex app-server exited unexpectedly');
  });

  child.stdout.on('data', (chunk) => {
    if (failed) return;
    buffer += String(chunk);
    if (Buffer.byteLength(buffer, 'utf8') > MAX_PROVIDER_LINE_BYTES) {
      abort('Codex response exceeded safety limit');
      return;
    }

    while (true) {
      const idx = buffer.indexOf('\n');
      if (idx < 0) break;
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      if (Buffer.byteLength(line, 'utf8') > MAX_PROVIDER_LINE_BYTES) {
        abort('Codex response exceeded safety limit');
        return;
      }

      let msg;
      try { msg = JSON.parse(line); } catch { continue; }
      if (msg?.id != null && pending.has(msg.id)) {
        const waiter = pending.get(msg.id);
        pending.delete(msg.id);
        msg.error ? waiter.reject(new Error('Codex app-server request failed')) : waiter.resolve(msg.result);
      }
    }
  });

  const send = (method, params) => new Promise((resolve, reject) => {
    if (failed || child.killed || !child.stdin.writable) {
      reject(new Error('Codex app-server unavailable'));
      return;
    }
    if (pending.size >= 8) {
      reject(new Error('Codex request limit reached'));
      return;
    }
    const id = seq++;
    pending.set(id, { resolve, reject });
    child.stdin.write(JSON.stringify({ id, method, ...(params === undefined ? {} : { params }) }) + '\n');
  });

  const timer = setTimeout(() => abort('Codex request timed out'), Math.max(1000, Math.min(30_000, timeoutMs)));
  timer.unref?.();

  try {
    await send('initialize', {
      clientInfo: { name: 'quota-pilot', title: 'AI Usage', version: '0.5.0-rc.1' },
      capabilities: { experimentalApi: true },
    });
    child.stdin.write(JSON.stringify({ method: 'initialized', params: {} }) + '\n');

    const result = await send('account/rateLimits/read', { excludeResetCreditDetails: true });
    const rateLimits = result?.rateLimits ?? result?.rate_limits ?? {};

    return {
      provider: 'codex',
      capturedAt: new Date().toISOString(),
      primary: safeWindow(rateLimits.primary, 300),
      secondary: safeWindow(rateLimits.secondary, 10080),
    };
  } finally {
    clearTimeout(timer);
    rejectAll(pending, 'Codex request closed');
    try { child.kill(); } catch {}
  }
}
