import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { detectHostBrand } from '../server/host.mjs';

test('detects ChatGPT from MCP client info', () => {
  assert.deepEqual(
    detectHostBrand({ name: 'chatgpt-desktop', title: 'ChatGPT' }, {}),
    { id: 'chatgpt', displayName: 'ChatGPT', shortName: 'ChatGPT' },
  );
});

test('detects Codex from MCP client info and local plugin env', () => {
  assert.equal(detectHostBrand({ name: 'codex' }, {}).displayName, 'Codex');
  assert.equal(detectHostBrand({}, { PLUGIN_ROOT: '/plugin' }).displayName, 'Codex');
});

test('detects Claude Code from MCP client info and plugin env', () => {
  assert.equal(detectHostBrand({ name: 'claude-code' }, {}).displayName, 'Claude Code');
  assert.equal(detectHostBrand({}, { CLAUDE_PLUGIN_ROOT: '/plugin' }).displayName, 'Claude Code');
});

test('falls back to AI Usage when the host is unknown', () => {
  assert.equal(detectHostBrand({}, {}).displayName, 'AI Usage');
});

test('visible widget is host-aware and does not hard-code QuotaPilot branding', async () => {
  const html = await readFile(new URL('../ui/quota-widget.html', import.meta.url), 'utf8');
  assert.match(html, /id="brand" class="brand">AI Usage</);
  assert.match(html, /window\.openai/);
  assert.match(html, /ChatGPT/);
  assert.equal(html.includes('>QuotaPilot<'), false);
});
