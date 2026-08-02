import { IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeDiscrepanciesDto {
  @IsOptional()
  @IsUUID()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', required: false })
  transcriptionId?: string;

  @IsUUID()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  caseId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiProperty({ example: ['uuid1', 'uuid2'], required: false })
  comparableDocuments?: string[];
}
