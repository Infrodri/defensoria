# Resumen Ejecutivo: Roles y Permisos del Sistema DNA

**Objetivo**: Guía rápida para entender quién puede hacer qué en el sistema.
**Audiencia**: Agentes IA, desarrolladores, administradores.
**Alineación**: matrices verificadas contra los `@Roles` reales de los controllers (`apps/api/src/modules/*/*.controller.ts`) y el sidebar real (`apps/web/components/layout/sidebar.tsx`).

---

## 🔐 Los 7 Roles del Sistema

| Rol | Acceso a expedientes | Alcance general |
|-----|----------------------|-----------------|
| **ADMINISTRADOR** | Todos los casos, sin filtro | Control total: usuarios, IA, conocimiento, catálogos, auditoría |
| **JEFATURA** | Casos de su oficina (`currentOfficeId = officeId`) | Supervisión: asignar profesionales, informes, auditoría de oficina, herramientas |
| **SECRETARIA** | Casos de su oficina | Administrativa: inicio de caso, inspecciones, agenda, expedientes |
| **ABOGADO** | Solo casos asignados activamente | Informes jurídicos, herramientas legales, copiloto IA |
| **PSICOLOGO** | Solo casos asignados activamente | Informes psicológicos, herramientas psicológicas, copiloto IA |
| **SOCIAL** | Solo casos asignados activamente | Informes sociales, herramientas sociales, copiloto IA |
| **REFERENTE_TUTOR** | Solo el expediente de su pupilo (vía portal `/portal`, PIN + caseCode) | Lectura: estado del caso, citas y documentos |

> "Asignado activamente" = `caseTeamHistory.endDate = null`.

---

## 📊 Matriz de Módulos (backend `@Roles` reales)

| Módulo | ADMIN | JEFATURA | SECRETARIA | ABOGADO | PSICOLOGO | SOCIAL | REFERENTE |
|--------|-------|----------|-----------|---------|-----------|--------|-----------|
| **USERS** (funcionarios) | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **CASES** (expedientes) | ✅ | ✅ | ✅ | ✅* | ✅* | ✅* | 🔒 solo su caso |
| **REPORTS** (informes) | ✅ | ✅ | ⚠️ | ✅* | ✅* | ✅* | ❌ |
| **APPOINTMENTS** (citas) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔒 (portal) |
| **EVIDENCES** (pruebas) | ✅ | ✅ | ✅ | ✅* | ✅* | ✅* | ❌ |
| **INSPECTIONS** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| **KNOWLEDGE** — base de conocimiento | ✅ | ✅ (lectura) | ❌ | ❌ | ❌ | ❌ | ❌ |
| **KNOWLEDGE** — ops IA (transcribe, analyze-image, queue, search) | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ |
| **AI-CONFIG** (Ollama/Whisper/visión) | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **AUDIT** (auditoría) | ✅ (sin filtro) | ✅ (su oficina) | ❌ | ❌ | ❌ | ❌ | ❌ |
| **DISCIPLINES** — escritura | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **DISCIPLINES** — lectura | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (autenticado) |

**Notas sobre la matriz**:
- **USERS**: CRUD completo (listar, detalle, crear, actualizar, reset de contraseña) = ADMINISTRADOR + JEFATURA en todos los endpoints (`users.controller.ts`). `GET /users/professionals/list` (para asignación) está abierto a todo rol autenticado.
- **REPORTS**: `reports.controller.ts` NO tiene `@Roles` en create/emit/complementary/historial/borrador — cualquier rol con acceso al caso crea y emite informes. Excepción: `GET /reports/filtrar` (búsqueda de expedientes por CI/nombre) = ADMIN + JEFATURA. SECRETARIA ve solo metadata de informes.
- **EVIDENCES**: sin `@Roles`; acceso por caso (`CaseAccessGuard` en lectura). Upload valida token JWT y existencia del caso. Las evidencias son **inmutables**: `DELETE/PATCH/PUT` responden 405 (cadena de custodia).
- **KNOWLEDGE**: lectura de la base de conocimiento (`GET /knowledge/documents` y chunks) = solo ADMIN + JEFATURA. Escritura (ingest/upload/eliminar) = ADMIN. Las operaciones de IA (transcribir, analizar imagen, encolar caso, buscar transcripciones) están abiertas a los 3 roles profesionales + ADMIN + JEFATURA.
- **COPILOTO IA** (`/ai/*`): intención frontend = ABOGADO, PSICOLOGO, SOCIAL; **el backend solo aplica JwtAuthGuard** (sin `@Roles`) — cualquier rol autenticado podría invocarlo. Follow-up de seguridad separado.

*✅ = acceso según `@Roles` / guard; ⚠️ = limitado (solo metadata); 🔒 = acceso restringido por caso/portal; \* = solo si está asignado activamente al caso.*

---

## 🧭 Sidebar por Rol (counts reales de `sidebar.tsx`)

```
ADMINISTRADOR (20 ítems / 4 grupos):
├─ Operación (7): Panel General · Agenda y Citas · Expedientes · Inicio de caso ·
│                 Inspecciones · Reportes · Balanceo de Equipo
├─ Gestión Institucional (4): Personal & Permisos · Oficinas y Distritos ·
│                              Auditoría Total · Reportes
├─ Sistema (8): Herramientas · Verificar Herramientas · Configuración IA ·
│               Base de Conocimiento · Disciplinas · Catálogos ·
│               Usuarios del Sistema · Mantenimiento
└─ IA (1): Procesos IA

JEFATURA (9 ítems):
  Panel General · Agenda y Citas · Expedientes · Inicio de caso · Inspecciones ·
  Reportes · Balanceo de Equipo · Herramientas · Auditoría

SECRETARIA (5 ítems):
  Panel General · Agenda y Citas · Inicio de caso · Inspecciones · Expedientes

ABOGADO (5 ítems):
  Panel General · Mis Casos Asignados · Herramientas Legales · Inspecciones · Copiloto IA

PSICOLOGO (5 ítems):
  Panel General · Mis Casos Asignados · Herramientas Psicológicas ·
  Indicadores de Riesgo · Copiloto IA

SOCIAL (5 ítems):
  Panel General · Mis Casos Asignados · Herramientas Sociales ·
  Directorio Derivación · Copiloto IA

REFERENTE_TUTOR (3 ítems):
  Estado del Caso · Mis Citas · Portal del Tutor
```

**Nota**: los profesionales (ABOGADO/PSICOLOGO/SOCIAL) **no tienen** "Agenda y Citas" en el sidebar (5 ítems). JEFATURA **incluye** "Herramientas" (9 ítems). El sidebar de ADMINISTRADOR tiene 20 ítems en 4 grupos.

---

## ⚠️ Desalineación conocida: frontend vs backend (herramientas)

`apps/web/lib/role-access.ts` habilita en la UI acciones que el backend rechaza con 403:

- **JEFATURA**: write en herramientas de disciplina (legal/psicológicas/sociales) → backend `@Roles` solo admite la disciplina + ADMINISTRADOR → **403**.
- **Profesionales**: write en transversales (Línea de Tiempo, Reporte Anonimizado) → backend solo admite JEFATURA + ADMINISTRADOR → **403**.

Detalle completo en `docs/arquitectura/PERMISOS-ROLES-HERRAMIENTAS.md`. Resolución: **bugfix de autorización front/back (follow-up separado)**.

---

## 📞 Referencia Rápida

**Archivo | Contiene**
- `packages/shared/src/index.ts` → Enums Role, CaseType, Phase, Priority
- `apps/api/src/modules/*/[module].controller.ts` → `@Roles` en cada endpoint
- `apps/api/src/common/case-access/case-access.service.ts` → Lógica de acceso a expedientes
- `apps/web/components/layout/sidebar.tsx` → Menú por rol (counts reales)
- `apps/web/lib/role-access.ts` → Permisos de herramientas (frontend)

**Comandos**:
```bash
# Ver permisos de un módulo
grep "@Roles" apps/api/src/modules/MODULO/*.controller.ts
```

---

**Última actualización**: 2026-08-04
