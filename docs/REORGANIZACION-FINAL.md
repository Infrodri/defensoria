# 📦 Reorganización Final de Documentación — docs/

**Fecha**: 2026-08-02  
**Objetivo**: Reestructurar la raíz de `docs/` (que tenía ~50 archivos sueltos) en carpetas por categoría, consolidando duplicados y moviendo versiones superadas a `obsoletos/`.

## 📂 Estructura Resultante

```
docs/
├── README.md ............... Índice maestro (reescrito)
├── 00-INDEX.md ............. Punto de entrada para agentes IA (rutas actualizadas)
├── 01-CONTEXTO-PROYECTO.md . Contexto general (sin cambios)
├── 02-ARQUITECTURA-RESUMEN.md (rutas actualizadas)
│
├── guias-usuario/ ......... Guías de usuario final (carpeta preexistente, intacta)
│   └── INICIO-RAPIDO-HERRAMIENTAS.md  (nuevo ingreso)
│
├── arquitectura/ ........... Técnica: arquitectura, integración, permisos, tooltips
├── entregas/ ............... Entregas y resúmenes de fases
├── testing/ ................ Testing, verificación y QA
├── agentes-ia/ ............. Instrucciones, delegaciones, prompts de agentes IA
└── obsoletos/ ................. Versiones superadas y referencias (NO eliminar)
```

Se conservan las carpetas técnicas ya existentes: `arquitectura/` (ADR y docs técnicos), `api/`, `modelo-datos/`, `seguridad/`, `rag/`, `hoja-de-ruta/`, `marco-legal/`, `ejemplos/`, `INSTRUCCIONES-AGENTE-TESTING/`, `SETUP-AGENTE-EJECUTOR/`.

---

## 🔄 Mapa antes → después

### → `arquitectura/`
| Origen | Destino |
|--------|---------|
| ARQUITECTURA-FINAL-COMPLETA.md | ARQUITECTURA-FINAL-COMPLETA.md |
| ARQUITECTURA-HERRAMIENTAS-PROFESIONALES.md | ARQUITECTURA-HERRAMIENTAS-PROFESIONALES.md |
| ARQUITECTURA-RESUMEN.md | (no existía) |
| ESTRUCTURA-HERRAMIENTAS-POR-PROFESIONAL.md | ESTRUCTURA-HERRAMIENTAS-POR-PROFESIONAL.md |
| HERRAMIENTAS-POR-PROFESIONAL-IMPLEMENTADO.md | HERRAMIENTAS-POR-PROFESIONAL-IMPLEMENTADO.md |
| HERRAMIENTAS-PROFESIONALES-STATUS.md | HERRAMIENTAS-PROFESIONALES-STATUS.md |
| MODULOS-ESPECIALIZADOS-POR-DISCIPLINA.md | MODULOS-ESPECIALIZADOS-POR-DISCIPLINA.md |
| PLAN-AMPLIADO-MODULOS-ESPECIALIZADOS.md | PLAN-AMPLIADO-MODULOS-ESPECIALIZADOS.md |
| PLAN-IMPLEMENTACION-HERRAMIENTAS.md | PLAN-IMPLEMENTACION-HERRAMIENTAS.md |
| PERMISOS-ROLES-HERRAMIENTAS.md | PERMISOS-ROLES-HERRAMIENTAS.md |
| ROLES-Y-PERMISOS-RESUMEN.md | ROLES-Y-PERMISOS-RESUMEN.md |
| CHECKLIST-LEGAL-TOOLS-COMPLETADO.md | CHECKLIST-LEGAL-TOOLS-COMPLETADO.md |
| UX-TOOLTIPS-IMPLEMENTACION.md | UX-TOOLTIPS-IMPLEMENTACION.md |
| ADMIN-TOOLS-VERIFICATION-PANEL.md | ADMIN-TOOLS-VERIFICATION-PANEL.md |
| DELEGACION-FRONTEND-PSYCHOLOGICAL-SOCIAL-TRANSVERSAL.md | DELEGACION-FRONTEND-PSYCHOL-SOCIAL-TRANSVERSAL.md |
| FRONTEND_API_PHASE2_DELIVERY.md | **consolidado** → INTEGRATION_FRONTEND_API.md |
| admin-master-plan.md | ADMIN-MASTER-PLAN.md |
| master-spec.md | MASTER-SPEC.md |
| system-overview.md | SYSTEM-OVERVIEW.md |

### `entregas/`
| Origen | Destino |
|--------|--------|
| ENTREGA-COMPLETA-PHASE2-Y-ADMIN.md | ENTREGA-PHASE2-HERRAMIENTAS-Y-ADMIN.md |
| FASE2-RESUMEN-ENTREGA-FINAL.md | FASE2-RESUMEN-ENTREGA-FINAL.md |
| RESUMEN-ENTREGA-PHASE2-COMPLETO.md | RESUMEN-ENTREGA-PHASE2-COMPLETO.md |
| HERRAMIENTAS-PHASE2-FINAL.md | HERRAMIENTAS-PHASE2-FINAL.md |
| RESUMEN-EJECUTIVO-FINAL.md | RESUMEN-EJECUTIVO-FINAL.md |
| RESUMEN-ESTADO-ACTUAL.md | RESUMEN-ESTADO-ACTUAL.md |
| RESUMEN-ENTREGA-INSTRUCCIONES.md | RESUMEN-ENTREGA-INSTRUCCIONES.md |
| RESUMEN-INSTRUCTIVAS-PM.md | RESUMEN-INSTRUCTIVAS-PM.md |
| RESUMEN-FINAL-LEGAL-TOOLS-PARA-CONTINUAR.md | RESUMEN-FINAL-LEGAL-TOOLS-PARA-CONTINUAR.md |
| RESPUESTA-EJECUTIVA-LEGAL-TOOLS.md | RESPUESTA-EJECUTIVA-LEGAL-TOOLS.md |
| PHASE2-TOOLS-SEED-DELIVERY.md | PHASE2-TOOLS-SEED-DELIVERY.md |
| SEED-PHASE2-TOOLS-README.md | SEED-PHASE2-TOOLS-README.md |
| FASE-2-COMPLETADA-RESUMEN-FINAL.txt | FASE-2-COMPLETADA-RESUMEN-FINAL.txt |
| RESUMEN-HERRAMIENTAS-IMPLEMENTACION.txt | RESUMEN-HERRAMIENTAS-IMPLEMENTACION.txt |

### `testing/`
| Origen | Destino |
|--------|--------|
| TESTING-PHASE2-STATUS.md | TESTING-PHASE2-STATUS.md |
| TESTING-MANUAL-HERRAMIENTAS.md | TESTING-MANUAL-HERRAMIENTAS.md |
| VERIFICACION-HERRAMIENTAS.md | VERIFICACION-HERRAMIENTAS.md |
| VERIFICACION-SINCRONIZACION.md | VERIFICACION-SINCRONIZACION.md |
| DELEGACION-TESTING-E2E-FASE2.md | DELEGACION-TESTING-E2E-FASE2.md |

### `agentes-ia/`
| Origen | Destino |
|--------|--------|
| INSTRUCCIONES-AGENTES-v2.md | INSTRUCCIONES-AGENTES.md (canónico; se mantiene nombre sin -v2) |
| INSTRUCTIVO-AGENTE-PASO-A-PASO.md | INSTRUCTIVO-AGENTE-PASO-A-PASO.md |
| GUIA-RAPIDA-AGENTES.md | GUIA-RAPIDA-AGENTES.md |
| PM-DELEGACION-AGENTES-IA.md | PM-DELEGACION-AGENTES-IA.md |
| PM-GUIA-RAPIDA.md | PM-GUIA-RAPIDA.md |
| INSTRUCTIVA-PM-PARA-AGENTES-FASE2.md | INSTRUCTIVA-PM-PARA-AGENTES-FASE2.md |
| LIDER-TECNICO-RESUMEN-INSTRUCCIVAS.md | LIDER-TECNICO-RESUMEN-INSTRUCCIVAS.md |
| ESTRATEGIA-DELEGACION-AGENTES.md | ESTRATEGIA-DELEGACION-AGENTES.md |
| MATRIZ-DELEGACIONES-FASE2.md | MATRIZ-DELEGACIONES-FASE2.md |
| PLANTILLAS-DELEGACION-TPV.md | PLANTILLAS-DELEGACION-TPV.md |
| PROMPTS-PARA-DELEGACIONES-AGENTES.md | PROMPTS-PARA-DELEGACIONES-AGENTES.md |
| PROMPT-FRONTEND-LEGAL-TOOLS.md | PROMPT-FRONTEND-LEGAL-TOOLS.md |
| AGENTES-OPERACIONALES-FASE2-LISTO.md | AGENTES-OPERACIONALES-FASE2.md |

### `guias-usuario/`
| Origen | Destino |
|--------|--------|
| INICIO-RAPIDO-HERRAMIENTAS.md | INICIO-RAPIDO-HERRAMIENTAS.md (agregado a carpeta existente) |

---

## 🗃️ Movidos a `obsoletos/` (versiones superadas / referencia — NO eliminar)

| Archivo | Por qué |
|---------|---------|
| INSTRUCCIONES-AGENTES.md (v1) | Superado por agentes-ia/INSTRUCCIONES-AGENTES.md (v2) |
| RESUMEN-IMPLEMENTACION-SEMANA1.md | Superado por entregas/ |
| ENTREGA-FINAL-HERRAMIENTAS.md | Superado por entregas/ENTREGA-PHASE2-... |
| LA-VERDAD-SOBRE-LAS-HERRAMIENTAS.md | Documento interno de estado |
| DOCUMENTO-FINAL-PARA-LIDER-TECNICO.txt | Nota txt superada |
| FRONTEND-LEGAL-TOOLS-COMPLETADO.txt | Nota txt superada |
| ESTRATEGIA-FRONTEND-DELEGADO.txt | Nota txt superada |
| LISTO-PARA-AGENTES.txt | Nota txt superada |
| known-risks.md | Se conserva (referencia de riesgos) → KNOWN-RISKS.md |
| GIT-MERGE-INSTRUCTIONS.md | Nota operativa puntual |
| REORGANIZACION-DOCUMENTACION.md | Propuesta previa de reorganización (ejecutada) |
| REORGANIZACION-PROPUESTA.md | Propuesta previa de reorganización (ejecutada) |
| CREDENCIALES-ADMIN.txt | **Contiene credenciales — conservado, NO eliminar** |
| URLS-CREDENCIALES-TESTING.txt | **Contiene credenciales — conservado, NO eliminar** |

---

## ✅ Verificaciones realizadas

- [x] Raíz de `docs/` quedó con solo: `README.md`, `00-INDEX.md`, `01-CONTEXTO-PROYECTO.md`, `02-ARQUITECTURA-RESUMEN.md`.
- [x] `README.md` e `00-INDEX.md` reescritos/actualizados con la nueva estructura y sin links rotos.
- [x] Referencias internas en docs activos actualizadas a rutas nuevas (sin doble prefijo).
- [x] `README.md` raíz del repo: 2 links de docs actualizados.
- [x] `guias-usuario/` preexistente: se respetó e intacta (solo se agregó 1 doc).
- [x] Credenciales `.txt` en `obsoletos/`, no se eliminaron.
- [x] Carpetas técnicas `arquitectura/`, `rag/`, `modelo-datos/`, `seguridad/`, `api/`, `hoja-de-ruta/`, `marco-legal/`, `ejemplos/` y subcarpetas de `rag/` intactas.

## 📝 Notas
- `apps/web/INTEGRATION_FRONTEND_API_PHASE2.md` (en el repo, 15.1kb) es la fuente canónica de integración frontend-API; en `docs/` quedó el resumen `arquitectura/INTEGRATION_FRONTEND_API.md`.
- No hay `.env.example` en el repo; las credenciales de BD quedan en `packages/db/.env`.

