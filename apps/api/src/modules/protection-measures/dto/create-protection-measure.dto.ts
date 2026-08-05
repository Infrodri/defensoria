import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProtectionMeasureType } from '@prisma/client';

export class CreateProtectionMeasureDto {
  @ApiProperty({ enum: ProtectionMeasureType, description: 'Tipo de medida de protección' })
  @IsEnum(ProtectionMeasureType, { message: 'measureType no válido' })
  measureType: ProtectionMeasureType;

  @ApiProperty({ description: 'Motivo de la medida de protección' })
  @IsString()
  @IsNotEmpty({ message: 'reason es obligatorio' })
  reason: string;

  @ApiPropertyOptional({ description: 'Centro de acogida receptor' })
  @IsOptional()
  @IsString()
  receptiveCenterName?: string;

  @ApiPropertyOptional({ description: 'Fecha de ejecución de la medida', example: '2026-08-01T10:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'executedAt debe ser una fecha válida' })
  executedAt?: string;

  @ApiPropertyOptional({ description: 'Fecha de notificación al juzgado', example: '2026-08-01T22:00:00Z' })
  @IsOptional()
  @IsDateString({}, { message: 'judgeNotifiedAt debe ser una fecha válida' })
  judgeNotifiedAt?: string;

  @ApiPropertyOptional({ description: 'Código de la notificación judicial' })
  @IsOptional()
  @IsString()
  judgeNotificationCode?: string;

  @ApiPropertyOptional({ description: 'Dentro del plazo legal (se calcula para ACOGIMIENTO_CIRCUNSTANCIAL)' })
  @IsOptional()
  @IsBoolean()
  isWithinLegalDeadline?: boolean;
}
