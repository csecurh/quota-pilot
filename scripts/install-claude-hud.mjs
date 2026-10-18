#!/usr/bin/env node
import { chmod, copyFile, lstat, open, readFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWritePrivate, ensurePrivateDir, readSafeText } from './secure-fs.mjs';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const runtimeDir = join(homedir(), '.quotapilot');
const runtime = join(runtimeDir, 'claude-statusline.mjs');
const settingsPath = join(homedir(), '.claude', 'settings.json');
const executableName = process.platform === 'win32' ? 'node.exe' : 'node';
const bundledRuntime = join(root, 'runtime', executableName);
const isBundled = resolve(process.execPath).toLowerCase() === resolve(bundledRuntime).toLowerCase();
const installedRuntime = join(runtimeDir, executableName);
const executable = isBundled ? installedRuntime : 'node';
const command = (isBundled ? '"' + executable + '"' : 'node') + ' "' + runtime + '"';

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
if (isBundled) {
  // Only copy the Node executable shipped in this platform's verified bundle.
  // Keep it in our private data directory so statusLine survives plugin upgrades.
  const temp = join(runtimeDir, '.runtime-' + randomUUID() + '.tmp');
  try {
    const existing = await lstat(installedRuntime).catch((e) => {
      if (e?.code === 'ENOENT') return null;
      throw e;
    });
    if (existing && (!existing.isFile() || existing.isSymbolicLink()
      || (typeof process.getuid === 'function' && existing.uid !== process.getuid()))) {
      throw new Error('Unsafe local runtime');
    }
    const sourceStat = await lstat(bundledRuntime);
    if (!sourceStat.isFile() || sourceStat.isSymbolicLink() || sourceStat.size > 160 * 1024 * 1024) {
      throw new Error('Unsafe bundled runtime');
    }
    if (!existing || existing.size !== sourceStat.size) {
      await copyFile(bundledRuntime, temp, 1 /* COPYFILE_EXCL */);
      if (process.platform !== 'win32') await chmod(temp, 0o700);
      // Windows FlushFileBuffers requires a writable handle; POSIX accepts read-only fsync.
      const handle = await open(temp, process.platform === 'win32' ? 'r+' : 'r');
      try { await handle.sync(); } finally { await handle.close(); }
      await rename(temp, installedRuntime);
    }
  } finally {
    try { await unlink(temp); } catch {}
  }
}
const runtimeSource = await readFile(join(root, 'scripts', 'claude-statusline.mjs'), 'utf8');
const helperSource = await readFile(join(root, 'scripts', 'secure-fs.mjs'), 'utf8');
await atomicWritePrivate(runtime, runtimeSource);
await atomicWritePrivate(join(runtimeDir, 'secure-fs.mjs'), helperSource);

settings.statusLine = { type: 'command', command, refreshInterval: 30, padding: 1 };
await atomicWritePrivate(settingsPath, JSON.stringify(settings, null, 2) + '\n');
process.stdout.write(JSON.stringify({ ok: true, changed: true, host: 'Claude Code', surface: 'claude-statusline' }));
