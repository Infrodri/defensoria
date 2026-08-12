# Graph Report - C:\dev\defensoria  (2026-08-09)

## Corpus Check
- Large corpus: 506 files · ~717,842 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 2780 nodes · 5662 edges · 148 communities (112 shown, 36 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 256 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Case Management API
- Web Admin Pages
- Evidence Processing Worker
- Disciplines CRUD
- Auth and Agenda Web
- Case Special Procedure Tabs
- NNATS Work DTOs
- Questionnaire DTOs
- Street Situation DTOs
- Access Control Services
- Inspections Module
- Protection Measure DTOs
- Travel Permission DTOs
- Evidence Upload Pipeline
- NestJS Module Wiring
- Catalogs CRUD
- Security Tokens
- Conciliation Agreements API
- Report Co-authoring
- Digital Violence DTOs
- Case Detail Web
- Knowledge Ingestion Scripts
- Appointments API
- ILE Sexual Violence DTOs
- Web Tools Pages
- Instruments CRUD
- Tools Admin API
- Parser Dependencies
- AI Config API
- API Build Config
- Person Directory API
- Audit Log API
- Trauma Analysis DTOs
- Document Templates API
- Auth API
- Conciliation API
- DB Package Dependencies
- Guards and Action Logs
- Controller Decorators
- Web Tools Hub
- Web Build Config
- RBAC System Modules
- Next.js Config
- RBAC Guards
- Action Logs API
- API Runtime Dependencies
- API Dev Dependencies
- Social Intake Service
- AI Draft API
- Offices API
- Vulnerability DTOs
- RAG and Embeddings
- Psych Tools API
- JSON Utilities
- AI Assistant API
- RAG Service Methods
- Legal Tool DTOs
- E2E Test Helpers
- Tutor Portal API
- Person Search UI
- Web UI Dependencies
- Social Intake API
- Shared Types
- Backup API
- Web Dev Dependencies
- Discrepancy Tool UI
- Psych Tool UI
- Portal Auth API
- Timeline API
- Shared Package Dependencies
- Knowledge API
- Knowledge Ingestion Methods
- Legal Tools UI
- Evidence Gallery UI
- API Package Scripts
- Legal Tools Endpoints
- Web Package Scripts
- Case Intake UI
- Transversal Tools UI
- Shared Build Config
- Legal Tools API
- Social Tools UI
- Family Map UI
- Docs Convert Scripts
- Legal Tools Logic
- Psych Tools UI
- Transversal Tools Page
- Case Service Notes
- Social Tools Logic
- Tools Verification UI
- Shared Formatters
- Family Map DTOs
- Ollama Review Script
- JWT Strategy
- Markdown Validation DTO
- Identity Migration Script
- Environmental DTOs
- Tooltip Component
- Tool Descriptions
- DB Backfill Scripts
- Markdown Ingestion Script
- NestJS CLI Config
- Timeline DTO
- DB Seed Scripts
- Prisma Test Script
- PDF Parse Types
- Token Activation DTO
- Status Badge UI
- Discipline Seed
- Phase2 Tools Seed
- Phase2 Seed Fixed
- npm bcryptjs
- npm class-validator
- npm defensoria-db
- npm defensoria-shared
- npm nestjs-common
- npm nestjs-core
- npm nestjs-passport
- npm passport
- npm passport-jwt
- npm pdf-parse
- npm minio-types
- Next Env Types
- npm defensoria-shared-web
- npm framer-motion
- npm lucide-react
- npm radix-dropdown
- npm radix-label
- npm radix-select
- npm radix-slot
- npm radix-tabs
- npm react-hook-form
- npm react-markdown
- npm recharts
- npm remark-gfm
- npm sonner
- npm tailwind-merge
- npm tanstack-table

## God Nodes (most connected - your core abstractions)
1. `PrismaService` - 122 edges
2. `Roles()` - 118 edges
3. `CurrentUser` - 99 edges
4. `fetchApi()` - 98 edges
5. `AccessUser` - 81 edges
6. `useAuth()` - 65 edges
7. `Role` - 57 edges
8. `CaseAccessService` - 48 edges
9. `JwtAuthGuard` - 41 edges
10. `KnowledgeService` - 33 edges

## Surprising Connections (you probably didn't know these)
- `UpdatePathDto` --references--> `InterventionPath`  [EXTRACTED]
  apps/api/src/modules/cases/cases.service.ts → packages/shared/src/index.ts
- `AssignTeamDto` --references--> `Role`  [EXTRACTED]
  apps/api/src/modules/cases/dto/assign-team.dto.ts → packages/shared/src/index.ts
- `CreateCasePartyDto` --references--> `RoleInCase`  [EXTRACTED]
  apps/api/src/modules/cases/dto/create-case.dto.ts → packages/shared/src/index.ts
- `CreateActionLogDto` --references--> `ActionType`  [EXTRACTED]
  apps/api/src/modules/action-logs/action-logs.service.ts → packages/shared/src/index.ts
- `CreateAppointmentDto` --references--> `AppointmentType`  [EXTRACTED]
  apps/api/src/modules/appointments/appointments.service.ts → packages/shared/src/index.ts

## Import Cycles
- None detected.

## Communities (148 total, 36 thin omitted)

### Community 0 - "Case Management API"
Cohesion: 0.06
Nodes (39): CasesController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+31 more)

### Community 1 - "Web Admin Pages"
Cohesion: 0.04
Nodes (60): PipelineStatus, RagMonitorPage(), EquipoPage(), InspeccionesPage(), analyzeLegalDiscrepancies(), analyzePenalTypicality(), analyzeTrauma(), AnonymizationRule (+52 more)

### Community 2 - "Evidence Processing Worker"
Cohesion: 0.07
Nodes (33): EvidenceWorker, Injectable, EvidencesController, ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags (+25 more)

### Community 3 - "Disciplines CRUD"
Cohesion: 0.07
Nodes (35): DisciplinesController, ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags, Body, Controller (+27 more)

### Community 4 - "Auth and Agenda Web"
Cohesion: 0.05
Nodes (40): DEMO_ACCOUNTS, LoginPage(), DEMO_ACCOUNTS, LoginPage(), AgendaPage(), Appointment, Office, Professional (+32 more)

### Community 5 - "Case Special Procedure Tabs"
Cohesion: 0.10
Nodes (47): ConciliationTab(), EDITOR_ROLES, Props, EDITOR_ROLES, MEASURE_LABELS, Props, ProtectionMeasuresTab(), EDITOR_ROLES (+39 more)

### Community 6 - "NNATS Work DTOs"
Cohesion: 0.05
Nodes (41): CreateSpecTrabajoNNATSDto, ApiProperty, ApiPropertyOptional, IsArray, IsBoolean, IsDateString, IsInt, IsNumber (+33 more)

### Community 7 - "Questionnaire DTOs"
Cohesion: 0.07
Nodes (30): CreateQuestionDto, CreateQuestionnnaireTemplateDto, IsArray, IsEnum, IsOptional, IsString, Type, ValidateNested (+22 more)

### Community 8 - "Street Situation DTOs"
Cohesion: 0.05
Nodes (38): CreateSpecSituacionCalleDto, ApiProperty, ApiPropertyOptional, IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty (+30 more)

### Community 9 - "Access Control Services"
Cohesion: 0.10
Nodes (15): CaseAccessService, Injectable, user, RAGService, Injectable, ToolHealthStatus, PrismaService, Injectable (+7 more)

### Community 10 - "Inspections Module"
Cohesion: 0.09
Nodes (23): InspectionsController, ApiBearerAuth, ApiConsumes, ApiOperation, ApiParam, ApiTags, Body, Controller (+15 more)

### Community 11 - "Protection Measure DTOs"
Cohesion: 0.06
Nodes (34): CreateProtectionMeasureDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional (+26 more)

### Community 12 - "Travel Permission DTOs"
Cohesion: 0.06
Nodes (33): CreateTravelPermissionDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional (+25 more)

### Community 13 - "Evidence Upload Pipeline"
Cohesion: 0.06
Nodes (18): EvidenceJobPayload, ALLOWED_MIME_TYPES, EvidencesService, Injectable, InstrumentsModule, Module, MinioModule, Global (+10 more)

### Community 14 - "NestJS Module Wiring"
Cohesion: 0.08
Nodes (32): CaseAccessModule, Global, Module, AiModule, Module, AiAssistantModule, Module, EvidencesModule (+24 more)

### Community 15 - "Catalogs CRUD"
Cohesion: 0.09
Nodes (23): CatalogsController, Body, Controller, Delete, Get, Param, Post, Put (+15 more)

### Community 16 - "Security Tokens"
Cohesion: 0.06
Nodes (29): SecurityTokenController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Post, UseGuards (+21 more)

### Community 17 - "Conciliation Agreements API"
Cohesion: 0.06
Nodes (33): ConciliationAgreementsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+25 more)

### Community 18 - "Report Co-authoring"
Cohesion: 0.09
Nodes (23): AssignCoAuthorDto, ApiProperty, IsUUID, ReportsController, ApiBearerAuth, ApiOperation, ApiTags, Body (+15 more)

### Community 19 - "Digital Violence DTOs"
Cohesion: 0.07
Nodes (31): CreateSpecViolenceDigitalDto, ApiPropertyOptional, IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString (+23 more)

### Community 20 - "Case Detail Web"
Cohesion: 0.07
Nodes (28): CasoDetailPage(), AiCopilot(), CaseFlowWidget(), CaseFlowWidgetProps, INITIAL_REPORT_TYPES, Report, ROLE_LABELS, TeamMember (+20 more)

### Community 21 - "Knowledge Ingestion Scripts"
Cohesion: 0.09
Nodes (6): MD_PROCESSED_DIR, AppModule, Module, KnowledgeService, Injectable, MD_PROCESSED_DIR

### Community 22 - "Appointments API"
Cohesion: 0.11
Nodes (19): AppointmentsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+11 more)

### Community 23 - "ILE Sexual Violence DTOs"
Cohesion: 0.07
Nodes (27): CreateSpecViolenciaSexualILEDto, ApiProperty, ApiPropertyOptional, IsBoolean, IsNotEmpty, IsOptional, IsString, ApiPropertyOptional (+19 more)

### Community 24 - "Web Tools Pages"
Cohesion: 0.07
Nodes (27): CopilotPage(), DISCIPLINE_CONFIG, ROLES_CON_ACCESO, CatalogItem, CatalogsAdminPage(), SystemCatalog, KnowledgeUploadPage(), LegalDoc (+19 more)

### Community 25 - "Instruments CRUD"
Cohesion: 0.10
Nodes (19): InstrumentsController, ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiTags, Body (+11 more)

### Community 26 - "Tools Admin API"
Cohesion: 0.11
Nodes (12): ToolsAdminController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Post (+4 more)

### Community 27 - "Parser Dependencies"
Cohesion: 0.06
Nodes (31): axios, form-data, formdata-node, dependencies, axios, form-data, formdata-node, mammoth (+23 more)

### Community 28 - "AI Config API"
Cohesion: 0.09
Nodes (16): AiConfigController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Post (+8 more)

### Community 29 - "API Build Config"
Cohesion: 0.06
Nodes (30): compilerOptions, allowSyntheticDefaultImports, baseUrl, declaration, emitDecoratorMetadata, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+22 more)

### Community 30 - "Person Directory API"
Cohesion: 0.09
Nodes (20): ApiQuery, PersonsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get (+12 more)

### Community 31 - "Audit Log API"
Cohesion: 0.09
Nodes (17): AuditController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Query, UseGuards (+9 more)

### Community 32 - "Trauma Analysis DTOs"
Cohesion: 0.08
Nodes (25): AnalyzeTraumaDto, ApiProperty, IsArray, IsNotEmpty, IsUUID, ExtractIndicatorsDto, ApiProperty, ApiPropertyOptional (+17 more)

### Community 33 - "Document Templates API"
Cohesion: 0.10
Nodes (18): TemplatesController, ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags, Body, Controller (+10 more)

### Community 34 - "Auth API"
Cohesion: 0.10
Nodes (19): AuthController, ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, Body, Controller, Get (+11 more)

### Community 35 - "Conciliation API"
Cohesion: 0.12
Nodes (16): ConciliationController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+8 more)

### Community 36 - "DB Package Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, bcryptjs, @prisma/client, devDependencies, prisma, tsx, @types/bcryptjs, @types/node (+20 more)

### Community 37 - "Guards and Action Logs"
Cohesion: 0.30
Nodes (5): CaseAccessGuard, Injectable, CurrentUser, JwtAuthGuard, Injectable

### Community 38 - "Controller Decorators"
Cohesion: 0.13
Nodes (14): ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param, Patch (+6 more)

### Community 39 - "Web Tools Hub"
Cohesion: 0.12
Nodes (24): Case, Evidence, HerramientasPage(), MODULE_META, Report, ToolCard(), ToolCardProps, EditableTool() (+16 more)

### Community 40 - "Web Build Config"
Cohesion: 0.07
Nodes (27): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+19 more)

### Community 41 - "RBAC System Modules"
Cohesion: 0.11
Nodes (16): SystemModulesController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Delete, Get (+8 more)

### Community 42 - "Next.js Config"
Cohesion: 0.08
Nodes (25): nextConfig, ^build, ^lint, .next/**, !-next/cache/**, dependsOn, outputs, cache (+17 more)

### Community 43 - "RBAC Guards"
Cohesion: 0.26
Nodes (8): Roles(), ROLES_KEY, RolesGuard, Injectable, CLINICAL_ROLES, CreateUserDto, UpdateUserDto, Role

### Community 44 - "Action Logs API"
Cohesion: 0.11
Nodes (16): ActionLogsController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+8 more)

### Community 45 - "API Runtime Dependencies"
Cohesion: 0.08
Nodes (25): dependencies, cheerio, class-transformer, mammoth, minio, @nestjs/config, @nestjs/jwt, @nestjs/platform-express (+17 more)

### Community 46 - "API Dev Dependencies"
Cohesion: 0.08
Nodes (25): devDependencies, @nestjs/cli, @nestjs/schematics, @nestjs/testing, @types/bcryptjs, @types/express, @types/multer, @types/node (+17 more)

### Community 47 - "Social Intake Service"
Cohesion: 0.08
Nodes (13): CreateSocialIntakeDto, CreateCaseInput, CreateCasePartyInput, createCasePartySchema, createCaseSchema, CreatePersonInput, createPersonSchema, LoginInput (+5 more)

### Community 48 - "AI Draft API"
Cohesion: 0.11
Nodes (16): AiController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Post, UseGuards (+8 more)

### Community 49 - "Offices API"
Cohesion: 0.12
Nodes (15): OfficesController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+7 more)

### Community 50 - "Vulnerability DTOs"
Cohesion: 0.12
Nodes (16): CalculateVulnerabilityDto, ApiProperty, IsNotEmpty, IsNumber, IsString, IsUUID, SocialToolsController, ApiBearerAuth (+8 more)

### Community 51 - "RAG and Embeddings"
Cohesion: 0.12
Nodes (10): EmbeddingsService, Injectable, detectLegalArticles(), embeddingsService, knowledgeService, main(), migrateDocument(), MigrationOptions (+2 more)

### Community 52 - "Psych Tools API"
Cohesion: 0.15
Nodes (9): PsychologicalToolsController, ApiBearerAuth, ApiTags, Controller, Get, Param, UseGuards, PsychologicalToolsService (+1 more)

### Community 53 - "JSON Utilities"
Cohesion: 0.23
Nodes (8): asNumber(), asString(), asStringArray(), buildRagQuery(), clamp(), extractJson(), EnvironmentalFactor, EnvironmentalOutput

### Community 54 - "AI Assistant API"
Cohesion: 0.17
Nodes (11): AiAssistantController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Param, Post (+3 more)

### Community 55 - "RAG Service Methods"
Cohesion: 0.13
Nodes (5): EvidenceRagService, Injectable, TranscriptionService, Injectable, calculateAge()

### Community 56 - "Legal Tool DTOs"
Cohesion: 0.10
Nodes (18): AnalyzeDiscrepanciesDto, ApiProperty, IsArray, IsOptional, IsUUID, AnalyzeTypicalityDto, ApiProperty, IsString (+10 more)

### Community 57 - "E2E Test Helpers"
Cohesion: 0.17
Nodes (15): clickTab(), getCurrentUserInfo(), isUserAuthenticated(), loadToolsData(), loginUser(), logoutUser(), navigateToLogin(), navigateToToolsDemo() (+7 more)

### Community 58 - "Tutor Portal API"
Cohesion: 0.14
Nodes (12): PortalController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, UseGuards, PortalModule (+4 more)

### Community 59 - "Person Search UI"
Cohesion: 0.17
Nodes (17): PersonDirectorySearch(), PersonDirectorySearchProps, useDebounce(), cache, CacheEntry, clearCache(), getCacheKey(), getFromCache() (+9 more)

### Community 60 - "Web UI Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, class-variance-authority, clsx, @hookform/resolvers, next, next-themes, qrcode, @radix-ui/react-dialog (+13 more)

### Community 61 - "Social Intake API"
Cohesion: 0.15
Nodes (12): SocialIntakeController, ApiBearerAuth, ApiOperation, ApiTags, Body, Controller, Get, Param (+4 more)

### Community 62 - "Shared Types"
Cohesion: 0.10
Nodes (19): ActionType, AppointmentStatus, AppointmentType, CaseType, CreateCaseInput, CreatePersonInput, DocumentType, Gender (+11 more)

### Community 63 - "Backup API"
Cohesion: 0.13
Nodes (13): SystemBackupController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Post, Res, UseGuards (+5 more)

### Community 64 - "Web Dev Dependencies"
Cohesion: 0.11
Nodes (19): devDependencies, @playwright/test, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/qrcode, @types/react (+11 more)

### Community 65 - "Discrepancy Tool UI"
Cohesion: 0.16
Nodes (14): Discrepancy, DiscrepancyAnalysis(), DiscrepancyAnalysisProps, getSeverityColor(), getSeverityIcon(), Crime, CrimeElement, PenalTypicality() (+6 more)

### Community 66 - "Psych Tool UI"
Cohesion: 0.16
Nodes (14): ClinicalTranslation(), ClinicalTranslationProps, TranslationPair, getInterpretationColor(), RiskScales(), RiskScalesProps, Scale, Subscale (+6 more)

### Community 67 - "Portal Auth API"
Cohesion: 0.16
Nodes (10): PortalAuthController, ApiOperation, ApiTags, Body, Controller, Post, PortalAuthModule, Module (+2 more)

### Community 68 - "Timeline API"
Cohesion: 0.13
Nodes (12): TimelineController, ApiBearerAuth, ApiOperation, ApiTags, Controller, Get, Param, UseGuards (+4 more)

### Community 69 - "Shared Package Dependencies"
Cohesion: 0.12
Nodes (16): dependencies, zod, devDependencies, @types/node, typescript, @types/node, typescript, zod (+8 more)

### Community 70 - "Knowledge API"
Cohesion: 0.18
Nodes (9): KnowledgeController, ApiBearerAuth, ApiTags, Controller, Delete, Get, Param, Patch (+1 more)

### Community 71 - "Knowledge Ingestion Methods"
Cohesion: 0.33
Nodes (7): ApiBody, ApiConsumes, ApiOperation, Body, Post, UploadedFile, UseInterceptors

### Community 72 - "Legal Tools UI"
Cohesion: 0.12
Nodes (4): EVENT_TYPES, LegalTool, LegalToolsContent(), TOOL_DEFS

### Community 73 - "Evidence Gallery UI"
Cohesion: 0.22
Nodes (14): EvidenceGallery(), EvidenceGalleryProps, getCategoryLabel(), getFileIcon(), getMimeCategory(), TranscriptionButton(), TranscriptionButtonProps, TranscriptionPanel() (+6 more)

### Community 74 - "API Package Scripts"
Cohesion: 0.13
Nodes (14): name, private, scripts, build, dev, lint, migrate:knowledge, migrate:knowledge:dry-run (+6 more)

### Community 75 - "Legal Tools Endpoints"
Cohesion: 0.31
Nodes (7): AccessUser, ApiOperation, Body, Post, ApiOperation, Body, Post

### Community 76 - "Web Package Scripts"
Cohesion: 0.14
Nodes (13): name, private, scripts, build, dev, lint, start, test:e2e (+5 more)

### Community 77 - "Case Intake UI"
Cohesion: 0.19
Nodes (9): InicioCasoPage(), IntakeCaseFormValues, intakeCaseSchema, partyFormSchema, AudioRecorder(), AudioRecorderProps, CasePartyManager(), PersonDirectorySearch() (+1 more)

### Community 78 - "Transversal Tools UI"
Cohesion: 0.23
Nodes (10): AnonymizationRule, AnonymizedReport(), AnonymizedReportProps, getConfidentialityColor(), getTypeColor(), getTypeIcon(), getTypeLabel(), TimelineEvent (+2 more)

### Community 79 - "Shared Build Config"
Cohesion: 0.15
Nodes (12): compilerOptions, declaration, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, skipLibCheck (+4 more)

### Community 80 - "Legal Tools API"
Cohesion: 0.23
Nodes (7): LegalToolsController, ApiBearerAuth, ApiTags, Controller, Get, Param, UseGuards

### Community 81 - "Social Tools UI"
Cohesion: 0.18
Nodes (6): formatResult(), SocialTool, SocialToolDef, SocialToolsContent(), TOOLS, VIVIENDA_OPTIONS

### Community 82 - "Family Map UI"
Cohesion: 0.23
Nodes (9): FamilyMember, FamilyStructure(), FamilyStructureProps, getSeverityColor(), getVulnerabilityColor(), RiskFactor, SupportProgram, VulnerabilityAssessment() (+1 more)

### Community 83 - "Docs Convert Scripts"
Cohesion: 0.26
Nodes (11): detectArticles(), DocMetadata, extractDocxText(), extractMdText(), extractPdfText(), FILE_METADATA, formatAsMarkdown(), INPUT_DIR (+3 more)

### Community 85 - "Psych Tools UI"
Cohesion: 0.20
Nodes (5): formatResult(), PsychologicalToolsContent(), PsychTool, PsychToolDef, TOOLS

### Community 86 - "Transversal Tools Page"
Cohesion: 0.20
Nodes (5): formatResult(), TOOLS, TransversalTool, TransversalToolDef, TransversalToolsContent()

### Community 87 - "Case Service Notes"
Cohesion: 0.31
Nodes (6): TODO: index intakeNarrative as case_narrative chunk for vector search, TransferOfficeDto, UpdatePathDto, InterventionPath, Phase, RoleInCase

### Community 89 - "Tools Verification UI"
Cohesion: 0.25
Nodes (7): styles, ToolsVerificationPage(), AdminToolsPanel(), Statistics, styles, ToolHealth, ToolsHealthReport

### Community 91 - "Family Map DTOs"
Cohesion: 0.29
Nodes (6): GenerateFamilyMapDto, ApiProperty, ApiPropertyOptional, IsNotEmpty, IsOptional, IsUUID

### Community 92 - "Ollama Review Script"
Cohesion: 0.38
Nodes (6): __dirname, main(), MODES, ollamaPrompt(), projectRoot, runOllamaReview()

### Community 93 - "JWT Strategy"
Cohesion: 0.33
Nodes (3): JwtPayload, JwtStrategy, Injectable

### Community 94 - "Markdown Validation DTO"
Cohesion: 0.33
Nodes (5): MarkdownValidationResult, ApiProperty, IsNotEmpty, IsString, ValidateMarkdownDto

### Community 95 - "Identity Migration Script"
Cohesion: 0.47
Nodes (5): dryRun, migrateToIdentity(), normalizeCI(), prisma, splitName()

### Community 96 - "Environmental DTOs"
Cohesion: 0.40
Nodes (4): MapEnvironmentalDto, ApiProperty, IsNotEmpty, IsUUID

### Community 97 - "Tooltip Component"
Cohesion: 0.60
Nodes (4): getArrowStyles(), getPositionStyles(), Tooltip(), TooltipProps

### Community 98 - "Tool Descriptions"
Cohesion: 0.50
Nodes (4): getToolDescription(), isToolAvailableForRole(), TOOL_DESCRIPTIONS, ToolDescription

### Community 100 - "DB Backfill Scripts"
Cohesion: 0.40
Nodes (3): ADR-0021, GENERIC_TEMPLATES, prisma

### Community 101 - "Markdown Ingestion Script"
Cohesion: 0.50
Nodes (4): ingestMarkdown(), IngestResult, main(), MD_PROCESSED_DIR

### Community 102 - "NestJS CLI Config"
Cohesion: 0.50
Nodes (3): collection, $schema, sourceRoot

### Community 103 - "Timeline DTO"
Cohesion: 0.50
Nodes (3): ApiProperty, IsUUID, UnifiedTimelineDto

### Community 106 - "PDF Parse Types"
Cohesion: 0.50
Nodes (3): pdf-parse-fixed, PDFParseOptions, PDFParseResult

### Community 107 - "Token Activation DTO"
Cohesion: 0.67
Nodes (3): ActivateSecurityTokenDto, ApiProperty, IsNotEmpty

## Knowledge Gaps
- **494 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `name`, `version` (+489 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **36 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Roles()` connect `RBAC Guards` to `Case Management API`, `Disciplines CRUD`, `NNATS Work DTOs`, `Questionnaire DTOs`, `Street Situation DTOs`, `Protection Measure DTOs`, `Travel Permission DTOs`, `Catalogs CRUD`, `Security Tokens`, `Conciliation Agreements API`, `Digital Violence DTOs`, `ILE Sexual Violence DTOs`, `Instruments CRUD`, `Tools Admin API`, `AI Config API`, `Audit Log API`, `Document Templates API`, `Guards and Action Logs`, `Controller Decorators`, `RBAC System Modules`, `AI Draft API`, `Offices API`, `Vulnerability DTOs`, `Backup API`, `Knowledge API`, `Knowledge Ingestion Methods`, `Legal Tools Endpoints`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `CurrentUser` connect `Guards and Action Logs` to `Case Management API`, `Evidence Processing Worker`, `NNATS Work DTOs`, `Questionnaire DTOs`, `Street Situation DTOs`, `Inspections Module`, `Protection Measure DTOs`, `Travel Permission DTOs`, `Security Tokens`, `Conciliation Agreements API`, `Report Co-authoring`, `Digital Violence DTOs`, `Appointments API`, `ILE Sexual Violence DTOs`, `Person Directory API`, `Auth API`, `Conciliation API`, `RBAC Guards`, `Action Logs API`, `AI Draft API`, `Vulnerability DTOs`, `Social Intake API`, `Knowledge Ingestion Methods`, `Legal Tools Endpoints`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `Access Control Services` to `Case Management API`, `Disciplines CRUD`, `NNATS Work DTOs`, `Questionnaire DTOs`, `Street Situation DTOs`, `Inspections Module`, `Protection Measure DTOs`, `Travel Permission DTOs`, `Evidence Upload Pipeline`, `NestJS Module Wiring`, `Catalogs CRUD`, `Conciliation Agreements API`, `Report Co-authoring`, `Digital Violence DTOs`, `Appointments API`, `ILE Sexual Violence DTOs`, `AI Config API`, `Person Directory API`, `Audit Log API`, `Trauma Analysis DTOs`, `Auth API`, `Conciliation API`, `Guards and Action Logs`, `Controller Decorators`, `RBAC System Modules`, `RBAC Guards`, `Action Logs API`, `Social Intake Service`, `AI Draft API`, `Offices API`, `RAG and Embeddings`, `JSON Utilities`, `RAG Service Methods`, `Legal Tool DTOs`, `Tutor Portal API`, `Social Intake API`, `Portal Auth API`, `Timeline API`, `Case Service Notes`, `JWT Strategy`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _494 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Case Management API` be split into smaller, more focused modules?**
  _Cohesion score 0.05627545353572751 - nodes in this community are weakly interconnected._
- **Should `Web Admin Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.040674603174603176 - nodes in this community are weakly interconnected._
- **Should `Evidence Processing Worker` be split into smaller, more focused modules?**
  _Cohesion score 0.06610259122157588 - nodes in this community are weakly interconnected._