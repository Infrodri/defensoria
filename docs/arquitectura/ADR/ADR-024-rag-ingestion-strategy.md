# ADR-024: Estrategia de Ingesta RAG (HTML Scraping vs PDF)
- **Status**: Accepted
- **Date**: 2026-08-01
- **Context**: Durante la implementación de la Fase 3 (Base de Conocimiento Jurídico - Plano A), se utilizó inicialmente `pdf-parse` para extraer texto de leyes bolivianas en PDF (ej. Código Niña Niño y Adolescente, 144 páginas). 
El proceso de particionar (chunking) y enviar cientos de fragmentos al motor local de Ollama generaba un cuello de botella en la memoria (RAM/VRAM), colapsando el servidor (`Internal Server Error 500` en Ollama) y dejando documentos huérfanos con ingestas parciales (ej. 6 fragmentos procesados de 201). Además, la estructura del PDF incluía encabezados, pies de página y cortes de línea artificiales que destruían el contexto RAG.
- **Decision**: 
  1. **Priorizar Ingesta Web (HTML)**: Se implementa soporte primario para inyectar conocimiento directamente desde URLs estructuradas (ej. Lexivox) utilizando la librería `cheerio` en el backend (NestJS).
  2. **Limpieza de DOM**: Se remueven activamente etiquetas no semánticas (`script`, `nav`, `footer`) y se fuerza la separación lógica en bloque (`<p>`, `<h1>`) convirtiéndolos en dobles saltos de línea (`\n\n`).
  3. **Chunking Defensivo Dinámico**: El algoritmo de fragmentación se modificó para limitar **estrictamente a 1500 caracteres** por chunk. Si un párrafo supera este límite, se subdivide iterativamente por oraciones (buscando `.`, `!`, `?`) para asegurar que ningún fragmento sature la ventana de contexto (Context Window) del modelo de embeddings (`nomic-embed-text`).
- **Rationale**: El HTML provee una estructura semántica muy superior al PDF. La extracción web es más ligera en CPU/RAM, y el chunking dinámico garantiza que el motor Ollama no reciba cargas inmanejables, eliminando por completo los errores de límite de memoria.
- **Consequences**:
  - Se añade `cheerio` como dependencia principal en `apps/api`.
  - La interfaz de usuario (UI) prioriza y recomienda la subida vía Enlace Web.
  - El sistema ahora maneja el ordenamiento de fragmentos en el visor de chunks vía JavaScript en lugar de SQL crudo (CAST), evitando errores de compatibilidad con `JSONB` de Prisma en PostgreSQL.
