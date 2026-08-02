import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDisciplineDto {
  @ApiProperty({ description: 'Código único de la disciplina (ej. LEGAL)' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Nombre legible de la disciplina (ej. Área Legal)' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Descripción opcional de las funciones' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Si la disciplina está activa en el sistema', default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
