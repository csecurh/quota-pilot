#!/usr/bin/env node
// Build a self-contained host plugin using the Node executable on the pinned CI runner.
import { copyFile, cp, mkdir, readFile, rm, stat, writeFile, chmod } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const platform = process.platform;
const arch = process.arch;
if (!['win32','linux','darwin'].includes(platform) || !['x64','arm64'].includes(arch)) {
  throw new Error('Unsupported portable release target');
}
const name = 'quota-pilot-' + platform + '-' + arch;
const output = resolve(root, process.argv[2] || 'dist');
const staging = join(output, name);
const nodeName = platform === 'win32' ? 'node.exe' : 'node';
const nodePath = join(staging, 'runtime', nodeName);

await rm(staging, { recursive: true, force: true });
await mkdir(staging, { recursive: true, mode: 0o700 });

const directories = ['server','scripts','ui','hooks','skills','.claude-plugin','.codex-plugin','.agents','docs'];
const rootFiles = ['plugin.json','mcp.json','.mcp.json','LICENSE','README.md','README.es.md',
  'SECURITY.md','SECURITY.es.md','SUPPORT.md','SUPPORT.es.md','CONTRIBUTING.md','CONTRIBUTING.es.md',
  'CHANGELOG.md','CHANGELOG.es.md','package.json'];
for (const dir of directories) {
  await cp(join(root, dir), join(staging, dir), { recursive: true, dereference: false, errorOnExist: true });
}
for (const file of rootFiles) await copyFile(join(root,file), join(staging,file));
await mkdir(dirname(nodePath), { recursive: true, mode: 0o700 });
await copyFile(process.execPath, nodePath);
if(platform !== 'win32') await chmod(nodePath, 0o755);

const candidates = [
  join(dirname(process.execPath),'LICENSE'),
  join(dirname(dirname(process.execPath)),'LICENSE')
];
let license = null;
for (const candidate of candidates) {
  try {
    const bytes = await readFile(candidate);
    if (bytes.length > 500 && bytes.length < 2*1024*1024) { license = bytes; break; }
  } catch {}
}
if (!license) throw new Error('Node LICENSE missing from pinned build runtime; refusing to distribute runtime');
await writeFile(join(staging,'runtime','NODE-LICENSE'),license);

for(const item of [{ path:'mcp.json', env:'PLUGIN_ROOT', portable:true },
                   { path:'.mcp.json', env:'CLAUDE_PLUGIN_ROOT', portable:false }]) {
  const path = join(staging,item.path);
  const doc = JSON.parse(await readFile(path,'utf8'));
  const server = doc.mcpServers['quota-pilot'];
  server.command = '$'+'{'+item.env+'}/runtime/'+nodeName;
  server.args = ['$'+'{'+item.env+'}/server/index.mjs'];
  if(item.portable)server.cwd='$'+'{PLUGIN_ROOT}';
  await writeFile(path,JSON.stringify(doc,null,2)+'\n');
}
for (const [file, env] of [['hooks/hooks.json','CLAUDE_PLUGIN_ROOT'],['hooks/codex.json','PLUGIN_ROOT']]) {
  const path=join(staging,file);
  const doc=JSON.parse(await readFile(path,'utf8'));
  for (const start of doc.hooks.SessionStart) for(const hook of start.hooks) {
    const dollar = String.fromCharCode(36);
    const p = dollar + '{' + env + '}';
    hook.command = '"' + p + '/runtime/' + nodeName + '" "' + p + '/scripts/ensure-surfaces.mjs" ' + (env === 'PLUGIN_ROOT' ? 'codex' : 'claude');
  }
  await writeFile(path,JSON.stringify(doc,null,2)+'\n');
}
const claudeMarketPath=join(staging,'.claude-plugin','marketplace.json');
const claudeMarket=JSON.parse(await readFile(claudeMarketPath,'utf8'));
claudeMarket.plugins[0].source='./';
await writeFile(claudeMarketPath,JSON.stringify(claudeMarket,null,2)+'\n');
await writeFile(join(staging,'PORTABLE-BUILD.json'),JSON.stringify({
  name,platform,arch,node:process.versions.node,
  packaging:'node-runtime-bundled',
  mcp:'stdio',networkOnRuntime:false
},null,2)+'\n');

const archive = join(output,name+(platform==='win32'?'.zip':'.tar.gz'));
await rm(archive,{force:true});
let result;
if(platform==='win32') {
  const escapePS=(value)=>value.replaceAll("'","''");
  result=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',
    "Compress-Archive -LiteralPath '"+escapePS(staging)+"' -DestinationPath '"+escapePS(archive)+"' -CompressionLevel Optimal"
  ], { timeout:120000, windowsHide:true, stdio:'pipe' });
} else {
  result=spawnSync('tar',['-czf',archive,'-C',output,name],{timeout:120000,stdio:'pipe'});
}
if (result.error || result.status!==0) throw new Error('Portable archive packaging failed');
const st=await stat(archive);
if(st.size < 1024*1024) throw new Error('Portable bundle archive unexpectedly small');
process.stdout.write(JSON.stringify({name, archive:basename(archive),bytes:st.size,node:process.versions.node})+'\n');
