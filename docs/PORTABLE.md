# QuotaPilot 0.6.0 portable packages (EN)

**Language / Idioma: English · [Español](es/PORTABLE.md)**

**Agent-first installation is preferred:** [give the GitHub URL to your local agent](AGENT-INSTALL.md). Manual downloads are an optional fallback.

The **portable release archive includes the Node.js runtime** and all QuotaPilot JavaScript, manifests, hooks, and UI files. It needs **no separately installed Node.js/npm/Git** to *run*. Your compatible AI host is still required. There is **no automatic third-party downloader** at runtime.

## Download and select the correct package

From [GitHub Releases](https://github.com/csecurh/quota-pilot/releases/tag/v0.6.0-rc.3) download ONE archive:

| Your computer | Release asset |
| --- | --- |
| Windows x64 | `quota-pilot-win32-x64.zip` |
| macOS Apple Silicon | `quota-pilot-darwin-arm64.tar.gz` |
| macOS Intel | `quota-pilot-darwin-x64.tar.gz` |
| Linux x64 (modern glibc) | `quota-pilot-linux-x64.tar.gz` |

Other architectures are **not currently packaged**. macOS security approval/quarantine and Windows security prompts may require a user decision. These unsigned binaries are release candidates, **not signed/notarized** apps. Never disable antivirus, Gatekeeper or system-wide script protections just to run QuotaPilot.

Check the archive SHA-256 against `SHA256SUMS.txt` in the same GitHub Release before extracting. This detects accidental corruption but **not a compromised release account** (both files share the same publisher). On PowerShell: `Get-FileHash .\quota-pilot-win32-x64.zip -Algorithm SHA256`. On macOS/Linux: `shasum -a 256 quota-pilot-*.tar.gz` or `sha256sum`.

Extract the ZIP with Windows File Explorer, or use `tar -xzf quota-pilot-<platform>.tar.gz` for macOS/Linux. The extracted `quota-pilot-<platform>-<arch>/` folder is the *plugin root*. Keep it on disk for as long as you use the plugin.

## Install the local package through your host

**Codex / compatible ChatGPT Desktop host:** use the host's **Add local plugin / local marketplace** feature and select the extracted plugin root. If your host only supports CLI marketplace commands, register the local folder from **within the host's own CLI** using `codex plugin marketplace add /path/to/extracted/root` (or the host's equivalent). This does **not** require Node or npm, but the **Codex CLI itself** must already exist to use its CLI commands. A ChatGPT Desktop build without local plugin support cannot be made compatible by this archive alone.

**Claude Code:** from the running Claude Code host, add the local marketplace path with `/plugin marketplace add /path/to/extracted/root`, then install `quota-pilot@ai-usage`; accept the host's trust prompt and start a new session. Claude uses the local packaged plugin, not the source repository. The status-line installer copies the bundled runtime into the private QuotaPilot data directory so the status line continues to work after host/plugin refreshes.

**Direct scripts (optional, no system Node needed):** from the extracted root:

Windows PowerShell:
```powershell
.\runtime\node.exe .\scripts\install-claude-hud.mjs
# OR for Codex CLI only:
.\runtime\node.exe .\scripts\install-codex-hud.mjs
```

macOS/Linux:
```sh
./runtime/node ./scripts/install-claude-hud.mjs
# OR for Codex CLI only:
./runtime/node ./scripts/install-codex-hud.mjs
```

The portable MCP manifest starts the bundled `runtime/node[.exe]` directly using the host-provided plugin root, without searching `PATH`. Hooks explicitly choose `codex` or `claude`. No provider credentials are requested.

## Provider limits and honest compatibility notes

- **No external CLI needed to *open* a supported ChatGPT MCP App HUD.** It may show **no real quota metrics** if neither an authenticated local Codex provider nor Claude snapshot is available.
- ChatGPT subscription usage is **not** queried via private cookies, local authentication databases or undocumented endpoints. There is no authorized direct ChatGPT plan-quota API used by this software.
- **Codex metrics:** require an already installed and authenticated Codex executable accessible to the host; shipping Node with QuotaPilot does not ship the proprietary Codex CLI.
- **Claude metrics:** require the locally installed Claude Code host to provide status-line quota fields; missing fields remain unavailable.
- The PiP window is conversation-scoped when supported, **not** a guaranteed desktop-wide overlay.
- **GitHub source marketplace installs remain developer-oriented** and currently reference `node`. Use the portable package if you do not want to install Node on your computer. A release archive is not automatically installed just because a GitHub repository is public.

## Technical verification and release status

The release pipeline tests a complete bundle on each of four native GitHub Actions runners with `PATH` intentionally cleared for the spawned executable. It verifies MCP tool calls, strict metadata handling, installable private Claude runtime, license, manifest paths and ZIP/tar packaging. Release archives are **not proof of support** on every actual ChatGPT/Codex/Claude host.

Read [installation](INSTALL.md), [privacy](PRIVACY.md), [threat model](THREAT-MODEL.md) and [real-host testing](HOST-TEST-PLAN.md). Node.js third-party notices are included at `runtime/NODE-LICENSE`. MIT applies to QuotaPilot's source code, not as a claim to own Node's dependencies.
