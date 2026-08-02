# Solución al Problema de Fragmentación Incorrecta en RAG

**Fecha**: 2026-08-01  
**Problema reportado**: Los chunks generados por el sistema RAG cortan oraciones en medio, perdiendo contexto y duplicando información de forma incorrecta.

---

## Problema Identificado

### Evidencia Visual
El panel de "Fragmentos Indexados (Chunks)" mostraba fragmentación incorrecta como:

**Chunk #7**:
```
Artículo 1º.- (Objeto) La presente Ley tiene por objeto modificar la Ley Nº 548 
de 17 de julio de 2014, "Código Niña, Niño y Adolescente", modificada por la Ley N°
```

**Chunk #8**:
```
Se modifica el Artículo 84 de la Ley Nº 548 de 17 de julio de 2014, "Código Niña, 
Niño y Adolescente", modificada por la
```

### Síntomas
1. ❌ Corte en medio de oraciones ("modificada por la Ley N°" truncado)
2. ❌ Pérdida de contexto entre chunks consecutivos
3. ❌ Fragmentos duplicados sin overlap intencional
4. ❌ Estructura legal (artículos, parágrafos) no respetada

### Resultado Esperado (Imagen de referencia)
El usuario mostró cómo deberían verse los chunks correctos:

```
✅ Chunk #1: Artículo 1.- (OBJETO) - Completo con todo su contenido
✅ Chunk #2: Artículo 2.- (FINALIDAD) - Completo con todo su contenido
✅ Chunk #3: Artículo 3.- (MARCO CONSTITUCIONAL) - Completo con todo su contenido
```

**Estrategia adoptada**: **UN ARTÍCULO LEGAL = UN CHUNK**

---

## Solución Implementada: Chunking por Artículo Legal Completo

### Cambio de Paradigma

**Antes (Chunking por tamaño)**:
- Límite: 1500 caracteres por chunk
- División: Por oraciones cuando se supera el límite
- Problema: Artículos legales cortados artificialmente

**Ahora (Chunking por estructura legal)**:
- Límite: **SIN LÍMITE** - Un artículo completo = un chunk
- División: Por estructura legal (detecta "Artículo N.- (TÍTULO)")
- Resultado: Artículos completos con todo su contenido (parágrafos, incisos)

### Ventajas de este Enfoque

1. ✅ **Contexto legal completo**: Cada chunk contiene un artículo legal íntegro
2. ✅ **Sin cortes artificiales**: No se pierde información por límites de tamaño
3. ✅ **Mejor recuperación RAG**: El modelo recupera artículos completos, no fragmentos
4. ✅ **Metadata rica**: Cada chunk tiene número de artículo y título
5. ✅ **Compatible con consultas legales**: "¿Qué dice el Art. 84?" recupera el artículo completo

---

## Implementación Técnica

### 1. Procesamiento de Markdown (Opción Recomendada)

**Nuevo método**: `processMarkdown()` + `parseLegalArticles()`

**Detecta patrones**:
- `## Artículo 1.- (OBJETO)`
- `Artículo 1°.- (OBJETO)`
- `Artículo 1º.- (OBJETO)`

**Resultado**:
```typescript
{
  articleNumber: "1",
  articleTitle: "OBJETO",
  fullContent: "Artículo 1.- (OBJETO)\n\nEl presente Código...",
  level: 2
}
```

**Sin límite de tamaño**: Un artículo de 5000 caracteres genera un chunk de 5000 caracteres.

### 2. Detección Automática en PDF y URL Web

**Nuevo método**: `extractLegalArticlesFromText()`

**Patrones reconocidos**:
```typescript
const patterns = [
  /Artículo\s+(\d+[°º]?)\.[-—]\s*\(([^)]+)\)/gi,
  /ARTÍCULO\s+(\d+[°º]?)\.[-—]\s*\(([^)]+)\)/gi,
  /Art\.\s+(\d+[°º]?)\.[-—]\s*\(([^)]+)\)/gi,
];
```

**Flujo**:
1. Intentar detectar artículos legales
2. Si se detectan → UN ARTÍCULO = UN CHUNK
3. Si NO se detectan → Fallback a chunking semántico con overlap

### 3. Fallback Inteligente (para documentos no legales)

Si el texto NO contiene artículos legales detectables:
- Se mantiene el chunking semántico con overlap (150 caracteres)
- División inteligente respetando abreviaciones
- Útil para documentos como manuales, protocolos, instructivos

---

## Archivos Modificados

### Backend
**Archivo**: `apps/api/src/modules/knowledge/knowledge.service.ts`

**Métodos nuevos**:
- `parseLegalArticles()` - Parsea artículos de Markdown
- `extractLegalArticlesFromText()` - Extrae artículos de texto plano
- `createSemanticChunks()` - Chunking con overlap (fallback)
- `splitIntoLegalSentences()` - División inteligente respetando abreviaciones

**Métodos modificados**:
- `processMarkdown()` - Ahora detecta artículos
- `processUrl()` - Ahora intenta detectar artículos primero
- `processPdf()` - Ahora intenta detectar artículos primero

### Controller
**Archivo**: `apps/api/src/modules/knowledge/knowledge.controller.ts`

**Endpoint nuevo**:
- `POST /api/knowledge/upload-markdown` - Subir archivos `.md`

---

## Documentación Creada

### 1. ADR-025: Estrategia Mejorada PDF a Markdown
**Ubicación**: `docs/arquitectura/ADR/ADR-025-pdf-to-markdown-strategy.md`

**Contenido**:
- Análisis técnico del problema
- 3 soluciones propuestas
- Decisión de implementar chunking por artículo
- Código de ejemplo

### 2. Plantilla para Leyes en Markdown
**Ubicación**: `docs/rag/guias/markdown-template.md`

**Contenido**:
- Formato correcto para Markdown legal
- Ejemplos de patrones reconocidos
- Guía de conversión PDF → Markdown
- FAQ y troubleshooting

### 3. Ejemplo Real: Ley 1371
**Ubicación**: `docs/ejemplos/ley-1371-complete.md`

**Contenido**:
- Ley completa formateada correctamente
- Lista para copiar y usar como plantilla
- Muestra parágrafos, incisos y estructura compleja

### 4. Guía de Ingesta (Actualizada)
**Ubicación**: `docs/rag/guias/ingestion-guide.md`

**Contenido actualizado**:
- Ahora recomienda Markdown como opción #1
- Explica que UN ARTÍCULO = UN CHUNK
- Instrucciones de verificación post-ingesta

---

## Soluciones Implementadas

### 1. Chunking Semántico Mejorado con Overlap

**Archivo modificado**: `apps/api/src/modules/knowledge/knowledge.service.ts`

**Nuevo método**:
```typescript
private createSemanticChunks(
  initialChunks: string[],
  options: { maxChunkSize: number; overlap: number; preserveContext: boolean }
): string[]
```

**Características**:
- ✅ Overlap configurable (150 caracteres por defecto)
- ✅ Preservación de contexto entre chunks
- ✅ División inteligente respetando oraciones completas
- ✅ Manejo de chunks que superan el límite

**Ejemplo de overlap correcto**:
```
Chunk #7:
"...modificada por la Ley Nº 1168 de 12 de abril de 2019, de Abreviación 
Procesal para Garantizar la Restitución del Derecho Humano a la Familia 
de las Niñas, Niños y Adolescentes."

Chunk #8:
"...a la Familia de las Niñas, Niños y Adolescentes.

Artículo 2º.- (Modificaciones e Incorporaciones) Se modifica el Artículo 84..."
```

### 2. División Inteligente de Oraciones Legales

**Nuevo método**:
```typescript
private splitIntoLegalSentences(text: string): string[]
```

**Abreviaciones protegidas**:
- Art., Inc., Párr., Parag., Ley, Nº, N°
- Sr., Sra., Dr., Dra., Lic.
- C.I., R.N.I., GAM, DNA, NNA
- Pág., Cap., Sec., Lit., Gral., Vs., Vol.

**Algoritmo**:
1. Protege temporalmente las abreviaciones (reemplaza con placeholders)
2. Divide por oraciones usando regex mejorado
3. Restaura las abreviaciones en cada oración
4. Filtra oraciones muy cortas (< 10 caracteres)

**Pattern mejorado**:
```typescript
const sentencePattern = /(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑa-záéíóúñ])/g;
```

### 3. Soporte para Markdown Pre-estructurado

**Nuevo endpoint**: `POST /api/knowledge/upload-markdown`

**Ventajas**:
- ✅ Máxima calidad para documentos críticos
- ✅ Respeta jerarquía de headers (# ## ###)
- ✅ Parseo de estructura legal automático
- ✅ Metadata completa por sección

**Nuevo método**:
```typescript
async processMarkdown(title: string, markdownContent: string)
private parseMarkdownStructure(markdown: string)
```

**Ejemplo de estructura parseada**:
```
Section 1:
  Title: "Ley N° 548 — Código Niña, Niño y Adolescente"
  Level: 1 (#)
  Content: "..."

Section 2:
  Title: "Artículo 1º.- (Objeto)"
  Level: 2 (##)
  Content: "La presente Ley tiene por objeto..."
```

---

## Mejoras Aplicadas a Métodos Existentes

### PDF (`processPdf`)
- ✅ Ahora usa `createSemanticChunks()` con overlap
- ✅ Metadata incluye `type: 'pdf'`
- ✅ Mejor manejo de caracteres nulos y espacios

### URL Web (`processUrl`)
- ✅ Ahora usa `createSemanticChunks()` con overlap
- ✅ Metadata incluye `type: 'web'`
- ✅ Mejor limpieza de elementos no semánticos

---

## Documentación Creada

### ADR-025: Estrategia Mejorada PDF a Markdown
**Ubicación**: `docs/arquitectura/ADR/ADR-025-pdf-to-markdown-strategy.md`

**Contenido**:
- Análisis del problema
- 3 soluciones propuestas (A, B, C)
- Comparación de calidad
- Implementación técnica detallada
- Decisión recomendada por fases

### Guía de Usuario para Administradores
**Ubicación**: `docs/rag/guias/ingestion-guide.md`

**Contenido**:
- 3 opciones de ingesta ordenadas por calidad
- Proceso paso a paso para cada opción
- Comparación de métodos
- Verificación post-ingesta
- Solución de problemas comunes
- Recomendaciones finales

---

## Resultados Esperados

### Antes (INCORRECTO - Chunking por tamaño)
```
Chunk #7: "...modificada por la Ley N°"
Chunk #8: "Se modifica el Artículo 84..."
```
❌ Contexto perdido entre chunks  
❌ Artículos cortados artificialmente

### Después (CORRECTO - Chunking por artículo legal)
```
Chunk #1:
ID: a8d247d6...
Artículo 1.- (OBJETO).
El presente Código tiene por objeto reconocer, desarrollar y regular el 
ejercicio de los derechos de la niña, niño y adolescente, implementando un 
Sistema Plurinacional Integral de la Niña, Niño y Adolescente, con el fin 
de garantizar el ejercicio pleno de sus derechos para su desarrollo integral 
en la familia, la comunidad y la sociedad.

Meta: {"type":"legal_article","article":"1","title":"OBJETO"}

Chunk #2:
ID: 92a7ff7...
Artículo 2.- (FINALIDAD).
La finalidad del presente Código tiene por objeto garantizar a la niña, 
niño y adolescente el ejercicio pleno y efectivo de sus derechos para su 
desarrollo integral mediante la correspondibilidad del Estado en todos sus 
niveles, las familias y la sociedad.

Meta: {"type":"legal_article","article":"2","title":"FINALIDAD"}

Chunk #3:
ID: 3e7a0b9...
Artículo 3.- (MARCO CONSTITUCIONAL Y ÁMBITO DE APLICACIÓN).
I. El presente Código se rige por las disposiciones de la Constitución 
Política del Estado.
II. Las disposiciones del presente Código son de orden público y de 
aplicación preferente a favor de todas las niñas, niños y adolescentes.

Meta: {"type":"legal_article","article":"3","title":"MARCO CONSTITUCIONAL Y ÁMBITO DE APLICACIÓN"}
```

✅ **UN ARTÍCULO COMPLETO = UN CHUNK**  
✅ **Sin cortes en medio de oraciones**  
✅ **Parágrafos e incisos incluidos**  
✅ **Metadata completa (número y título del artículo)**  
✅ **Sin límite artificial de tamaño**

---

## Testing Recomendado

### 1. Test de Overlap
```bash
# Subir documento de prueba (Ley 1371 desde Lexivox)
curl -X POST http://localhost:4100/api/knowledge/upload-url \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Ley N° 1371 - Test Overlap",
    "url": "https://www.lexivox.org/norms/BO-L-N1371.html"
  }'

# Verificar chunks generados
curl -X GET http://localhost:4100/api/knowledge/documents/{id}/chunks \
  -H "Authorization: Bearer $TOKEN"
```

**Verificar**:
- Los últimos ~150 caracteres de cada chunk aparecen al inicio del siguiente
- No hay cortes en medio de oraciones
- Las abreviaciones no generan divisiones incorrectas

### 2. Test de Markdown
```bash
# Crear archivo test.md
cat > test.md << 'EOF'
# Ley de Prueba

## Artículo 1º.- (Objeto)
Este es el contenido del artículo primero que establece el objeto de la ley.

## Artículo 2º.- (Alcance)
Este artículo define el alcance territorial y material de la normativa.
EOF

# Subir
curl -X POST http://localhost:4100/api/knowledge/upload-markdown \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.md" \
  -F "title=Ley de Prueba"
```

**Verificar**:
- Cada artículo genera un chunk separado
- Metadata incluye `section` y `level`
- Estructura jerárquica preservada

### 3. Test de Abreviaciones Legales
Buscar en los chunks generados que NO se corte en:
- "Art. 1º" → debe quedar junto
- "Ley N° 548" → no debe cortarse
- "Dr. Pérez" → debe mantenerse completo
- "Inc. a)" → no debe separarse

---

## Migración de Documentos Existentes

Si ya tienes documentos ingestados con el algoritmo anterior, se recomienda:

1. **Listar documentos actuales**:
   ```bash
   GET /api/knowledge/documents
   ```

2. **Desactivar documentos con fragmentación incorrecta**:
   ```bash
   PATCH /api/knowledge/documents/{id}/toggle-status
   ```

3. **Re-ingestar usando el nuevo algoritmo**:
   - Preferir Markdown si está disponible
   - Usar URL Web si el documento está en Lexivox
   - PDF solo como última opción

---

## Próximos Pasos (Opcional - Fase 4)

### Conversión Automática PDF → Markdown
Implementar servicio Python con `pymupdf`:

```python
import pymupdf4llm

def convert_pdf_to_markdown(pdf_path: str) -> str:
    md_content = pymupdf4llm.to_markdown(pdf_path)
    return md_content
```

**Integración con NestJS**:
- Endpoint `/api/knowledge/convert-pdf-to-md`
- Subprocess de Python desde Node.js
- Preview del Markdown antes de vectorizar

### Detección Automática de Estructura Legal
Entrenar modelo específico para reconocer:
- Artículos, Parágrafos, Incisos
- Referencias legales (Ley N° XXX)
- Citaciones jurisprudenciales

---

## Referencias

- **ADR-023**: Arquitectura IA Local Soberana
- **ADR-024**: Estrategia de Ingesta RAG (HTML vs PDF)
- **ADR-025**: Estrategia PDF a Markdown (nuevo)
- **Guía de Usuario**: `docs/rag/guias/ingestion-guide.md`
- **Código fuente**: `apps/api/src/modules/knowledge/knowledge.service.ts`

---

## Conclusión

El problema de fragmentación incorrecta ha sido resuelto mediante:

1. ✅ Chunking semántico con overlap (150 caracteres)
2. ✅ División inteligente respetando abreviaciones legales
3. ✅ Soporte para Markdown pre-estructurado (máxima calidad)
4. ✅ Mejoras en procesamiento de PDF y URL Web
5. ✅ Documentación completa para administradores

**Estado**: Implementado y listo para testing
**Impacto**: Mejora significativa en la calidad de recuperación RAG



