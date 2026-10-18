# Instalar QuotaPilot solicitándolo a tu agente de IA

**Idioma: [Español](AGENT-INSTALL.md) · [English](../AGENT-INSTALL.md)**

El **método recomendado** es compartir **`https://github.com/csecurh/quota-pilot`** con un agente que pueda ejecutar acciones **en el mismo equipo del usuario** y pedirle que instale el plugin. El usuario **no debería descargar ZIP, instalar Node/npm ni escribir comandos de PowerShell manualmente**.

### Mensaje para copiar en tu agente local

> Instala QuotaPilot desde https://github.com/csecurh/quota-pilot para el agente de IA que estoy usando. Sigue AGENTS.md y utiliza el instalador asistido incluido. No me pidas instalar Node, npm o Git manualmente. Solicita los permisos necesarios del host, respeta mis ajustes y comprueba que funciona el HUD o la barra de estado. Indica las limitaciones reales del host.

El agente obtiene/revisa el repositorio, ejecuta `scripts/agent-bootstrap.ps1` en Windows o `scripts/agent-bootstrap.sh` en macOS/Linux y registra la carpeta resultante como plugin o marketplace local. El instalador **descarga automáticamente un paquete oficial fijado por SHA-256**, verifica su integridad y utiliza su runtime incluido. No requiere ejecutar como administrador, utilizar servicios externos ni ejecutar scripts remotos sin revisión. El host puede pedirte **aprobar** el proceso y confiar en un hook.

**Diferencia técnica:** agregar el repositorio *fuente* de GitHub al marketplace no basta para iniciar su MCP basado en Node cuando Node no está presente. El agente prepara el paquete local autónomo y registra **esa** carpeta. El usuario no descarga el archivo manualmente: lo hace el agente con verificación y autorización.

### ChatGPT Desktop: una solicitud de permisos no demuestra instalación

Si ChatGPT solicita Internet **y** editar `.quotapilot`, `plugins`, `config.toml` y `tmp` para configurar QuotaPilot en ChatGPT Desktop, **rechaza esa solicitud**. El HUD de ChatGPT no necesita modificar el `config.toml` de Codex. El hook compartido de OpenAI ahora no escribe archivos. ChatGPT Work puede ejecutar herramientas en un ordenador aislado en la nube, aunque la conversación se muestre desde ChatGPT Desktop.

Antes de autorizar descargas o permisos para `.quotapilot`, el agente debe confirmar que puede registrar plugins mediante un mecanismo **local y documentado** sobre **tu equipo real**. Si no puede, debe detenerse y explicar la limitación. Configurar el footer de Codex o la barra de Claude requiere permisos diferentes y específicos.

### Depende del host

- **Codex CLI y Claude Code:** normalmente tienen terminal y gestión de plugins local; el agente puede ejecutar el instalador y utilizar los comandos oficiales del host, respetando las solicitudes de confianza.
- **ChatGPT Desktop / ChatGPT Work:** necesita un gestor de plugins locales compatible **y acceso real del agente a ese equipo**. Un agente en un ordenador remoto no instala automáticamente un servidor en tu Windows. Una URL GitHub no garantiza ejecución local MCP ni PiP. Aparecer en el directorio universal de plugins requiere publicación separada.
- **Métricas reales:** el Node integrado ejecuta el HUD, pero las cuotas de Codex siguen necesitando un proveedor Codex accesible y autenticado. QuotaPilot no accede a cookies de ChatGPT ni a endpoints privados de la suscripción. Las métricas Claude dependen de la barra nativa.

### Seguridad y verificación

Los instaladores incluyen SHA-256 conocidos de las cuatro versiones publicadas, usan HTTPS de GitHub, rechazan hashes incorrectos y destinos inseguros y guardan el plugin en una carpeta privada del usuario. El agente debe verificar `open_hud`, `get_overview`, errores seguros y la barra nativa correspondiente. Sin acceso a métricas o al puente local, debe indicarlo **sin simular un funcionamiento correcto**.

Los archivos ZIP/TAR seguirán disponibles para entornos sin agente local u offline en [PORTABLE.md](PORTABLE.md), pero **no son el método recomendado**.
