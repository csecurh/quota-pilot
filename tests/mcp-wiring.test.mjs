import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async path => readFile(new URL('../'+path,import.meta.url),'utf8');
test('repo Git marketplace launches a bundled Windows runtime, not system Node',async()=>{
  const portable=JSON.parse(await read('plugin.json'));
  const source=JSON.parse(await read('mcp.json'));
  const legacy=JSON.parse(await read('.mcp.json'));
  const overlay=JSON.parse(await read('.codex-plugin/plugin.json'));
  assert.equal(portable.name,'quota-pilot');
  assert.equal(source.mcpServers['quota-pilot'].type,'stdio');
  assert.equal(source.mcpServers['quota-pilot'].command,'./runtime/node.exe');
  assert.deepEqual(source.mcpServers['quota-pilot'].args,['${PLUGIN_ROOT}/server/index.mjs']);
  assert.equal(overlay.mcpServers,'./.mcp.json');
  assert.equal(legacy.mcpServers['quota-pilot'].command,'./runtime/node.exe');
  assert.deepEqual(legacy.mcpServers['quota-pilot'].args,['${CLAUDE_PLUGIN_ROOT}/server/index.mjs']);
  assert.equal(legacy.mcpServers['quota-pilot'].type,undefined);
  assert.equal(source.mcpServers['quota-pilot'].cwd,'${PLUGIN_ROOT}');
});

test('committed native runtime matches the pinned, licensed release bytes',async()=>{
  const provenance=JSON.parse(await read('runtime/NODE-PROVENANCE.json'));
  const binary=join(root,'runtime','node.exe');
  const info=await stat(binary);
  assert.ok(info.isFile()&&info.size>10_000_000&&info.size<99_000_000);
  assert.equal(info.size,provenance.sizeBytes);
  assert.equal(provenance.archiveSha256,'710cbf8211bb094e49be635c8d2774f231f79a141b4ae36ea1dc5ebb5924ec1e');
  assert.match(provenance.origin,/^https:\/\/github\.com\/csecurh\/quota-pilot\/releases\/download\/v0\.6\.0-rc\.3\/quota-pilot-win32-x64\.zip$/);
  assert.match(provenance.nodeVersion,/^v24\./);
  assert.match(await read('runtime/NODE-LICENSE'),/Node\.js|Permission|copyright/i);
  const hash=createHash('sha256');
  for await(const part of createReadStream(binary))hash.update(part);
  assert.equal(hash.digest('hex'),provenance.binarySha256);
});

test('source Windows runtime can start with no external Node when run on Windows',async()=>{
 if(process.platform!=='win32')return;
 const {spawnSync}=await import('node:child_process');
 const runtime=join(root,'runtime','node.exe');
 const r=spawnSync(runtime,['--version'],{encoding:'utf8',timeout:10_000,env:{...process.env,PATH:''},windowsHide:true});
 assert.equal(r.status,0);
 assert.match(r.stdout,/^v24\./);
});

test('bundled Windows MCP starts without system Node, lists tools and opens the HUD',async()=>{
  if(process.platform!=='win32')return;
  const {spawnSync}=await import('node:child_process');
  const executable=join(root,'runtime','node.exe');
  const input=[
    {jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',clientInfo:{name:'ChatGPT',version:'test'}}},
    {jsonrpc:'2.0',id:2,method:'tools/list'},
    {jsonrpc:'2.0',id:3,method:'tools/call',params:{name:'open_hud',arguments:{},_meta:{progressToken:'must-not-leak'}}},
  ].map(v=>JSON.stringify(v)).join('\n')+'\n';
  const run=spawnSync(executable,[join(root,'server','index.mjs')],{
    input,encoding:'utf8',windowsHide:true,timeout:15_000,maxBuffer:1024*1024,
    env:{...process.env,PATH:'',PLUGIN_ROOT:root}
  });
  assert.equal(run.status,0,run.stderr?.slice(0,120));
  const rows=run.stdout.trim().split('\n').map(x=>JSON.parse(x));
  assert.equal(rows.find(x=>x.id===1)?.result?.serverInfo?.name,'quota-pilot');
  const names=rows.find(x=>x.id===2)?.result?.tools?.map(x=>x.name);
  assert.ok(names?.includes('open_hud'));
  assert.ok(names?.includes('get_usage'));
  assert.ok(names?.includes('get_overview'));
  assert.equal(rows.find(x=>x.id===3)?.result?.isError,false);
  assert.doesNotMatch(run.stdout,/must-not-leak/);
});
