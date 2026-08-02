# INSTRUCTIVA PARA AGENTES IA — FASE 2 PROYECTO DEFENSORIA

**Emitida por**: Project Manager  
**Fecha**: 1 Agosto 2026  
**Período**: Semana 2 (5 días laborales)  
**Scope**: Implementación de 11 módulos especializados  
**Estado**: DELEGACIÓN INMEDIATA

---

## 📋 RESUMEN EJECUTIVO PARA AGENTES

Ustedes van a implementar **11 módulos especializados** que permiten análisis automático de expedientes desde 3 disciplinas (legal, psicológico, social).

**Lo que necesitan saber**:
- Fase 1 YA COMPLETADA (Inspections + Questionnaires funcionando)
- Ustedes implementan Fase 2 (análisis especializados)
- TODO el contexto está en `docs/ARQUITECTURA-FINAL-COMPLETA.md`
- Trabajarán en PARALELO (6 agentes, cada uno independiente)
- Deadline: Viernes 15:00 UTC (código mergeado a `develop`)

---

## 👥 MATRIZ DE ASIGNACIÓN

```
AGENTE BACKEND-LEGAL (8 horas)
  ├─ Módulo: Legal Tools
  ├─ Tareas: 3 endpoints jurídicos
  └─ Prioridad: 🔴 CRÍTICA (bloquea otros)

AGENTE BACKEND-PSYCH (10 horas)
  ├─ Módulo: Psychological Tools
  ├─ Tareas: 4 endpoints psicológicos
  └─ Prioridad: 🔴 CRÍTICA

AGENTE BACKEND-SOCIAL (8 horas)
  ├─ Módulo: Social Tools
  ├─ Tareas: 3 endpoints sociales
  └─ Prioridad: 🟠 MEDIA-ALTA

AGENTE BACKEND-TRANSVERSAL (6 horas)
  ├─ Módulo: Transversal Tools
  ├─ Tareas: 2 endpoints (Timeline + Anonimizador)
  └─ Prioridad: 🟠 MEDIA (depende de otros 3)

AGENTE FRONTEND (12 horas combinadas)
  ├─ Frontend-Legal: 4 horas (2 páginas)
  ├─ Frontend-Psych: 4 horas (2 páginas)
  └─ Frontend-Social: 4 horas (2 páginas)

AGENTE QA (8 horas)
  ├─ Integration tests: 40+ tests E2E
  └─ Validación completa de flujos
```

**TOTAL**: 52 horas backend + 12 horas frontend + 8 horas QA = 72 horas  
**EN PARALELO**: 5 días efectivos

---

## 📚 CONTEXTO COMPARTIDO

### Repositorio
```
https://github.com/[org]/defensoria
Branch base: develop (actualizado con Fase 1)
Rama de trabajo: feature/fase2-[nombre-modulo]
```

### Documentación Principal (DEBEN LEER)
1. `docs/ARQUITECTURA-FINAL-COMPLETA.md` ← Qué construimos
2. `docs/MODULOS-ESPECIALIZADOS-POR-DISCIPLINA.md` ← Cada módulo detallado
3. `docs/PLAN-AMPLIADO-MODULOS-ESPECIALIZADOS.md` ← Plan, estimaciones, prompts
4. `docs/agentes-ia/INSTRUCCIONES-AGENTES.md` ← Cómo deben trabajar

### Schema Prisma (ACTUALIZADO)
```
Archivo: packages/db/prisma/schema.prisma
Nuevos enums: ✅ Agregados
Nuevos modelos: ✅ Listos (11 tablas)
Migraciones: ✅ Ejecutar: npx prisma migrate dev
```

### API Base URL (para testing)
```
URL: http://localhost:3000/api
Auth: Bearer [JWT_TOKEN]
Swagger: http://localhost:3000/api-docs
```

---

## 🎯 DELEGACIÓN #1: BACKEND-LEGAL TOOLS

### TASK (Qué entregar)

Implementar 3 endpoints REST que analicen automáticamente expedientes legales:
1. Detector de Discrepancias (compara testimonios vs denuncias previas)
2. Analizador de Tipicidad Penal (identifica delitos potenciales)
3. Semáforo de Plazos Procesales (calcula vencimientos automáticamente)

### PRECONDITIONS (Estado inicial - Validar antes de comenzar)

```bash
# 1. Rama git creada
git checkout -b feature/legal-tools

# 2. Prisma actualizado
cd packages/db
npx prisma migrate dev  # Debe crear 3 tablas: DiscrepancyAnalysis, PenalTypicityAnalysis, ProcessualDeadline

# 3. Dependencias instaladas
npm install  # (Ya hecho en Fase 1)

# 4. Backend compilando
cd apps/api
npx tsc --noEmit  # Debe pasar sin errores

# 5. Tests corriendo
npm run test  # Jest funcionando
```

### DELIVERABLES (Archivos exactos a entregar)

```
apps/api/src/modules/legal-tools/
├── legal-tools.module.ts
│   └─ Importar: PrismaService, CaseAccessService
│
├── legal-tools.controller.ts
│   ├─ Endpoint 1: POST /legal-tools/discrepancies/analyze
│   ├─ Endpoint 2: POST /legal-tools/typicality/analyze
│   ├─ Endpoint 3: POST /legal-tools/deadlines/calculate
│   └─ Todos con @UseGuards(JwtAuthGuard, RolesGuard) + @Roles(ABOGADO)
│
├── legal-tools.service.ts
│   ├─ Método: async analyzeDiscrepancies(dto, userId)
│   ├─ Método: async analyzeTypicality(dto, userId)
│   ├─ Método: async calculateDeadlines(dto, userId)
│   └─ IMPORTANTE: Validar acceso con CaseAccessService.assertUserHasAccess()
│
├── dto/
│   ├── analyze-discrepancies.dto.ts
│   │   ├─ transcriptionId: string (uuid)
│   │   ├─ caseId: string (uuid)
│   │   └─ comparableDocuments?: string[] (uuid array)
│   │
│   ├── analyze-typicality.dto.ts
│   │   ├─ transcriptionId: string (uuid)
│   │   └─ caseTypeCode: string
│   │
│   └── calculate-deadline.dto.ts
│       ├─ caseId: string (uuid)
│       ├─ eventDate: string (ISO date)
│       └─ eventType: enum ["MEDIDAS_PROTECCION", "AUDIENCIA", "DENUNCIA"]
│
└── legal-tools.service.spec.ts
    ├─ Test: "should analyze discrepancies successfully" ✓
    ├─ Test: "should throw on invalid caseId" ✓
    ├─ Test: "should calculate deadlines with correct date" ✓
    ├─ Test: "should validate user access before analysis" ✓
    └─ Mínimo: 12 tests, >80% coverage
```

### VALIDATION (Criterios de aceptación - TODO debe cumplirse)

Backend-Legal será considerado LISTO cuando:

```
COMPILACIÓN:
  ☐ npx tsc --noEmit → 0 errores de TypeScript
  ☐ npm run build → Build exitoso sin warnings
  ☐ No hay `any` types (excepto permitidos)

TESTS:
  ☐ npm run test -- legal-tools.service.spec.ts → 12+ PASS
  ☐ Coverage >80%
  ☐ Todos los tests son independientes (no dependen de orden)

API REST:
  ☐ POST /legal-tools/discrepancies/analyze devuelve 200 + JSON correcto
  ☐ POST /legal-tools/typicality/analyze devuelve 200 + JSON correcto
  ☐ POST /legal-tools/deadlines/calculate devuelve 200 + JSON correcto
  
SEGURIDAD:
  ☐ Sin token JWT → 401 Unauthorized
  ☐ Usuario sin rol ABOGADO → 403 Forbidden
  ☐ CaseAccessService valida acceso al caso
  ☐ userId, caseId registrados en logs

DATOS:
  ☐ Sin hardcoding (todo desde variables/DTOs)
  ☐ Las 3 tablas pobladas correctamente
  ☐ Relaciones Foreign Key válidas
  ☐ Timestamps correctos (createdAt, analyzedAt)

DOCUMENTACIÓN:
  ☐ Swagger @ApiOperation() en cada endpoint
  ☐ DTOs documentados con @ApiProperty()
  ☐ README.md con ejemplo de uso
  ☐ Comentarios en código para lógica compleja

PERFORMANCE:
  ☐ Respuesta < 500ms (sin Ollama, solo DB)
  ☐ Queries optimizadas (no N+1)
  ☐ Índices creados donde corresponde

PR (Pull Request):
  ☐ Nombre: "feat(legal-tools): implement discrepancies, typicality, deadlines"
  ☐ Description: Línea de cada endpoint + criterios cumplidos
  ☐ Código compilable: npx tsc --noEmit ✅
  ☐ Tests pasando: npm run test ✅
```

---

## 🎯 DELEGACIÓN #2: BACKEND-PSYCH TOOLS

### TASK

Implementar 4 endpoints REST para análisis psicológico:
1. Extractor de Indicadores de Trauma (detecta TEPT automáticamente)
2. Llenador de Escalas de Riesgo (pre-llena tests estandarizados)
3. Traductor Clínico-Jurídico (convierte diagnóstico a lenguaje forense)
4. Endpoint de resumen clínico

### PRECONDITIONS

```bash
git checkout -b feature/psychological-tools
cd packages/db && npx prisma migrate dev  # Crear 3 tablas: TraumaIndicatorAnalysis, RiskScaleAnalysis, (Translation no tiene tabla)
cd apps/api && npx tsc --noEmit && npm run test
```

### DELIVERABLES

```
apps/api/src/modules/psychological-tools/
├── psychological-tools.module.ts
├── psychological-tools.controller.ts
│   ├─ POST /psychological-tools/trauma/analyze
│   ├─ POST /psychological-tools/scales/pre-fill
│   ├─ POST /psychological-tools/translate/clinical-to-forensic
│   └─ GET /psychological-tools/summary/:caseId
│
├── psychological-tools.service.ts
│   ├─ async analyzeTrauma(dto, userId)
│   ├─ async prefillScale(dto, userId)
│   ├─ async translateClinicalToForensic(dto, userId)
│   └─ async getSummary(caseId, userId)
│
├── dto/
│   ├── analyze-trauma.dto.ts
│   ├── prefill-scale.dto.ts (scaleType: enum)
│   ├── translate-clinical.dto.ts
│   └── clinical-summary.dto.ts
│
└── psychological-tools.service.spec.ts (15+ tests)
```

### VALIDATION

```
☐ 4 endpoints documentados en Swagger
☐ npm run test -- psychological-tools.service.spec.ts → 15+ PASS
☐ Coverage >80%
☐ Roles validados: @Roles(PSICOLOGO, ADMINISTRADOR)
☐ CaseAccessService verificado
☐ Sin hardcoding (scaleTypes desde DB)
☐ Respuesta < 500ms
☐ Datos sensibles no loguados
```

---

## 🎯 DELEGACIÓN #3: BACKEND-SOCIAL TOOLS

### TASK

Implementar 3 endpoints REST para análisis social:
1. Generador de Familiogramas (extrae estructura familiar)
2. Calculador de Vulnerabilidad Socioeconómica (índice multifactor)
3. Mapeador de Factores de Riesgo Ambiental

### PRECONDITIONS

```bash
git checkout -b feature/social-tools
cd packages/db && npx prisma migrate dev  # 3 tablas: FamilyStructureAnalysis, SocioeconomicVulnerability, EnvironmentalRiskMapping
cd apps/api && npx tsc --noEmit
```

### DELIVERABLES

```
apps/api/src/modules/social-tools/
├── social-tools.module.ts
├── social-tools.controller.ts
│   ├─ POST /social-tools/family/analyze
│   ├─ POST /social-tools/vulnerability/calculate
│   └─ POST /social-tools/environment/map
│
├── social-tools.service.ts
│   ├─ async analyzeFamily(dto, userId)
│   ├─ async calculateVulnerability(dto, userId)
│   └─ async mapEnvironment(dto, userId)
│
├── dto/ (3 DTOs)
└── social-tools.service.spec.ts (12+ tests)
```

### VALIDATION

```
☐ 3 endpoints con documentación Swagger
☐ npm run test → 12+ PASS
☐ @Roles(SOCIAL, ADMINISTRADOR)
☐ Datos vulnerabilidad: housing + income + familyLoad + access
☐ Sin hardcoding de programas (desde DB)
☐ < 500ms respuesta
```

---

## 🎯 DELEGACIÓN #4: BACKEND-TRANSVERSAL TOOLS

### TASK

Implementar 2 endpoints transversales:
1. Timeline Interdisciplinaria Unificada (consolida eventos de 3 áreas)
2. Anonimizador de Reportes (genera reportes seguros para compartir)

**NOTA IMPORTANTE**: Depende de que los otros 3 agentes backend completen sus módulos.

### PRECONDITIONS

```bash
# Esperar a que Backend-Legal, Backend-Psych, Backend-Social finalicen
git checkout -b feature/transversal-tools
cd packages/db && npx prisma migrate dev  # 2 tablas: UnifiedTimeline, AnonimizedReport
```

### DELIVERABLES

```
apps/api/src/modules/transversal-tools/
├── transversal-tools.module.ts
├── transversal-tools.controller.ts
│   ├─ GET /timeline/unified/:caseId
│   └─ POST /reports/anonymize
│
├── transversal-tools.service.ts
│   ├─ async getUnifiedTimeline(caseId, userId)
│   └─ async anonymizeReport(reportId, userId, rules)
│
├── dto/
│   ├── unified-timeline-query.dto.ts
│   └── anonymize-report.dto.ts
│
└── transversal-tools.service.spec.ts (10+ tests)
```

### VALIDATION

```
☐ GET /timeline/unified/:caseId → 200 con eventos consolidados
☐ POST /reports/anonymize → 200 con reporte anonimizado
☐ Anonimización reversible (solo admins)
☐ Tokens de anonimización encriptados
☐ npm run test → 10+ PASS
```

---

## 🎯 DELEGACIÓN #5-7: FRONTEND TOOLS

### TASK (Para 3 agentes frontend trabajando en paralelo)

Crear componentes React para visualizar análisis de cada disciplina.

### Frontend-Legal (4 horas)

```
apps/web/app/(dashboard)/legal-analysis/
├── page.tsx (página principal)
├── components/
│   ├─ DiscrepanciesViewer.tsx (tabla comparativa)
│   ├─ TypicalityAnalyzer.tsx (delitos sugeridos)
│   └─ DeadlinesSemaphore.tsx (visual ROJO/AMARILLO/VERDE)
└─ hooks/ (custom hooks)
```

### Frontend-Psych (4 horas)

```
apps/web/app/(dashboard)/psychological-analysis/
├── page.tsx
├── components/
│   ├─ TraumaIndicators.tsx (indicadores detectados)
│   ├─ ScalesPreview.tsx (escalas pre-llenadas)
│   └─ ClinicalForensicTranslation.tsx
```

### Frontend-Social (4 horas)

```
apps/web/app/(dashboard)/social-analysis/
├── page.tsx
├── components/
│   ├─ Genogram.tsx (visualización familiar)
│   ├─ VulnerabilityIndex.tsx (gráfico multifactor)
│   └─ EnvironmentalRisks.tsx (factores detectados)
```

### VALIDATION (Frontend)

```
☐ Componentes compilando sin errores
☐ No hay TypeScript errors
☐ Responsive (mobile + desktop)
☐ Accesibilidad: aria-labels, semantic HTML
☐ Datos vienen de API (no hardcoded)
☐ Loading states + error handling
☐ Tests: Vitest o Jest >60% coverage
```

---

## 🎯 DELEGACIÓN #8: QA INTEGRATION TESTS

### TASK

Escribir 40+ integration tests E2E que validen flujos completos:

### DELIVERABLES

```
apps/api/test/e2e/
├── legal-tools.e2e-spec.ts (10 tests)
├── psychological-tools.e2e-spec.ts (10 tests)
├── social-tools.e2e-spec.ts (10 tests)
├── transversal-tools.e2e-spec.ts (8 tests)
└── integration.e2e-spec.ts (2 tests: flujo completo case)
```

### Ejemplo de test

```typescript
describe('Legal Tools E2E', () => {
  it('should analyze discrepancies from transcription', async () => {
    // 1. Setup: crear case, transcription
    // 2. Call: POST /legal-tools/discrepancies/analyze
    // 3. Assert: response.discrepancies.length > 0
  });

  it('should fail without JWT token', async () => {
    // 1. Call sin auth
    // 2. Assert: 401 Unauthorized
  });
  
  it('should respect CaseAccessService rules', async () => {
    // 1. User ABOGADO accede a case de otra oficina
    // 2. Assert: 403 Forbidden
  });
});
```

### VALIDATION (QA)

```
☐ npm run test:e2e → Todos los tests PASS
☐ 40+ tests mínimo
☐ >70% coverage de happy path + error cases
☐ Database limpia antes/después de cada test
☐ No hay flaky tests (no dependen de timing)
☐ Documentación de qué prueba cada test
```

---

## 🚀 TIMELINE SEMANA 2

### LUNES (Día 1) - 08:00 UTC

```
Kick-off (30 min):
  ✓ Todos leen ARQUITECTURA-FINAL-COMPLETA.md
  ✓ Preguntas de clarificación

Backend-Legal comienza:
  ✓ Crear rama feature/legal-tools
  ✓ Ejecutar migraciones
  ✓ Esqueleto de módulo listo

Frontend, QA están en espera (sin bloqueo).
```

### MARTES (Día 2) - 15:00 UTC

```
Hito de Backend-Legal:
  ✓ 3 endpoints implementados
  ✓ Tests corriendo
  ✓ PR abierto para revisión

Backend-Psych comienza en paralelo.
```

### MIÉRCOLES (Día 3) - 15:00 UTC

```
Hito de Backend-Psych:
  ✓ 4 endpoints implementados
  ✓ Tests >80% coverage
  ✓ PR abierto

Backend-Transversal ESPERA a que terminen Backend-Legal + Psych.
Backend-Social comienza en paralelo.
Frontend comienza (si los endpoints están en develop).
```

### JUEVES (Día 4) - 15:00 UTC

```
Hito de Backend-Social:
  ✓ 3 endpoints implementados
  ✓ Tests completos
  ✓ PR abierto

Backend-Transversal comienza (ya no hay bloqueos).
Frontend continúa.
QA comienza integration tests.
```

### VIERNES (Día 5) - 15:00 UTC DEADLINE

```
Final:
  ✓ Backend-Transversal mergeado
  ✓ Frontend components en desarrollo branch
  ✓ QA tests: 40+ PASS
  ✓ Base de datos con 11 tablas + datos
  ✓ Todas las ramas mergean a develop
  
  Validación PM:
    npm run test → Todos PASS
    npm run build → Sin errores
    npx prisma studio → Ver 11 tablas
    Swagger → Ver 12 endpoints
```

---

## 📞 COMUNICACIÓN & ESCALACIÓN

### Daily Standup (15 min, 18:00 UTC)

Todos los agentes reportan:
1. ¿Qué completaste hoy?
2. ¿En qué trabajas mañana?
3. ¿Hay blockers?

### Blockers Críticos (Escalar INMEDIATAMENTE)

Si ocurre cualquiera de estos, contacta al PM:
- ☐ Imposible ejecutar migración Prisma
- ☐ Error de compilación que no puedes resolver (>30 min)
- ☐ CaseAccessService no funciona como esperado
- ☐ Necesitas cambiar schema (tabla nueva, campo nuevo)
- ☐ Conflicto de merge no resoluble

**Tiempo de respuesta PM**: < 1 hora

---

## ✅ CHECKLIST DE FINALIZACIÓN

### Por cada agente backend:

```
Antes de hacer PR:
  ☐ npm run test → Todos PASS
  ☐ npx tsc --noEmit → 0 errores
  ☐ npm run lint → Sin warnings
  ☐ npm run build → Build exitoso
  ☐ Sin console.log() de debug
  ☐ README.md actualizado (ejemplo de uso)

PR Checklist:
  ☐ Branch name: feature/[nombre]
  ☐ Base branch: develop
  ☐ Title: feat(...): [descripción]
  ☐ Description: Qué implementaste + criterios cumplidos
  ☐ Link a issue (si aplica)
  ☐ Screenshots (si UI)
  ☐ Self-review antes de solicitar review
```

### Por cada agente QA:

```
  ☐ npm run test:e2e → 40+ PASS
  ☐ Coverage report generado
  ☐ Documentación de cada test
  ☐ No hay tests skipped (.skip)
  ☐ Database fixtures limpios
```

---

## 🔍 DEFINICIONES IMPORTANTES

### "Completado" (LISTO)
- Código compilable (no hay errores TypeScript)
- Tests PASS 100%
- Criterios de aceptación cumplidos 100%
- PR aprobado y mergeado a develop

### "En Progreso"
- Código en rama feature (no en develop aún)
- Tests corriendo pero no todos PASS
- Criterios parcialmente cumplidos

### "Bloqueado"
- Hay dependencia externa sin resolver
- Error no resoluble después de 30 min
- Esperando a otro agente

---

## 📚 REFERENCIAS RÁPIDAS

### Comandos útiles

```bash
# Git
git checkout -b feature/[nombre]
git add .
git commit -m "feat: [descripción breve]"
git push -u origin feature/[nombre]

# Prisma
npx prisma migrate dev --name "add_[table_name]"
npx prisma studio                    # Ver BD visualmente
npx prisma generate                   # Regenerar cliente

# Tests
npm run test -- [modulo].service.spec.ts
npm run test:e2e
npm run test -- --coverage

# Build
npx tsc --noEmit
npm run build
npm run lint
```

### Archivos clave

- Schema: `packages/db/prisma/schema.prisma`
- App module: `apps/api/src/app.module.ts`
- Auth guard: `apps/api/src/common/guards/jwt-auth.guard.ts`
- Case access: `apps/api/src/common/case-access/case-access.service.ts`
- Ejemplo módulo: `apps/api/src/modules/questionnaires/` (Fase 1)

---

## ⚠️ ERRORES COMUNES (EVITAR)

```
❌ "Olvidé leer la documentación"
   → Lee ARQUITECTURA-FINAL-COMPLETA.md antes de comenzar

❌ "Hardcodeé valores en el código"
   → TODO desde DTOs y base de datos

❌ "No validé acceso al caso"
   → SIEMPRE usa CaseAccessService.assertUserHasAccess()

❌ "Los tests pasan pero hice cambios que rompen otros módulos"
   → Revisa que tus cambios en schema no afecten otros modelos

❌ "Mi PR tiene 500 líneas sin tests"
   → Mínimo 80% coverage de tests

❌ "El componente frontend es un monolito de 2000 líneas"
   → Divide en componentes pequeños reutilizables

❌ "No documenté nada"
   → README + @ApiOperation en endpoints + comentarios complejos
```

---

## 🎓 CULTURA DE TRABAJO

### Principios

1. **Transparencia**: Reporta blockers inmediatamente (no esperes)
2. **Independencia**: Cada agente es responsable de su módulo
3. **Calidad**: Tests y documentación no son opcionales
4. **Comunicación**: Standup diario 100% transparente
5. **Escalación**: PM está ahí para desbloquear

### Cómo trabajamos

- ✅ Trabajo en paralelo (6 agentes simultáneamente)
- ✅ PRs pequeños y focalizados (1 módulo por PR)
- ✅ Revisión de pares (PM revisa antes de merge)
- ✅ Testing automático (CI/CD valida tests)

---

## 🏁 ENTREGA ESPERADA

**Viernes 15:00 UTC**, ustedes habrán entregado:

```
✅ 11 módulos especializados completamente implementados
✅ 12 endpoints funcionales (todos con Swagger)
✅ 11 tablas nuevas en BD (relaciones válidas)
✅ 60+ tests PASS (>80% coverage)
✅ 6-8 componentes React funcionales
✅ 40+ integration tests E2E
✅ 0 datos hardcodeados
✅ 100% código compilable
✅ Documentación completa (README + comentarios)
✅ Todas las ramas mergeadas a develop

RESULTADO FINAL:
  Fase 2 completada ✅
  API lista para testing
  Frontend listo para QA
  Base de datos con 20 tablas (Fase 1 + Fase 2)
  Listo para Semana 3 (testing + frontend refinement)
```

---

## 💪 USTEDES PUEDEN

Recuerden:
- Fase 1 se completó exitosamente (15 endpoints + 9 tablas)
- La arquitectura está clara (sin ambigüedades)
- Documentación 100% disponible
- PM está disponible para desbloquear
- Trabajan en paralelo (no compiten)

**Let's build Defensoria's future together! 🚀**

---

**INSTRUCTIVA EMITIDA POR**: Project Manager  
**VÁLIDA PARA**: Semana 2 (1-5 Agosto 2026)  
**PRÓXIMA REVISIÓN**: Viernes 15:00 UTC (validación de entrega)


