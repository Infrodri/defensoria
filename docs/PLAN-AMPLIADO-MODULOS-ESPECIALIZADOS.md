# Plan de Implementación Ampliado: 11 Módulos Especializados

**Versión**: 2.0  
**Fecha**: 1 Agosto 2026  
**Scope**: Suite completa + Herramientas por disciplina

---

## 📊 TIMELINE ACTUALIZADO: 4 SEMANAS

```
SEMANA 1 (COMPLETADA ✅):
  ├─ Inspecciones + Cuestionarios + DB
  └─ 6 commits, 15 endpoints

SEMANA 2 (NUEVA):
  ├─ 11 módulos especializados (backend)
  ├─ Prompts Ollama optimizados
  └─ 10 nuevas tablas Prisma

SEMANA 3:
  ├─ Frontend UI para todos los módulos
  └─ Dashboards especializados

SEMANA 4:
  ├─ Testing E2E completo
  ├─ Fine-tuning de IA
  └─ Documentación final
```

---

## 🏛️ MÓDULO 1-3: HERRAMIENTAS PARA ABOGADOS

### Detector de Discrepancias (RAG-based)

**Complejidad**: 🟠 Alta  
**Horas**: 8  
**Dependencias**: Transcription, LegalChunk (embeddings)

**Tareas**:
1. Crear tabla DiscrepancyAnalysis
2. Implementar búsqueda RAG de documentos comparables
3. Desarrollar análisis de diferencias (NLP comparativo)
4. Endpoint POST /legal-tools/discrepancies/analyze
5. Unit tests

**DTOs**:
```typescript
AnalyzeDiscrepanciesDto {
  transcriptionId: string,
  caseId: string,
  comparableDocuments?: string[],
}

DiscrepancyResult {
  discrepancies: DiscrepancyItem[],
  consistencyScore: number,
  riskLevel: "BAJO" | "MEDIO" | "ALTO",
}
```

---

### Analizador de Tipicidad Penal

**Complejidad**: 🟠 Alta  
**Horas**: 10  
**Dependencias**: LegalDocument (Código Penal), LLM Ollama

**Tareas**:
1. Crear tabla PenalTypicityAnalysis
2. Cargar Código Penal en LegalChunk (seed data)
3. Prompt engineering para análisis de tipicidad
4. Mapeo de elementos del delito → evidencia requerida
5. Endpoint POST /legal-tools/typicality/analyze
6. Integration tests

**DTOs**:
```typescript
AnalyzeTypicalityDto {
  transcriptionId: string,
  caseTypeCode: string, // VIOLENCIA_INTRAFAMILIAR, etc
}

PotentialCrime {
  criminalCode: string,  // Art. 252 CP
  likelihood: number,
  elementsPresent: string[],
  elementsMissing: string[],
  proofRequired: string[],
}
```

---

### Semáforo de Plazos Procesales

**Complejidad**: 🟢 Baja  
**Horas**: 6  
**Dependencias**: ActionLog, Case

**Tareas**:
1. Crear tabla ProcessualDeadline
2. Tabla de reglas de plazos (ley local)
3. Extractor de hitos legales (NLP)
4. Calculadora de fechas + alertas
5. Endpoint POST /legal-tools/deadlines/calculate
6. Scheduled task para recalcular diariamente

**DTOs**:
```typescript
CalculateDeadlineDto {
  caseId: string,
  eventDate: string,
  eventType: "MEDIDAS_PROTECCION" | "AUDIENCIA" | "DENUNCIA",
}

ProcessualDeadline {
  milestone: string,
  calculatedDate: Date,
  status: "EN_TIEMPO" | "PROXIMO" | "VENCIDO",
  alertLevel: "VERDE" | "AMARILLO" | "ROJO",
}
```

---

## 🧠 MÓDULO 4-6: HERRAMIENTAS PARA PSICÓLOGOS

### Extractor de Indicadores de Afectación

**Complejidad**: 🟠 Alta  
**Horas**: 8  
**Dependencias**: Transcription, LLM con prompts clínicos

**Tareas**:
1. Crear tabla TraumaIndicatorAnalysis
2. Prompt para detección de TEPT (DSM-5 criteria)
3. Identificar: fragmentación, lagunas, minimización
4. Calcular traumaScore (0-100)
5. Endpoint POST /psychological-tools/trauma/analyze
6. Validación con psicólogo junior

**DTOs**:
```typescript
AnalyzeTraumaDto {
  transcriptionId: string,
  caseId: string,
}

TraumaIndicator {
  indicator: "FRAGMENTACION" | "LAGUNAS" | "MINIMIZACION",
  strength: number,
  clinicalInterpretation: string,
}
```

---

### Llenado Automático de Escalas

**Complejidad**: 🟠 Alta  
**Horas**: 12  
**Dependencias**: Transcription, Base de escalas estandarizadas

**Tareas**:
1. Crear tabla RiskScaleAnalysis
2. Diseñar plantillas de escalas (BRPV, Beck, PCL-5, ASSI)
3. Prompt para mapeo pregunta-respuesta
4. Cálculo automático de scores
5. Endpoints para múltiples escalas
6. Interfaz de validación psicólogo

**Escalas a soportar**:
- BRPV (Batería de Riesgo de Violencia de Pareja)
- Beck Anxiety Inventory
- PCL-5 (TEPT)
- ASSI (riesgo suicida)

---

### Traductor Clínico-Jurídico

**Complejidad**: 🟡 Media  
**Horas**: 6  
**Dependencias**: LLM, Prompts especializados

**Tareas**:
1. Crear prompt para transformación de lenguaje
2. Validar admisibilidad jurídica
3. Endpoint POST /psychological-tools/translate/clinical-to-forensic
4. Comparación antes/después

**DTOs**:
```typescript
TranslateDto {
  clinicalNotes: string,
  targetAudience: "JUZGADO" | "EQUIPO",
}

ForensicTranslation {
  forensicText: string,
  keyFindings: string[],
  admissibilityNotes: string,
}
```

---

## 🏡 MÓDULO 7-9: HERRAMIENTAS PARA TRABAJADORES SOCIALES

### Generador de Familiogramas

**Complejidad**: 🟠 Alta  
**Horas**: 10  
**Dependencias**: Transcription, LLM

**Tareas**:
1. Crear tabla FamilyStructureAnalysis
2. Extractor de relaciones (NLP)
3. Parser de edades y dinámicas
4. Generador de JSON para visualización genograma
5. Endpoint POST /social-tools/family/analyze
6. Componente React para visualizar

**Salida para Genograma**:
```typescript
{
  familyMembers: [
    {
      id: "F1",
      name: "*[Familiar_1]*",
      relationship: "Madre",
      age: 42,
      custody: "MADRE",
    }
  ],
  relationships: [
    { from: "F1", to: "F2", type: "PAREJA" },
  ],
  dynamics: ["Ausencia paterna", "Sobreprotección materna"],
}
```

---

### Calculador de Vulnerabilidad Socioeconómica

**Complejidad**: 🟡 Media  
**Horas**: 8  
**Dependencias**: Transcription, Base de programas sociales

**Tareas**:
1. Crear tabla SocioeconomicVulnerability
2. Definir indices: vivienda, ingresos, cargas, acceso servicios
3. Parser de datos económicos del relato
4. Algoritmo de cálculo de índice (0-100)
5. Búsqueda de programas aplicables
6. Endpoint POST /social-tools/vulnerability/calculate

**Índices**:
- Housing Score (hacinamiento, tenencia, servicios)
- Income Score (ingresos, tipo empleo)
- Family Load Score (NNA, adultos mayores a cargo)
- Access Score (educación, salud, alimentación)

---

### Mapeador de Factores Riesgo Ambiental

**Complejidad**: 🟡 Media  
**Horas**: 7  
**Dependencias**: Transcription, LLM

**Tareas**:
1. Crear tabla EnvironmentalRiskMapping
2. Detector de factores: hacinamiento, drogas, deserción, aislamiento
3. Cálculo de riesgo ambiental
4. Identificación de fortalezas comunitarias
5. Endpoint POST /social-tools/environment/map
6. Dashboard visual

**Factores a detectar**:
- HACINAMIENTO
- CONSUMO_SUSTANCIAS
- DESERCION_ESCOLAR
- REDES_APOYO_NULAS
- VIOLENCIA_COMUNITARIA
- ACCESO_SERVICIOS_BASICOS

---

## 🛡️ MÓDULO 10-11: HERRAMIENTAS TRANSVERSALES

### Timeline Interdisciplinaria Unificada

**Complejidad**: 🟡 Media  
**Horas**: 6  
**Dependencias**: ActionLog, DiscrepancyAnalysis, TraumaAnalysis, FamilyAnalysis

**Tareas**:
1. Crear tabla UnifiedTimeline
2. Agregar campo `discipline` a ActionLog (o crear índice)
3. Consolidador de eventos de 3 áreas
4. Detector de conflictos de timeline
5. Endpoint GET /timeline/unified/:caseId
6. Componente React interactivo

**Output**:
```typescript
UnifiedTimelineEvent {
  date: Date,
  discipline: "LEGAL" | "PSICOLOGICO" | "SOCIAL",
  event: string,
  significance: "BAJO" | "MEDIO" | "ALTO",
  conflicts?: ConflictingEvent[],
}
```

---

### Anonimizador de Reportes

**Complejidad**: 🟠 Alta  
**Horas**: 8  
**Dependencias**: Report, User, Encriptación

**Tareas**:
1. Crear tabla AnonimizedReport
2. Detector de PII (nombres, direcciones, CI)
3. Generador de etiquetas (*[Víctima_1]*, etc.)
4. Encripción de mapeo (RSA o AES)
5. Reglas de retención automática
6. Endpoint POST /reports/anonymize
7. Función de desanonimización (solo admins con logs)

**Redaction Levels**:
- ESTRICTA: Solo etiquetas genéricas
- MODERADA: Permite ubicación general
- MINIMA: Solo nombres/CI

---

## 📦 TABLA DE ESTIMACIONES

| Módulo | Disciplina | Complejidad | Horas | Semana | Dependencias |
|--------|-----------|-------------|-------|--------|--------------|
| 1. Discrepancias | Abogado | 🟠 Alta | 8 | 2 | Transcription, RAG |
| 2. Tipicidad | Abogado | 🟠 Alta | 10 | 2 | LLM, Código Penal |
| 3. Plazos | Abogado | 🟢 Baja | 6 | 2 | ActionLog |
| 4. Trauma | Psicólogo | 🟠 Alta | 8 | 2 | Transcription, LLM |
| 5. Escalas | Psicólogo | 🟠 Alta | 12 | 2-3 | Transcription |
| 6. Traducción | Psicólogo | 🟡 Media | 6 | 2 | LLM |
| 7. Familiogramas | Social | 🟠 Alta | 10 | 3 | Transcription |
| 8. Vulnerabilidad | Social | 🟡 Media | 8 | 2-3 | Transcription |
| 9. Riesgo Ambiental | Social | 🟡 Media | 7 | 2-3 | Transcription |
| 10. Timeline Unificada | Transversal | 🟡 Media | 6 | 3 | Otros análisis |
| 11. Anonimizador | Transversal | 🟠 Alta | 8 | 2-3 | Report, Encriptación |

**TOTAL**: ~87 horas = 2.5 semanas (1-2 devs)

---

## 🚀 CRONOGRAMA DETALLADO SEMANA 2

### Lunes-Martes (Día 1-2):
- [ ] Crear 10 nuevas tablas Prisma (migración)
- [ ] Implementar DiscrepancyAnalysis
- [ ] Implementar PenalTypicityAnalysis

### Miércoles-Jueves (Día 3-4):
- [ ] Implementar TraumaIndicatorAnalysis
- [ ] Implementar RiskScaleAnalysis
- [ ] Implementar FamilyStructureAnalysis

### Viernes (Día 5):
- [ ] Implementar SocioeconomicVulnerability
- [ ] Implementar EnvironmentalRiskMapping
- [ ] Crear tabla UnifiedTimeline

---

## 🔧 STACK PROMPTS OLLAMA

```
Directorio: apps/api/src/modules/specialized-tools/prompts/

├─ legal-prompts/
│  ├─ discrepancy-detector.prompt
│  ├─ typicality-analyzer.prompt
│  └─ deadline-calculator.prompt
│
├─ psychological-prompts/
│  ├─ trauma-indicator.prompt
│  ├─ scale-prefiller.prompt
│  └─ clinical-forensic-translator.prompt
│
└─ social-prompts/
   ├─ family-extractor.prompt
   ├─ vulnerability-calculator.prompt
   └─ environmental-risk.prompt
```

**Cada prompt**:
- 200-400 palabras
- Instrucciones claras + ejemplos
- JSON schema de salida esperada
- Validaciones de confianza

---

## 📋 DELIVERABLES SEMANA 2

```
✅ Código Backend:
  ├─ 11 módulos completamente implementados
  ├─ 10 nuevas tablas Prisma
  ├─ 20+ nuevos endpoints
  ├─ 30+ unit tests
  └─ Documentación Swagger

✅ Prompts:
  ├─ 9 prompts optimizados para Ollama
  ├─ Validación de outputs
  └─ Ejemplos de uso

✅ Migraciones:
  ├─ SQL para 10 tablas
  ├─ Índices para performance
  └─ Constraints de integridad

✅ Documentación:
  ├─ DTOs finales
  ├─ Ejemplos de API calls
  └─ Guía de configuración Ollama
```

---

## 🎯 OBJECTIVOS POR DISCIPLINA

### Abogados
- ✅ Identifica automáticamente inconsistencias en testimonios
- ✅ Sugiere delitos configurables
- ✅ Alerta sobre vencimientos procesales
- ✅ Reduce tiempo análisis de 4h a 30 min

### Psicólogos
- ✅ Detecta indicadores de TEPT sin sesgo
- ✅ Pre-llena escalas clínicas (valida el prof.)
- ✅ Traduce diagnósticos a lenguaje forense
- ✅ Reduce redacción de 2h a 20 min

### Trabajadores Sociales
- ✅ Estructura genogramas automáticamente
- ✅ Calcula vulnerabilidad multifactor
- ✅ Identifica riesgos ambientales
- ✅ Sugiere programas de asistencia

### Jefatura
- ✅ Ve timeline integrada sin conflictos
- ✅ Genera reportes anónimos seguros
- ✅ Dashboard consolidado de alertas
- ✅ Toma decisiones más rápido

---

## 🛡️ CONSIDERACIONES DE SEGURIDAD

1. **Validación de outputs**: Cada análisis debe validar formato JSON
2. **Confianza**: Campo `confidence` (0-100%) en cada resultado
3. **Auditoría**: Quién ejecutó qué análisis y cuándo
4. **Redacción**: Anonimización reversible solo para admins
5. **Limpieza**: Borrar mapeos de anonimización después de N días

---

## 📊 MÉTRICAS DE ÉXITO

```
EFICIENCIA:
  - Reducir tiempo análisis abogado: 75%
  - Reducir tiempo análisis psicólogo: 60%
  - Reducir tiempo análisis social: 50%

PRECISIÓN:
  - Consistencia en detección de discrepancias: >90%
  - Tipicidad penal correcta: >85%
  - Indicadores trauma identificados: >80%

ADOPCIÓN:
  - 80% de usuarios usa herramientas en semana 1
  - 95% de casos tiene análisis completo en mes 1
  - NPS (Net Promoter Score): >70

CALIDAD:
  - Cero falsos positivos críticos
  - Feedback de usuarios en 2 semanas
  - Mejora continua de prompts
```

---

**Versión**: 2.0  
**Estado**: LISTO PARA SEMANA 2  
**Equipo recomendado**: 2 desarrolladores backend + 1 especialista IA  
**Fecha inicio**: Inmediata (post-Semana 1)
