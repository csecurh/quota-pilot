# GitHub administrative security settings — release checklist

Repository: `csecurh/quota-pilot`. The codebase remains **Private** until the owner explicitly chooses otherwise. This document describes **desired settings**, not settings already enforced.

## Confirmed current state (2026-10-18)

- `main` exists, but its GitHub branch metadata reports `protected: false`.
- The repository reports `allow_forking: true`.
- The GitHub API ruleset read returned HTTP 403: "Upgrade to GitHub Pro or make this repository public to enable this feature."
- This integration cannot modify repository administrative settings or branch-protection endpoints.
- The repository's existing GitHub Actions CI is already configured to run pull requests and pushes, with read-only `GITHUB_TOKEN`, pinned checkout/setup-node SHAs and tests on Linux, macOS and Windows.
- A CODEOWNERS file exists and protects files **only if** a repository-level rule actually requires owner review.

## Protect main (requires supported plan and admin UI)

GitHub Free protects branches of **public** repositories. Protecting a **private** repository requires GitHub Pro, Team, Enterprise Cloud or Enterprise Server. **Do not change visibility just to enable protection.**

If you upgrade while private, open **Settings → Branches → Add branch protection rule** (or Settings → Rules → Rulesets when available) and configure:

1. **Branch name pattern:** `main`.
2. **Require a pull request before merging**. When a second reviewer is available, require **1 approving review** and **Code Owner review**. Warning: enabling mandatory reviews in a single-maintainer repository can block the owner's own pull requests.
3. **Dismiss stale approvals** when code changes, and require conversation resolution.
4. **Require status checks to pass** and require branches up to date before merging. Select these exact three existing job contexts:
   - `Verify (ubuntu-latest)`
   - `Verify (macos-latest)`
   - `Verify (windows-latest)`
5. **Block force pushes and deletions**; require linear history if compatible with merge strategy.
6. **Do not allow bypass** / apply rules to administrators once you have verified the complete recovery/review workflow, to avoid locking out the sole maintainer.
7. Save and **verify** that the branch shows as protected; test a non-fast-forward push and failing PR checks using harmless synthetic branches.

Until these steps are genuinely enabled in GitHub, CODEOWNERS and CI are **advisory gates only**: they do not block direct pushes, force pushes or deletion of `main`.

## Security settings (administrator)

Open **Settings → General** and review **Allow forking**; disable it for the private preview if not necessary. Review collaborator access, deploy keys, webhooks and connected apps; apply least privilege. Enable automatic deletion of merged branches if useful.

Open **Settings → Actions → General**: restrict permitted actions to trusted GitHub-owned actions used in this repository, keep default workflow token **read-only**, and require approval for workflows from untrusted fork contributors. The workflow YAML already declares `permissions: contents: read`.

Open **Settings → Security and quality → Advanced Security**: inspect **Dependabot** and secret scanning eligibility. The committed `.github/dependabot.yml` requests weekly updates to GitHub Actions; it does **not** turn on paid security products. On applicable free **public** repositories, GitHub secret scanning can run automatically; private repositories may require an eligible paid or organization plan. Keep the local static and history scanners active regardless.

**Private vulnerability reporting** is a feature for **public** repositories. Do not represent it as enabled during private preview; enable it in the Advanced Security page after public launch if desired.

## Release gate

Before visibility changes: confirm `main.protected=true` in GitHub, check the enabled settings in the admin UI, ensure latest CI is green, review history manually, validate actual host installations, and have the copyright holder sign off on MIT attribution. The user must explicitly authorize any eventual Public change.

GitHub documentation:
- [Managing protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Actions Dependabot updates](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/auto-update-actions)
- [Secret scanning eligibility](https://docs.github.com/en/code-security/how-tos/secure-your-secrets/detect-secret-leaks/enable-secret-scanning)
- [Private vulnerability reporting eligibility](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository)
