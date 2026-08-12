import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@defensoria/db';
import { calculateAge } from '@defensoria/shared';
import { PrismaService } from '../prisma/prisma.service';
import { EmbeddingsService } from '../knowledge/embeddings.service';

// ──────────────────────────────────────────────────────────────────────────────
// EvidenceRagService
// Servicios RAG para consulta de contexto, indexación manual y estado del pipeline.
// Nota: El parsing e indexación de evidencias de archivos es procesado por EvidenceWorker.
// ──────────────────────────────────────────────────────────────────────────────

@Injectable()
export class EvidenceRagService {
  private readonly logger = new Logger(EvidenceRagService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingsService,
  ) {}

  /**
   * Método público para indexar un chunk desde otros servicios (ej. TranscriptionService).
   */
  async indexChunkPublic(
    caseId: string,
    evidenceId: string | null,
    sourceType: string,
    content: string,
    metadata: Record<string, any> = {},
  ) {
    return this.indexChunk(caseId, evidenceId, sourceType, content, metadata);
  }

  /**
   * Estado del pipeline RAG — estadísticas de chunks indexados por expediente.
   * Usado por el panel de monitoreo del administrador.
   */
  async getPipelineStatus(caseId?: string) {
    const caseWhereClause = caseId ? Prisma.sql`WHERE "caseId" = ${caseId}::uuid` : Prisma.empty;
    const caseAndClause = caseId ? Prisma.sql`AND "caseId" = ${caseId}::uuid` : Prisma.empty;

    // Total de chunks indexados
    const totalChunks = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count FROM case_chunks
      ${caseWhereClause}
    `;

    // Chunks con embedding vs sin embedding
    const withEmbedding = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint as count FROM case_chunks
      WHERE embedding IS NOT NULL
      ${caseAndClause}
    `;

    // Chunks por tipo de fuente
    const bySourceType = await this.prisma.$queryRaw<{ sourceType: string; count: bigint }[]>`
      SELECT "sourceType", COUNT(*)::bigint as count
      FROM case_chunks
      ${caseWhereClause}
      GROUP BY "sourceType"
      ORDER BY count DESC
    `;

    // Últimos 10 chunks procesados
    const recentChunks = await this.prisma.$queryRaw<{
      id: string; caseId: string; sourceType: string;
      createdAt: Date; hasEmbedding: boolean;
    }[]>`
      SELECT id, "caseId", "sourceType", "createdAt",
             (embedding IS NOT NULL) as "hasEmbedding"
      FROM case_chunks
      ${caseWhereClause}
      ORDER BY "createdAt" DESC
      LIMIT 10
    `;

    // Expedientes con chunks
    const casesWithChunks = caseId ? 1 : (await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(DISTINCT "caseId")::bigint as count FROM case_chunks
    `)[0]?.count ?? 0n;

    const sourceLabels: Record<string, string> = {
      audio_transcript:  '🎙️ Transcripciones de audio',
      image_description: '🖼️ Descripciones de imagen',
      pdf_text:          '📄 Texto extraído de PDF',
      document_text:     '📎 Documentos adjuntos',
      report:            '📋 Informes profesionales',
      action_log:        '📝 Actuaciones registradas',
    };

    return {
      summary: {
        totalChunks: Number((totalChunks[0] as any)?.count ?? 0n),
        withEmbedding: Number((withEmbedding[0] as any)?.count ?? 0n),
        withoutEmbedding: Number((totalChunks[0] as any)?.count ?? 0n) - Number((withEmbedding[0] as any)?.count ?? 0n),
        casesWithChunks: Number(casesWithChunks),
      },
      bySourceType: bySourceType.map(r => ({
        sourceType: r.sourceType,
        label: sourceLabels[r.sourceType] || r.sourceType,
        count: Number(r.count),
      })),
      recentActivity: recentChunks.map(r => ({
        id: r.id,
        caseId: r.caseId,
        sourceType: r.sourceType,
        label: sourceLabels[r.sourceType] ?? r.sourceType,
        hasEmbedding: r.hasEmbedding,
        processedAt: r.createdAt,
      })),
    };
  }

  // ── Método central de indexación ──────────────────────────────────────────

  /**
   * Genera el embedding y guarda el chunk en case_chunks.
   * Si Ollama no está disponible, guarda el texto sin embedding para que
   * al menos quede disponible para búsqueda por texto plano.
   */
  private async indexChunk(
    caseId: string,
    evidenceId: string | null,
    sourceType: string,
    content: string,
    metadata: Record<string, any> = {},
  ) {
    if (!content || content.trim().length < 10) return;

    let vectorStr: string | null = null;

    try {
      const vector = await this.embeddings.getEmbedding(content.slice(0, 4000));
      vectorStr = `[${vector.join(',')}]`;
    } catch (embedErr: any) {
      this.logger.warn(`[RAG] Embedding no disponible: ${embedErr.message}. Guardando sin vector.`);
    }

    try {
      const evidenceUuidParam = evidenceId ? Prisma.sql`${evidenceId}::uuid` : Prisma.sql`NULL`;
      if (vectorStr) {
        await this.prisma.$executeRaw`
          INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, embedding, "createdAt")
          VALUES (
            gen_random_uuid(),
            ${caseId}::uuid,
            ${evidenceUuidParam},
            ${sourceType},
            ${content},
            ${JSON.stringify(metadata)}::jsonb,
            ${vectorStr}::vector,
            NOW()
          )
        `;
      } else {
        await this.prisma.$executeRaw`
          INSERT INTO case_chunks (id, "caseId", "evidenceId", "sourceType", content, metadata, "createdAt")
          VALUES (
            gen_random_uuid(),
            ${caseId}::uuid,
            ${evidenceUuidParam},
            ${sourceType},
            ${content},
            ${JSON.stringify(metadata)}::jsonb,
            NOW()
          )
        `;
      }

      this.logger.log(`[RAG] Chunk indexado para caso ${caseId} (tipo: ${sourceType}, ${content.length} chars)`);
    } catch (dbErr: any) {
      this.logger.error(`[RAG] Error guardando chunk en BD: ${dbErr.message}`);
    }
  }

  // ── Mapa de Actores (Tagging Semántico RAG) ───────────────────────────────

  /**
   * Construye el bloque XML <mapa_actores> para un expediente a partir de Case.parties (Person).
   * Evita alucinaciones del LLM local sobre los roles de víctima y presunto agresor.
   */
  async getCaseActorMap(caseId: string): Promise<string> {
    try {
      const caseRecord = await this.prisma.case.findUnique({
        where: { id: caseId },
        include: {
          parties: {
            include: {
              person: true,
              nnaContext: true,
            },
          },
        },
      });

      if (!caseRecord || !caseRecord.parties || caseRecord.parties.length === 0) {
        return '<mapa_actores>\n</mapa_actores>';
      }

      const roleTagMap: Record<string, string> = {
        NNA: 'victima',
        DENUNCIADO: 'denunciado_presunto_agresor',
        DENUNCIANTE: 'denunciante',
        TUTOR: 'tutor',
        TESTIGO: 'testigo',
      };

      const lines: string[] = ['<mapa_actores>'];

      for (const party of caseRecord.parties) {
        const person = party.person;
        if (!person) continue;

        const tagName = roleTagMap[party.roleInCase] || party.roleInCase.toLowerCase();
        const fullName = `${person.firstName || ''} ${person.lastName || ''}`.trim();

        lines.push(`  <${tagName}>`);
        lines.push(`    <nombre>${fullName}</nombre>`);

        if (person.birthDate) {
          const age = calculateAge(new Date(person.birthDate));
          if (age !== null && age !== undefined && !isNaN(age) && age >= 0) {
            lines.push(`    <edad>${age}</edad>`);
          }
        }

        if (party.roleInCase === 'NNA') {
          if (party.nnaContext) {
            const schoolGrade = party.nnaContext.schoolGrade;
            const schoolName = party.nnaContext.schoolName;
            const schooling = [schoolGrade, schoolName].filter(Boolean).join(' - ');
            if (schooling) {
              lines.push(`    <escolaridad>${schooling}</escolaridad>`);
            }
            if (party.nnaContext.livesWithDescription) {
              lines.push(`    <vive_con>${party.nnaContext.livesWithDescription}</vive_con>`);
            }
          }
        }

        if (party.roleInCase === 'DENUNCIADO' || party.roleInCase === 'DENUNCIANTE') {
          if (party.relationship) {
            lines.push(`    <vinculo_con_victima>${party.relationship}</vinculo_con_victima>`);
          }
          if (party.occupation) {
            lines.push(`    <ocupacion>${party.occupation}</ocupacion>`);
          }
        }

        lines.push(`  </${tagName}>`);
      }

      lines.push('</mapa_actores>');

      return lines.join('\n');
    } catch (error: any) {
      this.logger.warn(`[RAG] Error al generar mapa_actores para caso ${caseId}: ${error.message}`);
      return '<mapa_actores>\n</mapa_actores>';
    }
  }

  /**
   * Construye el bloque XML <evidencias_cargadas> con la lista directa de evidencias del expediente
   * y sus transcripciones o textos OCR extraídos.
   */
  async getCaseEvidencesSummary(caseId: string): Promise<string> {
    try {
      const evidences = await this.prisma.evidence.findMany({
        where: { caseId },
        orderBy: { createdAt: 'desc' },
        include: {
          transcriptions: true,
        },
      });

      if (evidences.length === 0) {
        return '<evidencias_cargadas>\n  Sin evidencias adjuntas en el expediente.\n</evidencias_cargadas>';
      }

      const lines: string[] = ['<evidencias_cargadas>'];

      for (const ev of evidences) {
        lines.push(`  <evidencia id="${ev.id}" archivo="${ev.fileName}" tipo="${ev.mimeType}">`);
        if (ev.description) {
          lines.push(`    <descripcion>${ev.description}</descripcion>`);
        }
        if (ev.transcriptions && ev.transcriptions.length > 0) {
          for (const tr of ev.transcriptions) {
            if (tr.text && tr.text.trim()) {
              lines.push(`    <texto_extraido status="${tr.status}">`);
              lines.push(`      ${tr.text.trim()}`);
              lines.push(`    </texto_extraido>`);
            }
          }
        }
        lines.push(`  </evidencia>`);
      }

      lines.push('</evidencias_cargadas>');
      return lines.join('\n');
    } catch (error: any) {
      this.logger.warn(`[RAG] Error generando evidencias_cargadas: ${error.message}`);
      return '<evidencias_cargadas></evidencias_cargadas>';
    }
  }

  // ── Búsqueda semántica en RAG del caso ────────────────────────────────────

  /**
   * Buscar chunks relevantes del expediente para contexto de análisis.
   * Usado por las herramientas y el AI assistant cuando se le pasa un caseId.
   * Incluye automáticamente el mapa de actores (<mapa_actores>) y evidencias (<evidencias_cargadas>) al inicio.
   */
  async searchCaseContext(caseId: string, query: string, limit = 8): Promise<string> {
    try {
      const actorMap = await this.getCaseActorMap(caseId);
      const evidencesSummary = await this.getCaseEvidencesSummary(caseId);

      const caseRecord = await this.prisma.case.findUnique({
        where: { id: caseId },
        select: { intakeNarrative: true },
      });
      const narrative = caseRecord?.intakeNarrative || 'No hay relato disponible';
      const relatoBlock = `<relato_hechos>\n  ${narrative}\n</relato_hechos>`;
      const contextHeader = `${actorMap}\n\n${relatoBlock}\n\n${evidencesSummary}`;

      let chunksText = '';
      try {
        const queryEmbedding = await this.embeddings.getEmbedding(query);
        const embeddingStr = `[${queryEmbedding.join(',')}]`;

        const results = await this.prisma.$queryRaw<Array<{ content: string; sourceType: string; metadata: any }>>`
          SELECT content, "sourceType", metadata
          FROM case_chunks
          WHERE "caseId" = ${caseId}::uuid
            AND embedding IS NOT NULL
          ORDER BY embedding <=> ${embeddingStr}::vector
          LIMIT ${limit}
        `;

        if (results.length > 0) {
          chunksText = results
            .map((r) => {
              const label = {
                audio_transcript:  '🎙️ Transcripción de audio',
                image_description: '🖼️ Descripción de imagen',
                pdf_text:          '📄 Texto de documento PDF',
                document_text:     '📎 Documento adjunto',
                report:            '📋 Informe profesional',
                action_log:        '📝 Actuación registrada',
              }[r.sourceType] || '📌 Material del caso';

              return `${label}:\n${r.content}`;
            })
            .join('\n\n---\n\n');
        }
      } catch (embedErr: any) {
        this.logger.warn(`[RAG] Búsqueda de chunks fallida: ${embedErr.message}`);
      }

      if (chunksText) {
        return `${contextHeader}\n\n${chunksText}`;
      }
      return contextHeader;
    } catch (err: any) {
      this.logger.warn(`[RAG] Búsqueda fallida: ${err.message}`);
      return '';
    }
  }

  /**
   * Indexar el contenido de un informe profesional al emitirlo.
   */
  async indexReport(caseId: string, reportId: string, content: string, category: string) {
    await this.indexChunk(caseId, null, 'report', content, {
      reportId,
      category,
      source: 'professional_report',
    });
  }

  /**
   * Indexar una actuación de la bitácora.
   */
  async indexActionLog(caseId: string, logId: string, title: string, content: string) {
    await this.indexChunk(caseId, null, 'action_log', `${title}\n${content}`, {
      logId,
      source: 'action_log',
    });
  }

  // ── Utilidades ─────────────────────────────────────────────────────────────

  private splitIntoChunks(text: string, maxSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + maxSize, text.length);
      chunks.push(text.slice(start, end));
      start = end - overlap;
      if (start >= text.length) break;
    }

    return chunks.filter((c) => c.trim().length > 20);
  }

  /**
   * Obtiene el digest (resumen) actual del caso.
   * Busca el chunk especial con sourceType 'digest' que se actualiza por evento.
   */
  async getCaseDigest(caseId: string): Promise<string> {
    const chunk = await this.prisma.caseChunk.findFirst({
      where: {
        caseId,
        sourceType: 'digest',
      },
      orderBy: { createdAt: 'desc' },
    });
    return chunk?.content || '';
  }

  /**
   * Regenera el digest (resumen) del caso y lo guarda.
   */
  async refreshCaseDigest(caseId: string): Promise<void> {
    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        parties: true,
      },
    });

    if (!caseData) return;

    const victima = caseData.parties.find(p => (p as any).roleInCase === 'VICTIMA');
    const denunciado = caseData.parties.find(p => (p as any).roleInCase === 'DENUNCIADO');

    const digest = `Estado del caso: ${caseData.currentPhase}
Riesgo: ${caseData.riskLevel || 'NO DEFINIDO'}
Víctima: ${victima ? 'Víctima Registrada' : 'Desconocida'}
Presunto Agresor/Denunciado: ${denunciado ? (denunciado as any).relationship || 'Sin parentesco especificado' : 'Desconocido'}

Narrativa inicial:
${caseData.intakeNarrative}`;

    await this.prisma.caseChunk.deleteMany({
      where: { caseId, sourceType: 'digest' },
    });

    await this.prisma.caseChunk.create({
      data: {
        caseId,
        sourceType: 'digest',
        content: digest,
        metadata: { isDigest: true },
        // No embedding generated for digest chunk
      },
    });
  }
}
