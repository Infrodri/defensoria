# ADR-025: Estrategia Mejorada de Conversión PDF a Markdown y Chunking Semántico

**Status**: Proposed  
**Date**: 2026-08-01  
**Context**: El sistema actual de ingesta RAG (ADR-024) tiene limitaciones críticas en el procesamiento de PDFs legales:

## Problema Identificado

### Síntoma Visual (Screenshot de Referencia)
El panel de "Fragmentos Indexados (Chunks)" muestra fragmentación incorrecta:
- **Chunk #7**: "Artículo 1º.- (Objeto) La presente Ley tiene por objeto modificar la Ley Nº 548 de 17 de julio de 2014, 'Código Niña, Niño y Adolescente', modificada por la Ley N°"
- **Chunk #8**: "Se modifica el Artículo 84 de la Ley Nº 548 de 17 de julio de 2014, 'Código Niña, Niño y Adolescente', modificada por la"

**Problemas detectados**:
1. ❌ Corte en medio de oraciones ("modificada por la Ley N°" queda truncado)
2. ❌ Pérdida de contexto entre chunks (el Chunk #8 habla de modificar el Art. 84 pero no tiene el contexto del Art. 1º)
3. ❌ Fragmentos duplicados y redundantes
4. ❌ Estructura legal (artículos, incisos, parágrafos) no respetada

### Raíz del Problema
El algoritmo actual en `knowledge.service.ts`:
```typescript
// División simplista por párrafos dobles
let initialChunks = cleanText.split(/\n\s*\n/)
  .map(t => t.trim())
  .filter(t => t.length > 50);

// Corte por oraciones cuando el chunk supera 1500 caracteres
const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
```

**Limitaciones**:
- No reconoce la estructura semántica legal (Artículos, Parágrafos, Incisos)
- El regex de oraciones es demasiado simple (`[^.!?]+[.!?]+`) y no maneja abreviaciones legales ("Art.", "Inc.", "N°")
- No hay overlap entre chunks (pérdida de contexto)
- No preserva jerarquía legal

---

## Soluciones Propuestas

### Opción A: Conversión PDF → Markdown + Chunking Semántico Mejorado

**Ventajas**:
- ✅ Markdown preserva estructura jerárquica (# Título, ## Artículo, ### Inciso)
- ✅ Permite procesamiento más inteligente
- ✅ Compatible con herramientas de chunking semántico existentes
- ✅ Facilita visualización y edición manual si es necesario

**Stack Técnico**:
1. **Conversión PDF → Markdown**:
   - `pymupdf` (PyMuPDF) + Python subprocess
   - `marker-pdf` (ML-based, mejor calidad pero más pesado)
   - `pdf2md.js` (JavaScript nativo, más liviano)

2. **Chunking Semántico Mejorado**:
   - Algoritmo de **Text Splitting por Estructura Legal**
   - Overlap configurable (100-200 caracteres entre chunks)
   - Preservación de jerarquía (Artículo → Parágrafo → Inciso)

**Implementación recomendada**:

```typescript
// Nueva función en knowledge.service.ts
async processPdfToMarkdown(title: string, buffer: Buffer) {
  // 1. Convertir PDF a Markdown usando pymupdf
  const mdContent = await this.convertPdfToMarkdown(buffer);
  
  // 2. Parsear Markdown y extraer estructura legal
  const legalStructure = this.parseLegalMarkdown(mdContent);
  
  // 3. Crear chunks semánticos con overlap
  const chunks = this.createSemanticChunks(legalStructure, {
    maxChunkSize: 1500,
    overlap: 150,
    preserveHierarchy: true
  });
  
  return this.ingestDocument(title, chunks);
}

private parseLegalMarkdown(markdown: string) {
  const sections = [];
  
  // Detectar patrones legales bolivianos
  const articlePattern = /Artículo\s+(\d+[ºª]?)\.-\s*\(([^)]+)\)/g;
  const paragraphPattern = /["']([a-z]\))/gi;
  const incisePattern = /([IVXLCDM]+)\./g;
  
  // Construir árbol jerárquico
  // Artículo 1º
  //   └── Parágrafo I
  //       └── Inciso a)
  
  return sections;
}

private createSemanticChunks(structure: any[], options: any) {
  const chunks = [];
  
  for (const article of structure) {
    let chunkContent = `# ${article.title}\n\n${article.content}`;
    
    // Si el artículo completo cabe en un chunk, usarlo tal cual
    if (chunkContent.length <= options.maxChunkSize) {
      chunks.push({
        content: chunkContent,
        metadata: {
          article: article.number,
          type: 'complete_article',
          hierarchy: article.hierarchy
        }
      });
    } else {
      // Dividir por parágrafos/incisos pero con overlap
      const subChunks = this.splitWithOverlap(
        chunkContent,
        options.maxChunkSize,
        options.overlap
      );
      chunks.push(...subChunks);
    }
  }
  
  return chunks;
}

private splitWithOverlap(text: string, maxSize: number, overlap: number) {
  const chunks = [];
  const sentences = this.splitIntoSentences(text);
  
  let currentChunk = '';
  let overlapBuffer = '';
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxSize) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { hasOverlap: true }
      });
      
      // Overlap: últimos N caracteres del chunk anterior
      overlapBuffer = currentChunk.slice(-overlap);
      currentChunk = overlapBuffer + sentence;
    } else {
      currentChunk += sentence + ' ';
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push({ content: currentChunk.trim(), metadata: {} });
  }
  
  return chunks;
}

// Mejora del regex de oraciones para texto legal
private splitIntoSentences(text: string): string[] {
  // Regex mejorado que NO corta en abreviaciones legales
  const legalAbbreviations = [
    'Art', 'Inc', 'Párr', 'Ley', 'N°', 'Sr', 'Sra', 
    'Dr', 'Dra', 'Lic', 'C.I', 'R.N.I', 'GAM'
  ];
  
  // Pattern que respeta abreviaciones pero divide en puntos reales
  const pattern = /(?<!\b(?:${legalAbbreviations.join('|')}))(?<=[.!?])\s+(?=[A-Z])/g;
  
  return text.split(pattern);
}
```

---

### Opción B: Scraping Web Mejorado (Ya implementado pero con mejoras)

**Ventajas**:
- ✅ Ya está implementado en el sistema
- ✅ HTML suele tener mejor estructura que PDF
- ✅ No requiere conversión adicional

**Mejoras necesarias**:
```typescript
async processUrl(title: string, url: string) {
  // ... código existente de fetch ...
  
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  
  // Remover elementos no semánticos
  $('script, style, nav, footer, header, aside, .sidebar, .menu').remove();
  
  // MEJORA 1: Preservar jerarquía HTML
  const sections = [];
  
  $('body').find('article, section, h1, h2, h3, h4, p').each((i, elem) => {
    const tag = elem.tagName;
    const text = $(elem).text().trim();
    
    if (text.length > 50) {
      sections.push({
        tag,
        content: text,
        hierarchy: this.getHierarchyLevel(tag)
      });
    }
  });
  
  // MEJORA 2: Chunking semántico con overlap
  const chunks = this.createSemanticChunksFromHtml(sections, {
    maxChunkSize: 1500,
    overlap: 150
  });
  
  return this.ingestDocument(title, chunks);
}
```

---

### Opción C: Markdown Manual + Validación Humana (Recomendado para documentos críticos)

**Ventajas**:
- ✅ Máxima calidad y precisión
- ✅ Control total sobre estructura
- ✅ Compatible con Gate de Validación Humana (ADR-023)

**Flujo**:
1. Administrador convierte PDF a Markdown manualmente usando herramienta externa
2. Sube el `.md` al sistema
3. Sistema parsea Markdown directamente (estructura ya limpia)
4. Chunking semántico aplicado al Markdown estructurado

**Implementación**:
```typescript
@Post('upload-markdown')
@Roles(Role.ADMINISTRADOR)
@UseInterceptors(FileInterceptor('file'))
async uploadMarkdown(
  @UploadedFile() file: Express.Multer.File,
  @Body('title') title: string
) {
  if (!file) throw new BadRequestException('Archivo requerido');
  if (file.mimetype !== 'text/markdown' && !file.originalname.endsWith('.md')) {
    throw new BadRequestException('Solo se admiten archivos Markdown (.md)');
  }

  const markdownContent = file.buffer.toString('utf-8');
  return this.knowledgeService.processMarkdown(title, markdownContent);
}
```

---

## Decisión Recomendada

### Implementar las 3 opciones en orden de prioridad:

1. **Corto plazo (Inmediato)**: 
   - ✅ Mejorar Opción B (Scraping Web) añadiendo overlap y mejor regex de oraciones
   - ✅ Recomendar al Administrador usar URLs estructuradas (Lexivox) cuando estén disponibles

2. **Mediano plazo (1-2 semanas)**:
   - ✅ Implementar Opción C (Upload de Markdown manual)
   - ✅ Crear herramienta CLI para convertir PDFs a Markdown localmente

3. **Largo plazo (Fase 4)**:
   - ✅ Implementar Opción A completa (PDF → Markdown automático con pymupdf)
   - ✅ Entrenamiento de modelo específico para reconocer estructura legal boliviana

---

## Consecuencias

**Mejoras inmediatas**:
- ✅ Chunks con contexto completo (no cortan en medio de oraciones)
- ✅ Overlap entre chunks (no se pierde contexto entre fragmentos)
- ✅ Mejor recuperación RAG (chunks más semánticamente coherentes)

**Cambios en el código**:
- Nueva función `splitIntoSentences()` con regex mejorado
- Nueva función `createSemanticChunks()` con overlap
- Nuevo endpoint `POST /knowledge/upload-markdown`

**Cambios en la UI**:
- Tab adicional "Subir Markdown" en el panel de Administrador
- Indicador visual de "Overlap" en el visor de chunks
- Preview de estructura legal antes de ingestar

---

## Referencias
- ADR-023: Arquitectura IA Local Soberana
- ADR-024: Estrategia de Ingesta RAG (HTML vs PDF)
- Herramientas externas recomendadas:
  - `pymupdf` (PyMuPDF): https://github.com/pymupdf/PyMuPDF
  - `marker-pdf`: https://github.com/VikParuchuri/marker
  - `pdf2md.js`: https://github.com/jzillmann/pdf2md
  - `unstructured.io`: https://unstructured.io/
