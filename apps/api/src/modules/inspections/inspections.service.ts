import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

export interface CreateEstablishmentDto {
  name: string;
  category: string;
  address?: string;
  ownerName?: string;
  phone?: string;
}

export interface CreateInspectionDto {
  establishmentId: string;
  caseId?: string;
  scheduledAt: string;
  isSurpriseInspection?: boolean;
  generalNotes?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  inspectorIds?: string[];
}

export interface CreateInspectionFindingDto {
  findingCategory: string;
  severity: 'BAJA' | 'MEDIA' | 'ALTA';
  description: string;
  recommendations?: string;
  nnaCount?: number;
  photosEvidenceIds?: string[];
}

@Injectable()
export class InspectionsService {
  constructor(private prisma: PrismaService) {}

  async createEstablishment(dto: CreateEstablishmentDto) {
    return this.prisma.establishment.create({
      data: dto,
    });
  }

  async listEstablishments() {
    return this.prisma.establishment.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async createInspection(
    dto: CreateInspectionDto,
    inspectorId: string,
    officeId: string,
    userId: string,
  ) {
    const inspection = await this.prisma.inspection.create({
      data: {
        establishmentId: dto.establishmentId,
        caseId: dto.caseId,
        officeId,
        scheduledAt: new Date(dto.scheduledAt),
        status: 'PENDIENTE',
        isSurpriseInspection: dto.isSurpriseInspection ?? false,
        generalNotes: dto.generalNotes,
        createdBy: userId,
        // Link inspector team members via join table
        inspectorTeam: {
          create: (dto.inspectorIds?.length ? dto.inspectorIds : [inspectorId]).map((id) => ({
            inspectorId: id,
          })),
        },
      },
      include: {
        establishment: true,
        inspectorTeam: true,
      },
    });

    // Si hay ubicación, agregarla
    if (dto.location) {
      await this.prisma.inspectionLocation.create({
        data: {
          inspectionId: inspection.id,
          latitude: dto.location.latitude,
          longitude: dto.location.longitude,
          address: dto.location.address,
        },
      });
    }

    return inspection;
  }

  async listInspections(caseId?: string) {
    return this.prisma.inspection.findMany({
      where: caseId ? { caseId } : undefined,
      include: {
        establishment: true,
        inspectorTeam: true,
        location: true,
        findings: true,
        evidenceFiles: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  /**
   * Agregar ubicación GPS a inspección
   */
  async addLocation(
    inspectionId: string,
    data: { latitude: number; longitude: number; address: string; googleMapsUrl?: string },
  ) {
    // Validar inspección existe
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException('Operativo de inspección no encontrado');
    }

    // Eliminar ubicación anterior si existe
    await this.prisma.inspectionLocation.deleteMany({
      where: { inspectionId },
    });

    // Crear nueva ubicación
    return this.prisma.inspectionLocation.create({
      data: {
        inspectionId,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        googleMapsUrl: data.googleMapsUrl,
      },
    });
  }

  /**
   * Registrar archivo de evidencia (foto, video, documento)
   */
  async uploadEvidenceFile(
    inspectionId: string,
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    description: string,
    evidenceType: 'FOTO' | 'VIDEO' | 'DOCUMENTO',
    userId: string,
  ) {
    // Validar inspección
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException('Operativo de inspección no encontrado');
    }

    // Calcular hash SHA-256
    const fileHash = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');

    // Crear ruta de almacenamiento en MinIO
    const storagePath = `inspections/${inspectionId}/${fileHash}-${file.originalname}`;

    // TODO: Guardar en MinIO
    // await this.minioService.putObject('defensoria-bucket', storagePath, file.buffer)

    // Registrar en base de datos
    return this.prisma.inspectionEvidenceFile.create({
      data: {
        inspectionId,
        fileName: file.originalname,
        mimeType: file.mimetype,
        fileSize: file.size,
        storagePath,
        fileHash,
        description,
        evidenceType,
        uploadedBy: userId,
      },
    });
  }

  /**
   * Obtener archivos de evidencia de inspección
   */
  async getEvidenceFiles(inspectionId: string) {
    return this.prisma.inspectionEvidenceFile.findMany({
      where: { inspectionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Registrar hallazgo estructurado
   */
  async addFinding(inspectionId: string, dto: CreateInspectionFindingDto) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException('Operativo de inspección no encontrado');
    }

    return this.prisma.inspectionFinding.create({
      data: {
        inspectionId,
        findingCategory: dto.findingCategory as any,
        severity: dto.severity,
        description: dto.description,
        recommendations: dto.recommendations,
        nnaCount: dto.nnaCount,
        photosEvidenceIds: dto.photosEvidenceIds || [],
      },
    });
  }

  /**
   * Obtener hallazgos de una inspección
   */
  async getFindings(inspectionId: string) {
    return this.prisma.inspectionFinding.findMany({
      where: { inspectionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Completar inspección
   */
  async completeInspection(inspectionId: string) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
    });

    if (!inspection) {
      throw new NotFoundException('Operativo de inspección no encontrado');
    }

    return this.prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        status: 'COMPLETADA',
        completedAt: new Date(),
      },
      include: {
        establishment: true,
        location: true,
        findings: true,
        evidenceFiles: true,
      },
    });
  }

  /**
   * Obtener inspección con todos sus datos
   */
  async getInspection(inspectionId: string) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: {
        establishment: true,
        inspectorTeam: true,
        location: true,
        findings: true,
        evidenceFiles: true,
      },
    });

    if (!inspection) {
      throw new NotFoundException('Operativo de inspección no encontrado');
    }

    return inspection;
  }
}
