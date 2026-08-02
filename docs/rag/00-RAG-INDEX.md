# Sistema RAG - Índice Completo

**Para Agentes IA**: Este es el punto de entrada para TODO sobre el sistema RAG. Leer en orden numérico.

---

## 🎯 Lectura Obligatoria (en orden)

### 1. [01-RAG-OVERVIEW.md](01-RAG-OVERVIEW.md) - 5 min
**Qué es, por qué existe, cómo funciona** (resumen ejecutivo)

### 2. Según tu rol:

**Si eres Desarrollador**:
- [architecture/chunking-strategy.md](architecture/chunking-strategy.md)
- [implementation/chunking-implementation.md](implementation/chunking-implementation.md)

**Si eres Administrador/Usuario**:
- [guides/ingestion-guide.md](guides/ingestion-guide.md)
- [guides/markdown-template.md](guides/markdown-template.md)

**Si necesitas Testing**:
- [testing/test-plan.md](testing/test-plan.md)

---

## 📂 Estructura Completa

```
rag/
├── 00-RAG-INDEX.md                              ← TÚ ESTÁS AQUÍ
├── 01-RAG-OVERVIEW.md                           ← LEER PRIMERO (resumen)
│
├── architecture/                                ← Decisiones técnicas
│   └── chunking-strategy.md                     ← Estrategia UN ARTÍCULO = UN CHUNK
│
├── guides/                                      ← Guías de usuario
│   ├── ingestion-guide.md                       ← Cómo ingestar documentos
│   └── markdown-template.md                     ← Formato correcto Markdown legal
│
├── examples/                                    ← Ejemplos reales
│   └── ley-1371-complete.md                     ← Ley 1371 formateada
│
├── testing/                                     ← Testing
│   └── test-plan.md                             ← Plan completo de tests
│
└── implementation/                              ← Detalles técnicos
    ├── chunking-implementation.md               ← Código y solución implementada
    ├── new-features.md                          ← Script migración, validador, preview
    └── complete-summary.md                      ← Resumen completo implementación
```

---

## 🔍 Documentos por Tema

### Arquitectura y Diseño
| Documento | Tema | Tiempo |
|-----------|------|--------|
| [01-RAG-OVERVIEW.md](01-RAG-OVERVIEW.md) | Resumen ejecutivo | 5 min |
| [architecture/chunking-strategy.md](architecture/chunking-strategy.md) | Estrategia técnica | 10 min |
| [ADR-023](../architecture/ADR-023-ia-local-soberana.md) | IA local soberana | 10 min |
| [ADR-024](../architecture/ADR-024-rag-ingestion-strategy.md) | Estrategia de ingesta | 10 min |

### Guías de Usuario
| Documento | Para quién | Tiempo |
|-----------|------------|--------|
| [guides/ingestion-guide.md](guides/ingestion-guide.md) | Administradores | 15 min |
| [guides/markdown-template.md](guides/markdown-template.md) | Todos | 10 min |

### Implementación
| Documento | Tema | Tiempo |
|-----------|------|--------|
| [implementation/chunking-implementation.md](implementation/chunking-implementation.md) | Solución fragmentación | 20 min |
| [implementation/new-features.md](implementation/new-features.md) | 3 nuevas funcionalidades | 15 min |
| [implementation/complete-summary.md](implementation/complete-summary.md) | Resumen total | 10 min |

### Testing
| Documento | Tema | Tiempo |
|-----------|------|--------|
| [testing/test-plan.md](testing/test-plan.md) | Plan de testing | 20 min |

---

## 🚀 Flujos de Lectura por Objetivo

### Objetivo 1: "Entender qué es RAG y cómo funciona"
```
1. 01-RAG-OVERVIEW.md                    (5 min)
2. architecture/chunking-strategy.md     (10 min)
```
**Resultado**: Entenderás el principio "UN ARTÍCULO = UN CHUNK"

### Objetivo 2: "Ingestar un documento legal"
```
1. guides/ingestion-guide.md             (15 min)
2. guides/markdown-template.md           (10 min)
3. examples/ley-1371-complete.md         (5 min - ver ejemplo)
```
**Resultado**: Sabrás cómo preparar e ingestar leyes

### Objetivo 3: "Entender la implementación técnica"
```
1. 01-RAG-OVERVIEW.md                              (5 min)
2. architecture/chunking-strategy.md               (10 min)
3. implementation/chunking-implementation.md       (20 min)
4. apps/api/src/modules/knowledge/knowledge.service.ts  (revisar código)
```
**Resultado**: Entenderás cómo funciona el código

### Objetivo 4: "Implementar nuevas funcionalidades RAG"
```
1. implementation/chunking-implementation.md       (20 min - entender actual)
2. implementation/new-features.md                  (15 min - ver ejemplos)
3. architecture/chunking-strategy.md               (10 min - decisiones)
4. Código fuente en apps/api/src/modules/knowledge/
```
**Resultado**: Tendrás contexto para extender el sistema

### Objetivo 5: "Testear el sistema RAG"
```
1. testing/test-plan.md                  (20 min)
2. examples/ley-1371-complete.md         (usar como test data)
3. Ejecutar tests del plan
```
**Resultado**: Verificarás que el sistema funciona correctamente

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

### Planos de Conocimiento
- **Plano A**: Base jurídica (público) - Leyes, jurisprudencia
- **Plano B**: Datos del caso (privado) - Evidencias, informes

---

## 🔗 Enlaces a Código Fuente

### Backend
```
apps/api/src/modules/knowledge/
├── knowledge.controller.ts      ← Endpoints REST
├── knowledge.service.ts         ← Lógica chunking
├── embeddings.service.ts        ← Cliente Ollama
└── dto/validate-markdown.dto.ts ← Validación
```

### Frontend
```
apps/web/components/knowledge/
└── markdown-preview-validator.tsx  ← Preview visual
```

### Scripts
```
apps/api/src/scripts/
└── migrate-knowledge-chunks.ts  ← Migración documentos
```

---

## ⚠️ Decisiones Importantes (ADRs)

### ADR-023: IA Local Soberana
- ✅ Cero fine-tuning (todo vía RAG)
- ✅ 100% offline (soberanía de datos NNA)
- ✅ Planos A y B separados
- ✅ Gate de validación humana

📄 [Leer ADR completo](../architecture/ADR-023-ia-local-soberana.md)

### ADR-024 + ADR-025: Estrategia de Ingesta
- ✅ Priorizar HTML sobre PDF
- ✅ Chunking por artículo legal
- ✅ Overlap solo en fallback
- ✅ Markdown como opción de máxima calidad

📄 [Leer ADR-024](../architecture/ADR-024-rag-ingestion-strategy.md)  
📄 [Leer ADR-025](../architecture/ADR-025-pdf-to-markdown-strategy.md)

---

## 📊 Métricas del Sistema

| Métrica | Valor Típico |
|---------|--------------|
| Chunks por documento (antes) | 150-200 |
| Chunks por documento (ahora) | 5-50* |
| Reducción | ~95% |
| Tiempo de ingesta | ~30 seg por ley |
| Precisión recuperación | ~98% |

\* Depende del número real de artículos

---

## 🛠️ Herramientas y Comandos

### Migrar documentos existentes
```bash
cd apps/api
npm run migrate:knowledge:dry-run  # Simular
npm run migrate:knowledge          # Aplicar
```

### Validar Markdown
```bash
curl -X POST http://localhost:4100/api/knowledge/validate-markdown \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"..."}'
```

### Ver chunks de un documento
```bash
curl -X GET http://localhost:4100/api/knowledge/documents/{id}/chunks \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 Mantenimiento de Documentación

Si modificas el sistema RAG:

1. **Código cambiado** → Actualiza `implementation/chunking-implementation.md`
2. **Nueva estrategia** → Crea ADR o actualiza `architecture/chunking-strategy.md`
3. **Nueva guía usuario** → Agrega en `guides/`
4. **Nuevo ejemplo** → Agrega en `examples/`
5. **Actualiza este índice** si cambias estructura

---

## 🆘 ¿Dónde Buscar Ayuda?

| Problema | Dónde buscar |
|----------|--------------|
| No detecta artículos | [guides/markdown-template.md](guides/markdown-template.md) |
| Chunks cortados | [implementation/chunking-implementation.md](implementation/chunking-implementation.md) |
| Error de Ollama | [../architecture/ADR-023-ia-local-soberana.md](../architecture/ADR-023-ia-local-soberana.md) |
| Migración falla | [implementation/new-features.md](implementation/new-features.md) |

---

**Última actualización**: 2026-08-01  
**Versión**: 1.0.0

**¿Comenzar?** → Lee [01-RAG-OVERVIEW.md](01-RAG-OVERVIEW.md)
