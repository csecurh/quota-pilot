# Threat model — quota-pilot

## Scope and trust boundaries

The product operates via a local MCP stdio server, Codex app-server subprocess, Claude Code status-line collector, and a ChatGPT host-bridge widget. Its principal security goals are confidentiality of host credentials/workspace, integrity of existing configuration and bounded local resource use.

| Boundary | Untrusted input | Protection |
|---|---|---|
| MCP host | JSON-RPC frames, method and args | 256 KiB frames, strict schemas, request limiter, max eight active operations, generic errors |
| Codex subprocess | JSON messages or hang | shell disabled, stderr ignored, 1 MiB line limit, eight pending requests maximum, timeout |
| Claude status-line | arbitrary host JSON | 256 KiB input cap, selected metrics only, private minimized snapshot |
| Local filesystem | symlinks, file swaps, unsafe permissions | lstat, no-follow read open, fstat inode verification, size and ownership checks, 0600 files / 0700 app directories, randomized atomic writes |
| Widget | provider values / tool results | DOM textContent, restrictive CSP, host bridge only, no direct HTTP |
| GitHub Actions | mutable dependency and workflow references | SHA-pinned Actions, read-only permissions, no package install, static checks |

## Data collection boundary

Quota-pilot reads the local Codex rate-limits result, the transient Claude status-line JSON, the minimized Claude snapshot at ~/.quotapilot/claude-latest.json, and—only during explicit installation—the existing ~/.codex/config.toml or ~/.claude/settings.json. Persisted Claude data consists solely of timestamps, rate-limit and context percentages/reset windows. Derived burn-rate, runway and estimated idle hours are held in process memory.

Quota-pilot does not intentionally inspect or persist credentials, OAuth tokens, model or session IDs, prompts, responses, transcripts, cwd paths, source code, shell history, billing/cost details or arbitrary project files. No usage information is sent by quota-pilot to an external network service. The externally installed Codex executable and ChatGPT/Claude host operate outside this software's direct network control.

## Threats and residual limits

1. A compromised OS account, hostile same-user process, compromised host or executable is outside the plugin's security boundary; filesystem permissions do not sandbox same-user malware.
2. POSIX no-follow controls protect final paths and opened inode identity, not every ancestor component. Parent-directory replacement and unusual mount layouts remain an OS trust boundary. Windows ACLs are not independently audited.
3. Codex config editing deliberately supports conservative inline status arrays; ambiguous or multiline syntax is rejected rather than altered. Complete TOML parsing is not claimed.
4. UI forecasts are estimates, not guaranteed quotas or service uptime. Provider authenticity depends on the installed local host/executable.
5. Static secret-pattern scans are heuristic and do not prove an absence of secrets in historical Git objects or detect every secret format.
6. Supply-chain protections cannot prevent a malicious authorized maintainer from changing reviewed code. GitHub branch protection, private forking restrictions and vulnerability-reporting configuration require separate administrative verification.
7. Limits reduce local process DoS risk, but a privileged local adversary can still exhaust operating-system resources.

See SECURITY.md for responsible reporting and the dated audit documents for implemented controls. Any extension to network access, credential read, or write-capable MCP tools requires separate security review.
