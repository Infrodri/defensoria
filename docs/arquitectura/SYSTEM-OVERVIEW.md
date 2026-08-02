# Resumen General del Sistema de Gestión de Casos DNA (Defensoría de la Niñez y Adolescencia)

Este documento sirve como **fuente única de verdad (Single Source of Truth)** sobre la arquitectura, estado de implementación y decisiones técnicas del proyecto.

---

## 1. Principio Fundamental
> *"El caso pertenece al niño, niña o adolescente (NNA). Los profesionales, las oficinas y los sistemas son temporales dentro del caso."*

---

## 2. Visión General del Sistema
El Sistema de Gestión de Casos DNA es una plataforma integral monorepo (Turborepo + npm workspaces) diseñada para la Defensoría de la Niñez y Adolescencia en Sucre, Bolivia. Garantiza el cumplimiento de la Ley 548 (Código Niña, Niño y Adolescencia) y el resguardo estricto on-premise de los datos de menores.

---

## 3. Resumen de Fases Implementadas (100% Completado)

### 📌 Fase 0 — Catálogos y Marco Legal
- Marco normativo de la Ley 548 y Ley 1168/1371 documentado en `docs/marco-legal/marco-normativo.md`.
- Catálogos configurables de Tipos de Trámite, Medidas de Protección y Vías de Intervención.

### 📌 Fase 1 — MVP Core
- **Autenticación e Identidad**: JWT + bcrypt con RBAC (Administrador, Jefatura, Abogado, Psicólogo, Trabajador Social, Secretaría).
- **Rol Administrador (`ADMINISTRADOR`)**: Superusuario encargado de la gestión de oficinas distritales, administración de usuarios y asignación de permisos globales.
- **Registro Único y Anti-Duplicación**: Búsqueda obligatoria de personas (NNA, Denunciante, Denunciado) previa a la ingesta.
- **Riel de Fase (`PhaseRail`)**: Visualización horizontal/vertical del ciclo de vida del expediente (*Derivación → Evaluación → Seguimiento → Judicialización → Cierre*).
- **Historial de Equipo y Oficinas**: Trazabilidad completa de asignaciones interdisciplinarias y transferencias distritales.
- **Bitácora (ActionLog)**: Registro cronológico append-only con firma digital interna para bloqueo de edición.
- **Agenda del Caso**: Citas y audiencias vinculadas al expediente (no al profesional).
- **Auditoría Append-Only**: Registro inmutable de acciones en la base de datos.

### 📌 Fase 2 — Módulos Profesionales y Seguridad
- **Módulo de Informes Profesionales (`ReportsModule`)**: Creación de informes sociales, psicológicos, jurídicos y psicosociales.
- **Congelamiento por Emisión**: Un informe emitido queda congelado en estado `EMITIDO`. Solo se pueden agregar informes complementarios (`v2`, `v3`) referenciando al original.
- **Actualización Automática de Riesgo**: Los informes psicológicos emitidos actualizan el nivel de riesgo del caso (`BAJO`, `MEDIO`, `ALTO`).
- **Token de Seguridad Documental (`SecurityTokenModule`)**: Re-autenticación por contraseña para obtener un JWT temporal (15 min) antes de ver/descargar evidencias sensibles o informes clínicos.
- **Evidencias e Integridad Hash (`EvidencesModule`)**: Subida de archivos con cálculo de hash SHA-256 en memoria y almacenamiento en MinIO (S3-compatible).

### 📌 Fase 3 — Inteligencia Local y Línea de Tiempo
- **Copiloto de IA Local (`AiAssistantModule`)**: Integración con Ollama local (`http://localhost:11434`) para asistencia en redacción de escritos legales e indicadores de riesgo sin enviar datos nominativos a la nube.
- **Configuración de IA en DB (`SystemSetting`)**: Variables de endpoint y modelo administrables desde base de datos.
- **Línea de Tiempo Procesal Avanzada (`CaseTimeline`)**: Historial consolidado cronológico que unifica apertura, bitácora, agenda, informes y evidencias.

### 📌 Fase 4 — Portal Externo para Tutores
- **Autenticación por PIN de 6 dígitos**: Acceso seguro para tutores usando Código de Expediente + PIN generado por Secretaría/Jefatura (`POST /cases/:id/generate-pin`).
- **Dashboard del Tutor (`app/portal/`)**: Vista mobile-first con rutas explícitas `/portal/login` y `/portal/estado` que muestra la fase actual del caso, próximas citaciones y datos de la oficina asignada, aislando 100% la información clínica/sensible.
- **Estrategia JWT Aislada (`JwtStrategy`)**: Estrategia global `JwtStrategy` configurada para validar tokens con `isPortal: true`, retornando el contexto sintético `{ sub, caseId, caseCode, role: REFERENTE_TUTOR, isPortal: true }` sin realizar consultas a la tabla `User`.
- **Alineación de Secretos**: Unificación de la clave secreta `JWT_SECRET` entre `AuthModule` y `PortalAuthModule` para asegurar la firma e inspección válida en todos los guards del sistema (`JwtAuthGuard`).

### 📌 Módulo de Administración General (9 Distritos, Agenda, RBAC Dinámico, IA y Mantenimiento)
- **Gestión de 9 Distritos de Sucre (`OfficesModule`)**: Registro territorial completo de los 9 distritos urbanos y rurales de Sucre (`CENTRAL`, `DIST_1` a `DIST_8`) con recuento en tiempo real de personal asignado y expedientes activos.
- **Gestión de Personal y Claves (`UsersModule`)**: CRUD completo para el rol `ADMINISTRADOR` que permite el alta, edición de perfil, cambio de rol, reasignación de distrito y restablecimiento seguro de contraseñas.
- **Módulos Dinámicos del Sistema y Matriz RBAC (`SystemModulesModule`)**: Permite al Administrador dar de alta nuevos módulos (`SystemModule`), editar su nombre y descripción, y ajustar las reglas de acceso por rol desde `/permisos`.
- **Catálogos Dinámicos (`CatalogsModule` - `/panel/admin/catalogos`)**: Permite la administración 100% configurable de listas desplegables (tipos de violencia, medidas de protección, barrios) desde la base de datos sin alterar código.
- **Mantenimiento y Copias de Seguridad (`SystemBackupModule` - `/panel/admin/mantenimiento`)**: Endpoint `POST /system-backup/generate` para la generación y descarga en 1-clic de volcados nativos de PostgreSQL (`pg_dump`) en UTF-8 soberanos sin conexión a internet.
- **Transferencia Masiva de Expedientes (`CasesModule`)**: Reasignación atómica en bloque de expedientes activos entre profesionales del mismo rol con actualización de `CaseTeamHistory` y traza de auditoría.
- **Gestión RAG de Base de Conocimiento (`KnowledgeModule` - `/panel/admin/conocimiento`)**: Ingesta web prioritaria (HTML scraping con `cheerio`) y carga nativa de PDFs. Incluye partición defensiva (1500 chars limit) y vectorización local con Ollama (`pgvector`), además de control de vigencia jurídica para activar/derogar normativas.
- **Auditoría Inmutable de Sistema (`/auditoria`)**: Acceso habilitado para `ADMINISTRADOR` y `JEFATURA` a la consulta del registro append-only de eventos.
- **Agenda Consolidada y Personal de Citas (`/citas`)**: Vista unificada y filtrable por pestaña entre **`📋 Mi Agenda Asignada`** y **`🌐 Agenda Consolidada`**, con sección **`⚡ Citaciones Urgentes`** en el Panel de Control (`/panel`).

---

## 4. Datos de Prueba Locales (Seeding Idempotente)

- **Script de Carga (`packages/db/prisma/seed.ts`)**: Generador idempotente que ejecuta `deleteMany` secuencial de evidencias, informes, bitácoras, citaciones, personas y casos previa inserción.
- **Expedientes de Prueba**:
  - `DNA-2026-0001`: Fase Derivación / Recepción · PIN Tutor: `123456`
  - `DNA-2026-0002`: Fase Evaluación Interdisciplinaria · PIN Tutor: `654321`
  - `DNA-2026-0003`: Fase Plan de Acompañamiento · PIN Tutor: `112233`
  - `DNA-2026-0004`: Fase Vía Judicial · PIN Tutor: `445566`
  - `DNA-2026-0005`: Fase Cierre de Caso · PIN Tutor: `998877`

---

## 5. Correcciones de Desfases y UI/UX Frontend

- **Riel de Fase Procesal (`PhaseRail`)**:
  - Corrección de desbordamiento horizontal (overflow flex box) en contenedores estrechos (pantalla de portal tutor de 600px).
  - Encabezado "Riel de Fase Procesal" fijado en la parte superior (`flex-direction: column`).
  - Pasos procesales organizados con desplazamiento horizontal continuo (`overflow-x: auto`), conectores visuales (`ChevronRight`) e inmutabilidad de ancho (`flex-shrink: 0`).
  - Corrección del error tipográfico ("Processal" → "Procesal").
- **Formateadores de Etiquetas de Dominio (`@defensoria/shared`)**:
  - Implementación de funciones puras de formateo (`formatPhase`, `formatInterventionPath`, `formatCaseType`, `formatAppointmentType`, `formatAppointmentStatus`, `formatActionType`, `formatRiskLevel`).
  - Reemplazo total de la impresión de cadenas raw de enums (`VIA_JUDICIAL`, `EVALUACION`, `ENTREVISTA`) por etiquetas humanas estilizadas tanto en el portal público de tutores como en la ficha del expediente del personal.

---

## 6. Estructura de Proyectos y Puertos

```text
defensoria-nna/                          # Monorepo Turborepo (npm workspaces)
├── .gitignore
├── docker-compose.yml                   # Infra local: Postgres (5435), MinIO
├── docker-compose.prod.yml
├── package.json                         # Workspaces + scripts turbo (dev, build, test, db:*)
├── turbo.json
├── README.md
│
├── apps/
│   ├── api/                             # NestJS API (Puerto 4100)
│   │   ├── Dockerfile
│   │   ├── nest-cli.json
│   │   ├── package.json
│   │   └── src/
│   │       ├── main.ts
│   │       ├── app.module.ts
│   │       ├── common/
│   │       │   ├── decorators/          # current-user, roles
│   │       │   ├── guards/              # jwt-auth, roles
│   │       │   └── interceptors/        # rls-context (Row-Level Security)
│   │       └── modules/
│   │           ├── action-logs/         # Bitácora con firma/lock
│   │           ├── ai-config/           # Configuración de modelos IA local
│   │           ├── ai-assistant/        # Copilot (Ollama local)
│   │           ├── appointments/        # Agenda de citas y citaciones
│   │           ├── audit/               # Panel de auditoría jefatura
│   │           ├── auth/                # JWT + strategies + DTO login
│   │           ├── cases/               # Gestión de casos, derivaciones y transferencia masiva
│   │           ├── catalogs/            # Catálogos dinámicos (CRUD)
│   │           ├── evidences/           # Evidencias (MinIO + SHA256)
│   │           ├── inspections/         # Inspecciones por distrito
│   │           ├── knowledge/           # RAG Base de Conocimiento y vigencia
│   │           ├── minio/               # Object storage service
│   │           ├── offices/             # Oficinas (9 Distritos)
│   │           ├── persons/             # Búsqueda de Personas
│   │           ├── portal/              # API Portal público de tutores
│   │           ├── portal-auth/         # Auth aislada del portal
│   │           ├── prisma/              # PrismaModule/Service
│   │           ├── reports/             # Informes con pre-emisión
│   │           ├── security-token/      # Token de seguridad (overlay)
│   │           ├── system-backup/       # Copias de seguridad (pg_dump)
│   │           ├── system-modules/      # Módulos dinámicos RBAC
│   │           ├── timeline/            # Timeline del expediente
│   │           └── users/               # Gestión de personal (CRUD)
│   │
│   └── web/                             # Next.js App Router (Puerto 3100)
│       ├── Dockerfile
│       ├── next.config.ts
│       ├── playwright.config.ts         # E2E testing configurado
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   ├── providers.tsx
│       │   ├── (auth)/
│       │   │   ├── ingreso/
│       │   │   └── login/
│       │   ├── (dashboard)/
│       │   │   ├── layout.tsx
│       │   │   ├── agenda/
│       │   │   ├── auditoria/
│       │   │   ├── casos/               # + [id]/ (Detalle expediente)
│       │   │   ├── citas/               # Agenda consolidada
│       │   │   ├── copilot/
│       │   │   ├── derivacion/
│       │   │   ├── equipo/
│       │   │   ├── ingesta-caso/        # Ingesta inicial
│       │   │   ├── inspecciones/
│       │   │   ├── oficinas/            # Gestión de 9 distritos
│       │   │   ├── panel/               # Dashboard y Citaciones Urgentes
│       │   │   ├── permisos/            # Matriz dinámica RBAC
│       │   │   ├── reportes/
│       │   │   └── riesgo/
│       │   └── portal/                  # Portal externo tutor (estado + login)
│       ├── components/
│       │   ├── ai/                      # Copiloto de IA
│       │   ├── cases/                   # timeline, phase-rail, etc
│       │   ├── evidences/               # evidence-gallery
│       │   ├── layout/                  # sidebar, topbar
│       │   ├── reports/                 # report-editor con vista previa
│       │   └── seguridad/                # security-token-modal
│       └── lib/                         # auth-context, api, etc.
│
├── packages/
│   ├── db/                              # Prisma
│   │   ├── .env
│   │   ├── prisma/
│   │   │   ├── schema.prisma            # Schema (RLS y UUIDv7)
│   │   │   └── seed.ts                  # Semilla idempotente (Expedientes y Distritos)
│   │   └── src/index.ts
│   └── shared/                          # @defensoria/shared
│       └── src/index.ts                 # Formateadores, Types y Zod Schemas
│
└── docs/
    ├── admin-master-plan.md
    ├── master-spec.md
    ├── system-overview.md               # Archivo actual
    ├── api/postman_collection.json
    ├── arquitectura/
    │   ├── ADR-001-foundation.md
    │   ├── ADR-018-riesgos-diferidos.md
    │   ├── ADR-019-arquitectura-multidisciplinaria.md
    │   ├── ADR-023-ia-local-soberana.md
    │   └── ADR-024-rag-ingestion-strategy.md
    ├── modelo-datos/schema-v0.md
    ├── marco-legal/marco-normativo.md
    ├── hoja-de-ruta/phase-1..5-breakdown.md
    └── seguridad/access-control.md
```

---

## 7. Comandos de Verificación
- **Backend**: `cd apps/api && npx tsc --noEmit`
- **Frontend**: `cd apps/web && npx tsc --noEmit --skipLibCheck`
- **Paquete Compartido**: `cd packages/shared && npm run build`
- **Regenerar Semilla de Datos**: `cd packages/db && npx prisma db seed`


