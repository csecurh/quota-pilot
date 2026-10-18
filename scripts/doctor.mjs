#!/usr/bin/env node
// Local, read-only preflight. Never prints config contents or filesystem paths.
import { homedir } from 'node:os';
import { join } from 'node:path';
import { readSafeText } from './secure-fs.mjs';

const requestedLanguage = process.env.QUOTAPILOT_LANG;
const language = requestedLanguage === 'es' || requestedLanguage === 'en'
  ? requestedLanguage : (Intl.DateTimeFormat().resolvedOptions().locale.toLowerCase().startsWith('es') ? 'es' : 'en');
const text = language === 'es'
  ? { header: 'AI Usage — diagnóstico local', node: 'Node compatible', claude: 'Claude Code', codex: 'Codex', chatgpt: 'ChatGPT', snapshot: 'Snapshot de Claude', yes: 'sí', no: 'no', private: 'No se muestran credenciales, rutas ni datos del proveedor.' }
  : { header: 'AI Usage — local diagnostics', node: 'Node supported', claude: 'Claude Code', codex: 'Codex', chatgpt: 'ChatGPT', snapshot: 'Claude snapshot', yes: 'yes', no: 'no', private: 'No credentials, file paths or provider data displayed.' };

if (process.argv.slice(2).some((arg) => arg !== '--json')) {
  process.stderr.write('Usage: node scripts/doctor.mjs [--json]\n');
  process.exitCode = 2;
} else {
  const report = {
    product: 'quota-pilot',
    node: { version: process.versions.node, supported: Number(process.versions.node.split('.')[0]) >= 22 },
    surfaces: { claude_code: 'not-configured', codex: 'not-configured', chatgpt: 'host-dependent' },
    localSnapshot: 'not-found',
    notes: [
      'Host credentials stay with Codex/Claude Code.',
      'ChatGPT requires an independently compatible local MCP Apps host.',
      'No network requests were made by this diagnostic.',
    ],
  };

  try {
    const raw = await readSafeText(join(homedir(), '.claude', 'settings.json'), { allowMissing: true, maxBytes: 512 * 1024 });
    if (raw) {
      const settings = JSON.parse(raw);
      const status = settings?.statusLine;
      report.surfaces.claude_code =
        status?.type === 'command' && typeof status.command === 'string' && status.command.includes('claude-statusline.mjs')
          ? 'configured' : 'custom-or-missing';
    }
  } catch { report.surfaces.claude_code = 'unreadable-or-unsafe'; }

  try {
    const raw = await readSafeText(join(homedir(), '.codex', 'config.toml'), { allowMissing: true, maxBytes: 1024 * 1024 });
    if (raw) {
      const match = /^\s*status_line\s*=\s*\[([^\]\r\n]*)\]/m.exec(raw);
      const items = match?.[1] ?? '';
      report.surfaces.codex = /["']five-hour-limit["']/.test(items) && /["']weekly-limit["']/.test(items)
        ? 'configured' : 'custom-or-missing';
    }
  } catch { report.surfaces.codex = 'unreadable-or-unsafe'; }

  try {
    const raw = await readSafeText(join(homedir(), '.quotapilot', 'claude-latest.json'), {
      allowMissing: true, requirePrivate: true, maxBytes: 64 * 1024,
    });
    if (raw) {
      const snapshot = JSON.parse(raw);
      const age = Date.now() - Date.parse(snapshot?.capturedAt);
      report.localSnapshot = snapshot?.provider === 'claude_code' && Number.isFinite(age) && age >= 0 && age <= 30 * 60 * 1000
        ? 'fresh' : 'stale-or-invalid';
    }
  } catch { report.localSnapshot = 'unreadable-or-unsafe'; }

  if (process.argv.includes('--json')) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else {
    process.stdout.write(text.header + '\n');
    process.stdout.write(text.node + ': ' + (report.node.supported ? text.yes : text.no) + '\n');
    process.stdout.write(text.claude + ': ' + report.surfaces.claude_code + '\n');
    process.stdout.write(text.codex + ': ' + report.surfaces.codex + '\n');
    process.stdout.write(text.chatgpt + ': ' + report.surfaces.chatgpt + '\n');
    process.stdout.write(text.snapshot + ': ' + report.localSnapshot + '\n');
    process.stdout.write(text.private + '\n');
  }
  if (!report.node.supported) process.exitCode = 1;
}
