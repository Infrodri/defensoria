-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "assignedProfessionalId" UUID;

-- CreateIndex
CREATE INDEX "appointments_assignedProfessionalId_idx" ON "appointments"("assignedProfessionalId");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_assignedProfessionalId_fkey" FOREIGN KEY ("assignedProfessionalId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
