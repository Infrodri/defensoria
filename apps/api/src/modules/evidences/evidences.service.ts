import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { EvidenceRagService } from './evidence-rag.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'audio/mpeg', // mp3
  'audio/wav', // wav
  'audio/ogg', // ogg
  'audio/webm', // webm
  'audio/x-m4a', // m4a (iOS)
  'audio/mp4', // m4a (Android)
  'audio/aac', // aac
  'video/mp4', // mp4
  'video/quicktime', // mov (iOS)
  'video/x-msvideo', // avi
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Injectable()
export class EvidencesService {
  private readonly logger = new Logger(EvidencesService.name);

  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
    private evidenceRag: EvidenceRagService,
  ) {}

  async uploadEvidence(
    caseId: string,
    file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    uploadedByUserId: string,
    isSensitive = false,
    description?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo válido');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('El archivo excede el límite permitido de 50MB');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Formato de archivo no permitido. Formatos soportados: PDF, JPG, PNG, DOCX, MP3, WAV, OGG, WEBM, M4A, AAC, MP4, MOV, AVI`);
    }

    const existingCase = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    if ((existingCase as any).isDisabled) {
      throw new BadRequestException(
        'No se pueden agregar evidencias a un expediente inhabilitado.',
      );
    }

    // 1. Calculate SHA-256 checksum for chain-of-custody integrity
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');

    // 2. Generate unique MinIO storage path
    const timestamp = Date.now();
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `cases/${caseId}/${timestamp}_${cleanFileName}`;

    // 3. Upload to MinIO object storage
    await this.minioService.uploadFile(
      storagePath,
      file.buffer,
      file.size,
      file.mimetype,
    );

    // 4. Save metadata in Evidence table
    const evidence = await this.prisma.evidence.create({
      data: {
        caseId,
        uploadedBy: uploadedByUserId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath,
        fileHash,
        isSensitive,
        description: description || null,
      },
    });

    // 5. Disparar pipeline RAG de forma asíncrona (fire-and-forget)
    //    No bloqueamos la respuesta — el procesamiento ocurre en segundo plano
    this.evidenceRag
      .processEvidenceAsync(caseId, evidence.id, file, description)
      .catch((err) =>
        this.logger.warn(`[RAG] Pipeline background falló para ${evidence.id}: ${err.message}`)
      );

    return evidence;
  }

  async findByCase(caseId: string) {
    return this.prisma.evidence.findMany({
      where: { caseId },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getDownloadStream(evidenceId: string) {
    const evidence = await this.prisma.evidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) {
      throw new NotFoundException('Evidencia no encontrada');
    }

    const stream = await this.minioService.getFileStream(evidence.storagePath);
    return {
      evidence,
      stream,
    };
  }
}
