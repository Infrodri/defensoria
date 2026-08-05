# Permisos por Rol — Herramientas

> **Alineación verificada contra el código** (apps/web/lib/role-access.ts, apps/api/src/modules/*/*-tools.controller.ts). El frontend declara la **intención** de acceso; el backend impone la protección real con `@Roles`. Hay **2 desalineaciones conocidas** (JEFATURA en análisis de disciplina y profesionales en transversales) donde el frontend habilita acciones que el backend rechaza con **403**. Se documenta la intención con nota explícita; el bug de autorización es un **follow-up** separado (fuera de alcance de este cambio).

---

## 1. Inventario de herramientas (13 toolIds / 12 visibles)

| toolId | Título real (TOOL_DESCRIPTIONS) | Módulo | Visible en `/herramientas` |
|--------|--------------------------------|--------|---------------------------|
| `legal_discrepancies` | Análisis de Discrepancias | Legal | ✅ |
| `legal_typicality` | Tipicidad Penal | Legal | ✅ |
| `legal_deadlines` | Vencimientos Procesales | Legal | ✅ |
| `psychological_indicators` | Indicadores de Trauma | Psicológico | ✅ |
| `psychological_scales` | Escalas de Riesgo (ACES / PHQ-9) | Psicológico | ✅ |
| `psychological_translation` | Traducción Clínica | Psicológico | ✅ |
| `psychological_trauma` | Análisis de Trauma | Psicológico | ✅ |
| `social_family` | Estructura Familiar | Social | ✅ |
| `social_vulnerability` | Evaluación Vulnerabilidad | Social | ✅ |
| `social_environmental` | Mapeo Ambiental | Social | ✅ |
| `transversal_timeline` | Línea de Tiempo Unificada | Transversal | ✅ |
| `transversal_anonymize` | Reporte Anonimizado | Transversal | ✅ |
| `transversal_transcription` | Transcripción de Audio/Video (Whisper) | Transversal | ❌ (excluida de `getToolsByRole`) |

La transcripción no aparece como tarjeta en el hub, pero se invoca desde la galería de evidencias del caso (`/knowledge/transcribe`).

---

## 2. Rutas del hub

- `/herramientas` — hub principal: muestra las 12 herramientas visibles según el rol.
- `/herramientas/legal`, `/herramientas/psicologico`, `/herramientas/social`, `/herramientas/transversal` — vistas por módulo.
- `/copilot` — Copiloto IA (frontend restringido a ABOGADO, PSICOLOGO, SOCIAL).
- `/panel/admin/ia` — Configuración IA (texto/embedding/Whisper/visión; solo ADMIN).
- `/panel/admin/ia-procesos` — Procesos IA / cola de tareas (solo ADMIN).
- `/admin/tools-verification` — Verificar Herramientas / health checks (solo ADMIN).
- `/ingesta-caso` — Inicio de caso (SECRETARIA, JEFATURA, ADMINISTRADOR). No confundir con `/ingreso`, que es la página de login.

---

## 3. Matriz backend (protección real con `@Roles`)

| Endpoint | Roles permitidos (backend) |
|----------|---------------------------|
| `POST /legal-tools/*/analyze` | ABOGADO, ADMINISTRADOR |
| `POST /psychological-tools/*/analyze` | PSICOLOGO, ADMINISTRADOR |
| `POST /social-tools/*/analyze` | SOCIAL, ADMINISTRADOR |
| `POST /transversal-tools/timeline/unified` · `anonymizer/anonymize` | JEFATURA, ADMINISTRADOR |
| `GET /transversal-tools/timeline/case/:caseId` · `anonymizer/case/:caseId` | `CaseAccessGuard` (cualquier rol con acceso al caso) |
| `POST /knowledge/transcribe` · `analyze-image` · `queue-case` · `search-transcriptions` · `GET ai-status` · `ai-tasks` | ADMINISTRADOR, JEFATURA, ABOGADO, PSICOLOGO, SOCIAL |
| `GET /knowledge/documents` · `documents/:id/chunks` | ADMINISTRADOR, JEFATURA |
| `POST /knowledge/ingest` · `upload` · `upload-url` · `upload-markdown` · `toggle-status` · `DELETE documents/:id` | ADMINISTRADOR |
| `GET/POST /tools-admin/health` · `status` · `approve` · `approval-history` · `test-tools` | ADMINISTRADOR |
| `POST /ai/draft-legal-document` · `analyze-risk` · `chat` | **Solo `JwtAuthGuard` — SIN `RolesGuard`** ⚠️ |

> **Nota de seguridad**: `/ai/*` no aplica `@Roles`; cualquier rol autenticado (incluido SECRETARIA/REFERENTE_TUTOR) puede invocar los endpoints si conoce la ruta. El frontend lo restringe a los 3 roles profesionales, pero el backend no lo impone. Follow-up de seguridad separado.

---

## 4. Intención frontend vs backend 403 (mismatch conocido)

`apps/web/lib/role-access.ts` declara `TOOL_PERMISSIONS.write` más amplios que el backend:

| Herramienta | Write frontend | Write backend (real) | Resultado |
|-------------|----------------|----------------------|-----------|
| Legal (3) | ABOGADO, **JEFATURA**, ADMIN | ABOGADO, ADMIN | JEFATURA → **403** |
| Psicológicas (4) | PSICOLOGO, **JEFATURA**, ADMIN | PSICOLOGO, ADMIN | JEFATURA → **403** |
| Sociales (3) | SOCIAL, **JEFATURA**, ADMIN | SOCIAL, ADMIN | JEFATURA → **403** |
| Transversales (2) | **ABOGADO, PSICOLOGO, SOCIAL**, JEFATURA, ADMIN | JEFATURA, ADMIN | Profesionales → **403** |

- **JEFATURA**: el frontend habilita análisis de disciplina (legal/psicológicas/sociales) que el backend rechaza. En la UI actual el POST de análisis de una herramienta de disciplina de otro equipo devuelve 403.
- **Profesionales (ABOGADO/PSICOLOGO/SOCIAL)**: el frontend habilita write en herramientas transversales (Línea de Tiempo, Reporte Anonimizado) que el backend rechaza (solo JEFATURA+ADMIN).
- **Resolución**: bugfix de autorización front/back — **follow-up separado**, no documentado aquí como diseño. Mientras tanto, la UI muestra las acciones pero el backend es la fuente de verdad (403).

Lectura: todos los roles con herramienta pueden leer (`read` = los 5 roles en todas las herramientas).

---

## 5. Protección por capas

1. **JwtAuthGuard** — todo endpoint exige token JWT válido.
2. **RolesGuard + `@Roles`** — restringe por rol (matriz de la sección 3).
3. **CaseAccessGuard / CaseAccessService** — control de acceso al expediente: ADMINISTRADOR (todos), JEFATURA/SECRETARIA (oficina), profesionales (membresía activa en `caseTeamHistory`).
4. **Evidencias inmutables** — `DELETE/PATCH/PUT /evidences/:id` responden 405 (cadena de custodia).

---

## 6. Cómo verificar

| Rol | Esperado en `/herramientas` |
|-----|----------------------------|
| ADMINISTRADOR | 12 herramientas (todos los módulos) |
| JEFATURA | 12 herramientas visibles; analyze de disciplina → **403** (intención vs backend) |
| ABOGADO | Legales + transversales (5) |
| PSICOLOGO | Psicológicas + transversales (6) |
| SOCIAL | Sociales + transversales (5) |
| SECRETARIA | Sin herramientas |

---

**Fuente**: `apps/web/lib/role-access.ts` (toolIds, permisos frontend), `apps/api/src/modules/{legal,psychological,social,transversal}-tools/*.controller.ts`, `apps/api/src/modules/knowledge/knowledge.controller.ts`, `apps/api/src/modules/ai-assistant/ai-assistant.controller.ts`, `apps/web/components/layout/sidebar.tsx`.

**Última actualización**: 2026-08-04
