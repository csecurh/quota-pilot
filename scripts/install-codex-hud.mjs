#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

const configPath = join(homedir(), '.codex', 'config.toml');
await mkdir(dirname(configPath), { recursive: true });

let source = '';
try { source = await readFile(configPath, 'utf8'); } catch {}

const required = ['five-hour-limit', 'weekly-limit'];
const sectionRe = /^\[tui\][\s\S]*?(?=^\[[^\]]+\]|\Z)/m;
const sectionMatch = source.match(sectionRe);
let section = sectionMatch?.[0] ?? '[tui]\n';

const statusRe = /status_line\s*=\s*\[([\s\S]*?)\]/m;
const statusMatch = section.match(statusRe);
const existing = statusMatch ? [...statusMatch[1].matchAll(/[\"']([^\"']+)[\"']/g)].map((m) => m[1]) : [];
const preferred = ['model-with-reasoning', 'context-remaining', ...required];
const items = [...existing];
for (const item of preferred) if (!items.includes(item)) items.push(item);

const rendered = 'status_line = [' + items.map((x) => '"' + x + '"').join(', ') + ']';
if (statusMatch) section = section.replace(statusRe, rendered);
else section = section.trimEnd() + '\n' + rendered + '\n';

if (!/status_line_use_colors\s*=/.test(section)) section = section.trimEnd() + '\nstatus_line_use_colors = true\n';

if (sectionMatch) source = source.replace(sectionRe, section);
else source = source.trimEnd() + (source.trim() ? '\n\n' : '') + section;

await writeFile(configPath, source.trimEnd() + '\n', { mode: 0o600 });
process.stdout.write(JSON.stringify({ ok: true, changed: true, surface: 'codex-native-footer', items: required }));
