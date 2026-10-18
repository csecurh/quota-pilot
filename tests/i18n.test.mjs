import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL('../' + path, import.meta.url), 'utf8');
const rootDocs = ['README', 'SECURITY', 'SUPPORT', 'CONTRIBUTING', 'CHANGELOG'];
const docNames = [
  'INSTALL', 'PRIVACY', 'HOST-TEST-PLAN', 'THREAT-MODEL', 'GITHUB-SECURITY-SETUP',
  'RELEASE-CHECKLIST', 'RELEASE-VALIDATION', 'LICENSE-DECISION',
  'HARDENING-2026-10-18', 'SECURITY-AUDIT-2026-10-17', 'PORTABLE', 'AGENT-INSTALL',
];

test('all user-facing English docs have full Spanish counterparts and bidirectional navigation', async () => {
  for (const name of rootDocs) {
    const english = name + '.md';
    const spanish = name + '.es.md';
    const [en, es] = await Promise.all([read(english),read(spanish)]);
    assert.match(en, /\[Español\]\([^)]+\.es\.md\)/, english);
    assert.match(es, /\[English\]\([^)]+\.md\)/, spanish);
    assert.ok(es.length > 300, spanish + ' must contain content, not only a link');
    assert.ok(en.length > 300, english + ' must contain content');
  }
  for (const name of docNames) {
    const [en,es] = await Promise.all([read('docs/'+name+'.md'),read('docs/es/'+name+'.md')]);
    assert.ok(en.includes('[Español](es/'+name+'.md)'),name+' EN navigation');
    assert.ok(es.includes('[English](../'+name+'.md)'),name+' ES navigation');
    assert.ok(es.length > 400,name+' translated page should contain substantive content');
  }
});

test('locale support keeps display localization separate from machine data and secure MCP bridge', async () => {
  const html = await read('ui/quota-widget.html');
  assert.match(html, /<html lang="en">/);
  assert.match(html, /navigator\.language/);
  assert.match(html, /const translations=\{/);
  assert.match(html, /en:\{loading:/);
  assert.match(html, /es:\{loading:/);
  assert.match(html, /id="lang-en"/);
  assert.match(html, /id="lang-es"/);
  assert.match(html, /function chooseLocale\(next\)/);
  assert.match(html, /document\.documentElement\.lang=locale/);
  assert.match(html, /setAttribute\('aria-pressed'/);
  assert.match(html, /setAttribute\('aria-label',tr\('bar'\)\)/);
  assert.match(html, /window\.openai\.callTool\('get_overview'/);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /\.innerHTML\s*=/);
  const status=await read('scripts/claude-statusline.mjs');
  assert.match(status, /process\.env\.QUOTAPILOT_LANG/);
  assert.match(status, /lang === 'es'/);
  assert.match(status, /requestedLang === 'en'/);
  const doctor=await read('scripts/doctor.mjs');
  assert.match(doctor, /process\.env\.QUOTAPILOT_LANG/);
  assert.match(doctor, /'AI Usage — diagnóstico local'/);
});

test('marketplace display descriptions are bilingual without renaming plugin IDs',async()=>{
  const manifest=JSON.parse(await read('plugin.json'));
  const claude=JSON.parse(await read('.claude-plugin/plugin.json'));
  const codex=JSON.parse(await read('.codex-plugin/plugin.json'));
  const market=JSON.parse(await read('.claude-plugin/marketplace.json'));
  assert.equal(manifest.name,'quota-pilot');
  assert.equal(claude.name,'quota-pilot');
  assert.equal(codex.name,'quota-pilot');
  for(const text of [manifest.description,claude.description,codex.description,market.description]){
    assert.ok(text.includes(' / '), 'EN/ES separated by slash');
  }
  const fields=manifest.extensions['com.openai'].interface;
  assert.equal(fields.displayName,'AI Usage');
  assert.equal(fields.defaultPrompt.length,2);
  assert.ok(fields.defaultPrompt.every(x=>x.includes(' / ')));
});

test('Spanish docs preserve safety boundaries and English API identifiers',async()=>{
  const es=await read('README.es.md');
  const privacy=await read('docs/es/PRIVACY.md');
  const install=await read('docs/es/INSTALL.md');
  const security=await read('SECURITY.es.md');
  assert.match(es,/experimental/i);
  assert.match(es,/quota-pilot@ai-usage/);
  assert.match(es,/get_overview/);
  assert.match(privacy,/connect-src 'none'/);
  assert.match(privacy,/64 KiB/);
  assert.match(install,/codex plugin marketplace add csecurh\/quota-pilot/);
  assert.match(install,/\/plugin install quota-pilot@ai-usage/);
  assert.match(security,/reporte privado de vulnerabilidades/i);
});
