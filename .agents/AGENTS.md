### 1. Reglas del Proyecto
- Nombre: Sistema de Gestión de Casos DNA
- Monorepo: Turborepo + npm workspaces
- Packages: apps/web (Next.js 16), apps/api (NestJS 11), packages/shared, packages/db (Prisma)

### 2. Convenciones de Nombres
- Archivos: kebab-case (`case-detail.tsx`, `auth.service.ts`)
- Componentes React: PascalCase (`PhaseRail`, `CaseDetail`)
- Variables/funciones: camelCase
- Rutas App Router: español, kebab-case (`/panel/casos`, `/ingesta-caso`)
- Prisma models: PascalCase (`CaseTeamHistory`, `ActionLog`)
- Package scope: @defensoria/ (`@defensoria/shared`, `@defensoria/db`)
- Commits: Conventional Commits (feat:, fix:, refactor:, docs:, chore:)
- PKs: UUID v7

### 3. Puertos de Desarrollo
- Frontend: 3100
- Backend: 4100  
- PostgreSQL: 5435 (host) → 5432 (container)
- MinIO API: 9000
- MinIO Console: 9001

### 4. Codificación de Base de Datos (UTF-8)
- **NUNCA** usar redirección `>` en PowerShell/CMD para pg_dump. Windows corrompe UTF-8 a CP850.
- Usar siempre `pg_dump -f archivo.sql`
- Restauración: `SET client_encoding = 'UTF8';` al inicio del archivo SQL o `PGCLIENTENCODING=UTF8`

### 5. Arquitectura Backend (NestJS)
- Feature modules: cada dominio es un module (`CasesModule`, `AuthModule`, `ReportsModule`)
- Guards para RBAC: `@Roles(Role.JEFATURA)`, `@RequiresAssignment()`
- Interceptors para auditoría: `AuditInterceptor` registra cada acción
- Interceptor RLS: `RlsContextInterceptor` setea `SET LOCAL app.user_id` por transacción
- DTOs con class-validator + class-transformer
- Swagger/OpenAPI autogenerado con decoradores

### 6. Arquitectura Frontend (Next.js 16)
- App Router con route groups por rol: `(jefatura)`, `(abogado)`, `(psicologo)`, `(social)`, `(secretaria)`, `(auth)`
- Componentes UI: shadcn/ui (Radix + CVA + tailwind-merge)
- Formularios: react-hook-form + @hookform/resolvers/zod
- Validación compartida: Zod schemas en @defensoria/shared
- Tablas: @tanstack/react-table
- Iconos: lucide-react
- Animaciones: framer-motion
- Toasts: sonner
- Tema: next-themes (dark/light)

### 7. Verificación Estándar
- Backend: `npx tsc --noEmit` en apps/api
- Frontend: `npx tsc --noEmit --skipLibCheck` en apps/web
- Tests: `npx vitest run`
- Lint: `npm run lint`

### 8. Reglas de Seguridad
- NUNCA enviar datos de NNA a proveedores de IA externos sin autorización legal escrita
- Todo contenido generado por IA es BORRADOR hasta confirmación humana
- Evidencia sensible requiere Token de Seguridad (re-autenticación)
- Auditoría: tabla audit_log es append-only, sin permisos de UPDATE/DELETE
- No existe acción de "eliminar" en ningún módulo

### 9. Tailwind CSS v4
- Configuración CSS-first (no tailwind.config.js)
- Colores en OKLCH
- Paleta: bosque-profundo (primary), salvia (secondary), tierra-cálida (accent), papel (background), grafito (foreground)
- Colores de riesgo: solo para riesgo real del NNA, nunca decorativo
