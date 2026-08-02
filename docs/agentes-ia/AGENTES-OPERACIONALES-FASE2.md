# 🚀 OPERACIONALES PARA AGENTES - FASE 2 LISTA PARA EMPEZAR

**Estado**: BLOQUEADOR RESUELTO - Legal Tools completo  
**Próxima ejecución**: PSYCH TOOLS + SOCIAL TOOLS + TRANSVERSAL TOOLS  
**Para**: 3 Agentes especializados  
**Acción**: COMENZAR AHORA  

---

## 📌 RESUMEN EJECUTIVO

Legal Tools está **100% COMPLETO** y sirvió como **TEMPLATE**.

Los próximos 3 módulos **deben replicar la estructura de legal-tools** manteniendo el patrón.

---

## 🎯 ORDEN DE EJECUCIÓN (SIN TIEMPOS)

### AGENTE #1: BACKEND-PSYCHOLOGICAL TOOLS
**Intervención más crítica** - 4 endpoints (el más grande)

### AGENTE #2: BACKEND-SOCIAL TOOLS  
**Intervención secundaria** - 3 endpoints

### AGENTE #3: BACKEND-TRANSVERSAL TOOLS
**Intervención final** - 2 endpoints + Features especiales

---

## 📋 DELEGACIÓN #1: BACKEND-PSYCHOLOGICAL TOOLS

### TASK
Crear módulo `psychological-tools` con 4 endpoints que analicen automáticamente indicadores 
psicológicos, riesgos y traumatismo desde transcripciones.

Endpoints a implementar:
1. `POST /psychological-tools/indicators/extract` → Extrae indicadores de daño emocional
2. `POST /psychological-tools/risk-scales/prefill` → Pre-llena escalas de riesgo
3. `POST /psychological-tools/clinical-translator/translate` → Traduce a lenguaje forense
4. `POST /psychological-tools/trauma/analyze` (opcional MVP) → Analiza indicadores de trauma

### PRECONDITIONS
- [x] Legal Tools completado (template disponible)
- [ ] 3 nuevas tablas Prisma creadas:
  - `PsychologicalIndicatorExtraction` (indicadores detectados)
  - `RiskScalePrefill` (escalas pre-llenadas)
  - `ClinicalForensicTranslation` (traducciones forenses)
- [ ] Migración Prisma ejecutada: `npx prisma migrate dev --name "add_psychological_tools_tables"`
- [ ] Rama Git `feature/psychological-tools` creada

### DELIVERABLES
```
apps/api/src/modules/psychological-tools/
├── psychological-tools.controller.ts (4 endpoints)
├── psychological-tools.service.ts (lógica de análisis)
├── psychological-tools.module.ts (configuración NestJS)
├── psychological-tools.service.spec.ts (tests unitarios)
└── dto/
    ├── extract-indicators.dto.ts
    ├── prefill-risk-scales.dto.ts
    ├── translate-clinical.dto.ts
    └── analyze-trauma.dto.ts

Validación:
- npm run build → 0 errors
- npm run test -- psychological-tools.service.spec --run → ALL PASS
- npx tsc --noEmit → 0 errors
- Swagger auto-generado con 4 endpoints visibles
```

### VALIDATION CHECKLIST
- [ ] npm run build → 0 errors, 0 warnings
- [ ] npx tsc --noEmit → 0 errors
- [ ] npm run test -- psychological-tools.service.spec --run → 4+ tests PASS
- [ ] PsychologicalToolsModule importado en app.module.ts ✓
- [ ] 4 endpoints responden en Swagger ✓
- [ ] RBAC: @Roles(PSICOLOGO, ADMINISTRADOR) ✓
- [ ] CaseAccess integrado (assertUserHasAccess) ✓
- [ ] No hay datos hardcodeados ✓
- [ ] Manejo de errores (NotFoundException, ForbiddenException) ✓
- [ ] Logs con caseId + userId ✓

### EXIT CRITERIA
```
[✅] PR creado en rama feature/psychological-tools
[✅] Todos los tests PASS
[✅] npm run build exitoso
[✅] TypeScript sin errores
[✅] Git commits realizados
```

### PATRÓN A SEGUIR
**Copiar estructura exacta de legal-tools:**
1. Controlador: mismos decoradores (@UseGuards, @Roles, etc.)
2. Service: mismo patrón (validar acceso → ejecutar → guardar en BD)
3. DTOs: usar class-validator igual
4. Tests: vitest con misma estructura
5. Tablas: enums de Prisma para estados/niveles

---

## 📋 DELEGACIÓN #2: BACKEND-SOCIAL TOOLS

### TASK
Crear módulo `social-tools` con 3 endpoints que analicen automáticamente el entorno 
social, vulnerabilidad y redes de apoyo desde transcripciones.

Endpoints a implementar:
1. `POST /social-tools/familymap/generate` → Genera familiograma lineal
2. `POST /social-tools/vulnerability/calculate` → Calcula índice de vulnerabilidad
3. `POST /social-tools/environmental/map` → Mapea factores de riesgo ambiental

### PRECONDITIONS
- [x] Legal Tools completado
- [x] Psychological Tools completado (o en progreso)
- [ ] 3 nuevas tablas Prisma creadas:
  - `SocialFamilyMapGeneration` (datos de familiograma)
  - `SocialVulnerabilityCalculation` (cálculos socioeconómicos)
  - `SocialEnvironmentalMapping` (factores ambientales)
- [ ] Migración Prisma ejecutada: `npx prisma migrate dev --name "add_social_tools_tables"`
- [ ] Rama Git `feature/social-tools` creada

### DELIVERABLES
```
apps/api/src/modules/social-tools/
├── social-tools.controller.ts (3 endpoints)
├── social-tools.service.ts (lógica de análisis)
├── social-tools.module.ts
├── social-tools.service.spec.ts
└── dto/
    ├── generate-familymap.dto.ts
    ├── calculate-vulnerability.dto.ts
    └── map-environmental.dto.ts
```

### VALIDATION CHECKLIST
- [ ] npm run build → 0 errors
- [ ] npx tsc --noEmit → 0 errors
- [ ] npm run test -- social-tools.service.spec --run → 3+ tests PASS
- [ ] SocialToolsModule importado en app.module.ts ✓
- [ ] 3 endpoints visibles en Swagger ✓
- [ ] RBAC: @Roles(SOCIAL, ADMINISTRADOR) ✓
- [ ] CaseAccess integrado ✓

### EXIT CRITERIA
```
[✅] PR en rama feature/social-tools
[✅] Todos tests PASS
[✅] Build exitoso
```

---

## 📋 DELEGACIÓN #3: BACKEND-TRANSVERSAL TOOLS

### TASK
Crear módulo `transversal-tools` con 2 endpoints que:
1. Unifiquen cronología de 3 disciplinas en una sola línea de tiempo
2. Anonimicen datos sensibles para reportes interinstitucionales

Endpoints a implementar:
1. `POST /transversal-tools/timeline/unified` → Consolida eventos de 3 áreas
2. `POST /transversal-tools/anonymizer/anonymize` → Reemplaza datos sensibles

### PRECONDITIONS
- [x] Legal Tools completado
- [x] Psychological Tools completado (o en progreso)
- [x] Social Tools completado (o en progreso)
- [ ] 2 nuevas tablas Prisma:
  - `TransversalUnifiedTimeline` (eventos consolidados)
  - `TransversalAnonymizedReport` (reportes anónimos)
- [ ] Migración Prisma ejecutada
- [ ] Rama Git `feature/transversal-tools` creada

### DELIVERABLES
```
apps/api/src/modules/transversal-tools/
├── transversal-tools.controller.ts (2 endpoints)
├── transversal-tools.service.ts
├── transversal-tools.module.ts
├── transversal-tools.service.spec.ts
└── dto/
    ├── create-unified-timeline.dto.ts
    └── anonymize-report.dto.ts
```

### VALIDATION CHECKLIST
- [ ] npm run build → 0 errors
- [ ] npx tsc --noEmit → 0 errors
- [ ] npm run test -- transversal-tools.service.spec --run → 2+ tests PASS
- [ ] TransversalToolsModule importado ✓
- [ ] 2 endpoints en Swagger ✓
- [ ] RBAC: @Roles(JEFATURA, ADMINISTRADOR) ✓

---

## 🔧 INSTRUCCIONES TÉCNICAS PARA LOS 3 AGENTES

### Paso 1: Crear Tablas Prisma (Antes de cualquier código)

Para PSYCHOLOGICAL TOOLS, agregar a `packages/db/prisma/schema.prisma`:

```prisma
model PsychologicalIndicatorExtraction {
  id                String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId            String    @db.Uuid
  case              Case      @relation(fields: [caseId], references: [id], onDelete: Cascade)
  
  transcriptionId   String    @db.Uuid
  transcription     Transcription @relation("PsychIndicators", fields: [transcriptionId], references: [id], onDelete: Cascade)
  
  indicators        Json      // Array de indicadores: {name, severity, description}
  traumaScore       Float     @default(0)
  emotionalDamage   String    // BAJO, MEDIO, ALTO
  
  analyzedAt        DateTime  @default(now()) @db.Timestamptz(6)
  analyzedBy        String    @db.Uuid
  analyst           User      @relation("PsychIndicatorAnalysts", fields: [analyzedBy], references: [id])
  
  @@index([caseId])
  @@map("psychological_indicator_extractions")
}

// Similar para RiskScalePrefill y ClinicalForensicTranslation
```

### Paso 2: Migración Prisma

```bash
cd packages/db
npx prisma migrate dev --name "add_psychological_tools_tables"
```

### Paso 3: Copiar estructura de legal-tools

```bash
cp -r apps/api/src/modules/legal-tools apps/api/src/modules/psychological-tools
# Renombrar archivos y actualizar imports
```

### Paso 4: Implementar endpoints

Seguir **EXACTAMENTE** el patrón de legal-tools:
- Controller con @UseGuards(JwtAuthGuard, RolesGuard)
- Service con validación de acceso + BD persist
- DTOs con class-validator
- Tests con vitest

### Paso 5: Registrar módulo en app.module.ts

```typescript
import { PsychologicalToolsModule } from './modules/psychological-tools/psychological-tools.module';

@Module({
  imports: [
    // ... otros módulos
    PsychologicalToolsModule,  // Agregar esta línea
  ],
})
```

### Paso 6: Verificar

```bash
npm run build              # 0 errors
npx tsc --noEmit          # 0 errors
npm run test -- psychological-tools.service.spec --run  # ALL PASS
```

---

## 📊 MATRIZ DE DEPENDENCIAS

```
Legal Tools ✅ (Completado - Template)
    ↓
Psychological Tools (Agente #1) → PUEDE EMPEZAR AHORA
    ↓
Social Tools (Agente #2) → PUEDE EMPEZAR AHORA (paralelo)
    ↓
Transversal Tools (Agente #3) → PUEDE EMPEZAR AHORA (paralelo)
```

**NO hay dependencias entre módulos.** Todos pueden ejecutarse en paralelo.

---

## 🎯 MÉTRICAS ESPERADAS AL FINAL

| Métrica | Target |
|---------|--------|
| Endpoints nuevos | 9 (4 + 3 + 2) |
| Tablas nuevas | 8 (3 + 3 + 2) |
| Módulos | 3 (Psych, Social, Transversal) |
| Tests | 9+ tests PASS |
| Build | 0 errors |
| TypeScript | 0 errors |

---

## ✅ CHECKLIST PRE-DELEGACIÓN

Para cada agente, verificar ANTES de delegar:

```
[✅] Rama Git creada (feature/[module]-tools)
[✅] Tablas Prisma creadas (3 por módulo)
[✅] Migración ejecutada
[✅] Template legal-tools disponible como referencia
[✅] Agente entiende patrón (controller → service → dto → tests)
[✅] Exit criteria claramente definido
[✅] Acceso a repositorio y documentación
```

---

## 🚀 ACCIÓN INMEDIATA

**COMANDO PARA INICIAR LOS 3 AGENTES:**

```bash
# Agente #1: BACKEND-PSYCHOLOGICAL
# Agente #2: BACKEND-SOCIAL
# Agente #3: BACKEND-TRANSVERSAL

# Todos pueden comenzar EN PARALELO ahora mismo
# Cada uno sigue su delegación (arriba)
# Template: apps/api/src/modules/legal-tools/
# Resultado esperado: 9 endpoints + 8 tablas nuevas
```

---

**Status**: 🟢 LISTO PARA DELEGACIÓN  
**Fecha**: 2 Agosto 2026  
**Para**: Project Manager / Orquestador de Agentes
