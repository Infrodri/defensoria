# ARQUITECTURA FINAL COMPLETA: Sistema Integral para Defensoria

**Versión**: 3.0  
**Fecha**: 1 Agosto 2026  
**Estado**: ✅ Diseño completado | 🔨 Implementación en progreso

---

## 🎯 VISIÓN GENERAL

Sistema completamente integrado que combina:
- **Captura de Datos**: Inspecciones, entrevistas, cuestionarios
- **Análisis Automatizado**: 11 módulos especializados por rol
- **Síntesis Integrada**: Timeline unificada + reportes anónimos
- **Seguridad**: Acceso basado en roles, auditoría completa

---

## 🏗️ CAPAS DE LA ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Tailwind)               │
│  ├─ Dashboard Abogado      ├─ Dashboard Psicólogo          │
│  ├─ Dashboard Social       ├─ Dashboard Jefatura           │
│  └─ Componentes Shared     └─ Módulos especializados       │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│                      API REST (NestJS)                     │
│ ├─ Inspections          ├─ Questionnaires                 │
│ ├─ Legal Tools (3)      ├─ Psychological Tools (3)        │
│ ├─ Social Tools (3)     ├─ Transversal Tools (2)          │
│ └─ Knowledge/Search     └─ Authentication/Authorization   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│               BUSINESS LOGIC & AI LAYER                    │
│ ├─ Ollama (LLM: qwen2.5:7b)                                │
│ ├─ Prompt Engineering (11 especialidades)                  │
│ ├─ Embeddings (nomic-embed-text)                           │
│ ├─ Whisper (Transcripción de audio)                        │
│ └─ RAG (Búsqueda de jurisprudencia)                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│               DATA LAYER (PostgreSQL + pgvector)           │
│ ├─ Cases (Expedientes)                                     │
│ ├─ Inspections & Evidence                                  │
│ ├─ Questionnaires & Responses                              │
│ ├─ Specialized Analyses (11 tablas)                        │
│ ├─ LegalDocuments & Embeddings                             │
│ ├─ Timeline & Audit Logs                                   │
│ └─ Users, Roles, Permissions                               │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│              STORAGE LAYER (MinIO + File System)           │
│ ├─ Fotos de inspecciones                                   │
│ ├─ Videos de entrevistas                                   │
│ ├─ Audios para transcripción                               │
│ ├─ Documentos adjuntos                                     │
│ └─ Reportes generados                                      │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────┴──────────────────────────────┐
│                 EXTERNAL INTEGRATIONS                      │
│ ├─ Google Maps (Geocoding)                                 │
│ ├─ Instituciones externas (API de justicia)                │
│ └─ Sistemas de Derecho Comparado                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 MATRIZ DE FUNCIONALIDADES

### FASE 1 (Semana 1 - ✅ COMPLETADA)

| Componente | Estado | Endpoints | Tablas |
|-----------|--------|-----------|--------|
| Inspecciones (+ GPS) | ✅ | 7 | 4 |
| Cuestionarios | ✅ | 8 | 4 |
| Transcripción (setup) | ✅ | - | 1 |
| Búsqueda (setup) | ✅ | - | - |
| **SUBTOTAL** | **✅** | **15** | **9** |

### FASE 2 (Semana 2 - 🔨 SIGUIENTE)

| Componente | Complejidad | Endpoints | Tablas |
|-----------|------------|-----------|--------|
| Legal Tools (3) | 🟠 Alta | 3 | 3 |
| Psychological Tools (3) | 🟠 Alta | 4 | 3 |
| Social Tools (3) | 🟡 Media | 3 | 3 |
| Transversal Tools (2) | 🟡 Media | 2 | 2 |
| **SUBTOTAL** | - | **12** | **11** |

### FASE 3 (Semana 3)

| Componente | Scope |
|-----------|-------|
| Frontend UI | Componentes React para todos los módulos |
| Dashboards | 5 dashboards especializados por rol |
| Visualizaciones | Timelines, genogramas, gráficos de riesgo |

### FASE 4 (Semana 4)

| Componente | Scope |
|-----------|-------|
| Testing E2E | Flujos completos automatizados |
| Fine-tuning IA | Prompts optimizados basados en feedback |
| Documentación | Guías de usuario y administrador |

---

## 📈 TOTALES DEL PROYECTO

```
ENDPOINTS:
  ├─ Fase 1: 15
  ├─ Fase 2: 12
  └─ TOTAL: 27 nuevos endpoints

TABLAS EN DB:
  ├─ Fase 1: 9 (Inspections + Questionnaires)
  ├─ Fase 2: 11 (Análisis especializados)
  └─ TOTAL: 20 nuevas tablas

MÓDULOS BACKEND:
  ├─ Inspections (extendido)
  ├─ Questionnaires (nuevo)
  ├─ LegalTools (nuevo)
  ├─ PsychologicalTools (nuevo)
  ├─ SocialTools (nuevo)
  └─ TransversalTools (nuevo) = 6 módulos

LÍNEAS DE CÓDIGO:
  ├─ Backend: 5,000+ líneas
  ├─ Frontend: 3,000+ líneas (estimado)
  └─ TOTAL: 8,000+ líneas

DOCUMENTACIÓN:
  ├─ Arquitectura: 50 páginas
  ├─ Planes: 40 páginas
  ├─ Instrucciones: 30 páginas
  └─ TOTAL: 120+ páginas
```

---

## 🔐 SEGURIDAD & ACCESO

### 5 Reglas de CaseAccessService

```
RULE A: ADMINISTRADOR
  └─ Acceso total a todos los casos

RULE B: JEFATURA | SECRETARIA
  └─ Acceso solo a casos de su oficina

RULE C: ABOGADO | PSICOLOGO | SOCIAL
  └─ Acceso solo a casos donde son miembros ACTIVOS del equipo

RULE D: PORTAL (Tutor de NNA)
  └─ Acceso limitado usando accessPinHash

RULE E: Deny by default
  └─ Rechazar cualquier otro acceso
```

### Auditoría Completa

Cada acción registra:
- `createdBy` / `uploadedBy` / `analyzedBy`
- `createdAt` / `completedAt` / `analyzedAt`
- `purpose` / `context` / `result`

---

## 🎯 FLUJO DE USUARIO COMPLETO

```
INSPECTOR llega a inspección sorpresa:
  1. Abre app, busca case por código
  2. Crea inspección, agrega GPS
  3. Toma fotos (múltiples)
  4. Toma video OPCIONAL de entrevista
  5. Completa cuestionario de riesgo
  6. Registra hallazgos estructurados
  7. Marca como completada
  
SISTEMA automáticamente:
  8. Analiza cuestionario → identifica riesgos
  9. Notifica a jefatura si riesgos ALTOS
  10. Prepara transcripción para procesamiento

ABOGADO accede al expediente:
  11. Ve discrepancias con denuncias previas
  12. Identifica delitos potenciales
  13. Recibe alertas de vencimientos procesales
  14. Redacta demanda con asistencia IA

PSICÓLOGO accede al expediente:
  15. Ve indicadores de trauma detectados
  16. Valida y complete escalas pre-llenadas
  17. Genera traducción clínico-jurídica
  18. Emite informe psicológico

TRABAJADOR SOCIAL accede:
  19. Ve genograma generado
  20. Valida vulnerabilidad socioeconómica
  21. Obtiene programas de asistencia sugeridos
  22. Identifica factores ambientales de riesgo
  23. Emite informe social

JEFATURA ve:
  24. Timeline unificada (legal + psico + social)
  25. Dashboard con alertas consolidadas
  26. Reporte para juzgado ANONIMIZADO
  27. Toma decisiones basadas en datos

RESULTADO: Expediente 100% analizado desde 3 perspectivas
```

---

## 💾 MODELO DE DATOS CONSOLIDADO

### Entidades Principales

```
┌─────────────────────────────────────────────────┐
│                    CASE (Expediente)            │
├─────────────────────────────────────────────────┤
│ id, caseCode, caseType, currentPhase, riskLevel│
│ intakeNarrative, isClosed, closedAt, closedBy  │
│ currentOfficeId, createdAt, createdBy          │
└──────────────────────┬──────────────────────────┘
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
  │ INSPECTIONS  │ │QUESTIONNAIRES│ │  REPORTS     │
  │ + Location   │ │ + Responses  │ │  + Analyses  │
  │ + Evidence   │ │ + Analysis   │ │              │
  │ + Findings   │ └──────────────┘ └──────────────┘
  └──────────────┘
        ▼
  ┌──────────────────────────────┐
  │ SPECIALIZED ANALYSES (11)    │
  ├──────────────────────────────┤
  │ ├─ Discrepancies (Legal)     │
  │ ├─ Typicality (Legal)        │
  │ ├─ Deadlines (Legal)         │
  │ ├─ Trauma (Psych)            │
  │ ├─ Scales (Psych)            │
  │ ├─ Family (Social)           │
  │ ├─ Vulnerability (Social)    │
  │ ├─ Environment (Social)      │
  │ ├─ UnifiedTimeline (Trans)   │
  │ └─ Anonimized (Trans)        │
  └──────────────────────────────┘
```

### Relaciones Clave

```
User (1) ──┬─ (N) CaseTeamHistory
           ├─ (N) Inspection
           ├─ (N) Report
           └─ (N) Analysis

Case (1) ──┬─ (N) Inspection
           ├─ (N) QuestionnaireResponse
           ├─ (N) Report
           ├─ (N) Evidence
           ├─ (N) Transcription
           └─ (N) SpecializedAnalysis

Inspection (1) ──┬─ (1) Location
                 ├─ (N) EvidenceFile
                 └─ (N) Finding

Transcription (1) ──┬─ (1) Evidence
                    └─ (N) Analysis
```

---

## 🚀 STACK TECNOLÓGICO FINAL

```
FRONTEND:
  ├─ React 18 + TypeScript
  ├─ Tailwind CSS v4 + shadcn/ui
  ├─ React Query / TanStack Query
  ├─ Zustand (state management)
  └─ Vite (bundler)

BACKEND:
  ├─ NestJS 10 (framework)
  ├─ TypeScript 5
  ├─ Prisma (ORM)
  ├─ Passport.js (auth)
  ├─ Swagger (API docs)
  └─ Jest (testing)

DATABASE:
  ├─ PostgreSQL 15+
  ├─ pgvector (embeddings)
  ├─ Full-text search (GIN indices)
  └─ Row-level security (optional)

AI/ML:
  ├─ Ollama (LLM local)
  │  ├─ qwen2.5:7b (LLM principal)
  │  ├─ nomic-embed-text (embeddings)
  │  └─ Whisper (transcripción)
  ├─ RAG (Retrieval-Augmented Generation)
  └─ Prompt Engineering (11 especialidades)

STORAGE:
  ├─ MinIO (S3-compatible)
  ├─ File system (backup)
  └─ Encryption at rest (AES-256)

DEPLOYMENT:
  ├─ Docker (containerización)
  ├─ Docker Compose (orquestación local)
  ├─ Kubernetes (producción, optional)
  └─ CI/CD (GitHub Actions)

MONITORING:
  ├─ Logs (Winston)
  ├─ Error tracking (Sentry, optional)
  ├─ Performance monitoring
  └─ Audit logs (completos)
```

---

## 📋 DEPENDENCIAS ENTRE MÓDULOS

```
Nivel 0 (Independientes):
  ├─ Inspections (captura)
  ├─ Questionnaires (captura)
  └─ Transcription (captura)

Nivel 1 (Dependen de captura):
  ├─ LegalTools (Lee: Transcriptions, ActionLogs)
  ├─ PsychologicalTools (Lee: Transcriptions)
  └─ SocialTools (Lee: Transcriptions)

Nivel 2 (Dependen de análisis):
  ├─ UnifiedTimeline (Lee: Todos los análisis)
  └─ Anonimizer (Lee: Reports + Analyses)

Nivel 3 (Frontend):
  ├─ Dashboards (Leen: Todos los análisis)
  └─ Reports (Generan: PDF/Excel)
```

---

## 🎓 GUÍA DE CONTRIBUCIÓN

### Agregar nuevo módulo especializado

```
1. Crear DTOs en src/modules/new-module/dto/
2. Crear servicio en src/modules/new-module/new-module.service.ts
3. Crear controlador en src/modules/new-module/new-module.controller.ts
4. Crear módulo en src/modules/new-module/new-module.module.ts
5. Importar en app.module.ts
6. Crear migración Prisma para nuevas tablas
7. Escribir tests (unit + integration)
8. Documentar en Swagger
9. Agregar a tabla de endpointsArchitecture.md
10. Hacer PR con descripción clara
```

---

## 📞 PUNTOS DE CONTACTO CLAVE

```
AUTENTICACIÓN:
  POST /auth/login → JWT token
  GET /auth/me → Perfil usuario

ACCESO A CASOS:
  GET /cases/:id → Valida con CaseAccessService

EJECUCIÓN DE ANÁLISIS:
  POST /legal-tools/* → Valida rol ABOGADO
  POST /psychological-tools/* → Valida rol PSICOLOGO
  POST /social-tools/* → Valida rol SOCIAL

GENERACIÓN DE REPORTES:
  POST /reports/anonymize → Valida rol JEFATURA

WEBHOOKS/EVENTS (Futuro):
  ON_INSPECTION_COMPLETED → Trigger análisis
  ON_QUESTIONNAIRE_SUBMITTED → Trigger análisis de riesgos
  ON_ANALYSIS_COMPLETE → Notify team
```

---

## 📊 MÉTRICAS DE PROYECTO

```
Duración total: 4 semanas
Equipo: 2-3 desarrolladores
Líneas de código: 8,000+
Tablas DB: 20 nuevas
Endpoints: 27 nuevos
Módulos backend: 6 nuevos
Documentación: 120+ páginas
Commits esperados: 20+
Tests esperados: 100+
```

---

## 🏁 CRITERIOS DE ÉXITO

```
FUNCIONAL:
  ✅ Todos 27 endpoints funcionan correctamente
  ✅ Todas 20 tablas pobladas y relacionadas
  ✅ Análisis automáticos ejecutándose sin errores

PERFORMANCE:
  ✅ Respuesta API < 500ms
  ✅ Análisis IA < 5s (Ollama local)
  ✅ Dashboard carga < 2s

SEGURIDAD:
  ✅ 0 vulnerabilidades críticas
  ✅ Acceso a datos valida 5 reglas
  ✅ Auditoría completa de todas acciones

CALIDAD:
  ✅ 80%+ cobertura de tests
  ✅ 0 datos hardcodeados
  ✅ Documentación 100% sincronizada con código

USABILIDAD:
  ✅ 80% usuarios adopta en semana 1
  ✅ NPS > 70
  ✅ < 5 bugs críticos en producción
```

---

**VERSIÓN**: 3.0  
**ESTADO**: Diseño completado ✅ + Fase 1 implementada ✅  
**PRÓXIMO**: Ejecutar Fase 2 (11 módulos especializados)  
**CONTACTO**: Kiro Agente Senior  
**ÚLTIMA ACTUALIZACIÓN**: 1 Agosto 2026
