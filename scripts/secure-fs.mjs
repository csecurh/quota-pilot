import { chmod, lstat, mkdir, open, readFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';

function ownedByCurrentUser(stat) {
  return typeof process.getuid !== 'function' || stat.uid === process.getuid();
}

export async function ensurePrivateDir(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || !ownedByCurrentUser(stat)) {
    throw new Error('Unsafe local directory');
  }
  if (process.platform !== 'win32') await chmod(path, 0o700);
}

export async function readSafeText(path, { maxBytes = 1024 * 1024, allowMissing = false, requirePrivate = false } = {}) {
  let stat;
  try { stat = await lstat(path); }
  catch (error) {
    if (allowMissing && error?.code === 'ENOENT') return '';
    throw error;
  }
  if (!stat.isFile() || stat.isSymbolicLink() || !ownedByCurrentUser(stat) || stat.size > maxBytes) {
    throw new Error('Unsafe local file');
  }
  if (requirePrivate && process.platform !== 'win32' && (stat.mode & 0o077) !== 0) {
    throw new Error('Local file permissions are too broad');
  }
  return readFile(path, 'utf8');
}

export async function atomicWritePrivate(path, content) {
  const dir = dirname(path);
  await ensurePrivateDir(dir);

  try {
    const existing = await lstat(path);
    if (existing.isSymbolicLink() || !existing.isFile() || !ownedByCurrentUser(existing)) throw new Error('Unsafe local file');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const temp = join(dir, `.quotapilot-${randomUUID()}.tmp`);
  let handle;
  try {
    handle = await open(temp, 'wx', 0o600);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;
    if (process.platform !== 'win32') await chmod(temp, 0o600);
    await rename(temp, path);
    if (process.platform !== 'win32') await chmod(path, 0o600);
  } finally {
    try { await handle?.close(); } catch {}
    try { await unlink(temp); } catch {}
  }
}
