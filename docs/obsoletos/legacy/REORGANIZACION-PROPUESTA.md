# Propuesta de Reorganización de Documentación

## Problema Actual

### Estructura Actual (Desorganizada)
```
docs/
├── SOLUCION-FRAGMENTACION-RAG.md          ❌ En raíz (debería estar en roadmap o rag/)
├── TEST-CHUNKING-LEGAL.md                 ❌ En raíz (debería estar en rag/testing/)
├── admin-master-plan.md                   ✅ OK en raíz (documento maestro)
├── master-spec.md                         ✅ OK en raíz (documento maestro)
├── guides/
│   ├── knowledge-base-ingestion-guide.md  ❌ Nombre genérico, debería ser rag-ingestion-guide.md
│   ├── NUEVAS-FUNCIONALIDADES-RAG.md      ❌ Mayúsculas inconsistente
│   └── PLANTILLA-LEY-MARKDOWN.md          ❌ Mayúsculas inconsistente
├── examples/
│   └── ley-1371-ejemplo.md                ✅ OK
├── architecture/
│   ├── ADR-023-ia-local-soberana.md       ✅ OK
│   ├── ADR-024-rag-ingestion-strategy.md  ✅ OK
│   └── ADR-025-pdf-to-markdown-strategy.md✅ OK
```

**Problemas identificados**:
1. 🔴 Documentos RAG en 3 lugares diferentes (raíz, guides, architecture)
2. 🔴 Mezcla de mayúsculas/minúsculas
3. 🔴 Difícil encontrar documentación RAG completa
4. 🔴 No hay índice centralizado

---

## Propuesta de Reorganización

### Estructura Propuesta (Organizada)
```
docs/
├── README.md                              ← NUEVO: Índice de toda la documentación
│
├── master-spec.md                         ← Mantener: Documento canónico del proyecto
├── admin-master-plan.md                   ← Mantener: Plan maestro administrador
├── system-overview.md                     ← Mantener: Resumen técnico
├── known-risks.md                         ← Mantener: Riesgos conocidos
│
├── architecture/                          ← ADRs (Decisiones arquitectónicas)
│   ├── README.md                          ← NUEVO: Índice de ADRs
│   ├── ADR-001-foundation.md
│   ├── ADR-023-ia-local-soberana.md
│   ├── ADR-024-rag-ingestion-strategy.md
│   └── ADR-025-pdf-to-markdown-strategy.md
│
├── rag/                                   ← NUEVO: Todo sobre RAG centralizado
│   ├── README.md                          ← NUEVO: Índice RAG
│   ├── overview.md                        ← NUEVO: Resumen ejecutivo RAG
│   │
│   ├── architecture/                      ← Decisiones técnicas RAG
│   │   ├── chunking-strategy.md           ← Consolidado de ADR-024 + ADR-025
│   │   ├── embedding-models.md            ← Modelos y configuración
│   │   └── vector-search.md               ← Búsqueda vectorial
│   │
│   ├── guides/                            ← Guías de usuario
│   │   ├── ingestion-guide.md             ← Renombrado (era knowledge-base-ingestion-guide.md)
│   │   ├── markdown-template.md           ← Renombrado (era PLANTILLA-LEY-MARKDOWN.md)
│   │   ├── migration-guide.md             ← Migración de documentos existentes
│   │   └── troubleshooting.md             ← NUEVO: Problemas comunes
│   │
│   ├── examples/                          ← Ejemplos prácticos
│   │   ├── ley-548-snippet.md             ← Ejemplo corto
│   │   ├── ley-1371-complete.md           ← Renombrado (era ley-1371-ejemplo.md)
│   │   └── decreto-supremo-ejemplo.md     ← NUEVO: Otros formatos
│   │
│   ├── testing/                           ← Testing específico RAG
│   │   ├── test-plan.md                   ← Renombrado (era TEST-CHUNKING-LEGAL.md)
│   │   ├── test-cases.md                  ← Casos de prueba detallados
│   │   └── validation-checklist.md        ← Checklist de validación
│   │
│   └── implementation/                    ← Detalles de implementación
│       ├── chunking-implementation.md     ← Renombrado (era SOLUCION-FRAGMENTACION-RAG.md)
│       ├── migration-script.md            ← Documentación del script
│       ├── validator-api.md               ← API de validación
│       └── frontend-preview.md            ← Componente de preview
│
├── api/                                   ← Documentación API
│   └── (mantener estructura actual)
│
├── data-model/                            ← Modelo de datos
│   └── (mantener estructura actual)
│
├── security/                              ← Seguridad
│   └── (mantener estructura actual)
│
├── legal/                                 ← Marco legal
│   └── (mantener estructura actual)
│
└── roadmap/                               ← Roadmap y fases
    └── (mantener estructura actual)
```

---

## Beneficios de la Nueva Estructura

### 1. Carpeta Centralizada RAG
✅ **Todo sobre RAG en un solo lugar**: `docs/rag/`
✅ **Subcarpetas por tipo**: architecture, guides, examples, testing, implementation
✅ **Fácil de encontrar**: Buscar RAG → Ir a `docs/rag/`

### 2. Separación Clara de Responsabilidades

| Carpeta | Contenido | Audiencia |
|---------|-----------|-----------|
| `rag/architecture/` | Decisiones técnicas, patrones | Desarrolladores |
| `rag/guides/` | Guías paso a paso | Administradores, usuarios |
| `rag/examples/` | Ejemplos reales | Todos |
| `rag/testing/` | Planes y casos de prueba | QA, desarrolladores |
| `rag/implementation/` | Detalles código, scripts | Desarrolladores |

### 3. READMEs como Índices
Cada carpeta importante tiene un `README.md` que:
- ✅ Lista todos los documentos
- ✅ Describe el propósito de cada uno
- ✅ Indica el orden de lectura recomendado

### 4. Nombres Consistentes
- ✅ Todo en minúsculas con guiones: `ingestion-guide.md`
- ✅ Nombres descriptivos: `chunking-strategy.md` (no `ADR-024.md`)
- ✅ Sin prefijos innecesarios: `overview.md` (no `RAG-OVERVIEW.md`)

---

## Plan de Migración

### Fase 1: Crear Estructura Nueva
```bash
mkdir -p docs/rag/{architecture,guides,examples,testing,implementation}
```

### Fase 2: Mover y Renombrar Archivos

#### Desde raíz docs/
```bash
# Mover documentos RAG de raíz a rag/
mv docs/SOLUCION-FRAGMENTACION-RAG.md docs/rag/implementation/chunking-implementation.md
mv docs/TEST-CHUNKING-LEGAL.md docs/rag/testing/test-plan.md
```

#### Desde guides/
```bash
mv docs/guides/knowledge-base-ingestion-guide.md docs/rag/guides/ingestion-guide.md
mv docs/guides/PLANTILLA-LEY-MARKDOWN.md docs/rag/guides/markdown-template.md
mv docs/guides/NUEVAS-FUNCIONALIDADES-RAG.md docs/rag/implementation/new-features.md
```

#### Desde examples/
```bash
mv docs/examples/ley-1371-ejemplo.md docs/rag/examples/ley-1371-complete.md
```

### Fase 3: Crear Documentos Nuevos

#### docs/README.md (Índice principal)
```markdown
# Documentación DNA

## Documentos Maestros
- [master-spec.md](master-spec.md) - Especificación completa del sistema
- [system-overview.md](system-overview.md) - Resumen técnico

## Por Área
- [Arquitectura](architecture/) - ADRs y decisiones técnicas
- [RAG e IA](rag/) - Sistema de conocimiento y embeddings
- [API](api/) - Documentación de endpoints
- [Modelo de Datos](data-model/) - Esquemas de base de datos
- [Seguridad](security/) - Políticas y controles
- [Legal](legal/) - Marco normativo
- [Roadmap](roadmap/) - Fases del proyecto
```

#### docs/rag/README.md (Índice RAG)
```markdown
# Sistema RAG (Retrieval-Augmented Generation)

## Inicio Rápido
1. Lee [overview.md](overview.md) para entender el sistema
2. Si eres administrador: [guides/ingestion-guide.md](guides/ingestion-guide.md)
3. Si eres desarrollador: [architecture/chunking-strategy.md](architecture/chunking-strategy.md)

## Arquitectura
- [chunking-strategy.md](architecture/chunking-strategy.md) - Estrategia de fragmentación
- [embedding-models.md](architecture/embedding-models.md) - Modelos de embeddings
- [vector-search.md](architecture/vector-search.md) - Búsqueda vectorial

## Guías de Usuario
- [ingestion-guide.md](guides/ingestion-guide.md) - Cómo ingestar documentos
- [markdown-template.md](guides/markdown-template.md) - Formato Markdown legal
- [migration-guide.md](guides/migration-guide.md) - Migrar documentos existentes
- [troubleshooting.md](guides/troubleshooting.md) - Solución de problemas

## Ejemplos
- [ley-1371-complete.md](examples/ley-1371-complete.md) - Ley completa
- [ley-548-snippet.md](examples/ley-548-snippet.md) - Fragmento de ley

## Testing
- [test-plan.md](testing/test-plan.md) - Plan de pruebas
- [validation-checklist.md](testing/validation-checklist.md) - Checklist

## Implementación (Desarrolladores)
- [chunking-implementation.md](implementation/chunking-implementation.md) - Código
- [migration-script.md](implementation/migration-script.md) - Script
- [validator-api.md](implementation/validator-api.md) - API validación
```

#### docs/rag/overview.md (Nuevo documento resumen)
```markdown
# Sistema RAG - Resumen Ejecutivo

## ¿Qué es?
Sistema de recuperación aumentada por generación (RAG) que permite al copiloto IA 
consultar documentos legales bolivianos de forma contextual.

## Principio Fundamental
**UN ARTÍCULO LEGAL = UN CHUNK**

## Arquitectura en 3 Capas
1. **Ingesta**: PDF/Markdown → Detección artículos → Chunks
2. **Vectorización**: Chunks → Embeddings (nomic-embed-text)
3. **Recuperación**: Query → Búsqueda vectorial → Artículos completos

## Enlaces Rápidos
- [Guía de ingesta](guides/ingestion-guide.md)
- [Estrategia técnica](architecture/chunking-strategy.md)
- [Ejemplos](examples/)
- [Testing](testing/test-plan.md)
```

### Fase 4: Consolidar Documentos Redundantes

#### Consolidar ADR-024 + ADR-025 → chunking-strategy.md
Los dos ADRs hablan de chunking. Consolidarlos en:
```
docs/rag/architecture/chunking-strategy.md
```

Mantener ADRs originales en `docs/architecture/` como referencia histórica pero agregar nota:
```markdown
> **Nota**: Este ADR se ha consolidado en `docs/rag/architecture/chunking-strategy.md`
> para facilitar la lectura. Este archivo se mantiene como referencia histórica.
```

### Fase 5: Actualizar Referencias
Buscar y reemplazar en todos los archivos:
```bash
# Ejemplo
docs/guides/knowledge-base-ingestion-guide.md → docs/rag/guides/ingestion-guide.md
docs/SOLUCION-FRAGMENTACION-RAG.md → docs/rag/implementation/chunking-implementation.md
```

---

## Comparación Antes/Después

### Antes (Buscar documentación RAG)
```
❓ ¿Dónde está la guía de ingesta?
   → Buscar en docs/guides/
   → Abrir knowledge-base-ingestion-guide.md
   
❓ ¿Dónde está la implementación?
   → Buscar en docs/
   → ¿SOLUCION-FRAGMENTACION-RAG.md?
   
❓ ¿Qué ADRs son relevantes?
   → Buscar en docs/architecture/
   → ¿024? ¿025? ¿Los dos?
```

### Después (Buscar documentación RAG)
```
✅ Todo RAG está en docs/rag/
   → Abrir docs/rag/README.md (índice)
   → Ver categorías claras (guides, architecture, testing, etc.)
   → Elegir documento específico
```

---

## Ventajas de esta Estructura

### Para Desarrolladores
✅ **Separación clara**: Arquitectura vs. Implementación vs. Testing
✅ **Fácil onboarding**: Leer `rag/README.md` → entender todo
✅ **Código espagueti evitado**: Cada documento tiene propósito único

### Para Administradores
✅ **Guías en un solo lugar**: `rag/guides/`
✅ **Ejemplos accesibles**: `rag/examples/`
✅ **Troubleshooting centralizado**: `rag/guides/troubleshooting.md`

### Para el Proyecto
✅ **Escalable**: Agregar nuevos documentos sin desordenar
✅ **Mantenible**: Actualizar un área no afecta otras
✅ **Consistente**: Naming conventions claras

---

## Implementación Recomendada

### Opción A: Migración Completa (Recomendado)
1. Crear estructura nueva
2. Mover todos los archivos
3. Actualizar referencias
4. Eliminar archivos antiguos
5. Commit: "docs: reorganize RAG documentation"

### Opción B: Migración Gradual
1. Crear estructura nueva (pero mantener antigua)
2. Mover documentos críticos primero
3. Agregar deprecation notices en documentos antiguos
4. Migrar referencias progresivamente
5. Eliminar documentos antiguos después de 1-2 semanas

---

## Decisión

¿Proceder con **Opción A** (migración completa)?

**Ventajas**:
- ✅ Estructura limpia inmediatamente
- ✅ No hay confusión de duplicados
- ✅ Un solo commit, fácil de revertir si hay problema

**Desventajas**:
- ⚠️  Requiere actualizar todas las referencias de golpe
- ⚠️  Posible riesgo si alguien tiene enlaces hardcoded

**Recomendación**: Opción A (migración completa) pero con:
1. Script automatizado de migración
2. Verificación de referencias rotas
3. Commit separado para fácil rollback
