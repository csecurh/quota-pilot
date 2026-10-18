# Contributing

**Private preview:** external contributions are not yet open to the public. Authorized collaborators may propose changes on a branch and request review.

## Local development

Use Node.js >=22.13, an authorized Git checkout and Git. No package installation is required.

```bash
npm run check
npm run doctor
npm run security:history
```

The history audit requires full Git history (`git fetch --unshallow` in shallow clones). CI verifies Linux, macOS and Windows and checks reachable history on Linux.

## Engineering rules

- Keep local stdio MCP and read-only tool semantics. Do not add runtime npm dependencies or network clients without an explicit security review.
- Treat provider data, host arguments and local files as untrusted. Bound memory, execution time and output.
- Do not introduce credentials, prompts, responses, transcripts, source code or session IDs into snapshots, telemetry, debug prints or fixture commits.
- Preserve host configuration; refuse ambiguous TOML/JSON rather than deleting unknown fields.
- Build widget DOM using `textContent` and ordinary nodes, never untrusted `innerHTML`.
- All new user-visible features must include regression tests and update installation/privacy documentation where appropriate.
- Keep **quota-pilot** as the technical identifier while using ChatGPT/Codex/Claude Code/AI Usage for host-visible HUD branding.
- No public release or visibility change without owner approval and all applicable release-readiness requirements.

## Reporting vulnerabilities

Follow [SECURITY.md](SECURITY.md). Avoid proof-of-concept payloads involving real secrets or personal data in issues.
