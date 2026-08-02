import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeTypicalityDto {
  @IsUUID()
  @ApiProperty()
  transcriptionId: string;

  @IsString()
  @ApiProperty({ example: 'VIOLENCIA_INTRAFAMILIAR' })
  caseTypeCode: string;
}
