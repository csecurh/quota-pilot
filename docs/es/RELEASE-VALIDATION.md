# Candidato público — evidencia de verificación

**Idioma: [Español](RELEASE-VALIDATION.md) · [English](../RELEASE-VALIDATION.md)**

Proyecto: quota-pilot, MIT, GitHub **público**, versión `0.5.0-rc.1`. Este documento separa pruebas automáticas de pruebas reales en hosts.

## Verificación automatizada

`npm run check` ejecuta sintaxis, tests y seguridad estática. `npm run security:history` revisa objetos Git alcanzables con patrones heurísticos y requiere clonado completo. `npm run doctor` entrega estados locales anonimizados. [GitHub Actions](https://github.com/csecurh/quota-pilot/actions/workflows/ci.yml) valida Ubuntu, macOS y Windows con Node.js 22.13.

Controles técnicos: MCP local stdio, herramientas de lectura, límites de memoria/entrada, errores genéricos, snapshot Claude mínimo, CSP sin conexiones externas, sin dependencias npm y sin utilizar `innerHTML` para contenido del proveedor.

## Validaciones de campo pendientes

| Elemento | Resultado esperado | Estado |
|---|---|---|
| Claude Code | Marketplace/script, ventanas auténticas 5h/7d, actualización/desinstalación segura | SIN PRUEBA REAL |
| Codex CLI | Instalación, footer de cuota y conservación de TOML | SIN PRUEBA REAL |
| ChatGPT Desktop | Plugin local, `open_hud`, widget inline/PiP y refresco | EXPERIMENTAL, NO VERIFICADO |
| Plataformas | Instalación/desinstalación real, permisos/ACL Windows/macOS/Linux | CI NO SUSTITUYE LA PRUEBA REAL |
| Accesibilidad | Lector de pantalla, contraste y reducción de movimiento | REVISIÓN MANUAL PENDIENTE |
| Imágenes | Captura/GIF reales anónimos | SOLO MOCKUP SINTÉTICO |
| GitHub | Reglas activas de `main`, opciones de seguridad y permisos de colaboradores | VERIFICACIÓN ADMINISTRATIVA PENDIENTE |
| Legal | Titularidad del copyright y derechos de terceros | CONFIRMACIÓN PENDIENTE |

Para documentar resultados utiliza [HOST-TEST-PLAN.md](HOST-TEST-PLAN.md) **sin compartir datos de cuenta**.

## Limitaciones

- El escáner heurístico no puede garantizar la inexistencia total de secretos en el historial.
- Los tests simulados MCP no garantizan que ChatGPT Desktop ofrezca el puente local necesario.
- El comportamiento de inode/stat y las ACL de Windows necesitan revisión en un equipo real.
- MIT permite usar el código fuente; la aparición en el directorio universal requiere solicitud y evaluación independientes.

## Instalación desde agente (18 de octubre de 2026)

CI verifica el nuevo instalador mediante agente local: el SO descarga de GitHub un paquete con SHA-256 fijado sin requerir Node/npm. Esta prueba confirma la preparación técnica, **no** la activación automática en todas las versiones de ChatGPT Desktop/Claude/Codex. Siguen siendo necesarios los permisos del host y un agente que se ejecute en **el mismo equipo**.
