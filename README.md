# QuotaPilot

Local-first usage intelligence for Codex and Claude Code.

QuotaPilot is designed as a portable Agent Plugin + MCP server. It reads usage from the user's locally authenticated coding agents and exposes read-only tools for quota, reset windows, burn rate, estimated runway and predicted dead/idle time.

## Product surfaces

- **ChatGPT / Codex:** portable Agent Plugin with a local stdio MCP server. OpenAI currently classifies local MCP plugins as desktop-only for directory submission; local/private marketplaces are supported for development and private distribution.
- **Claude Code:** the same MCP server can be attached locally, with a status line adapter planned for persistent terminal visibility.
- **MCP Apps UI:** one reusable widget surface for compatible MCP Apps hosts.

## Privacy model

QuotaPilot is local-first. No usage database or vendor cloud is required. Provider credentials remain owned by Codex/Claude Code; QuotaPilot reads only local usage telemetry and derived metrics.

## Initial tools

- `get_usage(provider)`
- `get_overview()`

Derived metrics are estimates and are labeled separately from provider-reported quota values.

## Development

```bash
npm install
npm test
npm start
```

The `mcp.json` file launches the local server through stdio when installed as a desktop plugin.

## Repository status

This scaffold is the clean V2 base. It intentionally does not copy the Expo/Supabase architecture from the V1 repository.
