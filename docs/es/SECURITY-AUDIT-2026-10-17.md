# Auditoría de seguridad QuotaPilot — 17 de octubre de 2026

**Idioma: [Español](SECURITY-AUDIT-2026-10-17.md) · [English](../SECURITY-AUDIT-2026-10-17.md)**

## Alcance

Se revisaron el runtime del repositorio (entonces privado), servidor MCP stdio, adaptador Codex, recolector de status line Claude Code, instaladores, widget ChatGPT/MCP App, manifiestos, marketplaces, tests y GitHub Actions. El objetivo fue estudiar confidencialidad, límites de privilegios locales, manipulación de entrada, DoS, inyección en UI, cadena de suministro, tráfico saliente accidental, retención excesiva y cambios inseguros de configuración.

## Resultado

No se detectó evidencia de un canal de exfiltración existente ni secretos comprometidos en el árbol revisado. Se identificaron y corrigieron riesgos preventivos en v0.4.0 antes del lanzamiento de código público.

### Alto — entradas de protocolo/proveedor sin límites

**Riesgo:** host o proveedor mal formado/comprometido podría enviar líneas enormes, consumir memoria o bloquear solicitudes.

**Corrección:** límites estrictos de mensajes y buffers, máximo de solicitudes pendientes, timeouts, rate limiting MCP local, caché de proveedores, deduplicación de solicitudes en curso y errores genéricos.

### Alto — HTML dinámico en widget

**Riesgo:** interpolar cadenas controladas por proveedores usando `innerHTML` podría abrir una vía de inyección.

**Corrección:** eliminado `innerHTML`; se construyen nodos y todo dato dinámico se escribe con `textContent`. La CI impide reintroducir primitivas DOM peligrosas.

### Alto — manipulación de archivos/symlinks

**Riesgo:** archivos temporales de nombre fijo, rutas de configuración no validadas y permisos amplios podían redirigirse mediante symlinks.

**Corrección:** directorios privados, propietario/tipo, temporales exclusivos aleatorios, escritura atómica, 0600/0700 POSIX, rechazo de symlinks y límites de tamaño. Los instaladores fallan de forma conservadora con configuración ambigua/insegura.

### Medio — snapshot Claude demasiado amplio

**Riesgo:** el snapshot anterior guardaba campos de modelo/caché/costes innecesarios.

**Corrección:** esquema v2 contiene solo ventanas principal/secundaria de cuota y porcentajes de contexto. No se guardan IDs de sesión, rutas, transcripciones, modelos, caché, costes, prompts, respuestas ni código.

### Medio — filtración de errores internos

**Riesgo:** errores crudos del subproceso podrían exponerse en resultados MCP.

**Corrección:** no se recopila stderr para el resultado público; se muestran mensajes genéricos, sin stack traces ni errores internos del host.

### Medio — presión de procesos

**Riesgo:** refrescos repetidos podrían iniciar numerosos procesos app-server Codex.

**Corrección:** caché de corta duración y deduplicación de promesas mientras el HUD actualiza cada 30 segundos.

### Medio — política de red del widget no explícita

**Riesgo:** cambios futuros podrían añadir llamadas externas inadvertidamente.

**Corrección:** metadata CSP con `connectDomains` y `resourceDomains` vacíos; análisis estático rechaza fetch/XHR/WebSocket y módulos de red Node.

### Medio — Actions mutables y dependencias

**Riesgo:** referencias por tags GitHub Actions y `npm install` aumentaban el riesgo de cadena de suministro.

**Corrección:** SHA completos para Actions, checkout sin credenciales persistidas, token GitHub de lectura y proyecto sin instalación de dependencias.

### Bajo — suplantación de nombre visible

**Riesgo:** texto libre de entorno/cliente podría alterar la marca visible.

**Corrección:** solo se permiten nombres conocidos y cadenas cliente de tamaño limitado. La marca solo cambia la presentación, no los permisos.

## Controles incorporados

- Auditoría estática `scripts/security-audit.mjs` y pruebas `tests/security.test.mjs` de esquemas, rate limiting, symlinks, permisos y tamaños.
- CSP sin dominios externos.
- Anotaciones MCP de solo lectura/no destructivas/idempotentes.
- Marketplace que utiliza el plugin local ya descargado.
- Política de seguridad, CODEOWNERS y CI sobre push/PR.

## Riesgos residuales

1. Hosts/proveedores privilegiados: si el host, cuenta o máquina están comprometidos, el plugin no puede garantizar confidencialidad.
2. Código de actualización: instalar un commit nuevo cambia código ejecutable. En entornos críticos, utiliza un SHA auditado.
3. Ruta del ejecutable Codex: se ejecuta `codex` desde PATH; la integridad de PATH es una frontera de confianza.
4. Entrada Claude: el proceso recibe el JSON completo transitoriamente pero persiste solo métricas seleccionadas.
5. Administración GitHub: la conexión de la auditoría no podía verificar controles de branch protection, seguridad, escaneo ni políticas organizacionales.
6. No se realizó pentest externo ni certificación; fue auditoría de código/configuración y pruebas adversariales.
7. En aquel momento GitHub reportaba forks permitidos para el repositorio privado; **esa observación es histórica** y no representa el estado actual de privacidad.

## Recomendaciones de administración

Verifica en la interfaz GitHub los rulesets de `main`, el bloqueo de force push/eliminación, reporte privado de vulnerabilidades, secret scanning/push protection, autenticación robusta del mantenedor, acceso mínimo de apps, colaboradores, llaves y webhooks. Cualquier dependencia/red añadida requiere revisión de seguridad.

## Conclusión

Después de v0.4.0, QuotaPilot redujo su superficie de ataque mediante Node sin dependencias, stdio local, ausencia de tráfico saliente propio, estado privado mínimo, herramientas de lectura, CSP estricto y pruebas automáticas. Los riesgos restantes dependen principalmente del host, SO y cuentas GitHub.
