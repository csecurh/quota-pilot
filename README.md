# QuotaPilot

**Know your AI limits before they interrupt your work.**

A privacy-first, local usage HUD for **ChatGPT Desktop, Codex CLI and Claude Code**. See quota **used · remaining · reset**, plus advisory **burn rate, runway and predicted time without quota** when enough data is available.

> **Private preview:** this repository currently requires authorized GitHub access. This is NOT a publicly listed ChatGPT app. No public launch is claimed.

![Illustrative HUD preview](docs/assets/hud-preview.svg)

**Why it helps:** stop guessing when your coding agent's rate limit resets, estimate whether current consumption can last until the reset, and keep that information near your work. No separate product account, no Supabase setup, no QuotaPilot telemetry server, no runtime npm dependencies.

## Get started

**Requirements:** Node.js 22.13+; a compatible local host and an authenticated, locally installed Codex and/or Claude Code provider. Clone access is required during the private preview.

```bash
git clone git@github.com:csecurh/quota-pilot.git
cd quota-pilot
npm run check
```

Choose the host below. These are **local installation paths**, not a claim of universal marketplace availability:

| Host | Setup | Where the information appears |
| --- | --- | --- |
| Claude Code | `node scripts/install-claude-hud.mjs` | Native persistent Claude Code status line |
| Codex CLI | `node scripts/install-codex-hud.mjs` | Native persistent Codex footer |
| ChatGPT Desktop | Requires a host build supporting local stdio MCP Apps; configure `node /absolute/path/to/quota-pilot/server/index.mjs` as a local MCP server and invoke `open_hud` | Conversation-scoped ChatGPT HUD requesting PiP |

For host marketplace and lifecycle hook support, consult [installation and troubleshooting](docs/INSTALL.md). **Do not assume ChatGPT Desktop exposes arbitrary local plugins or a global HUD**. If your host does not support a local MCP Apps bridge, that integration cannot be installed via ChatGPT's public app directory.

**Claude Code:** the installer safely leaves a pre-existing different status line untouched. When run from this checkout, it installs a standalone helper and an opt-in command in `~/.claude/settings.json`. Restart the host.

**Codex:** the installer preserves existing TOML and adds `five-hour-limit` and `weekly-limit` to `[tui].status_line`. Restart Codex. Codex's native footer does not expose a custom persistent exact-reset token; use `/status` or MCP tools when available.

**To validate:**
```bash
npm run check
node server/index.mjs
```
The last command starts the **stdio MCP server** and waits for a client; it is not a browser UI. See [docs/INSTALL.md](docs/INSTALL.md) for uninstall, upgrades and common failures.

## Key capabilities

- **Native surfaces:** ChatGPT conversation PiP request, Claude Code status line and Codex footer. Each visible HUD uses **ChatGPT / Claude Code / Codex**, with **AI Usage** as fallback.
- **Quota windows:** used, remaining and reset (if supplied by the provider), including Claude five-hour/seven-day windows.
- **Pacing estimates:** in-memory burn rate (%/hour), projected runway, and potential gap before reset when there are sufficient observations; values otherwise display **—**.
- **Local visual alerts:** 20% low, 10% critical, or estimated depletion ahead of reset. These are **in-widget indicators**, not operating-system push notifications.
- **Privacy by design:** read-only MCP tools; no external widget connections; minimized private Claude snapshot; provider credentials remain with provider applications.

## What it looks like

The SVG above is an **illustration with synthetic sample data**, not a screenshot or proof of live provider availability. Actual metrics depend on local provider support. Predictive numbers are estimates, not promises.

## Data and security

QuotaPilot accesses the local Codex rate-limit interface and selected usage fields from Claude Code's status-line input. A minimized Claude snapshot lives at `~/.quotapilot/claude-latest.json` with private permissions. **No credentials, prompts, responses, transcripts, source code, session IDs, cwd paths or provider cost details are stored by this plugin.** The externally installed provider/host maintains its own data and network policies. See [SECURITY.md](SECURITY.md), [threat model](docs/THREAT-MODEL.md) and [privacy FAQ](docs/PRIVACY.md).

## MCP interface

`open_hud()` · `get_usage({provider:"codex"|"claude_code"})` · `get_overview()`

The protocol is local stdio. Hardening: bounded inputs, generic public errors, strict arguments, no widget `innerHTML`, restrictive CSP, private filesystem operations, CI SHA pinning.

## Project status and contributing

This repository is **private preview**, under active compatibility testing. See [release readiness](docs/RELEASE-CHECKLIST.md). No public release, registration in ChatGPT's directory or guarantee of every host's plugin API is implied. Security disclosures: [SECURITY.md](SECURITY.md).

For development, run `npm test`, `npm run check`, or `npm run security:audit`. No runtime npm packages are needed. Technical IDs such as `quota-pilot` and `ui://quotapilot/live.html` intentionally stay stable.
