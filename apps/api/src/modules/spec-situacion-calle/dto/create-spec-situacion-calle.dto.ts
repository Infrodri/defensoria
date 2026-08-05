import { IsArray, IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StreetPhase } from '@prisma/client';

export class CreateSpecSituacionCalleDto {
  @ApiPropertyOptional({ enum: StreetPhase, description: 'Fase actual del proceso de calle' })
  @IsOptional()
  @IsEnum(StreetPhase, { message: 'faseActual no válida' })
  faseActual?: StreetPhase;

  @ApiPropertyOptional({ description: 'Programa referente que acompaña al NNA' })
  @IsOptional()
  @IsString()
  programaReferente?: string;

  @ApiPropertyOptional({ description: 'Educador/a de calle de referencia' })
  @IsOptional()
  @IsString()
  educadorCalleRef?: string;

  @ApiPropertyOptional({ description: 'Años en situación de calle' })
  @IsOptional()
  @IsNumber({}, { message: 'yearsOnStreet debe ser un número' })
  @Min(0, { message: 'yearsOnStreet no puede ser negativo' })
  yearsOnStreet?: number;

  @ApiPropertyOptional({ description: 'Estrategias de supervivencia utilizadas' })
  @IsOptional()
  @IsString()
  survivalStrategy?: string;

  @ApiPropertyOptional({ type: [String], description: 'Sustancias con consumo' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  substanceAbuse?: string[];

  @ApiProperty({ description: 'Historia de vida en situación de calle' })
  @IsString()
  @IsNotEmpty({ message: 'streetHistory es obligatorio' })
  streetHistory: string;

  @ApiPropertyOptional({ description: 'ID del formulario de referencia' })
  @IsOptional()
  @IsString()
  idFormReferencia?: string;

  @ApiPropertyOptional({ description: 'ID del formulario de contrarreferencia' })
  @IsOptional()
  @IsString()
  idFormContraref?: string;

  @ApiPropertyOptional({ description: 'Notificado al ITD (Instituto Técnico Departamental)' })
  @IsOptional()
  @IsBoolean()
  notificadoITD?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de notificación al ITD', example: '2026-08-01' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaNotificacion debe ser una fecha válida' })
  fechaNotificacion?: string;
}
