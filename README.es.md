# QuotaPilot

**Conoce tus límites de IA antes de que interrumpan tu trabajo.**

[![CI](https://github.com/csecurh/quota-pilot/actions/workflows/ci.yml/badge.svg)](https://github.com/csecurh/quota-pilot/actions/workflows/ci.yml)
[![Licencia MIT](https://img.shields.io/badge/licencia-MIT-blue)](LICENSE)

**Idioma: [Español](README.es.md) · [English](README.md)**

QuotaPilot es un **HUD de consumo de IA, local y de código abierto** para Codex, Claude Code y hosts compatibles de ChatGPT Desktop. Su nombre visible se adapta al host: **Codex**, **Claude Code**, **ChatGPT** o **AI Usage** como alternativa. Su identificador técnico permanece como `quota-pilot`.

> **Código público · versión candidata 0.6.0-rc.2.** Las verificaciones automáticas pasan, pero **falta probar la instalación real y Picture-in-Picture en los hosts**. El repositorio no está publicado en el directorio universal de plugins de ChatGPT/Codex.

![Ilustración del HUD local con datos sintéticos](docs/assets/hud-preview.svg)

Permite ver las métricas de **uso**, **cuota restante** y **reinicio**, cuando el proveedor las entrega, además de **velocidad de consumo**, **autonomía estimada** y **alertas visuales** cuando hay suficientes muestras. Las predicciones son orientativas: no sustituyen información de facturación ni garantizan límites. Los datos desconocidos se muestran como no disponibles.

**Permisos en ChatGPT Desktop:** si el instalador solicita cambiar `config.toml` o `plugins/` junto con acceso a Internet, **rechaza esa solicitud**. El HUD de ChatGPT no necesita modificar ajustes de Codex. Comprueba que el agente trabaja realmente en tu equipo, no en un ordenador remoto. Consulta la [guía de instalación segura](docs/es/AGENT-INSTALL.md).

## Instalación pegando el repositorio en tu agente

**Recomendado:** comparte **https://github.com/csecurh/quota-pilot** con un agente que tenga acceso a una terminal **en tu mismo equipo** y pídele instalarlo. Sin ZIP, Node, npm ni Git que debas instalar tú. El agente comprueba el SHA-256 de la versión oficial y registra el plugin, respetando los permisos del host. Un agente solo en la nube no puede instalarlo en tu Windows.

[Guía de instalación desde agente](docs/es/AGENT-INSTALL.md) · [English](docs/AGENT-INSTALL.md).

## Alternativa: paquete portátil manual

**Recomendado:** descarga el paquete adecuado desde [GitHub Releases de QuotaPilot 0.6.0](https://github.com/csecurh/quota-pilot/releases/tag/v0.6.0-rc.2). Hay versiones Windows x64, Linux x64 y macOS Intel/Apple Silicon, con Node.js y avisos de licencia incluidos. Extrae el archivo y registra la carpeta como **plugin o marketplace local** en un host compatible. **No necesitas instalar Node ni npm.** [Guía completa en español](docs/es/PORTABLE.md) · [English](docs/PORTABLE.md).

El runtime integrado **no** incluye Codex autenticado: las cuotas de Codex dependen de la aplicación original. ChatGPT Desktop debe ser compatible con MCP Apps locales. El ZIP no publica el plugin en el directorio universal ni garantiza PiP global.

## Instalación desde código fuente (requiere Node.js)

**Requisitos solo para el código fuente:** Node.js **22.13+**, Git y el host correspondiente instalado. Para obtener métricas reales, debes haber iniciado sesión en Codex o Claude Code por sus propios medios. **No necesitas ejecutar `npm install`, crear una cuenta QuotaPilot ni introducir claves API.** Revisa y acepta conscientemente los avisos de confianza de hooks locales.

| Host | Cómo comenzar | Dónde se muestra |
|---|---|---|
| **Claude Code** | En Claude Code: `/plugin marketplace add csecurh/quota-pilot` y luego `/plugin install quota-pilot@ai-usage` | Barra de estado nativa en una sesión nueva de confianza |
| **Codex CLI** | Terminal: `codex plugin marketplace add csecurh/quota-pilot`; abre `codex` → `/plugins` → **AI Usage** → instala **quota-pilot** | Footer nativo con ventanas de 5 horas y semanal |
| **ChatGPT Desktop** | Si tu versión admite plugins locales, añade `csecurh/quota-pilot` como marketplace, reinicia Desktop e instala **quota-pilot** desde **AI Usage** | HUD de la conversación, que solicita PiP donde esté disponible |

**En Windows:** si PowerShell muestra `CommandNotFoundException` al ejecutar `codex`, el CLI no está instalado o no aparece en `PATH`. [Solución e instalación oficial de Codex CLI](docs/es/INSTALL.md#windows-cuando-powershell-no-reconoce-codex). No hace falta el CLI para abrir el catálogo de plugins dentro de ChatGPT Desktop.

**ChatGPT Desktop sigue siendo experimental.** El host necesita permitir ejecución de plugins locales, MCP por stdio y el puente UI del host. Un repositorio GitHub público no implica estar disponible en el directorio universal ni garantiza un flotante global en web, móvil u otras aplicaciones. Consulta la [documentación de plugins de OpenAI](https://developers.openai.com/plugins/build/plugins).

**Instalación directa alternativa** (si no puedes usar el marketplace):

```bash
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
npm run check
node scripts/install-claude-hud.mjs  # Solo para Claude Code
# o:
node scripts/install-codex-hud.mjs   # Solo para Codex CLI
npm run doctor
```

Ejecuta **solo el instalador de tu host** y reinicia la aplicación. El instalador de Claude no reemplaza una barra personalizada existente. El footer de Codex usa elementos nativos y no muestra campos personalizados de reinicio exacto.

[Guía completa de instalación, actualización y desinstalación](docs/es/INSTALL.md) · [Pruebas reales](docs/es/HOST-TEST-PLAN.md)

## Idioma / Language

El widget de ChatGPT detecta **español o inglés** según el sistema, y permite cambiarlo desde el selector **EN / ES** sin salir del HUD. La barra de Claude Code y el diagnóstico local también siguen el idioma del sistema. Se puede especificar `QUOTAPILOT_LANG=es` o `QUOTAPILOT_LANG=en` en el entorno del proceso. Los datos guardados no cambian de esquema al traducirse. [English documentation](README.md).

## Funcionalidades

- **Ventanas de uso locales:** porcentajes y fechas de reinicio proporcionados por cada proveedor; ventanas de Claude de 5 horas y 7 días cuando estén disponibles.
- **Estimaciones de consumo:** tasa por hora, autonomía y posible tiempo sin cuota tras observar al menos dos muestras separadas por cinco minutos.
- **Alertas locales:** baja al 20 %, crítica al 10 % y advertencia de posible agotamiento antes del reinicio. **No envía notificaciones del sistema.**
- **Integraciones nativas:** barra de Claude Code, footer de Codex y widget MCP que solicita PiP en sesiones compatibles de ChatGPT.
- **Privacidad:** sin servidor de telemetría de QuotaPilot, sin dependencias npm de ejecución, sin llamadas de red directas desde el widget y sin solicitar ni guardar credenciales.

## Privacidad y seguridad

El servidor MCP funciona **localmente por stdio**. Codex proporciona los límites desde su app-server local y Claude aporta algunos campos de uso de su barra de estado. Una captura mínima en `~/.quotapilot/claude-latest.json` solo contiene porcentajes, fechas de reinicio y timestamps. El plugin no guarda intencionalmente prompts, respuestas, transcripciones, rutas del proyecto, código fuente, identificadores de sesión/modelo ni credenciales. Los hosts y proveedores tienen políticas propias de red.

[Preguntas sobre privacidad](docs/es/PRIVACY.md) · [Política de seguridad](SECURITY.es.md) · [Modelo de amenazas](docs/es/THREAT-MODEL.md) · [Reporte responsable](SECURITY.es.md)

## Desarrollo y verificación

```bash
git clone https://github.com/csecurh/quota-pilot.git
cd quota-pilot
npm run check
npm run doctor
npm run security:history
```

El análisis histórico es heurístico y requiere un clon completo, no superficial. GitHub Actions prueba Ubuntu, macOS y Windows y analiza el historial en Ubuntu. El comando `node server/index.mjs` inicia un servidor MCP por stdio: **no abre una interfaz de navegador**.

Herramientas MCP de solo lectura: `open_hud()`, `get_usage({provider:"codex"|"claude_code"})` y `get_overview()`.

## Estado del proyecto

**Código público bajo MIT; compatibilidad en fase de pruebas reales.** La imagen es una **ilustración con datos sintéticos**, no una captura real de instalación. Para aparecer en un directorio público de plugins hace falta un proceso independiente de revisión y publicación.

[Historial de cambios](CHANGELOG.es.md) · [Contribuir](CONTRIBUTING.es.md) · [Soporte](SUPPORT.es.md) · [Evidencia de validación](docs/es/RELEASE-VALIDATION.md) · [Checklist de lanzamiento](docs/es/RELEASE-CHECKLIST.md) · [Aviso MIT](docs/es/LICENSE-DECISION.md)

**Copyright © 2026 Cibersecurity-H.** Licencia [MIT](LICENSE) (texto legal original en inglés).
