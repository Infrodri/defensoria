-- Migration Phase A: unify report type system (ADR-021, Fase 3)
-- Aplica PRIMERO. Luego correr el backfill (scripts/backfill-discipline-report-type.ts).
-- Después aplicar la migracion report_category_finalize (Parte B).
--
-- 1. Nuevo enum ReportCategory (7 valores, incl. INFORME_COMPLEMENTARIO)
-- 2. discipline_report_types.category (NULLABLE por ahora — el backfill lo puebla; la
--    Parte B lo pasa a NOT NULL. Si la tabla tuviera filas, ADD COLUMN NOT NULL sin default
--    fallaria, por eso se agrega nullable primero)
-- 3. reports.coAuthorId (nueva columna nullable)
--
-- NOTA: se excluyo un bloque "AlterEnum TranscriptionTaskStatus" que `prisma migrate diff`
-- genero por drift pre-existente entre la DB local (enum con valor extra PROCESSING) y el
-- schema (PENDIENTE/COMPLETADA/ERROR). Ese drift NO pertenece a este cambio.

-- CreateEnum
CREATE TYPE "ReportCategory" AS ENUM ('INFORME_SOCIAL', 'INFORME_PSICOLOGICO', 'INFORME_PSICOSOCIAL', 'INFORME_JURIDICO', 'INFORME_SESION_SEGUIMIENTO', 'INFORME_FINAL_CONCILIACION', 'INFORME_COMPLEMENTARIO');

-- AlterTable: add nullable category (backfill lo puebla)
ALTER TABLE "discipline_report_types" ADD COLUMN     "category" "ReportCategory";

-- AlterTable: add nullable coAuthorId
ALTER TABLE "reports" ADD COLUMN     "coAuthorId" UUID;
