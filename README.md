# QuotaPilot

Persistent, local-first usage HUD for Codex, ChatGPT Desktop and Claude Code.

`quota-pilot` is the stable technical package/repository ID. The **visible HUD name is host-aware by default**: it renders as **ChatGPT**, **Codex**, or **Claude Code** according to where the plugin is running, with **AI Usage** only as a fallback when the host cannot be identified.

The plugin reads usage from the user's locally authenticated coding agents and keeps **used quota, remaining quota and reset timing** visible in the best native surface each host supports.

## Surfaces

- **ChatGPT Desktop:** the HUD is visibly branded **ChatGPT**, requests **picture-in-picture (PiP)** automatically when opened, and refreshes every 30 seconds while mounted.
- **Claude Code:** persistent custom `statusLine` visibly branded **Claude Code**, showing 5h/7d used, remaining and reset countdowns.
- **Codex CLI:** the host is identified as **Codex** and its native TUI footer automatically includes the built-in `five-hour-limit` and `weekly-limit` items while preserving existing footer items. Exact reset timestamps remain available through the plugin/`/status` because Codex does not currently expose reset time as a persistent custom footer token.

## What the HUD shows

- **USED** — provider-reported percentage consumed.
- **REMAINING** — provider-reported or directly derived percentage left.
- **RESET** — countdown when the provider/host exposes `resetsAt`.
- Optional intelligence: burn rate, runway, predicted dead/idle time and risk.

## Privacy

The plugin is local-first.

- No separate product account.
- No Supabase or usage database required.
- Provider credentials remain owned by Codex/Claude Code.
- Claude snapshots contain only minimized usage telemetry; session IDs, cwd, transcript paths, prompts, responses and source code are excluded.
- Tools are read-only.

## Installation behavior

The repository packages lifecycle hooks for the desktop/local environments.

On first trusted session:

1. Codex configures its native footer automatically.
2. Claude Code installs the local status-line runtime into `~/.quotapilot/` if there is no conflicting custom status line.
3. ChatGPT can open `open_hud`; the widget requests PiP immediately.

Hosts intentionally require users to review/trust local lifecycle hooks. The plugin does not bypass that security control.

## MCP tools

- `open_hud()` — open the live usage HUD.
- `get_usage(provider)` — read one provider.
- `get_overview()` — compare available providers.

## Development

No runtime npm packages are required.

```bash
npm test
npm run check
node server/index.mjs
```

The local MCP server is configured by `mcp.json` and runs over stdio.

## Current limitation

ChatGPT PiP is persistent **within the active ChatGPT conversation/session** after the HUD is opened. ChatGPT does not currently allow a third-party plugin to install a global overlay that floats over every screen before any plugin UI has been invoked.

Codex similarly does not expose arbitrary third-party floating UI inside its TUI; the plugin uses the persistent native footer instead.


## Branding behavior

No branding setup is required after installing from GitHub.

- ChatGPT MCP App bridge present → visible name: `ChatGPT`
- MCP client identifies Codex or Codex plugin environment is present → visible name: `Codex`
- MCP client identifies Claude or `CLAUDE_PLUGIN_ROOT` is present → visible name: `Claude Code`
- Unknown host → visible fallback: `AI Usage`

The technical IDs `quota-pilot`, `ui://quotapilot/live.html`, and `~/.quotapilot/` remain stable on purpose so upgrades do not break installed configurations.


## Security posture (v0.4.0)

The default runtime is dependency-free and local-only. It has no HTTP client or telemetry path, the widget CSP allows no external connections/resources, MCP tools are read-only, provider errors are redacted, inputs are bounded/validated, and local snapshots/config writes use private atomic filesystem operations.

Run the complete local gate with:

```bash
npm run check
```

See `SECURITY.md` and `docs/SECURITY-AUDIT-2026-10-17.md` for threat model, findings, controls and residual risks.
