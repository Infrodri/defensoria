import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { KnowledgeService } from '../modules/knowledge/knowledge.service';
import { EmbeddingsService } from '../modules/knowledge/embeddings.service';

const prisma = new PrismaClient();
const embeddingsService = new EmbeddingsService(prisma as any);
const knowledgeService = new KnowledgeService(prisma as any, embeddingsService, null as any);

const FOLDER_PATH = 'C:\\dev\\defensoria\\docs\\marco-legal\\legal';

async function ingestFile(fileName: string) {
  const fullPath = path.join(FOLDER_PATH, fileName);
  const ext = path.extname(fileName).toLowerCase();
  const title = path.basename(fileName, ext);

  // Solo procesar los que fallaron o docx
  const existing = await prisma.legalDocument.findFirst({
    where: { title },
    include: { _count: { select: { chunks: true } } },
  });

  // Si ya tiene más de 5 chunks, considerarlo completado exitosamente
  if (existing && existing._count.chunks > 5) {
    console.log(`⏩ Omitiendo "${title}": ya tiene ${existing._count.chunks} chunks.`);
    return;
  }

  console.log(`\n==================================================`);
  console.log(`📄 Procesando: "${title}" (${fileName})`);

  if (existing) {
    await prisma.legalChunk.deleteMany({ where: { legalDocumentId: existing.id } });
    await prisma.legalDocument.delete({ where: { id: existing.id } });
    console.log(`🗑️  Registro anterior incompleto borrado.`);
  }

  const buffer = fs.readFileSync(fullPath);

  if (ext === '.pdf') {
    const res = await knowledgeService.processPdf(title, buffer);
    console.log(`✅ PDF Ingerido: ${res.chunksProcessed} chunks creados.`);
  } else if (ext === '.docx') {
    const mammoth = require('mammoth');
    const raw = await mammoth.extractRawText({ buffer });
    const text = raw.value || '';
    if (!text.trim()) {
      console.log(`⚠️ Archivo DOCX sin texto: ${fileName}`);
      return;
    }
    const result = await knowledgeService.processMarkdown(title, text);
    console.log(`✅ DOCX Ingerido: ${result?.chunksProcessed || 'OK'} chunks creados.`);
  } else if (ext === '.md' || ext === '.txt') {
    const text = buffer.toString('utf-8');
    const result = await knowledgeService.processMarkdown(title, text);
    console.log(`✅ Texto/MD Ingerido: ${result?.chunksProcessed || 'OK'} chunks creados.`);
  }
}

async function main() {
  const files = fs.readdirSync(FOLDER_PATH);
  console.log(`Encontrados ${files.length} archivos en ${FOLDER_PATH}`);

  for (const file of files) {
    try {
      await ingestFile(file);
    } catch (err: any) {
      console.error(`❌ Error ingiriendo ${file}: ${err.message}`);
    }
  }
  console.log(`\n✨ ¡Re-ingesta de faltantes finalizada!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
