import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
  'audio/mpeg', // mp3
  'video/mp4', // mp4
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

@Injectable()
export class EvidencesService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
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
      throw new BadRequestException(`Formato de archivo no permitido. Formatos soportados: PDF, JPG, PNG, DOCX, MP3, MP4`);
    }

    const existingCase = await this.prisma.case.findUnique({ where: { id: caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
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
    return this.prisma.evidence.create({
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
