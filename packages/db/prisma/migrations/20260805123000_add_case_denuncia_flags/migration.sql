-- AlterTable
ALTER TABLE "cases" ADD COLUMN     "denunciaAnonima" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "involucraFuncionario" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "menorAutodenuncia" BOOLEAN NOT NULL DEFAULT false;

