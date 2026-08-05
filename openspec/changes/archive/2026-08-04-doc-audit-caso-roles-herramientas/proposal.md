# Propuesta: Auditoría y alineación de documentación (inicio de caso, roles y herramientas)

## Intent

La documentación de usuario y arquitectura quedó desactualizada frente al código real: la ingesta apunta a `/ingreso` (página de LOGIN) en vez de `/ingesta-caso`; se documentan estados inexistentes (`PENDIENTE_ASIGNACIÓN`, `EN_PROCESO`), tipos de caso y prioridades ajenos a los enums, herramientas omitidas, rutas eliminadas (`/tools-demo`) y puerto 4000 vs 4100 real. El onboarding de Secretaría, Jefatura y profesionales se basa en información incorrecta. Este cambio alinea TODA la doc afectada con la realidad del código, sin tocar código.

## Scope

### In Scope
- Corrección de URLs, estados (`DERIVACION` + phase enum), catálogo `CASE_TYPES`, prioridades `NORMAL/URGENTE/CRITICA` y disparadores reales de fase (ficha social → EVALUACION; informes → SEGUIMIENTO).
- Inventario real de herramientas (13 toolIds, 12 visibles) y rutas (`/herramientas`, `/copilot`, IA).
- Matrices de roles/permisos alineadas con los `@Roles` reales de los controllers.
- Sidebar counts reales (20/9/5) y puerto 4100.
- Nota de desalineación front/back con recomendación de bugfix follow-up.

### Out of Scope
- NO tocar código de aplicación.
- NO resolver el bug de autorización front/back (follow-up separado).
- NO regenerar la app ni ejecutar migraciones.
- GUIA-PSICOLOGO/ABOGADO: solo correcciones puntuales de sidebar, sin reescritura.

## Capabilities

- **New**: None — cambio de documentación, sin specs funcionales nuevas.
- **Modified**: None — no existen `openspec/specs/`; los docs son el entregable, no delta de comportamiento.

## Approach

Doc-only. Hechos fuente: exploración verificada (obs #547) y discovery del mismatch (obs #548). Decisión de documentación: las matrices reflejan la **INTENCIÓN** de acceso (frontend `role-access.ts`) con nota explícita de que el backend rechaza con 403 (JEFATURA en analyze de disciplina; profesionales en transversales) y referencia al bugfix follow-up — no se documenta el comportamiento buggy como diseño. Redacción en español, consistente con los archivos tocados.

## Affected Areas

| Área | Impacto | Descripción |
|------|---------|-------------|
| `docs/guias-usuario/GUIA-SECRETARIA.md` (590) | Modificado | URL ingesta, estado inicial, tipos/prioridad |
| `docs/guias-usuario/FLUJO-COMPLETO-CASO-REAL.md` (696) | Modificado | Triggers de fase, estados, denunciante opcional |
| `docs/guias-usuario/GUIA-HERRAMIENTAS-SISTEMA.md` (194) | Modificado | +5 herramientas, nombres reales, modelo visión |
| `docs/guias-usuario/GUIA-JEFATURA.md` (287) | Modificado | Alcance real de herramientas, sidebar 9 |
| `docs/guias-usuario/GUIA-SOCIAL.md` (459) | Modificado | Herramientas inexistentes, nombres reales |
| `docs/guias-usuario/GUIA-ADMINISTRADOR.md` (263) | Modificado | 12 herramientas, procesos IA |
| `docs/guias-usuario/INICIO-RAPIDO-HERRAMIENTAS.md` (226) | Modificado | Puerto 4100, login, rutas |
| `docs/guias-usuario/README.md` (94) | Modificado | Links rotos (TROUBLESHOOTING, CASOS-EJEMPLO) |
| `docs/arquitectura/PERMISOS-ROLES-HERRAMIENTAS.md` (304) | Modificado | Quitar `/tools-demo`, matriz real, "Inicio de caso" |
| `docs/arquitectura/ROLES-Y-PERMISOS-RESUMEN.md` (348) | Modificado | Sidebar counts, matriz REPORTS/USERS/KNOWLEDGE |

## Delivery slices (force-chained, stacked-to-main)

- **Slice 1 (PR1)**: GUIA-SECRETARIA + FLUJO-COMPLETO + GUIA-HERRAMIENTAS-SISTEMA. Base ~1.480 líneas; cambio estimado **300–450 líneas**.
- **Slice 2 (PR2)**: arquitectura (2) + JEFATURA + SOCIAL + ADMINISTRADOR + INICIO-RAPIDO + README. Base ~1.981 líneas; cambio estimado **400–600 líneas** — probable subdivisión en sdd-tasks para respetar el budget de 400.

## Risks

| Riesgo | Likelihood | Mitigación |
|--------|-----------|------------|
| Doc desactualizada → onboarding incorrecto (Secretaría cargaría casos en login) | Alto (actual) | Corrección completa en slices 1–2 |
| Mismatch front/back activo (403) documentado como intención | Alto | Nota explícita + follow-up bugfix separado |
| `/ai/*` sin RolesGuard expone endpoints a cualquier rol autenticado | Medio | Mención en doc + follow-up de seguridad |
| Slice 2 excede 400 líneas → review fatigue | Medio | Subdivisión en sdd-tasks |

## Rollback Plan

`git revert` de los archivos `.md` únicamente; sin impacto en runtime ni datos.

## Dependencies

Ninguna. Bugfix de permisos y RolesGuard `/ai/*` quedan como follow-ups no bloqueantes.

## Success Criteria

- [ ] 0 referencias a `/ingreso` como ingesta, `/tools-demo`, puerto 4000, `PENDIENTE_ASIGNACIÓN`, `EN_PROCESO`, "llava".
- [ ] Matrices de roles alineadas con `@Roles` reales (con nota de intención vs backend).
- [ ] Inventario de herramientas = 13 toolIds / 12 visibles, rutas reales.
- [ ] Sidebar counts 20/9/5; `CASE_TYPES` y prioridades reales.
- [ ] Verificación grep de patrones prohibidos en todos los docs tocados.
