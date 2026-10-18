# Historial de cambios

**Idioma: [Español](CHANGELOG.es.md) · [English](CHANGELOG.md)**

QuotaPilot utiliza versionado semántico. Las versiones candidatas pueden cambiar antes de una versión estable.

## Corrección de compatibilidad MCP Desktop (18 de octubre de 2026)

- Se admite el campo estándar `params._meta` en las llamadas a herramientas MCP y recursos UI sin relajar los esquemas de argumentos ni devolver metadatos del host.
- Pruebas de regresión de `get_usage`, `open_hud`, acceso a recursos y redacción de metadatos, distinguiendo errores de protocolo de fallos del proveedor.
- Guías de actualización y reinicio en inglés y español para instalaciones de ChatGPT Desktop afectadas.

## 0.5.0-rc.1 — Código público, versión candidata en validación

- HUD con consumo por hora, autonomía estimada y posible intervalo sin cuota.
- Alertas visuales de cuota baja/crítica y de agotamiento previo al reinicio; los datos ausentes se muestran como desconocidos.
- Guías para instalación local de Codex y Claude, compatibilidad experimental de ChatGPT, privacidad y desinstalación.
- Diagnóstico local `npm run doctor` que no muestra rutas privadas ni secretos.
- Auditoría heurística del historial alcanzable (`npm run security:history`) y CI en Linux, macOS y Windows.
- Instalador Claude sin efectos secundarios cuando el usuario ya configuró una barra personalizada.
- Normalización de porcentajes ausentes y límites de tamaño antes de almacenar la entrada del status line.
- MIT, CODEOWNERS, Dependabot y documentación de administración de GitHub.
- Marketplaces públicos `ai-usage`, instalación HTTPS, plantillas seguras de incidencias y checklist de pruebas reales.
- Mantenimiento del hardening de filesystem, protocolo y políticas de solo lectura/sin red de 0.4.x.
- **Localización:** documentación en inglés y español, interfaz del HUD con selector EN/ES y mensajes localizados en Claude Code.

## 0.4.0 — Refuerzo de seguridad

- Límite de entrada en MCP y proveedores, archivos privados, CSP más estricto, errores genéricos y snapshots mínimos de Claude.
- Herramientas MCP de solo lectura y marca visible adaptativa, con pruebas de CI.

Consulta la [checklist de lanzamiento](docs/es/RELEASE-CHECKLIST.md) para los requisitos pendientes de validación real y administración.
