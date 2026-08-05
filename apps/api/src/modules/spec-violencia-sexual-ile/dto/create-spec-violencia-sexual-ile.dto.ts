import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecViolenciaSexualILEDto {
  @ApiPropertyOptional({ description: 'Copia de la denuncia adjunta al expediente' })
  @IsOptional()
  @IsBoolean()
  copiaDenunciaAdjunta?: boolean;

  @ApiPropertyOptional({ description: 'Consentimiento informado del NNA' })
  @IsOptional()
  @IsBoolean()
  consentimientoNNA?: boolean;

  @ApiPropertyOptional({ description: 'El NNA fue atendido dentro de las 24h del hecho' })
  @IsOptional()
  @IsBoolean()
  atendidoDentro24h?: boolean;

  @ApiPropertyOptional({ description: 'Apersonamiento de la Defensoría del NNA' })
  @IsOptional()
  @IsBoolean()
  apersonamientoDNA?: boolean;

  @ApiProperty({ description: 'Delito calificado por el fiscal/abogado', example: 'VIOLACION_NNA' })
  @IsString()
  @IsNotEmpty({ message: 'delitoCalificado es obligatorio' })
  delitoCalificado: string;

  @ApiPropertyOptional({ description: 'Se solicitó la Cámara Gesell' })
  @IsOptional()
  @IsBoolean()
  solicitoCamaraGesell?: boolean;

  @ApiPropertyOptional({ description: 'Certificado médico único forense obtenido' })
  @IsOptional()
  @IsBoolean()
  certificadoMedicoUnico?: boolean;

  @ApiPropertyOptional({ description: 'Se solicitó reserva del expediente' })
  @IsOptional()
  @IsBoolean()
  solicitoReserva?: boolean;
}
