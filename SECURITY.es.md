# Política de seguridad

**Idioma: [Español](SECURITY.es.md) · [English](SECURITY.md)**

QuotaPilot es un HUD **local y de solo lectura**. El proyecto público está licenciado bajo MIT y no pertenece a OpenAI ni Anthropic. No tiene dependencias npm de ejecución, servidor de telemetría propio ni cliente HTTP directo en el widget.

## Versiones mantenidas

| Versión | Soporte de seguridad |
|---|---|
| 0.6.0-rc.2 (código público actual) | Hasta la siguiente versión candidata o estable |
| 0.4.x y anteriores | No se garantiza mantenimiento adicional |

## Cómo reportar una vulnerabilidad

**Nunca publiques vulnerabilidades, secretos, detalles de explotación o datos privados en GitHub Issues.**

Si está habilitada la función de reporte privado de vulnerabilidades, utiliza [Security → Advisories → Report a vulnerability](https://github.com/csecurh/quota-pilot/security/advisories). Si no aparece, contacta con **@csecurh** mediante un canal privado y confiable. Un issue público no sirve como canal de divulgación confidencial.

Aporta versión/commit afectado, sistema operativo, reproducción con datos sintéticos, impacto y posible corrección. No copies datos de usuarios reales.

## Límite de datos

QuotaPilot utiliza únicamente las ventanas de cuota obtenidas del app-server Codex autenticado localmente y los porcentajes de cuota/contexto entregados a la barra de estado Claude Code. La tasa de consumo y autonomía estimadas se calculan en memoria.

El snapshot de Claude en `~/.quotapilot/claude-latest.json` guarda porcentajes, timestamps y ventanas de reinicio, bajo límites de tamaño/permisos. El plugin **no almacena intencionadamente** contraseñas, claves API, tokens OAuth o de sesión, prompts, modelos, respuestas, transcripciones, código fuente, rutas de trabajo, IP ni costes. El host y proveedor pueden operar su propia red de forma independiente.

## Controles técnicos

- MCP local por stdio, esquemas estrictos, límites de entradas/salidas y rate limiting.
- Procesos Node con `shell: false`, timeout y mensajes de error genéricos.
- Lectura/escritura segura de archivos, validación de propietario y tipo, límites, permisos privados POSIX, rechazo de symlinks y escritura atómica.
- Widget renderizado con nodos DOM y texto; CSP con `connect-src 'none'`.
- Sin dependencias de ejecución; GitHub Actions ancladas por SHA, permisos mínimos y pruebas en tres sistemas, además de revisión heurística de secretos.

## Riesgos residuales

Los límites dependen de los proveedores. Malware ejecutado por el mismo usuario, hosts comprometidos, ACL de Windows, cambios en directorios ancestros y secretos históricos no detectados siguen siendo riesgos posibles. Consulta el [modelo de amenazas](docs/es/THREAT-MODEL.md). La protección de `main` y el reporte privado en GitHub necesitan **activación administrativa real**: no basta con agregar archivos al repositorio.

## Contribuciones

No incluyas archivos `.env` con secretos, claves privadas, prompts, respuestas, transcripciones ni código de usuarios. Revisa cuidadosamente los cambios a herramientas, CSP, snapshots, instaladores y workflows.
