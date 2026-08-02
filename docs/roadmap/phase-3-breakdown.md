# Project Roadmap: Phase 3 Breakdown

This document details the third phase of the DNA Case Management System implementation, focusing on Local AI Assistance (Ollama) and the Advanced Procedural Timeline.

## Phase 3 — Inteligencia Artificial Local & Línea de Tiempo Procesal
**Duration:** 2-3 weeks
**Dependencies:** Phase 1 and Phase 2 complete

### Contexto Legal y de Privacidad
Debido a la naturaleza extremadamente sensible de los datos de Niñas, Niños y Adolescentes (NNA), **está estrictamente prohibido** enviar información nominal a APIs de IA en la nube (como OpenAI, Anthropic, Google Gemini) sin autorización legal. 
Toda asistencia de IA debe ejecutarse de forma **local** utilizando herramientas como Ollama (con modelos como Llama 3 o Mistral) alojados en la misma infraestructura on-premise del GAM.

### Tasks

#### 1. Integración de IA Local (Ollama) - `AiAssistantModule`
- [ ] Configurar el cliente HTTP en NestJS para comunicarse con la API local de Ollama (por defecto en `http://localhost:11434`).
- [ ] Implementar **Generador Asistido de Borradores**:
  - Endpoint que reciba el contexto del expediente (resumen narrativo, informes psicológicos/sociales).
  - Prompt del sistema ajustado al marco legal boliviano (Ley 548).
  - Retornar un borrador estructurado de memorial o informe jurídico.
- [ ] Implementar **Asistente de Evaluación de Riesgo**:
  - Endpoint que analice la narrativa de la denuncia y sugiera (como recomendación no vinculante) indicadores de riesgo para orientar al equipo interdisciplinario.
- [ ] Todos los resultados de la IA deben marcarse explícitamente como "Generados por IA - Requieren revisión humana".

#### 2. Línea de Tiempo Procesal Avanzada (`TimelineComponent`)
- [ ] Consolidar en un solo endpoint backend (`GET /api/cases/:caseId/timeline`) todos los eventos del caso, ordenados cronológicamente:
  - Creación del caso (Ingesta).
  - Actuaciones de la Bitácora (`ActionLog`).
  - Citas y Audiencias (`Appointment`).
  - Informes Profesionales Emitidos (`Report`).
  - Subida de Evidencias (`Evidence`).
  - Cambios de Fase del Expediente (`PhaseChange` o historial).
- [ ] Construir en el frontend (`apps/web`) un componente visual `CaseTimeline` interactivo que muestre esta historia consolidada, con iconos diferenciados por tipo de evento.

#### 3. Frontend Integration (`apps/web`)
- [ ] Crear el componente `AiDraftAssistant` (Copiloto Local) accesible principalmente por el Área Legal y Psicosocial para sugerencia de textos.
- [ ] Integrar el componente `CaseTimeline` en la vista de detalle del expediente (`/casos/[id]`).

---

### Acceptance Criteria
- [ ] El sistema se conecta exitosamente a una instancia local de Ollama.
- [ ] Los profesionales legales pueden solicitar un borrador de escrito judicial a la IA, y este se genera localmente sin enviar datos a la nube.
- [ ] La IA sugiere indicadores de riesgo basados en la narrativa, presentados como texto de apoyo.
- [ ] El componente de Línea de Tiempo muestra de forma consolidada e interactiva la historia completa del expediente (ingesta, bitácora, agenda, informes, evidencias).
