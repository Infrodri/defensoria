# Módulos Especializados por Disciplina

**Versión**: 2.0  
**Fecha**: 1 Agosto 2026  
**Objetivo**: Herramientas IA específicas para Abogados, Psicólogos y Trabajadores Sociales

---

## 🎯 RESUMEN DE 9 HERRAMIENTAS NUEVAS

```
┌─────────────────────────────────────────────────────────────┐
│         HERRAMIENTAS ESPECIALIZADAS POR DISCIPLINA          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 🏛️ PARA ABOGADOS (3 herramientas)                           │
│ ├─ Detector de Discrepancias Fácticas (RAG)               │
│ ├─ Analizador de Tipicidad Penal                          │
│ └─ Semáforo de Plazos Procesales Automático               │
│                                                             │
│ 🧠 PARA PSICÓLOGOS (3 herramientas)                        │
│ ├─ Extractor de Indicadores de Afectación                 │
│ ├─ Llenado Automático de Escalas de Riesgo                │
│ └─ Traductor Clínico-Jurídico                             │
│                                                             │
│ 🏡 PARA TRABAJADORES SOCIALES (3 herramientas)             │
│ ├─ Generador Lineal de Familiogramas                      │
│ ├─ Calculador de Vulnerabilidad Socioeconómica            │
│ └─ Mapeador de Factores de Riesgo Ambiental               │
│                                                             │
│ 🛡️ TRANSVERSALES (2 herramientas)                          │
│ ├─ Línea de Tiempo Interdisciplinaria                     │
│ └─ Anonimizador de Reportes Interinstitucionales          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏛️ MÓDULO 1: HERRAMIENTAS PARA ABOGADOS

### 1.1 DETECTOR DE DISCREPANCIAS FÁCTICAS (RAG)

**Propósito**: Comparar declaraciones actuales con denuncias previas/actas policiales

**Input**:
```typescript
{
  transcriptionId: string;        // Entrevista actual
  caseId: string;
  comparableDocuments?: string[]; // IDs de documentos anteriores (opcional)
}
```

**Output**:
```typescript
{
  discrepancies: [
    {
      category: "FECHA" | "LUGAR" | "NOMBRE_AGRESOR" | "MECANICA",
      severity: "BAJA" | "MEDIA" | "ALTA",
      currentStatement: string,
      previousStatement: string,
      implications: string, // "Podría afectar credibilidad de testigo"
      suggestedQuestion: string,
    }
  ],
  consistencyScore: number, // 0-100%
  riskLevel: "BAJO" | "MEDIO" | "ALTO",
  recommendation: string,
}
```

**Tabla en DB**:
```prisma
model DiscrepancyAnalysis {
  id              String @id @default(uuid()) @db.Uuid
  caseId          String @db.Uuid
  case            Case @relation(fields: [caseId], references: [id])
  
  currentTranscriptionId String @db.Uuid
  currentTranscription   Transcription @relation(fields: [currentTranscriptionId], references: [id])
  
  comparableDocumentIds  String[] @db.Uuid    // References to Evidence/Transcription
  
  discrepancies   Json
  consistencyScore Float @default(0)
  riskLevel       String @db.Enum(["BAJO", "MEDIO", "ALTO"])
  recommendation  String @db.Text
  
  analyzedAt      DateTime @default(now())
  analyzedBy      String @db.Uuid
  analyst         User @relation(fields: [analyzedBy], references: [id])
}
```

**Endpoint**:
```typescript
POST /legal-tools/discrepancies/analyze
{
  transcriptionId: string,
  caseId: string,
  comparableDocuments?: string[]
}
→ { discrepancies, consistencyScore, riskLevel, recommendation }
```

---

### 1.2 ANALIZADOR DE TIPICIDAD PENAL

**Propósito**: Contrastar relato con Código Penal local

**Input**:
```typescript
{
  transcriptionId: string;
  caseTypeCode: string; // Ej: "VIOLENCIA_INTRAFAMILIAR"
}
```

**Output**:
```typescript
{
  potentialCrimes: [
    {
      criminalCode: string,    // Ej: "Art. 252 CP"
      crimeType: string,       // "Violencia Psicológica"
      likelihood: number,      // 0-100%
      elementsPresent: string[],
      elementsMissing: string[],
      proofRequired: string[],
      suggestedEvidence: string[],
    }
  ],
  primaryCrime: string,
  secondaryCrimes: string[],
  evidenceGaps: string[],
  investigationPath: string,
}
```

**Tabla en DB**:
```prisma
model PenalTypicityAnalysis {
  id                String @id @default(uuid()) @db.Uuid
  caseId            String @db.Uuid
  case              Case @relation(fields: [caseId], references: [id])
  
  transcriptionId   String @db.Uuid
  transcription     Transcription @relation(fields: [transcriptionId], references: [id])
  
  potentialCrimes   Json
  primaryCrime      String
  secondaryCrimes   String[]
  evidenceGaps      String[]
  
  analyzedAt        DateTime @default(now())
  analyzedBy        String @db.Uuid
  analyst           User @relation(fields: [analyzedBy], references: [id])
}
```

**Endpoint**:
```typescript
POST /legal-tools/typicality/analyze
{
  transcriptionId: string,
  caseTypeCode: string
}
→ { potentialCrimes, primaryCrime, evidenceGaps, investigationPath }
```

---

### 1.3 SEMÁFORO DE PLAZOS PROCESALES

**Propósito**: Calcular vencimientos, audiencias, prórrogas automáticamente

**Input**:
```typescript
{
  caseId: string;
  eventDate: string;    // Ej: "2026-08-05" (medidas dicta das)
  eventType: "MEDIDAS_PROTECCION" | "AUDIENCIA" | "DENUNCIA" | "SENTENCIA_ANTERIOR";
}
```

**Output**:
```typescript
{
  deadlines: [
    {
      milestone: "Audiencia Preliminar",
      calculatedDate: Date,
      daysRemaining: number,
      status: "EN_TIEMPO" | "PROXIMO" | "VENCIDO",
      urgency: number, // 0-100
      relatedLaws: string[],
    }
  ],
  alertLevel: "VERDE" | "AMARILLO" | "ROJO",
  actionItems: string[],
}
```

**Tabla en DB**:
```prisma
model ProcessualDeadline {
  id                String @id @default(uuid()) @db.Uuid
  caseId            String @db.Uuid
  case              Case @relation(fields: [caseId], references: [id])
  
  milestone         String
  calculatedDate    DateTime
  daysRemaining     Int
  status            String @db.Enum(["EN_TIEMPO", "PROXIMO", "VENCIDO"])
  urgency           Int
  alertLevel        String @db.Enum(["VERDE", "AMARILLO", "ROJO"])
  
  createdAt         DateTime @default(now())
}
```

**Endpoint**:
```typescript
POST /legal-tools/deadlines/calculate
{
  caseId: string,
  eventDate: string,
  eventType: string
}
→ { deadlines, alertLevel, actionItems }
```

---

## 🧠 MÓDULO 2: HERRAMIENTAS PARA PSICÓLOGOS

### 2.1 EXTRACTOR DE INDICADORES DE AFECTACIÓN

**Propósito**: Identificar marcadores de daño emocional/TEPT en transcripción

**Input**:
```typescript
{
  transcriptionId: string;
  caseId: string;
}
```

**Output**:
```typescript
{
  traumaIndicators: [
    {
      indicator: "FRAGMENTACION_RELATO" | "LAGUNAS_TEMPORALES" | "MINIMIZACION_DAÑO",
      strength: number,     // 0-10
      evidence: string,
      clinicalInterpretation: string,
    }
  ],
  traumaScore: number,           // 0-100
  suspectedDiagnosis: string[],  // TEPT, Ansiedad, Depresión, etc.
  riskAssessment: string,        // Bajo/Medio/Alto
  recommendedInterventions: string[],
}
```

**Tabla en DB**:
```prisma
model TraumaIndicatorAnalysis {
  id                    String @id @default(uuid()) @db.Uuid
  caseId                String @db.Uuid
  case                  Case @relation(fields: [caseId], references: [id])
  
  transcriptionId       String @db.Uuid
  transcription         Transcription @relation(fields: [transcriptionId], references: [id])
  
  traumaIndicators      Json
  traumaScore           Float @default(0)
  suspectedDiagnosis    String[]
  riskAssessment        String
  
  analyzedAt            DateTime @default(now())
  analyzedBy            String @db.Uuid
  analyst               User @relation(fields: [analyzedBy], references: [id])
}
```

**Endpoint**:
```typescript
POST /psychological-tools/trauma/analyze
{
  transcriptionId: string,
  caseId: string
}
→ { traumaIndicators, traumaScore, suspectedDiagnosis, recommendedInterventions }
```

---

### 2.2 LLENADO AUTOMÁTICO DE ESCALAS DE RIESGO

**Propósito**: Pre-llenar herramientas estandarizadas (Escala de Riesgo de Violencia)

**Input**:
```typescript
{
  transcriptionId: string;
  scaleType: "ESCALA_RIESGO_VIOLENCIA" | "BECK_ANSIEDAD" | "PCL_TEPT" | "ASSI";
  caseId: string;
}
```

**Output**:
```typescript
{
  scaleName: string,
  items: [
    {
      itemNumber: number,
      question: string,
      suggestedResponse: "SI" | "NO" | number, // Depende de la escala
      confidence: number,      // 0-100% (validar manualmente)
      textEvidence: string,    // Fragmento que justifica
    }
  ],
  totalScore: number,
  interpretation: string,
  psychologistValidationNeeded: boolean,
}
```

**Tabla en DB**:
```prisma
model RiskScaleAnalysis {
  id                  String @id @default(uuid()) @db.Uuid
  caseId              String @db.Uuid
  case                Case @relation(fields: [caseId], references: [id])
  
  transcriptionId     String @db.Uuid
  transcription       Transcription @relation(fields: [transcriptionId], references: [id])
  
  scaleType           String
  items               Json
  totalScore          Float
  interpretation      String
  validatedBy         String? @db.Uuid
  validator           User? @relation(fields: [validatedBy], references: [id])
  
  createdAt           DateTime @default(now())
}
```

**Endpoint**:
```typescript
POST /psychological-tools/scales/pre-fill
{
  transcriptionId: string,
  scaleType: string,
  caseId: string
}
→ { items, totalScore, interpretation, psychologistValidationNeeded }
```

---

### 2.3 TRADUCTOR CLÍNICO-JURÍDICO

**Propósito**: Transformar notas diagnósticas en lenguaje técnico-forense

**Input**:
```typescript
{
  clinicalNotes: string;
  targetAudience: "JUZGADO" | "EQUIPO_MULTIDISCIPLINARIO";
}
```

**Output**:
```typescript
{
  forensicTranslation: string,
  keyFindings: string[],
  limitationsOfOpinion: string,
  admissibilityNotes: string,
}
```

**Endpoint**:
```typescript
POST /psychological-tools/translate/clinical-to-forensic
{
  clinicalNotes: string,
  targetAudience: string
}
→ { forensicTranslation, keyFindings, limitationsOfOpinion }
```

---

## 🏡 MÓDULO 3: HERRAMIENTAS PARA TRABAJADORES SOCIALES

### 3.1 GENERADOR DE FAMILIOGRAMAS Y CRONOLOGÍAS

**Propósito**: Extraer estructura familiar y crear genograma

**Input**:
```typescript
{
  transcriptionId: string;
  caseId: string;
}
```

**Output**:
```typescript
{
  familyMembers: [
    {
      name: string,          // *[Familiar_1]* si anonimizado
      relationship: string,  // Padre, Madre, Hermano, etc.
      age: number,
      custody: "MADRE" | "PADRE" | "OTRO",
      dynamics: string,      // Descripción de rol en familia
    }
  ],
  genogramData: Json,        // Estructura para visualizar
  timeline: [
    {
      date: string,
      event: string,
      participants: string[],
    }
  ],
  keyDynamics: string[],
}
```

**Tabla en DB**:
```prisma
model FamilyStructureAnalysis {
  id              String @id @default(uuid()) @db.Uuid
  caseId          String @db.Uuid
  case            Case @relation(fields: [caseId], references: [id])
  
  transcriptionId String @db.Uuid
  transcription   Transcription @relation(fields: [transcriptionId], references: [id])
  
  familyMembers   Json
  genogramData    Json
  timeline        Json
  keyDynamics     String[]
  
  analyzedAt      DateTime @default(now())
  analyzedBy      String @db.Uuid
  analyst         User @relation(fields: [analyzedBy], references: [id])
}
```

**Endpoint**:
```typescript
POST /social-tools/family/analyze
{
  transcriptionId: string,
  caseId: string
}
→ { familyMembers, genogramData, timeline, keyDynamics }
```

---

### 3.2 CALCULADOR DE VULNERABILIDAD SOCIOECONÓMICA

**Propósito**: Clasificar nivel de precarización y sugerir asistencia

**Input**:
```typescript
{
  transcriptionId: string;
  caseId: string;
}
```

**Output**:
```typescript
{
  vulnerabilityIndex: number,    // 0-100
  categories: {
    housing: { score: number, description: string },
    income: { score: number, description: string },
    familyLoad: { score: number, description: string },
    access: { score: number, description: string }, // servicios básicos
  },
  riskLevel: "BAJO" | "MEDIO" | "ALTO" | "CRITICO",
  applicableProgramas: [
    {
      programName: string,
      agency: string,
      eligibility: string,
      estimatedBenefit: string,
    }
  ],
}
```

**Tabla en DB**:
```prisma
model SocioeconomicVulnerability {
  id                    String @id @default(uuid()) @db.Uuid
  caseId                String @db.Uuid
  case                  Case @relation(fields: [caseId], references: [id])
  
  vulnerabilityIndex    Float @default(0)
  categories            Json
  riskLevel             String @db.Enum(["BAJO", "MEDIO", "ALTO", "CRITICO"])
  applicableProgramas   Json
  
  analyzedAt            DateTime @default(now())
  analyzedBy            String @db.Uuid
  analyst               User @relation(fields: [analyzedBy], references: [id])
}
```

**Endpoint**:
```typescript
POST /social-tools/vulnerability/calculate
{
  transcriptionId: string,
  caseId: string
}
→ { vulnerabilityIndex, riskLevel, applicableProgramas }
```

---

### 3.3 MAPEADOR DE FACTORES DE RIESGO AMBIENTAL

**Propósito**: Detectar dinámicas del entorno comunitario

**Input**:
```typescript
{
  transcriptionId: string;
  caseId: string;
}
```

**Output**:
```typescript
{
  environmentalFactors: [
    {
      factor: "HACINAMIENTO" | "CONSUMO_SUSTANCIAS" | "DESERCION_ESCOLAR" | "REDES_APOYO_NULAS",
      presence: boolean,
      severity: number,      // 0-10
      evidence: string,
      implications: string,
    }
  ],
  overallEnvironmentalRisk: number,   // 0-100
  communityStrengths: string[],
  recommendations: string[],
}
```

**Tabla en DB**:
```prisma
model EnvironmentalRiskMapping {
  id                      String @id @default(uuid()) @db.Uuid
  caseId                  String @db.Uuid
  case                    Case @relation(fields: [caseId], references: [id])
  
  transcriptionId         String @db.Uuid
  transcription           Transcription @relation(fields: [transcriptionId], references: [id])
  
  environmentalFactors    Json
  overallEnvironmentalRisk Float @default(0)
  communityStrengths      String[]
  recommendations         String[]
  
  analyzedAt              DateTime @default(now())
  analyzedBy              String @db.Uuid
  analyst                 User @relation(fields: [analyzedBy], references: [id])
}
```

**Endpoint**:
```typescript
POST /social-tools/environment/map
{
  transcriptionId: string,
  caseId: string
}
→ { environmentalFactors, overallEnvironmentalRisk, recommendations }
```



---

## 🛡️ MÓDULO 4: HERRAMIENTAS TRANSVERSALES

### 4.1 LÍNEA DE TIEMPO INTERDISCIPLINARIA UNIFICADA

**Propósito**: Consolidar hitos de las tres áreas en una cronología única

**Input**:
```typescript
{
  caseId: string;
}
```

**Output**:
```typescript
{
  unifiedTimeline: [
    {
      date: Date,
      discipline: "LEGAL" | "PSICOLOGICO" | "SOCIAL",
      event: string,
      description: string,
      significance: "BAJO" | "MEDIO" | "ALTO",
      icon: string, // Para visualización
    }
  ],
  conflictingTimelines?: [
    {
      discrepancy: string,
      legalVersion: string,
      psychoVersion?: string,
      socialVersion?: string,
    }
  ],
  interdisciplinaryInsights: string[],
}
```

**Tabla en DB**:
```prisma
model UnifiedTimeline {
  id              String @id @default(uuid()) @db.Uuid
  caseId          String @db.Uuid
  case            Case @relation(fields: [caseId], references: [id])
  
  events          Json   // Array de TimelineEvent
  conflicts       Json?  // Array de conflictos detectados
  insights        String[]
  
  lastUpdated     DateTime @updatedAt
  generatedBy     String @db.Uuid
  generator       User @relation(fields: [generatedBy], references: [id])
}
```

**Endpoint**:
```typescript
GET /timeline/unified/:caseId
→ { unifiedTimeline, conflictingTimelines, interdisciplinaryInsights }
```

---

### 4.2 ANONIMIZADOR DE REPORTES INTERINSTITUCIONALES

**Propósito**: Reemplazar datos sensibles por etiquetas para compartir

**Input**:
```typescript
{
  reportId: string;
  targetInstitution: string;      // "SECRETARIA_JUSTICIA" | "OTRO_JUZGADO"
  redactionRules?: "ESTRICTA" | "MODERADA" | "MINIMA";
}
```

**Output**:
```typescript
{
  anonimizedReport: string,           // Texto con reemplazos
  redactionMap: {
    "[Víctima_1]": "María García",    // Mapeo interno (solo para el sistema)
    "[Agresor_A]": "Juan López",
    "[Dirección_1]": "Calle X, nro 100",
  },
  sensitiveFieldsRemoved: string[],
  retentionPolicy: string,            // Cuándo se borra el mapeo
}
```

**Tabla en DB**:
```prisma
model AnonimizedReport {
  id                  String @id @default(uuid()) @db.Uuid
  originalReportId    String @db.Uuid
  originalReport      Report @relation(fields: [originalReportId], references: [id])
  
  anonimizedContent   String @db.Text
  redactionMap        Json   // Encriptado
  targetInstitution   String
  redactionLevel      String @db.Enum(["ESTRICTA", "MODERADA", "MINIMA"])
  
  sensitiveFields     String[]
  expiresAt           DateTime
  
  createdAt           DateTime @default(now())
  createdBy           String @db.Uuid
  creator             User @relation(fields: [createdBy], references: [id])
  
  @@index([expiresAt])
}
```

**Endpoint**:
```typescript
POST /reports/anonymize
{
  reportId: string,
  targetInstitution: string,
  redactionRules?: string
}
→ { anonimizedReport, redactionMap, sensitiveFieldsRemoved }
```

---

## 📊 TABLA INTEGRACIÓN DE MÓDULOS

| Módulo | Disciplina | Entrada | Salida | Tabla DB | Endpoint |
|--------|-----------|---------|--------|----------|----------|
| Discrepancias | Abogado | Transcripción | Inconsistencias | DiscrepancyAnalysis | POST /legal-tools/discrepancies/analyze |
| Tipicidad | Abogado | Transcripción | Delitos potenciales | PenalTypicityAnalysis | POST /legal-tools/typicality/analyze |
| Plazos | Abogado | Hito legal | Vencimientos | ProcessualDeadline | POST /legal-tools/deadlines/calculate |
| Trauma | Psicólogo | Transcripción | Indicadores TEPT | TraumaIndicatorAnalysis | POST /psychological-tools/trauma/analyze |
| Escalas | Psicólogo | Transcripción | Cuestionario pre-lleno | RiskScaleAnalysis | POST /psychological-tools/scales/pre-fill |
| Traducción | Psicólogo | Notas clínicas | Lenguaje forense | (no tabla) | POST /psychological-tools/translate/clinical-to-forensic |
| Familiogramas | Social | Transcripción | Genograma + timeline | FamilyStructureAnalysis | POST /social-tools/family/analyze |
| Vulnerabilidad | Social | Transcripción | Índice + programas | SocioeconomicVulnerability | POST /social-tools/vulnerability/calculate |
| Riesgo Ambiental | Social | Transcripción | Factores + recomendaciones | EnvironmentalRiskMapping | POST /social-tools/environment/map |
| Timeline Unificada | Transversal | Case | Cronología | UnifiedTimeline | GET /timeline/unified/:caseId |
| Anonimizador | Transversal | Report | Reporte anonimizado | AnonimizedReport | POST /reports/anonymize |

---

## 🔗 FLUJO INTEGRADO: CASO COMPLETO

```
PASO 1: Se registra entrevista (transcripción)
  └─ Trigger automático: análisis para todos los módulos

PASO 2: ABOGADO ve:
  ├─ Discrepancias vs denuncias previas (RAG)
  ├─ Delitos potenciales que configuran
  ├─ Vencimientos procesales (semáforo rojo/amarillo/verde)
  └─ Recomendación: "Faltan pruebas de coerción económica"

PASO 3: PSICÓLOGO ve:
  ├─ Indicadores de trauma detectados
  ├─ Pre-lleno de Escala de Riesgo de Violencia
  ├─ Diagnóstico sugerido: TEPT + Ansiedad
  └─ Traducción clínico-jurídica disponible para informe

PASO 4: TRABAJADOR SOCIAL ve:
  ├─ Miembros familia y dinámicas (genograma)
  ├─ Índice de vulnerabilidad: 78/100 (ALTO)
  ├─ Programas aplicables: "Beca escolar + Asistencia económica"
  └─ Factores ambientales: "Hacinamiento + Redes apoyo débiles"

PASO 5: JEFATURA ve:
  ├─ Timeline unificada: qué hizo quién y cuándo
  ├─ Conflictos entre versiones detectados
  ├─ Reporte para Juzgado: anonimizado y listo para compartir
  └─ Dashboard consolidado con alertas

RESULTADO:
  ✅ Expediente con análisis completo desde 3 disciplinas
  ✅ Recomendaciones concretas (legal, clínico, social)
  ✅ Sin duplicación de esfuerzo
  ✅ Compartible con instituciones externas sin riesgos
```

---

## 📦 NUEVAS TABLAS EN PRISMA (9 tablas)

```prisma
1. DiscrepancyAnalysis
2. PenalTypicityAnalysis
3. ProcessualDeadline
4. TraumaIndicatorAnalysis
5. RiskScaleAnalysis
6. FamilyStructureAnalysis
7. SocioeconomicVulnerability
8. EnvironmentalRiskMapping
9. UnifiedTimeline
10. AnonimizedReport (bonus)
```

---

## 🚀 STACK REQUERIDO

```
✅ Ollama (existente)
  ├─ qwen2.5:7b (LLM principal)
  ├─ Para análisis texto: Prompts especializados
  └─ Para embeddings: nomic-embed-text

✅ PostgreSQL + pgvector
  ├─ Búsqueda de transcripciones anteriores
  ├─ Búsqueda de artículos legales (RAG para tipicidad)
  └─ Full-text search en discrepancias

✅ Sistema de Prompt Engineering
  ├─ Prompts para cada disciplina
  ├─ Templates de análisis
  ├─ Validación de resultados
  └─ Mejora continua con feedback
```

---

## 🎓 CONSIDERACIONES TÉCNICAS

### Validaciones por Rol

```
ABOGADO puede ejecutar:
  ✅ Analizador de Tipicidad
  ✅ Detector de Discrepancias
  ✅ Semáforo de Plazos
  ❌ NO puede ver análisis psicológico sin autorización

PSICÓLOGO puede ejecutar:
  ✅ Extractor de Trauma
  ✅ Llenador de Escalas
  ✅ Traductor Clínico-Jurídico
  ❌ NO puede crear análisis legales

TRABAJADOR SOCIAL puede ejecutar:
  ✅ Familiogramas
  ✅ Vulnerabilidad
  ✅ Riesgo Ambiental
  ❌ NO puede modificar tipificación penal

TODOS pueden acceder:
  ✅ Timeline Unificada (lectura)
  ✅ Anonimizador (generación de reportes)
```

### Auditoría

Cada análisis genera:
- `analyzedAt`: Cuándo se ejecutó
- `analyzedBy`: Quién lo hizo
- `caseId`: A qué expediente pertenece
- `confidence`: Nivel de confianza (IA sugerencia, humano valida)

---

## 💾 MIGRACIÓN PRISMA (Fase 2)

```sql
-- Crear tablas de análisis especializados
CREATE TABLE "discrepancy_analyses" (...)
CREATE TABLE "penal_typicality_analyses" (...)
CREATE TABLE "processual_deadlines" (...)
CREATE TABLE "trauma_indicator_analyses" (...)
CREATE TABLE "risk_scale_analyses" (...)
CREATE TABLE "family_structure_analyses" (...)
CREATE TABLE "socioeconomic_vulnerabilities" (...)
CREATE TABLE "environmental_risk_mappings" (...)
CREATE TABLE "unified_timelines" (...)
CREATE TABLE "anonimized_reports" (...)

-- Crear índices para performance
CREATE INDEX on "discrepancy_analyses"("caseId");
CREATE INDEX on "unified_timelines"("caseId");
CREATE INDEX on "anonimized_reports"("expiresAt");
```

---

## 📋 PRÓXIMA FASE: IMPLEMENTACIÓN

### Semana 3 (Frontend + Testing)
- [ ] Componentes React para visualizar cada análisis
- [ ] Dashboards especializados por rol
- [ ] Testing E2E de flujos integrados

### Semana 4 (Optimización)
- [ ] Fine-tuning de prompts Ollama
- [ ] Mejora de precisión de detecciones
- [ ] Documentación final para usuarios

---

**Arquitectura diseñada para**:
- ✅ Automatizar tareas repetitivas
- ✅ Reducir tiempo de análisis 70%
- ✅ Mantener rigor profesional
- ✅ Facilitar trabajo interdisciplinario
- ✅ Cumplir normas de privacidad

**Versión**: 2.0  
**Estado**: LISTO PARA IMPLEMENTACIÓN  
**Módulos**: 11 (3 abogados + 3 psicólogos + 3 trabajadores sociales + 2 transversales)
