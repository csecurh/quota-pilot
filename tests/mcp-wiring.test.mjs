import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = async path => readFile(new URL('../' + path, import.meta.url),'utf8');

test('portable and legacy MCP manifests use their respective supported formats',async()=>{
  const portable=JSON.parse(await read('plugin.json'));
  const source=JSON.parse(await read('mcp.json'));
  const overlay=JSON.parse(await read('.codex-plugin/plugin.json'));
  const legacy=JSON.parse(await read('.mcp.json'));
  const sourceServer=source.mcpServers['quota-pilot'];
  const legacyServer=legacy.mcpServers['quota-pilot'];
  assert.equal(portable.name,'quota-pilot');
  assert.equal(sourceServer.type,'stdio');
  assert.equal(sourceServer.command,'node');
  assert.equal(overlay.mcpServers,'./.mcp.json');
  assert.equal(typeof legacyServer.command,'string');
  assert.ok(Array.isArray(legacyServer.args));
  assert.equal(legacyServer.type,undefined,'legacy MCP schema cannot be confused with portable schema');
  assert.match(sourceServer.args[0],/^\$\{PLUGIN_ROOT\}\/server\/index\.mjs$/);
  assert.match(legacyServer.args[0],/^\$\{CLAUDE_PLUGIN_ROOT\}\/server\/index\.mjs$/);
});

test('source marketplace cannot falsely promise zero external runtime on Windows',async()=>{
  const manifest=JSON.parse(await read('mcp.json'));
  const server=manifest.mcpServers['quota-pilot'];
  assert.equal(server.command,'node','source checkout starts a system Node runtime');
  const guide=await read('docs/es/AGENT-INSTALL.md');
  assert.match(guide,/Node\.js|Node/);
  assert.match(guide,/servidor MCP/);
  assert.match(guide,/skill/);
});
