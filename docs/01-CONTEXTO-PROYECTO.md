# Contexto del Proyecto - DNA Sucre

**Tiempo de lectura**: 5 minutos  
**Para**: Agentes IA nuevos en el proyecto

---

## ¿Qué es este sistema?

**Sistema de Gestión y Acompañamiento de Casos** para la **Defensoría de la Niñez y Adolescencia (DNA)** del municipio de Sucre, Bolivia.

### Problema que Resuelve
La DNA recibe casos donde los derechos de niños, niñas y adolescentes (NNA) están en riesgo. Necesitan:
- Coordinar equipos interdisciplinarios (Abogado, Psicólogo, Trabajador Social)
- Mantener historial completo e inmutable de cada caso
- Gestionar evidencias sensibles con cadena de custodia
- Generar informes profesionales validados
- Consultar marco legal boliviano con IA local

### Principio Central
> **"El caso pertenece al NNA. Los profesionales y las oficinas son temporales."**

Esto significa:
- ✅ El expediente es inmutable y persistente
- ✅ La asignación de profesionales es mutable con historial
- ✅ Los casos pueden moverse entre oficinas sin duplicar datos

---

## Stack Tecnológico

```
Frontend:  Next.js 16 + React 19 + TypeScript + shadcn/ui + Tailwind CSS v4
Backend:   NestJS 11 + TypeScript
Database:  PostgreSQL 16 + Prisma ORM + pgvector
Storage:   MinIO (S3-compatible, on-premise)
IA:        Ollama + Qwen3-8B + nomic-embed-text (100% local)
Testing:   Vitest + Playwright
Monorepo:  Turborepo + npm workspaces
```

### Puertos de Desarrollo
- Frontend: `3100`
- Backend: `4100`
- PostgreSQL: `5435` (host) → 5432 (container)
- MinIO: `9000` (API), `9001` (Console)

---

## Arquitectura del Monorepo

```
defensoria/
├── apps/
│   ├── web/                  # Frontend Next.js 16
│   │   ├── app/             # App Router (route groups por rol)
│   │   └── components/      # Componentes React
│   │
│   └── api/                  # Backend NestJS 11
│       ├── src/modules/     # 26 módulos (auth, cases, reports, etc.)
│       └── src/scripts/     # Scripts de migración/utils
│
├── packages/
│   ├── shared/               # @defensoria/shared
│   │   └── types, enums, esquemas Zod
│   │
│   └── db/                   # @defensoria/db
│       └── Prisma schema + cliente
│
└── docs/                     # Documentación completa
```

---

## Módulos Principales del Backend

### Core (Autenticación y Usuarios)
- **auth** - Login JWT local
- **users** - CRUD funcionarios
- **offices** - 9 distritos de Sucre

### Gestión de Casos
- **cases** - Expedientes NNA
- **persons** - Personas involucradas
- **action-logs** - Bitácora cronológica
- **appointments** - Agenda

### Profesional
- **reports** - Informes (social, psicológico, jurídico)
- **evidences** - Archivos con cadena de custodia
- **disciplines** - Tipos de informes por disciplina

### Inteligencia (Fase 3)
- **knowledge** - Base RAG + ingesta documentos
- **ai-assistant** - Copiloto IA
- **ai-config** - Configuración modelos

### Administrativo
- **audit** - Logs inmutables
- **catalogs** - Catálogos configurables
- **system-modules** - RBAC dinámico
- **inspections** - Fiscalización establecimientos

---

## Roles del Sistema (RBAC)

| Rol | Función | Alcance |
|-----|---------|---------|
| **ADMINISTRADOR** | Gestión completa del sistema | Todo |
| **JEFATURA** | Supervisión, asignación, auditoría | Todo |
| **ABOGADO** | Actuación jurídica, informes legales | Casos asignados |
| **PSICOLOGO** | Evaluación e informes psicológicos | Casos asignados |
| **SOCIAL** | Ficha social, informes sociales | Casos asignados |
| **SECRETARIA** | Agenda, ingesta de casos | Operativo |
| **REFERENTE_TUTOR** | Seguimiento de su NNA | Vista restringida |

---

## Modelo de Datos (Simplificado)

### Entidades Principales
```
Case (Expediente)
  ├── CaseParty (Personas involucradas: NNA, denunciante, etc.)
  ├── CaseTeamHistory (Profesionales asignados con historial)
  ├── CaseOfficeHistory (Transferencias entre distritos)
  ├── ActionLog (Bitácora cronológica inmutable)
  ├── Report (Informes profesionales)
  ├── Evidence (Archivos con SHA-256)
  └── Appointment (Citas vinculadas al caso)

User (Funcionarios)
Office (9 distritos de Sucre)
Person (Todas las personas: NNA, denunciantes, etc.)
AuditLog (Auditoría append-only)
```

### Enums Clave
- `Role`: ADMINISTRADOR, JEFATURA, ABOGADO, PSICOLOGO, SOCIAL, SECRETARIA, REFERENTE_TUTOR
- `Phase`: DERIVACION, EVALUACION, SEGUIMIENTO, JUDICIALIZACION, CIERRE
- `RiskLevel`: BAJO, MEDIO, ALTO
- `ReportStatus`: BORRADOR, EMITIDO

---

## Sistema RAG (Inteligencia Artificial)

### ¿Qué es?
Sistema de recuperación aumentada por generación que permite al copiloto IA consultar documentos legales bolivianos.

### Principio RAG
**UN ARTÍCULO LEGAL = UN CHUNK**

Ejemplo:
```
Ley 548 Código NNA:
  Chunk #1: Artículo 1.- (OBJETO) - Completo
  Chunk #2: Artículo 2.- (FINALIDAD) - Completo
  Chunk #3: Artículo 3.- (MARCO CONSTITUCIONAL) - Completo
```

### Tecnologías RAG
- **Modelo LLM**: Qwen3-8B (local, Ollama)
- **Embeddings**: nomic-embed-text (local, CPU)
- **Base vectorial**: PostgreSQL 16 + pgvector
- **Ingesta**: Markdown, PDF, URL Web

**Para más detalles**: Lee [rag/00-RAG-INDEX.md](rag/00-RAG-INDEX.md)

---

## Seguridad

### Principios
1. **Soberanía de datos**: Datos de NNA NUNCA salen del servidor municipal
2. **IA 100% local**: Sin conexión a OpenAI, Anthropic, etc.
3. **Auditoría completa**: Tabla `AuditLog` append-only
4. **RBAC estricto**: Roles + permisos por asignación
5. **Token de Seguridad**: Re-autenticación para evidencia sensible

### Autenticación
- JWT local con bcrypt
- Sin SSO (futura integración SAML/OIDC prevista)
- 2FA opcional en Fase 1, obligatorio en Fase 2

---

## Flujos de Trabajo Principales

### 1. Ingesta de Caso
```
Secretaría/Jefatura → Buscar duplicados → Crear caso → Asignar equipo
```

### 2. Trabajo Interdisciplinario
```
Abogado: Actuación jurídica
Psicólogo: Evaluación e informe
Social: Ficha social e informe
→ Todos registran en ActionLog (bitácora)
```

### 3. Generación de Informes
```
Profesional: Redacta borrador → Valida → Emite → Inmutable
```

### 4. Consulta IA
```
Usuario: "¿Qué dice el Art. 84?" → RAG busca vectorialmente → Copiloto responde
```

---

## Fases del Proyecto

| Fase | Descripción | Estado |
|------|-------------|--------|
| Fase 0 | Validación legal (catálogos) | ✅ Completado |
| Fase 1 | MVP Core (auth, casos, agenda) | ✅ Completado |
| Fase 2 | Módulos profesionales (informes, token) | ✅ Completado |
| Fase 3 | Inteligencia (RAG, copiloto, timeline) | ✅ Completado |
| Fase 4 | Portal externo (Referente/Tutor) | ✅ Completado |
| Fase 5 | Módulo de inspecciones | ✅ Completado |

---

## Territorio: 9 Distritos de Sucre

| Código | Nombre | Tipo |
|--------|--------|------|
| CENTRAL | Defensoría Central Sucre | Sede Central |
| DIST_1 | Mercado Campesino | Urbano |
| DIST_2 | Alto Delicias / Lajastambo | Urbano |
| DIST_3 | Yurac Yurac / Max Toledo | Urbano |
| DIST_4 | San José / Villa Armonía | Urbano |
| DIST_5 | Aranjuez / Azari | Urbano |
| DIST_6 | Arabate | Rural |
| DIST_7 | Chataquila | Rural |
| DIST_8 | Potolo | Rural |

---

## Convenciones de Código

### Naming
- Archivos: `kebab-case.ts`
- Componentes: `PascalCase.tsx`
- Variables/funciones: `camelCase`
- Rutas URL: español + `kebab-case` (`/ingesta-caso`)
- Modelos Prisma: `PascalCase`
- Packages: `@defensoria/nombre`

### Commits
```
feat: agregar módulo de inspecciones
fix: corregir validación de formulario
refactor: mejorar chunking RAG
docs: actualizar guía de ingesta
chore: actualizar dependencias
```

### Primary Keys
- UUID v7 (cronológicamente sorteable)
- Excepto `AuditLog` que usa BIGSERIAL

---

## Próximos Pasos para un Agente IA

**Si acabas de leer esto**:
1. ✅ Ahora lee [02-ARQUITECTURA-RESUMEN.md](02-ARQUITECTURA-RESUMEN.md) para profundizar
2. ✅ Si vas a trabajar con RAG: [rag/00-RAG-INDEX.md](rag/00-RAG-INDEX.md)
3. ✅ Si necesitas el modelo de datos: [modelo-datos/schema-v0.md](modelo-datos/schema-v0.md)

**Cuando trabajes**:
- Siempre verifica el código fuente como fuente de verdad
- Consulta ADRs para entender decisiones arquitectónicas
- Actualiza documentación si haces cambios significativos

---

**Referencias**:
- Especificación completa: [master-spec.md](master-spec.md)
- Arquitectura: [02-ARQUITECTURA-RESUMEN.md](02-ARQUITECTURA-RESUMEN.md)
- ADRs: [arquitectura/](arquitectura/)
- Modelo de datos: [modelo-datos/schema-v0.md](modelo-datos/schema-v0.md)

