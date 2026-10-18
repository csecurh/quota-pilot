# QuotaPilot

**Language / Idioma: English · [Español](README.es.md)**

**Know your AI limits before they interrupt your work.**

**License: [MIT](LICENSE)** · Copyright © 2026 Cibersecurity-H

[![CI](https://github.com/csecurh/quota-pilot/actions/workflows/ci.yml/badge.svg)](https://github.com/csecurh/quota-pilot/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

QuotaPilot is an **open-source, local-first AI usage HUD** for Codex, Claude Code and compatible ChatGPT Desktop plugin hosts. Its visible name matches your host (**Codex**, **Claude Code**, **ChatGPT**; fallback **AI Usage**). The technical package ID remains `quota-pilot`.

> **Public source · 0.5.0 release candidate.** Automated checks are green; **real-host installation and PiP compatibility are awaiting user testing**. This repo is not yet listed in the universal ChatGPT/Codex Plugins Directory.

![Illustration of the local usage HUD, with synthetic metrics](docs/assets/hud-preview.svg)

The HUD provides provider-reported **used**, **remaining** and **reset time**, plus **burn rate**, **estimated runway** and **visual quota alerts** when enough telemetry exists. Forecasts are estimates—not billing, guaranteed provider limits or desktop-wide notifications. Unknown data is shown as unavailable.

## Install

**Requirements:** Node.js **22.13+**, Git, and the relevant host installed. Codex/Claude quota data requires a provider already authenticated through its own application. **No npm install, QuotaPilot account or API key is required.** Review any host's local hook/trust prompt before authorizing changes.

| Host | Start here | Persistent surface |
|---|---|---|
| **Claude Code** | Open Claude Code and run `/plugin marketplace add csecurh/quota-pilot`, then `/plugin install quota-pilot@ai-usage` | Claude Code's native status line after a new trusted session |
| **Codex CLI** | In your terminal: `codex plugin marketplace add csecurh/quota-pilot`; open `codex` → `/plugins` → marketplace **AI Usage** → install **quota-pilot** | Codex's native 5-hour / weekly footer |
| **ChatGPT Desktop** | In a compatible local plugin host, add `csecurh/quota-pilot` as a Codex marketplace, restart Desktop, then find **AI Usage** in Plugins and install **quota-pilot** | Conversation-scoped HUD; it **requests** PiP where supported |

**On Windows:** if PowerShell shows `CommandNotFoundException` for `codex`, the CLI is missing or not on `PATH`. [Install the official Codex CLI and diagnose Windows](docs/INSTALL.md#windows-when-powershell-cannot-find-codex). The ChatGPT Desktop Plugins browser does not itself require that terminal command.

**ChatGPT compatibility is experimental:** the desktop host must support local plugin execution, stdio MCP Apps and the MCP App UI bridge. A GitHub repository is not the same as a published universal ChatGPT app. There is no guaranteed global floating overlay, automatic availability in web/mobile ChatGPT, or universal directory listing. [OpenAI's marketplace/plugin guidance](https://developers.openai.com/plugins/build/plugins) explains the local installation model.

**Alternative direct installers** (useful when a marketplace is not supported):

~~~sh
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
npm run check
node scripts/install-claude-hud.mjs  # Claude Code ONLY
# or:
node scripts/install-codex-hud.mjs   # Codex CLI ONLY
npm run doctor
~~~

Run **only the script for your host**. Restart the corresponding host afterward; a custom Claude status line will not be overwritten. The Codex footer relies on native tokens and cannot show arbitrary exact-reset custom fields.

See [installation, troubleshooting, update and removal](docs/INSTALL.md) and the [real-host test guide](docs/HOST-TEST-PLAN.md).

## Language / Idioma

The ChatGPT widget automatically chooses **English or Spanish** from the system language, with an **EN / ES** toggle in the HUD. Claude Code's status line and the local doctor follow the OS language; set `QUOTAPILOT_LANG=en` or `QUOTAPILOT_LANG=es` on the local process to override. Data keys and snapshot schemas remain language-neutral. [Documentación en español](README.es.md).

## What you get

- **Local usage windows:** provider-reported percentages and reset deadlines; Claude 5-hour and 7-day windows when supplied.
- **Pacing intelligence:** burn %/h, runway and estimated time without quota; only after at least two readings separated by five minutes.
- **Local visual alerts:** low (20% remaining), critical (10%), and predicted exhaustion before reset. **No OS-level push alerts.**
- **Host-native UI:** Claude Code status line, Codex footer and an MCP App HUD requesting PiP in compatible ChatGPT sessions.
- **Privacy-first:** no QuotaPilot telemetry backend, no runtime npm dependencies, no direct widget network requests, no credentials requested or stored.

## Privacy and security

The MCP server runs **locally over stdio**. Codex supplies rate-limit windows through its local app-server; Claude supplies selected status-line usage fields. The minimized Claude snapshot at `~/.quotapilot/claude-latest.json` contains percentages, reset windows and timestamps only. The plugin never intentionally saves prompts, responses, transcripts, working-directory paths, source code, session/model IDs or credentials. Host applications and provider binaries independently control their own network connections.

[Privacy FAQ](docs/PRIVACY.md) · [Security policy](SECURITY.md) · [Threat model](docs/THREAT-MODEL.md) · [Report a vulnerability](SECURITY.md#reporting-a-vulnerability)

## Develop and verify

~~~sh
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
npm run check
npm run doctor
npm run security:history
~~~

The historical scan requires a **full, non-shallow** Git checkout and is heuristic. CI runs Node tests on Ubuntu, macOS and Windows plus a historical scan on Ubuntu. `node server/index.mjs` starts a stdio MCP server; it **does not open a browser**.

Read-only MCP tools: `open_hud()`, `get_usage({provider:"codex"|"claude_code"})`, `get_overview()`. Technical IDs remain stable even as the host-facing HUD name changes.

## Project status

**Public GitHub source, MIT licensed, release-candidate compatibility.** The illustration above uses **synthetic sample data**, not a real installed screenshot. The source is freely available; inclusion in any public plugin directory requires a separate review/submission process. [Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [Support](SUPPORT.md) · [Release evidence](docs/RELEASE-VALIDATION.md) · [Release checklist](docs/RELEASE-CHECKLIST.md) · [MIT notice](docs/LICENSE-DECISION.md).

**Copyright © 2026 Cibersecurity-H.** Licensed under [MIT](LICENSE).
