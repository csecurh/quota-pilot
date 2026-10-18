import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=path=>readFile(join(root,path),'utf8');
test('agent bootstrap pins immutable package SHA-256 digests instead of trusting remote checksums',async()=>{
  const sh=await read('scripts/agent-bootstrap.sh');
  const ps=await read('scripts/agent-bootstrap.ps1');
  for(const digest of [
    'f89bbd4dfa90727105081fa72b9c1a610957e3ddb480190bd5e2f6a1ccbfc6b0',
    '7b89486fd2e11d627a106db9dd0139442aa7013b78bb512ebac9063e72394bc9',
    '18869fff83f173e49d8e32a7ff5b3a19ac6f255bebd2d6e8d5c2e2f258765019'
  ])assert.ok(sh.includes(digest));
  assert.ok(ps.includes('d83de9b67f87597c654e3bfd1a0f4824dec6253d56875fab83eefd8adb69bca9'));
  for(const s of [sh,ps]){
    assert.match(s,/v0\.6\.0-rc\.2/);
    assert.match(s,/github\.com\/csecurh\/quota-pilot\/releases\/download/);
    assert.doesNotMatch(s,/Invoke-Expression|curl[^ \n]*\s*\| *sh|Set-ExecutionPolicy|sudo |--insecure|--no-check-certificate/i);
    assert.match(s,/SHA-256|sha256|SHA256/i);
  }
  assert.match(sh,/chmod 700/);
  assert.match(sh,/if \[ -L "\$dest" \]/);
  assert.match(ps,/ReparsePoint/);
});

test('bootstrap is syntax-valid and can select a target using OS utilities',async()=>{
  const isWindows=process.platform==='win32';
  const exe=isWindows?join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'):'/bin/sh';
  const args=isWindows?['-NoProfile','-NonInteractive','-File',join(root,'scripts/agent-bootstrap.ps1'),'-HostType','Codex','-DryRun']:[join(root,'scripts/agent-bootstrap.sh'),'--dry-run','--host','codex'];
  const run=spawnSync(exe,args,{
    cwd:root,encoding:'utf8',timeout:10000,
    env:{...process.env,PATH:isWindows?process.env.PATH:'/usr/bin:/bin'}
  });
  assert.equal(run.status,0,run.stderr);
  assert.match(run.stdout,/PLAN v0\.6\.0-rc\.2 quota-pilot-/);
  assert.match(run.stdout,/[a-f0-9]{64}/);
});
test('agent-first documentation stays bilingual and never guarantees unsupported local Desktop installs',async()=>{
  const [agents,en,es,setup,readme]=await Promise.all([
    read('AGENTS.md'),read('docs/AGENT-INSTALL.md'),
    read('docs/es/AGENT-INSTALL.md'),read('skills/setup/SKILL.md'),read('README.md')
  ]);
  assert.match(en,/\[Español\]\(es\/AGENT-INSTALL\.md\)/);
  assert.match(es,/\[English\]\(\.\.\/AGENT-INSTALL\.md\)/);
  assert.match(agents,/cloud execution environment/);
  assert.match(agents,/agent-bootstrap\.ps1/);
  assert.match(setup,/agent-bootstrap\.sh/);
  assert.match(readme,/docs\/AGENT-INSTALL\.md/);
  assert.match(es,/no lo instala en tu Windows|no instala automáticamente/);
});

test('agent bootstrap refuses ambiguous host or ChatGPT before any installation',async()=>{
  const isWindows=process.platform==='win32';
  const exe=isWindows?join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'):'/bin/sh';
  const script=join(root,'scripts',isWindows?'agent-bootstrap.ps1':'agent-bootstrap.sh');
  const prefix=isWindows?['-NoProfile','-NonInteractive','-File',script]:[script];
  const cases=isWindows?[[],['-HostType','ChatGPT']]:[[],['--host','chatgpt']];
  for(const args of cases){
    const result=spawnSync(exe,[...prefix,...args],{cwd:root,encoding:'utf8',timeout:10000});
    assert.notEqual(result.status,0);
    assert.match(result.stderr,/Host required|HostType|ChatGPT onboarding|host codex|codex or --host claude/i);
    assert.doesNotMatch(result.stdout,/INSTALLED |ALREADY_INSTALLED /);
  }
});
