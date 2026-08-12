import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import * as mammoth from 'mammoth';

@Injectable()
export class InstrumentsService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  create(dto: any) {
    const { ...rest } = dto;
    return this.prisma.instrument.create({
      data: {
        ...rest,
        structuredContent: rest.structuredContent || {},
      },
    });
  }

  async update(id: string, dto: any) {
    const instrument = await this.prisma.instrument.findUnique({ where: { id } });
    if (!instrument) throw new NotFoundException('Instrumento no encontrado');
    return this.prisma.instrument.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const instrument = await this.prisma.instrument.findUnique({ where: { id } });
    if (!instrument) throw new NotFoundException('Instrumento no encontrado');
    return this.prisma.instrument.update({
      where: { id },
      data: { isActive: false },
    });
  }


  findAll() {
    return this.prisma.instrument.findMany({
      where: { isActive: true },
      include: {
        discipline: true,
        documentTemplate: true,
      },
      orderBy: { instrumentType: 'asc' },
    });
  }

  findByDiscipline(disciplineCode: string) {
    return this.prisma.instrument.findMany({
      where: {
        discipline: { code: disciplineCode },
        isActive: true,
      },
      include: {
        discipline: true,
        documentTemplate: true,
      },
      orderBy: { instrumentType: 'asc' },
    });
  }

  async uploadExampleFile(instrumentId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se adjuntó ningún archivo');

    const instrument = await this.prisma.instrument.findUnique({
      where: { id: instrumentId },
    });
    if (!instrument) throw new NotFoundException('Instrumento no encontrado');

    const allowedMimes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/markdown',
      'text/plain',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException('Solo se permiten archivos PDF, DOCX o Markdown');
    }

    const storagePath = `instruments/${instrumentId}/${file.originalname}`;
    await this.minio.uploadFile(storagePath, file.buffer, file.size, file.mimetype);

    // If DOCX, try to convert to markdown
    let markdownContent: string | null = null;
    if (file.mimetype.includes('wordprocessingml') || file.mimetype === 'application/msword') {
      try {
        const result = await mammoth.convertToHtml({ buffer: file.buffer });
        markdownContent = result.value
          .replace(/<h1[^>]*>/g, '# ')
          .replace(/<h2[^>]*>/g, '## ')
          .replace(/<h3[^>]*>/g, '### ')
          .replace(/<\/h[1-3]>/g, '\n')
          .replace(/<p[^>]*>/g, '')
          .replace(/<\/p>/g, '\n\n')
          .replace(/<br\s*\/?>/g, '\n')
          .replace(/<strong>/g, '**')
          .replace(/<\/strong>/g, '**')
          .replace(/<em>/g, '*')
          .replace(/<\/em>/g, '*')
          .replace(/<li>/g, '- ')
          .replace(/<\/li>/g, '\n')
          .replace(/<[^>]+>/g, '')
          .trim();
      } catch {
        // Conversion failed, just store the file path
      }
    } else if (file.mimetype === 'text/markdown' || file.mimetype === 'text/plain') {
      markdownContent = file.buffer.toString('utf-8');
    }

    const updatedStructuredContent = {
      ...(typeof instrument.structuredContent === 'object' && instrument.structuredContent ? instrument.structuredContent : {}),
      templateFilePath: storagePath,
    };

    return this.prisma.instrument.update({
      where: { id: instrumentId },
      data: {
        templateFilePath: storagePath,
        structuredContent: updatedStructuredContent,
        ...(markdownContent ? { content: markdownContent } : {}),
      },
    });
  }

  async uploadInstrumentTemplate(id: string, file: Express.Multer.File) {
    return this.uploadExampleFile(id, file);
  }
}
