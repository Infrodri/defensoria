-- AlterTable
ALTER TABLE "persons" 
ADD COLUMN "hasDisability" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "disabilityDetails" TEXT,
ADD COLUMN "language" TEXT NOT NULL DEFAULT 'Castellano',
ADD COLUMN "ethnicity" TEXT,
ADD COLUMN "isMigrant" BOOLEAN NOT NULL DEFAULT false;
