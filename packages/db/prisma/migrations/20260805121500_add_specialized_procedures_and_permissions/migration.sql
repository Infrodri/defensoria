-- CreateEnum
CREATE TYPE "StreetPhase" AS ENUM ('ADHERENCIA', 'REHABILITACION', 'REINTEGRACION');

-- CreateEnum
CREATE TYPE "DigitalPlatform" AS ENUM ('WHATSAPP', 'TIKTOK', 'INSTAGRAM', 'FACEBOOK', 'ONLYFANS', 'TELEGRAM', 'X_TWITTER', 'OTRO');

-- CreateEnum
CREATE TYPE "TravelType" AS ENUM ('NACIONAL', 'INTERNACIONAL');

-- CreateEnum
CREATE TYPE "TravelCompanionType" AS ENUM ('AMBOS_PADRES', 'PADRE_SOLO', 'MADRE_SOLA', 'TERCERO_AUTORIZADO', 'SOLO');

-- CreateEnum
CREATE TYPE "ProtectionMeasureType" AS ENUM ('ACOGIMIENTO_CIRCUNSTANCIAL', 'INTEGRACION_RED_APOYO', 'RESTITUCION_DOMICILIARIA');

-- CreateTable
CREATE TABLE "spec_violence_digital" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "urls" TEXT[],
    "platforms" "DigitalPlatform"[],
    "usedDevices" TEXT[],
    "coercionMethods" TEXT[],
    "metadataPreserved" JSONB NOT NULL,
    "requiresForensic" BOOLEAN NOT NULL DEFAULT false,
    "phoneOperator" TEXT,
    "phoneOwnerVerified" TEXT,
    "callRegistryExt" JSONB,

    CONSTRAINT "spec_violence_digital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spec_trabajo_nnats" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "hasEscolaridadCert" BOOLEAN NOT NULL DEFAULT false,
    "hasAptitudMedicaSUS" BOOLEAN NOT NULL DEFAULT false,
    "inspeccionRealizada" BOOLEAN NOT NULL DEFAULT false,
    "fechaInspeccion" TIMESTAMPTZ(6),
    "inspectorId" TEXT,
    "risksIdentified" TEXT[],
    "isProhibitedWork" BOOLEAN NOT NULL DEFAULT false,
    "hoursPerWeek" INTEGER NOT NULL,
    "salaryBs" DOUBLE PRECISION NOT NULL,
    "studyHoursGrant" BOOLEAN NOT NULL DEFAULT true,
    "hasSocialSecurity" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "spec_trabajo_nnats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spec_situacion_calle" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "faseActual" "StreetPhase" NOT NULL DEFAULT 'ADHERENCIA',
    "programaReferente" TEXT,
    "educadorCalleRef" TEXT,
    "yearsOnStreet" DOUBLE PRECISION,
    "survivalStrategy" TEXT,
    "substanceAbuse" TEXT[],
    "streetHistory" TEXT NOT NULL,
    "idFormReferencia" TEXT,
    "idFormContraref" TEXT,
    "notificadoITD" BOOLEAN NOT NULL DEFAULT false,
    "fechaNotificacion" TIMESTAMPTZ(6),

    CONSTRAINT "spec_situacion_calle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spec_violencia_sexual_ile" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "copiaDenunciaAdjunta" BOOLEAN NOT NULL DEFAULT false,
    "consentimientoNNA" BOOLEAN NOT NULL DEFAULT false,
    "atendidoDentro24h" BOOLEAN NOT NULL DEFAULT false,
    "apersonamientoDNA" BOOLEAN NOT NULL DEFAULT true,
    "delitoCalificado" TEXT NOT NULL,
    "solicitoCamaraGesell" BOOLEAN NOT NULL DEFAULT false,
    "certificadoMedicoUnico" BOOLEAN NOT NULL DEFAULT false,
    "solicitoReserva" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "spec_violencia_sexual_ile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_permissions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID,
    "travelType" "TravelType" NOT NULL,
    "companionType" "TravelCompanionType" NOT NULL,
    "originCity" TEXT NOT NULL DEFAULT 'Sucre',
    "destinationCity" TEXT NOT NULL,
    "departureDate" TIMESTAMPTZ(6) NOT NULL,
    "returnDate" TIMESTAMPTZ(6),
    "companionFullName" TEXT,
    "companionIdentityNumber" TEXT,
    "companionRelation" TEXT,
    "bothParentsPresent" BOOLEAN NOT NULL DEFAULT true,
    "oppositionNotes" TEXT,
    "authorizationCode" TEXT NOT NULL,
    "isIssued" BOOLEAN NOT NULL DEFAULT false,
    "issuedAt" TIMESTAMPTZ(6),
    "issuedById" TEXT,

    CONSTRAINT "travel_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "protection_measures" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "measureType" "ProtectionMeasureType" NOT NULL,
    "reason" TEXT NOT NULL,
    "receptiveCenterName" TEXT,
    "executedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "judgeNotifiedAt" TIMESTAMPTZ(6),
    "judgeNotificationCode" TEXT,
    "isWithinLegalDeadline" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "protection_measures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conciliation_agreements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "caseId" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "agreedAmountBs" DOUBLE PRECISION,
    "agreementContent" TEXT NOT NULL,
    "isSignedByParties" BOOLEAN NOT NULL DEFAULT false,
    "submittedToCourtAt" TIMESTAMPTZ(6),
    "courtApprovedAt" TIMESTAMPTZ(6),
    "homologationCode" TEXT,

    CONSTRAINT "conciliation_agreements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spec_violence_digital_caseId_key" ON "spec_violence_digital"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "spec_trabajo_nnats_caseId_key" ON "spec_trabajo_nnats"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "spec_situacion_calle_caseId_key" ON "spec_situacion_calle"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "spec_violencia_sexual_ile_caseId_key" ON "spec_violencia_sexual_ile"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "travel_permissions_caseId_key" ON "travel_permissions"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "travel_permissions_authorizationCode_key" ON "travel_permissions"("authorizationCode");

-- CreateIndex
CREATE INDEX "protection_measures_caseId_idx" ON "protection_measures"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "conciliation_agreements_caseId_key" ON "conciliation_agreements"("caseId");

-- AddForeignKey
ALTER TABLE "spec_violence_digital" ADD CONSTRAINT "spec_violence_digital_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec_trabajo_nnats" ADD CONSTRAINT "spec_trabajo_nnats_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec_situacion_calle" ADD CONSTRAINT "spec_situacion_calle_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spec_violencia_sexual_ile" ADD CONSTRAINT "spec_violencia_sexual_ile_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_permissions" ADD CONSTRAINT "travel_permissions_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "protection_measures" ADD CONSTRAINT "protection_measures_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conciliation_agreements" ADD CONSTRAINT "conciliation_agreements_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

