# INSTRUCTIVAS DE DELEGACIÓN A AGENTES IA ESPECIALIZADOS
**Proyecto**: Sistema DNA Sucre — Defensoria de la Niñez y Adolescencia  
**Fase**: 2 (Implementación de 11 módulos especializados)  
**Semana**: Semana 2 (Post-Phase 1)  
**Audiencia**: Project Managers y Orquestadores de Agentes IA  
**Versión**: 1.0 | **Fecha**: 2026-08-01

---

## 📖 ÍNDICE

1. [Visión General](#visión-general)
2. [Estructura de Delegación](#estructura-de-delegación)
3. [Formato TPV (Task-Preconditions-Validation)](#formato-tpv)
4. [Checklist de Validación](#checklist-de-validación)
5. [Métricas de Progreso](#métricas-de-progreso)
6. [Los 11 Módulos de Fase 2](#los-11-módulos-de-fase-2)
7. [Ejemplos de Delegaciones Reales](#ejemplos-de-delegaciones-reales)
8. [Matriz de Riesgos](#matriz-de-riesgos)
9. [Comunicación con Agentes](#comunicación-con-agentes)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 VISIÓN GENERAL

### Contexto
- **Fase 1 (Completada)**: Inspections Module + Questionnaires Module → 15 endpoints, 9 tablas
- **Fase 2 (Próxima)**: 11 módulos especializados → 12 endpoints, 11 tablas
- **Arquitectura**: NestJS (backend) + React (frontend) + PostgreSQL (data) + Ollama (IA local)
- **Duración estimada**: 2 semanas (5 días de trabajo por agente especializado)

### Objetivo de Fase 2
Implementar análisis automáticos especializados por rol profesional:

| Módulo | Especialidad | Rol Destino | Complejidad | Endpoints |
|--------|--------------|------------|-------------|-----------|
| Legal Tools (3) | Análisis jurídico | Abogado/a | 🟠 Alta | 3 |
| Psychological Tools (3) | Análisis psicológico | Psicólogo/a | 🟠 Alta | 4 |
| Social Tools (3) | Análisis social | Trabajador/a Social | 🟡 Media | 3 |
| Transversal Tools (2) | Timeline + Anonimización | Jefatura | 🟡 Media | 2 |

---

## 🏗️ ESTRUCTURA DE DELEGACIÓN

### Niveles de Abstracción

```
┌─────────────────────────────────────────────────────┐
│ PROJECT MANAGER (Orquestador Principal)             │
│ └─ Lee: Arquitectura + Requerimientos               │
│ └─ Delega: A 6 Agentes Especializados               │
└─────────────────────────────────────────────────────┘
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Backend      │ │ Frontend     │ │ QA/Testing   │
│ Specialist   │ │ Specialist   │ │ Specialist   │
│              │ │              │ │              │
│ • Legal      │ │ • Legal UI   │ │ • Tests      │
│ • Psych      │ │ • Psych UI   │ │ • E2E        │
│ • Social     │ │ • Social UI  │ │ • Performance│
└──────────────┘ └──────────────┘ └──────────────┘
```

### Información a Pasar a Cada Agente

**SIEMPRE incluir**:
1. **Contexto del Proyecto** (`ARQUITECTURA-FINAL-COMPLETA.md`)
2. **Instrucciones de Sistema** (`agentes-ia/INSTRUCCIONES-AGENTES.md`)
3. **Schema Prisma** (tabla de datos que modificará)
4. **Endpoints Existentes** (para mantener coherencia)
5. **Tests Previos** (fixtures para testing)

**ESPECIFICO al agente**:
1. Tarea exacta (TPV format)
2. Restricciones técnicas (validaciones, permisos)
3. Definición de "listo" (exit criteria)
4. Archivo a modificar (path exacto)

---

## 📋 FORMATO TPV

Todo trabajo delegado debe especificarse en formato **TPV**: Task, Preconditions, Validation.

### Estructura TPV

```markdown
## DELEGACIÓN #[NUM]: [NOMBRE CORTO]

### TASK (Tarea Principal)
[Qué debe entregar el agente. Máximo 3 líneas.]

### PRECONDITIONS (Precondiciones - Estado Inicial)
[Qué debe existir antes de que el agente comience. Lista de 3-5 items.]

### DELIVERABLES (Entregables Esperados)
[Archivo(s) modificado(s), test(s) ejecutado(s), verificación(es) realizada(s).]

### VALIDATION (Criterio de Aceptación)
[Checklist de 5-10 items que verifican que la tarea está LISTA.]

### EXIT CRITERIA (Criterio de Salida)
[Cómo sabe el PM que el agente terminó correctamente.]
```

### Ejemplo Completo

```markdown
## DELEGACIÓN #1: Legal Tools Module — Backend

### TASK
Implementar 3 endpoints en el módulo Legal Tools que analicen automáticamente 
el expediente:
- POST /legal-tools/discrepancies (detecta inconsistencias legales)
- POST /legal-tools/typicality (valida tipificación de delitos)
- POST /legal-tools/deadlines (alertas de vencimientos procesales)

### PRECONDITIONS
- [ ] Rama Git `feature/legal-tools` existe
- [ ] Schema Prisma con 3 tablas nuevas (LegalDiscrepancy, LegalTypicality, ProcessDeadline) 
- [ ] Prisma migration ejecutada (`npx prisma migrate dev`)
- [ ] Tests unitarios de LegalToolsService creados (skeleton)

### DELIVERABLES
- src/modules/legal-tools/ (carpeta completa con controller, service, module, DTOs)
- 3 endpoints funcionales en swagger
- 100% cobertura de tests unitarios
- npm run test:legal-tools PASS

### VALIDATION
- [ ] npx tsc --noEmit → 0 errores
- [ ] npm run test -- legal-tools.service.spec → 15+ tests PASS
- [ ] POST /legal-tools/discrepancies con caso_id válido → 200 OK + análisis legible
- [ ] No hay datos hardcodeados (variables de entorno para config)
- [ ] Logs incluyen caseId y userId (auditoría)
- [ ] Manejo de errores robusto (casos vacíos, datos inválidos)

### EXIT CRITERIA
- Agente entrega PR con branch `feature/legal-tools`
- PM revisa + mergea a `develop`
- PM ejecuta tests en CI/CD → todos PASS
- PM verifica manualmente en Swagger los 3 endpoints
```



---

## ✅ CHECKLIST DE VALIDACIÓN

### Antes de Delegar

**Estructura del Repositorio**:
- [ ] `packages/db/prisma/schema.prisma` actualizado con nuevas tablas
- [ ] `apps/api/src/modules/[modulo]/` carpeta creada (vacía)
- [ ] `apps/web/app/(dashboard)/[pagina]/` carpeta creada (vacía)
- [ ] Rama Git creada: `git checkout -b feature/[modulo-nombre]`

**Documentación Disponible**:
- [ ] Agente tiene acceso a `ARQUITECTURA-FINAL-COMPLETA.md`
- [ ] Agente tiene acceso a `agentes-ia/INSTRUCCIONES-AGENTES.md`
- [ ] Agente tiene acceso a schema relevante en `schema.prisma`
- [ ] Agente tiene acceso a tests de Fase 1 (como referencia)

**Credenciales de Prueba**:
- [ ] Agente tiene URLs de dev (localhost:3000, localhost:4000)
- [ ] Agente tiene seed con usuarios de prueba
- [ ] Agente tiene conexión a DB local

### Durante la Ejecución

**Checkpoints Intermedios** (PM debe verificar cada 3 horas):
- [ ] Agente ha creado estructura de carpetas (no vacío)
- [ ] Agente ha creado DTOs sin errores de compilación
- [ ] Agente ha escrito 50% de tests
- [ ] Agente ha comunicado bloqueadores (si los hay)

**Comunicación**:
- [ ] Agente reporta diariamente en cannal #phase-2
- [ ] PM revisa blockeadores en < 30 min
- [ ] No hay cambios en scope sin autorización PM

### Después de Entregar

**Validación de Compilación**:
```bash
cd apps/api && npx tsc --noEmit
cd apps/web && npx tsc --noEmit --skipLibCheck
```
→ 0 errores

**Validación de Tests**:
```bash
npm run test -- [modulo].service.spec
# Debe estar: PASS [N] tests in [X]ms
```

**Validación de API**:
- [ ] Swagger actualizado: `http://localhost:3000/api/docs`
- [ ] Todos los endpoints listados y documentados
- [ ] Ejemplos de request/response incluidos

**Validación de DB**:
- [ ] `npx prisma studio` muestra nuevas tablas pobladas
- [ ] Relaciones FK correctas (sin errores de integridad)
- [ ] Índices en campos claves (para performance)

**Validación de Git**:
- [ ] Commits atómicos (1 funcionalidad = 1 commit)
- [ ] Mensajes de commit claros: `feat: [modulo] [que hace]`
- [ ] PR escrita con: qué cambió, por qué, cómo verificar

---

## 📊 MÉTRICAS DE PROGRESO

### Métricas por Módulo (Fase 2)

| Módulo | Endpoints | Tablas | Tests | LOC Backend | LOC Frontend | Estado |
|--------|-----------|--------|-------|-------------|--------------|--------|
| Legal Tools (3) | 3 | 3 | 15+ | ~500 | ~300 | 🟠 En asignación |
| Psych Tools (3) | 4 | 3 | 20+ | ~600 | ~400 | 🟠 En asignación |
| Social Tools (3) | 3 | 3 | 15+ | ~500 | ~350 | 🟠 En asignación |
| Transversal (2) | 2 | 2 | 10+ | ~400 | ~200 | 🟠 En asignación |
| **TOTAL** | **12** | **11** | **60+** | **2000+** | **1250+** | 🟡 Por hacer |

### Tablero de Control PM (Semanal)

```
SEMANA 2 - PROGRESO FASE 2
═════════════════════════════════════════════════════════

Lunes (Día 1):
  Legal Tools Backend ........... 0% ████░░░░░░ (Agente: Backend-Legal)
  Legal Tools Frontend .......... 0% ████░░░░░░ (Agente: Frontend-Legal)
  
Martes (Día 2):
  Psych Tools Backend .......... 20% ████░░░░░░ (Agente: Backend-Psych)
  
Miércoles (Día 3):
  Social Tools Backend ......... 15% ████░░░░░░ (Agente: Backend-Social)
  Transversal Tools ............ 0% ████░░░░░░ (Agente: Backend-Transversal)
  
Jueves (Día 4):
  Legal Tools Frontend ......... 25% ████░░░░░░ (Agente: Frontend-Legal)
  Psych Tools Frontend ......... 30% ████░░░░░░ (Agente: Frontend-Psych)
  
Viernes (Día 5):
  QA/Testing (Todos) .......... 50% ████░░░░░░ (Agente: QA-Specialist)
  Integration Tests ............ 60% ████░░░░░░ (Agente: QA-Specialist)

TOTALES:
  Backend ...................... 45% (9/20 tasks)
  Frontend ..................... 30% (4/13 tasks)
  QA ........................... 55% (11/20 tasks)
  FASE 2 OVERALL ............... 40% (24/60 tasks)
```

### Métricas de Calidad

| Métrica | Target | Actual | Status |
|---------|--------|--------|--------|
| Code Coverage | 80%+ | — | 🟡 Por medir |
| TypeScript Errors | 0 | — | 🟡 Por revisar |
| Linting Issues | 0 | — | 🟡 Por revisar |
| Tests PASS | 100% | — | 🟡 Por ejecutar |
| Performance (API) | <500ms | — | 🟡 Por benchmarking |
| Security Issues | 0 (critical) | — | 🟡 Por auditar |

---

## 🎯 LOS 11 MÓDULOS DE FASE 2

### Grupo 1: Legal Tools (3 módulos)

#### Módulo 1A: Discrepancy Detection (Detección de Inconsistencias)
- **Qué detecta**: Contradicciones entre relato de inspección y cuestionario
- **Input**: CaseId
- **Output**: Array de `{ field, expected, actual, severity, recommendation }`
- **Tabla DB**: `LegalDiscrepancy`
- **Complejidad**: 🟠 Alta (requiere lógica comparativa)
- **Endpoints**: 1 (POST)

#### Módulo 1B: Typicality Validation (Validación de Tipificación)
- **Qué valida**: Que el CaseType coincida con los hechos reportados
- **Input**: CaseId, reported_facts[]
- **Output**: `{ tipicidad_correcta, delitos_probables[], notas_legales }`
- **Tabla DB**: `LegalTypicality`
- **Complejidad**: 🟠 Alta (requiere RAG + Ollama)
- **Endpoints**: 1 (POST)

#### Módulo 1C: Process Deadlines (Vencimientos Procesales)
- **Qué alerta**: Plazos legales próximos a vencer
- **Input**: CaseId, current_phase
- **Output**: `{ deadline, days_remaining, action_required, responsible }`
- **Tabla DB**: `ProcessDeadline`
- **Complejidad**: 🟠 Alta (requiere calendario legal)
- **Endpoints**: 1 (POST)

---

### Grupo 2: Psychological Tools (3 módulos)

#### Módulo 2A: Trauma Indicators (Indicadores de Trauma)
- **Qué detecta**: Signos de trauma en respuestas del cuestionario
- **Input**: QuestionnaireResponseId
- **Output**: `{ trauma_level, indicators[], recommended_support }`
- **Tabla DB**: `TraumaIndicator`
- **Complejidad**: 🟠 Alta (escalas psicológicas)
- **Endpoints**: 2 (POST análisis, GET reportes)

#### Módulo 2B: Risk Scales (Escalas de Riesgo)
- **Qué calcula**: Puntuaciones en escalas SDQ, RCADS, etc.
- **Input**: Respuestas de cuestionario estructurado
- **Output**: `{ scale_name, score, interpretation, percentile }`
- **Tabla DB**: `RiskScale`
- **Complejidad**: 🟠 Alta (algoritmos de escalas)
- **Endpoints**: 1 (POST cálculo)

#### Módulo 2C: Clinical Translation (Traducción Clínico-Jurídica)
- **Qué traduce**: Hallazgos psicológicos → lenguaje legal
- **Input**: Informe psicológico (texto libre)
- **Output**: Versión traducida para expediente legal
- **Tabla DB**: `ClinicalTranslation`
- **Complejidad**: 🟠 Alta (LLM + prompt específico)
- **Endpoints**: 1 (POST traducción)

---

### Grupo 3: Social Tools (3 módulos)

#### Módulo 3A: Family Structure (Estructura Familiar)
- **Qué genera**: Genograma automático del núcleo familiar
- **Input**: QuestionnaireResponse (datos de familia)
- **Output**: Árbol genealógico JSON + vulnerabilidades identificadas
- **Tabla DB**: `FamilyStructure`
- **Complejidad**: 🟡 Media (mapeo de relaciones)
- **Endpoints**: 1 (POST construcción)

#### Módulo 3B: Vulnerability Assessment (Evaluación de Vulnerabilidad)
- **Qué evalúa**: Índice de vulnerabilidad socioeconómica
- **Input**: Variables de vivienda, empleo, educación, acceso a servicios
- **Output**: `{ vulnerability_score, risk_factors[], support_programs[] }`
- **Tabla DB**: `VulnerabilityAssessment`
- **Complejidad**: 🟡 Media (scoring simple)
- **Endpoints**: 1 (POST evaluación)

#### Módulo 3C: Environmental Factors (Factores Ambientales)
- **Qué analiza**: Riesgos del entorno (vecindario, acceso a drogas, etc.)
- **Input**: Ubicación GPS + observaciones de inspección
- **Output**: `{ environmental_risk, nearby_risks[], recommendations }`
- **Tabla DB**: `EnvironmentalFactor`
- **Complejidad**: 🟡 Media (Google Maps API + análisis local)
- **Endpoints**: 1 (POST con GPS)

---

### Grupo 4: Transversal Tools (2 módulos)

#### Módulo 4A: Unified Timeline (Timeline Unificada)
- **Qué integra**: Todos los eventos del expediente en orden cronológico
- **Input**: CaseId (consulta todas las acciones)
- **Output**: Array de `{ timestamp, actor, action_type, description, document_link }`
- **Tabla DB**: `UnifiedTimeline` (vistas, no tabla)
- **Complejidad**: 🟡 Media (queries relacionales)
- **Endpoints**: 1 (GET timeline)

#### Módulo 4B: Anonymization (Anonimización)
- **Qué genera**: Reporte anonimizado para juzgado
- **Input**: CaseId + list<field_names> a anonimizar
- **Output**: PDF con datos sensibles reemplazados
- **Tabla DB**: `AnonimizedReport`
- **Complejidad**: 🟡 Media (PDF generation + regex)
- **Endpoints**: 1 (POST generación)

---

## 🚀 EJEMPLOS DE DELEGACIONES REALES

### DELEGACIÓN #1: Legal Tools Backend

```markdown
## DELEGACIÓN #1: Legal Tools Module — Backend Implementation

### TASK
Implementar el módulo Legal Tools backend con 3 endpoints:
1. POST /legal-tools/discrepancies — Detecta inconsistencias
2. POST /legal-tools/typicality — Valida tipificación legal
3. POST /legal-tools/deadlines — Alertas de vencimientos

Todos deben usar el schema Prisma y retornar JSON estructurado.

### PRECONDITIONS
- [ ] Branch `feature/legal-tools` creada y checkout
- [ ] Schema Prisma con tablas: LegalDiscrepancy, LegalTypicality, ProcessDeadline
- [ ] Migration ejecutada: `npx prisma migrate dev`
- [ ] CaseAccessService y RolesGuard disponibles
- [ ] Documentos: ARQUITECTURA-FINAL-COMPLETA.md, agentes-ia/INSTRUCCIONES-AGENTES.md

### DELIVERABLES
1. Carpeta: `apps/api/src/modules/legal-tools/`
   - legal-tools.controller.ts (3 endpoints)
   - legal-tools.service.ts (lógica de análisis)
   - legal-tools.module.ts (importado en app.module.ts)
   - dto/ (CreateDiscrepancyDto, etc.)

2. Tests: `apps/api/src/modules/legal-tools/legal-tools.service.spec.ts`
   - 15+ tests (mínimo)
   - Cobertura > 80%

3. Git:
   - Commits atómicos
   - PR escrita con descripción
   - Lint: npx eslint . --fix

### VALIDATION CHECKLIST
- [ ] `npx tsc --noEmit` → 0 errores TypeScript
- [ ] `npm run test -- legal-tools.service.spec.ts` → 15+ PASS
- [ ] `npm run lint` → 0 warnings en /legal-tools
- [ ] Swagger muestra 3 endpoints documentados
- [ ] POST /legal-tools/discrepancies con caseId válido → 200 + array de inconsistencias
- [ ] POST /legal-tools/typicality con caseId válido → 200 + objeto {tipicidad_correcta, delitos}
- [ ] POST /legal-tools/deadlines con caseId válido → 200 + array de plazos
- [ ] Error handling: si caseId no existe → 404 NotFound
- [ ] Error handling: si usuario sin acceso → 403 Forbidden
- [ ] Logs incluyen: userId, caseId, timestamp, acción realizada
- [ ] Variables de entorno usadas (no hardcoded): OLLAMA_URL, RAG_ENDPOINT

### EXIT CRITERIA
- Agente entrega PR contra rama `develop`
- PM ejecuta: `git pull origin feature/legal-tools && npm run test`
- PM verifica manualmente en Swagger 3 endpoints
- PM aprueba PR (no requiere cambios)
- PM mergea a `develop`

### RESTRICCIONES TÉCNICAS
- Guard: @Roles(Role.ADMINISTRADOR, Role.JEFATURA) — para análisis iniciales
- No modificar: schema.prisma, app.module.ts, otros módulos
- Sí importar: CaseAccessService, Prisma, Ollama client
- Manejo de errores: usar HttpException, PrismaClientKnownRequestError

### TIEMPO ESTIMADO
- Backend: 8 horas
```

---

### DELEGACIÓN #2: Psychological Tools Frontend

```markdown
## DELEGACIÓN #2: Psychological Tools UI — Dashboard Implementation

### TASK
Crear 2 páginas React para el módulo Psychological Tools:
1. /panel/indicadores-riesgo — Dashboard de indicadores por caso
2. /panel/escalas-psicologicas — Cálculo y visualización de escalas

### PRECONDITIONS
- [ ] Backend de Psychological Tools ya implementado y testeado
- [ ] `apps/web/` estructura lista
- [ ] useAuth hook disponible
- [ ] tailwind + shadcn/ui componentes disponibles
- [ ] fetchApi wrapper disponible

### DELIVERABLES
1. Rutas:
   - `apps/web/app/(dashboard)/panel/indicadores-riesgo/page.tsx`
   - `apps/web/app/(dashboard)/panel/escalas-psicologicas/page.tsx`

2. Componentes reutilizables:
   - TraumaIndicatorCard.tsx
   - RiskScaleChart.tsx
   - ClinicTranslationModal.tsx

3. Tests:
   - indicadores-riesgo.test.tsx (5+ tests)
   - escalas-psicologicas.test.tsx (5+ tests)

### VALIDATION CHECKLIST
- [ ] `npx tsc --noEmit --skipLibCheck` → 0 errores
- [ ] Rutas accesibles: http://localhost:3000/panel/indicadores-riesgo
- [ ] Guard por rol: solo PSICOLOGO + ADMINISTRADOR
- [ ] Datos cargan desde API: GET /psychological-tools/trauma-indicators/:caseId
- [ ] Loading state visible mientras se cargan datos
- [ ] Error state visible si API falla
- [ ] Responsivo: funciona en mobile (320px) y desktop (1920px)
- [ ] Lighthouse Performance > 80
- [ ] No hay console errors/warnings
- [ ] Accesibilidad: aria-labels, alt-text en gráficos

### EXIT CRITERIA
- Agente entrega PR
- PM verifica en navegador: carga datos y muestra gráficos
- PM valida que solo PSICOLOGO/ADMIN acceden
- PM aprueba PR

### TIEMPO ESTIMADO
- Frontend: 6 horas
```

---

### DELEGACIÓN #3: Social Tools QA Testing

```markdown
## DELEGACIÓN #3: Social Tools — Integration & E2E Testing

### TASK
Escribir tests de integración y E2E para Social Tools (3 endpoints).
Incluir: happy path, edge cases, error scenarios.

### PRECONDITIONS
- [ ] Backend Social Tools implementado
- [ ] Frontend Social Tools implementado
- [ ] DB con datos de prueba (seed.ts actualizado)
- [ ] Playwright o Cypress configurado

### DELIVERABLES
1. Integration tests (NestJS/Jest):
   - social-tools.e2e.spec.ts (10+ tests)
   - Covers: POST /social-tools/family-structure, etc.

2. E2E tests (Playwright):
   - social-tools.e2e.playwright.spec.ts (5+ tests)
   - Covers: navegación, carga de datos, submission

3. Performance tests:
   - social-tools.perf.spec.ts (3+ tests)
   - Mide: response time, DB query time

### VALIDATION CHECKLIST
- [ ] npm run test:e2e -- social-tools → 10+ PASS
- [ ] Cobertura >= 80% en social-tools/*
- [ ] Performance: API responde < 500ms
- [ ] DB queries optimizadas (no N+1 problems)
- [ ] Error handling validado (404, 403, 400 scenarios)

### EXIT CRITERIA
- Agente entrega: test files + report
- PM ejecuta: `npm run test:e2e`
- PM verifica: todos PASS
- PM valida: coverage report

### TIEMPO ESTIMADO
- Testing: 8 horas
```



---

## 🗺️ MATRIZ DE RIESGOS

### Riesgos Identificados por Módulo

| # | Riesgo | Módulo | Impacto | Probabilidad | Mitigation |
|---|--------|--------|---------|--------------|------------|
| R1 | Ollama local cae/no responde | Legal + Psych | 🔴 CRÍTICO | 🔴 ALTO | Endpoint `/ai-config/health` verificar antes de cada análisis |
| R2 | Schema Prisma incompleto | Todos | 🔴 CRÍTICO | 🟡 MEDIO | PM verifica migration antes de delegar |
| R3 | Falta acceso a DB de desarrollo | Backend | 🟠 ALTO | 🟡 MEDIO | Agente recibe credenciales en sesión 1:1 |
| R4 | Import circular en módulos | Todos | 🟠 ALTO | 🟡 MEDIO | Revisor checa dependencias antes de merge |
| R5 | API rate limit (Google Maps) | Social-Tools | 🟡 MEDIO | 🟢 BAJO | Usar mock en tests, caching en prod |
| R6 | Performance: queries N+1 | Transversal | 🟡 MEDIO | 🟡 MEDIO | Agente perfila con `EXPLAIN ANALYZE` |
| R7 | Inconsistencia de roles/permisos | Frontend | 🟡 MEDIO | 🟡 MEDIO | PM ejecuta role-based test suite |
| R8 | Datos sensibles en logs | Todos | 🟠 ALTO | 🟢 BAJO | Usar `sanitizeData()` en logger |

### Plan de Mitigación

**Daily Check-in** (15 min):
- Agente reporta blockeadores
- PM desbloquea en < 30 min
- Escalada a CTO si issue > 4 horas

**Code Review Checklist**:
- [ ] Sin código hardcodeado
- [ ] Sin datos sensibles en logs
- [ ] Permisos/acceso validados
- [ ] Tests incluidos (80%+ coverage)
- [ ] Performance validada
- [ ] Errores manejados

**Rollback Plan**:
- Si módulo X falla crítico: `git revert <commit>`
- Comunicar a team en Slack
- Hacer PR hotfix en rama `hotfix/`

---

## 💬 COMUNICACIÓN CON AGENTES

### Cómo Iniciar una Delegación

**Paso 1: Preparar Contexto** (15 min antes de delegar)
```
Agente, te delegamos: [TPV format con TASK/PRECONDITIONS/VALIDATION]

Archivos adjuntos:
- ARQUITECTURA-FINAL-COMPLETA.md (contexto del proyecto)
- agentes-ia/INSTRUCCIONES-AGENTES.md (guía técnica)
- [modulo].schema.prisma (extenso que usarás)
- existing-tests.spec.ts (como referencia)

Tu punto de partida:
- Branch: git checkout -b feature/[nombre]
- Working dir: apps/api (para backend)
- Ambiente: localhost:3000 (frontend), localhost:4000 (api)

Credenciales de prueba:
- Email: [rol]@defensoria.gob.bo
- Password: Password123!

¿Preguntas o bloqueadores antes de empezar?
```

**Paso 2: Monitoreo** (Cada 2 horas)
```
Hola [Agente], 
¿Cómo va? ¿Progreso en [tarea]?

Si hay issues:
- Describe brevemente
- Qué intentaste
- Dónde está bloqueado
- Qué necesitas de mi parte

Mantenme actualizado con status: [0%, 25%, 50%, 75%, 100%]
```

**Paso 3: Revisión** (Cuando reporta "100%")
```
Perfecto, veo tu PR. Iniciando revisión:

CHECKS:
- [ ] Compilación TypeScript
- [ ] Tests PASS
- [ ] Swagger actualizado
- [ ] Performance OK
- [ ] No datos sensibles

Te confirmo en 30 min.
```

**Paso 4: Merge** (Si todo OK)
```
✅ APROBADO. Mergeando a develop.

Próxima tarea: [DELEGACIÓN #X]
```

---

### Plantillas de Comunicación

#### Daily Standup Template

```
STANDUP: [Fecha] — [Agente Name]

COMPLETADO HOY:
- ✅ Item 1 (2 horas)
- ✅ Item 2 (1.5 horas)

PROGRESO: [XX]%

PRÓXIMAS 2 HORAS:
- [ ] Item A
- [ ] Item B

BLOCKEADORES:
- 🔴 [Si hay] Descripción + Impacto

SALUD GENERAL: 🟢 En track / 🟡 Preocupado / 🔴 Bloqueado
```

#### Issue Template

```
ISSUE: [Agente] en [Módulo]

DESCRIPCIÓN:
[Qué no funciona]

PASOS PARA REPRODUCIR:
1. ...
2. ...
3. Error: [mensaje exacto]

CONTEXTO:
- Branch: [nombre]
- Commit: [hash]
- Timestamp: [fecha hora]

IMPACTO:
- ¿Bloquea a otros agentes? [Sí/No]
- ¿Afecta deadline? [Sí/No]
- ¿Es crítico? [Sí/No]

INTENTOS PREVIOS:
- Intenté: [X]
- Resultado: [Y]
- Conclusión: [Z]
```

---

## 🔧 TROUBLESHOOTING

### Problemas Comunes y Soluciones

#### Problema #1: "TypeScript errors: Property not found"

**Síntoma**:
```
error TS2339: Property 'caseId' does not exist on type 'CaseDto'
```

**Causa probable**:
- Schema Prisma no actualizado
- Migration no ejecutada
- Caché de TS sin limpiar

**Solución**:
```bash
# 1. Limpiar caché
rm -rf apps/api/dist
rm -rf node_modules/.cache

# 2. Regenerar Prisma client
npx prisma generate

# 3. Ejecutar migrations pendientes
npx prisma migrate dev

# 4. Recompilar
npx tsc --noEmit

# 5. Si persiste: revisar schema.prisma actual
git diff packages/db/prisma/schema.prisma
```

---

#### Problema #2: "404 Not Found" en Swagger para nuevo endpoint

**Síntoma**:
```
POST /api/legal-tools/discrepancies no aparece en Swagger
```

**Causa probable**:
- Módulo no importado en `app.module.ts`
- Controlador tiene error de sintaxis
- @Controller() no tiene ruta

**Solución**:
```bash
# 1. Verificar módulo está importado
grep -n "LegalToolsModule" apps/api/src/app.module.ts

# 2. Si no está, agregar:
# import { LegalToolsModule } from './modules/legal-tools/legal-tools.module';
# E importar en @Module({ imports: [..., LegalToolsModule, ...] })

# 3. Compilar
npx tsc --noEmit

# 4. Reiniciar dev server
# Ctrl+C en terminal y volver a: npm run start:dev
```

---

#### Problema #3: "Prisma error: Foreign key constraint failed"

**Síntoma**:
```
PrismaClientKnownRequestError: The change you are trying to make would violate 
a foreign key constraint (`Case.id` references `LegalDiscrepancy.caseId`)
```

**Causa probable**:
- CaseId no existe en tabla `Case`
- Intenta crear LegalDiscrepancy con caseId inválido
- Relationships mal definidas en schema

**Solución**:
```bash
# 1. Verificar schema.prisma
cat packages/db/prisma/schema.prisma | grep -A 5 "model LegalDiscrepancy"

# 2. Las relaciones deben verse así:
# model LegalDiscrepancy {
#   id String @id @default(cuid())
#   caseId String
#   case Case @relation(fields: [caseId], references: [id])
#   ...
# }

# 3. Ejecutar test con caseId válido (de la tabla Case)
# SELECT id FROM "Case" LIMIT 1;
# Usar ese ID en test

# 4. Si persiste: verificar seed.ts crea casos de prueba
```

---

#### Problema #4: "npm test: 0 tests matched"

**Síntoma**:
```
FAIL src/modules/legal-tools/legal-tools.service.spec.ts
  0 tests matched
```

**Causa probable**:
- No hay función `describe()` en el archivo
- Archivo está vacío o tiene sintaxis inválida
- Jest no puede importar las dependencias

**Solución**:
```bash
# 1. Verificar archivo existe
ls -la apps/api/src/modules/legal-tools/legal-tools.service.spec.ts

# 2. Verificar tiene describe() y it()
grep "describe\|it(" apps/api/src/modules/legal-tools/legal-tools.service.spec.ts

# 3. Recompilar tests
npx tsc --noEmit

# 4. Ejecutar específico
npm run test -- --testPathPattern="legal-tools.service" --verbose

# 5. Mostrar stack trace completo si hay error
npm run test -- legal-tools.service.spec.ts --verbose 2>&1 | head -100
```

---

#### Problema #5: "CORS: No 'Access-Control-Allow-Origin' header"

**Síntoma**:
```
Access to XMLHttpRequest at 'http://localhost:4000/api/legal-tools/...' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Causa probable**:
- Backend NestJS no tiene CORS habilitado
- Servidor frontend y backend en puertos diferentes
- Configuración CORS falta en main.ts

**Solución**:
```bash
# 1. Verificar apps/api/src/main.ts tiene enableCors()
grep "enableCors" apps/api/src/main.ts

# 2. Si no está, agregar en main.ts:
# const app = await NestFactory.create(AppModule);
# app.enableCors({
#   origin: process.env.FRONTEND_URL || 'http://localhost:3000',
#   credentials: true,
# });

# 3. Reiniciar backend:
# Ctrl+C y: npm run start:dev

# 4. Verificar headers en respuesta:
# curl -i http://localhost:4000/api/legal-tools/...
```

---

#### Problema #6: "Performance: API responde en >5000ms"

**Síntoma**:
```
POST /legal-tools/typicality: 5234ms
```

**Causa probable**:
- Query sin índice (tabla grande)
- Falta eager loading (N+1 problem)
- Ollama responde lentamente

**Solución**:
```bash
# 1. Perfilar query
EXPLAIN ANALYZE SELECT * FROM "LegalTypicality" WHERE "caseId" = '...';

# 2. Asegurar índices:
npx prisma db push  # Aplica índices del schema

# 3. Usar Prisma select() para evitar N+1:
# ❌ MALO:
# const discrepancies = await prisma.case.findUnique({ where: { id: caseId } });
# for (const disc of discrepancies) { ... }  // Query dentro del loop

# ✅ BIEN:
# const caseWithDiscrepancies = await prisma.case.findUnique({
#   where: { id: caseId },
#   include: { legalDiscrepancies: true }  // 1 query, no N
# });

# 4. Cachear respuestas de Ollama si es determinístico
# @Cacheable()
# async analyzeCase() { ... }

# 5. Medir de nuevo:
npm run test:perf -- legal-tools
```

---

### Checklist de Debugging

```
┌─ ¿TypeScript compile?
│  └─ npx tsc --noEmit
│
├─ ¿Tests pasan?
│  └─ npm run test -- [spec file]
│
├─ ¿Swagger muestra endpoint?
│  └─ http://localhost:4000/api/docs
│
├─ ¿Endpoint responde (aunque sea error)?
│  └─ curl -X POST http://localhost:4000/api/[ruta]
│
├─ ¿Error es del código del agente o de las dependencias?
│  └─ Revisar stack trace
│
├─ ¿BD está actualizada?
│  └─ npx prisma migrate status
│
└─ ¿Si nada funciona?
   └─ git status (cambios no commiteados?)
   └─ git log --oneline (últimos commits OK?)
   └─ git diff (diferencias locales?)
```

---

## 📅 CALENDARIO DE DELEGACIONES FASE 2

### Semana 2 — Timeline de Delegación

```
LUNES (Día 1):
  08:00 - Kickoff con todos los agentes
  09:00 - Agente Backend-Legal: DELEGACIÓN #1 (Legal Tools backend)
  10:00 - Agente Backend-Psych: DELEGACIÓN #4 (Psych Tools backend)
  
MARTES (Día 2):
  10:00 - Agente Backend-Social: DELEGACIÓN #7 (Social Tools backend)
  14:00 - Checkpoint: Backend-Legal reporta 50% completado
  
MIÉRCOLES (Día 3):
  09:00 - Agente Frontend-Legal: DELEGACIÓN #2 (Legal Tools frontend)
  10:00 - Agente Backend-Transversal: DELEGACIÓN #10 (Transversal tools)
  15:00 - Checkpoint: Backend-Psych reporta 80% completado
  
JUEVES (Día 4):
  09:00 - Agente Frontend-Psych: DELEGACIÓN #5 (Psych Tools frontend)
  10:00 - Agente Frontend-Social: DELEGACIÓN #8 (Social Tools frontend)
  15:00 - Merges: Legal Tools + Psych Tools → develop
  
VIERNES (Día 5):
  09:00 - Agente QA: DELEGACIÓN #11 (Integration + E2E testing)
  14:00 - Checkpoint: Todos completados
  16:00 - Demo a stakeholders (si aplica)
```

---

## ✅ CHECKLIST DE CIERRE FASE 2

### Validación Final Antes de Entrega

**Backend**:
- [ ] 11 módulos compilados sin errores
- [ ] 12 endpoints funcionales en Swagger
- [ ] 11 tablas nuevas en DB con datos de prueba
- [ ] 60+ tests (>80% coverage) — todos PASS
- [ ] npm run lint → 0 warnings
- [ ] Performance: todos endpoints < 500ms
- [ ] Logs: auditoría completa (userId, caseId, timestamp)

**Frontend**:
- [ ] 8-10 nuevas páginas/componentes
- [ ] Guards de rol validados (solo usuarios autorizados)
- [ ] Sidebar actualizado con nuevas rutas
- [ ] 30+ componentes reutilizables
- [ ] npm run test → 40+ tests PASS
- [ ] Lighthouse: Performance > 80, Accessibility > 90
- [ ] Responsive: funciona en mobile + tablet + desktop

**QA/Testing**:
- [ ] 20+ integration tests (NestJS)
- [ ] 15+ E2E tests (Playwright)
- [ ] Performance baseline establecida
- [ ] Security audit: 0 vulnerabilidades críticas
- [ ] Regresión: tests de Fase 1 todavía PASS

**Documentación**:
- [ ] README actualizado (setup Fase 2)
- [ ] API docs en Swagger (todos endpoints documentados)
- [ ] Architecture docs actualizado
- [ ] Video de demo (2-3 min)

**Git**:
- [ ] PR para cada módulo (6 PRs totales)
- [ ] Commits atómicos
- [ ] Mensajes de commit claros
- [ ] Code reviews completados
- [ ] Todos los cambios mergeados a `develop`

**Deployment**:
- [ ] Branch `release/fase-2` creada
- [ ] Version bump: `package.json` actualizado (v1.1.0)
- [ ] Changelog escrito (qué es nuevo, qué cambió)
- [ ] Docker build: `docker build -t dna-api:v1.1.0 .` → SUCCESS
- [ ] Docker test: `docker run dna-api:v1.1.0` → START OK

---

## 📞 CONTACTO Y ESCALACIÓN

### Roles de Soporte

| Rol | Nombre | Responsabilidad | Escalación |
|-----|--------|-----------------|-----------|
| Product Manager | [Nombre] | Stakeholders, scope | CTO |
| Technical Lead | [Nombre] | Arquitectura, decisiones técnicas | PM |
| DevOps | [Nombre] | CI/CD, deployment, DB | Technical Lead |
| QA Lead | [Nombre] | Testing, performance, seguridad | Technical Lead |

### Canales de Comunicación

```
Escalación urgente (< 2 horas): Slack #phase-2 + @pm-on-duty
Escalación media (< 4 horas): Slack #phase-2 + issue en GitHub
Escalación baja (< 24 horas): GitHub issue + daily standup

Reuniones:
- Daily Standup: 09:00 (15 min)
- Mid-week Checkpoint: Miércoles 14:00 (30 min)
- Weekend Review: Viernes 16:00 (1 hora)
```

---

## 📚 REFERENCIAS

### Documentación Interna
- `ARQUITECTURA-FINAL-COMPLETA.md` — Diseño completo
- `agentes-ia/INSTRUCCIONES-AGENTES.md` — Guía técnica detallada
- `schema.prisma` — Modelo de datos
- `app.module.ts` — Módulos del proyecto

### Código de Referencia
- `apps/api/src/modules/inspections/` — Módulo completado (Fase 1)
- `apps/api/src/modules/questionnaires/` — Módulo completado (Fase 1)
- `apps/api/src/common/case-access/` — Validación de acceso
- `apps/web/components/layout/sidebar.tsx` — Ruteo UI

### Herramientas Externas
- Swagger: http://localhost:4000/api/docs
- Prisma Studio: `npx prisma studio`
- PostMan: collection disponible en repo
- Git: `git log --oneline`, `git diff`

---

**Versión**: 1.0  
**Última actualización**: 2026-08-01  
**Próxima revisión**: Post-Fase 2 (Lecciones aprendidas)  
**Autor**: Kiro Project Management Agent  
**Audiencia**: Project Managers, Tech Leads, Agentes IA Especializados


