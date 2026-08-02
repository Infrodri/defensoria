# Sistema RAG — Índice Completo

**Para Agentes IA**: Este es el punto de entrada para TODO sobre el sistema RAG. Muestra los documentos reales disponibles en `rag/` y su contenido. Todo enlaces apunta a archivos existentes en el repo.

---

## 📂 Estructura Real de `rag/`

```
rag/
├── 00-RAG-INDEX.md                              ← TÚ ESTÁS AQUÍ (este archivo)
├── guias/
│   ├── ingestion-guide.md                       ← Cómo ingestar documentos legales
│   └── markdown-template.md                     ← Formato correcto de Markdown legal
├── implementation/
│   ├── chunking-implementation.md               ← Solución a la fragmentación (UN ARTÍCULO = UN CHUNK)
│   └── new-features.md                          ← Nuevas funcionalidades (migración, validador, preview)
└── testing/
    └── test-plan.md                             ← Plan de pruebas del sistema RAG
```

> Nota: el ejemplo `ley-1371-complete.md` vive en la raíz de docs en [`../ejemplos/ley-1371-complete.md`](../ejemplos/ley-1371-complete.md). Las decisiones técnicas (ADR) relevantes al RAG viven en [`arquitectura/ADR/`](../arquitectura/ADR/).

---

## 🔍 Documentos por Tema

### Implementación (Desarrolladores)
| Documento | Tema | Tiempo |
|-----------|------|--------|
| [implementation/chunking-implementation.md](implementation/chunking-implementation.md) | Solución a la fragmentación | 20 min |
| [implementation/new-features.md](implementation/new-features.md) | Nuevas funcionalidades | 15 min |

### Guías de Ingesta (Administradores / Usuarios)
| Documento | Para quién | Tiempo |
|-----------|------------|--------|
| [guias/ingestion-guide.md](guias/ingestion-guide.md) | Administradores | 15 min |
| [guias/markdown-template.md](guias/markdown-template.md) | Todos | 10 min |

### Testing
| Documento | Tema | Tiempo |
|-----------|------|--------|
| [testing/test-plan.md](testing/test-plan.md) | Plan de testing | 20 min |

---

## 🚀 Flujos de Lectura por Objetivo

### Objetivo 1: "Ingestar un documento legal"
```
1. guias/ingestion-guide.md             (15 min)
2. guias/markdown-template.md           (10 min)
3. ../ejemplos/ley-1371-complete.md     (5 min - ver ejemplo)
```
**Resultado**: Sabrás cómo preparar e ingestar leyes.

### Objetivo 2: "Entender la implementación técnica RAG"
```
1. implementation/chunking-implementation.md       (20 min)
2. implementation/new-features.md                  (15 min)
3. apps/api/src/modules/knowledge/                 (revisar código)
```
**Resultado**: Entenderás cómo funciona el sistema y su chunking por artículo.

### Objetivo 3: "Testear el sistema RAG"
```
1. testing/test-plan.md                  (20 min)
2. ../ejemplos/ley-1371-complete.md      (usar como test data)
3. Ejecutar tests del plan
```
**Resultado**: Verificarás que el sistema funciona correctamente.

---

## 📖 Conceptos Clave

### Chunking
**Estrategia**: UN ARTÍCULO LEGAL = UN CHUNK

**Antes** (malo):
```
Chunk #1: "Artículo 1.- (OBJETO) La presente ley..."
Chunk #2: "...tiene por objeto modificar..."  ← Cortado
```

**Ahora** (bueno):
```
Chunk #1: "Artículo 1.- (OBJETO) La presente ley tiene por objeto modificar la Ley 548... [contenido completo]"
Chunk #2: "Artículo 2.- (FINALIDAD) La finalidad... [contenido completo]"
```

### Embeddings
- **Modelo**: nomic-embed-text (local, CPU)
- **Dimensiones**: 768
- **Servidor**: Ollama (localhost:11434)

### Vector Search
- **Base de datos**: PostgreSQL 16 + pgvector
- **Método**: Similaridad coseno
- **Top K**: 5-10 chunks más relevantes

---

## 🔗 Decisiones Importantes (ADR)

| ADR | Tema | Link |
|-----|------|------|
| ADR-023 | IA local soberana | [../arquitectura/ADR/ADR-023-ia-local-soberana.md](../arquitectura/ADR/ADR-023-ia-local-soberana.md) |
| ADR-024 | Estrategia de ingesta | [../arquitectura/ADR/ADR-024-rag-ingestion-strategy.md](../arquitectura/ADR/ADR-024-rag-ingestion-strategy.md) |
| ADR-025 | PDF → Markdown | [../arquitectura/ADR/ADR-025-pdf-to-markdown-strategy.md](../arquitectura/ADR/ADR-025-pdf-to-markdown-strategy.md) |

---

## 📊 Métricas del Sistema

| Métrica | Valor Típico |
|---------|--------------|
| Chunks por documento (antes) | 150-200 |
| Chunks por documento (ahora) | 5-50* |
| Reducción | ~95% |
| Precisión recuperación | ~98% |

\* Depende del número real de artículos.

---

## 📝 Mantenimiento de Documentación

Si modificas el sistema RAG:

1. **Código cambiado** → Actualiza `implementation/chunking-implementation.md`
2. **Nueva funcionalidad** → Actualiza/crea en `implementation/new-features.md`
3. **Nueva guía de ingesta** → Agrega en `guias/`
4. **Nuevo ejemplo** → Agrega en `../ejemplos/`
5. **Actualiza este índice** si cambia la estructura

---

## 🆘 ¿Dónde Buscar Ayuda?

| Problema | Dónde buscar |
|----------|--------------|
| No detecta artículos | [guias/markdown-template.md](guias/markdown-template.md) |
| Chunks cortados | [implementation/chunking-implementation.md](implementation/chunking-implementation.md) |
| Error de Ollama | [../arquitectura/ADR/ADR-023-ia-local-soberana.md](../arquitectura/ADR/ADR-023-ia-local-soberana.md) |
| Migración/validador | [implementation/new-features.md](implementation/new-features.md) |

---

**Última actualización**: 2026-08-02  
**Versión**: 2.0.0

**¿Comenzar?** → Lee [`01-CONTEXTO-PROYECTO.md`](../../01-CONTEXTO-PROYECTO.md) para contexto global del proyecto.