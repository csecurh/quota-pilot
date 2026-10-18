import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const repo = resolve(new URL('..', import.meta.url).pathname);

function run(script, { input = '', home } = {}) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [resolve(repo, script)], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, HOME: home, USERPROFILE: home },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += String(d); });
    child.stderr.on('data', (d) => { stderr += String(d); });
    child.once('error', reject);
    child.once('exit', (code) => code === 0 ? resolvePromise({ stdout, stderr }) : reject(new Error(stderr || 'exit ' + code)));
    child.stdin.end(input);
  });
}

test('Claude HUD shows used, remaining and reset and writes minimal snapshot', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-claude-'));
  try {
    const now = Date.now();
    const input = {
      session_id: 'sensitive-session',
      cwd: '/sensitive/project',
      transcript_path: '/sensitive/transcript',
      model: { id: 'claude-test', display_name: 'Claude Test' },
      rate_limits: {
        five_hour: { used_percentage: 40, resets_at: Math.floor((now + 2 * 3600000) / 1000) },
        seven_day: { used_percentage: 25, resets_at: Math.floor((now + 3 * 86400000) / 1000) },
      },
      context_window: { remaining_percentage: 72, used_percentage: 28, context_window_size: 200000 },
      cost: { total_cost_usd: 1.23 },
    };
    const result = await run('scripts/claude-statusline.mjs', { input: JSON.stringify(input), home });
    assert.match(result.stdout, /^Claude Code · 5h usado:40% rest:60% reset:/);
    assert.match(result.stdout, /7d usado:25% rest:75% reset:/);
    const snapshot = JSON.parse(await readFile(join(home, '.quotapilot', 'claude-latest.json'), 'utf8'));
    assert.equal(snapshot.payload.primary.remainingPercent, 60);
    assert.equal(snapshot.payload.secondary.remainingPercent, 75);
    const serialized = JSON.stringify(snapshot);
    assert.equal(serialized.includes('sensitive-session'), false);
    assert.equal(serialized.includes('/sensitive/project'), false);
    assert.equal(serialized.includes('/sensitive/transcript'), false);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

test('Codex HUD installer preserves existing status line entries', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-codex-'));
  try {
    const dir = join(home, '.codex');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'config.toml'), '[tui]\nstatus_line = ["git-branch"]\n');
    await run('scripts/install-codex-hud.mjs', { home });
    const config = await readFile(join(dir, 'config.toml'), 'utf8');
    assert.match(config, /git-branch/);
    assert.match(config, /five-hour-limit/);
    assert.match(config, /weekly-limit/);
    assert.match(config, /status_line_use_colors = true/);
    assert.match(config, /\[features\]/);
    assert.match(config, /web_search = true/);
    assert.equal((config.match(/\[tui\]/g) ?? []).length, 1);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});
