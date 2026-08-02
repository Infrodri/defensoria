# DELEGACIONES FRONTEND - PSYCHOLOGICAL, SOCIAL, TRANSVERSAL TOOLS

Fase 2 - Sistema DNA Sucre  
**Status Backend**: ✅ 100% COMPLETADO (Legal + Psychological + Social + Transversal)  
**Status Frontend**: ✅ Legal Tools 100%, 🔴 Psychological/Social/Transversal PENDIENTES

---

## 📋 DELEGACIÓN #1: PSYCHOLOGICAL TOOLS - Frontend Components

**Tipo**: Frontend React  
**Complejidad**: 🟡 Media (replicar patrón Legal Tools)  
**Tiempo Estimado**: 1.5-2 horas  
**Modelo**: Sub-agente (código simple, supervisado por Kiro)

### TASK

Crear 4 componentes React para **Psychological Tools** replicando exactamente el patrón de Legal Tools.

Ubicación: `apps/web/components/psychological-tools/`

### COMPONENTES A CREAR

#### 1. **trauma-indicators.tsx** (~220 líneas)

**Props**:
```typescript
interface TraumaIndicator {
  category: string;           // "Síntomas de Estrés Postraumático", "Depresión", etc.
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;        // Descripción detallada del indicador
  evidenceFound: string;      // Evidencia del cuestionario/transcripción
  recommendedSupport: string; // "Terapia individual", "Medicación", etc.
}

interface TraumaIndicatorsProps {
  caseId: string;
  analysisId: string;
  traumaLevel: 'BAJO' | 'MEDIO' | 'ALTO';    // Nivel general de trauma
  indicators: TraumaIndicator[];             // Lista de indicadores detectados
  overallScore: number;                       // Score 0-100
  recommendation: string;                    // Recomendación clínica
  analyzedAt: string;
  analyzedBy: string;
}
```

**Diseño**:
- Card principal con "Evaluación de Trauma"
- Progress bar circular del overallScore (0-100)
- Color del círculo según traumaLevel: BAJO=verde (--salvia), MEDIO=amarillo, ALTO=rojo
- Lista de indicadores con colores por severity
- Icons: Alert, AlertTriangle, AlertCircle (lucide-react)
- Sección de recomendación con fondo coloreado
- Footer con "Analizado por / Fecha"

**Styling**: Replicar exactamente `legal-tools/discrepancy-analysis.tsx`

---

#### 2. **risk-scales.tsx** (~180 líneas)

**Props**:
```typescript
interface RiskScale {
  name: string;                         // "SDQ", "RCADS", "PSI", "DASS-21"
  score: number;                        // 0-100 (normalizado)
  interpretation: 'NORMAL' | 'BORDERLINE' | 'CLINICO';
  subscales?: Array<{
    name: string;
    score: number;
    percentile: number;
  }>;
  recommendation: string;               // "No requiere intervención", "Intervención moderada", etc.
}

interface RiskScalesProps {
  caseId: string;
  analysisId: string;
  scales: RiskScale[];                  // Array de escalas (SDQ, RCADS, etc.)
  overallClinicalRisk: 'BAJO' | 'MEDIO' | 'ALTO';
  analyzedAt: string;
  analyzedBy: string;
}
```

**Diseño**:
- Card con "Escalas de Riesgo Psicológico"
- Grid de tarjetas (1-2 columnas según pantalla) para cada escala
- Barra horizontal para mostrar score (0-100 con colores: verde 0-33, amarillo 33-66, rojo 66-100)
- Percentil mostrado al lado del score
- Subscales como lista desplegable (collapsible)
- Color de borde según interpretation: NORMAL=verde, BORDERLINE=amarillo, CLINICO=rojo

---

#### 3. **clinical-translation.tsx** (~150 líneas)

**Props**:
```typescript
interface ClinicalTranslation {
  id: string;
  originalText: string;           // Texto de informe psicológico original
  translatedText: string;         // Traducción a lenguaje forense
  keyTermsReplaced: Array<{
    original: string;
    translated: string;
  }>;
  timestamp: string;
}

interface ClinicalTranslationProps {
  caseId: string;
  translations: ClinicalTranslation[];
  analyzedBy: string;
}
```

**Diseño**:
- Card con "Traducción Clínico-Forense"
- Dos columnas lado a lado: Texto original | Texto traducido
- Palabras clave reemplazadas con highlight (color diferente)
- Tabla de "Términos Reemplazados" (original → traducido)
- Botón "Copiar traducción" (copy to clipboard)
- Timestamp de cada traducción

---

#### 4. **psychological-tools-panel.tsx** (~120 líneas)

**Props**:
```typescript
interface PsychologicalToolsPanelProps {
  caseId: string;
  traumaIndicators?: TraumaIndicators;
  riskScales?: RiskScalesData;
  clinicalTranslations?: ClinicalTranslation[];
}
```

**Diseño**:
- Tab navigation: "Indicadores de Trauma" | "Escalas de Riesgo" | "Traducciones"
- Componentes integrados (igual que legal-tools-panel)
- Props opcionales → placeholder si no hay data
- Títulos y descripción del panel

---

#### 5. **index.ts** (Exports)

```typescript
export { TraumaIndicators } from './trauma-indicators';
export { RiskScales } from './risk-scales';
export { ClinicalTranslation } from './clinical-translation';
export { PsychologicalToolsPanel } from './psychological-tools-panel';
```

---

### REGLAS OBLIGATORIAS

✓ Código simple (SIN lógica de negocio)  
✓ Props SOLAMENTE (sin llamadas API)  
✓ 'use client' al inicio de cada archivo  
✓ TypeScript tipado 100%  
✓ CSS inline con `var(--color)` del tema  
✓ Replicar styling de `legal-tools/` exactamente  
✓ Lucide-react para icons  
✓ Sin console.log, sin debuggers  

### VERIFICACIÓN

```bash
npx tsc --noEmit --skipLibCheck  # 0 errores
npm run build                     # SUCCESS
```

### ENTREGA

- Rama: `feature/psychological-tools-frontend`
- 5 archivos .tsx en `apps/web/components/psychological-tools/`
- Commit: `feat(frontend): psychological tools components (4 UI + panel + index)`
- PR contra `develop` (NO mergear aún, esperar OK de Kiro)

---

## 📋 DELEGACIÓN #2: SOCIAL TOOLS - Frontend Components

**Tipo**: Frontend React  
**Complejidad**: 🟡 Media  
**Tiempo Estimado**: 1.5 horas  
**Modelo**: Sub-agente (supervisado)

### TASK

Crear 3 componentes React para **Social Tools** replicando patrón.

Ubicación: `apps/web/components/social-tools/`

### COMPONENTES A CREAR

#### 1. **family-structure.tsx** (~180 líneas)

**Props**:
```typescript
interface FamilyMember {
  id: string;
  name: string;              // O "[PERSONA_1]" si anonimizado
  age: number;
  relationship: string;      // "Madre", "Padre", "Hermano/a", "Tío/a", etc.
  livesWithNNA: boolean;
  occupationStatus: string;  // "Empleado", "Desempleado", "Estudiante"
  concerns?: string;         // Notas sobre vulnerabilidades
}

interface FamilyStructureProps {
  caseId: string;
  analysisId: string;
  nnaName: string;
  nuclearFamily: FamilyMember[];
  extendedFamily?: FamilyMember[];
  familyDynamics: string;    // Narrativa de dinámicas
  vulnerabilities: string[]; // ["Monoparentalidad", "Desempleo paterno", "Hacinamiento"]
  analyzedAt: string;
  analyzedBy: string;
}
```

**Diseño**:
- Card con "Estructura Familiar"
- Árbol genealógico visual (simple: cajas conectadas)
  - NNA en el centro (color resaltado: --salvia)
  - Padres arriba (conectados con líneas)
  - Hermanos al lado (si existen)
  - Otros familiares abajo
- Cada caja contiene: Nombre | Edad | Relación | Ocupación
- Color de borde según "livesWithNNA": Rojo si NO vive, Verde si vive
- Lista de vulnerabilidades en sección aparte (tags)
- Narrativa de dinámicas familiar en sección expandible

---

#### 2. **vulnerability-assessment.tsx** (~170 líneas)

**Props**:
```typescript
interface RiskFactor {
  category: string;           // "Vivienda", "Empleo", "Educación", "Servicios"
  factor: string;             // "Hacinamiento", "Sin agua potable", "Desempleo paterno"
  severity: 'BAJO' | 'MEDIO' | 'ALTO';
}

interface VulnerabilityAssessmentProps {
  caseId: string;
  analysisId: string;
  vulnerabilityScore: number; // 0-100
  vulnerabilityLevel: 'BAJO' | 'MEDIO' | 'ALTO';
  riskFactors: RiskFactor[];
  supportPrograms: Array<{
    name: string;             // "Bono Juancito Pinto", "Programa de Nutrición"
    eligibility: 'ELEGIBLE' | 'NO_ELEGIBLE' | 'CONDICIONADO';
    reason?: string;
  }>;
  recommendations: string;
  analyzedAt: string;
  analyzedBy: string;
}
```

**Diseño**:
- Card con "Evaluación de Vulnerabilidad"
- Gauge/meter grande mostrando vulnerabilityScore (0-100)
- Color según level: BAJO=verde, MEDIO=amarillo, ALTO=rojo
- Grid de factores de riesgo (cards pequeñas)
- Cada factor: nombre | icono de severidad | categoría como tag
- Sección de "Programas Aplicables": listado con badge de eligibilidad
- Recomendaciones en sección final

---

#### 3. **social-tools-panel.tsx** (~110 líneas)

**Props**:
```typescript
interface SocialToolsPanelProps {
  caseId: string;
  familyStructure?: FamilyStructureData;
  vulnerabilityAssessment?: VulnerabilityAssessmentData;
}
```

**Diseño**:
- Tab navigation: "Estructura Familiar" | "Vulnerabilidad"
- Integra 2 componentes anteriores
- Props opcionales

---

#### 4. **index.ts** (Exports)

```typescript
export { FamilyStructure } from './family-structure';
export { VulnerabilityAssessment } from './vulnerability-assessment';
export { SocialToolsPanel } from './social-tools-panel';
```

---

### REGLAS OBLIGATORIAS

✓ Same as Psychological Tools (ver arriba)

### VERIFICACIÓN

```bash
npx tsc --noEmit --skipLibCheck
npm run build
```

### ENTREGA

- Rama: `feature/social-tools-frontend`
- 4 archivos .tsx en `apps/web/components/social-tools/`
- Commit: `feat(frontend): social tools components (2 UI + panel + index)`
- PR contra `develop` (NO mergear aún)

---

## 📋 DELEGACIÓN #3: TRANSVERSAL TOOLS - Frontend Components

**Tipo**: Frontend React  
**Complejidad**: 🟡 Media  
**Tiempo Estimado**: 1 hora  
**Modelo**: Sub-agente (supervisado)

### TASK

Crear 2 componentes React para **Transversal Tools** replicando patrón.

Ubicación: `apps/web/components/transversal-tools/`

### COMPONENTES A CREAR

#### 1. **unified-timeline.tsx** (~200 líneas)

**Props**:
```typescript
interface TimelineEvent {
  id: string;
  timestamp: string;          // ISO datetime
  actor: string;              // Nombre del profesional/sistema que hizo la acción
  actionType: string;         // "CASO_CREADO", "ASIGNACION", "INFORME_EMITIDO", "CITA_REALIZADA"
  description: string;        // "Caso registrado en el sistema"
  moduleSource: 'legal' | 'psychological' | 'social' | 'system';  // De cuál módulo viene
  documentLink?: string;      // URL del documento asociado
  severity?: 'info' | 'warning' | 'critical';
}

interface UnifiedTimelineProps {
  caseId: string;
  events: TimelineEvent[];
  analyzedAt?: string;
}
```

**Diseño**:
- Card con "Timeline Unificado del Expediente"
- Línea vertical con eventos cronológicos
- Cada evento: círculo de color (según moduleSource) → descripción → fecha hora
- Colores por módulo: legal=--salvia, psychological=--amarillo, social=--azul, system=--gris
- Al hacer hover: expansión de evento con detalles
- Clicking en evento: abre documento asociado si existe
- Ícono pequeño de tipo de acción (crear, asignar, reportar, cita)
- Scroll vertical si hay muchos eventos

---

#### 2. **anonymized-report.tsx** (~150 líneas)

**Props**:
```typescript
interface AnonymizationRule {
  pattern: string;            // "nombre_nna", "cedula", "direccion"
  originalValue?: string;     // Valor original (en logs/auditoría)
  replacedWith: string;       // "[VÍCTIMA_1]", "[ID_XXX]", "[UBICACIÓN]"
  count: number;              // Cuántas veces se reemplazó
}

interface AnonymizedReportProps {
  caseId: string;
  reportId: string;
  reportContent: string;      // Texto del reporte anonimizado
  anonymizationRules: AnonymizationRule[];
  confidentialityLevel: 'PUBLICO' | 'CONFIDENCIAL' | 'MUY_CONFIDENCIAL';
  generatedAt: string;
  generatedBy: string;
}
```

**Diseño**:
- Card con "Reporte Anonimizado"
- Sección superior: metadatos (nivel confidencialidad con badge, fecha, generado por)
- Sección central: texto del reporte con palabras anonimizadas resaltadas en color
- Sección inferior: tabla de "Reemplazos Realizados" (patrón | reemplazado con | cantidad)
- Botón "Descargar Reporte PDF"
- Botón "Copiar al Portapapeles"
- Info box: "Reporte anonimizado preparado para compartir con autoridades judiciales"

---

#### 3. **transversal-tools-panel.tsx** (~100 líneas)

**Props**:
```typescript
interface TransversalToolsPanelProps {
  caseId: string;
  unifiedTimeline?: UnifiedTimelineData;
  anonymizedReport?: AnonymizedReportData;
}
```

**Diseño**:
- Tab navigation: "Timeline Unificado" | "Reporte Anonimizado"
- Integra 2 componentes

---

#### 4. **index.ts** (Exports)

```typescript
export { UnifiedTimeline } from './unified-timeline';
export { AnonymizedReport } from './anonymized-report';
export { TransversalToolsPanel } from './transversal-tools-panel';
```

---

### REGLAS OBLIGATORIAS

✓ Same as anteriores

### VERIFICACIÓN

```bash
npx tsc --noEmit --skipLibCheck
npm run build
```

### ENTREGA

- Rama: `feature/transversal-tools-frontend`
- 4 archivos .tsx en `apps/web/components/transversal-tools/`
- Commit: `feat(frontend): transversal tools components (2 UI + panel + index)`
- PR contra `develop` (NO mergear aún)

---

## ✅ CHECKLIST DE VALIDACIÓN POSTERIOR (PARA KIRO)

Después que se entregan los 3 PRs:

```bash
cd c:\dev\defensoria\apps\web

# Compilación
npx tsc --noEmit --skipLibCheck    # → 0 errors

# Build
npm run build                       # → SUCCESS

# Verificar archivos
ls -la components/psychological-tools/
ls -la components/social-tools/
ls -la components/transversal-tools/

# Verificar exports
grep -r "export.*Psychological\|export.*Social\|export.*Transversal" components/*/index.ts
```

---

## 📊 RESUMEN

| Módulo | Componentes | Líneas | Tiempo | Status |
|--------|------------|--------|--------|--------|
| Legal Tools | 4 | ~1300 | 2h | ✅ DONE |
| Psychological | 4 | ~570 | 1.5h | 🔴 PENDING |
| Social | 3 | ~460 | 1.5h | 🔴 PENDING |
| Transversal | 3 | ~450 | 1h | 🔴 PENDING |
| **TOTAL** | **14** | **~2780** | **~6h** | 🔴 PENDING |

---

## 🎯 EJECUCIÓN

**Ahora**:
1. Agente #1: Crear Psychological Tools frontend (~1.5h)
2. Agente #2: Crear Social Tools frontend (~1.5h)  
3. Agente #3: Crear Transversal Tools frontend (~1h)

**Paralelo**: Todos 3 pueden ejecutar simultáneamente (sin dependencias)

**Después**:
- Kiro verifica cada PR (compilación + build)
- Kiro mergea a `develop`
- Kiro crea PR final: `feature/backend-tools-parallel` → `develop`

---

**Versión**: 1.0  
**Fecha**: 2 Agosto 2026  
**Estado**: 🔴 READY TO DELEGATE  
**Responsable**: Kiro Agent  
