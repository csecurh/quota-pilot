# Public-release readiness gate

The repo MUST remain private until the owner expressly authorizes a visibility change. A successful CI run is necessary but **not sufficient** to declare a public release 100% ready.

- [ ] Confirm latest HEAD, Private visibility and green pinned-SHA CI.
- [ ] Review the entire current Git tree **and reachable history** for credentials, personal data, private URLs, accidental secrets and license-incompatible assets. Simple source pattern scanning alone cannot certify history.
- [ ] Decide and add an appropriate OSS LICENSE, copyright notice and third-party attribution review.
- [ ] Confirm install and uninstall on at least one real Windows, macOS and Linux environment where supported.
- [ ] Smoke-test standalone Claude status-line, Codex footer and MCP protocol using a genuinely authenticated provider.
- [ ] Independently verify the host-dependent ChatGPT Desktop local-MCP-App/PiP onboarding path or explicitly label it experimental and remove unsupported distribution claims.
- [ ] Check plugin marketplace metadata and installation commands against actual current host implementations.
- [ ] Verify accessibility, reduced-motion rendering, no-network widget CSP, and alerts that never misrepresent missing metrics.
- [ ] Configure branch protection/rulesets, secret scanning, private security reporting, minimal collaborators and appropriate fork policy before publication.
- [ ] Produce a real anonymized screenshot/GIF from working installations; keep the current illustration visibly labeled as synthetic.
- [ ] Record versioned release notes, test evidence and rollback instructions.
- [ ] Obtain owner's explicit written approval **separately** before converting to Public.

Do not claim 100% readiness until all applicable gates are completed and evidenced.
