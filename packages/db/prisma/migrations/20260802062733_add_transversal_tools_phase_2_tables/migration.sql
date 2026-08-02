-- CreateTable
CREATE TABLE "transversal_unified_timelines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "events" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "transversal_unified_timelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transversal_anonymized_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "originalReportId" UUID NOT NULL,
    "anonymizedContent" TEXT NOT NULL,
    "replacements" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" UUID NOT NULL,

    CONSTRAINT "transversal_anonymized_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transversal_unified_timelines_caseId_idx" ON "transversal_unified_timelines"("caseId");

-- CreateIndex
CREATE INDEX "transversal_anonymized_reports_caseId_idx" ON "transversal_anonymized_reports"("caseId");

-- AddForeignKey
ALTER TABLE "transversal_unified_timelines" ADD CONSTRAINT "transversal_unified_timelines_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transversal_unified_timelines" ADD CONSTRAINT "transversal_unified_timelines_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transversal_anonymized_reports" ADD CONSTRAINT "transversal_anonymized_reports_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transversal_anonymized_reports" ADD CONSTRAINT "transversal_anonymized_reports_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
