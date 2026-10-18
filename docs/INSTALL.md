# Installation, upgrade and removal

**Status: private preview.** Obtain authorized access to the private GitHub repository first. Node.js >=22.13 is required. Review the scripts before running them; they change local host settings. No npm install is needed.

```bash
git clone git@github.com:csecurh/quota-pilot.git
cd quota-pilot
npm run check
npm run doctor
```

## Claude Code (supported local installer)

From checkout: `node scripts/install-claude-hud.mjs`. It writes a standalone status-line script and filesystem helper to `~/.quotapilot/` and sets a `statusLine` command in `~/.claude/settings.json` if a different custom status line is not configured. Restart Claude Code. Confirm five-hour/seven-day used/remaining/reset values in the native status line when Claude supplies these fields.

Marketplace installation may additionally be possible in compatible Claude builds using the bundled `.claude-plugin/marketplace.json`; this is not an independently verified release-channel guarantee.

## Codex CLI (supported local installer)

From checkout: `node scripts/install-codex-hud.mjs`. The script conservatively updates `[tui].status_line` inside `~/.codex/config.toml`, preserving other keys and user entries, and refuses ambiguous TOML rather than rewriting it. Restart Codex. Confirm `five-hour-limit` and `weekly-limit` in the native footer. Codex cannot show an arbitrary reset countdown persistently there; use `/status` or a compatible MCP tool invocation.

## ChatGPT Desktop (experimental host-dependent integration)

The server requires a ChatGPT Desktop build or compatible host that can execute **local stdio MCP Apps** and expose the `window.openai` host bridge. Configure the local command `node /absolute/path/to/quota-pilot/server/index.mjs` according to the host's own settings, then invoke the read-only MCP `open_hud` tool. The rendered widget requests PiP and refreshes while mounted. If your ChatGPT installation exposes only the public app directory or remote connectors, **there is no validated one-command installation path** for this repo.

Do not claim the widget overlays other applications, persists beyond the active conversation, or auto-installs from a GitHub link.

## Updating

Within the authorized checkout: `git pull --ff-only`; `npm run check`; `npm run doctor`; rerun the appropriate installer. Restart the host. Prefer an audited commit SHA when risk-sensitive. The Codex installer is idempotent for already-supported status line syntax.

## Removing

- **Codex:** edit `~/.codex/config.toml` and remove the added `five-hour-limit` / `weekly-limit` entries from `[tui].status_line` if no longer wanted. Keep other user entries.
- **Claude Code:** remove the `statusLine` entry **only if it points to** `~/.quotapilot/claude-statusline.mjs`. Then remove `~/.quotapilot/` **only if you have checked that it contains no data you wish to keep**.
- **ChatGPT or other MCP host:** remove the quota-pilot local MCP registration in the host settings. The plugin itself does not hold provider credentials.

## Local diagnostics

Run `node scripts/doctor.mjs` or `node scripts/doctor.mjs --json`. This checks local host configuration and minimal snapshot freshness without printing private paths, tokens or configuration values. It does **not** authenticate to providers, contact the network or prove that ChatGPT Desktop has a compatible local plugin bridge.

## Troubleshooting

| Symptom | Explanation / action |
| --- | --- |
| No metrics | Confirm the provider is locally authenticated; quota responses are host-dependent. Missing fields intentionally display a dash rather than fabricated data. |
| No Claude line | Check whether an existing `statusLine` is present; QuotaPilot refuses to overwrite a different custom command. Restart the host. |
| Codex installer rejects TOML | It deliberately does not rewrite complex/multiline/ambiguous status arrays; edit manually or use supported inline array syntax after backing up the file. |
| ChatGPT does not show an install option | Local MCP Apps are host/build-dependent. Public ChatGPT app-directory availability is not part of this preview. |
| Forecast is blank | Pacing needs two distinct observations at least five minutes apart; no historical records are uploaded or stored. |
| PiP unavailable | The host may not support or grant PiP. The widget can still render inline where permitted. |

Never paste API keys, OAuth tokens, prompts or transcript paths into an issue. Report suspected security defects privately following SECURITY.md.
