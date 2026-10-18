# Security Policy

**Language / Idioma: English · [Español](SECURITY.es.md)**

QuotaPilot is a **local-first, read-only** usage HUD. This public MIT-licensed project is unaffiliated with OpenAI or Anthropic. It has no runtime npm dependencies, no QuotaPilot-owned telemetry service and no direct HTTP client in the widget.

## Supported versions

| Version | Security fixes |
| --- | --- |
| 0.6.0-rc.2 (current public source) | Maintained until subsequent pre-release or stable release |
| 0.4.x and earlier | No further security fixes guaranteed |

## Confidential reporting

**Do not publish vulnerabilities, credentials, exploit details or private account information in public GitHub Issues.**

If the repository's GitHub **Private vulnerability reporting** feature is enabled, visit [Security → Advisories → Report a vulnerability](https://github.com/csecurh/quota-pilot/security/advisories) to file a confidential report. If that option is unavailable, contact repository owner **@csecurh** through an existing trusted private channel. A public issue is **not** a substitute for confidential reporting; do not post sensitive proof-of-concept data.

A useful report should include the affected commit/version, operating system, sanitized reproduction steps with synthetic data, estimated impact, and suggested mitigation. Avoid collecting or disclosing real user data.

## Data boundary

The only provider data deliberately used is: Codex rate-limit windows via the locally authenticated Codex app-server, and quota/context percentages from Claude Code status-line input. Derived burn-rate and runway estimates live in process memory.

A bounded private snapshot at `~/.quotapilot/claude-latest.json` stores selected Claude percentages, timestamps, and reset windows. QuotaPilot **does not intentionally persist** passwords, API keys, OAuth/session tokens, prompts, model IDs, responses, transcripts, source files, cwd paths, IP addresses, provider costs or browsing data. Host and provider binaries operate independently and may have their own network behavior.

## Security design

- MCP over local stdio with strict argument schemas, request/response ceilings and local throttling.
- Node child processes run with `shell: false`, with timeouts and generic provider errors.
- Safe local file reads/writes, owner and type checks, size limits, POSIX private permissions, symlink rejection and atomic replacement.
- Widget data only rendered through safe DOM text nodes; CSP includes `connect-src 'none'` and no third-party assets.
- No runtime npm dependencies. GitHub Actions use pinned action SHAs, minimal token permissions, cross-platform tests, heuristic secret scanning of current sources and reachable history.

## Residual risks

Quotas and forecasts depend on provider APIs and host support. Same-user malware or compromised host processes, Windows ACLs, parent-path swaps and historical secrets missed by heuristic scanning remain outside the software's absolute security guarantees. Read the [threat model](docs/THREAT-MODEL.md). GitHub branch protection and vulnerability-reporting **settings** must be verified as enabled by an administrator: files alone do not enforce them.

## Contribution requirements

No credentials, `.env` secrets, private keys, prompts, responses, transcripts or user source code should enter commits or reports. Review security-sensitive modifications to tools, CSP, snapshots, installers and workflows before merging.
