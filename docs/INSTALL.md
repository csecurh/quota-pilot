# Install QuotaPilot (public source, release candidate)

**Language / Idioma: English · [Español](es/INSTALL.md)**

QuotaPilot is published as source under [MIT](../LICENSE). **The GitHub repository is public; the plugin has not been admitted to the universal ChatGPT/Codex directory.** Automated CI does not replace real host tests.

## Preferred: agent-first installation

Share **https://github.com/csecurh/quota-pilot** with a locally executing agent and ask it to follow [AGENTS.md](../AGENTS.md) and [agent installation](AGENT-INSTALL.md). The agent handles runtime preparation and registration without asking you to download ZIPs or install Node/npm. Permission and restart dialogs depend on the host.

## Alternative: portable package

Download the self-contained package from [GitHub Releases](https://github.com/csecurh/quota-pilot/releases/tag/v0.6.0-rc.2) and register the extracted folder with your compatible plugin host. The archive contains its own runtime. See [PORTABLE.md](PORTABLE.md) for platform selection, integrity checks and host limitations.

## Prerequisites (source installation only)

- Node.js **22.13+**, Git, a compatible host and (for live quotas) a locally authenticated Codex and/or Claude Code provider.
- No `npm install`, Supabase project, cloud account or new provider token.
- Local plugin hooks may change host settings after host trust approval. Review the scripts before proceeding.

## Claude Code via marketplace

In a current Claude Code session, run:

~~~text
/plugin marketplace add csecurh/quota-pilot
/plugin install quota-pilot@ai-usage
~~~

Restart Claude Code, accept/trust the local hook according to Claude's prompt, and look for **Claude Code** 5h/7d used/remaining/reset values in its status line. The technical marketplace identity was previously `ai-usage-private` in pre-public 0.5.0-rc builds; remove/re-add the old marketplace if upgrading from that build.

**Fallback direct setup:**

~~~sh
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
node scripts/install-claude-hud.mjs
node scripts/doctor.mjs
~~~

The installer copies the status-line helper into `~/.quotapilot/` and updates `~/.claude/settings.json` only when there is no conflicting custom status line. Restart Claude Code afterward.

## Windows: when PowerShell cannot find `codex`

**ChatGPT Desktop does not automatically install the Codex CLI command.** If PowerShell reports `CommandNotFoundException` for `codex plugin marketplace ...`, the marketplace command was **not executed**. Open **regular, non-administrator PowerShell** and check:

```powershell
node --version
npm --version
Get-Command codex -ErrorAction SilentlyContinue
```

If Codex CLI is missing but Node/npm are installed, install **Codex CLI (separate from QuotaPilot)** from the official distribution:

```powershell
npm install -g @openai/codex
```

Close and reopen PowerShell, then run `codex --version`. If Windows npm installation fails, use the [official native OpenAI installer documentation](https://github.com/openai/codex#installing-and-running-codex-cli), not binaries from third parties. Review the source and contents of any remote installer script before executing it.

**Only after** `codex --version` succeeds:

```powershell
codex plugin marketplace list
codex plugin marketplace add csecurh/quota-pilot
codex plugin marketplace upgrade ai-usage
```

A compatible ChatGPT Desktop version may install marketplace plugins directly from its **Plugins** UI, even when Codex CLI is not configured. Try updating/reinstalling from **Plugins → Installed / AI Usage** and restarting Desktop first. Plugins load cached installed copies and do not refresh automatically when GitHub changes. Codex CLI is useful both for terminal marketplace management and providing an executable for local quota queries, but installing it alone **does not guarantee** MCP widget execution by the host.

## Codex CLI marketplace

~~~sh
codex plugin marketplace add csecurh/quota-pilot
codex plugin marketplace list
codex
~~~

In Codex run `/plugins`, choose **AI Usage → quota-pilot → Install**, then start a new trusted session. If the host supports the declared lifecycle hook, the native footer includes **five-hour-limit** and **weekly-limit**. If not, run the direct installer below. Codex does not expose a custom exact-reset persistent footer token; look at its `/status` view or `get_usage` MCP tool for fuller readings.

~~~sh
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
node scripts/install-codex-hud.mjs
node scripts/doctor.mjs
~~~

The direct installer modifies only supported inline entries in `[tui].status_line` within `~/.codex/config.toml` and refuses ambiguous TOML instead of rewriting unrelated configuration.

## ChatGPT Desktop — experimental, pending host smoke test

The current [OpenAI plugin packaging guide](https://developers.openai.com/plugins/build/plugins) supports Git/local marketplaces on compatible desktop builds. To try it:

1. Install a compatible ChatGPT Desktop/Codex distribution with **local plugin execution**.
2. In the terminal run `codex plugin marketplace add csecurh/quota-pilot` if supported by your installed Codex CLI, or clone the repo and add its local marketplace root.
3. Restart the ChatGPT Desktop app; open **Plugins**, select the **AI Usage** marketplace and install **quota-pilot** if available.
4. Start a new conversation with the plugin enabled; ask: **“Abre mi HUD de uso de IA.”** The `open_hud` tool requests PiP; verify host permission and that `get_overview` refreshes the HUD while mounted.

If ChatGPT Desktop doesn't load the local MCP App bridge, this integration is **not yet supported on your build**. **Do not** expose the local stdio server on the public Internet or paste credentials into an untrusted MCP host. The official remote Custom MCP Server flow uses a URL and is not a direct substitute for this local-only stdio plugin.

## Updating and removing

Update a cloned checkout with `git pull --ff-only`, run `npm run check` and rerun only your host's direct installer, if you use one; restart the host. Marketplace installations can be refreshed through the host's marketplace UI.

- **Claude:** uninstall/disable in the plugin manager. For a *direct install*, remove `settings.statusLine` only when its command points to `~/.quotapilot/claude-statusline.mjs`; remove `~/.quotapilot/` only after inspecting its contents.
- **Codex:** uninstall/disable in `/plugins`. For a *direct install*, remove the added `five-hour-limit` and `weekly-limit` entries from `~/.codex/config.toml`, retaining all other footer items.
- **ChatGPT:** remove the local marketplace plugin entry or uninstall in Plugins. This plugin stores no provider credentials.

## Language preference

The HUD chooses English or Spanish using the host language; use **EN / ES** to change it during the conversation. The Claude Code status line and `npm run doctor` follow your operating-system locale. For explicit control, set `QUOTAPILOT_LANG=en` or `QUOTAPILOT_LANG=es` **in the process environment**. This preference does not enter snapshots or affect provider authorization.

## ChatGPT Desktop: `-32602 Invalid params`

If both `get_usage` and `open_hud` return JSON-RPC `-32602 Invalid params`, **update or reinstall the marketplace plugin to the latest commit**, then restart ChatGPT Desktop and start a **new conversation**. MCP hosts may attach reserved `params._meta` request metadata; older QuotaPilot servers incorrectly rejected that valid field. The updated runtime accepts metadata separately from tool arguments, without returning or persisting it.

If `get_usage` instead returns `codex usage is temporarily unavailable.` (as a tool result, not protocol `-32602`), MCP transport validation is working and the remaining problem concerns the locally accessible Codex provider. Run `npm run doctor` and `codex --version` locally; do **not** share credentials or private paths.

If `open_hud` succeeds but no widget appears, the host's MCP App/PiP support is a separate compatibility limitation.

## Diagnostics

~~~sh
npm run check
npm run doctor
node scripts/doctor.mjs --json
~~~

The doctor prints **statuses only**, not secrets, paths or settings. “not-configured” need not imply failure if that provider is not installed. Forecasts require separate readings at least five minutes apart. No provider metrics: authenticate in the native host first; do not paste a token into QuotaPilot.

## Report an issue or a security flaw

File a [public bug report](https://github.com/csecurh/quota-pilot/issues/new/choose) using only synthetic inputs and sanitized screenshots. Follow [SECURITY.md](../SECURITY.md) for **private vulnerability reporting**; do not put security exploits, tokens or personal data in a public issue.

[Host smoke-test checklist](HOST-TEST-PLAN.md).
