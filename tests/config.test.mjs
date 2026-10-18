import test from 'node:test';
import assert from 'node:assert/strict';
import { updateCodexConfig } from '../scripts/install-codex-hud.mjs';
import { safePercent } from '../server/security.mjs';

test('Codex updates only [tui] and preserves all unrelated TOML verbatim', () => {
  const source = '# header\n[general]\nmodel = "o3"\n# keep\n\n[tui] # own section\nstatus_line = ["git-branch", "context-remaining"] # footer\nstatus_line_use_colors = false\n\n[mcp_servers.tools]\ncommand = "node"\nargs = ["foo", "bar"]\n';
  const output = updateCodexConfig(source);
  assert.ok(output.startsWith(source.slice(0, source.indexOf('status_line ='))));
  assert.ok(output.includes('[mcp_servers.tools]\ncommand = "node"\nargs = ["foo", "bar"]'));
  assert.ok(output.includes('status_line_use_colors = false'));
  assert.ok(output.includes('# footer'));
  assert.equal((output.match(/five-hour-limit/g) ?? []).length, 1);
  assert.equal((output.match(/weekly-limit/g) ?? []).length, 1);
  assert.equal(updateCodexConfig(output), output);
});

test('Codex rejects complex, multiline or duplicate status arrays instead of rewriting them', () => {
  for (const content of [
    '[tui]\nstatus_line = [\n  "git-branch",\n]\n',
    '[tui]\nstatus_line = ["git-branch"]\nstatus_line = ["context-remaining"]\n',
    '[tui]\nstatus_line = ["git-branch", { value = "xyz" }]\n',
    '[tui]\nstatus_line = ["git-branch"]\n[tui]\nstatus_line = ["context-remaining"]\n',
  ]) {
    assert.throws(() => updateCodexConfig(content));
  }
});

test('Codex adds a new footer section without rewriting existing text', () => {
  const existing = '[features]\nweb_search = true\n';
  const updated = updateCodexConfig(existing);
  assert.ok(updated.startsWith(existing));
  assert.match(updated, /\[tui\]/);
  assert.equal(updateCodexConfig(updated), updated);
});

test('percent normalization does not invent zero usage from absent or invalid provider metrics', () => {
  for (const value of [null, undefined, '', false, true, {}, [], 'oops', Infinity]) {
    assert.equal(safePercent(value), null);
  }
  assert.equal(safePercent(0), 0);
  assert.equal(safePercent('28.5'), 28.5);
  assert.equal(safePercent(120), 100);
  assert.equal(safePercent(-1), 0);
});
