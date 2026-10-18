---
name: setup
description: Inspect the QuotaPilot host and configure a native status line only after explicit user authorization.
---

# QuotaPilot host-aware setup

**Do not conflate ChatGPT Desktop, Codex CLI and Claude Code.**

## ChatGPT Desktop / ChatGPT Work (default when invoked from ChatGPT)

**NO-INSTALL, NO-WRITE PATH.** Follow [ChatGPT HUD onboarding](../chatgpt-hud/SKILL.md) and call only the already available read-only MCP tools `get_overview` and `open_hud`. If unavailable, report that local execution is not connected. **Do not** invoke `scripts/agent-bootstrap.ps1`, `scripts/agent-bootstrap.sh`, `scripts/install-codex-hud.mjs`, `scripts/install-claude-hud.mjs`, or modify `config.toml` or `.quotapilot`. No combined network/write permission requests and no retry loop after Access Denied.

## Codex CLI (only when user explicitly requests a Codex CLI footer)

Verify local Codex CLI environment and the user's explicit consent to modify `~/.codex/config.toml`. Agent bootstrap requires `--host codex` (PowerShell: `-HostType Codex`) to fail closed for accidental calls. Use the native plugin UI to install and, separately, run `scripts/install-codex-hud.mjs` only if a persistent footer was requested. Preserve existing configuration; never infer this authorization from ChatGPT plugin install.

## Claude Code (only when user explicitly requests its status line)

Verify a local Claude Code environment. Bootstrap requires `--host claude` (PowerShell: `-HostType Claude`). Trust the native Claude plugin hook when the user consents; preserve custom statusLine entries.

## Verification and privacy

Show usage, remaining and reset only when provided by the real provider; estimates require sufficient samples. Do not request credentials, tokens, prompts, transcripts or source files. Technical JSON schema is language-neutral; communicate in English or Spanish matching the user. If a host capability is missing, stop without pretending to have installed QuotaPilot.
