# QuotaPilot

Persistent, local-first usage HUD for Codex, ChatGPT Desktop and Claude Code.

QuotaPilot reads usage from the user's locally authenticated coding agents and keeps **used quota, remaining quota and reset timing** visible in the best native surface each host supports.

## Surfaces

- **ChatGPT Desktop:** MCP App HUD requests **picture-in-picture (PiP)** automatically when opened and refreshes every 30 seconds while mounted.
- **Claude Code:** persistent custom `statusLine` showing 5h/7d used, remaining and reset countdowns.
- **Codex CLI:** native TUI footer automatically includes the built-in `five-hour-limit` and `weekly-limit` items while preserving existing footer items. Exact reset timestamps remain available through QuotaPilot/`/status` because Codex does not currently expose reset time as a persistent custom footer token.

## What the HUD shows

- **USED** — provider-reported percentage consumed.
- **REMAINING** — provider-reported or directly derived percentage left.
- **RESET** — countdown when the provider/host exposes `resetsAt`.
- Optional intelligence from QuotaPilot: burn rate, runway, predicted dead/idle time and risk.

## Privacy

QuotaPilot is local-first.

- No QuotaPilot account.
- No Supabase or usage database required.
- Provider credentials remain owned by Codex/Claude Code.
- Claude snapshots contain only minimized usage telemetry; session IDs, cwd, transcript paths, prompts, responses and source code are excluded.
- Tools are read-only.

## Installation behavior

QuotaPilot packages lifecycle hooks for the desktop/local environments.

On first trusted session:

1. Codex configures its native footer automatically.
2. Claude Code installs the QuotaPilot status-line runtime into `~/.quotapilot/` if there is no conflicting custom status line.
3. ChatGPT can open `open_hud`; the widget requests PiP immediately.

Hosts intentionally require users to review/trust local lifecycle hooks. QuotaPilot does not bypass that security control.

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

Codex similarly does not expose arbitrary third-party floating UI inside its TUI; QuotaPilot uses the persistent native footer instead.
