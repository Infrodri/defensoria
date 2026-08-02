-- CreateEnum
CREATE TYPE "InspectionEvidenceType" AS ENUM ('FOTO', 'VIDEO', 'DOCUMENTO');
CREATE TYPE "InspectionSeverity" AS ENUM ('BAJA', 'MEDIA', 'ALTA');
CREATE TYPE "QuestionnaireCategory" AS ENUM ('PSICOLOGICO', 'SOCIAL', 'JURIDICO', 'GENERAL');
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'MULTIPLE_CHOICE', 'BOOLEAN', 'RATING', 'DATE');
CREATE TYPE "QuestionnaireResponseStatus" AS ENUM ('PENDIENTE', 'COMPLETADA', 'REVISADA');
CREATE TYPE "TranscriptionTaskStatus" AS ENUM ('PENDIENTE', 'COMPLETADA', 'ERROR');

-- Extender tabla Inspection con nuevos campos
ALTER TABLE "Inspection" ADD COLUMN "caseId" UUID;
ALTER TABLE "Inspection" ADD COLUMN "completedAt" TIMESTAMP;
ALTER TABLE "Inspection" ADD COLUMN "isSurpriseInspection" BOOLEAN DEFAULT false;
ALTER TABLE "Inspection" ADD COLUMN "inspectorIds" UUID[] DEFAULT '{}';
ALTER TABLE "Inspection" ADD COLUMN "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Inspection" ADD COLUMN "createdBy" UUID;

-- Agregar relación de Inspection a Case
ALTER TABLE "Inspection" ADD CONSTRAINT "fk_inspection_case" 
  FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL;

-- Agregar índice a Inspection
CREATE INDEX "idx_inspection_case_id" ON "Inspection"("caseId");

-- Crear tabla InspectionLocation (GPS)
CREATE TABLE "inspection_locations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "inspectionId" UUID NOT NULL UNIQUE,
  "latitude" FLOAT NOT NULL,
  "longitude" FLOAT NOT NULL,
  "address" VARCHAR(500),
  "googleMapsUrl" VARCHAR(500),
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE
);

-- Crear tabla InspectionEvidenceFile
CREATE TABLE "inspection_evidence_files" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "inspectionId" UUID NOT NULL,
  "fileName" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(50) NOT NULL,
  "fileSize" INTEGER NOT NULL,
  "storagePath" VARCHAR(500) NOT NULL,
  "fileHash" VARCHAR(64) UNIQUE NOT NULL,
  "description" VARCHAR(500),
  "evidenceType" "InspectionEvidenceType" NOT NULL,
  "uploadedBy" UUID NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE,
  FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT
);
CREATE INDEX "idx_inspection_evidence_files_inspection" ON "inspection_evidence_files"("inspectionId");

-- Crear tabla InspectionFinding mejorada
CREATE TABLE "inspection_findings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "inspectionId" UUID NOT NULL,
  "findingCategory" VARCHAR(100) NOT NULL,
  "severity" "InspectionSeverity" NOT NULL,
  "description" TEXT NOT NULL,
  "recommendations" TEXT,
  "nnaCount" INTEGER,
  "photosEvidenceIds" UUID[] DEFAULT '{}',
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("inspectionId") REFERENCES "Inspection"("id") ON DELETE CASCADE
);

-- Crear tabla QuestionnaireTemplate
CREATE TABLE "questionnaire_templates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "description" TEXT,
  "category" "QuestionnaireCategory" NOT NULL,
  "version" INTEGER DEFAULT 1,
  "isActive" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT
);

-- Crear tabla Question
CREATE TABLE "questions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "templateId" UUID NOT NULL,
  "question" TEXT NOT NULL,
  "questionType" "QuestionType" NOT NULL,
  "order" INTEGER NOT NULL,
  "required" BOOLEAN DEFAULT true,
  "options" VARCHAR(255)[],
  "riskKeywords" VARCHAR(100)[],
  FOREIGN KEY ("templateId") REFERENCES "questionnaire_templates"("id") ON DELETE CASCADE
);

-- Crear tabla QuestionnaireResponse
CREATE TABLE "questionnaire_responses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "templateId" UUID NOT NULL,
  "caseId" UUID NOT NULL,
  "appointmentId" UUID,
  "respondentId" UUID NOT NULL,
  "completedAt" TIMESTAMP,
  "riskFlags" VARCHAR(100)[],
  "riskScore" FLOAT DEFAULT 0,
  "status" "QuestionnaireResponseStatus" DEFAULT 'PENDIENTE',
  "notes" TEXT,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("templateId") REFERENCES "questionnaire_templates"("id") ON DELETE RESTRICT,
  FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE,
  FOREIGN KEY ("appointmentId") REFERENCES "appointments"("id") ON DELETE SET NULL,
  FOREIGN KEY ("respondentId") REFERENCES "users"("id") ON DELETE RESTRICT
);

-- Crear tabla Answer
CREATE TABLE "answers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "responseId" UUID NOT NULL,
  "questionId" UUID NOT NULL,
  "answer" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("responseId") REFERENCES "questionnaire_responses"("id") ON DELETE CASCADE,
  FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT
);

-- Crear tabla Transcription
CREATE TABLE "transcriptions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "caseId" UUID NOT NULL,
  "evidenceId" UUID NOT NULL,
  "text" TEXT NOT NULL,
  "duration" VARCHAR(50),
  "confidence" FLOAT DEFAULT 0.95,
  "language" VARCHAR(10) DEFAULT 'es',
  "searchIndex" TEXT,
  "status" "TranscriptionTaskStatus" DEFAULT 'PENDIENTE',
  "errorMessage" VARCHAR(500),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "createdBy" UUID NOT NULL,
  FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE,
  FOREIGN KEY ("evidenceId") REFERENCES "evidences"("id") ON DELETE CASCADE,
  FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT
);

-- Crear índices full-text para búsqueda de transcripciones
CREATE INDEX "idx_transcription_text_search" ON "transcriptions" USING GIN(to_tsvector('spanish', text));

-- Actualizar relaciones en Inspection (eliminar tabla antigua si existe)
DROP TABLE IF EXISTS "InspectionFinding";

-- Crear índices para rendimiento
CREATE INDEX "idx_questionnaire_responses_case_id" ON "questionnaire_responses"("caseId");
CREATE INDEX "idx_questionnaire_responses_status" ON "questionnaire_responses"("status");
CREATE INDEX "idx_inspection_location_unique" ON "inspection_locations"("inspectionId");
