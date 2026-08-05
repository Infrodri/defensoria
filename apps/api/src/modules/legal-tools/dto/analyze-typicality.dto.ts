import { IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeTypicalityDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  transcriptionId?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ required: false })
  caseId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'VIOLENCIA_INTRAFAMILIAR', required: false })
  caseTypeCode?: string;
}
