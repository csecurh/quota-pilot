#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWritePrivate, ensurePrivateDir, readSafeText } from './secure-fs.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const runtimeDir = join(homedir(), '.quotapilot');
const runtime = join(runtimeDir, 'claude-statusline.mjs');
const settingsPath = join(homedir(), '.claude', 'settings.json');
const command = 'node "' + runtime.replaceAll('"', '\\"') + '"';

let settings = {};
const raw = await readSafeText(settingsPath, { maxBytes: 512 * 1024, allowMissing: true });
if (raw) {
  try { settings = JSON.parse(raw); }
  catch { throw new Error('Claude settings are not valid JSON'); }
}
if (!settings || typeof settings !== 'object' || Array.isArray(settings)) throw new Error('Claude settings are invalid');

const current = settings.statusLine;
if (current?.command && current.command !== command) {
  process.stdout.write(JSON.stringify({ ok: true, changed: false, reason: 'custom-statusline-present' }));
  process.exit(0);
}

await ensurePrivateDir(runtimeDir);
const runtimeSource = await readFile(join(root, 'scripts', 'claude-statusline.mjs'), 'utf8');
const helperSource = await readFile(join(root, 'scripts', 'secure-fs.mjs'), 'utf8');
await atomicWritePrivate(runtime, runtimeSource);
await atomicWritePrivate(join(runtimeDir, 'secure-fs.mjs'), helperSource);

settings.statusLine = { type: 'command', command, refreshInterval: 30, padding: 1 };
await atomicWritePrivate(settingsPath, JSON.stringify(settings, null, 2) + '\n');
process.stdout.write(JSON.stringify({ ok: true, changed: true, host: 'Claude Code', surface: 'claude-statusline' }));
