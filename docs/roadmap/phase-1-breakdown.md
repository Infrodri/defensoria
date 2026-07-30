# Project Roadmap: Phase 1 Breakdown

This document details the first phase of the DNA Case Management System implementation, focusing on infrastructure, core case management, and basic operations.

## Roadmap Overview (Phases 0-5)

| Phase | Title | Focus |
| :--- | :--- | :--- |
| Phase 0 | Discovery & Design | Requirements, UX/UI prototypes, architecture planning |
| Phase 1 | Core System & Case Management | Infrastructure, RBAC, Case CRUD, Team assignment |
| Phase 2 | Clinical & Legal Workflows | Reports (Social, Psych, Legal), Evidence, Security Token |
| Phase 3 | External Integration | Portal for Referente/Tutor, Notifications, API endpoints |
| Phase 4 | Analytics & Audit | Advanced reporting, Audit dashboards, Performance metrics |
| Phase 5 | Optimization & Handoff | Final QA, Load testing, Deployment, Training |

---

## Phase 1A — Infrastructure
**Duration:** 1-2 weeks

This sub-phase establishes the foundation of the monorepo, database schema, and frontend architecture.

### Tasks
- [x] Initialize Turborepo monorepo with standard structure (`apps/web`, `apps/api`, `packages/shared`, `packages/db`).
- [x] Setup NestJS 11 boilerplate in `apps/api` with Swagger and Dockerfile.
- [x] Define PostgreSQL 16 schema utilizing Prisma in `packages/db`: `users`, `offices`, `persons`, `cases`, `case_party`, `case_team_history`, `case_office_history`, `intervention_path_history`, `action_logs`, `reports`, `evidences`, `appointments`, `notifications`, `audit_log`.
- [x] Configure Docker Compose for local development (`docker-compose.yml`: PostgreSQL 16 on port 5435 + MinIO on ports 9000/9001) and production (`docker-compose.prod.yml`).
- [x] Create `@defensoria/shared` package exporting domain enums and Zod validation schemas.
- [x] Scaffold Next.js 16 (App Router) in `apps/web` with standalone Dockerfile.
- [x] Implement the DNA Design System base:
  - Tailwind v4 OKLCH CSS tokens mapped to the DNA palette (`bosque-profundo`, `salvia`, `tierra-calida`, `papel`, `grafito`).
  - Base Layout and Typography token structure.
- [x] Create `.agents/AGENTS.md` detailing project rules (UTF-8 encoding, naming conventions, architectural constraints).
- [x] Configure strict `.gitignore` based on standard monorepo patterns.
- [ ] Setup global ESLint + Prettier configuration across the monorepo.

### Acceptance Criteria
- [ ] The monorepo builds successfully (`turbo build`).
- [ ] All package dependencies resolve correctly.
- [ ] Development servers start without errors (`turbo dev`).
- [ ] The login page renders at the root URL applying the DNA design system correctly.

---

## Phase 1B — Case Management
**Duration:** 2-3 weeks
**Dependencies:** Phase 1A complete

This sub-phase focuses on the core domain: creating and managing cases, assigning professionals, and implementing data isolation.

### Tasks
- [x] Implement CRUD operations for persons (NNA, complainants, accused).
- [x] Build the mandatory prior search functionality (anti-duplication check) that must run before new case creation.
- [x] Implement Case creation logic (restricted strictly to `Secretaría` and `Jefatura`) with auto-generated code `DNA-YYYY-NNNN`.
- [x] Build the Case detail view, incorporating the `PhaseRail` component to visualize the current intervention phase.
- [x] Implement team assignment logic, ensuring every change records an entry in `CaseTeamHistory`.
- [x] Implement office transfer functionality, recording changes in `CaseOfficeHistory`.
- [x] Implement intervention path tracking via `InterventionPathHistory`.
- [x] Develop the Case list view with role-based filtering (Jefatura/Secretaría see office cases, professionals see assigned cases).
- [x] Implement NestJS RLS interceptor and Passport JWT authentication with initial database seed.

### Acceptance Criteria
- [x] A permitted user can successfully create a new case after completing the mandatory prior search.
- [x] Teams can be assigned and offices can be transferred, with all historical changes accurately reflected in the UI and database.
- [x] Intervention paths can be updated and tracked.
- [x] Professional users logging in only see cases they are currently or historically assigned to, verifying assignment-based data isolation.

---

## Phase 1C — Basic Operations
**Duration:** 1-2 weeks
**Dependencies:** Phase 1B complete

This sub-phase adds operational tools necessary for day-to-day work on cases.

### Tasks
- [ ] Develop the appointment/agenda module, ensuring appointments are tied directly to cases, not just individual professionals.
- [ ] Implement the action log (bitácora) module:
  - Must be strictly append-only.
  - Implement a "sign to lock" feature for entries.
- [ ] Create a basic Audit view dashboard accessible only by `Jefatura`.
- [ ] Implement in-app notifications to alert professionals and Jefatura of impending legal deadlines.
- [ ] Implement auto-save functionality for form drafts using `localStorage` to provide connectivity resilience for users working on long inputs.

### Acceptance Criteria
- [ ] Users can successfully schedule an appointment linked to a specific case.
- [ ] Users can add entries to the action log and mathematically/logically sign them, preventing future edits.
- [ ] `Jefatura` can view a structured audit trail of system activities.
- [ ] Deadline notifications appear reliably in the UI for the relevant assigned professionals.
- [ ] Form data is recovered automatically after a simulated page reload or browser crash during data entry.
