#!/usr/bin/env node
import { homedir } from 'node:os';
import { join } from 'node:path';
import { atomicWritePrivate, readSafeText } from './secure-fs.mjs';

const configPath = join(homedir(), '.codex', 'config.toml');
let source = await readSafeText(configPath, { maxBytes: 1024 * 1024, allowMissing: true });

const required = ['five-hour-limit', 'weekly-limit'];
const preferred = ['model-with-reasoning', 'context-remaining', ...required];

function parseStatusItems(content) {
  const matches = [...content.matchAll(/status_line\s*=\s*\[([\s\S]*?)\]/gm)];
  if (matches.length > 1) throw new Error('Ambiguous Codex status_line configuration');
  if (!matches.length) return { match: null, items: [] };

  const body = matches[0][1];
  const items = [...body.matchAll(/["']([a-z0-9-]{1,64})["']/gi)].map((m) => m[1]);
  const residue = body.replace(/["'][a-z0-9-]{1,64}["']/gi, '').replace(/[\s,]/g, '');
  if (residue) throw new Error('Unsupported Codex status_line syntax');
  return { match: matches[0], items };
}

function updateTuiSection(input) {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const tuiStarts = lines.map((line, index) => /^\s*\[tui\]\s*$/.test(line) ? index : -1).filter((x) => x >= 0);
  if (tuiStarts.length > 1) throw new Error('Multiple [tui] sections are not supported safely');

  let start = tuiStarts[0] ?? -1;
  let end = lines.length;
  if (start < 0) {
    const prefix = input.trimEnd();
    const section = [
      '[tui]',
      'status_line = [' + preferred.map((x) => '"' + x + '"').join(', ') + ']',
      'status_line_use_colors = true',
      '',
    ].join('\n');
    return (prefix ? prefix + '\n\n' : '') + section;
  }

  for (let i = start + 1; i < lines.length; i++) {
    if (/^\s*\[[^\]]+\]\s*$/.test(lines[i])) {
      end = i;
      break;
    }
  }

  let section = lines.slice(start, end).join('\n');
  const parsed = parseStatusItems(section);
  const items = [...parsed.items];
  for (const item of preferred) if (!items.includes(item)) items.push(item);

  const rendered = 'status_line = [' + items.map((x) => '"' + x + '"').join(', ') + ']';
  if (parsed.match) section = section.replace(parsed.match[0], rendered);
  else section = section.trimEnd() + '\n' + rendered + '\n';

  const colorMatches = [...section.matchAll(/status_line_use_colors\s*=/g)];
  if (colorMatches.length > 1) throw new Error('Ambiguous Codex status_line_use_colors configuration');
  if (!colorMatches.length) section = section.trimEnd() + '\nstatus_line_use_colors = true\n';

  return [
    ...lines.slice(0, start),
    ...section.trimEnd().split('\n'),
    ...lines.slice(end),
  ].join('\n').replace(/\n{3,}/g, '\n\n');
}

source = updateTuiSection(source);
await atomicWritePrivate(configPath, source.trimEnd() + '\n');
process.stdout.write(JSON.stringify({ ok: true, changed: true, host: 'Codex', surface: 'codex-native-footer', items: required }));
