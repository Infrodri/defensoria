import { IsUUID, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GenerateFamilyMapDto {
  @ApiProperty({ description: 'ID del caso' })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiPropertyOptional({ description: 'ID de la transcripción' })
  @IsOptional()
  @IsUUID()
  transcriptionId?: string;
}
