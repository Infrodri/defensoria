# Architecture Decision Record (ADR) - Arquitectura Multidisciplinaria (Fase 3)

## ADR-019: Separación de Rol, Disciplina y Módulos
- **Status**: Accepted
- **Date**: 2026-08-01
- **Context**: Para la Fase 3 (IA y Asistente), el sistema debe distinguir entre la función administrativa de un usuario y su campo de conocimiento profesional. Hasta ahora, el enum `Role` mezclaba ambos conceptos, y `SystemModule` manejaba permisos de UI, pero faltaba una capa para los "dominios de conocimiento" de los profesionales (Abogados, Psicólogos, Trabajadores Sociales).
- **Decision**: 
  1. Mantener `Role` para la jerarquía del sistema (ADMINISTRADOR, JEFATURA, ABOGADO, etc.).
  2. Mantener `SystemModule` exclusivamente para navegación y RBAC (qué pantallas ven).
  3. Crear una nueva entidad `Discipline` que aplique **únicamente a roles profesionales**. 
  4. La relación entre `User` y `Discipline` será **1:N** (`User.disciplineId` opcional), garantizando que un profesional actúa legalmente bajo una única disciplina a la vez (evita ambigüedad en el LLM y en las contrataciones públicas).
- **Rationale**: Separar RBAC de Dominio de Conocimiento sigue el Principio de Responsabilidad Única. Hacerlo 1:N refleja la realidad legal de los ítems de contratación pública y reduce drásticamente la carga cognitiva del LLM (el prompt sabrá inequívocamente en calidad de qué actúa el usuario).
- **Consequences**: Permite que el Copiloto de IA separe prompts, herramientas y base de conocimiento (`KnowledgeDocument`) por disciplina. Requiere actualizar el modelo `User` y crear el CRUD de `Discipline` (restringido al rol ADMINISTRADOR).

## ADR-020: Inmutabilidad Histórica de Informes (Snapshot)
- **Status**: Accepted
- **Date**: 2026-08-01
- **Context**: Al cambiar el enfoque a que un `User` tenga una disciplina dinámica (puede cambiar si el profesional cambia de cargo), los informes generados en el pasado podrían perder su contexto legal.
- **Decision**: Los informes (`Report`) y otros documentos legales que requieran firma técnica deben guardar una "foto" (snapshot) del Rol y la Disciplina del autor en el momento exacto de la emisión.
- **Rationale**: Los expedientes de NNA requieren pistas de auditoría inmutables. Si un Psicólogo firma un informe hoy y mañana asciende a Jefatura (perdiendo su disciplina de Psicólogo en la tabla `User`), el informe emitido ayer debe seguir indicando legalmente que fue emitido por un Psicólogo.
- **Consequences**: El esquema de `Report` deberá incluir campos como `authorRoleSnapshot` y `authorDisciplineSnapshot`.

## ADR-021: Migración por Fases de ReportType
- **Status**: Accepted
- **Date**: 2026-08-01
- **Context**: El catálogo de tipos de informes está hardcodeado en el enum `ReportType`. Para que el sistema sea extensible (nuevas disciplinas = nuevos tipos de informes), se propuso pasarlo a base de datos (`DisciplineReportType`).
- **Decision**: La migración de `ReportType` será en 3 fases para no romper compatibilidad:
  1. Agregar `disciplineReportTypeId` (nullable) a `Report` y crear la tabla `DisciplineReportType`, coexistiendo con el enum.
  2. Script de migración de datos para popular la nueva columna en registros históricos.
  3. Deprecación del enum `ReportType` en el futuro.
- **Rationale**: Zero-downtime deployment. Evita romper la Fase 1 y 2 que ya están operando con el enum.
- **Consequences**: Coexistencia temporal de dos estrategias de tipificación en la base de datos durante la Fase 3.
- **Estado 2026-08-05**: Fase 3 implementada — enum `ReportType` eliminado, `Report` usa `disciplineReportType.category` (tabla `DisciplineReportType`), columna `coAuthorId` agregada.

## ADR-022: Delegación de Autorización en Herramientas de IA
- **Status**: Accepted
- **Date**: 2026-08-01
- **Context**: Las futuras herramientas del Copiloto de IA (ej. `consultar_expediente`) necesitan validar si el usuario tiene permiso para acceder a la información de un NNA.
- **Decision**: Las herramientas del agente **NO** implementarán lógica de autorización propia ni asumirán la existencia de RLS en base de datos.
- **Rationale**: Cualquier herramienta de IA que acceda a casos debe inyectar el service-layer centralizado (`CaseAccessService.assertUserHasAccess`) que se estandarizó en la Fase 2.5.
- **Consequences**: La seguridad es consistente al 100% entre la API REST tradicional y las interacciones conversacionales de la IA. No hay segunda fuente de verdad.
