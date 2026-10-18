import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('public marketplaces present a neutral user-facing name and stable plugin ID', async () => {
  const codex = JSON.parse(await read('.agents/plugins/marketplace.json'));
  const claude = JSON.parse(await read('.claude-plugin/marketplace.json'));
  for (const catalog of [codex, claude]) {
    assert.equal(catalog.name, 'ai-usage');
    assert.equal(catalog.plugins.length, 1);
    assert.equal(catalog.plugins[0].name, 'quota-pilot');
    assert.doesNotMatch(JSON.stringify(catalog), /private preview|ai-usage-private|AI Usage Private/i);
  }
  assert.equal(codex.interface.displayName, 'AI Usage');
  assert.equal(codex.plugins[0].source.source, 'local');
  assert.equal(codex.plugins[0].source.path, './');
  assert.equal(claude.plugins[0].source.repo, 'csecurh/quota-pilot');
});

test('public docs and issue templates are consistent, sanitized, and clearly identify experimental ChatGPT support', async () => {
  const readme = await read('README.md');
  const install = await read('docs/INSTALL.md');
  const support = await read('SUPPORT.md');
  const checklist = await read('docs/RELEASE-CHECKLIST.md');
  const validation = await read('docs/RELEASE-VALIDATION.md');
  const security = await read('SECURITY.md');
  assert.match(readme, /git clone https:\/\/github\.com\/csecurh\/quota-pilot\.git/);
  assert.match(readme, /experimental/i);
  assert.match(install, /\/plugin marketplace add csecurh\/quota-pilot/);
  assert.match(install, /quota-pilot@ai-usage/);
  assert.match(install, /codex plugin marketplace add csecurh\/quota-pilot/);
  assert.match(install, /ChatGPT Desktop.*experimental/i);
  assert.match(checklist, /GitHub source is PUBLIC/);
  assert.match(validation, /NOT TESTED WITH REAL HOST/);
  assert.match(support, /best-effort/);
  assert.match(security, /Private vulnerability reporting/);
  for (const path of ['.github/ISSUE_TEMPLATE/bug_report.yml', '.github/ISSUE_TEMPLATE/feature_request.yml', '.github/ISSUE_TEMPLATE/config.yml']) {
    const source = await read(path);
    assert.match(source, /(?:credentials|security|private|vulnerabilit)/i);
  }
});
