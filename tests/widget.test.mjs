import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('HUD uses a restrictive no-network CSP and does not render untrusted HTML', async () => {
  const source = await readFile(new URL('../ui/quota-widget.html', import.meta.url), 'utf8');
  for (const token of [
    "default-src 'none'", "connect-src 'none'", "img-src 'none'",
    "form-action 'none'", "object-src 'none'", "frame-src 'none'",
    "base-uri 'none'", 'textContent', 'replaceChildren',
    "requestHost('tools/call',{name:'get_overview',arguments:{}})",
  ]) {
    assert.ok(source.includes(token), 'Missing widget invariant: ' + token);
  }
  assert.doesNotMatch(source, /\.innerHTML\s*=|\beval\s*\(|\bfetch\s*\(|\bXMLHttpRequest\b|\bWebSocket\b|document\.write\s*\(/);
  assert.doesNotMatch(source, /addEventListener\s*\(\s*['"]message['"]/);
});

test('HUD renders fallback AI Usage and dynamic host branding, not product-internal name', async () => {
  const source = await readFile(new URL('../ui/quota-widget.html', import.meta.url), 'utf8');
  assert.match(source, /<title>AI Usage<\/title>/);
  assert.match(source, /id="brand" class="brand">AI Usage<\/span>/);
  assert.match(source, /overview\.host\.displayName/);
  assert.equal(source.includes('>QuotaPilot<'), false);
  assert.match(source, /setInterval\(refresh,30000\)/);
  assert.match(source, /if\(updating\|\|document.hidden\)return/);
});
