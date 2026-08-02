import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MapEnvironmentalDto {
  @ApiProperty({ description: 'ID del caso' })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ description: 'ID de la transcripción' })
  @IsUUID()
  @IsNotEmpty()
  transcriptionId: string;
}
