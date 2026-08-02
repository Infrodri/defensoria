# 🎯 PROMPTS PARA DELEGACIONES - COPIA Y PEGA DIRECTO

Usar estos prompts para delegar a los 3 agentes especializados.

---

## 🧠 PROMPT PARA AGENTE #1: BACKEND-PSYCHOLOGICAL TOOLS

```
Eres un agente especializado en backend NestJS.

Tu tarea: Implementar el módulo psychological-tools con 4 endpoints.

CONTEXTO:
- Legal Tools está completado y es tu template/patrón
- Debes replicar exactamente la estructura (controller → service → dto → tests)
- El módulo debe estar en: apps/api/src/modules/psychological-tools/
- Tienes 3 tablas Prisma nuevas creadas (PsychologicalIndicatorExtraction, RiskScalePrefill, ClinicalForensicTranslation)

REQUERIMIENTOS:

1. Crear 4 endpoints (GET, POST según sea):
   - POST /psychological-tools/indicators/extract
     Input: caseId, transcriptionId
     Output: indicadores de daño emocional, trauma score
     
   - POST /psychological-tools/risk-scales/prefill
     Input: caseId, transcriptionId
     Output: escalas de riesgo pre-llenadas (BAJO/MEDIO/ALTO)
     
   - POST /psychological-tools/clinical-translator/translate
     Input: caseId, notesText
     Output: texto traducido a lenguaje forense
     
   - POST /psychological-tools/trauma/analyze (OPCIONAL MVP)
     Input: caseId, indicadores
     Output: análisis de trauma

2. Estructura obligatoria:
   ✓ psychological-tools.controller.ts
     - @UseGuards(JwtAuthGuard, RolesGuard)
     - @Roles(Role.PSICOLOGO, Role.ADMINISTRADOR)
     - @CurrentUser('id') userId
     
   ✓ psychological-tools.service.ts
     - caseAccessService.assertUserHasAccess()
     - Guardar en BD (Prisma)
     - Manejo de errores
     
   ✓ psychological-tools.module.ts
     - Providers y controllers correctos
     
   ✓ dto/ con 4 archivos
     - extract-indicators.dto.ts
     - prefill-risk-scales.dto.ts
     - translate-clinical.dto.ts
     - analyze-trauma.dto.ts
     
   ✓ psychological-tools.service.spec.ts
     - Tests unitarios (4+ tests)
     - Usando vitest (no Jest)

3. Validaciones obligatorias:
   ✓ Todos los DTOs con class-validator (@IsUUID, @IsString, etc.)
   ✓ JWT Guard + Roles Guard activos
   ✓ CaseAccess validado
   ✓ Logging con caseId + userId
   ✓ Tablas Prisma persistidas correctamente

4. Verificación ANTES de entregar:
   ```bash
   npm run build              # → 0 errors
   npx tsc --noEmit          # → 0 errors
   npm run test -- psychological-tools.service.spec --run  # → ALL PASS
   ```

5. Agregar PsychologicalToolsModule a apps/api/src/app.module.ts

ENTREGA:
- Rama: feature/psychological-tools
- Archivos modificados: schema.prisma (si hay cambios), app.module.ts
- PR con todos los tests PASS

REFERENCIA:
- Ver legal-tools (apps/api/src/modules/legal-tools/) para patrones
- Ver AGENTES-OPERACIONALES-FASE2-LISTO.md para detalles técnicos

¿Estás listo para comenzar?
```

---

## 🧠 PROMPT PARA AGENTE #2: BACKEND-SOCIAL TOOLS

```
Eres un agente especializado en backend NestJS.

Tu tarea: Implementar el módulo social-tools con 3 endpoints.

CONTEXTO:
- Legal Tools y Psychological Tools están como templates
- Debes replicar la estructura exacta
- Módulo: apps/api/src/modules/social-tools/
- 3 tablas Prisma nuevas ya creadas (SocialFamilyMapGeneration, SocialVulnerabilityCalculation, SocialEnvironmentalMapping)

REQUERIMIENTOS:

1. Crear 3 endpoints:
   - POST /social-tools/familymap/generate
     Input: caseId, transcriptionId
     Output: datos de familiograma (miembros, edades, dinámicas)
     
   - POST /social-tools/vulnerability/calculate
     Input: caseId, ingresos, vivienda, cargas_familiares
     Output: índice de vulnerabilidad + programas aplicables
     
   - POST /social-tools/environmental/map
     Input: caseId, transcriptionId
     Output: factores de riesgo ambiental (hacinamiento, consumo, deserción)

2. Estructura (COPIAR de legal-tools):
   ✓ social-tools.controller.ts
   ✓ social-tools.service.ts
   ✓ social-tools.module.ts
   ✓ dto/ con 3 archivos
   ✓ social-tools.service.spec.ts (vitest)

3. Validaciones:
   ✓ @UseGuards(JwtAuthGuard, RolesGuard)
   ✓ @Roles(Role.SOCIAL, Role.ADMINISTRADOR)
   ✓ CaseAccess integrado
   ✓ DTOs con validación

4. Verificación:
   ```bash
   npm run build              # 0 errors
   npx tsc --noEmit          # 0 errors
   npm run test -- social-tools.service.spec --run  # ALL PASS
   ```

5. Actualizar app.module.ts

ENTREGAR:
- Rama: feature/social-tools
- PR con tests PASS

PATRÓN: legal-tools (apps/api/src/modules/legal-tools/)
DOCS: AGENTES-OPERACIONALES-FASE2-LISTO.md

¿Comenzamos?
```

---

## 🧠 PROMPT PARA AGENTE #3: BACKEND-TRANSVERSAL TOOLS

```
Eres un agente especializado en backend NestJS.

Tu tarea: Implementar el módulo transversal-tools con 2 endpoints especiales.

CONTEXTO:
- Legal, Psychological y Social Tools son templates
- Estructura: apps/api/src/modules/transversal-tools/
- 2 tablas Prisma nuevas (TransversalUnifiedTimeline, TransversalAnonymizedReport)
- Este módulo integra datos de las 3 disciplinas anteriores

REQUERIMIENTOS:

1. Crear 2 endpoints:
   - POST /transversal-tools/timeline/unified
     Input: caseId
     Output: cronología consolidada de eventos legales + psicológicos + sociales
     Lógica: Leer de las 3 tablas, ordenar por fecha, retornar unificado
     
   - POST /transversal-tools/anonymizer/anonymize
     Input: caseId, reporteId
     Output: reporte con datos sensibles reemplazados
     Reemplazos: nombres → [VÍCTIMA_1], cédulas → [ID_XXX], direcciones → [UBICACIÓN]

2. Estructura (PATRÓN legal-tools):
   ✓ transversal-tools.controller.ts
   ✓ transversal-tools.service.ts
   ✓ transversal-tools.module.ts
   ✓ dto/ con 2 archivos
   ✓ transversal-tools.service.spec.ts

3. Validaciones:
   ✓ @UseGuards(JwtAuthGuard, RolesGuard)
   ✓ @Roles(Role.JEFATURA, Role.ADMINISTRADOR)
   ✓ CaseAccess + consultas cruzadas a otras tablas
   ✓ Logging exhaustivo para auditoría (especialmente anonymizer)

4. Verificación:
   ```bash
   npm run build              # 0 errors
   npx tsc --noEmit          # 0 errors
   npm run test -- transversal-tools.service.spec --run  # ALL PASS
   ```

5. Actualizar app.module.ts

ENTREGAR:
- Rama: feature/transversal-tools
- PR con tests PASS
- Especial: comprobar que el anonimizador reemplaza correctamente los datos

PATRÓN: legal-tools (apps/api/src/modules/legal-tools/)
DOCS: AGENTES-OPERACIONALES-FASE2-LISTO.md

¿Comenzamos?
```

---

## 📋 PLANTILLA PARA PM: VERIFICACIÓN DESPUÉS DE ENTREGA

Después que cada agente entregue, el PM ejecuta:

```bash
# Verificar compilación
cd c:\dev\defensoria\apps\api
npm run build

# Verificar tipos
npx tsc --noEmit

# Verificar tests
npm run test -- psychological-tools.service.spec --run
npm run test -- social-tools.service.spec --run
npm run test -- transversal-tools.service.spec --run

# Verificar módulos registrados
grep -r "PsychologicalToolsModule\|SocialToolsModule\|TransversalToolsModule" apps/api/src/app.module.ts

# Verificar endpoints en Swagger (visual)
# Abrir: http://localhost:3000/api (después de npm run start)

# Verificar git
cd c:\dev\defensoria
git log --oneline -10
```

**Si todo dice ✅**, entonces mergear a `develop`.

---

## 🎯 SECUENCIA DE EJECUCIÓN

```
AHORA MISMO:
1. Agente #1: Comienza PSYCHOLOGICAL TOOLS
2. Agente #2: Comienza SOCIAL TOOLS (paralelo)
3. Agente #3: Comienza TRANSVERSAL TOOLS (paralelo)

RESULTADOS ESPERADOS:
- 9 endpoints nuevos (4 + 3 + 2)
- 8 tablas nuevas
- 0 errores de compilación
- 9+ tests PASS
- 3 PRs mergeadas
```

---

**Para PM**: Copia cada prompt arriba y envía al agente correspondiente.  
**Para Agentes**: Lee tu prompt, sigue las instrucciones, entrega el PR.
