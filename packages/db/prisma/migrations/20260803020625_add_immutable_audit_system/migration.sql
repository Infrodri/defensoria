-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "disabledAt" TIMESTAMPTZ(6),
ADD COLUMN     "disabledBy" UUID,
ADD COLUMN     "disabledReason" TEXT,
ADD COLUMN     "disabledReportId" UUID,
ADD COLUMN     "isDisabled" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "disability_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "caseCode" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "disabledBy" UUID NOT NULL,
    "disabledAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedBy" UUID,
    "reviewedAt" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "disability_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "disability_reports_disabledAt_idx" ON "disability_reports"("disabledAt");

-- CreateIndex
CREATE INDEX "disability_reports_status_idx" ON "disability_reports"("status");

-- CreateIndex
CREATE INDEX "cases_isDisabled_idx" ON "cases"("isDisabled");

-- AddForeignKey
ALTER TABLE "cases" ADD CONSTRAINT "cases_disabledBy_fkey" FOREIGN KEY ("disabledBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disability_reports" ADD CONSTRAINT "disability_reports_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disability_reports" ADD CONSTRAINT "disability_reports_disabledBy_fkey" FOREIGN KEY ("disabledBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disability_reports" ADD CONSTRAINT "disability_reports_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
