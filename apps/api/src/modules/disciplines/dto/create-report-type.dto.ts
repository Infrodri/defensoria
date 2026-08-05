import { IsString, IsOptional, IsBoolean, IsObject, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportCategory } from '@prisma/client';

export class CreateReportTypeDto {
  @ApiProperty({ description: 'Código único del tipo de informe (ej. INFORME_PSICOSOCIAL)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Categoría del informe (ReportCategory)', enum: [
    'INFORME_JURIDICO',
    'INFORME_PSICOLOGICO',
    'INFORME_SOCIAL',
    'INFORME_PSICOSOCIAL',
    'INFORME_SESION_SEGUIMIENTO',
    'INFORME_FINAL_CONCILIACION',
    'INFORME_COMPLEMENTARIO',
  ] })
  @IsEnum([
    'INFORME_JURIDICO',
    'INFORME_PSICOLOGICO',
    'INFORME_SOCIAL',
    'INFORME_PSICOSOCIAL',
    'INFORME_SESION_SEGUIMIENTO',
    'INFORME_FINAL_CONCILIACION',
    'INFORME_COMPLEMENTARIO',
  ])
  category: ReportCategory;

  @ApiProperty({ description: 'Nombre legible (ej. Informe Psicosocial Integral)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción de cuándo usar este informe' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Estructura JSON de la plantilla base' })
  @IsOptional()
  @IsObject()
  template?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Si está activo', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
