-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'REPROGRAMADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "InspectionFindingCategory" AS ENUM ('TRABAJO_INFANTIL_PROHIBIDO', 'TRABAJO_ADOLESCENTE_NO_AUTORIZADO', 'EXPLOTACION_LABORAL_O_MULTA', 'NNA_SITUACION_DE_CALLE', 'SIN_NOVEDAD', 'OTRA_VULNERACION');

-- CreateEnum
CREATE TYPE "CaseDeactivationStatus" AS ENUM ('PENDING', 'REVIEWED', 'APPROVED');

-- AlterEnum: add 4 new CaseType values
ALTER TYPE "CaseType" ADD VALUE 'VIOLENCIA_SEXUAL';
ALTER TYPE "CaseType" ADD VALUE 'VIOLENCIA_DIGITAL';
ALTER TYPE "CaseType" ADD VALUE 'SITUACION_CALLE';
ALTER TYPE "CaseType" ADD VALUE 'TRABAJO_ADOLESCENTE';

-- DropForeignKey
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_caseId_fkey";
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_establishmentId_fkey";
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_inspectorId_fkey";
ALTER TABLE "SystemSetting" DROP CONSTRAINT "SystemSetting_updatedBy_fkey";
ALTER TABLE "action_logs" DROP CONSTRAINT "action_logs_authorId_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_assignedProfessionalId_fkey";
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_createdBy_fkey";
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";
ALTER TABLE "case_office_histories" DROP CONSTRAINT "case_office_histories_transferredBy_fkey";
ALTER TABLE "case_parties" DROP CONSTRAINT "case_parties_createdBy_fkey";
ALTER TABLE "case_team_histories" DROP CONSTRAINT "case_team_histories_assignedBy_fkey";
ALTER TABLE "case_team_histories" DROP CONSTRAINT "case_team_histories_userId_fkey";
ALTER TABLE "cases" DROP CONSTRAINT "cases_closedBy_fkey";
ALTER TABLE "cases" DROP CONSTRAINT "cases_createdBy_fkey";
ALTER TABLE "cases" DROP CONSTRAINT "cases_disabledBy_fkey";
ALTER TABLE "clinical_translations" DROP CONSTRAINT "clinical_translations_createdBy_fkey";
ALTER TABLE "conciliation_evaluations" DROP CONSTRAINT "conciliation_evaluations_evaluatedBy_fkey";
ALTER TABLE "conciliation_processes" DROP CONSTRAINT "conciliation_processes_leadLawyerId_fkey";
ALTER TABLE "disability_reports" DROP CONSTRAINT "disability_reports_caseId_fkey";
ALTER TABLE "disability_reports" DROP CONSTRAINT "disability_reports_disabledBy_fkey";
ALTER TABLE "disability_reports" DROP CONSTRAINT "disability_reports_reviewedBy_fkey";
ALTER TABLE "discipline_report_types" DROP CONSTRAINT "discipline_report_types_disciplineId_fkey";
ALTER TABLE "discrepancy_analyses" DROP CONSTRAINT "discrepancy_analyses_analyzedBy_fkey";
ALTER TABLE "environmental_mappings" DROP CONSTRAINT "environmental_mappings_analyzedBy_fkey";
ALTER TABLE "evidences" DROP CONSTRAINT "evidences_uploadedBy_fkey";
ALTER TABLE "inspection_evidence_files" DROP CONSTRAINT "inspection_evidence_files_inspectionId_fkey";
ALTER TABLE "inspection_evidence_files" DROP CONSTRAINT "inspection_evidence_files_uploadedBy_fkey";
ALTER TABLE "inspection_findings" DROP CONSTRAINT "inspection_findings_inspectionId_fkey";
ALTER TABLE "inspection_locations" DROP CONSTRAINT "inspection_locations_inspectionId_fkey";
ALTER TABLE "intervention_path_histories" DROP CONSTRAINT "intervention_path_histories_changedBy_fkey";
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_escalatedTo_fkey";
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_userId_fkey";
ALTER TABLE "penal_typicality_analyses" DROP CONSTRAINT "penal_typicality_analyses_analyzedBy_fkey";
ALTER TABLE "persons" DROP CONSTRAINT "persons_createdBy_fkey";
ALTER TABLE "processual_deadlines" DROP CONSTRAINT "processual_deadlines_createdBy_fkey";
ALTER TABLE "questionnaire_responses" DROP CONSTRAINT "questionnaire_responses_respondentId_fkey";
ALTER TABLE "questionnaire_templates" DROP CONSTRAINT "questionnaire_templates_createdBy_fkey";
ALTER TABLE "reports" DROP CONSTRAINT "reports_authorId_fkey";
ALTER TABLE "reports" DROP CONSTRAINT "reports_disciplineReportTypeId_fkey";
ALTER TABLE "risk_scale_analyses" DROP CONSTRAINT "risk_scale_analyses_analyzedBy_fkey";
ALTER TABLE "social_intake_forms" DROP CONSTRAINT "social_intake_forms_socialWorkerId_fkey";
ALTER TABLE "transcriptions" DROP CONSTRAINT "transcriptions_createdBy_fkey";
ALTER TABLE "transversal_anonymized_reports" DROP CONSTRAINT "transversal_anonymized_reports_createdBy_fkey";
ALTER TABLE "transversal_unified_timelines" DROP CONSTRAINT "transversal_unified_timelines_createdBy_fkey";
ALTER TABLE "trauma_analyses" DROP CONSTRAINT "trauma_analyses_analyzedBy_fkey";
ALTER TABLE "users" DROP CONSTRAINT "users_disciplineId_fkey";
ALTER TABLE "users" DROP CONSTRAINT "users_officeId_fkey";

-- DropIndex
DROP INDEX "cases_isDisabled_idx";

-- AlterTable cases: remove old columns, add isActive
ALTER TABLE "cases"
    DROP COLUMN "complainantAddress",
    DROP COLUMN "complainantDocumentId",
    DROP COLUMN "complainantFullName",
    DROP COLUMN "complainantPhone",
    DROP COLUMN "complainantRelation",
    DROP COLUMN "disabledAt",
    DROP COLUMN "disabledBy",
    DROP COLUMN "disabledReason",
    DROP COLUMN "disabledReportId",
    DROP COLUMN "isDisabled",
    DROP COLUMN "isThirdPartyComplainant",
    DROP COLUMN "nnaAddress",
    DROP COLUMN "nnaBirthDate",
    DROP COLUMN "nnaCity",
    DROP COLUMN "nnaGender",
    DROP COLUMN "nnaPhone",
    ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable inspection_findings: replace string with enum
ALTER TABLE "inspection_findings"
    DROP COLUMN "findingCategory",
    ADD COLUMN "findingCategory" "InspectionFindingCategory" NOT NULL;

-- AlterTable reports: remove disciplineReportTypeId, add coAuthorId
ALTER TABLE "reports"
    DROP COLUMN "disciplineReportTypeId",
    ADD COLUMN "coAuthorId" UUID;

-- DropTable: old tables
DROP TABLE "Inspection";
DROP TABLE "disability_reports";
DROP TABLE "discipline_report_types";
DROP TABLE "users";

-- CreateTable: canonical User (was "users" with @@map)
CREATE TABLE "User" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "officeId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "disciplineId" UUID,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable: case_deactivation_reports (replaces disability_reports)
CREATE TABLE "case_deactivation_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "caseCode" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "disabledBy" UUID NOT NULL,
    "disabledAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMPTZ(6),
    "status" "CaseDeactivationStatus" NOT NULL DEFAULT 'PENDING',
    CONSTRAINT "case_deactivation_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable: inspections (replaces "Inspection" with correct casing + no inspectorId column)
CREATE TABLE "inspections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "establishmentId" UUID NOT NULL,
    "caseId" UUID,
    "officeId" UUID NOT NULL,
    "scheduledAt" TIMESTAMPTZ(6) NOT NULL,
    "completedAt" TIMESTAMPTZ(6),
    "status" "InspectionStatus" NOT NULL DEFAULT 'PENDIENTE',
    "isSurpriseInspection" BOOLEAN NOT NULL DEFAULT false,
    "generalNotes" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,
    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable: inspection_inspectors (join table, replaces inspectorIds array)
CREATE TABLE "inspection_inspectors" (
    "inspectionId" UUID NOT NULL,
    "inspectorId" UUID NOT NULL,
    CONSTRAINT "inspection_inspectors_pkey" PRIMARY KEY ("inspectionId","inspectorId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "case_deactivation_reports_disabledAt_idx" ON "case_deactivation_reports"("disabledAt");
CREATE INDEX "case_deactivation_reports_status_idx" ON "case_deactivation_reports"("status");
CREATE INDEX "inspections_caseId_idx" ON "inspections"("caseId");
CREATE INDEX "action_logs_caseId_idx" ON "action_logs"("caseId");
CREATE INDEX "appointments_caseId_idx" ON "appointments"("caseId");
CREATE INDEX "case_parties_caseId_idx" ON "case_parties"("caseId");
CREATE INDEX "cases_isActive_idx" ON "cases"("isActive");
CREATE INDEX "evidences_caseId_idx" ON "evidences"("caseId");
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");
CREATE INDEX "notifications_caseId_idx" ON "notifications"("caseId");
CREATE INDEX "reports_caseId_idx" ON "reports"("caseId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "disciplines"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "persons" ADD CONSTRAINT "persons_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cases" ADD CONSTRAINT "cases_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "cases" ADD CONSTRAINT "cases_closedBy_fkey" FOREIGN KEY ("closedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "case_deactivation_reports" ADD CONSTRAINT "case_deactivation_reports_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "case_deactivation_reports" ADD CONSTRAINT "case_deactivation_reports_disabledBy_fkey" FOREIGN KEY ("disabledBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "case_deactivation_reports" ADD CONSTRAINT "case_deactivation_reports_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "case_parties" ADD CONSTRAINT "case_parties_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "case_team_histories" ADD CONSTRAINT "case_team_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "case_team_histories" ADD CONSTRAINT "case_team_histories_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "case_office_histories" ADD CONSTRAINT "case_office_histories_transferredBy_fkey" FOREIGN KEY ("transferredBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "intervention_path_histories" ADD CONSTRAINT "intervention_path_histories_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "action_logs" ADD CONSTRAINT "action_logs_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reports" ADD CONSTRAINT "reports_coAuthorId_fkey" FOREIGN KEY ("coAuthorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "evidences" ADD CONSTRAINT "evidences_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assignedProfessionalId_fkey" FOREIGN KEY ("assignedProfessionalId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_escalatedTo_fkey" FOREIGN KEY ("escalatedTo") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SystemSetting" ADD CONSTRAINT "SystemSetting_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspection_locations" ADD CONSTRAINT "inspection_locations_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inspection_evidence_files" ADD CONSTRAINT "inspection_evidence_files_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inspection_evidence_files" ADD CONSTRAINT "inspection_evidence_files_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "inspection_findings" ADD CONSTRAINT "inspection_findings_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inspection_inspectors" ADD CONSTRAINT "inspection_inspectors_inspectionId_fkey" FOREIGN KEY ("inspectionId") REFERENCES "inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "inspection_inspectors" ADD CONSTRAINT "inspection_inspectors_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questionnaire_templates" ADD CONSTRAINT "questionnaire_templates_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_respondentId_fkey" FOREIGN KEY ("respondentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transcriptions" ADD CONSTRAINT "transcriptions_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "discrepancy_analyses" ADD CONSTRAINT "discrepancy_analyses_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "penal_typicality_analyses" ADD CONSTRAINT "penal_typicality_analyses_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "processual_deadlines" ADD CONSTRAINT "processual_deadlines_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "risk_scale_analyses" ADD CONSTRAINT "risk_scale_analyses_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "clinical_translations" ADD CONSTRAINT "clinical_translations_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "trauma_analyses" ADD CONSTRAINT "trauma_analyses_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "environmental_mappings" ADD CONSTRAINT "environmental_mappings_analyzedBy_fkey" FOREIGN KEY ("analyzedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transversal_unified_timelines" ADD CONSTRAINT "transversal_unified_timelines_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transversal_anonymized_reports" ADD CONSTRAINT "transversal_anonymized_reports_originalReportId_fkey" FOREIGN KEY ("originalReportId") REFERENCES "reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "transversal_anonymized_reports" ADD CONSTRAINT "transversal_anonymized_reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "social_intake_forms" ADD CONSTRAINT "social_intake_forms_socialWorkerId_fkey" FOREIGN KEY ("socialWorkerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conciliation_evaluations" ADD CONSTRAINT "conciliation_evaluations_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "conciliation_processes" ADD CONSTRAINT "conciliation_processes_leadLawyerId_fkey" FOREIGN KEY ("leadLawyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
