# Contribuir a QuotaPilot

**Idioma: [Español](CONTRIBUTING.es.md) · [English](CONTRIBUTING.md)**

QuotaPilot es [software bajo licencia MIT](LICENSE) y su código está disponible públicamente. Se aceptan propuestas, documentación e informes de errores. La compatibilidad de la versión candidata `0.5.0-rc.1` todavía se está probando.

## Desarrollo local

Requisitos: Node.js 22.13+ y Git. No hay dependencias npm de ejecución ni de desarrollo.

```bash
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
npm run check
npm run doctor
npm run security:history
```

Para analizar el historial necesitas un clon no superficial (`git fetch --unshallow` si corresponde). CI ejecuta sintaxis, tests y controles estáticos en Ubuntu, macOS y Windows; en Ubuntu también revisa el historial Git accesible.

## Antes de abrir una solicitud de incorporación (PR)

- Trabaja en una rama y explica el comportamiento, el riesgo y la compatibilidad hacia atrás.
- Añade pruebas automatizadas; usa **solo datos sintéticos y registros anonimizados**.
- Mantén las herramientas MCP en modo lectura, valida entradas y límites; no reveles stderr, rutas o configuraciones en errores públicos.
- No añadas clientes de red, telemetría, dependencias o HTML dinámico inseguro sin revisión de seguridad.
- Conserva la configuración del usuario: no reemplaces barras personalizadas de Claude ni destruyas secciones TOML de Codex.
- El identificador técnico sigue siendo `quota-pilot`, y las marcas visibles son ChatGPT, Codex, Claude Code o AI Usage.
- Actualiza las guías equivalentes en **inglés y español** cuando cambies funciones visibles o instrucciones.
- Nunca incluyas secretos, prompts, respuestas, transcripciones o código ajeno; consulta [SECURITY.es.md](SECURITY.es.md).

## Política de revisión

CODEOWNERS identifica al mantenedor. Estas revisiones solo son obligatorias cuando GitHub tenga una regla activa de protección de `main` ([configuración](docs/es/GITHUB-SECURITY-SETUP.md)). Al contribuir, confirmas que tienes derecho a distribuir tus cambios bajo MIT y que revisaste las licencias de cualquier recurso de terceros.

## Instalación desde agentes

Mantén sincronizados [AGENTS.md](AGENTS.md), la [guía en inglés](docs/AGENT-INSTALL.md), la [guía en español](docs/es/AGENT-INSTALL.md), los scripts y sus pruebas. No omitas permisos del host ni ejecutes código remoto no verificado.
