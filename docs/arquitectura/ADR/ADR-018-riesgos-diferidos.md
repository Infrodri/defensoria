# ADR-018 — Riesgos Técnicos Diferidos Conscientemente
**Estado:** Accepted
**Fecha:** 2026-08-01

## Contexto
Una exploración de código real (lectura exhaustiva de `apps/api`) identificó 14 riesgos técnicos (ver `docs/obsoletos/KNOWN-RISKS.md`). Dos de ellos (R2: IDOR en `cases.findOne`, R7a: cero infraestructura de tests) son críticos y bloquean la construcción de cualquier herramienta de IA sobre expedientes — se abordan de inmediato como Fase 2.5. Los ocho restantes (R6, R8–R14) son reales pero no bloquean ni Fase 2.5 ni Fase 3.

## Decisión
Se difieren conscientemente R6, R8, R9, R10, R11, R12, R13, R14, con el siguiente tratamiento diferenciado:

- **R9 (secretos hardcodeados), R10 (sin migraciones), R12 (CORS abierto)** quedan marcados como **bloqueantes de pre-producción** — no se difieren indefinidamente, se difieren hasta el checklist de salida a producción sobre el servidor del GAM. No se despliega a producción sin resolver estos tres.
- **R6 (`@Roles` incompleto), R7b (cobertura de tests general), R8 (lint roto), R11 (UUID v4 vs v7), R13 (drift de docs), R14 (ruta `start:prod`)** quedan como deuda técnica de prioridad normal, sin fecha de bloqueo — se atienden en el flujo de trabajo continuo, no como sprint dedicado.

## Razón
Extender el alcance de la iteración de endurecimiento de autorización (Fase 2.5) para cubrir los 14 riesgos de una sola vez retrasaría innecesariamente la corrección de los dos únicos riesgos que bloquean Fase 3 (R2, R7a). Congelar el resto en un documento vivo (`known-risks.md`) es preferible a resolverlos apurados o a perderlos de vista por no tener dónde registrarlos.

## Consecuencias
- `docs/obsoletos/KNOWN-RISKS.md` es la fuente de verdad de este estado; se actualiza cada vez que un riesgo cambia, no se reescribe este ADR por cada resolución individual.
- Ningún despliegue a producción sobre infraestructura del GAM procede sin que R9, R10 y R12 estén marcados como resueltos en `known-risks.md`.
- Este ADR no autoriza ignorar riesgos nuevos que aparezcan — solo documenta la decisión sobre los 14 ya identificados a esta fecha.


