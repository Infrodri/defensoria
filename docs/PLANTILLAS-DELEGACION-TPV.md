# PLANTILLAS DE DELEGACIÓN TPV — COPIAR Y PEGAR

**Propósito**: Plantillas listas para que PM delegue tareas a agentes IA especializados  
**Formato**: Task-Preconditions-Validation (TPV)  
**Instrucciones**: Reemplazar [VARIABLES] en los corchetes

---

## 🎯 PLANTILLA GENÉRICA TPV

```markdown
## DELEGACIÓN #[NUM]: [NOMBRE MÓDULO] — [ESPECIALIDAD]

### TASK (Qué debe entregar)
[2-3 líneas describiendo el qué, no el cómo]

Ejemplo:
Implementar 3 endpoints en el módulo Legal Tools que analicen 
automáticamente el expediente legal y detecten inconsistencias, 
validen tipificación de delitos y alerten sobre vencimientos procesales.

### PRECONDITIONS (Estado inicial)
- [ ] Rama Git creada: `git checkout -b feature/[nombre]`
- [ ] Schema Prisma actualizado con nuevas tablas
- [ ] Migration ejecutada: `npx prisma migrate dev`
- [ ] Documentación disponible: ARQUITECTURA-FINAL-COMPLETA.md, INSTRUCCIONES-AGENTES-v2.md
- [ ] Credenciales de prueba compartidas

### DELIVERABLES (Archivos a entregar)
```
apps/[ruta-exacta]/
├── [modulo].controller.ts
├── [modulo].service.ts
├── [modulo].module.ts
├── dto/
│   ├── [dto-1].dto.ts
│   └── [dto-2].dto.ts
└── [modulo].service.spec.ts (tests)
```

### VALIDATION (5-10 criterios de aceptación)
- [ ] Criterio 1: `npx tsc --noEmit` → 0 errores
- [ ] Criterio 2: Tests: `npm run test -- [spec].spec.ts` → [N] PASS
- [ ] Criterio 3: Swagger muestra [N] endpoints documentados
- [ ] Criterio 4: HTTP request válido → 200 OK con response esperado
- [ ] Criterio 5: HTTP request inválido → 4xx con mensaje claro
- [ ] Criterio 6: Sin datos hardcodeados (variables de entorno)
- [ ] Criterio 7: Logs incluyen userId, caseId, timestamp
- [ ] Criterio 8: Performance: respuesta < 500ms

### EXIT CRITERIA (Cómo sé que está LISTO)
Agente reporta "LISTO" + PM verifica:
1. PR creada contra `develop` branch
2. Todos los criterios VALIDATION checkados
3. Code review sin "Cambios Requeridos"
4. CI/CD pipeline PASS en GitHub
5. Merge a `develop` exitoso
```

---

## 🔴 DELEGACIÓN LEGAL TOOLS BACKEND (Copia directa)

```markdown
## DELEGACIÓN #1: Legal Tools Module — Backend Implementation

### TASK
Implementar el módulo Legal Tools backend con 3 endpoints REST 
que analicen automáticamente el expediente legal:
1. Detecta inconsistencias entre relatos
2. Valida tipificación legal del caso
3. Alerta sobre vencimientos procesales

Todos retornan JSON estructurado y se registran en auditoría.

### PRECONDITIONS
- [ ] Branch: `git checkout -b feature/legal-tools`
- [ ] Schema Prisma en `packages/db/prisma/schema.prisma`:
  ```prisma
  model LegalDiscrepancy {
    id String @id @default(cuid())
    caseId String
    case Case @relation(fields: [caseId], references: [id])
    fieldName String
    expectedValue String?
    actualValue String?
    severity String // "BAJO", "MEDIO", "ALTO"
    recommendation String?
    analyzedBy String // userId
    analyzedAt DateTime @default(now())
    @@index([caseId])
    @@index([analyzedAt])
  }
  
  model LegalTypicality {
    id String @id @default(cuid())
    caseId String
    case Case @relation(fields: [caseId], references: [id])
    tipicalidad String // "TIPICA", "PARCIAL", "ATIPICA"
    delitosDetectados String[] // array de códigos
    notasLegales String?
    confianza Float // 0.0 a 1.0
    analyzedBy String
    analyzedAt DateTime @default(now())
    @@index([caseId])
  }
  
  model ProcessDeadline {
    id String @id @default(cuid())
    caseId String
    case Case @relation(fields: [caseId], references: [id])
    deadline DateTime
    diasRestantes Int
    descripcion String
    accionRequerida String?
    responsable String?
    alertLevel String // "VERDE", "AMARILLO", "ROJO"
    createdAt DateTime @default(now())
    @@index([caseId])
    @@index([deadline])
  }
  ```
- [ ] Migration ejecutada: `npx prisma migrate dev`
- [ ] CaseAccessService disponible en `src/common/case-access/`
- [ ] Ollama local funcionando (http://localhost:11434)

### DELIVERABLES
```
apps/api/src/modules/legal-tools/
├── legal-tools.controller.ts
│   └── 3 endpoints: @Post('/discrepancies'), @Post('/typicality'), @Post('/deadlines')
├── legal-tools.service.ts
│   └── analyzeDiscrepancies(), validateTypicality(), checkDeadlines()
├── legal-tools.module.ts
│   └── Imports: PrismaModule, HttpModule (para Ollama)
├── dto/
│   ├── create-discrepancy.dto.ts
│   ├── create-typicality.dto.ts
│   └── create-deadline.dto.ts
└── legal-tools.service.spec.ts
    └── 15+ tests (mínimo)
```

### VALIDATION CHECKLIST
- [ ] Compilación: `npx tsc --noEmit` → 0 errores TypeScript
- [ ] Tests: `npm run test -- legal-tools.service.spec.ts` → 15+ PASS
- [ ] Linting: `npm run lint src/modules/legal-tools/` → 0 warnings
- [ ] Swagger: `http://localhost:4000/api/docs` muestra 3 endpoints
  - POST /legal-tools/discrepancies
  - POST /legal-tools/typicality
  - POST /legal-tools/deadlines
- [ ] Happy Path:
  ```bash
  curl -X POST http://localhost:4000/api/legal-tools/discrepancies \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"caseId": "case-uuid"}' \
    → Response 200 OK con array de discrepancias
  ```
- [ ] Error Handling:
  ```bash
  curl -X POST http://localhost:4000/api/legal-tools/discrepancies \
    -H "Authorization: Bearer $INVALID_TOKEN" \
    -d '{"caseId": "case-uuid"}' \
    → Response 401 Unauthorized
  ```
- [ ] Auditoría: Log muestra `{ userId, caseId, action, timestamp }`
- [ ] Performance: Response time < 500ms (incluyendo Ollama)
- [ ] Sin hardcoding: OLLAMA_URL y RAG_ENDPOINT vienen de .env

### EXIT CRITERIA
1. Agente escribe en chat: "DELEGACIÓN #1 LISTA - PR #XX"
2. PM navega a PR en GitHub
3. PM ejecuta: `git pull origin feature/legal-tools && npm run test`
4. PM verifica en Swagger: 3 endpoints presentes
5. PM hace manual test con curl
6. Si todo OK → PM aprueba PR
7. Si hay cambios → PM pide ajustes (max 3 iteraciones)
8. PM mergea a `develop` con mensaje: "Merge #1: Legal Tools Backend"

### COMUNICACIÓN
- Status inicial: PM envía esta plantilla a agente
- Check-in: Agente reporta cada 2 horas (%)
- Blockeadores: Agente escribe en Slack #phase-2 si está bloqueado > 30 min
- Entrega: Agente escribe "LISTO" + link a PR

### TIEMPO ESTIMADO
Bajo presión óptima: 6-8 horas
Bajo presión normal: 8-10 horas
```

---

## 🟠 DELEGACIÓN LEGAL TOOLS FRONTEND (Copia directa)

```markdown
## DELEGACIÓN #2: Legal Tools Module — Frontend UI

### TASK
Crear 2 nuevas páginas React para visualizar análisis legales:
1. `/panel/discrepancias-legales` → tabla filtrable de inconsistencias
2. `/panel/alertas-procesales` → cards de vencimientos próximos

Ambas consumen GET /api/legal-tools/[endpoint] y validan acceso por rol.

### PRECONDITIONS
- [ ] Backend Legal Tools ya implementado y testeado (DELEGACIÓN #1 DONE)
- [ ] Rutas base creadas en NextJS layout
- [ ] useAuth hook disponible
- [ ] tailwind + shadcn/ui configurados
- [ ] fetchApi() wrapper disponible

### DELIVERABLES
```
apps/web/
├── app/(dashboard)/panel/
│   ├── discrepancias-legales/
│   │   └── page.tsx (servidor o cliente)
│   └── alertas-procesales/
│       └── page.tsx
├── components/
│   ├── DiscrepancyTable.tsx (table con sorting, filtering)
│   ├── DiscrepancyCard.tsx (compact view)
│   ├── DeadlineCard.tsx (alert style)
│   ├── SeverityBadge.tsx (BAJO/MEDIO/ALTO colors)
│   └── LegalAlertHeader.tsx (metadata del caso)
└── __tests__/
    ├── discrepancias-legales.test.tsx (3+ tests)
    └── alertas-procesales.test.tsx (3+ tests)
```

### VALIDATION CHECKLIST
- [ ] TypeScript: `npx tsc --noEmit --skipLibCheck` → 0 errores
- [ ] Rutas accesibles:
  - http://localhost:3000/panel/discrepancias-legales ✅
  - http://localhost:3000/panel/alertas-procesales ✅
- [ ] Guard por rol: solo ABOGADO + ADMINISTRADOR pueden acceder
  ```typescript
  if (user?.role !== 'ABOGADO' && user?.role !== 'ADMINISTRADOR') {
    return <AccesoRestringido />;
  }
  ```
- [ ] Datos cargan desde API en useEffect
- [ ] Loading state visible mientras `isLoading === true`
- [ ] Error state visible si `error` es truthy
- [ ] Tabla ordena por columnas (caseId, severity, etc.)
- [ ] Filtro por severidad funciona
- [ ] Responsive:
  - Mobile (320px): stack vertical ✅
  - Tablet (768px): 2 columnas ✅
  - Desktop (1920px): full width ✅
- [ ] Performance:
  - Lighthouse Performance score > 80
  - First Contentful Paint < 2s
- [ ] Accesibilidad:
  - aria-labels en tabla
  - alt-text en iconos
  - focus visible en botones
- [ ] Tests: `npm run test -- legal-tools.test.tsx` → 6+ PASS

### EXIT CRITERIA
1. Agente escribe: "DELEGACIÓN #2 LISTA - PR #YY"
2. PM revisa PR en navegador (no solo código)
3. PM abre http://localhost:3000/panel/discrepancias-legales
4. PM verifica: datos cargan, tabla visible, filtros funcionan
5. PM valida guards: logout y navega a URL → redirige a login
6. PM valida Lighthouse score > 80
7. Si todo OK → aprobación
8. Merge a `develop`

### COMUNICACIÓN
- Agente puede pedir ayuda al Agente Backend-Legal si necesita aclaraciones de API
- Si Google Fonts no carga: usar fallback Tailwind fonts
- Si API cae: usar mock data del .spec.ts como fallback
```

---

## 🟡 DELEGACIÓN QA - INTEGRATION TESTS (Copia directa)

```markdown
## DELEGACIÓN #3: Legal + Psychological + Social Tools — Integration & E2E Testing

### TASK
Escribir 40+ tests de integración y E2E que verifiquen:
1. Happy path: datos correctos → respuesta esperada
2. Edge cases: datos vacíos, duplicados, límites
3. Error scenarios: 404, 403, 400, 500
4. Performance: respuesta < 500ms

Incluir tests para 6 módulos implementados (Legal, Psych, Social, Transversal).

### PRECONDITIONS
- [ ] Todos los módulos backend COMPLETADOS (DELEGACIONES #1, #4, #7, #10)
- [ ] DB con seed que crea casos de prueba
- [ ] Jest + Supertest configurados
- [ ] Playwright E2E configurado (apps/web)

### DELIVERABLES
```
Backend Integration Tests:
apps/api/src/modules/__tests__/
├── legal-tools.e2e.spec.ts (10 tests)
│   ├── POST /legal-tools/discrepancies: happy path
│   ├── POST /legal-tools/discrepancies: caseId no existe (404)
│   ├── POST /legal-tools/discrepancies: sin autorización (403)
│   ├── POST /legal-tools/typicality: happy path
│   ├── POST /legal-tools/typicality: datos vacíos (400)
│   ├── POST /legal-tools/deadlines: happy path
│   ├── POST /legal-tools/deadlines: performance < 500ms
│   ├── Performance baseline registrado
│   └── 3 más
├── psychological-tools.e2e.spec.ts (12 tests)
├── social-tools.e2e.spec.ts (10 tests)
└── transversal-tools.e2e.spec.ts (8 tests)

Frontend E2E Tests:
apps/web/e2e/
├── legal-tools.e2e.playwright.ts (5 tests)
│   ├── Navega a /panel/discrepancias-legales
│   ├── Verifica solo ABOGADO accede
│   ├── Tabla carga datos
│   ├── Filtro por severidad funciona
│   └── Sorting por columnas funciona
├── psychological-tools.e2e.playwright.ts (5 tests)
└── social-tools.e2e.playwright.ts (5 tests)

Performance Baseline:
apps/api/__tests__/
└── performance.baseline.spec.ts
    ├── Legal Tools discrepancies: < 300ms
    ├── Psychological Tools trauma: < 400ms
    ├── Social Tools family: < 250ms
    └── DB query time logged para tracking
```

### VALIDATION CHECKLIST
- [ ] Jest: `npm run test -- __tests__` → 40+ PASS
- [ ] Cobertura: `npm run test:cov -- __tests__` → >= 80%
- [ ] Playwright: `npx playwright test` → 15+ PASS
- [ ] No hay test.skip() (todos ejecutan)
- [ ] Logs de performance guardados
- [ ] Datos de prueba seeded correctamente
- [ ] Regressions: tests de Fase 1 todavía PASS
- [ ] Security: no hay secrets en logs

### EXIT CRITERIA
1. Agente reporta: "QA DELEGACIÓN #3 LISTA"
2. PM ejecuta: `npm run test:e2e`
3. PM verifica: 40+ PASS, coverage >= 80%
4. PM ejecuta: `npx playwright test`
5. PM verifica: 15+ PASS
6. PM valida: performance baseline dentro de tolerancia
7. Merge a `develop`

### PERFORMANCE BASELINE
Guardar en `docs/PERFORMANCE-BASELINE-FASE2.md`:
```
Legal Tools Discrepancies: XXXms (target: <300ms) ✅
Psychological Tools Trauma: XXXms (target: <400ms) ✅
Social Tools Family: XXXms (target: <250ms) ✅
```
```

---

## 📋 CHECKLIST: ANTES DE ENVIAR TPV A AGENTE

**El PM debe verificar ANTES de delegar**:

- [ ] Schema Prisma está finalizado (todas las tablas)
- [ ] Migration ejecutada: `npx prisma migrate dev`
- [ ] Rama Git creada: `feature/[nombre]`
- [ ] Documentación disponible:
  - ✅ ARQUITECTURA-FINAL-COMPLETA.md
  - ✅ INSTRUCCIONES-AGENTES-v2.md
  - ✅ schema.prisma
- [ ] Credenciales de prueba compartidas:
  - ✅ DB credentials
  - ✅ Usuarios de seed
  - ✅ URLs (localhost:3000, localhost:4000, localhost:11434)
- [ ] Preconditions están 100% completadas
- [ ] Validation criteria son medibles (no ambigüos)
- [ ] Exit criteria es claro (no subjetivo)
- [ ] TIEMPO ESTIMADO es realista (no < 4h, no > 12h)

**Si todo está OK**: Enviar TPV a agente ✅

---

## 🎯 QUICK REFERENCE: 11 DELEGACIONES FASE 2

| # | Agente | Módulo | Tipo | Tiempo | Est. Deadline |
|---|--------|--------|------|--------|---------------|
| 1 | Backend-Legal | Legal Tools | Backend | 8h | Mar 18:00 |
| 2 | Frontend-Legal | Legal Tools | Frontend | 5h | Jue 16:00 |
| 3 | Backend-Psych | Psych Tools | Backend | 10h | Jue 14:00 |
| 4 | Frontend-Psych | Psych Tools | Frontend | 5h | Vie 13:00 |
| 5 | Backend-Social | Social Tools | Backend | 8h | Jue 15:00 |
| 6 | Frontend-Social | Social Tools | Frontend | 5h | Vie 14:00 |
| 7 | Backend-Transversal | Transversal | Backend | 6h | Vie 10:00 |
| 8 | QA | Legal Tools | Testing | 8h | Vie 15:00 |
| 9 | QA | Psych Tools | Testing | 8h | Vie 15:00 |
| 10 | QA | Social Tools | Testing | 8h | Vie 15:00 |
| 11 | QA | Transversal | Testing | 6h | Vie 16:00 |

**Total Fase 2**: 77 horas de trabajo / 6 agentes = 12.8 horas por agente  
**Duración real**: 5 días (trabajo en paralelo)

---

**Generado por**: Kiro Project Management Agent  
**Última actualización**: 2026-08-01  
**Uso**: Copiar plantilla, reemplazar [VARIABLES], enviar a agente

