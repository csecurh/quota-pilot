---
name: setup
description: Activate the persistent host-branded usage HUD for ChatGPT, Codex and Claude Code.
---

Configure the plugin as a local-first usage HUD whose visible name matches the current host. Do not ask the user to create a QuotaPilot account, paste provider credentials, or configure a cloud backend.

The MCP server has no runtime npm dependencies.

For a user who pastes the GitHub URL and asks for installation, read [AGENTS.md](../../AGENTS.md). Only after proving you have a shell **on the user's machine** (not a ChatGPT Work cloud computer) and a supported local plugin registration API, review and execute `scripts/agent-bootstrap.ps1` (Windows) or `scripts/agent-bootstrap.sh` (macOS/Linux). The scripts download verified SHA-256 pinned releases under the user's profile with no separately installed Node/npm. Then register the **resulting local plugin folder** using supported host features and verify the native surface. Request normal host authorization; do not bypass hook trust. If you operate only in a cloud environment or the host lacks local stdio execution, report the limitation rather than claiming success.

### ChatGPT Desktop permission boundary

For ChatGPT Desktop, use read-only `open_hud` / `get_overview` if those tools are already available. Do **not** call `scripts/install-codex-hud.mjs`, edit `config.toml`, touch `~/.codex` or `~/.claude`, or request a broad combined Internet-and-filesystem permission. The shared OpenAI hook is deliberately side-effect-free. Ask for narrowly scoped permissions only after proving that the local plugin manager can register this package **on the user's actual computer**. A cloud-only ChatGPT session cannot install into local Windows.

For Codex CLI, native footer installation is a separate opt-in requiring explicit permission to edit Codex TOML. Do not infer this consent from permission to install a plugin.

When QuotaPilot is installed:

1. Use an approved host-native installer only for the host-specific surface. The shared OpenAI SessionStart hook is no-op and must not change files. Never present "QuotaPilot" as the default visible HUD name; use ChatGPT, Codex, or Claude Code according to the host.
   - Codex: ensure the native TUI footer contains `five-hour-limit` and `weekly-limit` while preserving the user's existing footer entries.
   - Claude Code: install the local Claude Code `statusLine` when the user does not already have a different custom status line.
2. If the host asks the user to review/trust the plugin hook, explain that this is required by the host before local lifecycle hooks can run. Do not bypass the trust prompt.
3. In ChatGPT, call the read-only `open_hud` tool after setup. Its MCP App requests picture-in-picture automatically and refreshes `get_overview` every 30 seconds while the widget remains mounted.
4. Verify that the visible surface shows:
   - percentage used,
   - percentage remaining,
   - time until reset when the host/provider exposes a reset timestamp.
5. For Codex, be explicit that the native footer currently exposes the 5-hour and weekly remaining percentages, while exact reset timestamps are available through QuotaPilot tools/`/status` rather than a custom persistent footer token.
6. For Claude Code, the status line receives provider rate-limit data directly and writes a privacy-minimized snapshot to `~/.quotapilot/claude-latest.json` for local MCP reuse.
7. Never request or copy provider passwords, session tokens, prompts, responses, transcripts, working-directory paths, or source code.

After setup, prefer keeping the HUD visible instead of requiring the user to ask for usage repeatedly.

## Language / Idioma

Match the user's language (English or Spanish) when describing setup and quota estimates. The HUD offers an EN/ES selector and starts from the host/system language. For Claude Code status-line text or CLI diagnostics, a process-local `QUOTAPILOT_LANG=en` or `QUOTAPILOT_LANG=es` override is available. The underlying quota JSON keys and filesystem snapshots are never translated.

Responde en español cuando el usuario escriba en español. Conserva nombres técnicos y comandos sin traducir. No inventes cuotas ni datos de reinicio cuando falten. El widget permite elegir EN/ES y la barra de Claude Code puede usar `QUOTAPILOT_LANG`.
