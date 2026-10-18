import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const source = new URL('../scripts/history-audit.mjs', import.meta.url);
function git(root, args) {
  return execFileSync('git', args, { cwd: root, timeout: 10_000, windowsHide: true });
}

async function fixture(content) {
  const root = await mkdtemp(join(tmpdir(), 'quotapilot-git-audit-'));
  await mkdir(join(root, 'scripts'));
  await writeFile(join(root, 'scripts', 'history-audit.mjs'), await readFile(source));
  git(root, ['init', '-q']);
  await writeFile(join(root, 'test.txt'), content);
  git(root, ['add', '.']);
  git(root, ['-c', 'user.email=testing@example.invalid', '-c', 'user.name=Security Test', 'commit', '-qm', 'fixture']);
  return root;
}

test('history audit scans a complete repository and reports no matches for clean content', async () => {
  const dir = await fixture('ordinary test content');
  try {
    const proc = spawnSync(process.execPath, [join(dir, 'scripts', 'history-audit.mjs')], { cwd: dir, timeout: 20_000, encoding: 'utf8' });
    assert.equal(proc.status, 0, proc.stderr);
    assert.match(proc.stdout, /History audit OK/);
  } finally { await rm(dir, { recursive: true, force: true }); }
});

test('history audit detects historical secrets without printing credential values', async () => {
  const secret = 'github_pat_' + 'A'.repeat(24);
  const dir = await fixture(secret);
  try {
    await writeFile(join(dir, 'test.txt'), 'clean working tree');
    git(dir, ['add', 'test.txt']);
    git(dir, ['-c', 'user.email=testing@example.invalid', '-c', 'user.name=Security Test', 'commit', '-qm', 'remove sensitive token']);
    const proc = spawnSync(process.execPath, [join(dir, 'scripts', 'history-audit.mjs')], { cwd: dir, timeout: 20_000, encoding: 'utf8' });
    assert.equal(proc.status, 1);
    assert.match(proc.stderr, /Potential sensitive token/);
    assert.equal(proc.stderr.includes(secret), false);
  } finally { await rm(dir, { recursive: true, force: true }); }
});
