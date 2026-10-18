---
name: chatgpt-hud
description: Verify and open the ChatGPT usage HUD using existing read-only MCP tools. Never install Codex/Claude settings.
---

# ChatGPT / OpenAI plugin onboarding — read-only by default

You are onboarding the **ChatGPT UI**, not setting up the Codex CLI or Claude Code. A user opening ChatGPT Desktop is **not** proof that the agent's shell runs on their Windows PC; ChatGPT Work can execute in an isolated cloud environment.

**Do not run an installation script, download a release, request Internet/write/shell permissions, create `.quotapilot` or `tmp`, modify a `plugins` directory, or edit `config.toml` / a native Codex/Claude footer during ChatGPT onboarding.** The bundled OpenAI lifecycle hook performs no writes.

1. First, use only already-connected **QuotaPilot MCP tools**: call `get_overview` and `open_hud` (both are read-only). If `get_usage` is useful, use the provider the user actually requests. Do **not** call installers as a fallback.
2. If tools are not available, return a **read-only status**: "QuotaPilot HUD unavailable in this ChatGPT session. The local MCP executor/plugin is not connected." Explain that the plugin must be enabled through **ChatGPT's own Plugins UI** and that the host must support a local stdio MCP executor. Do not infer installation success from the presence of a marketplace, a skill, or a repository.
3. If the provider is unavailable, distinguish `-32602` protocol failure from a successful tool response with unavailable usage. Never invent percentages, reset times or support for a global floating overlay.
4. **Do not automatically switch to Codex setup**, even if a previous message discussed Codex or the user installed ChatGPT Desktop on Windows. To configure a Codex footer, the user must explicitly ask for **Codex CLI footer** and the agent must be running in a verified local Codex context with separate authorization. The skill for configuring Codex is not this ChatGPT onboarding.
5. **Important nuance:** the first-party ChatGPT Plugins manager can save plugin enable/disable settings in `~/.codex/config.toml`. That host-managed action is separate from QuotaPilot's optional `scripts/install-codex-hud.mjs`. Never ask for broad combined filesystem permissions or manually write TOML to guess the plugin manager's behavior. A platform permission dialog must be evaluated against the action actually underway.
6. When local execution is unavailable, stop after explaining the limitation. No repeated install retries, administrator elevation, disabling Windows protection, manual ZIP downloads, Node/npm setup or changes to unrelated files.

**Español:** Si se ejecuta en ChatGPT Desktop, comprueba primero `get_overview` y `open_hud`. Si no existen, informa que el MCP local no está conectado; **no instales Codex**, no ejecutes PowerShell, no pidas acceso a `.quotapilot`, `plugins`, `tmp` ni ajustes del footer. El gestor oficial de plugins puede guardar preferencias en `config.toml`, pero eso no autoriza a QuotaPilot a modificar el footer de Codex.
