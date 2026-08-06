#!/usr/bin/env ts-node
/**
 * Ingesta masiva de documentos Markdown procesados a pgvector via knowledgeService
 * Usa el endpoint: POST /api/knowledge/upload-markdown (multipart/form-data)
 */
import * as fs from 'fs';
import * as path from 'path';

const MD_PROCESSED_DIR = path.resolve(__dirname, '../docs/marco-legal/md-processed');
const API_BASE = 'http://localhost:4100/api';

interface IngestResult {
  success: boolean;
  documentId?: string;
  chunksProcessed?: number;
  error?: string;
}

async function ingestMarkdown(fileName: string): Promise<IngestResult> {
  const filePath = path.join(MD_PROCESSED_DIR, fileName);

  try {
    const stats = fs.statSync(filePath);
    if (stats.size < 100) {
      return { success: false, error: 'Archivo muy pequeño' };
    }

    // Leer el archivo y crear multipart manualmente
    const fileBuffer = fs.readFileSync(filePath);
    const boundary = `----WebKitFormBoundary${Date.now()}`;
    const title = path.basename(fileName, '.md');

    const bodyParts = [
      `--${boundary}`,
      `Content-Disposition: form-data; name="title"`,
      ``,
      title,
      `--${boundary}`,
      `Content-Disposition: form-data; name="file"; filename="${fileName}"`,
      `Content-Type: text/markdown`,
      ``,
      fileBuffer.toString('utf-8'),
      `--${boundary}--`,
      ``,
    ];

    const body = bodyParts.join('\r\n');

    const response = await fetch(`${API_BASE}/knowledge/upload-markdown`, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body,
    });

    const data = await response.json() as { documentId?: string; chunksProcessed?: number; message?: string };

    if (!response.ok) {
      return { success: false, error: data.message || `HTTP ${response.status}` };
    }

    return {
      success: true,
      documentId: data.documentId,
      chunksProcessed: data.chunksProcessed,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function main() {
  console.log('🚀 Iniciando ingesta masiva a pgvector via /upload-markdown...\n');

  const files = fs.readdirSync(MD_PROCESSED_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No hay archivos .md en', MD_PROCESSED_DIR);
    return;
  }

  console.log(`📚 Encontrados ${files.length} archivos para ingerir\n`);

  let successCount = 0;
  let failCount = 0;

  for (const fileName of files) {
    const title = path.basename(fileName, '.md');
    console.log(`📥 Ingeriendo: ${title}...`);

    const result = await ingestMarkdown(fileName);

    if (result.success) {
      console.log(`   ✅ Documento: ${result.documentId} | Chunks: ${result.chunksProcessed}`);
      successCount++;
    } else {
      console.log(`   ❌ Error: ${result.error}`);
      failCount++;
    }

    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Resumen: ${successCount} exitosos, ${failCount} fallidos`);
}

main().catch(console.error);