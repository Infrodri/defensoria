# Plan de Implementación: Herramientas de Profesionales

**Objetivo**: Implementar suite completa en 2 semanas  
**Fecha Inicio**: Después de aprobación  
**Equipo**: 1-2 desarrolladores Backend + 1 Frontend

---

## 📅 TIMELINE: 2 Semanas

### SEMANA 1

#### DÍA 1: Setup y Migraciones (4 horas)

**1. Crear migraciones Prisma**
```bash
cd packages/db
npx prisma migrate dev --name "add_inspections_questionnaires_transcriptions"
```

**Archivo**: `packages/db/prisma/migrations/[timestamp]_add_herramientas/migration.sql`

```sql
-- Tabla Inspections mejorada
ALTER TABLE "Inspection" ADD COLUMN "caseId" UUID;
ALTER TABLE "Inspection" ADD COLUMN "completedAt" TIMESTAMP;
ALTER TABLE "Inspection" ADD COLUMN "isSurpriseInspection" BOOLEAN DEFAULT false;
ALTER TABLE "Inspection" ADD COLUMN "inspectorIds" UUID[] DEFAULT '{}';
ALTER TABLE "Inspection" ALTER COLUMN "status" TYPE VARCHAR(50);

-- Tabla GPS de inspecciones
CREATE TABLE "InspectionLocation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "inspectionId" UUID NOT NULL UNIQUE,
  "latitude" FLOAT NOT NULL,
  "longitude" FLOAT NOT NULL,
  "address" VARCHAR(500),
  "googleMapsUrl" VARCHAR(500),
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE
);

-- Archivos de evidencia de inspección
CREATE TABLE "InspectionEvidenceFile" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "inspectionId" UUID NOT NULL,
  "fileName" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(50) NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "storagePath" VARCHAR(500) NOT NULL,
  "fileHash" VARCHAR(64) UNIQUE NOT NULL,
  "description" VARCHAR(500),
  "evidenceType" VARCHAR(20) CHECK (evidenceType IN ('FOTO', 'VIDEO', 'DOCUMENTO')),
  "uploadedBy" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE,
  FOREIGN KEY ("uploadedBy") REFERENCES "User"("id")
);
CREATE INDEX "idx_InspectionEvidenceFile_inspectionId" ON "InspectionEvidenceFile"("inspectionId");

-- Hallazgos estructurados
CREATE TABLE "InspectionFinding" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "inspectionId" UUID NOT NULL,
  "findingCategory" VARCHAR(100) NOT NULL,
  "severity" VARCHAR(10) CHECK (severity IN ('BAJA', 'MEDIA', 'ALTA')),
  "description" TEXT NOT NULL,
  "recommendations" TEXT,
  "nnaCount" INTEGER,
  "photosEvidenceIds" UUID[],
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE
);

-- Plantillas de cuestionarios
CREATE TABLE "QuestionnaireTemplate" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" VARCHAR(50) CHECK (category IN ('PSICOLOGICO', 'SOCIAL', 'JURIDICO', 'GENERAL')),
  "version" INTEGER DEFAULT 1,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "createdBy" UUID NOT NULL,
  FOREIGN KEY ("createdBy") REFERENCES "User"("id")
);

-- Preguntas
CREATE TABLE "Question" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "templateId" UUID NOT NULL,
  "question" TEXT NOT NULL,
  "questionType" VARCHAR(50) CHECK (questionType IN ('TEXT', 'MULTIPLE_CHOICE', 'BOOLEAN', 'RATING', 'DATE')),
  "order" INTEGER NOT NULL,
  "required" BOOLEAN DEFAULT true,
  "options" VARCHAR(255)[],
  "riskKeywords" VARCHAR(100)[],
  FOREIGN KEY ("templateId") REFERENCES "QuestionnaireTemplate"("id") ON DELETE CASCADE
);

-- Respuestas a cuestionarios
CREATE TABLE "QuestionnaireResponse" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "templateId" UUID NOT NULL,
  "caseId" UUID NOT NULL,
  "appointmentId" UUID,
  "respondentId" UUID NOT NULL,
  "completedAt" TIMESTAMP,
  "riskFlags" VARCHAR(100)[],
  "riskScore" FLOAT DEFAULT 0,
  "status" VARCHAR(50) CHECK (status IN ('PENDIENTE', 'COMPLETADA', 'REVISADA')),
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("templateId") REFERENCES "QuestionnaireTemplate"("id"),
  FOREIGN KEY ("caseId") REFERENCES "Case"("id"),
  FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id"),
  FOREIGN KEY ("respondentId") REFERENCES "User"("id")
);

-- Respuestas individuales
CREATE TABLE "Answer" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "responseId" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "answer" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY ("responseId") REFERENCES "QuestionnaireResponse"("id") ON DELETE CASCADE,
  FOREIGN KEY ("questionId") REFERENCES "Question"("id")
);

-- Transcripciones
CREATE TABLE "Transcription" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "caseId" UUID NOT NULL,
  "evidenceId" UUID NOT NULL,
  "text" TEXT NOT NULL,
  "duration" VARCHAR(50),
  "confidence" FLOAT DEFAULT 0.95,
  "language" VARCHAR(10) DEFAULT 'es',
  "searchIndex" TEXT,
  "status" VARCHAR(50) CHECK (status IN ('PENDIENTE', 'COMPLETADA', 'ERROR')),
  "errorMessage" VARCHAR(500),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "createdBy" UUID NOT NULL,
  FOREIGN KEY ("caseId") REFERENCES "Case"("id"),
  FOREIGN KEY ("evidenceId") REFERENCES "Evidence"("id"),
  FOREIGN KEY ("createdBy") REFERENCES "User"("id")
);

-- Crear índices full-text para búsqueda
CREATE INDEX "idx_Transcription_text_search" ON "Transcription" USING GIN(to_tsvector('spanish', text));
CREATE INDEX "idx_LegalChunk_text_search" ON "legal_chunks" USING GIN(to_tsvector('spanish', content));
```

**2. Actualizar Prisma schema**

**Archivo**: `packages/db/prisma/schema.prisma`

```prisma
model Inspection {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId                String?     @db.Uuid                    // ← Nuevo
  case                  Case?       @relation(fields: [caseId], references: [id])
  
  establishmentId       String
  establishment         Establishment @relation(fields: [establishmentId], references: [id])
  
  officeId              String      @db.Uuid
  office                Office      @relation(fields: [officeId], references: [id])
  
  inspectorIds          String[]    @db.Uuid                    // ← Nuevo: array
  inspectors            User[]      @relation("InspectionInspectors")
  
  scheduledAt           DateTime
  completedAt           DateTime?                               // ← Nuevo
  
  location              InspectionLocation?                     // ← Nuevo
  isSurpriseInspection  Boolean     @default(false)             // ← Nuevo
  status                String      @default("PROGRAMADA")
  
  generalNotes          String?     @db.Text
  
  findings              InspectionFinding[]
  evidenceFiles         InspectionEvidenceFile[]                // ← Nuevo
  
  createdAt             DateTime    @default(now())
  createdBy             String      @db.Uuid
  creator               User        @relation("InspectionCreator", fields: [createdBy], references: [id])
  
  @@index([caseId])
}

model InspectionLocation {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inspectionId String     @db.Uuid @unique
  inspection  Inspection  @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  latitude    Float
  longitude   Float
  address     String
  googleMapsUrl String?
}

model InspectionEvidenceFile {
  id            String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inspectionId  String      @db.Uuid
  inspection    Inspection  @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  fileName      String
  mimeType      String
  fileSize      Int
  
  storagePath   String
  fileHash      String      @unique
  
  description   String?
  evidenceType  String      @db.Enum(["FOTO", "VIDEO", "DOCUMENTO"])
  
  uploadedBy    String      @db.Uuid
  uploader      User        @relation(fields: [uploadedBy], references: [id])
  
  createdAt     DateTime    @default(now())
  
  @@index([inspectionId])
}

model InspectionFinding {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  inspectionId          String      @db.Uuid
  inspection            Inspection  @relation(fields: [inspectionId], references: [id], onDelete: Cascade)
  
  findingCategory       String
  severity              String      @db.Enum(["BAJA", "MEDIA", "ALTA"])
  description           String      @db.Text
  recommendations       String?     @db.Text
  
  nnaCount              Int?
  photosEvidenceIds     String[]    @db.Uuid
  
  createdAt             DateTime    @default(now())
}

model QuestionnaireTemplate {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String
  description String?
  category    String      @db.Enum(["PSICOLOGICO", "SOCIAL", "JURIDICO", "GENERAL"])
  version     Int         @default(1)
  
  questions   Question[]
  responses   QuestionnaireResponse[]
  
  isActive    Boolean     @default(true)
  createdAt   DateTime    @default(now())
  createdBy   String      @db.Uuid
  creator     User        @relation(fields: [createdBy], references: [id])
}

model Question {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  templateId            String      @db.Uuid
  template              QuestionnaireTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  
  question              String      @db.Text
  questionType          String      @db.Enum(["TEXT", "MULTIPLE_CHOICE", "BOOLEAN", "RATING", "DATE"])
  
  order                 Int
  required              Boolean     @default(true)
  
  options               String[]?
  riskKeywords          String[]?
  
  answers               Answer[]
}

model QuestionnaireResponse {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  templateId            String      @db.Uuid
  template              QuestionnaireTemplate @relation(fields: [templateId], references: [id])
  
  caseId                String      @db.Uuid
  case                  Case        @relation(fields: [caseId], references: [id])
  
  appointmentId         String?     @db.Uuid
  appointment           Appointment? @relation(fields: [appointmentId], references: [id])
  
  respondentId          String      @db.Uuid
  respondent            User        @relation(fields: [respondentId], references: [id])
  
  completedAt           DateTime?
  answers               Answer[]
  
  riskFlags             String[]?
  riskScore             Float?      @default(0)
  
  status                String      @db.Enum(["PENDIENTE", "COMPLETADA", "REVISADA"])
  notes                 String?     @db.Text
  
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt
}

model Answer {
  id                    String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  responseId            String      @db.Uuid
  response              QuestionnaireResponse @relation(fields: [responseId], references: [id], onDelete: Cascade)
  
  questionId            String      @db.Uuid
  question              Question    @relation(fields: [questionId], references: [id])
  
  answer                String      @db.Text
  
  createdAt             DateTime    @default(now())
}

model Transcription {
  id          String      @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  caseId      String      @db.Uuid
  case        Case        @relation(fields: [caseId], references: [id])
  
  evidenceId  String      @db.Uuid
  evidence    Evidence    @relation(fields: [evidenceId], references: [id])
  
  text        String      @db.Text
  
  duration    String?
  confidence  Float       @default(0.95)
  language    String      @default("es")
  
  searchIndex String?
  
  status      String      @db.Enum(["PENDIENTE", "COMPLETADA", "ERROR"])
  errorMessage String?
  
  createdAt   DateTime    @default(now())
  createdBy   String      @db.Uuid
  creator     User        @relation(fields: [createdBy], references: [id])
}

// Relaciones en Case
model Case {
  // ... fields existentes ...
  
  inspections         Inspection[]                    // ← Nuevo
  questionnaires      QuestionnaireResponse[]         // ← Nuevo
  transcriptions      Transcription[]                 // ← Nuevo
}

// Relaciones en Appointment
model Appointment {
  // ... fields existentes ...
  
  questionnaires      QuestionnaireResponse[]         // ← Nuevo
}

// Relaciones en User
model User {
  // ... fields existentes ...
  
  inspectionsCreated  Inspection[]        @relation("InspectionCreator")
  inspectionsAssigned Inspection[]        @relation("InspectionInspectors")
  questionnairesCreated QuestionnaireTemplate[]
  questionnairesAnswered QuestionnaireResponse[]
  transcriptionsCreated Transcription[]
}

// Relaciones en Evidence
model Evidence {
  // ... fields existentes ...
  
  transcriptions      Transcription[]                 // ← Nuevo
}
```

#### DÍA 2-3: Módulos Inspections (8 horas)

**1. Extender Inspections Controller**

**Archivo**: `apps/api/src/modules/inspections/inspections.controller.ts`

```typescript
@Post(':id/evidence-files')
@UseInterceptors(FileInterceptor('file'))
@ApiConsumes('multipart/form-data')
async uploadEvidenceFile(
  @Param('id') inspectionId: string,
  @UploadedFile() file: Express.Multer.File,
  @Body('description') description: string,
  @Body('evidenceType') evidenceType: string,
  @CurrentUser('id') userId: string,
) {
  // Llamar a service
}

@Get(':id/evidence-files')
async getEvidenceFiles(@Param('id') inspectionId: string) {
  // Listar fotos/videos
}

@Post(':id/location')
async addLocation(
  @Param('id') inspectionId: string,
  @Body() dto: { latitude: number, longitude: number, address: string },
) {
  // Agregar GPS
}

@Post(':id/findings')
async addFinding(
  @Param('id') inspectionId: string,
  @Body() dto: CreateInspectionFindingDto,
) {
  // Crear hallazgo estructurado
}

@Patch(':id/complete')
async completeInspection(@Param('id') inspectionId: string) {
  // Marcar como completada + trigger análisis automático
}
```

**2. Extender Inspections Service**

```typescript
async uploadEvidenceFile(
  inspectionId: string,
  file: Express.Multer.File,
  userId: string,
  description: string,
  evidenceType: string,
) {
  // 1. Validar
  // 2. Calcular SHA-256
  // 3. Guardar en MinIO
  // 4. Registrar en DB
}

async addLocation(inspectionId: string, dto: LocationDto) {
  // Geocoding inverso (opcional)
  // Guardar en DB
}
```

#### DÍA 4: Módulo Questionnaires (6 horas)

**1. Crear Questionnaires Module**

```bash
cd apps/api
nest generate module modules/questionnaires
nest generate service modules/questionnaires
nest generate controller modules/questionnaires
```

**2. Implementar Questionnaires Service**

```typescript
// Listar templates
async listTemplates(category?: string) { }

// Obtener preguntas
async getTemplate(templateId: string) { }

// Crear respuesta
async createResponse(dto: CreateResponseDto, userId: string) { }

// Análisis automático de riesgo
async analyzeRisk(responseId: string) {
  // Buscar riskKeywords en respuestas
  // Calcular riskScore
  // Llenar riskFlags
}

// Completar respuesta
async submitResponse(responseId: string) {
  // Marcar como COMPLETADA
  // Ejecutar análisis
}
```

**3. Implementar Questionnaires Controller**

```typescript
@Post('templates')
@Roles(Role.ADMINISTRADOR)
async createTemplate(@Body() dto: CreateTemplateDto) { }

@Get('templates')
async listTemplates(@Query('category') category?: string) { }

@Get('templates/:id')
async getTemplate(@Param('id') id: string) { }

@Post('responses')
async createResponse(@Body() dto: CreateResponseDto, @CurrentUser('id') userId: string) { }

@Post('responses/:id/answer')
async addAnswer(@Param('id') responseId: string, @Body() dto: AddAnswerDto) { }

@Post('responses/:id/submit')
async submitResponse(@Param('id') responseId: string) { }

@Get('responses/:id')
async getResponse(@Param('id') responseId: string) { }

@Post('responses/:id/export-pdf')
async exportPDF(@Param('id') responseId: string) { }
```

#### DÍA 5: Módulo Knowledge - Búsqueda (8 horas)

**1. Extender Knowledge Service**

```typescript
async searchSemantic(query: string, caseId?: string, topK: number = 5) {
  // 1. Generar embedding del query
  const embedding = await this.embeddings.getEmbedding(query);
  
  // 2. Búsqueda en pgvector
  const results = await this.prisma.$queryRaw`
    SELECT 
      id, 
      content, 
      metadata,
      1 - (embedding <=> $1::vector) as similarity
    FROM legal_chunks
    WHERE 1 - (embedding <=> $1::vector) > 0.3
      AND legalDocumentId IN (
        SELECT id FROM legal_documents WHERE isActive = true
      )
    ORDER BY similarity DESC
    LIMIT $2
  `;
  
  return results;
}

async transcribeAudio(evidenceId: string, userId: string) {
  // 1. Obtener archivo de MinIO
  // 2. Llamar a Whisper
  // 3. Guardar transcripción
  // 4. Indexar para búsqueda full-text
}

async searchTranscriptions(query: string, caseId: string) {
  // Búsqueda full-text en transcripciones
}
```

**2. Extender Knowledge Controller**

```typescript
@Post('search')
async search(@Body() dto: SearchDto) { }

@Post('transcribe')
async transcribe(@Body() dto: TranscribeDto) { }

@Post('search-transcriptions')
async searchTranscriptions(@Body() dto: SearchTranscriptionsDto) { }
```

---

### SEMANA 2

#### DÍA 6-7: Módulo Professional-Tools (8 horas)

**1. Crear Professional-Tools Module**

```typescript
@Post('similar-cases')
async findSimilarCases(@Body() dto: { caseId: string }) { }

@Get('procedures')
async getProcedures(@Query('discipline') discipline: string) { }

@Get('legal-alerts')
async getLegalAlerts(@Query('caseType') caseType: string) { }

@Get('dashboard/stats')
async getStats(@CurrentUser('id') userId: string) { }

@Post('export-case-to-pdf')
async exportCaseToPDF(@Body() dto: { caseId: string }) { }
```

#### DÍA 8: Frontend - UI para Inspecciones (8 horas)

**1. Componentes React**

```typescript
// InspectionSurpriseForm.tsx
// - Fotografías (múltiples)
// - GPS (latitude/longitude)
// - Cuestionario dinámico
// - Hallazgos estructurados

// TranscriptionViewer.tsx
// - Mostrar transcripción
// - Búsqueda dentro del texto
// - Timestamps

// QuestionnaireForm.tsx
// - Preguntas dinámicas
// - Análisis automático en tiempo real
```

#### DÍA 9: Testing E2E (6 horas)

**1. Tests**
```typescript
// inspections.e2e-spec.ts
// questionnaires.e2e-spec.ts
// knowledge-search.e2e-spec.ts
// professional-tools.e2e-spec.ts
```

#### DÍA 10: Documentación + Deploy (4 horas)

**1. Documentación**
- Actualizar `agentes-ia/INSTRUCCIONES-AGENTES.md`
- Crear guías de usuario

**2. Deploy**
- Migraciones a producción
- Pruebas en staging

---

## 🚀 SEED DATA

**Archivo**: `packages/db/prisma/seed.ts`

```typescript
// Agregar cuestionarios de ejemplo
async function seedQuestionnaires(prisma) {
  // Template: "Evaluación de Negligencia"
  const template = await prisma.questionnaireTemplate.create({
    data: {
      name: "Evaluación de Negligencia",
      category: "SOCIAL",
      version: 1,
      createdBy: admin.id,
      questions: {
        create: [
          {
            question: "¿Tiene el NNA acceso a agua potable?",
            questionType: "BOOLEAN",
            order: 1,
            riskKeywords: ["sin agua", "negligencia"],
          },
          {
            question: "¿Hay alimentos suficientes en el hogar?",
            questionType: "BOOLEAN",
            order: 2,
            riskKeywords: ["hambre", "desnutrición"],
          },
          // ...
        ]
      }
    }
  });
}
```

---

## ✅ CHECKLIST DE ENTREGA

- [ ] Migraciones Prisma ejecutadas
- [ ] Módulos Inspections extendido
- [ ] Módulo Questionnaires completo
- [ ] Módulo Knowledge búsqueda funcional
- [ ] Módulo Professional-Tools funcional
- [ ] Frontend: Componentes de inspección
- [ ] Frontend: Visor de transcripciones
- [ ] Testing E2E completado
- [ ] Documentación actualizada
- [ ] Deploy a staging exitoso

---

**Estimado total**: 10 días  
**Equipo**: 1-2 personas  
**Start date**: TBD  
**Expected deployment**: +10 días desde inicio

