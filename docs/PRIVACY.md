# Privacy FAQ

**Do I need an account?** No additional QuotaPilot account, Supabase project or cloud backend.

**Where does data come from?** The locally running Codex app-server rate-limit response, and selected rate-limit/context fields from Claude Code's status-line input. A provider must already be authenticated through its own client.

**What is kept on disk?** Claude's minimized snapshot under `~/.quotapilot/claude-latest.json`, limited to 64 KiB, with owner/private permissions on supported POSIX platforms and a default 30-minute freshness window. It contains timestamps, percentages and reset windows. Installers may update the user's existing Claude or Codex local settings.

**What is never deliberately persisted?** Passwords, OAuth tokens, credentials, prompts, responses, transcripts, source files, session IDs, working directories, model IDs, billing details, or telemetry about user behavior.

**Does the widget send analytics?** No. The widget has `connect-src 'none'` and calls the host's MCP bridge; it makes no direct HTTP requests. The separate host and Codex executable follow their own network policies, outside QuotaPilot's control.

**How reliable are predictions?** Burn rate, runway and estimated time without quota are advisory calculations in process memory. They need at least two samples separated by five minutes; reset gaps only appear when timestamps are provided. Low-quota warnings are local visual indicators, **not system notifications**.

**Can it guarantee security?** No. Same-user malware, compromised providers/hosts, parent-directory symlinks/mounts, and GitHub account risks remain outside the project's complete control. See [THREAT-MODEL.md](THREAT-MODEL.md).
