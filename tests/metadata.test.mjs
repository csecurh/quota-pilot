import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const text = async (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');
test('all distribution manifest versions align with the release candidate', async () => {
  const pkg = JSON.parse(await text('package.json'));
  const plugin = JSON.parse(await text('plugin.json'));
  const codex = JSON.parse(await text('.codex-plugin/plugin.json'));
  const claude = JSON.parse(await text('.claude-plugin/plugin.json'));
  assert.equal(pkg.version, '0.5.0-rc.1');
  for (const manifest of [plugin, codex, claude]) assert.equal(manifest.version, pkg.version);
  assert.match(await text('server/index.mjs'), /version: '0\.5\.0-rc\.1'/);
  assert.match(await text('server/providers/codex.mjs'), /version: '0\.5\.0-rc\.1'/);
});

test('public launch claims and platform access remain honest', async () => {
  const readme = await text('README.md');
  assert.match(readme, /private 0\.5\.0 release candidate/i);
  assert.match(readme, /ChatGPT.*host/i);
  assert.match(readme, /LICENSE-DECISION\.md/);
  const checklist = await text('docs/RELEASE-CHECKLIST.md');
  assert.match(checklist, /expressly authorizes a visibility change/);
  assert.match(checklist, /unshallow/);
});

test('widget exposes progress semantics and reduced motion preference', async () => {
  const widget = await text('ui/quota-widget.html');
  assert.match(widget, /aria-valuenow/);
  assert.match(widget, /role','progressbar/);
  assert.match(widget, /prefers-reduced-motion: reduce/);
  assert.match(widget, /setAttribute\('role','note'\)/);
});
