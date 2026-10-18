---
name: setup
description: Configure QuotaPilot locally for Codex and Claude Code.
---

Set up QuotaPilot without creating a cloud account.

1. Verify Node.js 22.13 or newer is available.
2. Run the plugin MCP server dependency installation from the plugin root with `npm install`.
3. Detect whether Codex, Claude Code, or both are available locally.
4. Verify Codex is authenticated before reading its limits.
5. For Claude Code, explain that the Claude status-line collector is still being completed in the current development build.
6. Run QuotaPilot's read-only `get_overview` tool and report which providers are currently available.
7. Never request or copy provider passwords, session tokens, prompts, responses, or source code.
