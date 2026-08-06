-- Add documentTemplateId to instruments (link instruments to normative document templates)
ALTER TABLE "instruments" ADD COLUMN "documentTemplateId" UUID;

-- Backfill: link instruments to templates by matching name pattern is not reliable,
-- so the FK stays nullable and existing rows keep NULL until assigned via seed.

ALTER TABLE "instruments" ADD CONSTRAINT "instruments_documentTemplateId_fkey" FOREIGN KEY ("documentTemplateId") REFERENCES "document_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "instruments_documentTemplateId_idx" ON "instruments"("documentTemplateId");
