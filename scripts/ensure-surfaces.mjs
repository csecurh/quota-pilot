#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

function run(name) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [resolve(here, name)], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
    let out = '';
    child.stdout.on('data', (d) => { out += String(d); });
    child.once('error', () => resolvePromise(''));
    child.once('exit', () => resolvePromise(out.trim()));
  });
}

let result = '';
if (process.env.PLUGIN_ROOT) result = await run('install-codex-hud.mjs');
else if (process.env.CLAUDE_PLUGIN_ROOT) result = await run('install-claude-hud.mjs');

if (result) process.stdout.write(result);
