import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url), 'utf8');

test('release candidate has MIT license and consistent copyright metadata', async () => {
  const license = await read('LICENSE');
  const pkg = JSON.parse(await read('package.json'));
  const plugin = JSON.parse(await read('plugin.json'));
  assert.equal(pkg.license, 'MIT');
  assert.match(license, /^MIT License\n\nCopyright \(c\) 2026 Cibersecurity-H\n/);
  assert.equal(plugin.author.name, 'Cibersecurity-H');
  for (const phrase of [
    'Permission is hereby granted, free of charge',
    'The above copyright notice and this permission notice shall be included',
    'THE SOFTWARE IS PROVIDED "AS IS"',
  ]) assert.ok(license.includes(phrase), 'Missing MIT license clause');
  assert.match(await read('README.md'), /\*\*License: \[MIT\]\(LICENSE\)\*\*/);
});

test('github local repo security files cover owners, workflow pins and action updates', async () => {
  const owners = await read('.github/CODEOWNERS');
  const dependabot = await read('.github/dependabot.yml');
  const workflow = await read('.github/workflows/ci.yml');
  assert.match(owners, /^\* @csecurh/m);
  assert.match(owners, /^\/\.github\/ @csecurh/m);
  assert.match(owners, /^\/LICENSE @csecurh/m);
  assert.match(dependabot, /package-ecosystem: github-actions/);
  assert.match(dependabot, /interval: weekly/);
  const actions = [...workflow.matchAll(/^\s*uses:\s*(\S+)/gm)].map((match) => match[1]);
  assert.deepEqual(actions.map((action) => action.split('@')[0]), ['actions/checkout', 'actions/setup-node']);
  assert.ok(actions.every((action) => /@[a-f0-9]{40}$/.test(action)));
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /pull_request:/);
});

test('private release gate never claims branch protection or vulnerability reporting already enabled', async () => {
  const docs = await read('docs/GITHUB-SECURITY-SETUP.md');
  assert.match(docs, /protected: false/);
  assert.match(docs, /allow_forking: true/);
  assert.match(docs, /Do not change visibility/);
  assert.match(docs, /Verify \(ubuntu-latest\)/);
  assert.match(docs, /Verify \(macos-latest\)/);
  assert.match(docs, /Verify \(windows-latest\)/);
  assert.match(docs, /Private vulnerability reporting/);
  const security = await read('SECURITY.md');
  assert.match(security, /private.*only authorized collaborators/i);
});
