# Archive Report: doc-audit-caso-roles-herramientas

Fecha de archivo: 2026-08-04
Modo de artifact store: hybrid (Engram + openspec)
Tipo de cambio: Doc-only (sin delta de specs; los 10 docs tocados SON el entregable)

## Estado final

- **Verificación global: PASS** — sin CRITICALs (verify-report, obs #557).
- **Tasks 1.1–2.9 (implementación): 15/15 completadas** (apply-progress, obs #551).
- **Tasks 3.1–3.2 (verificación global): PASS** — reconciliación de checkboxes stale en archive.
- **Success criteria del proposal: cumplidos** (0 refs a patrones prohibidos; matrices alineadas con `@Roles` + nota intención/backend 403; inventario 13 toolIds/12 visibles; sidebar 20/9/5 + REFERENTE 3; CASE_TYPES y prioridades reales).

### Reconciliación excepcional de checkboxes stale (registrada)

Las tareas 3.1 y 3.2 (verificación global) quedaron sin marcar (`- [ ]`) en `tasks.md` porque la verificación la ejecutó `sdd-verify` como fase externa. El orquestador instruyó explícitamente proseguir con el archive y apply-progress (obs #551) + verify-report (obs #557) prueban que ambas tareas están completas (PASS con evidencia de grep y verificación de criterios 3.2a–3.2f). Por ello se marcaron `[x]` en el archive; el audit trail no contiene tareas de trabajo completado sin marcar.

## Work units / ramas

| Rama | Slice | Commits | Líneas |
|------|-------|---------|--------|
| feat/phase1-consolidated-record | PR1 (3 docs: SECRETARIA, FLUJO-COMPLETO, HERRAMIENTAS-SISTEMA) | 3554c88, 600987f, 4502478, e193efd | 263+/34− = 297 |
| feat/doc-audit-pr2a | PR2a (2 docs: PERMISOS-ROLES-HERRAMIENTAS, ROLES-Y-PERMISOS-RESUMEN) | 301195f, 81874ca, df4a3c4 | 141+/570− = 711 |
| feat/doc-audit-pr2b | PR2b (5 docs: JEFATURA, SOCIAL, ADMINISTRADOR, INICIO-RAPIDO, README) | 2eeaa3e, a0f45d4, 2783d7a, 82f2b2f, 02288ec, a06da87 | 68+/52− = 120 |

**PRs no abiertos** (decisión del orquestador/usuario): no hay remote configurado. Al abrir, seguir cadena stacked-to-main PR1 → PR2a → PR2b; PR2a excede el budget de 400 líneas (711, mayormente borrado de matrices obsoletas: 570− vs 141+) → subdividir en PR2a1/PR2a2 (commits ya separados: 301195f=343, 81874ca=368, ambos < 400).

## Specs sync

**Ninguna.** No existe `openspec/specs/` (directorio presente pero vacío) ni carpeta `specs/` en el change; el cambio es doc-only y los documentos entregables en `docs/` son el entregable. No hubo deltas que fusionar → sin merge destructivo (config `rules.archive: Warn before merging destructive deltas` no aplica).

## Artefactos archivados

Path: `openspec/changes/archive/2026-08-04-doc-audit-caso-roles-herramientas/`

| Artefacto | Path archivado | Engram (topic key / obs) |
|-----------|----------------|--------------------------|
| Proposal | `proposal.md` | `sdd/doc-audit-caso-roles-herramientas/proposal` |
| Tasks | `tasks.md` (17/17 `[x]`) | `sdd/doc-audit-caso-roles-herramientas/tasks` |
| Verify report | `verify-report.md` | `sdd/doc-audit-caso-roles-herramientas/verify-report` (obs #557) |
| Apply progress | — | `sdd/doc-audit-caso-roles-herramientas/apply-progress` (obs #551) |
| Archive report | `archive-report.md` | `sdd/doc-audit-caso-roles-herramientas/archive-report` |

## Follow-ups pendientes (NO parte de este change)

1. Bugfix de autorización front/back: mismatch `role-access.ts` vs 403 backend (JEFATURA en analyze de disciplina; profesionales en transversales) — documentado en docs como intención con nota.
2. RolesGuard en `/ai/*` (hoy solo JwtAuthGuard) — follow-up de seguridad; mención en docs.
3. Upload de evidencias sin `CaseAccessGuard` (discovery obs #553).
4. Limpiar/stashear cambios de código sin commitear en el working tree (ajenos a este change) antes de abrir PRs.
5. Sin remote configurado: decidir retarget/rebase (rama PR1 tiene 62 commits vs master) al abrir PRs.

## SUGGESTIONs de verify (no bloqueantes, sin acción en archive)

- FLUJO-COMPLETO L185–203: etiquetas de triage no mapean al catálogo CASE_TYPES (opcional).
- GUIA-SECRETARIA L413: "DERIVACIÓN" como tipo de actuación solapa Phase.DERIVACION (opcional).
- README L52–62: tabla sin total 13/12 (menor exhaustividad).
