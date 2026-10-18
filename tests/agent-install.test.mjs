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
    '4282a51a1322157606b19dbd16ed59327eef7fcbc2045c675c1a41243658b500',
    'fec19213de09c3e90b8d8c5884535f8eafaae42703c0cac34b12bd3886238063',
    'f40a9cacf408fc2c954bfeec25620a24e5d83d27f2523dc30fd46490e0f24f7f'
  ])assert.ok(sh.includes(digest));
  assert.ok(ps.includes('47dcd61f75c56cbc92585f5dc41e1a27cd4fe11d8ebd8e456fcac949653ee9d3'));
  for(const s of [sh,ps]){
    assert.match(s,/v0\.6\.0-rc\.1/);
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
  const args=isWindows?['-NoProfile','-NonInteractive','-File',join(root,'scripts/agent-bootstrap.ps1'),'-DryRun']:[join(root,'scripts/agent-bootstrap.sh'),'--dry-run'];
  const run=spawnSync(exe,args,{
    cwd:root,encoding:'utf8',timeout:10000,
    env:{...process.env,PATH:isWindows?process.env.PATH:'/usr/bin:/bin'}
  });
  assert.equal(run.status,0,run.stderr);
  assert.match(run.stdout,/PLAN v0\.6\.0-rc\.1 quota-pilot-/);
  assert.match(run.stdout,/[a-f0-9]{64}/);
});
test('agent-first documentation stays bilingual and never guarantees unsupported local Desktop installs',async()=>{
  const [agents,en,es,setup,readme]=await Promise.all([
    read('AGENTS.md'),read('docs/AGENT-INSTALL.md'),
    read('docs/es/AGENT-INSTALL.md'),read('skills/setup/SKILL.md'),read('README.md')
  ]);
  assert.match(en,/\[Español\]\(es\/AGENT-INSTALL\.md\)/);
  assert.match(es,/\[English\]\(\.\.\/AGENT-INSTALL\.md\)/);
  assert.match(agents,/cloud-only|cloud environment/);
  assert.match(agents,/agent-bootstrap\.ps1/);
  assert.match(setup,/scripts\/agent-bootstrap\.sh/);
  assert.match(readme,/docs\/AGENT-INSTALL\.md/);
  assert.match(es,/no puede instalarlo en tu Windows|no instala automáticamente/);
});
