/**
 * Backfill: disciplineReportTypeId (ADR-021, Fase 3 — unificación del sistema de tipos de informe)
 *
 * Qué hace:
 *  1. Para cada valor DISTINTO de `reportType` en `reports` que aún no tenga
 *     `disciplineReportTypeId`, crea una plantilla genérica en `discipline_report_types`
 *     (category = categoría del informe, code = GENERICO_<CATEGORIA>) SI no existe ya
 *     un tipo con esa category.
 *  2. UPDATE reports SET "disciplineReportTypeId" = <plantilla genérica>
 *     WHERE "disciplineReportTypeId" IS NULL AND "reportType" = <valor>.
 *  3. Verificación final: count(*) de reports con "disciplineReportTypeId" IS NULL debe ser 0.
 *
 * ORDEN DE EJECUCIÓN (IMPORTANTE):
 *  - Este script LEE la columna vieja `reportType` (por eso usa SQL crudo: el Prisma Client
 *    regenerado ya no conoce esa columna) y ESCRIBE `category` en discipline_report_types.
 *  - Por lo tanto debe correrse DESPUÉS de que exista la columna `category` y ANTES de que se
 *    elimine `reports.reportType`.
 *  - En una base poblada, la migración se divide en dos (orden exacto):
 *      1) packages/db/prisma/migrations/<ts>_report_category/migration.sql   (Parte A)
 *         CREATE TYPE "ReportCategory" + ADD COLUMN category (nullable)
 *      2) correr ESTE script (backfill: crea plantillas genéricas + puebla disciplineReportTypeId)
 *      3) packages/db/prisma/migrations/<ts>_report_category_finalize/migration.sql  (Parte B)
 *         SET NOT NULL + DROP COLUMN reportType + DROP TYPE + FKs.
 *  - En la base actual (0 reports) es un no-op y se puede correr en cualquier momento.
 *
 * Si falta una disciplina del mapeo (no existe un `Discipline` con ese code), el script
 * FALLA con un mensaje claro: NO crea disciplinas por su cuenta.
 *
 * Uso: npx tsx scripts/backfill-discipline-report-type.ts  (desde packages/db, con .env cargado)
 */
import { PrismaClient, ReportCategory } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo reportType (viejo) -> plantilla genérica.
// disciplineCode: código de la Discipline que debe existir en la DB (ajustar si el entorno
// usa otros códigos; ej. 'SOCIAL', 'PSICOLOGICA', 'JURIDICA').
const GENERIC_TEMPLATES: Record<
  string,
  { category: string; disciplineCode: string; code: string; name: string }
> = {
  INFORME_SOCIAL: {
    category: 'INFORME_SOCIAL',
    disciplineCode: 'SOCIAL',
    code: 'GENERICO_INFORME_SOCIAL',
    name: 'Informe Social General',
  },
  INFORME_PSICOLOGICO: {
    category: 'INFORME_PSICOLOGICO',
    disciplineCode: 'PSICOLOGICA',
    code: 'GENERICO_INFORME_PSICOLOGICO',
    name: 'Informe Psicológico General',
  },
  INFORME_PSICOSOCIAL: {
    category: 'INFORME_PSICOSOCIAL',
    disciplineCode: 'PSICOSOCIAL',
    code: 'GENERICO_INFORME_PSICOSOCIAL',
    name: 'Informe Psicosocial General',
  },
  INFORME_JURIDICO: {
    category: 'INFORME_JURIDICO',
    disciplineCode: 'JURIDICA',
    code: 'GENERICO_INFORME_JURIDICO',
    name: 'Informe Jurídico General',
  },
  INFORME_SESION_SEGUIMIENTO: {
    category: 'INFORME_SESION_SEGUIMIENTO',
    disciplineCode: 'PSICOSOCIAL',
    code: 'GENERICO_INFORME_SESION_SEGUIMIENTO',
    name: 'Informe de Sesión de Seguimiento General',
  },
  INFORME_FINAL_CONCILIACION: {
    category: 'INFORME_FINAL_CONCILIACION',
    disciplineCode: 'JURIDICA',
    code: 'GENERICO_INFORME_FINAL_CONCILIACION',
    name: 'Informe Final de Conciliación General',
  },
};

async function main() {
  // 1. Valores distintos de reportType con disciplineReportTypeId NULL (SQL crudo: la columna
  //    vieja ya no existe en el Prisma Client regenerado).
  const pending: { reportType: string }[] = await prisma.$queryRaw`
    SELECT DISTINCT "reportType" FROM "reports" WHERE "disciplineReportTypeId" IS NULL
  `;

  if (pending.length === 0) {
    console.log('[backfill] No hay reports pendientes de tipificar. Nada que hacer.');
  }

  const missingDisciplines = new Set<string>();

  for (const row of pending) {
    const template = GENERIC_TEMPLATES[row.reportType];
    if (!template) {
      throw new Error(
        `[backfill] reportType desconocido: ${row.reportType}. Actualizar GENERIC_TEMPLATES.`,
      );
    }

    // ¿Ya existe un DisciplineReportType con esta category? (evita duplicados en re-runs)
    const existing = await prisma.disciplineReportType.findFirst({
      where: { category: template.category as ReportCategory },
    });

    let templateId: string;
    if (existing) {
      templateId = existing.id;
      console.log(`[backfill] ${row.reportType}: reutilizo ${existing.code} (${existing.id})`);
    } else {
      const discipline = await prisma.discipline.findUnique({
        where: { code: template.disciplineCode },
      });
      if (!discipline) {
        missingDisciplines.add(template.disciplineCode);
        console.warn(
          `[backfill] ${row.reportType}: NO existe la disciplina '${template.disciplineCode}'. Skipping.`,
        );
        continue;
      }

      const created = await prisma.disciplineReportType.create({
        data: {
          disciplineId: discipline.id,
          code: template.code,
          name: template.name,
          category: template.category as ReportCategory,
          isActive: true,
        },
      });
      templateId = created.id;
      console.log(`[backfill] ${row.reportType}: plantilla creada ${created.code} (${created.id})`);
    }

    const updated = await prisma.$executeRaw`
      UPDATE "reports"
      SET "disciplineReportTypeId" = ${templateId}::uuid
      WHERE "disciplineReportTypeId" IS NULL AND "reportType" = ${row.reportType}
    `;
    console.log(`[backfill] ${row.reportType}: ${updated} report(s) actualizado(s)`);
  }

  if (missingDisciplines.size > 0) {
    throw new Error(
      `[backfill] Faltan disciplinas en la DB: ${[...missingDisciplines].join(', ')}. ` +
        'Crearlas primero (códigos ajustables en GENERIC_TEMPLATES).',
    );
  }

  // 2. Verificación final: debe quedar 0.
  const remaining: { count: bigint }[] = await prisma.$queryRaw`
    SELECT count(*) FROM "reports" WHERE "disciplineReportTypeId" IS NULL
  `;
  const count = Number(remaining[0]?.count ?? 0);
  if (count !== 0) {
    throw new Error(`[backfill] Verificación FALLÓ: quedan ${count} reports sin disciplineReportTypeId.`);
  }
  console.log('[backfill] Verificación OK: 0 reports sin disciplineReportTypeId.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
