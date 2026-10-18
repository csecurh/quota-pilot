#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

function run(name) {
  return new Promise((resolvePromise) => {
    const child = spawn(process.execPath, [resolve(here, name)], {
      stdio: ['ignore', 'pipe', 'ignore'],
      env: process.env,
      shell: false,
      windowsHide: true,
    });
    let output = '';
    const timer = setTimeout(() => {
      try { child.kill(); } catch {}
      resolvePromise('');
    }, 5000);
    timer.unref?.();

    child.stdout.on('data', (data) => {
      if (output.length < 4096) output += String(data).slice(0, 4096 - output.length);
    });
    child.once('error', () => {
      clearTimeout(timer);
      resolvePromise('');
    });
    child.once('exit', () => {
      clearTimeout(timer);
      resolvePromise(output.trim());
    });
  });
}

let result = '';
if (process.env.CLAUDE_PLUGIN_ROOT) result = await run('install-claude-hud.mjs');
else if (process.env.PLUGIN_ROOT) result = await run('install-codex-hud.mjs');

if (result) process.stdout.write(result);
