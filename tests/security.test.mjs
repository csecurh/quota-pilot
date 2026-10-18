import test from 'node:test';
import assert from 'node:assert/strict';
import { chmod, lstat, mkdtemp, mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { atomicWritePrivate, readSafeText } from '../scripts/secure-fs.mjs';
import { createWindowLimiter, validateToolArguments } from '../server/security.mjs';
import { readClaudeUsage } from '../server/providers/claude.mjs';

test('tool argument validation rejects prototype and extra-key manipulation', () => {
  assert.equal(validateToolArguments('get_usage',{provider:'codex'}),true);
  assert.equal(validateToolArguments('get_usage',{provider:'codex',extra:true}),false);
  assert.equal(validateToolArguments('get_usage',Object.create({provider:'codex'})),false);
  assert.equal(validateToolArguments('get_overview',{}),true);
  assert.equal(validateToolArguments('open_hud',{provider:'codex'}),false);
});

test('local request limiter fails closed after the configured window quota', () => {
  const allow=createWindowLimiter({limit:2,windowMs:60000});
  assert.equal(allow(),true);
  assert.equal(allow(),true);
  assert.equal(allow(),false);
});

test('private atomic writer refuses symlink targets', async () => {
  if(process.platform==='win32')return;
  const home=await mkdtemp(join(tmpdir(),'quotapilot-fs-'));
  try{
    const target=join(home,'target.json');
    const victim=join(home,'victim.json');
    await writeFile(victim,'SAFE');
    await symlink(victim,target);
    await assert.rejects(()=>atomicWritePrivate(target,'PWNED'),/Unsafe local file/);
    assert.equal(await readFile(victim,'utf8'),'SAFE');
  }finally{await rm(home,{recursive:true,force:true});}
});

test('Claude reader rejects symlinks and overly broad local snapshots', async () => {
  if(process.platform==='win32')return;
  const home=await mkdtemp(join(tmpdir(),'quotapilot-claude-security-'));
  try{
    const real=join(home,'real.json');
    const link=join(home,'link.json');
    const payload=JSON.stringify({provider:'claude_code',capturedAt:new Date().toISOString(),payload:{primary:{usedPercent:20}}});
    await writeFile(real,payload,{mode:0o644});
    assert.equal(await readClaudeUsage({path:real}),null);
    await chmod(real,0o600);
    await symlink(real,link);
    assert.equal(await readClaudeUsage({path:link}),null);
    assert.equal((await readClaudeUsage({path:real}))?.provider,'claude_code');
  }finally{await rm(home,{recursive:true,force:true});}
});

test('safe reader rejects files above configured size', async () => {
  const home=await mkdtemp(join(tmpdir(),'quotapilot-read-'));
  try{
    const path=join(home,'large.txt');
    await writeFile(path,'x'.repeat(1025));
    await assert.rejects(()=>readSafeText(path,{maxBytes:1024}),/Unsafe local file/);
  }finally{await rm(home,{recursive:true,force:true});}
});


test('Claude snapshots exceeding 64 KB are rejected even with private permissions', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-snapshot-'));
  try {
    const path = join(home, 'oversized.json');
    await writeFile(path, JSON.stringify({
      provider: 'claude_code',
      capturedAt: new Date().toISOString(),
      payload: { primary: { usedPercent: 12 } },
      untrusted: 'x'.repeat(66 * 1024),
    }), { mode: 0o600 });
    assert.equal(await readClaudeUsage({ path }), null);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('private writer rejects overwriting files larger than the config safety limit', async () => {
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-size-write-'));
  try {
    const path = join(home, 'large.toml');
    await writeFile(path, 'x'.repeat(1024 * 1024 + 1));
    await assert.rejects(() => atomicWritePrivate(path, 'overwrite'), /Unsafe local file/);
    assert.equal((await lstat(path)).size, 1024 * 1024 + 1);
  } finally { await rm(home, { recursive: true, force: true }); }
});

test('private writer sets 0600 permissions and 0700 for its own directory', async () => {
  if (process.platform === 'win32') return;
  const home = await mkdtemp(join(tmpdir(), 'quotapilot-mode-'));
  try {
    const dir = join(home, 'private');
    const path = join(dir, 'snapshot.json');
    await atomicWritePrivate(path, '{"usage":0}');
    assert.equal((await lstat(path)).mode & 0o777, 0o600);
    assert.equal((await lstat(dir)).mode & 0o777, 0o700);
    assert.equal(await readSafeText(path, { requirePrivate: true }), '{"usage":0}');
  } finally { await rm(home, { recursive: true, force: true }); }
});
