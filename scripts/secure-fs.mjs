import { chmod, lstat, mkdir, open, rename, unlink } from 'node:fs/promises';
import { constants } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';

const MAX_LOCAL_BYTES = 1024 * 1024;
const READ_FLAGS = constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0) | (constants.O_NONBLOCK ?? 0);

function ownedByCurrentUser(stat) {
  return typeof process.getuid !== 'function' || stat.uid === process.getuid();
}

function checkRegular(stat, { maxBytes, requirePrivate }) {
  if (!stat.isFile() || !ownedByCurrentUser(stat) || stat.size > maxBytes || stat.size < 0) {
    throw new Error('Unsafe local file');
  }
  if (requirePrivate && process.platform !== 'win32' && (stat.mode & 0o077) !== 0) {
    throw new Error('Local file permissions are too broad');
  }
}

export async function ensurePrivateDir(path) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const stat = await lstat(path);
  if (!stat.isDirectory() || stat.isSymbolicLink() || !ownedByCurrentUser(stat)) {
    throw new Error('Unsafe local directory');
  }
  if (process.platform !== 'win32') await chmod(path, 0o700);
}

export async function readSafeText(path, { maxBytes = MAX_LOCAL_BYTES, allowMissing = false, requirePrivate = false } = {}) {
  if (!Number.isSafeInteger(maxBytes) || maxBytes < 1 || maxBytes > MAX_LOCAL_BYTES) {
    throw new Error('Invalid local file limit');
  }

  let before;
  try { before = await lstat(path); }
  catch (error) {
    if (allowMissing && error?.code === 'ENOENT') return '';
    throw error;
  }
  if (before.isSymbolicLink()) throw new Error('Unsafe local file');
  checkRegular(before, { maxBytes, requirePrivate });

  const handle = await open(path, READ_FLAGS);
  try {
    const opened = await handle.stat();
    checkRegular(opened, { maxBytes, requirePrivate });
    if (before.dev !== opened.dev || before.ino !== opened.ino) {
      throw new Error('Local file changed during read');
    }

    const chunks = [];
    let total = 0;
    while (true) {
      const chunk = Buffer.allocUnsafe(Math.min(64 * 1024, maxBytes + 1 - total));
      const { bytesRead } = await handle.read(chunk, 0, chunk.length, null);
      if (bytesRead === 0) break;
      total += bytesRead;
      if (total > maxBytes) throw new Error('Unsafe local file');
      chunks.push(chunk.subarray(0, bytesRead));
    }
    return Buffer.concat(chunks, total).toString('utf8');
  } finally {
    await handle.close();
  }
}

export async function atomicWritePrivate(path, content) {
  if (typeof content !== 'string' || Buffer.byteLength(content, 'utf8') > MAX_LOCAL_BYTES) {
    throw new Error('Local write exceeded safety limit');
  }
  const dir = dirname(path);
  await ensurePrivateDir(dir);

  try {
    const existing = await lstat(path);
    if (existing.isSymbolicLink()) throw new Error('Unsafe local file');
    checkRegular(existing, { maxBytes: MAX_LOCAL_BYTES, requirePrivate: false });
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }

  const temp = join(dir, '.quotapilot-' + randomUUID() + '.tmp');
  let handle;
  try {
    handle = await open(temp, 'wx', 0o600);
    await handle.writeFile(content, 'utf8');
    await handle.sync();
    await handle.close();
    handle = null;
    if (process.platform !== 'win32') await chmod(temp, 0o600);
    await rename(temp, path);
  } finally {
    try { await handle?.close(); } catch {}
    try { await unlink(temp); } catch {}
  }
}
