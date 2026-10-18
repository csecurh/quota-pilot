#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const configPath = join(homedir(), '.codex', 'config.toml');
await mkdir(dirname(configPath), { recursive: true });

let source = '';
try { source = await readFile(configPath, 'utf8'); } catch {}

const required = ['five-hour-limit', 'weekly-limit'];
const preferred = ['model-with-reasoning', 'context-remaining', ...required];

function updateTuiSection(input) {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  let start = lines.findIndex((line) => /^\s*\[tui\]\s*$/.test(line));
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
  const statusRe = /status_line\s*=\s*\[([\s\S]*?)\]/m;
  const statusMatch = section.match(statusRe);
  const existing = statusMatch
    ? [...statusMatch[1].matchAll(/["']([^"']+)["']/g)].map((m) => m[1])
    : [];

  const items = [...existing];
  for (const item of preferred) if (!items.includes(item)) items.push(item);

  const rendered = 'status_line = [' + items.map((x) => '"' + x + '"').join(', ') + ']';
  if (statusMatch) section = section.replace(statusRe, rendered);
  else section = section.trimEnd() + '\n' + rendered + '\n';

  if (!/status_line_use_colors\s*=/.test(section)) {
    section = section.trimEnd() + '\nstatus_line_use_colors = true\n';
  }

  return [
    ...lines.slice(0, start),
    ...section.trimEnd().split('\n'),
    ...lines.slice(end),
  ].join('\n').replace(/\n{3,}/g, '\n\n');
}

source = updateTuiSection(source);
await writeFile(configPath, source.trimEnd() + '\n', { mode: 0o600 });
process.stdout.write(JSON.stringify({
  ok: true,
  changed: true,
  host: 'Codex',
  surface: 'codex-native-footer',
  items: required,
}));
