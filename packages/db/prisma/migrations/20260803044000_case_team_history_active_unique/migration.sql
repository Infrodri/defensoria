-- =============================================================================
-- Fix 1 (Fase 0): a lo sumo UNA asignación activa por (caseId, role).
-- Prisma no soporta índices parciales únicos en el DSL; se crea vía raw SQL.
-- La garantía a nivel de servicio (cerrar activos antes de crear, en la misma
-- transacción) ya existe en assignTeam y se agrega a reassign/massTransfer;
-- este índice único parcial refuerza la invariante directamente en la BD.
-- =============================================================================

-- 1) Limpieza previa: cerrar filas activas duplicadas conservando la más
--    reciente (mayor startDate) de cada par (caseId, role). Sin este paso el
--    CREATE UNIQUE INDEX fallaría si ya existen duplicados en producción.
UPDATE "case_team_histories" AS dup
SET "endDate" = NOW()
WHERE dup."endDate" IS NULL
  AND EXISTS (
    SELECT 1
    FROM "case_team_histories" AS newer
    WHERE newer."caseId" = dup."caseId"
      AND newer."role" = dup."role"
      AND newer."endDate" IS NULL
      AND newer."id" <> dup."id"
      AND newer."startDate" > dup."startDate"
  );

-- 2) Índice único parcial: máximo una fila activa (endDate IS NULL) por (caseId, role).
--    Las filas históricas (endDate NOT NULL) quedan ilimitadas.
CREATE UNIQUE INDEX IF NOT EXISTS "case_team_histories_active_case_role_unique"
ON "case_team_histories" ("caseId", "role")
WHERE "endDate" IS NULL;
