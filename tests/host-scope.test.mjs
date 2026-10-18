import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL('../' + path, import.meta.url),'utf8');

test('ChatGPT/OpenAI shared plugin cannot auto-run the Codex configuration installer', async () => {
  const portable = JSON.parse(await read('plugin.json'));
  const overlay = JSON.parse(await read('.codex-plugin/plugin.json'));
  const shared = portable.extensions['com.openai'];
  assert.equal(shared.hooks,'./hooks/openai-safe.json');
  assert.equal(overlay.hooks, undefined);
  const quiet=JSON.parse(await read('hooks/openai-safe.json'));
  assert.deepEqual(quiet, { hooks: {} });
  assert.doesNotMatch(JSON.stringify(quiet),/config\.toml|ensure-surfaces|install-codex-hud|SessionStart/);
  // Host-specific behavior is kept available only for explicit use by the matching host.
  const codex=JSON.parse(await read('hooks/codex.json'));
  const claude=JSON.parse(await read('hooks/hooks.json'));
  assert.match(JSON.stringify(codex), /ensure-surfaces\.mjs/);
  assert.match(JSON.stringify(codex), /codex/);
  assert.match(JSON.stringify(claude), /ensure-surfaces\.mjs/);
  assert.match(JSON.stringify(claude), /claude/);
});
test('Agent onboarding forbids ChatGPT Desktop from editing Codex or Claude host settings',async()=>{
  const [agents, setup, en,es] = await Promise.all([
    read('AGENTS.md'),read('skills/setup/SKILL.md'),read('docs/AGENT-INSTALL.md'),read('docs/es/AGENT-INSTALL.md')
  ]);
  assert.match(agents,/ChatGPT Desktop \/ ChatGPT Work/);
  assert.match(agents,/Never request access to \`~\/\.codex\/config\.toml\`/);
  assert.match(setup,/Do \*\*not\*\* call \`scripts\/install-codex-hud\.mjs\`/);
  assert.match(agents,/cloud computer/);
  assert.match(en,/decline/);
  assert.match(es,/rechaza esa solicitud/);
});
