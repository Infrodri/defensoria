import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProtectionMeasureType } from '@prisma/client';

export class UpdateProtectionMeasureDto {
  @ApiPropertyOptional({ enum: ProtectionMeasureType })
  @IsOptional()
  @IsEnum(ProtectionMeasureType, { message: 'measureType no válido' })
  measureType?: ProtectionMeasureType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  receptiveCenterName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'executedAt debe ser una fecha válida' })
  executedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'judgeNotifiedAt debe ser una fecha válida' })
  judgeNotifiedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  judgeNotificationCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isWithinLegalDeadline?: boolean;
}
