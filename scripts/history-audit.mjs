#!/usr/bin/env node
// Audit ALL reachable Git history before considering a public release.
// Run from a full checkout: git fetch --unshallow (if needed), then npm run security:history.
// Never print matching secret content.
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const maxObjectBytes = 1024 * 1024;
const failures = [];
const deniedPath = /(?:^|\/)(?:\.env(?:$|\.(?!example$))|\.npmrc$|\.pypirc$|\.netrc$|\.ssh\/|\.aws\/credentials$|\.git-credentials$|id_(?:rsa|ed25519)$|[^/]+\.(?:pem|p12|pfx|key|sqlite|db)$)/i;
const knownSecrets = [
  /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /gh[pousr]_[A-Za-z0-9]{30,}/,
  /sk-[A-Za-z0-9_-]{24,}/,
  /AKIA[0-9A-Z]{16}/,
  /sb_secret_[A-Za-z0-9_-]{16,}/,
  /(?:client_secret|private_key|api_key|access_token)\s*[:=]\s*["'][A-Za-z0-9+/=_-]{24,}["']/i,
];

function git(args, input, maxBuffer = 20 * 1024 * 1024) {
  const result = spawnSync('git', args, {
    cwd: root, input, maxBuffer, encoding: null, timeout: 30_000, windowsHide: true,
  });
  if (result.error || result.status !== 0) throw new Error('History audit requires a complete and readable Git checkout.');
  return result.stdout;
}

try {
  const shallow = git(['rev-parse', '--is-shallow-repository']).toString('utf8').trim();
  if (shallow !== 'false') throw new Error('History audit requires a non-shallow Git checkout.');
  const listing = git(['rev-list', '--objects', '--all']).toString('utf8').trim().split('\n');
  if (!listing[0]) throw new Error('History audit found no reachable objects.');

  const entries = listing.map((line) => {
    const match = /^([0-9a-f]{40,64})(?: (.*))?$/.exec(line);
    if (!match) throw new Error('Unexpected Git object listing format.');
    return { sha: match[1], path: match[2] || '' };
  });
  for (const entry of entries) if (entry.path && deniedPath.test(entry.path)) {
    failures.push('Sensitive filename in history: ' + entry.path);
  }

  const sizes = git(
    ['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'],
    Buffer.from(entries.map((e) => e.sha).join('\n') + '\n'),
  ).toString('utf8').trim().split('\n');
  let inspected = 0;
  let skippedBinary = 0;
  for (let i = 0; i < entries.length; i++) {
    const row = /^([0-9a-f]{40,64}) (commit|tree|blob|tag) (\d+)$/.exec(sizes[i] ?? '');
    if (!row || row[1] !== entries[i].sha) throw new Error('Git object verification failed.');
    if (row[2] !== 'blob') continue;
    const entry = entries[i];
    const size = Number(row[3]);
    if (size > maxObjectBytes && entry.path === 'runtime/node.exe' && size < 99 * 1024 * 1024) {
      // Pinned Node runtime, verified by tests/mcp-wiring.test.mjs SHA-256 and release provenance.
      skippedBinary++;
      continue;
    }
    if (size > maxObjectBytes) {
      failures.push('Unreviewed oversized historical blob: ' + entry.sha.slice(0, 12) + ' (' + size + ' bytes)');
      continue;
    }
    const bytes = git(['cat-file', 'blob', entry.sha], undefined, maxObjectBytes + 1024);
    if (bytes.includes(0)) { skippedBinary++; continue; }
    inspected++;
    // The scanners themselves contain secret pattern literals; scanning them produces false positives.
    if (entry.path.endsWith('scripts/security-audit.mjs') || entry.path.endsWith('scripts/history-audit.mjs')) continue;
    const text = bytes.toString('utf8');
    if (knownSecrets.some((pattern) => pattern.test(text))) {
      failures.push('Potential sensitive token in historical blob ' + entry.sha.slice(0, 12) + (entry.path ? ' (' + entry.path + ')' : ''));
    }
  }

  if (failures.length) {
    for (const issue of [...new Set(failures)]) process.stderr.write('[history-security] ' + issue + '\n');
    process.exitCode = 1;
  } else {
    process.stdout.write('History audit OK: ' + entries.length + ' reachable objects, ' +
      inspected + ' readable text blobs examined, ' + skippedBinary + ' binary blobs skipped. Heuristic scan only.\n');
  }
} catch (error) {
  process.stderr.write('[history-security] ' + error.message + '\n');
  process.exitCode = 1;
}
