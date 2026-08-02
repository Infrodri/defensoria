import { IsString, IsOptional, IsBoolean, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportTypeDto {
  @ApiProperty({ description: 'Código único del tipo de informe (ej. INFORME_PSICOSOCIAL)' })
  @IsString()
  code: string;

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
