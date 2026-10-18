# Installing QuotaPilot from an AI agent

**Language / Idioma: English · [Español](es/AGENT-INSTALL.md)**

## ChatGPT Desktop / Work — use the plugin UI, not an installer

**ChatGPT onboarding does not run an installation script.** When the QuotaPilot MCP tools are already connected, call `get_overview` and `open_hud`. If they are absent, the local MCP server is not connected in that session; installing an executable in a cloud workspace is **not** installation on the user's Windows computer.

Open ChatGPT's **Plugins** browser, choose the configured local/repo marketplace **AI Usage**, and enable `quota-pilot` if supported. A host capable of executing **local stdio MCP servers on the user's computer** is required; the source checkout also needs a runtime unless a host has already installed the portable distribution. A GitHub URL or skill cannot create an executable runtime in a restricted cloud session. Public plugin-directory distribution of local servers is subject to additional OpenAI eligibility/review.

**When you see a permission request to access Internet plus `.quotapilot`, `plugins`, `config.toml` and `tmp` because the agent wants to “configure Codex”: decline that specific agent operation.** QuotaPilot's ChatGPT onboarding must not install Codex's native TUI footer, execute `agent-bootstrap`, or retry a denied folder operation.

**Nuance:** ChatGPT's *own plugin manager* may legitimately update `~/.codex/config.toml` when saving a plugin enable/disable preference. That is different from an agent manually editing Codex footer settings. Evaluate a host-managed permission prompt based on its specific action rather than simply on the filename.

## Codex CLI — optional native footer

For a **verified local Codex CLI** agent, share the repo and ask explicitly: “Install QuotaPilot for Codex CLI and configure its native footer.” The agent must seek your consent for the footer settings separately. The agent bootstrap requires `scripts/agent-bootstrap.ps1 -HostType Codex` on Windows or `sh scripts/agent-bootstrap.sh --host codex` on macOS/Linux. It downloads an official, SHA-256 pinned QuotaPilot release and registers the local plugin through supported CLI/host controls; it does not require you to manually install Node/npm.

## Claude Code — optional status line

For a **verified local Claude Code** agent, ask explicitly: “Install QuotaPilot for Claude Code and configure its status line.” The bootstrap requires `-HostType Claude` or `--host claude`. Follow the host's trust prompts; a custom existing status line must be preserved.

## Safety and limitations

- The bootstrap refuses calls with no host and rejects `ChatGPT` as a host.
- The ChatGPT setup skill only uses already connected read-only tools; it never downloads releases, creates `.quotapilot` folders or modifies Codex/Claude settings.
- An isolated cloud agent may not be able to install into your Windows PC; it must say so rather than requesting additional filesystem permissions.
- If the host offers no local MCP app bridge, the widget cannot run. Provider quotas may also be unavailable; never invent them.
- Never paste tokens, cookies, prompts, source code, transcripts or confidential error logs into public issues.

For manually installing a portable bundle on eligible hosts, see [PORTABLE.md](PORTABLE.md); it is an alternative, **not** something ChatGPT Work should try as a workaround.
