# Design: Jefatura and Administrator Modules

## Technical Approach

Implement two new NestJS modules (`jefatura` and `administrator`) plus corresponding frontend dashboard pages, following the existing project patterns (CaseAccessGuard, JwtAuthGuard, RolesGuard, extractJson, AuditLog/ActionLog immutability, fire-and-forget RAG, 30s AI timeout). The Jefatura module adds workload visibility and case closure/reopen controls. The Administrator module adds user CRUD, knowledge-base RAG ingestion, and AI config management.

## Architecture Decisions

| Decision | Tradeoff | Decision |
|----------|----------|----------|
| New `jefatura` module (not extending `cases`) | Keeps Jefatura-specific endpoints isolated; avoids bloating the Cases controller | Rejected merging into CasesModule — violates single-responsibility and would require `@Roles(Role.JEFATURA)` on existing case endpoints |
| Reuse `AuditModule` (global) for audit logging | No new module needed; `AuditService.logEvent()` already exists and is exported globally | Rejected creating a separate audit module — duplicates infrastructure |
| Fire-and-forget `Promise` for RAG indexing | Non-blocking upload response; background processing with `logger` for error tracking | Rejected `await` in controller — would make upload latency unacceptable for large PDFs |
| `extractJson()` from `structured-json.util.ts` for AI responses | Consistent with existing AI assistant patterns; handles fenced JSON, direct parse, and brace extraction | Rejected regex extraction — fragile and already solved by the shared utility |
| `AbortSignal.timeout(30000)` for all AI calls | Explicit 30s timeout prevents hanging requests; matches RAGService pattern | Rejected no-timeout or longer timeouts — blocks NestJS thread pool under load |
| Frontend pages under `(dashboard)/admin` and `(dashboard)/panel` | Follows existing Next.js App Router convention with route groups | Rejected flat routes — would conflict with existing dashboard layout |

## Data Flow

```
Jefatura Backend                    Frontend (panel)
─────────────────                    ─────────────────
GET /jefatura/workload  ──────────→  KPI cards + workload table
POST /cases/:id/close    ──────────→  Reassign button triggers modal
POST /cases/:id/reopen   ──────────→  Reopen button triggers modal
GET /audit-logs           ──────────→  Auditoria page table

Administrator Frontend            Administrator Backend
─────────────────────              ──────────────────────
GET /admin/usuarios          ────→  UsersModule: CRUD users
POST /admin/usuarios         ────→  UsersModule: create user
PATCH /admin/usuarios/:id    ────→  UsersModule: update user
GET /admin/base-conocimiento ────→  KnowledgeModule: list docs
POST /admin/base-conocimiento────→  KnowledgeModule: upload → fire-and-forget RAG
GET /admin/config-ia         ────→  AiConfigModule: get config
PUT /admin/config-ia         ────→  AiConfigModule: update config
GET /admin/config-ia/health  ────→  AiConfigModule: health check
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/api/src/modules/jefatura/jefatura.controller.ts` | Create | Workload, close, reopen, audit-logs endpoints |
| `apps/api/src/modules/jefatura/jefatura.service.ts` | Create | Business logic for workload aggregation, case close/reopen, audit log queries |
| `apps/api/src/modules/jefatura/jefatura.module.ts` | Create | NestJS module registering controller + service |
| `apps/api/src/modules/jefatura/dto/close-case.dto.ts` | Create | `closureReason: string` validation |
| `apps/api/src/modules/jefatura/dto/reopen-case.dto.ts` | Create | `reopenReason: string` validation |
| `apps/api/src/modules/jefatura/dto/workload.dto.ts` | Create | Query params for workload filters |
| `apps/api/src/modules/administrator/users/users.controller.ts` | Create | Full CRUD users endpoint |
| `apps/api/src/modules/administrator/users/users.service.ts` | Create | User CRUD with `disciplineId` and `officeId` support |
| `apps/api/src/modules/administrator/users/users.module.ts` | Create | NestJS module for UsersModule (admin-scoped) |
| `apps/api/src/modules/administrator/knowledge/knowledge.controller.ts` | Create | Document upload + RAG indexing endpoint |
| `apps/api/src/modules/administrator/knowledge/knowledge.service.ts` | Create | Upload handling + fire-and-forget RAG |
| `apps/api/src/modules/administrator/knowledge/knowledge.module.ts` | Create | NestJS module |
| `apps/api/src/modules/administrator/ai-config/ai-config.controller.ts` | Create | Config update + health check endpoints |
| `apps/api/src/modules/administrator/ai-config/ai-config.service.ts` | Create | Config read/write + Ollama/Whisper health checks |
| `apps/api/src/modules/administrator/ai-config/ai-config.module.ts` | Create | NestJS module |
| `apps/api/src/app.module.ts` | Modify | Import 3 new administrator submodules + jefatura module |
| `apps/web/app/(dashboard)/panel/page.tsx` | Modify | Add KPI cards + workload table + reassign button |
| `apps/web/app/(dashboard)/auditoria/page.tsx` | Modify | Add security token + evidence download indicators |
| `apps/web/app/(dashboard)/admin/usuarios/page.tsx` | Create | CRUD users table with activate/deactivate |
| `apps/web/app/(dashboard)/admin/base-conocimiento/page.tsx` | Create | PDF/Text upload + auto-ingestion UI |
| `apps/web/app/(dashboard)/admin/config-ia/page.tsx` | Create | OLLAMA_ENDPOINT, OLLAMA_MODEL, WHISPER_API_URL config + health buttons |

## Interfaces / Contracts

```typescript
// JefaturaController (apps/api/src/modules/jefatura/jefatura.controller.ts)
@Controller('jefatura')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.JEFATURA, Role.ADMINISTRADOR)

GET  /workload          → { activeCases, pendingReports, deadlineAlerts }
POST /cases/:id/close   → { caseId, closedAt, actionLogId, auditLogId }
POST /cases/:id/reopen  → { caseId, reopenedAt, actionLogId, auditLogId }
GET  /audit-logs        → { items: AuditLog[], total, page, take }

// Close/reopen DTOs
{ closureReason: string }   // required, min 10 chars
{ reopenReason: string }    // required, min 10 chars

// Administrator — Users CRUD
POST   /admin/usuarios         → User (with disciplineId, officeId)
GET    /admin/usuarios         → User[] (filterable by role, isActive)
PATCH  /admin/usuarios/:id     → User
DELETE /admin/usuarios/:id     → { success: boolean }

// Administrator — Knowledge upload
POST   /admin/knowledge/upload  → { documentId, chunksProcessed, status: 'processing' | 'complete' }

// Administrator — AI Config
GET    /admin/config-ia         → { OLLAMA_ENDPOINT, OLLAMA_MODEL, WHISPER_API_URL }
PUT    /admin/config-ia         → { success: boolean }
GET    /admin/config-ia/health  → { ollama: 'ok'|'error', whisper: 'ok'|'error' }
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | JefaturaService workload aggregation, close/reopen logic | Jest + mock PrismaService; verify ActionLog + AuditLog creation on close/reopen |
| Unit | Administrator UsersService CRUD with disciplineId/officeId | Jest + mock PrismaService; test role-based filtering |
| Unit | AiConfigService health checks with timeout | Jest + mock fetch; test 30s timeout and error handling |
| Integration | JefaturaController endpoints with RolesGuard | Supertest; verify 403 for non-Jefatura/Admin roles |
| Integration | Knowledge upload fire-and-forget | Verify 200 response before RAG completes; check background processing log |
| E2E | Panel workload table renders correctly | Playwright; verify KPI cards, reassign button, audit log table |
| E2E | Admin users CRUD page | Playwright; create, update, deactivate user flow |

## Migration / Rollout

No database migration required — Prisma schema already has User, Case, AuditLog, ActionLog, LegalDocument, LegalChunk, SystemSetting tables. The new modules reuse existing tables and add no new ones.

Rollout plan:
1. Deploy backend modules behind feature flag or role-gated endpoints (already enforced by RolesGuard)
2. Deploy frontend admin pages behind role check (`user.role === Role.ADMINISTRADOR`)
3. No seed data needed — existing `Role` enum already includes `JEFATURA` and `ADMINISTRADOR`

## Open Questions

- [ ] Should the `jefatura/workload` endpoint include deadline alerts computed from `Case` `updatedAt` or a dedicated deadline field? (No dedicated deadline column exists in the Case model — may need a `deadlineAt` field or compute from `currentPhase`.)
- [ ] Should the Administrator `users` module use the existing `UsersModule` or create a separate admin-scoped module? (Design uses a separate `administrator/users` module to keep admin-specific logic isolated, but this duplicates the existing `users` module.)
- [ ] Does the `knowledge/upload` endpoint need a `LegalDocument` status field to distinguish "processing" from "indexed"? (Current `LegalDocument` has `isActive` but no `processing` status — fire-and-forget may need a status update.)
