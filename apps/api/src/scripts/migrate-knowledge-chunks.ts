#!/usr/bin/env ts-node
/**
 * Script de Migración: Re-ingesta de Documentos Legales con Chunking Mejorado
 * 
 * Este script permite re-procesar documentos existentes en la base de conocimiento
 * aplicando el nuevo algoritmo de chunking por artículo legal.
 * 
 * Uso:
 *   npm run migrate:knowledge
 *   npm run migrate:knowledge -- --document-id=abc123  (solo un documento)
 *   npm run migrate:knowledge -- --dry-run              (simular sin cambios)
 */

import { PrismaClient } from '@prisma/client';
import { KnowledgeService } from '../modules/knowledge/knowledge.service';
import { EmbeddingsService } from '../modules/knowledge/embeddings.service';

const prisma = new PrismaClient();
const embeddingsService = new EmbeddingsService();
const knowledgeService = new KnowledgeService(prisma, embeddingsService);

interface MigrationOptions {
  documentId?: string;
  dryRun?: boolean;
  verbose?: boolean;
}

async function parseArgs(): Promise<MigrationOptions> {
  const args = process.argv.slice(2);
  const options: MigrationOptions = {
    dryRun: false,
    verbose: false
  };

  for (const arg of args) {
    if (arg.startsWith('--document-id=')) {
      options.documentId = arg.split('=')[1];
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }

  return options;
}

async function migrateDocument(
  documentId: string,
  dryRun: boolean,
  verbose: boolean
): Promise<{ success: boolean; message: string; oldChunks: number; newChunks?: number }> {
  console.log(`\n🔄 Procesando documento: ${documentId}`);

  // 1. Obtener documento actual
  const document = await prisma.legalDocument.findUnique({
    where: { id: documentId },
    include: { chunks: true }
  });

  if (!document) {
    return { success: false, message: 'Documento no encontrado', oldChunks: 0 };
  }

  console.log(`📄 Documento: "${document.title}"`);
  console.log(`📦 Chunks actuales: ${document.chunks.length}`);

  if (document.chunks.length === 0) {
    return { success: false, message: 'Documento sin chunks', oldChunks: 0 };
  }

  // 2. Reconstruir texto original de los chunks
  const originalText = document.chunks
    .sort((a, b) => {
      const idxA = (a.metadata as any)?.chunkIndex || 0;
      const idxB = (b.metadata as any)?.chunkIndex || 0;
      return idxA - idxB;
    })
    .map(chunk => chunk.content)
    .join('\n\n');

  if (verbose) {
    console.log(`📝 Texto reconstruido: ${originalText.length} caracteres`);
  }

  // 3. Detectar si es documento legal
  const legalArticlesDetected = detectLegalArticles(originalText);

  if (legalArticlesDetected.length === 0) {
    console.log(`⚠️  No se detectaron artículos legales en el documento`);
    return {
      success: false,
      message: 'No es un documento legal con artículos detectables',
      oldChunks: document.chunks.length
    };
  }

  console.log(`✅ Detectados ${legalArticlesDetected.length} artículos legales`);

  if (verbose) {
    legalArticlesDetected.forEach((art, idx) => {
      console.log(`   Artículo ${art.number}: ${art.title}`);
    });
  }

  // 4. Comparar con estructura actual
  const improvement = legalArticlesDetected.length < document.chunks.length;
  const reductionPercent = Math.round(
    ((document.chunks.length - legalArticlesDetected.length) / document.chunks.length) * 100
  );

  console.log(`📊 Análisis de mejora:`);
  console.log(`   Chunks actuales: ${document.chunks.length}`);
  console.log(`   Chunks nuevos: ${legalArticlesDetected.length}`);
  if (improvement) {
    console.log(`   ✅ Reducción de ${reductionPercent}% en cantidad de chunks`);
    console.log(`   ✅ Mejor calidad: UN ARTÍCULO = UN CHUNK`);
  } else if (legalArticlesDetected.length === document.chunks.length) {
    console.log(`   ℹ️  Mismo número de chunks, pero con mejor metadata`);
  } else {
    console.log(`   ⚠️  Aumento en cantidad de chunks (revisar manualmente)`);
  }

  if (dryRun) {
    console.log(`🔍 [DRY RUN] No se realizaron cambios`);
    return {
      success: true,
      message: 'Simulación completada',
      oldChunks: document.chunks.length,
      newChunks: legalArticlesDetected.length
    };
  }

  // 5. Confirmar migración
  console.log(`\n⚡ ¿Proceder con la migración? (y/n)`);
  
  // En entorno automatizado, usar variable de entorno
  const autoConfirm = process.env.AUTO_CONFIRM === 'true';
  
  if (!autoConfirm) {
    // Requiere confirmación manual
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise<string>((resolve) => {
      readline.question('', (ans: string) => {
        readline.close();
        resolve(ans.toLowerCase());
      });
    });

    if (answer !== 'y' && answer !== 'yes') {
      console.log(`❌ Migración cancelada por el usuario`);
      return {
        success: false,
        message: 'Cancelado por el usuario',
        oldChunks: document.chunks.length
      };
    }
  }

  // 6. Realizar migración
  console.log(`🚀 Iniciando migración...`);

  try {
    // Desactivar documento temporalmente
    await prisma.legalDocument.update({
      where: { id: documentId },
      data: { isActive: false }
    });

    // Eliminar chunks antiguos
    await prisma.$executeRaw`
      DELETE FROM legal_chunks WHERE "legalDocumentId" = ${documentId}::uuid
    `;

    console.log(`   🗑️  Chunks antiguos eliminados`);

    // Crear nuevos chunks con artículos completos
    let processed = 0;
    for (const article of legalArticlesDetected) {
      const vector = await embeddingsService.getEmbedding(article.content);
      const vectorStr = `[${vector.join(',')}]`;

      await prisma.$executeRaw`
        INSERT INTO legal_chunks (id, "legalDocumentId", content, metadata, embedding)
        VALUES (
          gen_random_uuid(),
          ${documentId}::uuid,
          ${article.content},
          ${JSON.stringify({
            source: document.title,
            chunkIndex: processed,
            type: 'legal_article',
            article: article.number,
            title: article.title
          })}::jsonb,
          ${vectorStr}::vector
        )
      `;
      processed++;
      
      if (verbose) {
        console.log(`   ✅ Artículo ${article.number} procesado`);
      }
    }

    // Reactivar documento
    await prisma.legalDocument.update({
      where: { id: documentId },
      data: { isActive: true }
    });

    console.log(`\n✅ Migración completada exitosamente`);
    console.log(`   📦 Nuevos chunks: ${processed}`);

    return {
      success: true,
      message: 'Migración exitosa',
      oldChunks: document.chunks.length,
      newChunks: processed
    };

  } catch (error: any) {
    console.error(`❌ Error durante la migración: ${error.message}`);
    
    // Intentar reactivar documento en caso de error
    await prisma.legalDocument.update({
      where: { id: documentId },
      data: { isActive: true }
    }).catch(() => {});

    return {
      success: false,
      message: `Error: ${error.message}`,
      oldChunks: document.chunks.length
    };
  }
}

function detectLegalArticles(text: string): Array<{
  number: string;
  title: string;
  content: string;
}> {
  const articles = [];
  const patterns = [
    /Artículo\s+(\d+[°º]?)\.[-—]\s*\(([^)]+)\)/gi,
    /ARTÍCULO\s+(\d+[°º]?)\.[-—]\s*\(([^)]+)\)/gi,
    /Art\.\s+(\d+[°º]?)\.[-—]\s*\(([^)]+)\)/gi,
  ];

  const matches: Array<{ index: number; number: string; title: string; fullMatch: string }> = [];
  
  for (const pattern of patterns) {
    let match;
    const regex = new RegExp(pattern);
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(text)) !== null) {
      matches.push({
        index: match.index,
        number: match[1],
        title: match[2].trim(),
        fullMatch: match[0]
      });
    }
  }

  matches.sort((a, b) => a.index - b.index);

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const next = matches[i + 1];

    const startIndex = current.index;
    const endIndex = next ? next.index : text.length;

    const content = text.substring(startIndex, endIndex).trim();

    if (content.length > 50) {
      articles.push({
        number: current.number,
        title: current.title,
        content: content
      });
    }
  }

  return articles;
}

async function main() {
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║  Script de Migración: Chunking por Artículo Legal            ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

  const options = await parseArgs();

  console.log(`⚙️  Opciones:`);
  console.log(`   Dry Run: ${options.dryRun ? '✅ SÍ (simulación)' : '❌ NO (aplicará cambios)'}`);
  console.log(`   Verbose: ${options.verbose ? '✅' : '❌'}`);
  if (options.documentId) {
    console.log(`   Documento específico: ${options.documentId}`);
  } else {
    console.log(`   Alcance: TODOS los documentos`);
  }

  // Obtener documentos a migrar
  const documentsToMigrate = options.documentId
    ? await prisma.legalDocument.findMany({
        where: { id: options.documentId },
        include: { _count: { select: { chunks: true } } }
      })
    : await prisma.legalDocument.findMany({
        where: { isActive: true },
        include: { _count: { select: { chunks: true } } }
      });

  console.log(`\n📚 Documentos a procesar: ${documentsToMigrate.length}\n`);

  if (documentsToMigrate.length === 0) {
    console.log(`❌ No se encontraron documentos para migrar`);
    process.exit(0);
  }

  const results = {
    total: documentsToMigrate.length,
    success: 0,
    failed: 0,
    skipped: 0,
    totalOldChunks: 0,
    totalNewChunks: 0
  };

  for (const doc of documentsToMigrate) {
    const result = await migrateDocument(doc.id, options.dryRun || false, options.verbose || false);
    
    if (result.success) {
      results.success++;
      results.totalOldChunks += result.oldChunks;
      results.totalNewChunks += result.newChunks || 0;
    } else if (result.message.includes('No es un documento legal')) {
      results.skipped++;
    } else {
      results.failed++;
    }

    // Pequeña pausa entre documentos
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Resumen final
  console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
  console.log(`║  Resumen de Migración                                         ║`);
  console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
  console.log(`📊 Estadísticas:`);
  console.log(`   Total documentos: ${results.total}`);
  console.log(`   ✅ Exitosos: ${results.success}`);
  console.log(`   ⚠️  Omitidos (no legales): ${results.skipped}`);
  console.log(`   ❌ Fallidos: ${results.failed}`);
  console.log(`\n📦 Chunks:`);
  console.log(`   Antes: ${results.totalOldChunks}`);
  console.log(`   Después: ${results.totalNewChunks}`);
  const reduction = results.totalOldChunks > 0
    ? Math.round(((results.totalOldChunks - results.totalNewChunks) / results.totalOldChunks) * 100)
    : 0;
  console.log(`   Reducción: ${reduction}%`);

  await prisma.$disconnect();
  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(`❌ Error fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});
