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
  assert.match(agents,/Read-only onboarding; NEVER execute an installer/);
  assert.match(setup,/NO-INSTALL, NO-WRITE PATH/);
  assert.match(agents,/cloud execution environment/);
  assert.match(en,/decline/);
  assert.match(es,/rechaza esa solicitud/);
});

test('OpenAI onboarding is ChatGPT-only and cannot bootstrap the Codex CLI footer',async()=>{
  const manifest=JSON.parse(await read('plugin.json'));
  assert.equal(manifest.extensions['com.openai'].onboardingSkill,'./skills/chatgpt-hud/SKILL.md');
  const chat=await read('skills/chatgpt-hud/SKILL.md');
  assert.match(chat,/NEVER execute an installer/);
  assert.match(chat,/get_overview/);
  assert.match(chat,/open_hud/);
  assert.match(chat,/if tools are not available/i);
  assert.match(chat,/Do not automatically switch to Codex setup/);
  assert.match(chat,/ChatGPT Work can execute in an isolated cloud/);
  assert.doesNotMatch(manifest.extensions['com.openai'].interface.defaultPrompt.join(' '),/configurar codex|install codex|Codex footer/i);
});
