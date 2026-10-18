# Preguntas frecuentes sobre privacidad

**Idioma: [Español](PRIVACY.md) · [English](../PRIVACY.md)**

QuotaPilot tiene código público bajo **MIT**, pero no es una aplicación oficial de OpenAI ni Anthropic, ni esto le concede acceso adicional a tus cuentas.

**¿Necesito crear una cuenta?** No. No hace falta una cuenta QuotaPilot, un proyecto Supabase ni servidor externo.

**¿De dónde vienen los datos?** Del resultado de límites del app-server Codex ejecutado localmente y de ciertos campos de cuota/contexto que Claude Code entrega a su barra de estado. Debes tener sesión iniciada en cada proveedor por sus medios.

**¿Qué se guarda en disco?** Un snapshot mínimo de Claude en `~/.quotapilot/claude-latest.json`, con límite de 64 KiB y permisos privados/propietario en sistemas POSIX compatibles. Por defecto se considera reciente durante 30 minutos. Guarda timestamps, porcentajes y fechas de reinicio. Los instaladores pueden actualizar la configuración local existente de Codex o Claude.

**¿Qué no se almacena deliberadamente?** Contraseñas, tokens OAuth, claves API, prompts, respuestas, transcripciones, código fuente, IDs de sesión/modelo, rutas de trabajo, facturación ni telemetría de comportamiento.

**¿El widget envía analíticas?** No. Su CSP incluye `connect-src 'none'`: usa el puente MCP del host y no realiza solicitudes HTTP directas. El host y el ejecutable Codex externos siguen sus propias políticas de red.

**¿Qué fiabilidad tienen las predicciones?** La tasa de consumo, autonomía y posible tiempo sin cuota son estimaciones en memoria. Necesitan al menos dos muestras separadas cinco minutos, y solo se calcula el intervalo hasta el reinicio si se dispone del timestamp. Las advertencias son indicadores visuales locales, **no notificaciones del sistema**.

**¿Se puede garantizar toda la seguridad?** No. Malware del mismo usuario, hosts/proveedores comprometidos, symlinks en rutas ancestro, montajes y riesgos de cuenta GitHub siguen fuera del control completo del plugin. Consulta el [modelo de amenazas](THREAT-MODEL.md).
