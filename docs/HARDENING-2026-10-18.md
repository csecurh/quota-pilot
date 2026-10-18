# Security hardening follow-up — 2026-10-18

**Language / Idioma: English · [Español](es/HARDENING-2026-10-18.md)**

This report supplements the 2026-10-17 security audit. It is an internal code/configuration review and adversarial regression suite, not a third-party penetration-test certification.

## Changes implemented

- Bounded safe file reads using descriptor-level no-follow behavior (where available), before/after inode identity verification and 64 KiB / 1 MiB size ceilings; private file ownership and permissions validated.
- Atomic file writes reject oversized content and file targets, use private directories, exclusive randomized temporary files, fsync and atomic rename.
- Conservative Codex [tui] editor that preserves unrelated TOML, comments and explicit color choice; rejects duplicate/multiline/unsupported settings rather than rewriting ambiguous data.
- MCP input handling discards oversized entire frames, validates request IDs/params, limits concurrent handlers and applies local rate limiting. Errors remain generic.
- Codex subprocess handles early exits, limits lines/pending work, disables shell execution and ignores provider stderr.
- HUD uses DOM text nodes, a strong no-connect CSP, coalesced 30-second refresh and only the host-provided MCP bridge.
- Fixed standalone Claude status-line installation to install its secure-fs helper alongside the script.
- Added tests for invalid MCP inputs, oversized frames, error redaction, safe file bounds and modes, Codex configuration preservation/idempotence, branding and installed Claude runtime.
- CI retains pinned GitHub Action SHAs, minimal permissions and no dependency installation; static audit now checks extra security invariants.

## Boundaries

The scanner is heuristic, and the code audit cannot assert that Git history has never held secrets or that the host-managed Codex process never accesses a network. GitHub's private repository setting alone does not disable private forking. The full threat model is documented in THREAT-MODEL.md; disclosure guidance remains in SECURITY.md.
