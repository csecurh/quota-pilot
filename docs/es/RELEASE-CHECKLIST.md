# Checklist de código público — QuotaPilot 0.6.0-rc.3

**Idioma: [Español](RELEASE-CHECKLIST.md) · [English](../RELEASE-CHECKLIST.md)**

**GitHub es PÚBLICO y el código está bajo MIT.** No significa que QuotaPilot ya aparezca en el directorio universal de ChatGPT/Codex. Es una versión candidata para instalación comunitaria y pruebas, no una garantía de compatibilidad con todos los hosts.

## Terminado en el repositorio

- [x] Código público, archivo LICENSE MIT, metadatos de autoría y guías de actualización/seguridad.
- [x] README público e instrucciones Git HTTPS/marketplace Claude/Codex; ChatGPT experimental identificado.
- [x] Plantillas de issues con advertencias de privacidad, soporte y contribución.
- [x] Nombre visible según host y persistencia mínima de datos.
- [x] Diagnóstico local, pruebas de integración, sintaxis, auditoría estática e histórica heurística (para repositorios superficiales ejecuta `git fetch --unshallow`).
- [x] CI Linux, macOS, Windows con acciones fijadas por SHA y token de lectura.
- [x] CODEOWNERS y Dependabot en el árbol.
- [x] Ilustración sintética del HUD señalada correctamente.
- [x] Documentación en inglés y español, con navegación entre idiomas.

## Configuración administrativa pendiente

- [ ] **Activar** una regla de protección de `main`: exigir CI, impedir eliminación y force pushes ([instrucciones](GITHUB-SECURITY-SETUP.md)).
- [ ] Comprobar reportes privados, escaneo de secretos, avisos Dependabot, permisos de Actions y colaboradores mínimos.
- [ ] Confirmar titularidad legal del código y atribuciones de terceros antes de la versión estable.
- [ ] Revisar manualmente historial Git para secretos o archivos atípicos (el escáner por patrones no es exhaustivo).
- [ ] Crear opcionalmente una pre-release GitHub versionada tras validar los hosts reales.

## Pruebas reales pendientes

- [ ] Instalar Claude Code mediante marketplace **y** script directo con cuenta autenticada; actualizar/desinstalar sin afectar configuración.
- [ ] Instalar Codex CLI desde marketplace y comprobar footer nativo, métricas y preservación de preferencias.
- [ ] Validar ChatGPT Desktop en una versión compatible: puente local, herramientas MCP, widget inline/PiP, refresco; documentar si no es compatible.
- [ ] Pruebas manuales en Windows/macOS/Linux, permisos/ACL, contraste, lectores de pantalla y reducción de movimiento.
- [ ] Añadir opcionalmente una captura o GIF **real y anonimizado** sin eliminar la advertencia sobre datos sintéticos del mockup.

Consulta [plan de pruebas](HOST-TEST-PLAN.md), [evidencia](RELEASE-VALIDATION.md) y [configuración GitHub](GITHUB-SECURITY-SETUP.md). **No anuncies configuraciones de seguridad como activas sin verificarlas en GitHub.**
