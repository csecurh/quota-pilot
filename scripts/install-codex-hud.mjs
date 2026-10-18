#!/usr/bin/env node
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWritePrivate, readSafeText } from './secure-fs.mjs';

const REQUIRED = ['five-hour-limit', 'weekly-limit'];
const DEFAULT_ITEMS = ['model-with-reasoning', 'context-remaining', ...REQUIRED];
const configPath = join(homedir(), '.codex', 'config.toml');

function parseInlineArray(line) {
  const match = /^(\s*status_line\s*=\s*)\[([^\]]*)\](\s*(?:#.*)?)$/.exec(line);
  if (!match) throw new Error('Unsupported Codex status_line syntax; config not changed');
  const body = match[2].trim();
  const tokens = body ? body.split(',') : [];
  if (tokens.at(-1)?.trim() === '') tokens.pop();
  const items = tokens.map((token) => {
    const parsed = /^\s*(["'])([A-Za-z0-9_-]{1,64})\1\s*$/.exec(token);
    if (!parsed) throw new Error('Unsupported Codex status_line item; config not changed');
    return parsed[2];
  });
  return { prefix: match[1], suffix: match[3], items };
}

export function updateCodexConfig(source) {
  if (typeof source !== 'string' || Buffer.byteLength(source) > 1024 * 1024) {
    throw new Error('Unsafe Codex configuration');
  }
  const newline = source.includes('\r\n') ? '\r\n' : '\n';
  const lines = source.split(/\r?\n/);
  const starts = lines.flatMap((line, i) => /^\s*\[tui\]\s*(?:#.*)?$/.test(line) ? [i] : []);
  if (starts.length > 1) throw new Error('Ambiguous Codex [tui] sections; config not changed');

  if (!starts.length) {
    const preamble = source ? source + (source.endsWith('\n') ? newline : newline + newline) : '';
    return preamble + '[tui]' + newline
      + 'status_line = [' + DEFAULT_ITEMS.map((s) => '"' + s + '"').join(', ') + ']' + newline
      + 'status_line_use_colors = true' + newline;
  }

  const start = starts[0];
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*\[[^\r\n]+\]\s*(?:#.*)?$/.test(lines[i])) { end = i; break; }
  }
  const section = lines.slice(start + 1, end);
  const statusIndexes = section.flatMap((line, i) => /^\s*status_line\s*=/.test(line) ? [i] : []);
  const colorIndexes = section.flatMap((line, i) => /^\s*status_line_use_colors\s*=/.test(line) ? [i] : []);
  if (statusIndexes.length > 1 || colorIndexes.length > 1) {
    throw new Error('Ambiguous Codex status configuration; config not changed');
  }

  if (statusIndexes.length) {
    const index = statusIndexes[0];
    const parsed = parseInlineArray(section[index]);
    const items = [...parsed.items];
    for (const item of REQUIRED) if (!items.includes(item)) items.push(item);
    const rewritten = parsed.prefix + '[' + items.map((s) => '"' + s + '"').join(', ') + ']' + parsed.suffix;
    if (items.length !== parsed.items.length) section[index] = rewritten;
  } else {
    section.push('status_line = [' + DEFAULT_ITEMS.map((s) => '"' + s + '"').join(', ') + ']');
  }
  if (!colorIndexes.length) section.push('status_line_use_colors = true');

  return [...lines.slice(0, start + 1), ...section, ...lines.slice(end)].join(newline);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const source = await readSafeText(configPath, { maxBytes: 1024 * 1024, allowMissing: true });
  const updated = updateCodexConfig(source);
  if (updated !== source) await atomicWritePrivate(configPath, updated);
  process.stdout.write(JSON.stringify({
    ok: true, changed: updated !== source, host: 'Codex',
    surface: 'codex-native-footer', items: REQUIRED,
  }));
}
