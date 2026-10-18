import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const server = fileURLToPath(new URL('../server/index.mjs', import.meta.url));

function runProtocol(frames, { timeoutMs = 8000, env = {} } = {}) {
  return new Promise((resolveResult, reject) => {
    const child = spawn(process.execPath, [server], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, ...env },
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => { child.kill(); reject(new Error('MCP test timeout')); }, timeoutMs);
    child.stdout.on('data', (data) => { stdout += String(data); if (stdout.length > 2 * 1024 * 1024) child.kill(); });
    child.stderr.on('data', (data) => { stderr += String(data).slice(0, 4096); });
    child.once('error', (error) => { clearTimeout(timer); reject(error); });
    child.once('close', (code) => {
      clearTimeout(timer);
      try {
        resolveResult({ code, stderr, responses: stdout.trim().split('\n').filter(Boolean).map(JSON.parse) });
      } catch (error) { reject(error); }
    });
    child.stdin.on('error', () => {});
    child.stdin.end(frames);
  });
}
const req = (id, method, params = {}) => JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n';

test('MCP rejects extra arguments, wrong types and unknown tools', async () => {
  const result = await runProtocol(
    req(1, 'tools/call', { name: 'get_usage', arguments: { provider: 'codex', path: '/etc/passwd' } }) +
    req(2, 'tools/call', { name: 'get_overview', arguments: [] }) +
    req(3, 'tools/call', { name: 'get_overview', arguments: {} }) +
    req(4, 'tools/call', { name: 'nonexistent', arguments: {} })
  , { env: { PATH: '' } });
  const byId = new Map(result.responses.map((r) => [r.id, r]));
  assert.equal(byId.get(1).result.isError, true);
  assert.equal(byId.get(2).result.isError, true);
  assert.equal(byId.get(3).result.isError, false);
  assert.equal(byId.get(4).error.code, -32601);
  assert.equal(result.stderr.includes('/etc/passwd'), false);
});

test('MCP overlong frames are discarded without executing suffix as a request', async () => {
  const attacker = 'x'.repeat(280 * 1024) + req(333, 'ping');
  const result = await runProtocol(attacker + req(7, 'ping'));
  assert.equal(result.responses.some((r) => r.id === 333), false);
  assert.equal(result.responses.find((r) => r.id === 7)?.result != null, true);
  assert.equal(result.responses.some((r) => r.error?.message === 'Request too large'), true);
});

test('Codex provider errors reveal no system path or child process details', async () => {
  const result = await runProtocol(req(10, 'tools/call', { name: 'get_usage', arguments: { provider: 'codex' } }), {
    env: { PATH: '' },
  });
  const text = result.responses.find((r) => r.id === 10)?.result?.content?.[0]?.text;
  assert.equal(text, 'codex usage is temporarily unavailable.');
  assert.doesNotMatch(JSON.stringify(result.responses), /ENOENT|spawn codex|node:internal|\/home\/|\/etc\//i);
});

test('MCP validates client protocol brand and rejects invalid JSON safely', async () => {
  const result = await runProtocol(
    req(1, 'initialize', { protocolVersion: '2025-06-18', clientInfo: { name: 'ChatGPT' } }) +
    '{invalid json\n' +
    req(2, 'resources/list')
  , { env: { QUOTAPILOT_HOST: '' } });
  assert.equal(result.responses.find((r) => r.id === 2)?.result?.resources?.[0]?.title, 'ChatGPT');
  assert.equal(result.responses.some((r) => r.error?.code === -32700), true);
});

test('MCP cannot reflect unbounded untrusted ids or invalid resource request data', async () => {
  const result = await runProtocol(
    req('y'.repeat(2048), 'ping') +
    req(11, 'resources/read', { uri: 'ui://quotapilot/live.html', extra: true })
  );
  assert.equal(result.responses.find((r) => r.id === 11)?.error?.code, -32002);
  assert.equal(result.responses.some((r) => typeof r.id === 'string' && r.id.length > 128), false);
});
