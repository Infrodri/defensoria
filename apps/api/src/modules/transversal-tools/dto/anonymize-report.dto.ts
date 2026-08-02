import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnonymizeReportDto {
  @ApiProperty({ description: 'ID of the case' })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ description: 'ID of the report to anonymize' })
  @IsUUID()
  @IsNotEmpty()
  reporteId: string;
}
