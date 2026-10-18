# Seguridad administrativa de GitHub — repositorio público

**Idioma: [Español](GITHUB-SECURITY-SETUP.md) · [English](../GITHUB-SECURITY-SETUP.md)**

Repositorio: [csecurh/quota-pilot](https://github.com/csecurh/quota-pilot), público y bajo MIT. Esta guía describe **controles recomendados, no configuraciones ya activadas**.

## Última verificación (18 de octubre de 2026)

- GitHub REST informó `visibility: public`, `private: false` y licencia MIT.
- La rama `main` se encontraba con `protected: false`; `GET /rulesets` devolvió un arreglo vacío.
- Los forks públicos están habilitados, algo habitual en proyectos MIT.
- La integración de GitHub aquí **no puede cambiar** la configuración administrativa de ramas, protección ni rulesets.
- Los workflows ya tienen token de solo lectura, acciones fijadas por SHA, auditoría de historial y tests Ubuntu/macOS/Windows.
- CODEOWNERS no impone revisiones si no existe una regla de protección activa.

## Activar protección para main (prioridad máxima)

Abre [Settings → Rules → Rulesets](https://github.com/csecurh/quota-pilot/settings/rules), crea un **nuevo ruleset de rama** o utiliza [Settings → Branches](https://github.com/csecurh/quota-pilot/settings/branches).

| Campo | Configuración recomendada |
|---|---|
| Nombre | `Protect main` |
| Estado | **Active**, no Evaluate ni Disabled |
| Ramas incluidas | Rama predeterminada `main` |
| Bloquear eliminación y force push | **Sí** |
| Exigir pull request | **Sí** |
| Checks obligatorios | `Verify (ubuntu-latest)`, `Verify (macos-latest)`, `Verify (windows-latest)` |
| Actualizar con base antes de fusionar | Cuando esté disponible |
| Resolver conversaciones | Sí |
| Aprobar CODEOWNERS | Solo si existe otro revisor disponible |
| Excepciones de bypass | Evítalas cuando sea viable sin bloquearte como único mantenedor |

**Nota para mantenedor único:** una aprobación por otra persona o por CODEOWNERS puede impedirte fusionar tus propios PR. Hasta incorporar otro revisor, configura PR + checks obligatorios sin requerir aprobaciones externas. Prueba primero con un PR sintético inocuo.

Después de guardar, confirma que `main` quede protegida o que haya un ruleset **activo** dirigido a ella. Verifica que un PR con CI fallida no se pueda fusionar.

## Ajustes de seguridad recomendados

1. [Settings → Actions](https://github.com/csecurh/quota-pilot/settings/actions): token `GITHUB_TOKEN` con lectura predeterminada, acciones de editores confiables/fijadas por SHA y aprobación para workflows de forks no confiables.
2. [Settings → Advanced Security](https://github.com/csecurh/quota-pilot/settings/security_analysis): habilita escaneo de secretos, protección contra pushes con secretos, avisos de Dependabot y **reporte privado de vulnerabilidades**, según opciones de tu plan. `.github/dependabot.yml` ya solicita propuestas semanales de actualización de Actions, pero no activa ajustes de cuenta.
3. [Settings → General](https://github.com/csecurh/quota-pilot/settings): revisa colaboradores, llaves de despliegue, aplicaciones instaladas, webhooks y permisos para publicar releases o cambiar ajustes.
4. [Política de seguridad](../../SECURITY.es.md): los reportes confidenciales nunca deberían incluirse en issues públicos.
5. Revisa el historial Git manualmente; la auditoría automatizada es **heurística**.

## Evidencias

Ejecuta `npm run check` y `npm run security:history` sobre un clon completo. Consulta la [validación de lanzamiento](RELEASE-VALIDATION.md). La publicación en el directorio universal de plugins es un procedimiento **distinto** de hacer público el repositorio.
