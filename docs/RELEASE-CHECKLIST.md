# Public source release checklist — QuotaPilot 0.6.0-rc.3

**Language / Idioma: English · [Español](es/RELEASE-CHECKLIST.md)**

**GitHub source is PUBLIC and MIT licensed.** A public repository is not the same as a plugin accepted into the universal ChatGPT/Codex directory. This is a candidate for community installation and testing, not a claim of verified support for every host.

## Complete in the repository

- [x] Public source, MIT LICENSE, clear authorship metadata and upgrade/disclosure documentation
- [x] README with public HTTPS clone and Claude/Codex marketplace paths; experimental ChatGPT Desktop path marked clearly
- [x] GitHub Issues templates with redaction guidance and SUPPORT.md
- [x] Host-aware visible labels and provider-data privacy boundary
- [x] Local diagnostics, unit/integration fixtures, syntax checks, static security scan, full-history heuristic scan (requires non-shallow Git history; use `git fetch --unshallow` first if needed)
- [x] Linux/macOS/Windows CI with pinned actions and read-only workflow token
- [x] CODEOWNERS and Dependabot config checked into source
- [x] Synthetic HUD example explicitly identified as an illustration

## Administrative verification — cannot be enforced by committing files

- [ ] **Activate** a branch rule/ruleset for `main` requiring successful CI, blocking force-push and deletion ([settings](GITHUB-SECURITY-SETUP.md))
- [ ] Verify security settings: private vulnerability reporting, secret scanning and Dependabot alerts, least-privilege Actions/collaborators
- [ ] Confirm legal copyright owner(s) and third-party attributions before a GA release
- [ ] Review Git history manually for atypical credentials/private artifacts (automation only scans common signatures)
- [ ] Optionally create a versioned GitHub pre-release after real-host smoke tests

## Real-world host acceptance — next user testing stage

- [ ] Claude Code installed through public marketplace **and** direct script on a real authenticated host; settings preserved, update/removal verified
- [ ] Codex CLI public marketplace plugin and native footer verified with a real account; settings preserved, update/removal verified
- [ ] ChatGPT Desktop local plugin installation tested on an eligible current build; bridge, MCP tools, inline/PiP and refresh validated or incompatibility documented
- [ ] Manual Windows/macOS/Linux installation/permissions smoke checks on supported environments, screen-reader/contrast/reduced-motion confirmation
- [ ] Replace/supplement synthetic mockup with a real **redacted** screenshot or short GIF if available

See [HOST-TEST-PLAN.md](HOST-TEST-PLAN.md) for specific acceptance cases, [RELEASE-VALIDATION.md](RELEASE-VALIDATION.md) for evidence, and [GITHUB-SECURITY-SETUP.md](GITHUB-SECURITY-SETUP.md) for admin tasks. **Do not report administrative controls as enabled without checking GitHub state.**
