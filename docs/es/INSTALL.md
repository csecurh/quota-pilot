# Instalación, actualización y desinstalación

**Idioma: [Español](INSTALL.md) · [English](../INSTALL.md)**

QuotaPilot está disponible públicamente como código fuente [MIT](../../LICENSE). **No significa que esté publicado en el directorio universal de plugins de ChatGPT.** Las pruebas automáticas no sustituyen las pruebas en clientes reales.

## Instalación directa por Git en Windows x64

En un host local compatible puedes instalar **csecurh/quota-pilot directamente desde el marketplace GitHub**, sin instalar Node.js. El repositorio incluye `runtime/node.exe`; `mcp.json` ejecuta `./runtime/node.exe`. No necesitas PowerShell, ZIP ni descarga automática al iniciar MCP. Comprueba el origen y SHA-256 en `runtime/NODE-PROVENANCE.json`. Solo Windows x64; macOS/Linux requieren el paquete específico.

## Primero identifica el host

**ChatGPT Desktop / Work:** usa **Plugins** para activar QuotaPilot si ya aparece en un marketplace local compatible. Prueba `open_hud` y `get_overview`. La skill inicial de ChatGPT **no descarga nada ni configura el footer de Codex**. Si no existe un ejecutor MCP local, detente: repetir un instalador bloqueado no lo soluciona. El gestor oficial puede guardar preferencias en `~/.codex/config.toml`, distinto de editar manualmente la barra de Codex.

**Codex CLI / Claude Code:** si el agente tiene terminal local, comparte la URL del repositorio indicando cuál host deseas configurar. Sigue la [guía para agentes](AGENT-INSTALL.md); los instaladores exigen indicar el host. No es necesario instalar Node/npm por separado.

## Alternativa: paquete autónomo

Descarga el paquete desde [GitHub Releases](https://github.com/csecurh/quota-pilot/releases/tag/v0.6.0-rc.4) y registra la carpeta extraída en el gestor de plugins de un host compatible. El runtime viene incluido. Consulta la [guía autónoma](PORTABLE.md) para elegir el sistema, comprobar su integridad y entender las limitaciones.

## Requisitos (solo código fuente)

Node.js 22.13+, Git, un host compatible y sesión iniciada en el proveedor original Codex o Claude Code para obtener métricas reales. No se necesita `npm install`, Supabase ni introducir nuevas credenciales. Los hooks locales pueden modificar la configuración del host cuando lo autorizas; revisa los scripts antes de ejecutarlos.

## Claude Code mediante marketplace

En una sesión actual de Claude Code, ejecuta:

```text
/plugin marketplace add csecurh/quota-pilot
/plugin install quota-pilot@ai-usage
```

Reinicia Claude Code, acepta el hook local si el host lo solicita y comprueba en la barra nativa las métricas de uso, restante y reinicio de 5 horas/7 días cuando estén disponibles. Si estabas usando `ai-usage-private` en una versión antigua, elimina y vuelve a añadir ese marketplace para migrar.

**Alternativa directa:**

```bash
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
node scripts/install-claude-hud.mjs
node scripts/doctor.mjs
```

El instalador copia el helper a `~/.quotapilot/` y modifica `~/.claude/settings.json` **solo si no hay una barra personalizada incompatible**. Reinicia el host.

## Windows: cuando PowerShell no reconoce `codex`

**ChatGPT Desktop no instala automáticamente el comando Codex CLI.** Si PowerShell indica `CommandNotFoundException` al usar `codex plugin marketplace ...`, ese comando no llegó a ejecutarse. Abre **PowerShell normal, sin privilegios de administrador**, y comprueba:

```powershell
node --version
npm --version
Get-Command codex -ErrorAction SilentlyContinue
```

Si `codex` no existe pero Node/npm están instalados, instala **Codex CLI (producto independiente de QuotaPilot)** desde su distribución oficial:

```powershell
npm install -g @openai/codex
```

Cierra y vuelve a abrir PowerShell y ejecuta `codex --version`. Si la instalación de npm falla en Windows, consulta el [instalador nativo oficial de OpenAI](https://github.com/openai/codex#installing-and-running-codex-cli) en lugar de descargar ejecutables de terceros. Antes de ejecutar cualquier script remoto, revisa su origen y contenido.

Solo **después** de que funcione `codex --version`:

```powershell
codex plugin marketplace list
codex plugin marketplace add csecurh/quota-pilot
codex plugin marketplace upgrade ai-usage
```

El marketplace se instala desde la interfaz **Plugins** de una versión compatible de ChatGPT Desktop, incluso si no tienes Codex CLI configurado. Prueba primero actualizar/reinstalar desde **Plugins → Installed / AI Usage** y reiniciar Desktop. El plugin utiliza una copia en caché y no se actualiza por el solo hecho de modificar GitHub. Instalar Codex CLI sirve para usar comandos de terminal y proporciona un ejecutable local desde el que QuotaPilot puede consultar límites; **no garantiza** por sí solo que el host ejecute el widget MCP.

## Codex CLI mediante marketplace

```bash
codex plugin marketplace add csecurh/quota-pilot
codex plugin marketplace list
codex
```

Dentro de Codex abre `/plugins`, selecciona **AI Usage → quota-pilot → Install** e inicia una sesión nueva y de confianza. Si tu versión admite el hook de inicio, el footer mostrará `five-hour-limit` y `weekly-limit`. Si no, usa el instalador directo:

```bash
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
node scripts/install-codex-hud.mjs
node scripts/doctor.mjs
```

El instalador actualiza solo las líneas compatibles de `[tui].status_line` en `~/.codex/config.toml`; rechaza sintaxis TOML ambigua en lugar de alterar otras opciones. El footer nativo no permite añadir cualquier token de reinicio exacto: utiliza `/status` o la herramienta MCP `get_usage` si están disponibles.

## ChatGPT Desktop — experimental y sin prueba de host real

Tu versión de ChatGPT Desktop debe permitir **plugins locales, ejecución MCP por stdio y puente de interfaz de MCP Apps**. Para probarlo:

1. Instala una versión compatible de ChatGPT Desktop/Codex con ejecución de plugins locales.
2. Si Codex CLI lo admite, registra `codex plugin marketplace add csecurh/quota-pilot`. Alternativamente, clona el repositorio y añade su ruta local al marketplace.
3. Reinicia ChatGPT Desktop, abre **Plugins**, busca **AI Usage** e instala **quota-pilot**, si aparece.
4. En una conversación nueva con el plugin habilitado solicita: **«Abre mi HUD de uso de IA»**. La herramienta `open_hud` intenta abrir el HUD, solicita PiP y se actualiza mientras el widget esté montado.

Si tu versión de Desktop no proporciona el puente MCP local, **no es una integración compatible en esa versión**. No expongas el servidor local stdio en Internet ni introduzcas tokens en hosts no confiables. El flujo remoto de servidores MCP requiere una URL y no sustituye automáticamente a un plugin local.

## Actualización y desinstalación

Para actualizar un clon: `git pull --ff-only`, `npm run check` y vuelve a ejecutar únicamente el instalador de tu host si lo utilizas. Reinicia el host. Los marketplaces también pueden actualizarse desde su interfaz.

- **Claude:** deshabilita/desinstala en su gestor. Para instalación directa, elimina `settings.statusLine` solo si el comando apunta a `~/.quotapilot/claude-statusline.mjs`. Borra `~/.quotapilot/` únicamente tras revisar su contenido.
- **Codex:** desinstala desde `/plugins`; para instalación directa, retira `five-hour-limit` y `weekly-limit` de tu footer conservando otras entradas.
- **ChatGPT:** retira el plugin local desde Plugins. QuotaPilot no conserva credenciales de proveedores.

## Preferencia de idioma

El HUD detecta inglés o español según el idioma del host y admite el selector **EN / ES**. La barra de Claude Code y `npm run doctor` usan el idioma del SO. Para cambiarlo explícitamente, define `QUOTAPILOT_LANG=es` o `QUOTAPILOT_LANG=en` **en el entorno del proceso**. Esta preferencia no se guarda en los snapshots ni modifica la autenticación.

## ChatGPT Desktop: error `-32602 Invalid params`

Si tanto `get_usage` como `open_hud` devuelven `-32602 Invalid params`, **actualiza o reinstala el plugin del marketplace al último commit**, reinicia ChatGPT Desktop e inicia una **conversación nueva**. Los hosts MCP pueden incluir metadatos reservados en `params._meta`; versiones anteriores de QuotaPilot rechazaban ese campo válido. La nueva versión admite los metadatos sin mezclarlos con los argumentos de herramientas, mostrarlos ni persistirlos.

Si `get_usage` devuelve `codex usage is temporarily unavailable.` como resultado de herramienta (no como error de protocolo `-32602`), la validación MCP ya funciona, pero queda por comprobar el acceso local al proveedor Codex. Ejecuta `npm run doctor` y `codex --version` en tu terminal, sin compartir tokens ni rutas privadas.

Si `open_hud` funciona pero no aparece el widget, comprueba por separado la compatibilidad MCP Apps/PiP de tu versión del host.

## Diagnóstico

```bash
npm run check
npm run doctor
node scripts/doctor.mjs --json
```

El diagnóstico muestra **solo estados** sin rutas, configuración ni secretos. Que aparezca `not-configured` es normal si no instalaste ese proveedor. Para estimar autonomía hacen falta dos observaciones separadas al menos cinco minutos. Si no hay métricas, inicia sesión en el proveedor original; nunca pegues el token en QuotaPilot.

## Reportar errores o vulnerabilidades

Para errores normales utiliza los [issues públicos](https://github.com/csecurh/quota-pilot/issues/new/choose) con datos falsos o anonimizados. Para vulnerabilidades sigue [SECURITY.es.md](../../SECURITY.es.md) por una vía privada.

[Plan detallado de pruebas reales](HOST-TEST-PLAN.md).
