-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "complainantAddress" TEXT,
ADD COLUMN     "complainantDocumentId" TEXT,
ADD COLUMN     "complainantFullName" TEXT,
ADD COLUMN     "complainantPhone" TEXT,
ADD COLUMN     "complainantRelation" TEXT,
ADD COLUMN     "isThirdPartyComplainant" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "tool_approvals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "approvedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "notes" TEXT,
    "healthSnapshot" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tool_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_intake_forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "socialWorkerId" UUID NOT NULL,
    "interviewDate" TIMESTAMPTZ(6) NOT NULL,
    "interviewLocation" TEXT NOT NULL,
    "incidentDescription" TEXT NOT NULL,
    "incidentLocation" TEXT NOT NULL,
    "incidentDate" TIMESTAMPTZ(6),
    "incidentWitnesses" TEXT,
    "familyStructure" TEXT NOT NULL,
    "socialEconomicSituation" TEXT NOT NULL,
    "immediateDangerAssessment" BOOLEAN NOT NULL DEFAULT false,
    "dangerLevel" "RiskLevel",
    "professionalObservations" TEXT NOT NULL,
    "initialRecommendations" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "social_intake_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conciliation_evaluations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "evaluatedBy" UUID NOT NULL,
    "isConciliable" BOOLEAN NOT NULL,
    "reason" TEXT NOT NULL,
    "hasMaltrato" BOOLEAN NOT NULL DEFAULT false,
    "hasCriminalAction" BOOLEAN NOT NULL DEFAULT false,
    "hasAuthorityLoss" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conciliation_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conciliation_processes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "scheduledDate" TIMESTAMPTZ(6) NOT NULL,
    "location" TEXT NOT NULL,
    "leadLawyerId" UUID NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMPTZ(6),
    "agreementReached" BOOLEAN,
    "agreementText" TEXT,
    "homologationRequested" BOOLEAN NOT NULL DEFAULT false,
    "homologationDate" TIMESTAMPTZ(6),
    "courtDecision" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "conciliation_processes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tool_approvals_approvedAt_idx" ON "tool_approvals"("approvedAt");

-- CreateIndex
CREATE UNIQUE INDEX "social_intake_forms_caseId_key" ON "social_intake_forms"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "conciliation_evaluations_caseId_key" ON "conciliation_evaluations"("caseId");

-- AddForeignKey
ALTER TABLE "social_intake_forms" ADD CONSTRAINT "social_intake_forms_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_intake_forms" ADD CONSTRAINT "social_intake_forms_socialWorkerId_fkey" FOREIGN KEY ("socialWorkerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conciliation_evaluations" ADD CONSTRAINT "conciliation_evaluations_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conciliation_evaluations" ADD CONSTRAINT "conciliation_evaluations_evaluatedBy_fkey" FOREIGN KEY ("evaluatedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conciliation_processes" ADD CONSTRAINT "conciliation_processes_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conciliation_processes" ADD CONSTRAINT "conciliation_processes_leadLawyerId_fkey" FOREIGN KEY ("leadLawyerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
