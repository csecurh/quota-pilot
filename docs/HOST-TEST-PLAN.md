# Real-host smoke testing — no account data required

**Language / Idioma: English · [Español](es/HOST-TEST-PLAN.md)**

The GitHub repo is public, but installation and runtime behavior must be verified on **actual supported clients**. Use a synthetic sandbox or a test profile where possible. Do not upload tokens, prompts, source code, transcripts, private paths, sensitive logs or identifiers.

## Language / Idioma

Verify the widget's EN/ES toggle and the `QUOTAPILOT_LANG=en` / `QUOTAPILOT_LANG=es` overrides for local Claude/doctor output; machine-readable data remains unchanged.

## Baseline

1. Confirm Node.js 22.13+, current host versions, and `npm run check` passes.
2. Run `npm run doctor`; record **only sanitized status labels** and host versions.
3. Verify Codex and/or Claude Code are already authenticated **within their own application**. QuotaPilot must never request credentials.
4. Confirm the visible name is the host name, never QuotaPilot: **ChatGPT**, **Codex**, **Claude Code**, fallback **AI Usage**.
5. On every surface, check used, remaining, reset (when the host supplies it), unknown metric behavior, ≥5 minute sampling before forecasts, and that warnings are visual only.

## Claude Code

1. In Claude Code: `/plugin marketplace add csecurh/quota-pilot`, then `/plugin install quota-pilot@ai-usage`.
2. Open a new trusted Claude Code session. Verify status line appears and reflects provider data; check missing metrics remain dashes.
3. Verify `~/.quotapilot/claude-latest.json` permissions (0600 on POSIX), minimal fields and no session IDs/prompts/paths.
4. Confirm an unrelated custom statusLine isn't overwritten when the direct installer is invoked.
5. Upgrade, disable/uninstall the plugin and verify other Claude settings survive.

## Codex CLI

1. Run `codex plugin marketplace add csecurh/quota-pilot`, open `codex` → `/plugins`, install quota-pilot from AI Usage.
2. Open a new trusted session. Confirm footer contains `five-hour-limit` and `weekly-limit`; original user footer items remain intact.
3. Confirm exact resets through native `/status` or available MCP tools; do not expect arbitrary reset tokens in footer.
4. Update and uninstall/disable; ensure unrelated TOML remains untouched.

## ChatGPT Desktop (experimental)

1. Confirm ChatGPT Desktop provides a local plugin marketplace and eligible plugin execution. If not, record **UNSUPPORTED HOST**, not a QuotaPilot bug.
2. Add the Git/local marketplace as in [INSTALL.md](INSTALL.md); refresh/restart Desktop, install quota-pilot from AI Usage.
3. Start a new conversation; ask **“Abre mi HUD de uso de IA”**. Confirm that `open_hud` appears, that local tool calls work and that UI uses the ChatGPT title.
4. Confirm widget does **not** request network resources; test initial empty state, a provider availability change, refresh every 30 seconds, and opt-in PiP (if the host grants it).
5. Close the conversation; don't expect PiP to float globally across applications or persist forever.

## Evidence format (safe to share)

| OS | Host + version | Plugin commit/version | Installed? | Correct native surface? | Metrics? | Upgrade/uninstall? | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Example only | Claude Code (version redacted) | 0.6.0-rc.4 | Yes | Yes | Synthetic | Yes | PASS |

Only sanitized status labels and redacted screenshots should appear in any public issue.

## Self-contained release test

Download the platform archive from [PORTABLE.md](PORTABLE.md). Confirm the host uses the bundled runtime, not a system Node/npm, and that the source-mirror marketplace is not confused with the extracted local release. Repeat install, upgrade and uninstall with a fresh user profile.

## Agent-first test

Paste only the repo URL into a **local shell-capable agent** and ask it to install. Check it verifies the pinned bundle, registers the local marketplace, respects plugin trust, and doesn't ask the user to download archives or install Node manually. A cloud agent without access to the desktop must report a limitation, not claim success.

## ChatGPT Desktop: isolate installation from MCP activation (Windows x64)

**No Codex CLI setup, PowerShell, extra Node.js, ZIP, or filesystem permission is needed for this diagnostic.**

1. **Marketplace imported:** confirm AI Usage appears. This proves catalog discovery only.
2. **Plugin installed and enabled:** confirm quota-pilot and its skills appear. This does not prove local MCP execution.
3. **Correct source revision:** for a workspace GitHub import, use Admin console → Plugins → Marketplaces → **Sync now**; inspect its report. For an individually imported plugin, use its **Refresh** control if available. **Refresh plugin list** only refreshes the directory display; it does not fetch repository updates. A GitHub source pinned to a specific commit stays pinned until the source ref is changed. Do not remove the marketplace as a cache workaround. See https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github .
4. **Local execution:** reopen the actual ChatGPT Desktop app, start a new **local** desktop conversation (not a cloud Work task, web/mobile thread), select AI Usage and check whether the host makes `get_overview`, `get_usage`, and `open_hud` available. Mentioning a skill does not activate a missing MCP runtime.
5. **MCP connection:** if those tools are absent, record **MCP NOT CONNECTED**; do not call this a widget defect. Check the host's own plugin/server status or sanitized error details. Distinguish unsupported local executor, blocked executable launch, stale plugin revision, and MCP initialize failure. Do not claim a specific cause without host diagnostics.
6. **Tool and UI:** only after tools appear, invoke `get_overview` and `open_hud`. If the tool works but no UI appears, record **MCP CONNECTED / HUD UI NOT RENDERED** separately. Unknown provider quotas remain unavailable, never zero.

Source validation: `mcp.json` uses `./runtime/node.exe` with `cwd=${PLUGIN_ROOT}` and `server/index.mjs` under that root. The Windows CI test executes the bundled binary with an empty PATH and performs MCP initialize, tools/list and open_hud. That proves repository-side launch in CI, **not that the end user's Desktop session has started it**. Local stdio plugins require compatible desktop execution: https://developers.openai.com/plugins/deploy/desktop-only .
