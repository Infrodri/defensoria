import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RAGService } from '../knowledge/rag.service';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class AdminKnowledgeService {
  private readonly logger = new Logger(AdminKnowledgeService.name);

  constructor(
    private prisma: PrismaService,
    private ragService: RAGService,
  ) {}

  async uploadDocument(
    name: string,
    sourceUrl: string | null,
    content: string | null,
    fileBuffer: Buffer | null,
    fileName: string,
  ) {
    let extractedText = content ?? '';

    if (fileBuffer && (fileName.endsWith('.pdf') || fileName.endsWith('.txt'))) {
      try {
        if (fileName.endsWith('.pdf')) {
          const pdfData = await pdfParse(fileBuffer);
          extractedText = pdfData.text ?? '';
        } else {
          extractedText = fileBuffer.toString('utf-8');
        }
      } catch (error: any) {
        this.logger.warn(`Error parsing document ${fileName}: ${error.message}`);
        throw new BadRequestException(`Error al procesar el archivo: ${error.message}`);
      }
    }

    if (!extractedText.trim() && !sourceUrl) {
      throw new BadRequestException('Se requiere contenido o URL de origen');
    }

    const document = await this.prisma.legalDocument.create({
      data: {
        title: name,
        sourceUrl,
        isActive: true,
        version: '1.0',
      },
    });

    if (extractedText.trim().length > 0) {
      await this.indexDocumentContent(document.id, extractedText, fileName);
    }

    return {
      id: document.id,
      title: document.title,
      sourceUrl: document.sourceUrl,
      isActive: document.isActive,
      createdAt: document.createdAt,
    };
  }

  async listDocuments() {
    return this.prisma.legalDocument.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        sourceUrl: true,
        isActive: true,
        version: true,
        createdAt: true,
        _count: { select: { chunks: true } },
      },
    });
  }

  async deleteDocument(id: string) {
    const existing = await this.prisma.legalDocument.findUnique({ where: { id } });
    if (!existing) {
      throw new BadRequestException('Documento no encontrado');
    }

    await this.prisma.legalDocument.delete({ where: { id } });
    return { success: true, message: 'Documento eliminado' };
  }

  private async indexDocumentContent(documentId: string, content: string, fileName: string) {
    const chunks = this.splitIntoChunks(content, 2000, 200);

    for (let i = 0; i < chunks.length; i++) {
      await this.prisma.legalChunk.create({
        data: {
          legalDocumentId: documentId,
          content: chunks[i],
          metadata: {
            fileName,
            chunkIndex: i,
            totalChunks: chunks.length,
            source: 'admin_upload',
          },
        },
      });
    }

    this.logger.log(`Indexed ${chunks.length} chunks for document ${documentId}`);
  }

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
}