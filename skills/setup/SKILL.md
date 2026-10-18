---
name: setup
description: Activate the persistent host-branded usage HUD for ChatGPT, Codex and Claude Code.
---

Configure the plugin as a local-first usage HUD whose visible name matches the current host. Do not ask the user to create a QuotaPilot account, paste provider credentials, or configure a cloud backend.

The MCP server has no runtime npm dependencies.

When QuotaPilot is installed:

1. Let the bundled SessionStart hook configure the host-native persistent surface. Never present "QuotaPilot" as the default visible HUD name; use ChatGPT, Codex, or Claude Code according to the host.
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
