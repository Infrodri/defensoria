-- Migration Phase B (FINALIZE): unify report type system (ADR-021, Fase 3)
-- Aplica DESPUÉS de correr el backfill (scripts/backfill-discipline-report-type.ts),
-- que lee la columna vieja `reportType` y puebla `disciplineReportTypeId` + `category`.
--
-- 1. category pasa a NOT NULL (backfill ya creó/mapeó plantillas genéricas)
-- 2. reports.disciplineReportTypeId pasa a NOT NULL (backfill ya lo pobló)
-- 3. DROP COLUMN reportType + DROP TYPE ReportType (solo ahora, post-backfill)
-- 4. FKs finales: disciplineReportTypeId RESTRICT (relación ahora obligatoria),
--    coAuthorId SET NULL (coautor opcional)

-- DropForeignKey (se recrea abajo con RESTRICT)
ALTER TABLE "reports" DROP CONSTRAINT "reports_disciplineReportTypeId_fkey";

-- AlterTable: category NOT NULL
ALTER TABLE "discipline_report_types" ALTER COLUMN     "category" SET NOT NULL;

-- AlterTable: reportType eliminado, disciplineReportTypeId NOT NULL
ALTER TABLE "reports" DROP COLUMN "reportType",
ALTER COLUMN "disciplineReportTypeId" SET NOT NULL;

-- DropEnum
DROP TYPE "ReportType";

-- AddForeignKey: disciplineReportTypeId obligatorio
ALTER TABLE "reports" ADD CONSTRAINT "reports_disciplineReportTypeId_fkey" FOREIGN KEY ("disciplineReportTypeId") REFERENCES "discipline_report_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey: coautor opcional
ALTER TABLE "reports" ADD CONSTRAINT "reports_coAuthorId_fkey" FOREIGN KEY ("coAuthorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
