# GitHub administration — public repo safety

**Language / Idioma: English · [Español](es/GITHUB-SECURITY-SETUP.md)**

Repository: [csecurh/quota-pilot](https://github.com/csecurh/quota-pilot) (**Public**, MIT). This is a checklist for repository administrators, not a claim that toggles were remotely applied.

## Last verified (2026-10-18, before public onboarding commit)

- GitHub REST metadata: `visibility: public`, `private: false`, MIT license.
- `main` reports `protected: false`; `GET /rulesets` returns an empty list.
- Public repository forks are enabled; that is expected for many MIT open-source projects.
- The currently connected GitHub integration **cannot change repository settings, branch protection or rulesets**. A maintainer with access to **Settings** must enable them in GitHub itself.
- CI is in source, with minimal read-only token, pinned GitHub-owned actions, full-history scans and a three-OS test matrix. `CODEOWNERS` has no enforcement without a protection rule.

## Activate a main branch ruleset — highest priority

Open [repository Rulesets](https://github.com/csecurh/quota-pilot/settings/rules) → **New ruleset → New branch ruleset**, or [Branches settings](https://github.com/csecurh/quota-pilot/settings/branches) → **Add branch protection rule**.

Recommended ruleset:

| Field | Value |
|---|---|
| Name | `Protect main` |
| Enforcement status | **Active**, not Evaluate/Disabled |
| Target branches | Include default branch (`main`) |
| Restrict deletions | **On** |
| Block force pushes | **On** |
| Require a pull request before merging | **On** |
| Require status checks | **On**: `Verify (ubuntu-latest)`, `Verify (macos-latest)`, `Verify (windows-latest)` |
| Require latest base branch | On, where supported |
| Require conversation resolution | On |
| Require code owner approval | Turn on only if a second reviewer can actually approve |
| Bypass rules | None where practical; avoid accidentally locking out a solo maintainer |

**Solo-maintainer caveat:** requiring 1 unrelated approval or code owner approval may make it impossible to merge your own PRs. Prefer PR + all required checks without an approval-count requirement until a second reviewer exists. Test a harmless pull request first.

After saving, verify `main` is protected or that an **active ruleset targets main** (rulesets may be enforced even if UI labels differ); confirm a failing CI blocks a test PR. Avoid toggling requirements repeatedly on the production branch.

## Repository security settings

1. [Actions settings](https://github.com/csecurh/quota-pilot/settings/actions): grant default `GITHUB_TOKEN` **read-only**; restrict allowed actions to trusted publishers / SHA-pinned versions as policy permits; require fork-workflow approvals as appropriate.
2. [Code security](https://github.com/csecurh/quota-pilot/settings/security_analysis): enable **Secret scanning**, push protection, Dependabot alerts/security updates and **Private vulnerability reporting**, subject to the controls exposed by your account. The checked-in Dependabot configuration requests weekly GitHub Actions updates, but cannot enable account-level services.
3. [General settings](https://github.com/csecurh/quota-pilot/settings): review collaborators, deploy keys, installed apps, webhooks, and whether to auto-delete merged branches. Review who can publish releases or change settings.
4. [Security policy](../SECURITY.md) is in place. A vulnerability should be reported privately, not posted as a public GitHub issue.
5. Review all reachable Git history before inviting broad use; the automated scanner is useful but **heuristic**.

## Verification evidence

Run `npm run check` and `npm run security:history` on a full checkout. See [RELEASE-VALIDATION.md](RELEASE-VALIDATION.md).

The external publication of the source was authorized by the owner; **submission to the universal ChatGPT/Codex directory is a separate process**, not implied by GitHub visibility.
