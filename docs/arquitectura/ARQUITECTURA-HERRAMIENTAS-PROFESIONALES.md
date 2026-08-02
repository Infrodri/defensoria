# Arquitectura: Suite Completa de Herramientas para Profesionales

**Versión**: 1.0  
**Fecha**: 2026-08-01  
**Objetivo**: Diseñar módulos integrados para grabación, transcripción, cuestionarios, fotos e inspecciones sorpresas

---

## 🎯 RESUMEN DE HERRAMIENTAS A IMPLEMENTAR

```
┌─────────────────────────────────────────────────────────────┐
│         SUITE DE HERRAMIENTAS PARA PROFESIONALES           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 1. INSPECCIONES SORPRESAS (NEW)                            │
│    ├─ Fotografías de evidencia (múltiples)                 │
│    ├─ Videos opcionales (si se graba)                      │
│    ├─ Ubicación GPS (coordenadas)                          │
│    ├─ Notas de campo                                       │
│    └─ Hallazgos estructurados                              │
│                                                             │
│ 2. GRABACIÓN DE AUDIO (EXISTING - mejorar)                │
│    ├─ Entrevistas (MP3/MP4)                                │
│    ├─ Transcripción automática con Whisper                │
│    ├─ Búsqueda de texto en transcripción                   │
│    └─ Historial de quien grabó/cuándo                      │
│                                                             │
│ 3. CUESTIONARIOS (NEW)                                     │
│    ├─ Plantillas de formularios estandarizados             │
│    ├─ Respuestas vinculadas a caso/cita                    │
│    ├─ Análisis automático de riesgo                        │
│    ├─ Exportar a PDF                                       │
│    └─ Versionado (múltiples cuestionarios)                 │
│                                                             │
│ 4. BÚSQUEDA DE CONOCIMIENTO LEGAL (NEW)                    │
│    ├─ Consultar leyes desde el expediente                  │
│    ├─ Búsqueda por palabras clave                          │
│    ├─ Búsqueda semántica (similar intent)                  │
│    └─ Fragmentos relevantes por caso                       │
│                                                             │
│ 5. GENERADOR DE BORRADORES (EXISTING)                      │
│    ├─ Redacción legal asistida por IA                      │
│    ├─ Informes psicológicos                                │
│    ├─ Informes sociales                                    │
│    └─ Análisis de riesgos                                  │
│                                                             │
│ 6. HERRAMIENTAS DE APOYO (NEW)                             │
│    ├─ Biblioteca de recursos (casos similares)             │
│    ├─ Guías paso a paso                                    │
│    ├─ Plantillas de documentos                             │
│    └─ Alertas legales (cambios en normativa)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 MÓDULOS A CREAR/EXTENDER

### Módulo 1: INSPECTIONS (EXTENDER)

**Ubicación**: `apps/api/src/modules/inspections/`

**Actuales DTOs**:
```typescript
CreateInspectionDto {
  establishmentId: string;
  scheduledAt: string;
  generalNotes?: string;
}
```

**Nuevos DTOs**:
```typescript
// Información de la inspección sorpresa
CreateInspectionSurpriseDto {
  caseId: string;              // ← Vincular a expediente
  establishmentId: string;      // Dónde se hizo
  scheduledAt: string;
  location: {
    latitude: number;           // GPS
    longitude: number;
    address: string;
  };
  generalNotes: string;
  inspectorIds: string[];       // Quiénes fueron
  isSurpriseInspection: boolean; // Bandera especial
}

// Archivo de inspección (foto, video, etc.)
CreateInspectionEvidenceDto {
  inspectionId: string;
  file: Buffer;
  fileName: string;
  mimeType: string;            // image/jpeg, video/mp4, etc.
  description: string;         // "Foto entrada principal"
  evidenceType: "FOTO" | "VIDEO" | "DOCUMENTO";
}

// Hallazgo estructurado
CreateInspectionFindingDto {
  inspectionId: string;
  findingCategory: string;     // "condiciones_higiene", "seguridad", etc.
  severity: "BAJA" | "MEDIA" | "ALTA";
  description: string;
  photosEvidenceIds: string[];  // Vincular a fotos
  nnaCount?: number;
  recommendations: string;
}
```

**Nuevas Tablas en Prisma**:
```prisma
model Inspection {
  id        String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId    String @db.Uuid                    // ← Nuevo: vincular a caso
  case      Case   @relation(fields: [caseId], references: [id])
  
  establishmentId String
  establishment   Establishment @relation(fields: [establishmentId], references: [id])
  
  officeId  String @db.Uuid
  office    Office @relation(fields: [officeId], references: [id])
  
  inspectorIds String[] @db.Uuid              // ← Nuevo: múltiples inspectores
  inspectors   User[]   @relation("InspectionInspectors")
  
  scheduledAt DateTime
  completedAt DateTime?                       // ← Nuevo: cuándo se completó
  
  location  InspectionLocation?               // ← Nuevo: GPS
  
  isSurpriseInspection Boolean @default(false) // ← Nuevo: marca sorpresa
  status    String @default("PROGRAMADA")     // PROGRAMADA, COMPLETADA, CANCELADA
  
  generalNotes String? @db.Text
  
  findings      InspectionFinding[]
  evidenceFiles InspectionEvidenceFile[]      // ← Nuevo: fotos/videos
  
  createdAt DateTime @default(now())
  createdBy String @db.Uuid
  creator   User @relation(fields: [createdBy], references: [id], name: "InspectionCreator")
}

model InspectionLocation {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inspectionId String @db.Uuid @unique
  inspection  Inspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  latitude    Float
  longitude   Float
  address     String
  googleMapsUrl String?
}

model InspectionEvidenceFile {
  id            String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inspectionId  String @db.Uuid
  inspection    Inspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  fileName      String
  mimeType      String
  fileSize      Int
  
  storagePath   String                        // MinIO path
  fileHash      String @unique                // SHA-256
  
  description   String?
  evidenceType  String @db.Enum(["FOTO", "VIDEO", "DOCUMENTO"])
  
  uploadedBy    String @db.Uuid
  uploader      User @relation(fields: [uploadedBy], references: [id])
  
  createdAt     DateTime @default(now())
  
  @@index([inspectionId])
}

model InspectionFinding {
  id            String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inspectionId  String @db.Uuid
  inspection    Inspection @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  findingCategory String    // "condiciones_higiene", "seguridad", "abuso", etc.
  severity      String @db.Enum(["BAJA", "MEDIA", "ALTA"])
  description   String @db.Text
  recommendations String? @db.Text
  
  nnaCount      Int?       // Cuántos NNA afectados
  
  photosEvidenceIds String[] @db.Uuid // Referencias a InspectionEvidenceFile
  
  createdAt     DateTime @default(now())
}
```

---

### Módulo 2: QUESTIONNAIRES (CREAR NUEVO)

**Ubicación**: `apps/api/src/modules/questionnaires/`

**Propósito**: Cuestionarios estandarizados para diferentes disciplinas

**Tablas**:
```prisma
model QuestionnaireTemplate {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  description String?
  category    String @db.Enum(["PSICOLOGICO", "SOCIAL", "JURIDICO", "GENERAL"])
  version     Int @default(1)
  
  questions   Question[]
  responses   QuestionnaireResponse[]
  
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
  createdBy   String @db.Uuid
  creator     User @relation(fields: [createdBy], references: [id])
}

model Question {
  id                  String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  templateId          String @db.Uuid
  template            QuestionnaireTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  
  question            String @db.Text
  questionType        String @db.Enum(["TEXT", "MULTIPLE_CHOICE", "BOOLEAN", "RATING", "DATE"])
  
  order               Int
  required            Boolean @default(true)
  
  // Para preguntas con opciones
  options             String[]? @db.String        // ["Sí", "No", "Tal vez"]
  
  // Para análisis de riesgo
  riskKeywords        String[]?                   // ["abuso", "negligencia"]
  
  answers             Answer[]
}

model QuestionnaireResponse {
  id                  String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  templateId          String @db.Uuid
  template            QuestionnaireTemplate @relation(fields: [templateId], references: [id])
  
  caseId              String @db.Uuid
  case                Case @relation(fields: [caseId], references: [id])
  
  appointmentId       String? @db.Uuid             // Si se hizo en una cita
  appointment         Appointment? @relation(fields: [appointmentId], references: [id])
  
  respondentId        String @db.Uuid              // Quién respondió
  respondent          User @relation(fields: [respondentId], references: [id])
  
  completedAt         DateTime?
  answers             Answer[]
  
  // Análisis automático
  riskFlags           String[]?                   // ["abuso_identificado", "negligencia_media"]
  riskScore           Float? @default(0)
  
  status              String @db.Enum(["PENDIENTE", "COMPLETADA", "REVISADA"])
  
  notes               String? @db.Text
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}

model Answer {
  id                  String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  responseId          String @db.Uuid
  response            QuestionnaireResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)
  
  questionId          String @db.Uuid
  question            Question @relation(fields: [questionId], references: [id])
  
  answer              String @db.Text            // "Sí", "Abuso físico", "5", etc.
  
  createdAt           DateTime @default(now())
}
```

**Controlador**:
```typescript
@ApiTags('Cuestionarios')
@Controller('questionnaires')
export class QuestionnairesController {
  @Get('templates')
  @ApiOperation({ summary: 'Listar cuestionarios disponibles' })
  listTemplates() { }

  @Get('templates/:id')
  @ApiOperation({ summary: 'Obtener preguntas de un cuestionario' })
  getTemplate(@Param('id') id: string) { }

  @Post('responses')
  @ApiOperation({ summary: 'Crear respuesta a cuestionario' })
  createResponse(@Body() dto: CreateResponseDto) { }
  // Respuesta: { id, riskFlags, riskScore }

  @Post('responses/:id/submit')
  @ApiOperation({ summary: 'Enviar cuestionario completado' })
  submitResponse(@Param('id') id: string) { }
  // Ejecuta análisis automático de riesgos

  @Get('responses/:id')
  @ApiOperation({ summary: 'Obtener respuestas completadas' })
  getResponse(@Param('id') id: string) { }
}
```

---

### Módulo 3: KNOWLEDGE - BÚSQUEDA (EXTENDER)

**Ubicación**: `apps/api/src/modules/knowledge/`

**Nuevos Endpoints**:

```typescript
@ApiTags('Base de Conocimiento')
@Controller('knowledge')
export class KnowledgeController {
  
  // NUEVO: Búsqueda semántica
  @Post('search')
  @Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.ADMINISTRADOR, Role.JEFATURA)
  @ApiOperation({ summary: 'Buscar en base legal por similitud semántica' })
  async search(@Body() dto: SearchDto, @CurrentUser('id') userId: string) {
    // dto: { query: string, caseId: string, topK: number = 5 }
    // Retorna: chunks más relevantes con similitud > 0.3
  }

  // NUEVO: Transcribir audio
  @Post('transcribe')
  @Roles(Role.ADMINISTRADOR, Role.JEFATURA, Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL)
  @ApiOperation({ summary: 'Transcribir archivo de audio con Whisper' })
  async transcribe(@Body() dto: TranscribeDto) {
    // dto: { evidenceId: string }
    // Retorna: { id, text, duration, confidence, status }
  }

  // NUEVO: Buscar en transcripciones
  @Post('search-transcriptions')
  @ApiOperation({ summary: 'Buscar dentro de transcripciones' })
  async searchTranscriptions(@Body() dto: SearchTranscriptionsDto) {
    // dto: { query: string, caseId: string }
    // Retorna: transcription matches con timestamps
  }
}
```

**DTOs**:
```typescript
SearchDto {
  query: string;
  caseId?: string;        // Opcional: filtrar por caso
  topK?: number = 5;
  minSimilarity?: number = 0.3;
}

TranscribeDto {
  evidenceId: string;
  languageCode?: string = "es";
}

SearchTranscriptionsDto {
  query: string;
  caseId: string;
}
```

**Nueva Tabla**:
```prisma
model Transcription {
  id          String @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId      String @db.Uuid
  case        Case @relation(fields: [caseId], references: [id])
  
  evidenceId  String @db.Uuid
  evidence    Evidence @relation(fields: [evidenceId], references: [id])
  
  text        String @db.Text
  
  // Metadata
  duration    String?        // "00:15:30"
  confidence  Float @default(0.95)
  language    String @default("es")
  
  // Timestamps (para búsqueda)
  searchIndex String?        // Full-text search index
  
  status      String @db.Enum(["PENDIENTE", "COMPLETADA", "ERROR"])
  errorMessage String?
  
  createdAt   DateTime @default(now())
  createdBy   String @db.Uuid
  creator     User @relation(fields: [createdBy], references: [id])
}
```

---

### Módulo 4: PROFESSIONAL-TOOLS (CREAR - Suite de Utilidades)

**Ubicación**: `apps/api/src/modules/professional-tools/`

**Propósito**: Centro de recursos y herramientas de apoyo

```typescript
@ApiTags('Herramientas para Profesionales')
@Controller('professional-tools')
export class ProfessionalToolsController {

  // 1. Biblioteca de casos similares
  @Post('similar-cases')
  @ApiOperation({ summary: 'Encontrar casos similares para referencia' })
  async findSimilarCases(@Body() dto: { caseId: string, topK: number = 5 }) {
    // Usa embeddings + historial de casos resueltos
  }

  // 2. Guías de procedimiento
  @Get('procedures')
  @ApiOperation({ summary: 'Listar guías paso a paso por disciplina' })
  async getProcedures(@Query('discipline') discipline: string) {
    // Retorna: guías, plantillas, pasos recomendados
  }

  // 3. Alertas legales
  @Get('legal-alerts')
  @ApiOperation({ summary: 'Alertas de cambios en normativa' })
  async getLegalAlerts(@Query('caseType') caseType: string) {
    // Cambios recientes en leyes relevantes
  }

  // 4. Dashboard de indicadores
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Estadísticas personales del profesional' })
  async getStats(@CurrentUser('id') userId: string) {
    // Casos atendidos, tiempos promedio, éxito rate
  }

  // 5. Exportar caso a PDF
  @Post('export-case-to-pdf')
  @ApiOperation({ summary: 'Generar PDF completo del expediente' })
  async exportCasePDF(@Body() dto: { caseId: string }) {
    // Incluye: datos, informes, evidencias, transcripciones
  }
}
```

---

## 🔄 FLUJO INTEGRADO: INSPECCIÓN SORPRESA

```
INICIO: Inspector planifica visita sorpresa

1. CREAR INSPECCIÓN
   ├─ POST /inspections (con isSurpriseInspection=true)
   ├─ Vincular a caseId (NNA bajo vigilancia)
   ├─ Agregar ubicación GPS
   └─ Asignar inspector(es)

2. DURANTE LA VISITA
   ├─ Tomar fotos (múltiples)
   │  └─ POST /inspections/:id/evidence-files
   │     { file, description: "Condición hogar", evidenceType: "FOTO" }
   │
   ├─ Grabar video OPCIONAL (si se autoriza)
   │  └─ POST /inspections/:id/evidence-files
   │     { file, description: "Entrevista NNA", evidenceType: "VIDEO" }
   │
   └─ Completar cuestionario de riesgo
      └─ POST /questionnaires/responses
         { templateId, caseId, answers: [...] }
         ← Análisis automático de riesgos

3. DESPUÉS DE LA VISITA
   ├─ Transcribir video/audio (si existe)
   │  └─ POST /knowledge/transcribe { evidenceId }
   │     ← Buscar en transcripción: "abuso", "negligencia"
   │
   ├─ Registrar hallazgos
   │  └─ POST /inspections/:id/findings
   │     { findingCategory, severity, photosEvidenceIds, nnaCount }
   │
   ├─ Buscar jurisprudencia relacionada
   │  └─ POST /knowledge/search { query: "negligencia patental" }
   │     ← Retorna artículos legales relevantes
   │
   ├─ Generar informe asistido
   │  └─ POST /ai/draft-legal-document
   │     { context: "Resultado inspección sorpresa..." }
   │
   └─ Emitir recomendaciones
      └─ POST /reports
         { reportType: "INFORME_SOCIAL", content: "...", caseId }

FIN: Todo registrado, auditable, con evidencia fotográfica + análisis

```

---

## 📋 TABLA DE IMPLEMENTACIÓN

| Módulo | Tabla(s) | Endpoints | Complejidad | Días |
|--------|----------|-----------|-------------|------|
| **Inspections (extender)** | Inspection, InspectionLocation, InspectionEvidenceFile, InspectionFinding | 6 nuevos | 🟡 Media | 2 |
| **Questionnaires** | QuestionnaireTemplate, Question, QuestionnaireResponse, Answer | 6 nuevos | 🟠 Alta | 3 |
| **Knowledge (extender)** | Transcription (nueva tabla) | 3 nuevos | 🟡 Media | 2 |
| **Professional-Tools** | Ninguna (refiere existentes) | 5 nuevos | 🟢 Baja | 1 |
| **Testing + Documentación** | — | — | 🟡 Media | 2 |

**TOTAL**: ~10 días de trabajo = 2 semanas

---

## 🛠️ STACK NECESARIO

```
✅ Ollama (ya existe)
├─ nomic-embed-text (embeddings)
├─ qwen2.5:7b (LLM)
└─ Whisper (transcripción) ← Configurado, sin usar

✅ PostgreSQL + pgvector
├─ Búsqueda vectorial (embeddings)
└─ Full-text search (transcripciones)

✅ MinIO (ya existe)
├─ Almacenamiento de fotos
└─ Almacenamiento de videos

✅ Frontend UI
├─ Cámara para fotos (mobile)
├─ Visor de fotos/videos
└─ Formularios interactivos
```

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

1. **Sensibilidad de datos**: Fotos de NNA = datos sensibles
   - Campo `isSensitive` en Evidence
   - Token de seguridad para acceso
   - RLS por officeId

2. **Integridad de evidencia**: Cadena de custodia
   - SHA-256 hash en todos los archivos
   - Audit trail completo
   - Firma digital (opcional)

3. **Privacidad**: Transcripciones
   - Cifradas en MinIO
   - Acceso solo a profesionales del caso
   - Opción de anonimizar nombres

---

## 📊 EJEMPLO DE CASO COMPLETO

**NNA**: María García (8 años)  
**Caso**: Sospecha de negligencia  
**Inspector**: Luis Martínez  

### Día 1: Inspección Sorpresa

```javascript
// 1. Crear inspección
POST /inspections
{
  caseId: "uuid-maria",
  establishmentId: "uuid-hogar",
  isSurpriseInspection: true,
  location: { latitude: -19.0432, longitude: -65.2537, address: "Calle X, Sucre" },
  inspectorIds: ["uuid-luis"],
  generalNotes: "Visita no anunciada por reportes de vecinos"
}
→ inspectionId: "insp-001"

// 2. Subir fotos
POST /inspections/insp-001/evidence-files
{ file: <foto-cocina>, description: "Cocina sin alimentos", evidenceType: "FOTO" }
POST /inspections/insp-001/evidence-files
{ file: <foto-cuarto>, description: "Cuarto con humedad", evidenceType: "FOTO" }

// 3. Completar cuestionario
POST /questionnaires/responses
{
  templateId: "template-negligencia",
  caseId: "uuid-maria",
  answers: [
    { questionId: "q1", answer: "No hay acceso a agua potable" },
    { questionId: "q2", answer: "Hogar sin electricidad" },
    { questionId: "q3", answer: "No hay alimentos suficientes" }
  ]
}
→ { riskScore: 8.5, riskFlags: ["NEGLIGENCIA_GRAVE"] }

// 4. Registrar hallazgos
POST /inspections/insp-001/findings
{
  findingCategory: "condiciones_vida",
  severity: "ALTA",
  description: "Vivienda en condiciones insalubres",
  photosEvidenceIds: ["uuid-foto1", "uuid-foto2"],
  nnaCount: 1,
  recommendations: "Intervención inmediata, posible derivación a hogar"
}
```

### Día 2: Generación de Informe

```javascript
// 5. Buscar jurisprudencia
POST /knowledge/search
{
  query: "negligencia parental medidas protección",
  caseId: "uuid-maria",
  topK: 5
}
→ Retorna Artículos 102, 104 de Ley 548

// 6. Generar borrador
POST /ai/draft-legal-document
{
  context: "Inspección sorpresa reveló negligencia grave. Fotos anexas. Cuestionario mostró riesgo ALTO."
}
→ Borrador completo con estructura jurídica

// 7. Emitir informe
POST /reports
{
  caseId: "uuid-maria",
  reportType: "INFORME_SOCIAL",
  title: "Informe Inspección Sorpresa - Negligencia Parental",
  content: "<borrador revisado>",
  riskAssessment: "ALTO"
}
→ reportId: "rep-001"

// 8. Congelar informe
POST /reports/rep-001/emit
→ Status: "EMITIDO"

// 9. Exportar caso
POST /professional-tools/export-case-to-pdf
{ caseId: "uuid-maria" }
→ PDF con: datos, fotos, cuestionario, informe, análisis legal
```

---

## 📞 PRÓXIMOS PASOS

1. **Aprobación de arquitectura** (esta propuesta)
2. **Crear migraciones Prisma** (nuevas tablas)
3. **Implementar Inspections extendido** (fotos + GPS)
4. **Implementar Questionnaires** (módulo completo)
5. **Implementar Knowledge búsqueda** (Whisper + RAG)
6. **Implementar Professional-Tools** (suite de apoyo)
7. **Testing E2E** (flujo completo)
8. **Documentación para agentes**

---

**Generado por**: Kiro Agente Senior  
**Estado**: LISTO PARA IMPLEMENTACIÓN  
**Requisitos cumplidos**: Fotos, videos, transcripción, cuestionarios, búsqueda legal, herramientas de apoyo
