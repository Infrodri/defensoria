-- CreateTable
CREATE TABLE "case_chunks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "evidenceId" UUID,
    "sourceType" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "chunkIndex" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(768),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "case_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "case_chunks_caseId_idx" ON "case_chunks"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "case_chunks_evidenceId_sourceType_chunkIndex_key" ON "case_chunks"("evidenceId", "sourceType", "chunkIndex");

-- AddForeignKey
ALTER TABLE "case_chunks" ADD CONSTRAINT "case_chunks_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
