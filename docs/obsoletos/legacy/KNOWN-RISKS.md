# Riesgos Técnicos Conocidos
### `docs/known-risks.md` — baseline congelado tras auditoría de lectura + exploración de código real
### Última actualización: esta iteración (pre-Fase 2.5)

> Fuente de verdad de deuda técnica y riesgos de seguridad conocidos. Cada entrada tiene severidad, estado y dueño. Este documento se actualiza cuando un riesgo cambia de estado — no se borra, se marca resuelto con fecha y commit/PR de referencia.

---

## Leyenda de severidad
- 🔴 **Crítico** — afecta seguridad de datos de NNA o integridad del sistema; bloquea producción.
- 🟠 **Alto** — bug funcional real o brecha de acceso con impacto acotado; no bloquea todo el sistema pero sí la funcionalidad afectada.
- 🟡 **Medio** — deuda técnica que degrada calidad/mantenibilidad; no es una brecha activa.
- ⚪ **Bajo** — inconsistencia menor, cosmética o de higiene de repo.

---

## Riesgos en remediación activa (Fase 2.5 — Endurecimiento de Autorización)

| ID | Riesgo | Severidad | Evidencia | Estado |
|---|---|---|---|---|



| R4b | Acceso de solo lectura para profesional históricamente asignado (ya no activo) — funcionalidad deseada, no implementada. | 🟡 | Diseño previo (documento maestro) lo previó como excepción autorizable por Jefatura | Diferido — se construye si/cuando se solicite con uso real, no por anticipación. |
| R5 | Colisión de identidad en JWT de portal — `jwt.strategy.ts:24-32` devuelve `id: payload.sub` = **el `caseId`**, no un `userId` real, bajo `role: 'REFERENTE_TUTOR'`. Riesgo si algún endpoint hace lookup por `user.id` asumiendo que es un usuario del staff. | 🟠 | `jwt.strategy.ts:24-32` | Parcialmente en remediación: `assertUserHasAccess` trata `isPortal` explícitamente (usa `caseCode`, nunca `user.id` como userId). **Pendiente fuera de esta iteración**: auditoría de todo call site que use `user.id` para lookup de usuario del staff, para garantizar que ninguno pueda recibir por error un principal de portal. |

| R7b | Cero cobertura de tests en el resto de módulos (reports, evidences, appointments, ai-assistant, etc.). | 🟠 | Todo el repo | Diferido — fuera de alcance de esta iteración; recomendado como trabajo continuo, no de una sola vez. |

---

## Riesgos diferidos conscientemente (ver ADR-018)

| ID | Riesgo | Severidad | Evidencia | Razón del diferimiento |
|---|---|---|---|---|
| R6 | Falta de `@Roles` en la mayoría de controllers (evidences, appointments, timeline, inspections, action-logs, persons, portal, ai-assistant) — solo `JwtAuthGuard`, abierto a cualquier autenticado. | 🟡 | Solo 5 módulos usan `@Roles`: cases (parcial), users, system-modules, audit, offices | `assertUserHasAccess` cubre el caso más grave (acceso a expediente). Una auditoría sistemática de `@Roles` por controller es trabajo real pero no bloquea Fase 2.5 ni Fase 3 — se agenda como tarea propia. |
| R8 | Scripts de lint rotos — `apps/api` corre `eslint --fix` sin eslint en devDependencies ni config; `apps/web` corre `next lint`, comando eliminado en Next.js 16. | 🟡 | `package.json` de ambos apps | No afecta runtime ni seguridad; se corrige en una pasada de limpieza de tooling, no urgente. |
| R9 | Secretos con fallback hardcodeado (`JWT_SECRET`, credenciales MinIO) en 3 módulos + defaults en `docker-compose.prod.yml`. | 🟡 (🔴 si se despliega a prod sin sobrescribir) | Grep de fallbacks en código y compose | **Bloqueante de pre-producción**, no de desarrollo. Se marca explícitamente como checklist obligatorio antes de cualquier despliegue real al servidor del GAM. |
| R10 | Sin carpeta `prisma/migrations` — `prisma db push` como único mecanismo de esquema; sin triggers de auditoría/append-only a nivel de DB. | 🟠 (🔴 antes de producción) | Ausencia de `prisma/migrations` en el repo | **Bloqueante de pre-producción**. En desarrollo activo es aceptable; antes de datos reales de NNA, se requiere historial de migraciones formal. |
| R11 | UUID v7 declarado en ADR-008, pero el schema usa `gen_random_uuid()` (v4) en la mayoría de modelos. | ⚪ | `schema.prisma`, comparado con ADR-008 | Cosmético/de rendimiento a futuro (ordenabilidad temporal), no de seguridad. Se corrige si se justifica por volumen real. |
| R12 | CORS completamente abierto (`app.enableCors()` sin restricción de orígenes). | 🟡 (🔴 en prod) | `main.ts` | Aceptable en desarrollo; **bloqueante de pre-producción** — debe restringirse a los orígenes reales del GAM antes de ir a producción. |
| R13 | Drift entre documentación técnica y schema real (`schema-v0.md` desactualizado respecto a modelos y enums reales). | 🟡 | Comparación directa doc vs. `schema.prisma` | Se resincroniza en una pasada de documentación al cierre de Fase 2/inicio de Fase 3, no bloquea desarrollo. |
| R14 | `start:prod` apunta a `dist/main` mientras `dev` compila a `dist/apps/api/src/main.js` — ruta inconsistente. | ⚪ | `package.json` de `apps/api` | Corrección trivial, se agenda junto con R8. |

---

## Resueltos

| ID | Riesgo | Severidad | Evidencia | Estado |
|---|---|---|---|---|
| R1 | `RlsContextInterceptor` inerte — `SET LOCAL` fuera de transacción se descarta en Postgres. | 🔴 | `rls-context.interceptor.ts:21-24` | **Resuelto (01/08/2026, Pre-Fase 3)**: Interceptor removido, no reparado. RLS de Postgres queda diferido según ADR-011 actualizado. |
| R2 | IDOR en `casesService.findOne(id)` — cero verificación de acceso a nivel de recurso. | 🔴 | `cases.service.ts:194-236` | **Resuelto (01/08/2026, Pre-Fase 3)**: Protegido vía `CaseAccessService.assertUserHasAccess`. |
| R3 | Bug de scoping por oficina — query de Jefatura/Secretaría/Administrador no tenía cláusula `where`. | 🟠 | `cases.service.ts:141-192` | **Resuelto (01/08/2026, Pre-Fase 3)**: Aislado con `where: { currentOfficeId: user.officeId }` para roles distritales. |
| R4 | Semántica inconsistente de `teamHistory`. | 🟡 | `cases.service.ts` vs `appointments.service.ts` | **Resuelto (01/08/2026, Pre-Fase 3)**: Unificado usando `endDate: null` en listados para coincidir con la autorización estricta del `CaseAccessService`. |
| R7a | Cero infraestructura de tests en API. | 🔴 | `apps/api` | **Resuelto (01/08/2026, Pre-Fase 3)**: Se inicializó Vitest y se logró 100% de cobertura sobre el nuevo `CaseAccessService`. |

---

## Convención de actualización
Cuando un riesgo se resuelve: mover la fila a una sección `## Resueltos`, con fecha, PR/commit, y quién lo verificó. No se elimina del documento — el histórico de qué se supo y cuándo importa tanto como el estado actual, especialmente en un sistema con datos de NNA.
