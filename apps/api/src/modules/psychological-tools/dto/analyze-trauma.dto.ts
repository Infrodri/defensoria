import { IsUUID, IsArray, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeTraumaDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  indicadores: string[];
}
