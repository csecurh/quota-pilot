# Changelog

**Language / Idioma: English · [Español](CHANGELOG.es.md)**

This project uses SemVer for plugin/runtime metadata. Release candidates are not public releases and may change before general availability.

## Desktop MCP compatibility patch (2026-10-18)

- Accept standard MCP request `params._meta` on tool and UI resource calls. Keep strict tool argument schemas and reject unexpected parameters or invalid metadata types.
- Add host-shaped protocol regression tests for `get_usage`, `open_hud`, metadata redaction and the UI resource; separate protocol errors from provider-unavailable messages.
- Document upgrade/restart steps in English and Spanish for affected ChatGPT Desktop plugin installations.

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
