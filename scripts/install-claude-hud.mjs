#!/usr/bin/env node
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const runtimeDir = join(homedir(), '.quotapilot');
const runtime = join(runtimeDir, 'claude-statusline.mjs');
const settingsPath = join(homedir(), '.claude', 'settings.json');
const backupPath = join(homedir(), '.claude', 'settings.quotapilot-backup.json');
const command = 'node "' + runtime.replaceAll('"', '\\"') + '"';

async function readSettings() {
  try { return JSON.parse(await readFile(settingsPath, 'utf8')); }
  catch (e) {
    if (e?.code === 'ENOENT') return {};
    throw e;
  }
}

await mkdir(runtimeDir, { recursive: true });
await mkdir(dirname(settingsPath), { recursive: true });
await copyFile(resolve(here, 'claude-statusline.mjs'), runtime);

const settings = await readSettings();
const current = settings.statusLine;

if (current?.command && current.command !== command) {
  process.stdout.write(JSON.stringify({ ok: true, changed: false, reason: 'custom-statusline-present' }));
  process.exit(0);
}

try { await copyFile(settingsPath, backupPath); } catch {}
settings.statusLine = { type: 'command', command, refreshInterval: 30, padding: 1 };
await writeFile(settingsPath, JSON.stringify(settings, null, 2) + '\n', { mode: 0o600 });
process.stdout.write(JSON.stringify({ ok: true, changed: true, surface: 'claude-statusline' }));
