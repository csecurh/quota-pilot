import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/doctor.mjs', import.meta.url));

test('offline doctor reports healthy local surfaces without exposing user configuration', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-doctor-'));
  try {
    await mkdir(join(home, '.claude'));
    await mkdir(join(home, '.codex'));
    await writeFile(join(home, '.claude', 'settings.json'), JSON.stringify({
      statusLine: { type: 'command', command: 'node "/private/sensitive/claude-statusline.mjs"' },
      secret: 'do-not-print-private-data',
    }));
    await writeFile(join(home, '.codex', 'config.toml'), '[tui]\nstatus_line = ["five-hour-limit", "weekly-limit"]\napi_key = "never-print"\n');
    const result = spawnSync(process.execPath, [script, '--json'], {
      encoding: 'utf8', timeout: 8000, env: { ...process.env, HOME: home, USERPROFILE: home },
    });
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.surfaces.claude_code, 'configured');
    assert.equal(report.surfaces.codex, 'configured');
    assert.equal(report.localSnapshot, 'not-found');
    assert.doesNotMatch(result.stdout, /do-not-print|never-print|\/private\/sensitive/);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('offline doctor does not invent provider availability for empty home', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-doctor-empty-'));
  try {
    const result = spawnSync(process.execPath, [script], {
      encoding: 'utf8', timeout: 8000, env: { ...process.env, HOME: home, USERPROFILE: home },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Claude Code: not-configured/);
    assert.match(result.stdout, /Codex: not-configured/);
    assert.match(result.stdout, /ChatGPT: host-dependent/);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('doctor supports Spanish while preserving redacted status outputs', async () => {
  const home=await mkdtemp(join(tmpdir(),'quotapilot-doctor-es-'));
  try {
    const result=spawnSync(process.execPath,[script],{
      encoding:'utf8',timeout:8000,
      env:{...process.env,HOME:home,USERPROFILE:home,QUOTAPILOT_LANG:'es'},
    });
    assert.equal(result.status,0,result.stderr);
    assert.match(result.stdout,/AI Usage — diagnóstico local/);
    assert.match(result.stdout,/Node compatible:/);
    assert.match(result.stdout,/Snapshot de Claude:/);
    assert.match(result.stdout,/No se muestran credenciales/);
  } finally { await rm(home,{recursive:true,force:true}); }
});
