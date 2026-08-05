import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpecViolenciaSexualILEDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  copiaDenunciaAdjunta?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  consentimientoNNA?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  atendidoDentro24h?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  apersonamientoDNA?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  delitoCalificado?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  solicitoCamaraGesell?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  certificadoMedicoUnico?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  solicitoReserva?: boolean;
}
