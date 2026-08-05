import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { StreetPhase } from '@prisma/client';

export class UpdateSpecSituacionCalleDto {
  @ApiPropertyOptional({ enum: StreetPhase })
  @IsOptional()
  @IsEnum(StreetPhase, { message: 'faseActual no válida' })
  faseActual?: StreetPhase;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  programaReferente?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  educadorCalleRef?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'yearsOnStreet debe ser un número' })
  @Min(0, { message: 'yearsOnStreet no puede ser negativo' })
  yearsOnStreet?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  survivalStrategy?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  substanceAbuse?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  streetHistory?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idFormReferencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  idFormContraref?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notificadoITD?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'fechaNotificacion debe ser una fecha válida' })
  fechaNotificacion?: string;
}
