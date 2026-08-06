import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from './embeddings.service';
import { TranscriptionService } from './transcription.service';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
    private readonly transcriptionService: TranscriptionService,
  ) {}

  async ingestDocument(title: string, chunks: { content: string; metadata: any }[]) {
    this.logger.log(`Iniciando ingesta de documento: ${title}`);

    // 1. Crear el documento base
    let doc;
    try {
      doc = await this.prisma.legalDocument.create({
        data: { title },
      });
    } catch (err: any) {
      this.logger.error(`Error al crear documento base: ${err.message}`);
      throw new Error(`Error en base de datos al registrar documento: ${err.message}`);
    }

    // 2. Procesar e insertar chunks uno a uno (con su embedding)
    let processed = 0;
    for (const chunk of chunks) {
      try {
        // Llamada al motor local de Ollama
        const vector = await this.embeddings.getEmbedding(chunk.content);

        // Formatear vector para pgvector: '[0.1, 0.2, ...]'
        const vectorStr = `[${vector.join(',')}]`;

        // Inserción usando Raw SQL (necesario para el tipo vector)
        await this.prisma.$executeRaw`
          INSERT INTO legal_chunks (id, "legalDocumentId", content, metadata, embedding)
          VALUES (
            gen_random_uuid(),
            ${doc.id}::uuid,
            ${chunk.content},
            ${JSON.stringify(chunk.metadata)}::jsonb,
            ${vectorStr}::vector
          )
        `;
        processed++;
      } catch (err: any) {
        this.logger.error(`Falló la inserción del fragmento ${processed}: ${err.message}`);
        throw new Error(`Error al generar vector o guardar fragmento. Verifique que Ollama esté corriendo con el modelo nomic-embed-text: ${err.message}`);
      }
    }

    this.logger.log(`Documento "${title}" ingerido con ${processed} chunks.`);
    return { success: true, documentId: doc.id, chunksProcessed: processed };
  }

  async processPdf(title: string, buffer: Buffer) {
    this.logger.log(`Procesando PDF: ${title}`);

    let text = '';
    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;
    } catch (err: any) {
      this.logger.error(`Error al leer archivo PDF: ${err.message}`);
      throw new Error(`No se pudo extraer el texto del archivo PDF: ${err.message}`);
    }

    if (!text || text.trim().length === 0) {
      throw new Error('El PDF no contiene texto legible (posiblemente sea un documento escaneado como imagen).');
    }

    // 1. Limpiar caracteres nulos
    let cleanText = text.replace(/\x00/g, '');

    // 2. Normalizar saltos de línea que pdf-parse inserta al final de cada línea impresa.
    //    El patrón problemático: cada línea del PDF termina en \n sin ser límite de párrafo.
    //    Reglas de reconstrucción:
    //    a) Si una línea termina con guión (palabra partida) → unir sin espacio
    //    b) Si la siguiente línea empieza con mayúscula Y la actual termina con punto → conservar \n
    //    c) Si la siguiente línea empieza con "ARTÍCULO" o "CAPÍTULO" o header → conservar \n
    //    d) En todos los demás casos → unir líneas con espacio
    cleanText = this.reconstructPdfLines(cleanText);

    // 2.5. Normalizar espacios múltiples que deja el texto justificado del PDF
    //      (ej. "niña,  niño  y  adolescente" -> "niña, niño y adolescente").
    //      Reduce el tamaño de los chunks sin perder información.
    cleanText = this.normalizeWhitespace(cleanText);

    // 2.6. Quitar el índice/tabla de contenidos si el documento trae uno
    //      (ej. "Derecho a la salud .......... 18 a 21"). Ese tipo de líneas
    //      no tienen contenido jurídico y solo generan chunks de ruido.
    //      Es un no-op seguro: si no encuentra los marcadores, no toca el texto.
    cleanText = this.stripTableOfContents(cleanText);

    // 2.7. Separar el CUERPO de la ley (donde viven los artículos propios) de las
    //      Disposiciones Adicionales/Transitorias/Finales/Abrogatoria/Derogatoria.
    //      Estas últimas habitualmente TRANSCRIBEN artículos de OTRAS leyes que
    //      se modifican (ej. "Artículo 5. (EN CUANTO A LAS PERSONAS)" del Código
    //      Penal, o "Artículo 85" del Código de Procedimiento Penal). Si se dejan
    //      pasar por el detector de artículos junto con el resto del texto, se
    //      indexan como si fueran artículos propios de esta ley y pueden colisionar
    //      en número con artículos reales (ej. dos "Artículo 85" con contenido
    //      distinto), degradando la recuperación semántica.
    const { body, dispositions } = this.splitBodyAndDispositions(cleanText);

    // 3. Intentar detectar artículos legales SOLO en el cuerpo de la ley
    const articles = this.extractLegalArticlesFromText(body);

    if (articles.length > 0) {
      this.logger.log(`Detectados ${articles.length} artículos legales en el PDF`);
      let chunks = this.buildArticleChunks(articles, title, 'legal_article_pdf');

      // Las disposiciones finales se indexan aparte, con chunking semántico
      // normal (no por "Artículo N", ya que esa numeración pertenece a otras
      // leyes citadas dentro del texto), para no perder esa información pero
      // sin contaminar la numeración de artículos propios de esta ley.
      if (dispositions.trim().length > 0) {
        const dispositionChunks = this.buildDispositionChunks(dispositions, title, chunks.length);
        this.logger.log(`Disposiciones finales trocedas en ${dispositionChunks.length} chunks adicionales`);
        chunks = chunks.concat(dispositionChunks);
      }

      this.logger.log(`PDF extraído en ${chunks.length} chunks (${articles.length} artículos detectados). Procediendo a ingesta vectorial...`);
      return this.ingestDocument(title, chunks);
    } else {
      // Fallback: chunking semántico por párrafos reconstruidos
      this.logger.log(`No se detectaron artículos, usando chunking semántico con overlap`);

      // Los párrafos ahora están separados por \n\n (reconstruidos en el paso 2)
      const initialChunks = cleanText
        .split(/\n{2,}/)
        .map(t => t.trim())
        .filter(t => t.length > 80);

      const finalChunks = this.createSemanticChunks(initialChunks, {
        maxChunkSize: 1500,
        overlap: 150,
        preserveContext: true
      });

      if (finalChunks.length === 0) {
        throw new Error('No se encontraron fragmentos de texto suficientes en el PDF.');
      }

      const chunks = finalChunks.map((content: string, index: number) => ({
        content,
        metadata: { source: title, chunkIndex: index, type: 'pdf' }
      }));

      this.logger.log(`PDF extraído en ${chunks.length} chunks. Procediendo a ingesta vectorial...`);
      return this.ingestDocument(title, chunks);
    }
  }

  /**
   * Reconstruye el texto extraído por pdf-parse uniendo líneas que fueron
   * partidas por el salto de línea impreso del PDF.
   *
   * Problema: pdf-parse inserta \n al final de CADA línea impresa, incluso
   * dentro del mismo párrafo. Eso hace que "La niña, niño\ny adolescente tiene"
   * se convierta en dos líneas en lugar de una oración continua.
   *
   * Lógica:
   * - Línea que termina con guión: palabra partida → unir sin espacio
   * - Línea corta (<60 chars) que NO termina en punto/punto y coma: continúa
   *   en la siguiente → unir con espacio
   * - Línea que termina en punto/interrogación/exclamación: fin de oración → \n\n
   * - Línea siguiente que empieza con header legal (ARTÍCULO, CAPÍTULO, TÍTULO,
   *   LIBRO, SECCIÓN): separador estructural → \n\n
   * - Línea que es solo un número de página o encabezado de página: descartar
   */
  private reconstructPdfLines(rawText: string): string {
    const lines = rawText.split('\n');
    const result: string[] = [];
    let buffer = '';

    // Patrones para detectar inicios de sección estructural
    const structuralHeader = /^(ARTÍCULO|Artículo|CAPÍTULO|TÍTULO|LIBRO|SECCIÓN|SUBSECCIÓN|DISPOSICIÓN)\s/i;
    // Patrón para líneas que son solo número de página (ej. "  3  " o "123")
    const pageNumber = /^\s*\d{1,4}\s*$/;
    // Encabezados de página repetidos del libro (ej. "Código Niña, Niño y Adolescente")
    const pageHeader = /^(Código\s+Niña|Asamblea\s+Legislativa|ESTADO\s+PLURINACIONAL)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Descartar líneas vacías — acumulamos párrafo y añadimos separador
      if (trimmed.length === 0) {
        if (buffer.trim().length > 0) {
          result.push(buffer.trim());
          buffer = '';
        }
        continue;
      }

      // Descartar números de página y encabezados de página repetidos
      if (pageNumber.test(trimmed) || pageHeader.test(trimmed)) {
        continue;
      }

      // Si la línea siguiente (o la actual) es un header estructural → separar
      if (structuralHeader.test(trimmed)) {
        if (buffer.trim().length > 0) {
          result.push(buffer.trim());
          buffer = '';
        }
        buffer = trimmed;
        continue;
      }

      // Detectar palabra partida con guión al final: "conside-"
      if (trimmed.endsWith('-') && trimmed.length > 3) {
        // Quitar el guión y unir directamente con la siguiente línea
        buffer += trimmed.slice(0, -1);
        continue;
      }

      // Si el buffer está vacío, iniciar con esta línea
      if (buffer === '') {
        buffer = trimmed;
        continue;
      }

      // Decidir si unir o separar
      const lastChar = buffer[buffer.length - 1];
      const endsWithSentenceStop = /[.;:?!]$/.test(lastChar);
      const nextStartsWithUpper = /^[A-ZÁÉÍÓÚÑ\(]/.test(trimmed);
      const isLongLine = trimmed.length > 60;

      if (endsWithSentenceStop && nextStartsWithUpper && isLongLine) {
        // Fin de oración, la siguiente parece nueva oración/párrafo
        result.push(buffer.trim());
        buffer = trimmed;
      } else {
        // Misma oración o párrafo → unir con espacio
        buffer += ' ' + trimmed;
      }
    }

    // Volcar el último buffer
    if (buffer.trim().length > 0) {
      result.push(buffer.trim());
    }

    // Unir párrafos reconstruidos con doble salto de línea
    return result.join('\n\n');
  }

  /**
   * Colapsa espacios y tabs múltiples (muy frecuentes en texto extraído de
   * PDFs con texto justificado, ej. "niña,  niño  y  adolescente") a un solo
   * espacio, preservando los saltos de línea que separan párrafos.
   */
  private normalizeWhitespace(text: string): string {
    return text
      .split('\n')
      .map(line => line.replace(/[ \t]{2,}/g, ' ').trim())
      .join('\n');
  }

  /**
   * Elimina el índice/tabla de contenidos que suelen traer las leyes
   * bolivianas al principio del PDF (líneas del tipo
   * "Derecho a la salud .......... 18 a 21"). Ese bloque no tiene contenido
   * jurídico y solo genera chunks de ruido que compiten en la búsqueda
   * semántica con los artículos reales.
   *
   * Es deliberadamente conservador: sólo actúa si encuentra el inicio
   * ("Índice por artículos") Y el final típico (la fórmula "...DECRETA:" que
   * antecede al Artículo 1). Si no encuentra ambos marcadores, no toca nada,
   * así que es seguro dejarlo activo para documentos que no tengan índice.
   *
   * Nota: junto con el índice también se elimina la línea de promulgación
   * ("LEY Nº ... DECRETA:"), que tampoco aporta contenido jurídico.
   */
  private stripTableOfContents(text: string): string {
    const startMarker = /Índice\s+por\s+artículos/i;
    const endMarker = /D\s*E\s*C\s*R\s*E\s*T\s*A/i;

    const startMatch = text.match(startMarker);
    if (!startMatch || startMatch.index === undefined) {
      return text;
    }

    const remainder = text.slice(startMatch.index);
    const endMatch = remainder.match(endMarker);
    if (!endMatch || endMatch.index === undefined) {
      return text;
    }

    const endIndex = startMatch.index + endMatch.index + endMatch[0].length;
    return text.slice(0, startMatch.index) + text.slice(endIndex);
  }

  /**
   * Separa el CUERPO de la ley (donde viven los artículos que la propia
   * norma define) de las Disposiciones Adicionales/Transitorias/Finales/
   * Abrogatoria/Derogatoria.
   *
   * Por qué es necesario: en las leyes bolivianas es habitual que estas
   * disposiciones finales TRANSCRIBAN artículos completos de OTRAS leyes que
   * están siendo modificadas. Por ejemplo, la Ley 548 modifica el Código
   * Penal y cita textualmente:
   *
   *   "Artículo 5. (EN CUANTO A LAS PERSONAS). ..."
   *   "Artículo 258. (INFANTICIDIO). ..."
   *
   * y también el Código de Procedimiento Penal:
   *
   *   "Artículo 85. (ADOLESCENTES EN EL SISTEMA PENAL). ..."
   *
   * Si extractLegalArticlesFromText corriera sobre el texto completo, estos
   * fragmentos citados se detectan como si fueran artículos propios de la
   * Ley 548, generando dos problemas:
   *   1) Ruido: artículos que no pertenecen a esta ley quedan indexados
   *      como si lo fueran.
   *   2) Colisión de numeración: por ejemplo, el "Artículo 85" real de la
   *      Ley 548 (REQUISITOS PARA LA NIÑA, NIÑO O ADOLESCENTE ADOPTADO)
   *      terminaría compitiendo en la búsqueda semántica con un "Artículo
   *      85" ajeno (del Código de Procedimiento Penal), degradando la
   *      recuperación cuando alguien pregunte específicamente por ese
   *      número de artículo.
   *
   * Es deliberadamente conservador: si no encuentra ninguno de los
   * marcadores de disposiciones finales, devuelve todo el texto como
   * "body" y no separa nada (seguro para leyes con otra estructura).
   */
  private splitBodyAndDispositions(text: string): { body: string; dispositions: string } {
    const dispositionsMarker =
      /DISPOSICI[OÓ]N(?:ES)?\s+(?:ADICIONALES?|TRANSITORIAS?|FINALES?|ABROGATORIAS?|DEROGATORIAS?)/i;

    const match = text.match(dispositionsMarker);
    if (!match || match.index === undefined) {
      return { body: text, dispositions: '' };
    }

    return {
      body: text.slice(0, match.index),
      dispositions: text.slice(match.index),
    };
  }

  /**
   * Trocea el bloque de Disposiciones Adicionales/Transitorias/Finales con
   * chunking semántico normal (por párrafo + overlap), NO por "Artículo N",
   * porque cualquier numeración de artículo que aparezca ahí casi siempre
   * pertenece a OTRA ley citada dentro del texto (ver splitBodyAndDispositions).
   *
   * Esto permite seguir indexando y pudiendo buscar el contenido de estas
   * disposiciones (plazos de reglamentación, modificaciones a otras leyes,
   * vigencia, abrogatorias, etc.) sin que contaminen ni colisionen con la
   * numeración de artículos propios de la ley.
   */
  private buildDispositionChunks(
    dispositionsText: string,
    source: string,
    chunkIndexOffset = 0,
  ): { content: string; metadata: any }[] {
    const initialChunks = dispositionsText
      .split(/\n{2,}/)
      .map(t => t.trim())
      .filter(t => t.length > 80);

    const finalChunks = this.createSemanticChunks(initialChunks, {
      maxChunkSize: 3000,
      overlap: 150,
      preserveContext: true,
    });

    // chunkIndexOffset continúa la numeración después del último artículo
    // (en vez de reiniciar en 0), para que el visor de documentos —que
    // ordena únicamente por metadata.chunkIndex— muestre primero todos los
    // artículos y luego las disposiciones, sin intercalarlos.
    return finalChunks.map((content: string, index: number) => ({
      content,
      metadata: {
        source,
        type: 'legal_disposition_pdf',
        title: 'DISPOSICIONES ADICIONALES, TRANSITORIAS Y FINALES',
        chunkIndex: chunkIndexOffset + index,
      },
    }));
  }

  async processUrl(title: string, url: string) {
    this.logger.log(`Procesando URL: ${url}`);

    let html = '';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status HTTP: ${response.status}`);
      html = await response.text();
    } catch (err: any) {
      this.logger.error(`Error al descargar URL: ${err.message}`);
      throw new Error(`No se pudo descargar el contenido de la URL: ${err.message}`);
    }

    const cheerio = require('cheerio');
    const $ = cheerio.load(html);

    // Remover scripts, estilos y menús para quedarnos con el contenido puro
    $('script, style, nav, footer, header, aside, .sidebar, .menu, [role="navigation"]').remove();

    // Reemplazamos los saltos de línea y bloques para separar párrafos limpios
    $('br').replaceWith('\n');
    $('p, h1, h2, h3, h4, h5, h6, li, div').append('\n\n');

    const text = $('body').text();

    if (!text || text.trim().length === 0) {
      throw new Error('No se pudo extraer texto útil de la URL.');
    }

    // 1. Limpieza
    const cleanText = text.replace(/\x00/g, '').replace(/\s{3,}/g, ' \n\n');

    // 2. Separar cuerpo de disposiciones finales (mismo motivo que en processPdf:
    //    evitar que artículos de OTRAS leyes citados en disposiciones finales
    //    colisionen en numeración con artículos propios de esta norma).
    const { body, dispositions } = this.splitBodyAndDispositions(cleanText);

    // 3. Intentar detectar artículos legales SOLO en el cuerpo
    const articles = this.extractLegalArticlesFromText(body);

    if (articles.length > 0) {
      // Si detectamos artículos, usar UN ARTÍCULO = UN CHUNK
      this.logger.log(`Detectados ${articles.length} artículos legales en la URL`);
      let chunks = this.buildArticleChunks(articles, url, 'legal_article_web');

      if (dispositions.trim().length > 0) {
        const dispositionChunks = this.buildDispositionChunks(dispositions, url, chunks.length);
        this.logger.log(`Disposiciones finales trocedas en ${dispositionChunks.length} chunks adicionales`);
        chunks = chunks.concat(dispositionChunks);
      }

      this.logger.log(`URL extraída en ${chunks.length} chunks (${articles.length} artículos detectados). Procediendo a ingesta vectorial...`);
      return this.ingestDocument(title, chunks);
    } else {
      // Si no hay artículos detectables, usar chunking semántico con overlap
      this.logger.log(`No se detectaron artículos, usando chunking semántico con overlap`);
      let initialChunks = cleanText.split(/\n\s*\n/).map((t: string) => t.trim()).filter((t: string) => t.length > 50);

      const finalChunks = this.createSemanticChunks(initialChunks, {
        maxChunkSize: 1500,
        overlap: 150,
        preserveContext: true
      });

      if (finalChunks.length === 0) {
        throw new Error('No se encontraron fragmentos de texto suficientes en la URL.');
      }

      const chunks = finalChunks.map((content: string, index: number) => ({
        content,
        metadata: { source: url, chunkIndex: index, type: 'web' }
      }));

      this.logger.log(`URL extraída en ${chunks.length} chunks. Procediendo a ingesta vectorial...`);
      return this.ingestDocument(title, chunks);
    }
  }

  /**
   * Procesar archivo Markdown pre-estructurado
   * Estrategia: UN ARTÍCULO = UN CHUNK (enfoque legal boliviano)
   * Esta es la opción de MÁXIMA CALIDAD para documentos legales críticos
   */
  async processMarkdown(title: string, markdownContent: string) {
    this.logger.log(`Procesando Markdown: ${title}`);

    if (!markdownContent || markdownContent.trim().length === 0) {
      throw new Error('El archivo Markdown está vacío');
    }

    // 1. Parsear estructura Markdown detectando artículos legales
    const articles = this.parseLegalArticles(markdownContent);

    if (articles.length === 0) {
      throw new Error('No se encontraron artículos legales válidos en el Markdown');
    }

    // 2. Crear chunks por artículo (con partición de seguridad si un artículo
    //    es inusualmente largo, ver buildArticleChunks)
    const chunks = this.buildArticleChunks(articles, title, 'legal_article');

    this.logger.log(`Markdown parseado en ${chunks.length} chunks (${articles.length} artículos detectados). Procediendo a ingesta vectorial...`);
    return this.ingestDocument(title, chunks);
  }

  /**
   * Parsear estructura jerárquica de Markdown
   * Detecta headers (# ## ###) y construye secciones con contexto
   */
  private parseMarkdownStructure(markdown: string): Array<{ title: string; level: number; content: string }> {
    const sections = [];
    const lines = markdown.split('\n');

    let currentSection: any = null;
    let currentContent = '';

    for (const line of lines) {
      // Detectar headers markdown (# Título, ## Artículo, ### Inciso)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headerMatch) {
        // Guardar sección anterior si existe
        if (currentSection) {
          currentSection.content = currentContent.trim();
          if (currentSection.content.length > 50) {
            sections.push(currentSection);
          }
        }

        // Iniciar nueva sección
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        currentSection = { title, level, content: '' };
        currentContent = `${'#'.repeat(level)} ${title}\n\n`;
      } else {
        // Agregar contenido a la sección actual
        currentContent += line + '\n';
      }
    }

    // Guardar última sección
    if (currentSection) {
      currentSection.content = currentContent.trim();
      if (currentSection.content.length > 50) {
        sections.push(currentSection);
      }
    }

    // Si no se encontraron secciones con headers, tratar todo el documento como una sola sección
    if (sections.length === 0) {
      sections.push({
        title: 'Documento completo',
        level: 1,
        content: markdown.trim()
      });
    }

    return sections;
  }

  /**
   * Parsear Markdown detectando artículos legales bolivianos
   * Patrón: "Artículo N°.- (TÍTULO)" o "Artículo N.- (TÍTULO)" o, muy
   * frecuentemente en leyes bolivianas reales, "Artículo N. (TÍTULO)" SIN
   * guión. El guión es opcional a propósito.
   * UN ARTÍCULO = UN CHUNK (sin límite de tamaño; ver buildArticleChunks
   * para el límite de seguridad ante artículos anormalmente largos)
   */
  private parseLegalArticles(markdown: string): Array<{
    articleNumber: string;
    articleTitle: string;
    fullContent: string;
    level: number;
  }> {
    const articles = [];

    const lines = markdown.split('\n');
    let currentArticle: any = null;
    let currentContent = '';
    let inArticle = false;

    // El guión ("-"/"—") entre el número y el título es OPCIONAL: muchas
    // leyes bolivianas reales usan "Artículo 1. (TÍTULO)" sin guión.
    const headerRegex = /^(#{1,3}\s+)?Art[iIíÍ]culo\s+(\d+[°º]?)\.\s*[-—]?\s*\(([^)]+)\)/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(headerRegex);

      if (match) {
        // Guardar artículo anterior si existe
        if (currentArticle) {
          currentArticle.fullContent = currentContent.trim();
          if (currentArticle.fullContent.length > 50) {
            articles.push(currentArticle);
          }
        }

        // Detectar nivel de header (si existe)
        const headerLevel = match[1] ? match[1].trim().length : 0;
        const articleNumber = match[2];
        const articleTitle = match[3].trim();

        // Iniciar nuevo artículo
        currentArticle = {
          articleNumber,
          articleTitle,
          fullContent: '',
          level: headerLevel
        };

        // Iniciar contenido con el header completo
        currentContent = line + '\n\n';
        inArticle = true;
      } else if (inArticle) {
        // Agregar línea al contenido del artículo actual
        currentContent += line + '\n';
      } else {
        // Si no estamos en un artículo, ignorar (puede ser preámbulo)
        // Pero si encontramos contenido antes del primer artículo, guardarlo como "Preámbulo"
        if (articles.length === 0 && line.trim().length > 0 && currentContent.trim().length < 500) {
          currentContent += line + '\n';
        }
      }
    }

    // Guardar último artículo
    if (currentArticle) {
      currentArticle.fullContent = currentContent.trim();
      if (currentArticle.fullContent.length > 50) {
        articles.push(currentArticle);
      }
    }

    // Si hay contenido de preámbulo, agregarlo como artículo especial
    if (currentContent.trim().length > 50 && articles.length === 0) {
      articles.unshift({
        articleNumber: '0',
        articleTitle: 'PREÁMBULO',
        fullContent: currentContent.trim(),
        level: 1
      });
    }

    return articles;
  }

  /**
   * Extraer artículos legales de texto plano (PDF o Web)
   * Similar a parseLegalArticles pero más robusto para texto sin formato
   */
  private extractLegalArticlesFromText(text: string): Array<{
    articleNumber: string;
    articleTitle: string;
    fullContent: string;
  }> {
    const articles = [];

    // Patrones flexibles para texto plano.
    // IMPORTANTE:
    // 1) El guión/raya ("-" o "—") entre el número y el título es OPCIONAL,
    //    porque las leyes bolivianas reales suelen venir como
    //    "ARTÍCULO 1. (OBJETO)." sin guión. Antes esto era obligatorio y
    //    hacía que NUNCA se detectara ningún artículo.
    // 2) El flag "i" + la clase [iIíÍ] ya cubren "Artículo"/"ARTÍCULO"/
    //    "artículo", así que NO hace falta un patrón separado por cada
    //    variante de mayúsculas/minúsculas (tenerlos por separado
    //    duplicaba cada artículo detectado, generando embeddings repetidos).
    const patterns = [
      /Art[iIíÍ]culo\s+(\d+[°º]?)\.\s*[-—]?\s*\(([^)]+)\)/gi,
      /Art\.\s+(\d+[°º]?)\.\s*[-—]?\s*\(([^)]+)\)/gi,
    ];

    // Buscar todas las coincidencias en el texto
    const matches: Array<{ index: number; number: string; title: string; fullMatch: string }> = [];

    for (const pattern of patterns) {
      let match;
      pattern.lastIndex = 0; // Resetear regex antes de reutilizarla

      while ((match = pattern.exec(text)) !== null) {
        matches.push({
          index: match.index,
          number: match[1],
          title: match[2].trim(),
          fullMatch: match[0]
        });
      }
    }

    // Eliminar coincidencias duplicadas que apunten a la misma posición del
    // texto (puede pasar si más de un patrón matchea el mismo artículo)
    const seenIndices = new Set<number>();
    const uniqueMatches = matches.filter(m => {
      if (seenIndices.has(m.index)) return false;
      seenIndices.add(m.index);
      return true;
    });

    // Ordenar por posición en el texto
    uniqueMatches.sort((a, b) => a.index - b.index);

    // Extraer contenido completo de cada artículo
    for (let i = 0; i < uniqueMatches.length; i++) {
      const current = uniqueMatches[i];
      const next = uniqueMatches[i + 1];

      const startIndex = current.index;
      const endIndex = next ? next.index : text.length;

      const fullContent = text.substring(startIndex, endIndex).trim();

      if (fullContent.length > 50) {
        articles.push({
          articleNumber: current.number,
          articleTitle: current.title,
          fullContent: fullContent
        });
      }
    }

    return articles;
  }

  /**
   * Convierte artículos detectados (parseLegalArticles / extractLegalArticlesFromText)
   * en chunks listos para embeddings.
   *
   * Comportamiento por defecto: UN ARTÍCULO = UN CHUNK, tal como espera el
   * enfoque legal boliviano. Como red de seguridad, si un artículo puntual es
   * inusualmente largo (muchos incisos, ej. un artículo con incisos a) a gg))
   * se divide en partes usando el mismo separador de oraciones legal-aware,
   * repitiendo el encabezado del artículo en cada parte para que cada chunk
   * conserve contexto por sí solo incluso si se recupera de forma aislada.
   */
  private buildArticleChunks(
    articles: Array<{ articleNumber: string; articleTitle: string; fullContent: string; level?: number }>,
    source: string,
    type: string,
    maxChunkSize = 6000,
    overlap = 200
  ): { content: string; metadata: any }[] {
    const chunks: { content: string; metadata: any }[] = [];

    for (const article of articles) {
      const baseMetadata = {
        source,
        type,
        article: article.articleNumber,
        title: article.articleTitle,
        ...(article.level !== undefined ? { level: article.level } : {})
      };

      if (article.fullContent.length <= maxChunkSize) {
        chunks.push({
          content: article.fullContent,
          metadata: { ...baseMetadata, chunkIndex: chunks.length }
        });
        continue;
      }

      // Artículo demasiado largo: dividir preservando contexto
      const header = `Artículo ${article.articleNumber} (${article.articleTitle})`;
      const sentences = this.splitIntoLegalSentences(article.fullContent);
      const parts: string[] = [];
      let current = '';

      for (const sentence of sentences) {
        if ((current + sentence).length > maxChunkSize && current.trim().length > 50) {
          parts.push(current.trim());
          const overlapText = this.getOverlapText(current, overlap);
          current = (overlapText ? overlapText + ' ' : '') + sentence + ' ';
        } else {
          current += sentence + ' ';
        }
      }
      if (current.trim().length > 0) {
        parts.push(current.trim());
      }

      parts.forEach((part, partIdx) => {
        const content = partIdx === 0
          ? part
          : `${header} — continuación (parte ${partIdx + 1} de ${parts.length}):\n\n${part}`;

        chunks.push({
          content,
          metadata: {
            ...baseMetadata,
            chunkIndex: chunks.length,
            part: partIdx + 1,
            totalParts: parts.length
          }
        });
      });
    }

    return chunks;
  }

  async getDocuments() {
    return this.prisma.legalDocument.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { chunks: true },
        },
      },
    });
  }

  async getDocumentChunks(documentId: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT id, content, metadata
      FROM legal_chunks
      WHERE "legalDocumentId" = ${documentId}::uuid
    `;

    // Sort en memoria para evitar errores de parseo de JSON en raw queries
    return rows.sort((a, b) => {
      const idxA = a.metadata?.chunkIndex || 0;
      const idxB = b.metadata?.chunkIndex || 0;
      return idxA - idxB;
    });
  }

  async toggleDocumentStatus(id: string) {
    const doc = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!doc) throw new Error('Documento no encontrado');

    return this.prisma.legalDocument.update({
      where: { id },
      data: { isActive: !doc.isActive },
    });
  }

  /**
   * Eliminar permanentemente un documento y todos sus chunks/embeddings
   */
  async deleteDocument(id: string) {
    this.logger.log(`Iniciando eliminación permanente del documento: ${id}`);

    const document = await this.prisma.legalDocument.findUnique({
      where: { id },
      include: { _count: { select: { chunks: true } } }
    });

    if (!document) {
      throw new Error('Documento no encontrado');
    }

    try {
      // 1. Eliminar todos los chunks (embeddings) del documento
      const deletedChunks = await this.prisma.legalChunk.deleteMany({
        where: { legalDocumentId: id }
      });

      // 2. Eliminar el documento base
      await this.prisma.legalDocument.delete({
        where: { id }
      });

      this.logger.log(`Documento "${document.title}" eliminado permanentemente. Chunks eliminados: ${deletedChunks.count}`);

      return {
        message: 'Documento eliminado permanentemente',
        document: {
          id: document.id,
          title: document.title
        },
        chunksDeleted: deletedChunks.count
      };
    } catch (error: any) {
      this.logger.error(`Error al eliminar documento ${id}: ${error.message}`);
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  /**
   * Validar formato de Markdown antes de ingestar
   * Retorna preview de chunks que se generarán y posibles errores
   */
  async validateMarkdown(markdownContent: string) {
    const result: any = {
      isValid: true,
      errors: [],
      warnings: [],
      articlesDetected: 0,
      preview: [],
      statistics: {
        totalCharacters: markdownContent.length,
        totalLines: markdownContent.split('\n').length,
        estimatedChunks: 0,
        averageChunkSize: 0,
        hasPreambule: false
      }
    };

    // Validación 1: Contenido vacío
    if (!markdownContent || markdownContent.trim().length === 0) {
      result.isValid = false;
      result.errors.push('El contenido está vacío');
      return result;
    }

    // Validación 2: Longitud mínima
    if (markdownContent.length < 100) {
      result.isValid = false;
      result.errors.push('El contenido es demasiado corto (mínimo 100 caracteres)');
      return result;
    }

    // Intentar parsear artículos legales
    const articles = this.parseLegalArticles(markdownContent);

    if (articles.length === 0) {
      result.warnings.push('No se detectaron artículos legales con formato "Artículo N. (TÍTULO)" (con o sin guión)');
      result.warnings.push('El documento se procesará con chunking semántico estándar');

      // Estimar chunks con fallback
      const estimatedChunks = Math.ceil(markdownContent.length / 1500);
      result.statistics.estimatedChunks = estimatedChunks;
      result.statistics.averageChunkSize = Math.round(markdownContent.length / estimatedChunks);

      return result;
    }

    // Validación exitosa con artículos detectados
    result.articlesDetected = articles.length;
    result.statistics.estimatedChunks = articles.length;
    result.statistics.hasPreambule = articles.some(a => a.articleNumber === '0');

    // Generar preview de cada artículo
    let totalSize = 0;
    for (const article of articles) {
      const contentPreview = article.fullContent.length > 200
        ? article.fullContent.substring(0, 200) + '...'
        : article.fullContent;

      result.preview.push({
        articleNumber: article.articleNumber,
        articleTitle: article.articleTitle,
        contentPreview,
        estimatedChunkSize: article.fullContent.length
      });

      totalSize += article.fullContent.length;

      // Advertencias sobre artículos muy largos
      if (article.fullContent.length > 5000) {
        result.warnings.push(
          `Artículo ${article.articleNumber} es muy largo (${article.fullContent.length} caracteres). ` +
          `Se dividirá automáticamente en varias partes al ingestar (ver buildArticleChunks).`
        );
      }

      // Advertencias sobre artículos muy cortos
      if (article.fullContent.length < 100) {
        result.warnings.push(
          `Artículo ${article.articleNumber} es muy corto (${article.fullContent.length} caracteres). ` +
          `Verifica que el contenido esté completo.`
        );
      }
    }

    result.statistics.averageChunkSize = Math.round(totalSize / articles.length);

    // Validación de numeración consecutiva
    const numbers = articles.map(a => parseInt(a.articleNumber.replace(/[°º]/g, '')));
    const hasGaps = numbers.some((num, idx) => {
      if (idx === 0 && num === 0) return false; // Preámbulo
      if (idx === 0) return num !== 1;
      return num !== numbers[idx - 1] + 1;
    });

    if (hasGaps) {
      result.warnings.push(
        'La numeración de artículos no es consecutiva. Verifica que no falten artículos.'
      );
    }

    // Validación de formato de headers
    const linesWithHeaders = markdownContent.split('\n').filter(line =>
      line.trim().startsWith('#')
    );
    const linesWithArticlesNoHeader = markdownContent.split('\n').filter(line =>
      /^Art[iIíÍ]culo\s+\d+[°º]?\.\s*[-—]?\s*\(/.test(line.trim()) && !line.trim().startsWith('#')
    );

    if (linesWithArticlesNoHeader.length > 0) {
      result.warnings.push(
        `Se encontraron ${linesWithArticlesNoHeader.length} artículos sin headers de Markdown (##). ` +
        `Recomendamos agregar "##" antes de cada artículo para mejor estructura.`
      );
    }

    return result;
  }

  /**
   * Chunking semántico mejorado con overlap
   * Soluciona el problema de fragmentación que corta en medio de oraciones
   */
  private createSemanticChunks(
    initialChunks: string[],
    options: { maxChunkSize: number; overlap: number; preserveContext: boolean }
  ): string[] {
    const finalChunks: string[] = [];

    for (const chunk of initialChunks) {
      if (chunk.length <= options.maxChunkSize) {
        finalChunks.push(chunk);
      } else {
        // Dividir en oraciones usando regex mejorado que respeta abreviaciones legales
        const sentences = this.splitIntoLegalSentences(chunk);
        let currentSubChunk = '';
        let previousChunkEnd = ''; // Para overlap

        for (let i = 0; i < sentences.length; i++) {
          const sentence = sentences[i];

          // Si agregar esta oración supera el límite, guardar el chunk actual
          if ((currentSubChunk + sentence).length > options.maxChunkSize && currentSubChunk.trim().length > 50) {
            // Guardar el chunk completo
            const chunkToSave = options.preserveContext && previousChunkEnd
              ? previousChunkEnd + currentSubChunk.trim()
              : currentSubChunk.trim();

            finalChunks.push(chunkToSave);

            // Preparar overlap para el siguiente chunk (últimos N caracteres,
            // ajustado a un límite de palabra para no partir palabras a la mitad)
            previousChunkEnd = this.getOverlapText(currentSubChunk, options.overlap) + ' ';

            // Iniciar nuevo bloque con la oración actual
            currentSubChunk = sentence + ' ';
          } else {
            currentSubChunk += sentence + ' ';
          }
        }

        // Guardar el último sub-chunk si tiene contenido válido
        if (currentSubChunk.trim().length > 50) {
          const chunkToSave = options.preserveContext && previousChunkEnd
            ? previousChunkEnd + currentSubChunk.trim()
            : currentSubChunk.trim();
          finalChunks.push(chunkToSave);
        }
      }
    }

    return finalChunks;
  }

  /**
   * Toma los últimos `maxChars` caracteres de `text` para usarlos como
   * overlap, pero ajustando el corte al siguiente espacio para NO partir una
   * palabra a la mitad (ej. evitar el bug de "niños" -> "ni" + "ños" en
   * chunks consecutivos).
   */
  private getOverlapText(text: string, maxChars: number): string {
    const trimmed = text.trim();
    if (trimmed.length <= maxChars) {
      return trimmed;
    }

    let slice = trimmed.slice(-maxChars);
    const firstSpaceIndex = slice.indexOf(' ');
    if (firstSpaceIndex > -1 && firstSpaceIndex < slice.length - 1) {
      slice = slice.slice(firstSpaceIndex + 1);
    }
    return slice.trim();
  }

  /**
   * Divide texto en oraciones respetando abreviaciones legales bolivianas
   * Evita cortar en "Art.", "Inc.", "Ley N°", "Dr.", etc.
   */
  private splitIntoLegalSentences(text: string): string[] {
    // Abreviaciones legales comunes en Bolivia
    const legalAbbreviations = [
      'Art', 'Inc', 'Párr', 'Parag', 'Ley', 'Nº', 'N°', 'Sr', 'Sra',
      'Dr', 'Dra', 'Lic', 'C\\.I', 'R\\.N\\.I', 'GAM', 'DNA', 'NNA',
      'Pág', 'Cap', 'Sec', 'Lit', 'Gral', 'Vs', 'Vol'
    ];

    // Proteger abreviaciones temporalmente
    let protectedText = text;
    const protectionMap = new Map<string, string>();

    legalAbbreviations.forEach((abbr, idx) => {
      const regex = new RegExp(`\\b${abbr}\\.`, 'g');
      const placeholder = `__ABBR${idx}__`;
      protectedText = protectedText.replace(regex, (match) => {
        protectionMap.set(placeholder, match);
        return placeholder;
      });
    });

    // Dividir por oraciones (., !, ?) seguido de espacio y mayúscula
    const sentencePattern = /(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑa-záéíóúñ])/g;
    const sentences = protectedText.split(sentencePattern);

    // Restaurar abreviaciones
    return sentences.map(sentence => {
      let restored = sentence;
      protectionMap.forEach((original, placeholder) => {
        restored = restored.replace(new RegExp(placeholder, 'g'), original);
      });
      return restored.trim();
    }).filter(s => s.length > 10);
  }

  /**
   * Buscar chunks vectoriales de un caso específico usando RAG con aislamiento por caseId.
   * Utiliza la tabla case_chunks que tiene embeddings y caseId.
   */
  async searchByCase(caseId: string, query: string, limit: number = 5) {
    this.logger.log(`Búsqueda RAG para caseId=${caseId}, query: "${query}"`);

    try {
      // 1. Generar embedding de la consulta
      const queryEmbedding = await this.embeddings.getEmbedding(query);
      const embeddingStr = `[${queryEmbedding.join(',')}]`;

      // 2. Buscar chunks similares del caso usando pgvector (cosine similarity)
      //    con aislamiento estricto por caseId
      const results = await this.prisma.$queryRaw<
        Array<{
          id: string;
          content: string;
          caseId: string;
          sourceType: string;
          metadata: any;
          similarity: number;
        }>
      >`
        SELECT
          cc.id,
          cc.content,
          cc."caseId",
          cc."sourceType",
          cc.metadata,
          (cc.embedding <=> ${embeddingStr}::vector) as similarity
        FROM case_chunks cc
        WHERE cc."caseId" = ${caseId}::uuid
        ORDER BY similarity ASC
        LIMIT ${limit}
      `;

      return results.map((r) => ({
        id: r.id,
        content: r.content,
        caseId: r.caseId,
        sourceType: r.sourceType,
        metadata: r.metadata,
        similarity: r.similarity,
      }));
    } catch (error) {
      this.logger.error(`Error en búsqueda RAG por caso: ${error.message}`);
      throw error;
    }
  }

  /**
   * Retorna transcripciones asociadas a un caseId específico.
   * Reutiliza TranscriptionService para el aislamiento por caseId.
   */
  async getTranscriptionsForCase(caseId: string) {
    this.logger.log(`Obteniendo transcripciones para caseId=${caseId}`);
    return this.transcriptionService.getTranscriptionsForCase(caseId);
  }
}
