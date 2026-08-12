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
DO $$
DECLARE
  max_val INTEGER;
BEGIN
  SELECT MAX(CAST(SUBSTRING("caseCode" FROM '^DNA-[0-9]+-([0-9]+)$') AS INTEGER))
  INTO max_val
  FROM "cases"
  WHERE "caseCode" ~ '^DNA-[0-9]+-[0-9]+$';

  IF max_val IS NULL THEN
    PERFORM setval('"case_code_seq"', 1, false);
  ELSE
    PERFORM setval('"case_code_seq"', max_val, true);
  END IF;
END $$;
