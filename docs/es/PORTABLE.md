# QuotaPilot 0.6.0 — paquetes autónomos (ES)

**Idioma: [Español](PORTABLE.md) · [English](../PORTABLE.md)**

**Los paquetes incluyen Node.js**, el servidor MCP, hooks, scripts, manifiestos y HUD. Para *ejecutarlos* no necesitas instalar Node.js, npm ni Git por separado, pero sí necesitas un **host de IA compatible**. QuotaPilot no descarga software de terceros silenciosamente durante su ejecución.

## Descarga el paquete adecuado

Abre [GitHub Releases](https://github.com/csecurh/quota-pilot/releases/tag/v0.6.0-rc.1) y descarga **solo uno**:

| Equipo | Archivo |
| --- | --- |
| Windows x64 | `quota-pilot-win32-x64.zip` |
| macOS Apple Silicon | `quota-pilot-darwin-arm64.tar.gz` |
| macOS Intel | `quota-pilot-darwin-x64.tar.gz` |
| Linux x64 (glibc reciente) | `quota-pilot-linux-x64.tar.gz` |

No hay paquetes para otras arquitecturas por ahora. **Son binarios de versión candidata sin firma ni notarización**. Si Windows o macOS solicita una autorización de seguridad, revísala; nunca desactives el antivirus, Gatekeeper o protecciones globales para instalarlos.

Verifica SHA-256 antes de descomprimir. Compara con `SHA256SUMS.txt` de la misma versión en GitHub. En PowerShell: `Get-FileHash .\quota-pilot-win32-x64.zip -Algorithm SHA256`. En macOS/Linux: `shasum -a 256 quota-pilot-*.tar.gz` o `sha256sum`. Esto detecta daños accidentales, **no** una cuenta GitHub comprometida.

Descomprime el ZIP mediante el Explorador de Windows o los archivos TAR con `tar -xzf ...`. La carpeta `quota-pilot-<sistema>-<arquitectura>/` será la *raíz del plugin*; consérvala mientras utilices QuotaPilot.

## Instalación en cada host

**Codex / ChatGPT Desktop compatible:** en el gestor del host, utiliza **Agregar plugin local / marketplace local** y selecciona la carpeta extraída. Si tu host requiere comandos, utiliza el CLI **del propio host**: `codex plugin marketplace add /ruta/a/carpeta-extraída`, o su equivalente. No requiere Node ni npm, pero **sí Codex CLI** cuando usas comandos `codex`. Una versión de ChatGPT Desktop que no permita plugins locales no será compatible solo por descargar el archivo.

**Claude Code:** desde la sesión abierta ejecuta `/plugin marketplace add /ruta/a/carpeta-extraída` y después `/plugin install quota-pilot@ai-usage`. Autoriza el hook si el host lo solicita y abre sesión nueva. El instalador copia el runtime autónomo a su directorio privado de datos para que la barra de estado siga funcionando tras actualizar.

**Instalación directa opcional, sin Node del sistema:**

Windows PowerShell:
```powershell
.\runtime\node.exe .\scripts\install-claude-hud.mjs
# O, únicamente para Codex:
.\runtime\node.exe .\scripts\install-codex-hud.mjs
```

macOS/Linux:
```sh
./runtime/node ./scripts/install-claude-hud.mjs
# O, únicamente para Codex:
./runtime/node ./scripts/install-codex-hud.mjs
```

El MCP inicia `runtime/node[.exe]` de este paquete y no busca `node` en PATH. Los hooks indican expresamente el host, para evitar confusiones entre Codex y Claude. No se necesitan nuevas contraseñas ni tokens.

## Qué no resuelve el empaquetado

- **ChatGPT:** el HUD puede abrirse sin Codex CLI, siempre que el host permita MCP Apps locales, pero **no necesariamente mostrará la cuota real**. No se consultan cookies, credenciales internas ni endpoints privados de ChatGPT.
- **Codex:** las métricas necesitan un Codex CLI **ya instalado y autenticado**. Empaquetar Node no incluye ese ejecutable ni autoriza el acceso a sus datos.
- **Claude:** las cuotas dependen de los campos que el host Claude Code entregue a la barra de estado.
- **PiP:** puede funcionar en una conversación compatible; **no es un flotante universal y permanente del escritorio**.
- El **marketplace GitHub del código fuente** continúa orientado a desarrolladores y puede necesitar Node. Para no instalar Node, utiliza el paquete autónomo de Releases.

## Validación técnica

GitHub Actions empaqueta y ejecuta pruebas independientes por plataforma con el PATH del proceso vacío. Se prueban herramientas MCP, manejo seguro de metadatos, manifiestos, copia del runtime de Claude, licencia y archivos comprimidos. **No sustituye** pruebas reales de ChatGPT Desktop, Claude Code o Codex en tu equipo.

Consulta [instalación](INSTALL.md), [privacidad](PRIVACY.md), [modelo de amenazas](THREAT-MODEL.md) y [plan de pruebas reales](HOST-TEST-PLAN.md). Avisos de Node.js y terceros: `runtime/NODE-LICENSE`. La licencia MIT de QuotaPilot no implica propiedad de dependencias de Node.
