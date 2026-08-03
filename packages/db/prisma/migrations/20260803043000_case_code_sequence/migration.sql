-- =============================================================================
-- Fix 6 (Fase 0): secuencia atómica para caseCode.
-- generateCaseCode() hacía findFirst + insert con caseCode @unique, con
-- condición de carrera bajo concurrencia. PostgreSQL garantiza unicidad
-- atómica por construcción usando una SEQUENCE + nextval().
-- =============================================================================

CREATE SEQUENCE IF NOT EXISTS "case_code_seq";

-- Sembrar la secuencia con el máximo número secuencial existente entre los
-- case codes con formato DNA-YYYY-NNNN, para que los códigos nuevos nunca
-- colisionen con los ya persistidos.
SELECT setval(
  '"case_code_seq"',
  COALESCE(
    (SELECT MAX(CAST(SUBSTRING("caseCode" FROM '^DNA-[0-9]+-([0-9]+)$') AS INTEGER))
     FROM "cases"
     WHERE "caseCode" ~ '^DNA-[0-9]+-[0-9]+$'),
    0
  ),
  true
);
