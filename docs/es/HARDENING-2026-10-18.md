# Refuerzo de seguridad — 18 de octubre de 2026

**Idioma: [Español](HARDENING-2026-10-18.md) · [English](../HARDENING-2026-10-18.md)**

Este informe complementa la auditoría del 17 de octubre de 2026. Se trata de una revisión interna de código/configuración y pruebas adversariales de regresión, **no de una certificación externa de penetración**.

## Cambios implementados

- Lecturas seguras mediante descriptor abierto y protección para no seguir symlinks finales cuando esté disponible, comparación de inode POSIX y límites de 64 KiB (Claude) / 1 MiB (configuración), validando propietario y permisos privados.
- Escritura atómica: rechaza contenido/destinos sobredimensionados, utiliza directorios privados, temporales exclusivos con nombres aleatorios, sincronización `fsync` y renombrado atómico.
- Editor conservador de `[tui]` Codex: conserva el TOML ajeno, comentarios y colores explícitos; rechaza configuraciones duplicadas, multilínea o no compatibles en vez de reescribirlas.
- MCP descarta frames completos sobredimensionados, valida identificadores y argumentos, limita solicitudes simultáneas y aplica rate limiting. Los errores públicos son genéricos.
- Subproceso Codex con gestión de salida temprana, límites de líneas/solicitudes pendientes, sin shell y sin exponer stderr del proveedor.
- Widget construye DOM mediante nodos y `textContent`, utiliza CSP sin conexiones, refresco fusionado cada 30 segundos y solo el puente MCP del host.
- Instalador independiente de Claude corregido para copiar también `secure-fs.mjs`.
- Pruebas adicionales de entradas MCP inválidas, frames enormes, redacción de errores, tamaños/permisos, preservación/idempotencia Codex, marcas visibles y runtime Claude.
- CI conserva Actions ancladas por SHA, permisos mínimos, cero instalación de dependencias y controles estáticos adicionales.

## Límites del alcance

El escaneo es heurístico: no certifica que nunca haya existido un secreto en Git ni que el ejecutable Codex administrado por el host no use la red. Las configuraciones administrativas de GitHub deben verificarse separadamente. El [modelo de amenazas](THREAT-MODEL.md) y la [política de seguridad](../../SECURITY.es.md) describen los riesgos restantes.
