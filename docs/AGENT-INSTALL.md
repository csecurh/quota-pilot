# Install QuotaPilot by asking your AI agent (English)

**Language / Idioma: English · [Español](es/AGENT-INSTALL.md)**

The **preferred onboarding** is to provide the URL **`https://github.com/csecurh/quota-pilot`** to an agent that can execute commands **on the user's computer** and ask it to install the plugin. Users should **not manually download a ZIP, install Node/npm, or run a PowerShell command**.

### Copy into your local agent

> Install QuotaPilot from https://github.com/csecurh/quota-pilot for my current AI host. Follow AGENTS.md and use the bundled agent bootstrap. Don't ask me to install Node, npm or Git manually. Request host permissions as needed, preserve my settings, and verify that the HUD or native status line works. Report any host limitations.

The agent should obtain or inspect the repo, run `scripts/agent-bootstrap.ps1` on Windows or `scripts/agent-bootstrap.sh` on macOS/Linux, and use the resulting local folder as its plugin marketplace root. It can register and enable the plugin using **supported native host controls**. The bootstrap downloads a **SHA-256-pinned release asset automatically**, checks it locally, and uses the included runtime. It does not use an elevated shell, a third-party service, or a remote install script piped into a shell. The host may ask you to **approve** execution or trust a plugin hook; approval cannot be bypassed.

**Important technical distinction:** cloning/adding the *source* marketplace by URL is not enough to execute its Node-based MCP server on machines without Node. The agent bootstrap prepares the already-tested self-contained local marketplace and the agent registers **that** package. The release archive is downloaded **by the agent behind the scenes**, not by the user.

### What depends on the host

- **Codex CLI and Claude Code** agents commonly provide a local shell and local plugin management. The agent can complete the bootstrap and use the host-native plugin commands, subject to user trust prompts.
- **ChatGPT Desktop / ChatGPT Work:** it only works if your installation supports **local plugin execution** and the agent can operate the actual **local** computer/plugin manager. A cloud computer does not automatically install on your Windows desktop. Registering a GitHub repository doesn't guarantee a local stdio executor or PiP. Universal public Plugins Directory listing is a separate submission process.
- **Provider telemetry:** bundled Node is free to run locally, but obtaining real Codex quotas still requires an authenticated accessible Codex provider. QuotaPilot does not read ChatGPT browser cookies or undocumented subscription APIs. Claude Code supplies status-line usage when available.

### Security and verification

The scripts pin the four official release SHA-256 checksums directly in source, download from GitHub HTTPS, reject mismatches and unsafe extraction targets and install only in a user-private location. Always review the bootstrap and release provenance before granting execution permission. The agent should verify `open_hud` / `get_overview`, safe errors and native footer or status line. A disabled host bridge or missing provider must be reported as such, **not as a successful installation**.

Manual archives still exist for offline/developer workflows at [PORTABLE.md](PORTABLE.md), but are **not the recommended user onboarding**.
