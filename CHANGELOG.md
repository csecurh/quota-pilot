# Changelog

**Language / Idioma: English · [Español](CHANGELOG.es.md)**

This project uses SemVer for plugin/runtime metadata. Release candidates are not public releases and may change before general availability.

## Git source runtime vendoring (2026-10-18)

- Windows x64 Git marketplace now launches `./runtime/node.exe` included in the repository; no external Node/npm or runtime download on launch.
- Pin runtime provenance to immutable 0.6.0-rc.3 release SHA-256, check the Node license and exact binary hash on CI, and explicitly allow just this oversized binary in history scans.
- Correct portable-package MCP commands to plugin-relative paths required by Agent Plugins 1.0.0.
- Other platforms continue to use their own OS-specific builds; Desktop host support must be tested separately.

## 0.6.0-rc.3 — Read-only ChatGPT onboarding and explicit host gates

- ChatGPT's default onboarding skill now verifies already connected read-only MCP tools instead of invoking native Codex/Claude installers or requesting combined network/filesystem permissions.
- The Bash and PowerShell agent bootstraps refuse execution without an explicitly selected Codex or Claude host; ChatGPT is not an allowed bootstrap target.
- Document that the first-party ChatGPT Plugins manager may store enable/disable preferences in Codex's config.toml, which is **not** authorization for QuotaPilot to install a native Codex footer.
- Add host-scoping regression tests and package the read-only ChatGPT skill with the self-contained distributions. ChatGPT local MCP compatibility still depends on the desktop host.

## 0.6.0-rc.2 — Host-scoped permissions and safe OpenAI hooks

- OpenAI's shared ChatGPT/Codex manifest now loads an explicitly empty hook, preventing plugin installation from automatically editing Codex `config.toml` in ChatGPT Desktop/Work.
- Codex CLI native footer changes require a separate explicit request/approval; Claude Code retains its own scoped hook.
- Agent setup now verifies local-versus-cloud execution before requesting write/network permissions and refuses broad ChatGPT permission prompts.
- Refresh pinned Windows/Linux/macOS agent bootstrap checksums for the new verified release; preserve English/Spanish setup guidance and tests.

## Desktop MCP compatibility patch (2026-10-18)

- Accept standard MCP request `params._meta` on tool and UI resource calls. Keep strict tool argument schemas and reject unexpected parameters or invalid metadata types.
- Add host-shaped protocol regression tests for `get_usage`, `open_hud`, metadata redaction and the UI resource; separate protocol errors from provider-unavailable messages.
- Document upgrade/restart steps in English and Spanish for affected ChatGPT Desktop plugin installations.

## Agent-assisted GitHub URL installation (2026-10-18)

- Add local-agent onboarding: paste repository URL and the agent downloads and SHA-256 verifies the matching self-contained GitHub release without requiring manual ZIP/Node/npm installation.
- Add reviewed Bash and PowerShell bootstraps, strict pinned hashes, private per-user install locations, idempotent behavior, security tests, and host-aware setup instructions.
- Keep ChatGPT Desktop local bridge and provider telemetry limitations explicit; host trust consent remains mandatory.

## 0.6.0-rc.1 — Portable, dependency-free runtime

- Bundle official Node.js 24 LTS, its license notices, MCP server and hooks into OS-specific release archives: Windows x64, Linux x64, macOS ARM64/Intel.
- Build native release bundles in four pinned GitHub Actions environments and test with a completely empty child PATH.
- Fix Codex-vs-Claude lifecycle hook ambiguity with an explicit host argument and preserve Claude's bundled runtime in its private status-line directory.
- Document honest host/provider limitations and release verification in English and Spanish. No credentials, cloud service or automatic network downloader is introduced.

## 0.5.0-rc.1 — Public source, host-validation release candidate

- Show advisory consumption rate, estimated runway and possible quota gap within the local HUD.
- Add visual low-quota/critical and pacing alerts; missing provider metrics remain unavailable, never fabricated.
- Document local Codex and Claude installation, constrained ChatGPT host compatibility, privacy and uninstallation.
- Add offline `npm run doctor` diagnostics with no secret or filesystem path output.
- Add full reachable-history secret-pattern audit (`npm run security:history`) and Linux, macOS, Windows CI coverage.
- Avoid side effects in Claude installer when the user has a different custom status line.
- Normalize missing Claude percentages correctly and limit status-line input accumulation before appending data.
- Add MIT licensing metadata, CODEOWNERS policy, GitHub Actions Dependabot monitoring and a step-by-step administrative security checklist. Public GitHub source now supports admin-side protection; connected tooling cannot change branch settings.
- Public marketplace naming (`ai-usage`), HTTPS installation documentation, sanitized GitHub issue templates and a host acceptance guide.
- Add English/Spanish documentation, bidirectional language links, EN/ES widget toggle and localized Claude status line/doctor, without changing machine-readable data.
- Retain all existing 0.4.x filesystem/protocol hardening and read-only/no-network invariants.

## 0.4.0 — Security hardening

- Bounded MCP/provider input, private file handling, stronger CSP, generic errors and minimized Claude snapshots.
- Read-only MCP tools and host-dependent branding with CI safety gates.

See [release readiness](docs/RELEASE-CHECKLIST.md) for remaining real-host/admin validation evidence.
