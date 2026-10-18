# Instalar QuotaPilot desde un agente de IA

**Idioma: [Español](AGENT-INSTALL.md) · [English](../AGENT-INSTALL.md)**

## ChatGPT Desktop / Work — utiliza Plugins, no un instalador

**La configuración inicial de ChatGPT no ejecuta instaladores.** Si las herramientas MCP de QuotaPilot ya están conectadas, usa `get_overview` y `open_hud`. Si no aparecen, el MCP local no está conectado en esa sesión. Instalar un ejecutable en un entorno aislado en la nube **no lo instala en tu Windows**.

Abre el gestor de **Plugins** de ChatGPT, selecciona el marketplace local configurado **AI Usage** y habilita `quota-pilot`, si tu versión lo permite. El host debe ser capaz de ejecutar un **MCP local por stdio en tu ordenador** y disponer de un runtime compatible. Una URL de GitHub o una skill por sí sola no pueden iniciar un proceso local en una sesión en la nube sin permisos. La publicación de servidores locales en el directorio oficial tiene requisitos adicionales.

**Si el agente solicita Internet y acceso a `.quotapilot`, `plugins`, `config.toml` y `tmp` para «configurar Codex», rechaza esa solicitud concreta.** La configuración inicial de ChatGPT no debe instalar el footer de Codex, ejecutar `agent-bootstrap` ni reintentar operaciones rechazadas por Windows.

**Matiz importante:** el *gestor oficial de Plugins de ChatGPT* puede guardar las preferencias de activación en `~/.codex/config.toml`. Eso no es lo mismo que el agente editando manualmente la barra de Codex. Evalúa qué acción solicita permiso, no únicamente el nombre del archivo.

## Codex CLI — footer nativo opcional

Si utilizas un **agente Codex CLI local y verificado**, comparte el repositorio y solicita explícitamente: «Instala QuotaPilot para Codex CLI y configura su footer». Los permisos para cambiar el footer se solicitan **por separado**. El instalador exige `scripts/agent-bootstrap.ps1 -HostType Codex` en Windows o `sh scripts/agent-bootstrap.sh --host codex` en macOS/Linux. Comprueba el SHA-256 de la versión oficial y utiliza el runtime incluido sin obligarte a instalar Node/npm manualmente.

## Claude Code — barra de estado opcional

Si utilizas un **agente Claude Code local y verificado**, solicita explícitamente la barra de estado. El instalador exige `-HostType Claude` o `--host claude`. Acepta los permisos propios del host y conserva una barra personalizada existente.

## Seguridad y limitaciones

- El bootstrap falla si no se especifica el host y rechaza `ChatGPT`.
- La skill inicial de ChatGPT usa solo herramientas de lectura previamente conectadas. No descarga software, no crea carpetas `.quotapilot` ni modifica Codex/Claude.
- Un agente ejecutado en la nube puede no tener acceso a tu Windows: debe informarlo sin pedir permisos adicionales de archivos.
- Sin soporte MCP local del host, el widget no puede funcionar. Si no hay cuotas del proveedor, deben mostrarse como desconocidas.
- Nunca compartas tokens, cookies, prompts, código fuente, transcripciones ni errores con datos privados en issues públicos.

Si necesitas instalar manualmente un paquete autónomo en un host compatible, consulta [PORTABLE.md](PORTABLE.md). **No es un paso que ChatGPT Work deba intentar para eludir permisos.**
