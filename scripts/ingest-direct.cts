#!/usr/bin/env ts-node
/**
 * Ingesta masiva directa vía NestJS KnowledgeService (sin API, sin auth)
 * Ejecutar desde apps/api: npx ts-node ../scripts/ingest-direct.cts
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../apps/api/src/app.module';
import { KnowledgeService } from '../apps/api/src/modules/knowledge/knowledge.service';
import * as fs from 'fs';
import * as path from 'path';

const MD_PROCESSED_DIR = path.resolve(__dirname, '../docs/marco-legal/md-processed');

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const knowledgeService = app.get(KnowledgeService);

  console.log('🚀 Ingesta directa vía KnowledgeService...\n');

  const files = fs.readdirSync(MD_PROCESSED_DIR)
    .filter(f => f.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    console.log('⚠️  No hay archivos .md en', MD_PROCESSED_DIR);
    await app.close();
    return;
  }

  console.log(`📚 Encontrados ${files.length} archivos para ingerir\n`);

  let successCount = 0;
  let failCount = 0;

  for (const fileName of files) {
    const filePath = path.join(MD_PROCESSED_DIR, fileName);
    const title = path.basename(fileName, '.md');

    console.log(`📥 Ingeriendo: ${title}...`);

    try {
      const markdown = fs.readFileSync(filePath, 'utf-8');
      if (markdown.trim().length < 100) {
        console.log(`   ⚠️  Contenido muy corto, saltando`);
        failCount++;
        continue;
      }

      const result = await knowledgeService.processMarkdown(title, markdown);
      console.log(`   ✅ Documento: ${result.documentId} | Chunks: ${result.chunksProcessed}`);
      successCount++;
    } catch (error: any) {
      console.log(`   ❌ Error: ${error.message}`);
      failCount++;
    }

    // Pausa para no saturar Ollama
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n📊 Resumen: ${successCount} exitosos, ${failCount} fallidos`);
  await app.close();
}

bootstrap().catch(console.error);