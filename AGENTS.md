# QuotaPilot — installation and host safety rules

These instructions apply when someone pastes `https://github.com/csecurh/quota-pilot` into an agent and asks to use QuotaPilot. **A desktop window does not establish that this agent can write to the user's actual desktop filesystem.** The agent may be operating in a separate ChatGPT Work/cloud execution environment.

## Mandatory dispatch: determine which host is being configured

### ChatGPT Desktop / ChatGPT Work

**Read-only onboarding; NEVER execute an installer.** The root `plugin.json` invokes `skills/chatgpt-hud/SKILL.md`. Call existing `get_overview` and `open_hud` MCP tools if available. If they are not available, return a clear unavailable status; there is no authorized workaround by creating folders in the agent workspace.

- Do not run `scripts/agent-bootstrap.ps1` or `scripts/agent-bootstrap.sh`. They are explicitly gated for Codex CLI / Claude Code.
- Do not run `scripts/install-codex-hud.mjs`, `scripts/install-claude-hud.mjs`, or `scripts/ensure-surfaces.mjs`.
- Do not request broad Internet + write permissions, create `.quotapilot` or `tmp`, manually edit `plugins/` or `config.toml`, attempt administrator elevation or repeat a denied write.
- **Platform nuance:** ChatGPT's built-in plugin manager may itself use `~/.codex/config.toml` to save enable/disable preferences. That controlled **host action** is different from an agent editing Codex's native footer. A prompt from the official plugin manager is not automatically unsafe because it contains `config.toml`; inspect the exact requested action and scope. The QuotaPilot setup skill must not initiate either operation programmatically.
- If the platform doesn't expose a local stdio MCP server/plugin executor, ChatGPT can't load this local-only quota HUD. A skill or GitHub URL alone is not an executable server. Never pretend an unavailable HUD or real ChatGPT subscription metrics work.

### Codex CLI (only when explicitly requested)

Require evidence the agent operates in the user's actual local Codex CLI and user has consented to install. Review and run `scripts/agent-bootstrap.ps1 -HostType Codex` (PowerShell) or `sh scripts/agent-bootstrap.sh --host codex` (macOS/Linux). Download only the pinned GitHub release with SHA-256 verification, without asking for manual Node/npm installation; use the resulting local plugin root with documented marketplace controls. **Native Codex footer is a separate opt-in**: change `~/.codex/config.toml` only if the user explicitly asks for the Codex CLI footer and permits this precise file change.

### Claude Code (only when explicitly requested)

Require a verified local Claude Code environment and permission to install. Review and run `scripts/agent-bootstrap.ps1 -HostType Claude` or `sh scripts/agent-bootstrap.sh --host claude`. Register the local plugin using native Claude Code commands and preserve custom `statusLine`; do not modify Codex configuration.

## Completion checklist

Only report installation success after checking the installed host recognizes the plugin and the correct read-only tools or native surface. If the provider lacks telemetry, show unavailable, never fabricated data. Host approval dialogs remain mandatory. No user credentials, cookies, prompts, transcripts, source code or sensitive filesystem paths should be collected or published.

Use the user's language (English or Spanish). Read [English installation guide](docs/AGENT-INSTALL.md) / [guía en español](docs/es/AGENT-INSTALL.md). No changes to other repositories.
