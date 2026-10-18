# Security Policy

QuotaPilot is designed as a local-first, read-only usage HUD. The default build has no runtime package dependencies, no application telemetry, and no network client.

## Supported versions

Security fixes are applied to the latest minor release on `main`. Version 0.4.x introduced the hardened runtime; the 0.5.0 release candidate adds broader CI, history scanning, local diagnostics and stricter missing-data handling. This is still a private preview, not an externally certified release.

## Data boundary

The plugin is allowed to process only the minimum data required to display usage:

- Codex rate-limit windows obtained from the locally authenticated Codex app-server.
- Claude Code rate-limit and context percentages provided to the local status-line process.
- Derived burn-rate/runway values computed in memory.

The plugin must not persist or transmit passwords, OAuth/session tokens, prompts, responses, transcripts, working-directory paths, source code, IP addresses, or behavioral analytics.

Claude's local snapshot is stored at `~/.quotapilot/claude-latest.json` with private permissions. Its schema excludes session identifiers, model identifiers, cost details, cache details, paths, prompts, responses, and transcript metadata.

## Network policy

The runtime must not initiate external network connections. The ChatGPT widget CSP declares no `connectDomains` or `resourceDomains`. MCP communication is local stdio and provider access uses the providers' local processes/files.

## Reporting a vulnerability

Do not include secrets, exploit payloads against real accounts, or private user data in public issues.

If GitHub Private Vulnerability Reporting is enabled for this repository, use **Security → Report a vulnerability**. Otherwise contact the repository owner through a private channel before disclosing technical details publicly.

Include affected version/commit, operating system, reproduction steps using synthetic data, impact, and any proposed mitigation.

## Security invariants

Changes must keep these properties unless a separately reviewed design explicitly changes them:

1. No runtime npm dependencies.
2. No outbound network client in plugin runtime or widget.
3. MCP tools remain read-only and non-destructive.
4. Provider/tool inputs are server-side validated and size-limited.
5. Provider errors are not reflected verbatim to the host.
6. Local persistent files use private permissions and reject symlink targets.
7. UI never renders provider data through `innerHTML`.
8. CI actions are pinned to full commit SHAs and checkout does not persist credentials.
9. No credentials, private keys, `.env` files, prompts, responses, transcripts, or source code are committed or persisted by the plugin.
10. CI audits reachable Git history for common sensitive-file and credential patterns using a non-shallow checkout; manual history review remains necessary.
