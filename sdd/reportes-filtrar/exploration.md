# Exploration: Map Prisma Schema for `GET /reportes/filtrar` endpoint

## Current State

The defensoria backend is a NestJS monorepo with a Prisma+PostgreSQL data layer.
The `@defensoria/shared` package (`packages/shared/src/index.ts`) re-exports all
domain enums and they are **string enums** whose values exactly match the
`schema.prisma` enum member names. The API imports these enums from
`@defensoria/shared` (NOT from the Prisma client directly).

### Key architectural findings

- **Guards**: `JwtAuthGuard` + `RolesGuard` protect all controllers.
  `CasesController` and `ReportsController` both require JWT auth.
- **Case access**: `CaseAccessGuard` wraps per-case endpoints to scope queries
  by the requesting user's office/team assignments.
- **Service patterns**: `CasesService.getAnalytics()` uses Prisma `groupBy`
  for aggregate stats. `ReportsService` has **no** `getAnalytics()` — it has
  `create`, `emit`, `createComplementary`, `findByCaseForRole`, `findByCase`,
  `generateDraft`. Role-based permission gating lives in
  `ReportsService.checkReportRolePermission()` — JEFATURA/ADMINISTRADOR see all;
  PSICOLOGO / SOCIAL / ABOGADO are scoped by ReportType.

## Affected Areas

- `packages/db/prisma/schema.prisma` — source of truth for all models/enums
- `packages/shared/src/index.ts` — shared enum + formatter definitions
- `apps/api/src/modules/reports/reports.service.ts` — Report CRUD + emit logic
- `apps/api/src/modules/reports/reports.controller.ts` — `/reports` routes
- `apps/api/src/modules/cases/cases.service.ts` — `getAnalytics()`, `assignTeam()`
- `apps/api/src/modules/cases/cases.controller.ts` — `/cases` routes + guards

## CRITICAL: Person model has NO `ci` field

The proposed query param `ci=` does **not** map to a Person column. The schema
uses:

```prisma
model Person {
  documentType   DocumentType @default(SIN_DOCUMENTO)
  documentNumber String?
  firstName      String
  lastName       String
  birthDate      DateTime?    @db.Date
  gender         Gender       @default(OTRO)
  ...
}
```

**Mapping**: `ci` → filter on `documentNumber` WHERE `documentType == CI`.
`nombre` → `firstName`, `apellido` → `lastName`.

`DocumentType` enum: `CI | PASAPORTE | PARTIDA_NACIMIENTO | SIN_DOCUMENTO`.

## Approaches

1. **Join-based filter (single query)** — join `CaseParty` → `Person` and filter
   `Person.documentNumber`, `Person.firstName`, `Person.lastName`.
   - Pros: One query, consistent, leverages existing include patterns
   - Cons: Must handle NNA/DENUNCIANTE/DENUNCIADO disambiguation if multiple
     parties per case; need distinct on caseId
   - Effort: Low

2. **Pre-filter Person IDs then query Cases** — subquery to find matching
   `personId`s from `CaseParty`, then query `Case` + team.
   - Pros: More flexible for complex person-side filtering
   - Cons: Two queries, more code
   - Effort: Medium

## Recommendation

Use **Approach 1** (join-based). The `cases.findAll()` method already uses the
`parties { include: person }` pattern, so a filtered variant is idiomatic for
this codebase. Use `where: { parties: { some: { person: { ... } } } }` with
`distinct: [id]` to avoid duplicate cases when a person matches as both NNA and
DENUNCIANTE.

## Risks

- **No direct `ci` field** — must translate API param to
  `documentType=CI AND documentNumber=c.iValue`, or treat `ci` as a loose
  `documentNumber` match regardless of type.
- **Role scoping** — must replicate the `CasesService.findAll()` role-based
  scoping (ADMINISTRADOR → all; JEFATURA/SECRETARIA → office; profesional →
  active team) or route through `ReportsController` which currently only gates
  by `JwtAuthGuard`.
- **Performance** — `documentNumber` is unindexed (String?). Consider adding
  a partial index `ON persons (document_number) WHERE document_type = 'CI'`.
- **Reports vs Cases controller** — the endpoint is `/reportes/filtrar` but
  reports are case-centric; confirm whether this belongs in a new
  `ReportesController` or extends `CasesController`.

## Ready for Proposal

Yes — the schema map is complete. The proposal phase can proceed but must
decide: (1) `ci` param → `documentNumber`+`documentType` translation, (2)
controller placement (`/reportes/filtrar`), (3) whether to reuse
`CaseAccessGuard`/`RolesGuard` scoping from `CasesService.findAll()`.
