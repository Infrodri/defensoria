# FASE 3 — ARQUITECTURA DE IA LOCAL SOBERANA
## Defensoría NNA — Sucre, Bolivia — v1.0

## ADR-023: Arquitectura Base de Inteligencia Artificial (Fase 3)
- **Status**: Accepted
- **Date**: 2026-08-01
- **Context**: El sistema requiere un "Copiloto" de IA que asista a los profesionales (Abogados, Psicólogos, Trabajadores Sociales) en el análisis de expedientes, resumen de audiencias y redacción de memoriales/informes. Por la sensibilidad de los datos (menores de edad), es impensable enviar información a APIs de terceros (OpenAI, Anthropic). Se necesita una arquitectura 100% local, escalable en hardware modesto y auditable.
- **Decision**: 
  1. **Cero Fine-Tuning**: El modelo de lenguaje nunca se entrenará con datos de los casos. Toda la información ingresará al contexto mediante RAG (Retrieval-Augmented Generation).
  2. **Planos de Conocimiento**: 
     - **Plano A (Base Jurídica)**: Público. Leyes, jurisprudencia, protocolos. Accesible por cualquier profesional.
     - **Plano B (Datos del Caso)**: Privado. Evidencia e informes del expediente. Totalmente aislado por `caso:<id>`. Protegido por el mismo `CaseAccessService` de la Fase 2.5.
  3. **Motores de IA Locales**:
     - **Generación**: Qwen3-8B (Ollama / llama.cpp) (8GB VRAM max).
     - **Embeddings**: bge-m3 o multilingual-e5-large (CPU).
     - **Audio/OCR**: faster-whisper + WhisperX / Qwen-VL (CPU/GPU secundario).
  4. **Gate de Validación Humana**: Todo documento ingerido vía OCR o transcripción de audio se marca como `OCR_AUTOMATICO` (en la tabla `Evidence`) y NO puede ser usado por la IA hasta que un humano lo cambie a `VALIDADO_HUMANO`.
  5. **Plantillas e Instrumentos Estrictos**: La IA no improvisa formatos legales. Usa las estructuras JSON/Markdown rígidas definidas en `DocumentTemplate` e `Instrument` creadas por Jefatura.
- **Rationale**: Esta arquitectura minimiza el riesgo de alucinaciones (Gate Humano + Plantillas Rígidas), asegura la soberanía del dato (100% offline) y permite correr en infraestructura municipal modesta (RTX 5060, 32GB RAM).
- **Consequences**:
  - Reemplazo de la imagen `postgres:16` por `pgvector/pgvector:pg16` para manejar embeddings en la misma base de datos sin necesidad de Chroma/Qdrant.
  - El servidor de Ollama debe agregarse al entorno de contenedores (`docker-compose.yml`) sin puertos expuestos al exterior.
  - Las herramientas del Agente estarán estrechamente acopladas a la base de datos de Prisma y requerirán orquestación asíncrona intensiva.
