# Modelo de amenazas — QuotaPilot

**Idioma: [Español](THREAT-MODEL.md) · [English](../THREAT-MODEL.md)**

## Alcance y límites de confianza

QuotaPilot funciona con un servidor MCP local por stdio, un subproceso app-server Codex, un colector de barra de estado Claude Code y un widget que usa el puente del host ChatGPT. Prioriza la confidencialidad de credenciales/código, la integridad de la configuración y el uso limitado de recursos.

| Límite | Entrada no confiable | Protección |
|---|---|---|
| Host MCP | Frames JSON-RPC, métodos y argumentos | Límite de 256 KiB, esquema estricto, rate limiting, ocho operaciones activas como máximo y errores genéricos |
| Subproceso Codex | Mensajes JSON, bloqueo | Sin shell, se ignora stderr, máximo 1 MiB por línea, ocho solicitudes pendientes, timeout |
| Barra Claude | JSON entregado por host | Máximo 256 KiB, métricas seleccionadas, snapshot privado mínimo |
| Sistema de archivos | Symlinks, sustitución de archivos, permisos | `lstat`, apertura sin seguir enlace final, comparación de inode POSIX con `fstat`, límites de tamaño, propiedad, 0600 archivos / 0700 directorios, escrituras atómicas aleatorias |
| Widget | Valores de proveedores y herramientas | `textContent`, CSP restrictiva, solo puente del host, sin HTTP directo |
| GitHub Actions | Referencias mutables, workflows | Actions fijadas por SHA, permisos de lectura, sin instalar paquetes, auditoría estática |

## Datos utilizados

QuotaPilot lee la respuesta local de límites Codex, el JSON temporal de la barra Claude, el snapshot mínimo `~/.quotapilot/claude-latest.json` y —solo durante una instalación explícita— `~/.codex/config.toml` o `~/.claude/settings.json`. Solo persisten los porcentajes y ventanas de cuota/contexto de Claude y sus timestamps. La tasa de consumo, autonomía y horas estimadas sin cuota se calculan en memoria.

No se inspeccionan ni conservan deliberadamente claves, tokens OAuth, modelos o IDs de sesión, prompts, respuestas, transcripciones, rutas de trabajo, código, historial del shell, costes ni archivos arbitrarios de proyectos. QuotaPilot no envía estas métricas a servicios de red externos. Los ejecutables Codex/Claude y hosts están fuera del control de red del plugin.

## Riesgos residuales

1. Un usuario/SO comprometido, malware con permisos del usuario o host malicioso está fuera del límite de confianza: los permisos de archivos no son un sandbox.
2. La protección POSIX frente a symlinks e inode aplica principalmente a la ruta final, no a todos los directorios ancestros. En Windows la comprobación de identidad de inode está limitada porque `lstat`/`fstat` pueden diferir; siguen los controles de tipo, symlinks finales, propietario y tamaño. No hay auditoría completa de ACL Windows.
3. La edición de Codex solo admite arreglos de estado inline conservadores; TOML ambiguo o multilínea se rechaza para no destruir datos. No es un parser TOML completo.
4. Las proyecciones no garantizan disponibilidad ni límites exactos; dependen de la confiabilidad del host local.
5. El escaneo de secretos por patrones es heurístico y no garantiza detectar todo el historial ni todos los formatos.
6. Ni SHA pinning ni revisiones impiden un cambio malicioso realizado por un mantenedor autorizado. Protección de ramas, reportes privados y permisos deben verificarse administrativamente.
7. Los límites mitigan DoS locales, pero no el agotamiento de recursos provocado por un proceso privilegiado.

Consulta [SECURITY.es.md](../../SECURITY.es.md) y las auditorías fechadas. Cualquier incorporación de red, lectura de credenciales o herramientas MCP de escritura necesita revisión de seguridad independiente.
