# Release verification and evidence log

Current phase: **0.5.0-rc.1 private release candidate**, NOT public-ready certification.

## What automated CI can establish

- Tests and syntax checks are scheduled against pinned Node.js 22.13 in Linux, macOS and Windows runner environments; consult the latest Actions run for their actual result.
- Static inspection for forbidden runtime network APIs, DOM injection surfaces, unsafe GitHub workflow configuration, sensitive file types and common secret token shapes.
- A full reachable Git-object history audit in the Linux job, requiring an unshallow Git checkout.
- Offline protocol, provider absence handling, rate limits, local filesystem, installer and native CLI diagnostics regression fixtures.

On Windows, POSIX inode identity and permission semantics are not assumed; a real Windows ACL review is still required.

CI cannot prove the absence of all undiscovered secrets, malicious same-user processes, actual host integration, browser UX or legal right to grant third-party licenses.

## Evidence still needed from real systems

| Area | Required evidence | Status |
| --- | --- | --- |
| Claude Code | Installed real status line with authenticated provider on current supported version; test update and removal | NOT VERIFIED |
| Codex CLI | Footer with native quota tokens and preserved pre-existing config on current supported version; test removal | NOT VERIFIED |
| ChatGPT Desktop | Current build supports local stdio MCP Apps, host-bridge APIs and conversation-scoped PiP | EXPERIMENTAL — NOT VERIFIED |
| macOS / Windows / Linux | Manual install/upgrade/uninstall and file permission/ACL validation on supported OS | NOT VERIFIED |
| Accessibility | Keyboard, accessible naming, color contrast, reduced motion, screen-reader check | MANUAL REVIEW REQUIRED |
| Assets | Real anonymized, permission-cleared screenshot/GIF replacing or supplementing synthetic illustration | NOT CAPTURED |
| GitHub security settings | Branch protection, fork settings, secret scanning, collaborators and actions permissions; public-repo vulnerability reporting at launch | ADMIN REVIEW REQUIRED (private plan restriction) |
| Legal | MIT LICENSE is committed; copyright ownership/attribution and third-party asset clearance still need confirmation | MIT APPLIED; OWNER ATTESTATION REQUIRED |

## Publication protocol

1. Record a completed real-host checklist and final CI SHA with all checks green.
2. Resolve any historical-scanner warnings and independently review sensitive commit history.
3. Confirm copyright-holder attribution for the committed MIT LICENSE, release notes, screenshots and administrative security settings.
4. Request an explicit owner decision to flip visibility; do **not** change automatically.
