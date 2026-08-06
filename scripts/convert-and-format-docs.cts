#!/usr/bin/env ts-node
/**
 * Conversión masiva de documentos legales a Markdown estructurado
 * - PDF → pdf-parse
 * - DOCX → mammoth
 * - Salida: docs/marco-legal/md-processed/ con encabezados ## Artículo N.- y [METADATA: ...]
 */
/// <reference path="./pdf-parse-fixed.d.cts" />
import * as fs from 'fs';
import * as path from 'path';
import pdfParse from 'pdf-parse-fixed';
import * as mammoth from 'mammoth';

const INPUT_DIR = path.resolve(__dirname, '../docs/marco-legal/legal');
const OUTPUT_DIR = path.resolve(__dirname, '../docs/marco-legal/md-processed');

interface DocMetadata {
  sourceFile: string;
  title: string;
  documentType: 'ley' | 'protocolo' | 'guia' | 'plan' | 'reglamento' | 'matriz' | 'manual';
  jurisdiction: 'nacional' | 'departamental' | 'municipal';
  year?: number;
}

const FILE_METADATA: Record<string, DocMetadata> = {
  '2. GUIA DE ORIENTACIÓN PARA LA GESTIÓN DE CASOS.pdf': {
    sourceFile: '2. GUIA DE ORIENTACIÓN PARA LA GESTIÓN DE CASOS.pdf',
    title: 'Guía de Orientación para la Gestión de Casos',
    documentType: 'guia',
    jurisdiction: 'nacional',
  },
  '3. PROTOCOLO DE COORDINACIÓN INTERINSTITUCIONAL.pdf': {
    sourceFile: '3. PROTOCOLO DE COORDINACIÓN INTERINSTITUCIONAL.pdf',
    title: 'Protocolo de Coordinación Interinstitucional',
    documentType: 'protocolo',
    jurisdiction: 'nacional',
  },
  'G1927560 OG 24.pdf': {
    sourceFile: 'G1927560 OG 24.pdf',
    title: 'Gaceta Oficial G1927560 OG 24',
    documentType: 'ley',
    jurisdiction: 'nacional',
  },
  'Guia-Nacional-Post-Egreso-para-Adolescentes (1).pdf': {
    sourceFile: 'Guia-Nacional-Post-Egreso-para-Adolescentes (1).pdf',
    title: 'Guía Nacional Post-Egreso para Adolescentes',
    documentType: 'guia',
    jurisdiction: 'nacional',
  },
  'Guía Mecanismos de Justicia Restaurativa.pdf': {
    sourceFile: 'Guía Mecanismos de Justicia Restaurativa.pdf',
    title: 'Guía Mecanismos de Justicia Restaurativa',
    documentType: 'guia',
    jurisdiction: 'nacional',
  },
  'Ley Municpal de la Niña, Niño y Adolescente 120-18.pdf': {
    sourceFile: 'Ley Municpal de la Niña, Niño y Adolescente 120-18.pdf',
    title: 'Ley Municipal de la Niña, Niño y Adolescente 120-18',
    documentType: 'ley',
    jurisdiction: 'municipal',
    year: 2018,
  },
  'Lineamientos para Centros de Reintegración Social y Orientación.pdf': {
    sourceFile: 'Lineamientos para Centros de Reintegración Social y Orientación.pdf',
    title: 'Lineamientos para Centros de Reintegración Social y Orientación',
    documentType: 'guia',
    jurisdiction: 'nacional',
  },
  'Manuales especializados sistema penal Bolivia.pdf': {
    sourceFile: 'Manuales especializados sistema penal Bolivia.pdf',
    title: 'Manuales Especializados Sistema Penal Bolivia',
    documentType: 'manual',
    jurisdiction: 'nacional',
  },
  'marco-normativo.md': {
    sourceFile: 'marco-normativo.md',
    title: 'Marco Normativo Consolidado',
    documentType: 'ley',
    jurisdiction: 'nacional',
  },
  'Matriz_justicia_restaurativa_enfoque_defensa_persona_ofensora.docx': {
    sourceFile: 'Matriz_justicia_restaurativa_enfoque_defensa_persona_ofensora.docx',
    title: 'Matriz Justicia Restaurativa - Enfoque Defensa Persona Ofensora',
    documentType: 'matriz',
    jurisdiction: 'nacional',
  },
  'matriz_justicia_restaurativa_violencia_sexual.docx': {
    sourceFile: 'matriz_justicia_restaurativa_violencia_sexual.docx',
    title: 'Matriz Justicia Restaurativa - Violencia Sexual',
    documentType: 'matriz',
    jurisdiction: 'nacional',
  },
  'PLAN DEPARTAMENTAL NNA 8-07-2024 ok ok - ultimo.pdf': {
    sourceFile: 'PLAN DEPARTAMENTAL NNA 8-07-2024 ok ok - ultimo.pdf',
    title: 'Plan Departamental NNA 2024',
    documentType: 'plan',
    jurisdiction: 'departamental',
    year: 2024,
  },
  'Plan Municipal NNA Sucre FInal 21-11-2021.pdf': {
    sourceFile: 'Plan Municipal NNA Sucre FInal 21-11-2021.pdf',
    title: 'Plan Municipal NNA Sucre 2021',
    documentType: 'plan',
    jurisdiction: 'municipal',
    year: 2021,
  },
  'Plan prevencion embarazo adolescentes GAMS.pdf': {
    sourceFile: 'Plan prevencion embarazo adolescentes GAMS.pdf',
    title: 'Plan Prevención Embarazo Adolescentes GAMS',
    documentType: 'plan',
    jurisdiction: 'municipal',
  },
  'Protocolo Amigable Protocolo violencia sexual DNA GAMS.pdf': {
    sourceFile: 'Protocolo Amigable Protocolo violencia sexual DNA GAMS.pdf',
    title: 'Protocolo Amigable - Violencia Sexual DNA GAMS',
    documentType: 'protocolo',
    jurisdiction: 'municipal',
  },
  'Protocolo Completo violencia sexual DNA GAMS.pdf': {
    sourceFile: 'Protocolo Completo violencia sexual DNA GAMS.pdf',
    title: 'Protocolo Completo Violencia Sexual DNA GAMS',
    documentType: 'protocolo',
    jurisdiction: 'municipal',
  },
  'Reglamento Ley Municipal de NNA de Sucre.pdf': {
    sourceFile: 'Reglamento Ley Municipal de NNA de Sucre.pdf',
    title: 'Reglamento Ley Municipal de NNA de Sucre',
    documentType: 'reglamento',
    jurisdiction: 'municipal',
  },
};

async function extractPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text;
}

async function extractDocxText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function extractMdText(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

function detectArticles(text: string): Array<{ number: string; title: string; content: string; startIdx: number }> {
  const articles: Array<{ number: string; title: string; content: string; startIdx: number }> = [];
  const lines = text.split('\n');
  let currentArticle: { number: string; title: string; content: string; startIdx: number } | null = null;
  let contentBuffer = '';
  let lineIndex = 0;

  const articleRegex = /^(?:#{1,3}\s+)?Art[ií]culo\s+(\d+[°º]?)\.\s*[-—]?\s*\(([^)]+)\)/i;
  const articleRegexSimple = /^Art[ií]culo\s+(\d+[°º]?)\.\s*[-—]?\s*\(([^)]+)\)/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(articleRegex) || line.match(articleRegexSimple);

    if (match) {
      if (currentArticle) {
        currentArticle.content = contentBuffer.trim();
        articles.push(currentArticle);
      }
      currentArticle = {
        number: match[1],
        title: match[2].trim(),
        content: '',
        startIdx: lineIndex,
      };
      contentBuffer = line + '\n';
    } else if (currentArticle) {
      contentBuffer += line + '\n';
    }
    lineIndex++;
  }

  if (currentArticle) {
    currentArticle.content = contentBuffer.trim();
    articles.push(currentArticle);
  }

  return articles;
}

function formatAsMarkdown(metadata: DocMetadata, text: string): { markdown: string; articlesCount: number } {
  const articles = detectArticles(text);

  let md = `# ${metadata.title}\n\n`;
  md += `[METADATA: source="${metadata.sourceFile}" type="${metadata.documentType}" jurisdiction="${metadata.jurisdiction}"${metadata.year ? ` year="${metadata.year}"` : ''}]\n\n`;

  if (articles.length > 0) {
    md += `> **${articles.length} artículos detectados**\n\n`;
    for (const article of articles) {
      md += `## Artículo ${article.number}.- (${article.title})\n\n`;
      md += `${article.content}\n\n`;
      md += `[METADATA: article="${article.number}" title="${article.title}"]\n\n`;
    }
  } else {
    // No se detectaron artículos: chunking semántico por párrafos
    const paragraphs = text.split(/\n{2,}/).filter(p => p.trim().length > 100);
    for (let i = 0; i < paragraphs.length; i++) {
      md += `## Sección ${i + 1}\n\n`;
      md += `${paragraphs[i].trim()}\n\n`;
      md += `[METADATA: section="${i + 1}" type="semantic_chunk"]\n\n`;
    }
  }

  return { markdown: md, articlesCount: articles.length };
}

async function processFile(fileName: string): Promise<void> {
  const filePath = path.join(INPUT_DIR, fileName);
  const metadata = FILE_METADATA[fileName];

  if (!metadata) {
    console.warn(`⚠️  Sin metadatos definidos para: ${fileName}`);
    return;
  }

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Archivo no encontrado: ${filePath}`);
    return;
  }

  console.log(`📄 Procesando: ${fileName}`);

  let rawText = '';
  const ext = path.extname(fileName).toLowerCase();

  try {
    if (ext === '.pdf') {
      rawText = await extractPdfText(filePath);
    } else if (ext === '.docx') {
      rawText = await extractDocxText(filePath);
    } else if (ext === '.md') {
      rawText = extractMdText(filePath);
    } else {
      console.warn(`⚠️  Extensión no soportada: ${ext}`);
      return;
    }

    if (!rawText || rawText.trim().length < 50) {
      console.warn(`⚠️  Texto extraído muy corto para: ${fileName}`);
      return;
    }

    const { markdown, articlesCount } = formatAsMarkdown(metadata, rawText);

    const outputFileName = path.basename(fileName, ext) + '.md';
    const outputPath = path.join(OUTPUT_DIR, outputFileName);
    fs.writeFileSync(outputPath, markdown, 'utf-8');

    console.log(`✅ Guardado: ${outputFileName} (${articlesCount > 0 ? articlesCount + ' artículos' : 'chunks semánticos'})`);
  } catch (error) {
    console.error(`❌ Error procesando ${fileName}:`, error);
  }
}

async function main() {
  console.log('🚀 Iniciando conversión masiva de documentos legales...\n');

  const files = Object.keys(FILE_METADATA);
  for (const fileName of files) {
    await processFile(fileName);
  }

  console.log('\n✨ Conversión completada. Archivos en:', OUTPUT_DIR);
}

main().catch(console.error);