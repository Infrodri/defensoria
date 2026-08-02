# Project Roadmap: Phase 2 Breakdown

This document details the second phase of the DNA Case Management System implementation, focusing on professional reports, evidence object storage, and the Security Token.

## Phase 2 — Professional Reports, Evidence Storage & Security Token
**Duration:** 2-3 weeks
**Dependencies:** Phase 1 complete

### Tasks

### Tasks

#### 1. Professional Reports Module (`ReportsModule`)
- [x] Implement `Report` CRUD with states `BORRADOR` (draft) and `EMITIDO` (emitted).
- [x] Enforce immutability: once a report is `EMITIDO`, it can never be edited or deleted.
- [x] Implement complementary report logic (`parentReportId` + version increment) for subsequent updates to emitted reports.
- [x] Enforce role-based report creation:
  - Psychologist creates `INFORME_PSICOLOGICO`.
  - Social Worker creates `INFORME_SOCIAL`.
  - Lawyer creates `INFORME_JURIDICO`.
- [x] Update case `riskLevel` automatically when a psychology report evaluates risk (`BAJO`, `MEDIO`, `ALTO`).

#### 2. Security Token (`SecurityTokenModule`)
- [x] Implement re-authentication endpoint (`POST /api/security-token/activate`) requiring user password.
- [x] Issue scoped short-lived JWT token (15-minute TTL, configurable by Jefatura) with scopes `evidence:read` and `clinical:read`.
- [x] Log every security token activation and usage in `AuditLog`.

#### 3. Object Storage & Evidence Module (`EvidenceModule` + MinIO)
- [x] Configure MinIO SDK client in NestJS connected to local container on port 9000.
- [x] Create `defensoria-evidences` bucket automatically on startup if missing.
- [x] Implement file upload endpoint (`POST /api/evidences/upload`):
  - Validate file size (max 50MB) and MIME type (PDF, JPG, PNG, DOCX, MP3, MP4).
  - Calculate SHA-256 checksum for chain-of-custody integrity verification.
  - Store object key in MinIO and record metadata in `Evidence` table.
- [x] Enforce security token requirement for sensitive evidence (`isSensitive = true`).

#### 4. Frontend Integration (`apps/web`)
- [x] Build Report Editor component with draft auto-save and "Emitir Informe" freeze action.
- [x] Build Security Token modal overlay for re-authentication when accessing clinical reports or sensitive files.
- [x] Build Evidence Gallery component with file upload dropzone and SHA-256 hash display.

---

### Acceptance Criteria
- [x] Professionals can create drafts of their respective report types and emit them, freezing the content permanently.
- [x] Subsequent report updates create complementary reports linked to the original parent report.
- [x] Psychology reports automatically update the case risk level.
- [x] Accessing sensitive evidence or clinical reports prompts the Security Token overlay, requiring password re-authentication.
- [x] Files upload to MinIO with SHA-256 hash verification, enforcing the 50MB limit and allowed MIME types.
