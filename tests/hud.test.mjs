import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));

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
    await writeFile(join(dir, 'config.toml'), '[tui]\nstatus_line = ["git-branch"]\n\n[features]\nweb_search = true\n');
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


test('installed Claude status line runs independently using the copied secure filesystem helper', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-installed-claude-'));
  try {
    await mkdir(join(home, '.claude'), { recursive: true });
    const setup = await run('scripts/install-claude-hud.mjs', { home });
    assert.equal(JSON.parse(setup.stdout).changed, true);
    const settings = JSON.parse(await readFile(join(home, '.claude', 'settings.json'), 'utf8'));
    assert.match(settings.statusLine.command, /claude-statusline\.mjs/);
    const standalone = await run(join(home, '.quotapilot', 'claude-statusline.mjs'), {
      home,
      input: JSON.stringify({ rate_limits: { five_hour: { used_percentage: 50 } } }),
    });
    assert.match(standalone.stdout, /Claude Code · 5h usado:50% rest:50%/);
    const snapshot = JSON.parse(await readFile(join(home, '.quotapilot', 'claude-latest.json'), 'utf8'));
    assert.equal(snapshot.payload.primary.remainingPercent, 50);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

test('Claude status line preserves unknown percentages and derives from remaining-only input', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-claude-null-'));
  try {
    const result = await run('scripts/claude-statusline.mjs', {
      home, input: JSON.stringify({
        rate_limits: { five_hour: { used_percentage: null }, seven_day: { remaining_percentage: 55 } },
        context_window: { used_percentage: null },
      }),
    });
    assert.match(result.stdout, /5h usado:— rest:—/);
    assert.match(result.stdout, /7d usado:45% rest:55%/);
    const data = JSON.parse(await readFile(join(home, '.quotapilot', 'claude-latest.json'), 'utf8'));
    assert.equal(data.payload.primary.usedPercent, null);
    assert.equal(data.payload.primary.remainingPercent, null);
    assert.equal(data.payload.secondary.usedPercent, 45);
    assert.equal(data.payload.context.usedPercent, null);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('Claude installer makes no runtime changes when a custom status line exists', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-custom-claude-'));
  try {
    await mkdir(join(home, '.claude'), { recursive: true });
    const path = join(home, '.claude', 'settings.json');
    const config = { statusLine: { type: 'command', command: 'echo existing' }, customSetting: true };
    await writeFile(path, JSON.stringify(config));
    const result = await run('scripts/install-claude-hud.mjs', { home });
    assert.equal(JSON.parse(result.stdout).changed, false);
    assert.deepEqual(JSON.parse(await readFile(path, 'utf8')), config);
    await assert.rejects(() => readFile(join(home, '.quotapilot', 'claude-statusline.mjs'), 'utf8'), { code: 'ENOENT' });
  } finally { await rm(home, { recursive: true, force: true }); }
});
