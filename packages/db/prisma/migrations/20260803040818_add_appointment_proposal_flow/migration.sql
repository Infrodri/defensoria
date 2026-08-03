-- AlterEnum: ADD VALUE debe estar en una transacción propia antes de usarse
-- PostgreSQL exige COMMIT antes de usar el nuevo valor como DEFAULT

ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'PROPUESTA';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'RECHAZADA';

-- Los ADD VALUE de enums en PostgreSQL no pueden estar en una transacción
-- junto con ALTER COLUMN que los use. Prisma maneja esto en bloques separados.
-- La siguiente sección corre DESPUÉS del commit implícito de los ADD VALUE:

-- AlterTable: nuevos campos de propuesta/respuesta del profesional
ALTER TABLE "appointments"
  ADD COLUMN IF NOT EXISTS "professionalNotes"    TEXT,
  ADD COLUMN IF NOT EXISTS "professionalResponse" TEXT,
  ADD COLUMN IF NOT EXISTS "respondedAt"          TIMESTAMPTZ(6);

-- scheduledAt pasa a ser opcional (profesional puede no tener fecha aún)
ALTER TABLE "appointments" ALTER COLUMN "scheduledAt" DROP NOT NULL;
