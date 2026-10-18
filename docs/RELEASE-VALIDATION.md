# Public-source release candidate — verification evidence

Project: quota-pilot, MIT, **GitHub Public**, `0.5.0-rc.1`. This file distinguishes automated results from actual installations.

## Automated verification

The project includes `npm run check` (syntax, tests and static security), `npm run security:history` (reachable Git text objects, heuristic only) and `npm run doctor` (sanitized host configuration status). GitHub Actions tests Ubuntu, macOS and Windows under Node.js 22.13.0. The latest authoritative pass/fail result is visible in [GitHub Actions](https://github.com/csecurh/quota-pilot/actions/workflows/ci.yml).

Security goals: local stdio MCP, read-only tools, bounded input, generic provider errors, minimized Claude snapshot, strict CSP denying network connections, no runtime npm dependencies, and no use of `innerHTML` for provider data.

## Field validation still required

| Surface | Expected behavior | Status |
|---|---|---|
| Claude Code | Marketplace/source installation, genuine 5h/7d rate limits, safe update/removal | NOT TESTED WITH REAL HOST |
| Codex CLI | Marketplace/source installation, native quota footer, settings preserved | NOT TESTED WITH REAL HOST |
| ChatGPT Desktop | Local plugin bridge, `open_hud`, inline widget/PiP and refresh on eligible host | EXPERIMENTAL — NOT VERIFIED |
| Platforms | Real user Windows/macOS/Linux install/uninstall, file permissions/ACL checks | CI GREEN DOES NOT COVER FIELD TESTING |
| Accessibility | Screen reader, color contrast and reduced motion on host surfaces | MANUAL CONFIRMATION PENDING |
| Assets | Real anonymous screenshot/GIF, if used | SYNTHETIC MOCKUP ONLY |
| GitHub governance | Active main ruleset, Code Security toggles, collaborators | REQUIRES ADMIN VERIFICATION |
| Legal | Copyright ownership and third-party rights | COPYRIGHT-HOLDER ATTESTATION PENDING |

Use [HOST-TEST-PLAN.md](HOST-TEST-PLAN.md) to record a single completed host acceptance run **without sharing account data**.

## Constraints

- A successful scanner cannot prove the entire historical repository never contained a secret.
- A successful simulated MCP test cannot prove the ChatGPT desktop build exposes the required bridge.
- Windows stat/inode semantics differ from POSIX; user files and ACLs need a separate real Windows review.
- The GitHub repo can be used under MIT, but the universal plugin directory requires submission/review.
