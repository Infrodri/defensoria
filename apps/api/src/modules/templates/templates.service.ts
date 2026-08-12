import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import * as mammoth from 'mammoth';

@Injectable()
export class TemplatesService {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  create(dto: any) {
    return this.prisma.documentTemplate.create({
      data: dto,
    });
  }

  findAll(role?: string) {
    return this.prisma.documentTemplate.findMany({
      where: {
        isActive: true,
        ...(role ? { targetRole: role as any } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: any) {
    const template = await this.prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    return this.prisma.documentTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    const template = await this.prisma.documentTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundException('Plantilla no encontrada');
    return this.prisma.documentTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async uploadTemplateFile(templateId: string, file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No se adjuntó ningún archivo');

    const template = await this.prisma.documentTemplate.findUnique({ where: { id: templateId } });
    if (!template) throw new NotFoundException('Plantilla no encontrada');

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

    const storagePath = `templates/${templateId}/${file.originalname}`;
    await this.minio.uploadFile(storagePath, file.buffer, file.size, file.mimetype);

    // If DOCX, try to convert to markdown
    let markdownContent: string | null = null;
    if (file.mimetype.includes('wordprocessingml') || file.mimetype === 'application/msword') {
      try {
        const result = await mammoth.convertToHtml({ buffer: file.buffer });
        // Simple HTML to markdown conversion (basic)
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

    return this.prisma.documentTemplate.update({
      where: { id: templateId },
      data: {
        templateFilePath: storagePath,
        ...(markdownContent ? { content: markdownContent } : {}),
      },
    });
  }

  async uploadTemplate(id: string, file: Express.Multer.File) {
    return this.uploadTemplateFile(id, file);
  }
}
