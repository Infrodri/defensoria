-- AlterEnum
ALTER TYPE "TranscriptionTaskStatus" ADD VALUE 'PROCESSING';

-- DropIndex
DROP INDEX "document_templates_documentType_key";

-- DropIndex
DROP INDEX "instruments_documentTemplateId_idx";

-- AlterTable
ALTER TABLE "appointments" ALTER COLUMN "status" SET DEFAULT 'PROPUESTA';

-- AlterTable
ALTER TABLE "case_parties" ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "relationship" TEXT;

-- AlterTable
ALTER TABLE "case_team_histories" ADD COLUMN     "completedSessions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isInterventionFinished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "requiredSessions" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "cases" DROP COLUMN "complainantAddress",
DROP COLUMN "complainantDocumentId",
DROP COLUMN "complainantFullName",
DROP COLUMN "complainantPhone",
DROP COLUMN "complainantRelation",
DROP COLUMN "isThirdPartyComplainant",
DROP COLUMN "nnaAddress",
DROP COLUMN "nnaBirthDate",
DROP COLUMN "nnaCity",
DROP COLUMN "nnaGender",
DROP COLUMN "nnaPhone",
ADD COLUMN     "hasVisibleInjuries" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "incidentFrequency" "IncidentFrequency" NOT NULL DEFAULT 'PRIMERA_VEZ',
ADD COLUMN     "intakeChannel" "IntakeChannel" NOT NULL DEFAULT 'DIRECTO',
ADD COLUMN     "isUrgent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "document_templates" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "content" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "requiresCoAuthor" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetRole" "Role" NOT NULL,
ADD COLUMN     "templateFilePath" TEXT;

-- AlterTable
ALTER TABLE "evidences" ADD COLUMN     "ragError" TEXT,
ADD COLUMN     "ragProcessedAt" TIMESTAMPTZ(6),
ADD COLUMN     "ragStatus" "RagProcessingStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "instruments" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "templateFilePath" TEXT;

-- CreateTable
CREATE TABLE "case_nna_contexts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "casePartyId" UUID NOT NULL,
    "schoolGrade" TEXT,
    "schoolName" TEXT,
    "livesWithDescription" TEXT,
    "estimatedAge" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_nna_contexts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_scale_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "transcriptionId" UUID NOT NULL,
    "scaleResults" JSONB NOT NULL,
    "pendingValidations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "analyzedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzedBy" UUID NOT NULL,

    CONSTRAINT "risk_scale_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clinical_translations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "originalText" TEXT NOT NULL,
    "translatedText" TEXT NOT NULL,
    "terminology" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "clinical_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trauma_analyses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "indicadores" JSONB NOT NULL,
    "patronExposicion" TEXT NOT NULL,
    "cronicidad" TEXT NOT NULL,
    "hipotesisClinica" TEXT NOT NULL,
    "recomendaciones" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "advertencia" TEXT,
    "analyzedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzedBy" UUID NOT NULL,

    CONSTRAINT "trauma_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "environmental_mappings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "transcriptionId" UUID NOT NULL,
    "factoresRiesgo" JSONB NOT NULL,
    "recomendaciones" JSONB NOT NULL,
    "notaMetodologica" TEXT,
    "analyzedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "analyzedBy" UUID NOT NULL,

    CONSTRAINT "environmental_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "case_nna_contexts_casePartyId_key" ON "case_nna_contexts"("casePartyId");

-- CreateIndex
CREATE INDEX "risk_scale_analyses_caseId_idx" ON "risk_scale_analyses"("caseId");

-- CreateIndex
CREATE INDEX "risk_scale_analyses_analyzedAt_idx" ON "risk_scale_analyses"("analyzedAt");

-- CreateIndex
CREATE INDEX "clinical_translations_caseId_idx" ON "clinical_translations"("caseId");

-- CreateIndex
CREATE INDEX "trauma_analyses_caseId_idx" ON "trauma_analyses"("caseId");

-- CreateIndex
CREATE INDEX "trauma_analyses_analyzedAt_idx" ON "trauma_analyses"("analyzedAt");

-- CreateIndex
CREATE INDEX "environmental_mappings_caseId_idx" ON "environmental_mappings"("caseId");

-- CreateIndex
CREATE INDEX "environmental_mappings_analyzedAt_idx" ON "environmental_mappings"("analyzedAt");

-- CreateIndex
CREATE UNIQUE INDEX "document_templates_code_key" ON "document_templates"("code");

-- CreateIndex
CREATE INDEX "persons_documentType_documentNumber_idx" ON "persons"("documentType", "documentNumber");

-- AddForeignKey
ALTER TABLE "case_nna_contexts" ADD CONSTRAINT "case_nna_contexts_casePartyId_fkey" FOREIGN KEY ("casePartyId") REFERENCES "case_parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_scale_analyses" ADD CONSTRAINT "risk_scale_analyses_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_scale_analyses" ADD CONSTRAINT "risk_scale_analyses_transcriptionId_fkey" FOREIGN KEY ("transcriptionId") REFERENCES "transcriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_scale_analyses" ADD CONSTRAINT "risk_scale_analyses_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_translations" ADD CONSTRAINT "clinical_translations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_translations" ADD CONSTRAINT "clinical_translations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trauma_analyses" ADD CONSTRAINT "trauma_analyses_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trauma_analyses" ADD CONSTRAINT "trauma_analyses_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_mappings" ADD CONSTRAINT "environmental_mappings_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_mappings" ADD CONSTRAINT "environmental_mappings_transcriptionId_fkey" FOREIGN KEY ("transcriptionId") REFERENCES "transcriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "environmental_mappings" ADD CONSTRAINT "environmental_mappings_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
