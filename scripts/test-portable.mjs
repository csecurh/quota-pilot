#!/usr/bin/env node
// End-to-end smoke test with system Node deliberately absent from child PATH.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const stage = resolve(process.argv[2] || 'dist', 'quota-pilot-'+process.platform+'-'+process.arch);
const executable = join(stage,'runtime', process.platform==='win32'?'node.exe':'node');
const home=await mkdtemp(join(tmpdir(),'quota-pilot-portable-'));
const baseEnv={...process.env, HOME:home, USERPROFILE:home, PATH:''};

function run(bin,args,input='') {
  return new Promise((done,reject)=>{
    const child=spawn(bin,args,{cwd:stage,env:baseEnv,windowsHide:true,stdio:['pipe','pipe','pipe'],shell:false});
    const chunks=[],errors=[];
    const timer=setTimeout(()=>{child.kill();reject(new Error('portable subprocess timed out'));},20000);
    child.stdout.on('data',v=>chunks.push(v));
    child.stderr.on('data',v=>errors.push(v));
    child.on('error',e=>{clearTimeout(timer);reject(e);});
    child.on('close',code=>{
      clearTimeout(timer);
      const stdout=Buffer.concat(chunks).toString('utf8'),stderr=Buffer.concat(errors).toString('utf8');
      code===0?done(stdout):reject(new Error('Portable process failed: '+code+' '+stderr.slice(0,200)));
    });
    child.stdin.on('error',()=>{});
    child.stdin.end(input);
  });
}
try {
  const manifest=JSON.parse(await readFile(join(stage,'mcp.json'),'utf8'));
  const plugin = JSON.parse(await readFile(join(stage,'plugin.json'),'utf8'));
  const openaiHooks = JSON.parse(await readFile(join(stage,'hooks','openai-safe.json'),'utf8'));
  assert.equal(plugin.extensions['com.openai'].hooks,'./hooks/openai-safe.json');
  assert.deepEqual(openaiHooks,{hooks:{}},'ChatGPT must not invoke Codex filesystem configuration');

  const claude=JSON.parse(await readFile(join(stage,'.mcp.json'),'utf8'));
  const hooks=JSON.parse(await readFile(join(stage,'hooks','codex.json'),'utf8'));
  const market=JSON.parse(await readFile(join(stage,'.claude-plugin','marketplace.json'),'utf8'));
  const info=JSON.parse(await readFile(join(stage,'PORTABLE-BUILD.json'),'utf8'));
  assert.equal(info.platform,process.platform);
  assert.equal(info.arch,process.arch);
  assert.match(manifest.mcpServers['quota-pilot'].command,/\/runtime\/node(?:\.exe)?$/);
  assert.match(claude.mcpServers['quota-pilot'].command,/\/runtime\/node(?:\.exe)?$/);
  assert.match(hooks.hooks.SessionStart[0].hooks[0].command,/\/ensure-surfaces\.mjs" codex$/);
  assert.equal(market.plugins[0].source,'./');
  assert.ok((await stat(executable)).size>1024*1024);
  assert.ok((await stat(join(stage,'runtime','NODE-LICENSE'))).size>500);

  assert.match(await run(executable,['--version']),/^v24\./);
  const lines=[
    {jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',clientInfo:{name:'ChatGPT'}}},
    {jsonrpc:'2.0',id:2,method:'tools/call',params:{name:'open_hud',arguments:{},_meta:{progressToken:'secret-not-to-echo'}}},
    {jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'get_usage',arguments:{provider:'codex'}}}
  ];
  const frames=lines.map(x=>JSON.stringify(x)).join('\n')+'\n';
  const responses=(await run(executable,['server/index.mjs'],frames)).trim().split('\n').map(JSON.parse);
  const hud=responses.find(x=>x.id===2);
  assert.equal(hud?.result?.isError,false);
  assert.equal(hud?.result?.structuredContent?.overview?.host?.displayName,'ChatGPT');
  assert.equal(responses.some(x=>x.error?.code===-32602),false);
  assert.doesNotMatch(JSON.stringify(responses),/secret-not-to-echo/);

  await mkdir(join(home,'.claude'));
  const installed=JSON.parse(await run(executable,['scripts/install-claude-hud.mjs']));
  assert.equal(installed.changed,true);
  const settings=JSON.parse(await readFile(join(home,'.claude','settings.json'),'utf8'));
  assert.match(settings.statusLine.command,/\.quotapilot/);
  assert.doesNotMatch(settings.statusLine.command,/^node /);
  const persistentNode=join(home,'.quotapilot',process.platform==='win32'?'node.exe':'node');
  assert.ok((await stat(persistentNode)).size>1024*1024);
  const status=await run(persistentNode,[join(home,'.quotapilot','claude-statusline.mjs')],
    JSON.stringify({rate_limits:{five_hour:{used_percentage:37}}}));
  assert.match(status,/Claude Code/);
  const snap=JSON.parse(await readFile(join(home,'.quotapilot','claude-latest.json'),'utf8'));
  assert.equal(snap.payload.primary.remainingPercent,63);
  process.stdout.write('Portable smoke OK: '+info.name+'; zero system Node in child PATH.\n');
}finally{
  await rm(home,{recursive:true,force:true});
}
