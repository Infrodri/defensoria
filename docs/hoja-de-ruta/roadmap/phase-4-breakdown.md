# Project Roadmap: Phase 4 Breakdown

This document details the fourth phase of the DNA Case Management System implementation, focusing on the **External Portal for Guardians (Portal Externo para Referente/Tutor)**.

## Phase 4 — Portal Externo (Referente/Tutor)
**Duration:** 1-2 weeks
**Dependencies:** Phase 1 (MVP Core)

### Contexto
Los padres, tutores o referentes legales de un NNA tienen el derecho a estar informados sobre el estado general del expediente y sus próximas citas, sin tener que apersonarse físicamente a las oficinas de la DNA constantemente.
Sin embargo, **no pueden acceder a los informes psicológicos, sociales o legales internos** (que son de uso exclusivo del equipo interdisciplinario y autoridades judiciales) a menos que sean formalmente notificados.

### Modelo de Acceso Seguro
Dado que los tutores no tienen cuentas corporativas, el acceso se realizará mediante:
- **Código de Expediente** (ej. `DNA-2026-0001`).
- **PIN de Seguridad de 6 dígitos** (generado por Secretaría o Jefatura al momento de abrir el caso y entregado físicamente o por email al tutor).

### Tasks

#### 1. Backend (`apps/api`)
- [ ] Modificar `packages/db/prisma/schema.prisma` para agregar un campo `accessPin` (String, hashed) al modelo `Case` o a la entidad de la Parte (Tutor).
- [ ] Módulo `PortalAuthModule`: Endpoint público `POST /api/portal/auth` que reciba `caseCode` y `pin` y retorne un JWT con rol limitado (`TUTOR`).
- [ ] Módulo `PortalModule`: Endpoints protegidos para el JWT del tutor:
  - `GET /api/portal/cases/me` (Estado general del caso, oficina actual, vía de intervención).
  - `GET /api/portal/cases/me/appointments` (Próximas citas o audiencias programadas).
  - `GET /api/portal/cases/me/documents` (Solo documentos explícitamente marcados como "Públicos para el tutor", ej: citaciones).

#### 2. Frontend (`apps/web`)
- Rutas explícitas del Portal Externo bajo `app/portal/` (para evitar colisión de Route Groups con `app/(auth)/login`):
  - `/portal/login` (`app/portal/login/page.tsx`): Interfaz minimalista y accesible para ingresar Código de Caso y PIN.
  - `/portal/estado` (`app/portal/estado/page.tsx`): Dashboard del tutor mostrando:
    - Estado actual (Evaluación, Seguimiento, etc.).
    - Fechas de próximas citaciones.
    - Información de contacto de la oficina donde radica el caso.
- [ ] Integrar generación y reseteo de PIN en la vista interna de Jefatura/Secretaría (`/casos/[id]`).

### Acceptance Criteria
- [ ] Un usuario externo puede autenticarse exitosamente usando el código de caso y el PIN asociado.
- [ ] El tutor puede ver sus próximas citas agendadas, pero no puede ver bajo ninguna circunstancia los ActionLogs (bitácora interna), Informes Profesionales ni Evidencias (a menos que sean marcadas públicas).
- [ ] Secretaría/Jefatura puede revocar o regenerar el PIN desde el Dashboard interno si el tutor lo extravía.
- [ ] El portal externo cuenta con un diseño "Mobile First", ya que la mayoría de los usuarios externos accederán desde teléfonos celulares.
