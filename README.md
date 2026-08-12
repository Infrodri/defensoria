# Sistema de Gestión y Acompañamiento de Casos — Defensoría de la Niñez y Adolescencia (DNA)

## 1. Descripción y Potencialidades del Sistema

Este sistema es una plataforma integral de gestión de casos para la oficina municipal de la Defensoría de la Niñez y Adolescencia (DNA) en Bolivia. Permite administrar casos donde los derechos de los niños, niñas y adolescentes están en riesgo, coordinando equipos interdisciplinarios (Trabajo Social, Psicología, Área Legal) bajo una Jefatura de Unidad.

El principio central de la plataforma es: *"El caso pertenece al niño, niña o adolescente. Los profesionales y las oficinas son temporales dentro del caso."*

### 🌟 Potencialidades Principales
- **Copiloto de Inteligencia Artificial (Local y Privado)**: Motor RAG con IA local (Qwen2.5) diseñado para analizar documentos legales y de casos sin comprometer la privacidad de los NNA.
- **Herramientas Clínicas y Legales**: Tipicidad penal, plazos procesales, indicadores de trauma, mapeo ambiental y familiar (familiogramas).
- **Control Estricto de Seguridad y Evidencia (Token)**: Capas de seguridad adicionales mediante Tokens para acceder a evidencia sensible. Toda acción es irreversible y deja un rastro inmutable (Audit Log).
- **Conciliaciones y Resoluciones Rápidas**: Flujo completo para gestionar citaciones, audiencias y acuerdos de conciliación.
- **Portal Externo para Tutores**: Seguimiento en tiempo real por parte de referentes legales.
- **Línea de Tiempo Unificada**: Una visión cronológica completa del caso donde se intersecan los aportes de Psicología, Área Legal y Trabajo Social.

## 2. Stack tecnológico

| Capa | Tecnología |
|---|---|
| **Arquitectura** | Monorepo (Turborepo + npm workspaces) |
| **Frontend** | Next.js 16 (App Router) + React 19 + TypeScript |
| **UI** | shadcn/ui + Tailwind CSS v4 (CSS-first, OKLCH) |
| **Backend** | NestJS 11 + TypeScript |
| **Base de Datos** | PostgreSQL 16 + Prisma ORM + pgvector |
| **Almacenamiento (Object Storage)** | MinIO (S3-compatible, on-premise) |
| **Inteligencia Artificial (Local)** | Ollama (Qwen2.5) + RAG con HTML Scraping (Cheerio) |
| **Testing** | Vitest + Playwright |
| **Validación** | Zod (esquemas compartidos) |
| **Autenticación** | JWT + bcrypt (credenciales locales) |
| **Componentes de UI** | lucide-react (Iconos), framer-motion (Animaciones), recharts (Gráficos), sonner (Toasts) |
| **Formularios & Tablas** | react-hook-form + @hookform/resolvers/zod, @tanstack/react-table |

## 3. Estructura del monorepo

```
defensoria/
├── apps/
│   ├── web/                  # Frontend: Next.js 16 (App Router)
│   └── api/                  # Backend: NestJS 11
├── packages/
│   ├── shared/               # @defensoria/shared — Tipos, enums, esquemas Zod
│   └── db/                   # @defensoria/db — Esquema de Prisma y cliente
├── docs/                     # Documentación de arquitectura, especificaciones, referencias legales
├── openspec/                 # Artefactos SDD
├── docker-compose.yml        # Configuración de PostgreSQL 16 + MinIO
├── turbo.json                # Configuración de Turborepo
└── package.json              # Configuración de npm workspaces
```

## 4. Requisitos previos

- Node.js 20 o superior
- Docker Desktop
- npm 10 o superior

**Puertos en desarrollo:**
- Frontend: `3100`
- Backend: `4100`
- PostgreSQL: `5435` (host)
- MinIO: `9000` / `9001`

## 5. Inicio rápido

Para iniciar el entorno de desarrollo local, ejecuta los siguientes comandos:

```bash
docker compose up -d        # Inicia PostgreSQL y MinIO en contenedores
npm install                 # Instala todas las dependencias
npm run db:generate         # Genera el cliente de Prisma
npm run db:push             # Aplica el esquema de la base de datos
npm run dev                 # Inicia todos los servicios (frontend y backend)
```
cd c:\dev\defensoria
npm run dev --workspace=apps/api

cd c:\dev\defensoria
npm run dev --workspace=apps/web

cd c:\dev\defensoria
docker compose up -d


Desde la raíz del proyecto, puedes utilizar los comandos definidos en el `package.json` utilizando Turborepo.

* `npm run dev`: Inicia el entorno de desarrollo.
* `npm run build`: Construye todas las aplicaciones y paquetes.
* `npm run test`: Ejecuta las pruebas configuradas.
* `npm run lint`: Ejecuta el análisis estático de código.

## 7. Convenciones de desarrollo

- **Archivos:** `kebab-case`
- **Componentes:** `PascalCase`
- **Variables y funciones:** `camelCase`
- **Rutas (URL):** En español, usando `kebab-case`
- **Nombres de paquetes:** `@defensoria/<nombre>`
- **Modelos de Prisma:** `PascalCase`
- **Mensajes de Commit:** Seguir el estándar [Conventional Commits](https://www.conventionalcommits.org/)
- **Claves Primarias (PKs):** UUID v7

## 8. Documentación

### 📚 **Documentación Completa**
Toda la documentación del proyecto está organizada en la carpeta [`docs/`](./docs/)

**Acceso rápido**:
- 📖 **[Manual del Sistema (Índice General)](./docs/guias-usuario/README.md)** - Resumen y acceso a las Guías para JEFATURA, ABOGADO, PSICÓLOGO, TRABAJADOR SOCIAL y SECRETARIA
- 🧪 **[Testing y QA](./docs/testing/TESTING-PHASE2-STATUS.md)** - Estado de testing y verificación
- 🔧 **[Documentación Técnica](./docs/INTEGRATION_FRONTEND_API_PHASE2.md)** - Integración y arquitectura
- 🤖 **[Agentes IA](./docs/INSTRUCCIONES-AGENTES.md)** - Configuración de agentes de IA
- 📐 **[Artefactos SDD](./openspec/)** - Especificaciones de diseño

### 🚀 **Para Empezar**
- **Usuario del sistema**: Lee [`docs/guias-usuario/README.md`](./docs/guias-usuario/README.md)
- **Desarrollador**: Lee [`docs/INTEGRATION_FRONTEND_API_PHASE2.md`](./docs/INTEGRATION_FRONTEND_API_PHASE2.md)
- **QA/Tester**: Lee [`docs/testing/TESTING-PHASE2-STATUS.md`](./docs/testing/TESTING-PHASE2-STATUS.md)

## 9. Roadmap por fases

| Fase | Descripción | Estado |
|---|---|---|
| **Fase 0** | Validación legal (catálogos configurables) | ✅ Completado |
| **Fase 1** | MVP Core (auth, casos, historial de equipo, agenda, auditoría) | ✅ Completado |
| **Fase 2** | Módulos para profesionales (informes, token de seguridad, reportes validados) | ✅ Completado |
| **Fase 3** | Inteligencia (Matriz IA, copilot, línea de tiempo) | ✅ Completado |
| **Fase 4** | Portal externo (Referente/Tutor) | ✅ Completado |
| **Fase 5** | Módulo de inspecciones (evaluación) | ✅ Completado |
