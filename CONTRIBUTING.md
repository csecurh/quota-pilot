# Contributing to QuotaPilot

QuotaPilot is [MIT licensed](LICENSE) and its GitHub source is **public**. Contributions, bug reports and documentation fixes are welcome. Runtime compatibility is still being tested for `0.5.0-rc.1`.

## Development

Use Node.js 22.13+, Git and a checkout. **Do not run `npm install`: no runtime/development dependencies are required.**

~~~sh
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
npm run check
npm run doctor
npm run security:history
~~~

The historical scan requires a complete non-shallow checkout. CI checks syntax, tests and current source on Ubuntu, macOS and Windows; Ubuntu also audits reachable Git history.

## Before a pull request

- Work from a feature branch and open a pull request describing behavior and backward compatibility.
- Add automated tests for changed features and include only **synthetic, sanitized** data.
- Keep MCP tools read-only, validate inputs, limit memory and never reflect provider stderr/paths in public errors.
- No outbound network clients, telemetry, dependencies, unsafe HTML sinks or accidental credential collection without an explicit security review.
- Preserve Codex/Claude host settings; do not replace a user's custom status line.
- Preserve the technical ID `quota-pilot` and the host-visible labels ChatGPT, Codex, Claude Code or AI Usage.
- Check changes against [installation docs](docs/INSTALL.md), [privacy FAQ](docs/PRIVACY.md) and [LICENSE](LICENSE).
- Do not include secrets or personal data in issues/PRs; follow [SECURITY.md](SECURITY.md) for vulnerabilities.

## Review policy

CODEOWNERS identifies the maintainer for sensitive files. **Review requirements only become enforceable when the GitHub admin activates a main branch protection rule or ruleset**; see [GITHUB-SECURITY-SETUP](docs/GITHUB-SECURITY-SETUP.md).

By contributing, you affirm you have the right to submit your changes under MIT; please review third-party licenses for any external assets or code.
