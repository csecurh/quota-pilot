# Public-release readiness gate

The repo MUST remain private until the owner expressly authorizes a visibility change. A successful CI run is necessary but **not sufficient** to declare a public release 100% ready.

- [ ] Confirm latest release-candidate HEAD, Private visibility, a green full Linux/macOS/Windows CI matrix, and pinned-SHA GitHub Actions.
- [ ] Run `npm run security:history` on a full checkout, then manually review the entire current Git tree **and reachable history** for credentials, personal data, private URLs, accidental secrets and license-incompatible assets. Simple pattern scanning alone cannot certify history.
- [x] Add canonical MIT LICENSE, `package.json` MIT metadata, and README attribution. Copyright attribution follows the existing Cibersecurity-H manifest metadata.
- [ ] Copyright holder to confirm authorship and rights to relicense all source, plus third-party asset/contributor attribution review (see `docs/LICENSE-DECISION.md`).
- [ ] Confirm install and uninstall on at least one real Windows, macOS and Linux environment where supported.
- [ ] Smoke-test standalone Claude status-line, Codex footer and MCP protocol using a genuinely authenticated provider.
- [ ] Independently verify the host-dependent ChatGPT Desktop local-MCP-App/PiP onboarding path or explicitly label it experimental and remove unsupported distribution claims.
- [ ] Check plugin marketplace metadata and installation commands against actual current host implementations.
- [ ] Verify accessibility, reduced-motion rendering, no-network widget CSP, and alerts that never misrepresent missing metrics.
- [ ] Configure and **verify actual GitHub admin controls** for branch protection, secret scanning, minimal collaborators and appropriate fork policy. While private, GitHub currently restricts private branch protection on this plan; private vulnerability reporting is public-repository-only. See `docs/GITHUB-SECURITY-SETUP.md`.
- [ ] Produce a real anonymized screenshot/GIF from working installations; keep the current illustration visibly labeled as synthetic.
- [ ] Record versioned release notes, test evidence and rollback instructions.
- [ ] Obtain owner's explicit written approval **separately** before converting to Public.

Do not claim 100% readiness until all applicable gates are completed and evidenced.

## Automated release-candidate evidence

- `npm run check` runs syntax, unit/integration fixtures and static source-safety checks.
- `npm run security:history` requires an unshallow Git repository and scans all reachable text blobs for common secret shapes; do not confuse this with a full manual review.
- `npm run doctor` reads only locally expected configuration/snapshot paths and never prints their content or host credentials.
- See [RELEASE-VALIDATION.md](RELEASE-VALIDATION.md) for the remaining host/platform/admin/legal gates.
