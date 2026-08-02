import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { GenerateFamilyMapDto } from './dto/generate-family-map.dto';
import { CalculateVulnerabilityDto } from './dto/calculate-vulnerability.dto';
import { MapEnvironmentalDto } from './dto/map-environmental.dto';

@Injectable()
export class SocialToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async generateFamilyMap(dto: GenerateFamilyMapDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'SOCIAL',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    return {
      miembros: [
        { nombre: 'Juan', edad: 40, relacion: 'Padre' },
        { nombre: 'Maria', edad: 35, relacion: 'Madre' }
      ],
      dinamicas: ['Conflicto parental', 'Comunicación deficiente']
    };
  }

  async calculateVulnerability(dto: CalculateVulnerabilityDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'SOCIAL',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    let baseIndex = 50;
    if (dto.ingresos < 1000) baseIndex += 20;
    if (dto.vivienda === 'Precaria') baseIndex += 15;
    baseIndex += dto.cargasFamiliares * 5;

    return {
      indiceVulnerabilidad: Math.min(baseIndex, 100),
      programasAplicables: ['Bono Familia', 'Subsidio Vivienda']
    };
  }

  async mapEnvironmental(dto: MapEnvironmentalDto, userId: string) {
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'SOCIAL',
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    return {
      factoresRiesgo: {
        hacinamiento: true,
        consumo: false,
        desercionEscolar: true
      },
      recomendaciones: ['Visita domiciliaria', 'Intervención escolar']
    };
  }
}
