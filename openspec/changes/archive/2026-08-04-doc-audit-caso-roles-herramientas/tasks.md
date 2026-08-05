# Tasks: Auditoría y alineación de documentación (inicio de caso, roles y herramientas)

Cambio doc-only. Fuente: proposal + exploración (obs #547) + discovery (obs #548). Sin specs ni design (no hay `openspec/specs/`; los docs son el entregable). No tocar código de aplicación.

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 620–1090 total; PR1: 300–450 · PR2a: 160–300 · PR2b: 160–340 |
| 400-line budget risk | High global; Medium por PR (PR1 es el más ajustado) |
| Chained PRs recommended | Yes |
| Suggested split | PR1 → PR2a → PR2b (stacked-to-main, merges en orden) |
| Delivery strategy | force-chained |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Base | Notes |
|------|------|-----------|------|-------|
| 1 | Guías ingesta: SECRETARIA + FLUJO + HERRAMIENTAS-SISTEMA | PR1 | main | 3 guías, base ~1.480 líneas; empieza y termina solo |
| 2a | Arquitectura: PERMISOS-ROLES-HERRAMIENTAS + ROLES-Y-PERMISOS-RESUMEN | PR2a | main (tras merge PR1) | 2 docs |
| 2b | Guías restantes: JEFATURA + SOCIAL + ADMINISTRADOR + INICIO-RAPIDO + README | PR2b | main (tras merge PR2a) | 5 guías |

Cadena stacked-to-main: cada PR apunta a main; PR2a y PR2b se abren/mergean DESPUÉS del merge del PR previo para mantener diffs limpios. Si algún PR supera 400 líneas en apply, subdividirlo (ej. PR1 → PR1a SECRETARIA+FLUJO / PR1b HERRAMIENTAS).

## Slice 1 (PR1) — guías de ingesta y herramientas

- [x] 1.1 `docs/guias-usuario/GUIA-SECRETARIA.md` — REESCRITURA de secciones de ingesta: URL `/ingreso`→`/ingesta-caso` (L9, L32), estado inicial `PENDIENTE_ASIGNACIÓN`→`DERIVACION` (L206), tipos de caso→catálogo `CASE_TYPES` (7 valores), prioridades→`NORMAL/URGENTE/CRITICA`, denunciante 3º opcional, sin cita automática. ~100 líneas
- [x] 1.2 `docs/guias-usuario/FLUJO-COMPLETO-CASO-REAL.md` — REESCRITURA de fases: URL (L45, L660), `EN_PROCESO`→`DERIVACION` (L218), triggers reales (ficha social→EVALUACION; informes→SEGUIMIENTO), denunciante opcional, resolver autocontradicción (L661). ~130 líneas
- [x] 1.3 `docs/guias-usuario/GUIA-HERRAMIENTAS-SISTEMA.md` — REESCRITURA: agregar Anonimización, Transcripción IA, Copiloto IA (`/copilot`), Análisis de imágenes, Procesos IA (`/panel/admin/ia-procesos`), Config IA (`/panel/admin/ia`); nombres reales (ACES/PHQ-9, Estructura Familiar, Evaluación Vulnerabilidad); modelo visión configurable (default `gemma4-tasks:latest`, no `llava`); 12 visibles/13 toolIds; ruta `/herramientas`. ~120 líneas
- [x] 1.4 Verificar PR1: `rg -n "PENDIENTE_ASIGNACIÓN|EN_PROCESO|llava"` en los 3 archivos → 0; `/ingreso` solo como página de login, ingesta siempre `/ingesta-caso`. ~0 líneas

## Slice 2a (PR2a) — arquitectura

- [x] 2.1 `docs/arquitectura/PERMISOS-ROLES-HERRAMIENTAS.md` — REESCRITURA: `/tools-demo`→`/herramientas` (todas las ocurrencias, L34–300), "❌ Ingesta"→"Inicio de caso" (3 ocurrencias), matriz real con nota "intención frontend vs backend 403" (JEFATURA sin write en analyze de disciplina; profesionales sin transversales; ref. bugfix follow-up), 13 toolIds/12 visibles, mención `/ai/*` sin RolesGuard. ~150 líneas
- [x] 2.2 `docs/arquitectura/ROLES-Y-PERMISOS-RESUMEN.md` — REESCRITURA de matrices y sidebar: ADMIN 20 / JEFATURA 9 (con Herramientas) / ABOG-PSIC-SOCIAL 5 (sin "Agenda y Citas") / REFERENTE_TUTOR 3; REPORTS y EVIDENCES sin `@Roles` (cualquier rol con acceso al caso); USERS CRUD completo ADMIN+JEFATURA; KNOWLEDGE lectura solo ADMIN+JEFATURA. ~100 líneas
- [x] 2.3 Verificar PR2a: `rg -n "/tools-demo|Ingesta"` en los 2 archivos → 0. ~0 líneas

## Slice 2b (PR2b) — guías restantes

- [x] 2.4 `docs/guias-usuario/GUIA-JEFATURA.md` — CORRECCIÓN: `PENDIENTE_ASIGNACIÓN`→`DERIVACION` (L90), quitar "acceso completo a todas las herramientas"→alcance real (403 en analyze de disciplina; nota intención vs backend), sidebar 9 ítems, trigger de fase real. ~60 líneas
- [x] 2.5 `docs/guias-usuario/GUIA-SOCIAL.md` — CORRECCIÓN: eliminar herramientas inexistentes (ecomapa de redes, guía de visitas domiciliarias), nombres reales (Estructura Familiar, Evaluación Vulnerabilidad), 3 tools sociales (`social_family/vulnerability/environmental`). ~60 líneas
- [x] 2.6 `docs/guias-usuario/GUIA-ADMINISTRADOR.md` — CORRECCIÓN: `/tools-demo`→`/herramientas` (L67), 12 herramientas visibles, procesos IA (`/panel/admin/ia-procesos`) y Config IA (`/panel/admin/ia`). ~50 líneas
- [x] 2.7 `docs/guias-usuario/INICIO-RAPIDO-HERRAMIENTAS.md` — CORRECCIÓN: puerto `4000`→`4100` (L13), login `(auth)/ingreso`, rutas reales. ~30 líneas
- [x] 2.8 `docs/guias-usuario/README.md` — CORRECCIÓN: eliminar links rotos (`TROUBLESHOOTING.md`, `CASOS-EJEMPLO/`), `/tools-demo`→`/herramientas`. ~30 líneas. OJO: este archivo ya está modificado en el working tree (cambio preexistente de sesiones anteriores) — primero LEE el estado actual del archivo; corrige lo que corresponda a la task 2.8 y commitea el resultado SOLO si el diff neto corresponde a PR2b; si el cambio preexistente es ajeno, revísalo y decide, reportando tu decisión.
- [x] 2.9 Verificar PR2b: `rg -n "/tools-demo|localhost:4000|PENDIENTE_ASIGNACIÓN|TROUBLESHOOTING|CASOS-EJEMPLO"` en los 5 archivos → 0. ~0 líneas

## Verification global (tras ambos PRs)

- [x] 3.1 `rg -n "/ingreso|/tools-demo|localhost:4000|4000/api|PENDIENTE_ASIGNACIÓN|EN_PROCESO|llava|TROUBLESHOOTING|CASOS-EJEMPLO"` sobre los 10 docs tocados → 0 matches (ingesta = `/ingesta-caso`; `/ingreso` solo login legítimo).
- [x] 3.2 Confirmar success criteria del proposal: matrices alineadas con `@Roles` + nota intención/backend; inventario 13 toolIds/12 visibles; sidebar 20/9/5; `CASE_TYPES` y prioridades reales.

## Out of scope (follow-ups, no planificar aquí)

- Bugfix de autorización front/back (mismatch `role-access.ts` vs 403 backend: JEFATURA en analyze de disciplina; profesionales en transversales) — follow-up separado; solo nota en docs.
- RolesGuard en `/ai/*` (hoy solo JwtAuthGuard) — follow-up de seguridad; solo mención en docs.
