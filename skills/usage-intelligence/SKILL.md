---
name: usage-intelligence
description: Inspect Codex and Claude Code usage limits, resets, burn rate, runway and predicted idle/dead time with QuotaPilot.
---

Use QuotaPilot's read-only MCP tools for usage questions.

Prefer `get_overview` for general questions such as “how much do I have left?”, “which provider should I use?”, or “when will I hit my limit?”. Use `get_usage` when the user names Codex or Claude Code.

Treat provider-reported quota/reset values as measured data. Burn rate, runway and dead-hours are derived estimates and must be labeled as estimates. Never fabricate ChatGPT web/app quota data when the provider does not expose it.
