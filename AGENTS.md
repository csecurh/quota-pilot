# QuotaPilot — install from a GitHub repository

When a user provides `https://github.com/csecurh/quota-pilot` and asks you to **install, set up or activate** QuotaPilot, act as an installation assistant **only if you have access to the user's local computer**, a shell, and the host's plugin configuration or plugin manager.

**The user-facing workflow is just sharing the GitHub URL and granting the host's requested permissions. Do not ask them to download ZIPs, open PowerShell, install Node.js, npm or Git manually.**

1. Check your current host and whether your tools execute **on the same machine** as the user's Codex/Claude/ChatGPT Desktop. A cloud-only agent cannot install a plugin locally on the user's PC. In that case, report the limitation; don't falsely claim success.
2. Inspect `scripts/agent-bootstrap.sh` (macOS/Linux) or `scripts/agent-bootstrap.ps1` (Windows). These fetch a **pinned GitHub release**, verify a hard-coded SHA-256 and store its bundled Node runtime under the user's `~/.quotapilot/agent-installs/` without administrator privileges. Downloads are initiated only for an explicit installation request, subject to normal host approval. There is no third-party SaaS.
3. On Windows execute `powershell -NoProfile -File scripts/agent-bootstrap.ps1` or from PowerShell `./scripts/agent-bootstrap.ps1`. On macOS/Linux execute `sh scripts/agent-bootstrap.sh`. Neither needs Node/npm/Git **at runtime**. Never pipe unreviewed remote shell code into a shell.
4. Read the `INSTALLED <directory>` or `ALREADY_INSTALLED <directory>` response and use that directory as the **local plugin root**, not the source checkout. Do not expose local paths in public issue reports. If installation fails, report the exact safe status and do not silently disable OS security mechanisms.
5. Using your host's **documented** plugin management capability, register that local marketplace/plugin and enable `quota-pilot@ai-usage` if supported:
   - **Codex with CLI:** `codex plugin marketplace add "<installed-directory>"`, then use the host's /plugins capability to enable QuotaPilot. When needed, invoke the bundled runtime to run `scripts/install-codex-hud.mjs` to configure the **native** footer conservatively.
   - **Claude Code:** use the host's `/plugin marketplace add <installed-directory>` and `/plugin install quota-pilot@ai-usage`. When needed, invoke the bundled runtime to run `scripts/install-claude-hud.mjs`; preserve an existing custom status line. Respect the host's hook trust dialog.
   - **ChatGPT Desktop:** only if the local desktop Plugins UI can load a Git/local marketplace, use its documented UI to add the installed plugin root. If your agent cannot interact with this UI or the host does not support local stdio MCP, tell the user. Never substitute a fake remote HTTP MCP or claim PiP works without testing.
6. **Verify** the host recognizes `get_overview`, `open_hud` and `get_usage` or its native footer/status line. Differentiate an unavailable provider from MCP `-32602`; missing quotas should display as unknown. Provider authentication remains the original host's responsibility. Codex subscription metrics require an accessible authenticated Codex app-server.
7. Explain what was actually installed, what requires a host restart/trust step, and what you were unable to test. No credentials, cookies, prompts or transcripts should be requested.

Maintain English/Spanish responses according to user language. Never modify another repository, bypass endpoint permissions, disable Gatekeeper or Windows antivirus, or assume an agent operating only in the cloud can access the user's computer.

See [docs/AGENT-INSTALL.md](docs/AGENT-INSTALL.md) / [docs/es/AGENT-INSTALL.md](docs/es/AGENT-INSTALL.md).
