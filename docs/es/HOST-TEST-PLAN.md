# Plan de pruebas en hosts reales — sin compartir datos privados

**Idioma: [Español](HOST-TEST-PLAN.md) · [English](../HOST-TEST-PLAN.md)**

El repositorio es público, pero la instalación y ejecución deben comprobarse en **clientes reales compatibles**. Utiliza perfiles de prueba cuando sea posible. No publiques claves, prompts, código, transcripciones, rutas privadas, logs sensibles ni identificadores.

## Requisitos iniciales

1. Comprueba Node.js 22.13+, versiones actuales de los hosts y ejecución correcta de `npm run check`.
2. Ejecuta `npm run doctor`; registra **solo estados anonimizados** y versiones del host.
3. Comprueba que Codex/Claude Code ya tengan sesión iniciada **en su propia aplicación**. QuotaPilot nunca debe pedir credenciales.
4. El nombre visible será **ChatGPT**, **Codex**, **Claude Code** o **AI Usage**; no el nombre técnico QuotaPilot.
5. Verifica usado, restante, reinicio si el host lo proporciona, datos ausentes, al menos cinco minutos para proyecciones y alertas únicamente visuales.
6. Cambia el idioma del widget entre **EN** y **ES** y comprueba traducciones, accesibilidad y actualización sin perder datos.

## Claude Code

1. Dentro de Claude Code ejecuta `/plugin marketplace add csecurh/quota-pilot` y después `/plugin install quota-pilot@ai-usage`.
2. Inicia sesión nueva de confianza; comprueba porcentajes de ventanas 5h/7d y datos desconocidos como guion.
3. Comprueba que `~/.quotapilot/claude-latest.json` tenga permisos 0600 en POSIX y que solo incluya porcentajes/timestamps, sin IDs/prompts/rutas.
4. Comprueba que una barra `statusLine` ajena no se sobrescriba con el instalador directo.
5. Prueba `QUOTAPILOT_LANG=es` y `QUOTAPILOT_LANG=en` en un entorno de pruebas, actualización y desinstalación sin alterar otras opciones.

## Codex CLI

1. Ejecuta `codex plugin marketplace add csecurh/quota-pilot`, abre `codex` → `/plugins` e instala desde AI Usage.
2. Inicia una sesión nueva; comprueba `five-hour-limit` y `weekly-limit` y que se conserven los elementos originales del footer.
3. Comprueba fechas exactas de reinicio con `/status` o herramienta MCP donde estén disponibles; no se admiten tokens arbitrarios en el footer.
4. Actualiza/desinstala y comprueba que el TOML ajeno no cambie.

## ChatGPT Desktop — experimental

1. Confirma que tu instalación ofrece marketplace de plugins locales y ejecución permitida. Si no, registra **HOST NO COMPATIBLE**, no un fallo de QuotaPilot.
2. Añade el marketplace Git/local según la [guía de instalación](INSTALL.md), reinicia e instala quota-pilot desde AI Usage.
3. En una conversación nueva pide **«Abre mi HUD de uso de IA»**. Comprueba `open_hud`, llamadas MCP y el título ChatGPT.
4. Comprueba que el widget no accede a la red, admite estado sin métricas, cambios de disponibilidad, refresco cada 30 segundos y PiP opcional si el host lo permite.
5. Cierra la conversación: no esperes un flotante permanente por todo el escritorio ni que continúe en cualquier aplicación.

## Evidencia segura

| SO | Host y versión | Versión del plugin | Instalación | Interfaz correcta | Métricas | Actualización/desinstalación | Resultado |
|---|---|---|---|---|---|---|---|
| Solo ejemplo | Claude Code (versión anonimizada) | 0.6.0-rc.4 | Sí | Sí | Sintéticas | Sí | OK |

Solo se deben compartir estados anonimizados o capturas con información privada censurada.

## Prueba de paquete autónomo

Descarga el paquete de [PORTABLE.md](PORTABLE.md). Verifica que el host usa el runtime incluido, no un Node/npm del sistema, y que la distribución del repositorio fuente no se confunde con el paquete extraído. Repite instalación, actualización y desinstalación con un perfil nuevo.

## Prueba de instalación mediante agente

Comparte solo la URL del repo con un **agente que tenga terminal local**. Comprueba que verifica el paquete, registra el marketplace local, respeta la confianza del host y no exige ZIP ni Node manuales. Un agente remoto sin acceso al escritorio debe reconocer la limitación y no afirmar que instaló el plugin.

## ChatGPT Desktop: distinguir instalación y activación MCP (Windows x64)

**Este diagnóstico no requiere instalar Codex CLI, PowerShell, Node.js externo, archivos ZIP ni otorgar permisos sobre el filesystem.**

1. **Marketplace importado:** comprueba que aparece AI Usage. Solo demuestra que se descubrió el catálogo.
2. **Plugin instalado y habilitado:** comprueba quota-pilot y sus skills. Esto no prueba que se haya ejecutado el MCP local.
3. **Revisión correcta del código:** si importaste el marketplace GitHub en un workspace, usa Consola de administración → Plugins → Marketplaces → **Sync now** y revisa el informe. Para un plugin importado individualmente, usa **Refresh** si existe. **Refresh plugin list** solo actualiza la lista visible, no sincroniza GitHub. Si se fijó un commit concreto como origen, no avanzará a main hasta cambiar esa referencia. No elimines el marketplace como solución de caché. Fuente oficial: https://help.openai.com/en/articles/20001504-importing-and-syncing-plugin-marketplaces-from-github .
4. **Ejecución local:** reabre ChatGPT Desktop, inicia una conversación **local** nueva (no una tarea Work en la nube ni un chat web/móvil), selecciona AI Usage y comprueba si el host ofrece `get_overview`, `get_usage` y `open_hud`. Una skill no pone en marcha automáticamente un MCP ausente.
5. **Conexión MCP:** si no aparecen las herramientas, registra **MCP NO CONECTADO**; no lo confundas con un fallo visual del HUD. Examina el estado del plugin/servidor o errores del host, sin divulgar rutas privadas. Separa ejecutor no compatible, bloqueo al iniciar el ejecutable, copia desactualizada y fallo de inicialización. No atribuyas causa sin evidencias del host.
6. **Herramientas e interfaz:** solo si aparecen las herramientas, invoca `get_overview` y `open_hud`. Si la llamada funciona pero no aparece la UI, registra **MCP CONECTADO / HUD NO RENDERIZADO**. Las cuotas desconocidas son no disponibles, nunca cero.

Validación del repositorio: `mcp.json` utiliza `./runtime/node.exe`, con `cwd=${PLUGIN_ROOT}`, y `server/index.mjs` en esa raíz. La CI Windows prueba el ejecutable integrado con PATH vacío e intercambio MCP initialize, tools/list y open_hud. Esto valida el arranque en CI, **no el inicio del proceso en ChatGPT Desktop del usuario**. Referencia: https://developers.openai.com/plugins/deploy/desktop-only .
