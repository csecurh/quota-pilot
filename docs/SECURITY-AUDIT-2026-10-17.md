# QuotaPilot Security Audit — 2026-10-17

**Language / Idioma: English · [Español](es/SECURITY-AUDIT-2026-10-17.md)**

## Scope

Audited the private repository runtime, MCP stdio server, Codex provider adapter, Claude Code status-line collector, host installers, ChatGPT/MCP App widget, plugin manifests, marketplace configuration, tests, and GitHub Actions workflow.

The audit focused on confidentiality, local privilege boundaries, input manipulation, denial of service, UI injection, supply-chain exposure, unintended network egress, excessive data retention, and unsafe configuration writes.

## Result

No evidence of an existing data exfiltration channel or committed secret was found in the reviewed source tree. Several preventive hardening gaps were identified and fixed in v0.4.0 before release.

### High — unbounded local protocol/provider input

**Risk:** A compromised/malformed host or provider process could send oversized lines and consume memory or keep requests pending.

**Fixed:** Added hard message limits, provider buffer limits, bounded pending requests, request timeouts, a local MCP request limiter, provider cache/in-flight deduplication, and generic failure handling.

### High — dynamic HTML construction in the widget

**Risk:** Rendering future provider-controlled strings through `innerHTML` could create an injection path.

**Fixed:** Removed `innerHTML` usage. The widget now builds DOM nodes and writes all dynamic content with `textContent`. Static CI audit rejects reintroduction of dangerous DOM primitives.

### High — local file/symlink manipulation

**Risk:** Fixed temporary file names and unchecked config/snapshot paths could be redirected through symbolic links or broad filesystem permissions.

**Fixed:** Added private-directory enforcement, ownership/type checks, random exclusive temporary files, atomic writes, 0600 files/0700 directories on POSIX, symlink rejection, and size limits. Claude and Codex installers now fail closed on ambiguous/unsafe configuration.

### Medium — excessive Claude snapshot data

**Risk:** The development snapshot retained model/cache/cost fields that were not required for the core HUD.

**Fixed:** Snapshot schema v2 retains only primary/secondary rate-limit windows and context percentages. Session IDs, cwd, transcript paths, model IDs/names, cache details, cost details, prompts, responses and code are not persisted.

### Medium — provider/internal error leakage

**Risk:** Raw child-process errors could be reflected into MCP tool results and potentially expose implementation details.

**Fixed:** Provider stderr is not collected for user-facing output; tool errors return generic availability messages. No stack traces or child-process error bodies are returned to the host.

### Medium — unnecessary process pressure

**Risk:** Repeated HUD refreshes could spawn multiple Codex app-server processes.

**Fixed:** Added a short provider cache and in-flight promise deduplication. The HUD still refreshes every 30 seconds while local provider reads are coalesced.

### Medium — widget network policy not explicit

**Risk:** Future UI changes could accidentally add external fetch/resource behavior.

**Fixed:** Resource metadata now declares empty CSP `connectDomains` and `resourceDomains`. Static audit rejects fetch/XHR/WebSocket and Node network modules in runtime sources.

### Medium — mutable CI action references / unnecessary install step

**Risk:** Tag-based GitHub Actions references and `npm install` increased supply-chain surface.

**Fixed:** Actions are pinned to full commit SHAs, checkout credentials are not persisted, CI has read-only repository permissions, and the dependency-free project no longer performs package installation.

### Low — ambiguous host branding override

**Risk:** Free-form client/environment text could spoof the display brand.

**Fixed:** Environment override accepts only exact known host values and client strings are bounded. Branding remains presentation-only and does not change authorization or data access.

## Security controls added

- `scripts/security-audit.mjs` static security gate.
- `tests/security.test.mjs` for input validation, rate limiting, symlink rejection, private snapshots and file-size limits.
- CSP with no external connect/resource domains.
- Read-only, non-destructive, idempotent MCP annotations.
- Repository marketplace uses the checked-out local plugin path rather than re-fetching the same repository.
- Security policy and CODEOWNERS.
- CI runs tests, syntax checks and security audit on every push/PR.

## Residual risks

1. **Host/provider trust boundary:** Codex, Claude Code and ChatGPT/plugin hosts are privileged local components. If the host itself is malicious or the user's account/machine is compromised, this plugin cannot guarantee confidentiality.
2. **Plugin source trust:** Installing a newer commit changes executable local code. For higher-assurance distribution, install/test an audited commit SHA rather than an unreviewed moving branch.
3. **Codex local executable resolution:** the plugin invokes the `codex` executable from the host PATH. PATH integrity is therefore part of the local-machine trust boundary.
4. **Claude status-line input:** Claude supplies the status-line JSON. The plugin minimizes what it persists, but the process necessarily receives that host-provided input transiently.
5. **Repository administration:** this connector could not read branch-protection/ruleset/Actions administration endpoints, so enforcement of protected branches, private vulnerability reporting, secret scanning and organization-level GitHub policies was not independently verified in this audit.
6. **No formal external penetration test:** this is a source/configuration audit plus automated adversarial tests, not a third-party certification or OS-level penetration test.
7. **Private-repository forking is enabled:** GitHub currently reports `allow_forking: true`. This does not make the repository public, but an already-authorized user may be able to create a private fork depending on GitHub/account policy. The available connector does not expose the repository-setting mutation needed to disable it.

## Recommended repository controls

Enable or verify in GitHub UI when available:

- Disable **Allow forking** for this private repository if private forks are not required.
- Branch protection/ruleset for `main` requiring CI and blocking force pushes/deletions.
- Private vulnerability reporting.
- Secret scanning and push protection where the plan supports them.
- Two-factor authentication/passkeys on maintainer accounts.
- Minimal GitHub App/OAuth access and no unnecessary collaborators/deploy keys/webhooks.
- Review dependency/network additions as security-sensitive changes.

## Conclusion

After the v0.4.0 fixes, the default architecture has a deliberately small attack surface: dependency-free Node runtime, local stdio/provider access, no application network egress, minimized private local state, read-only tools, strict CSP and automated regression gates. Remaining risks are primarily the surrounding host, operating system and repository-account trust boundaries.
