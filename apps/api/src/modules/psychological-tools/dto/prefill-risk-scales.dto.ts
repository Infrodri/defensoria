import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PrefillRiskScalesDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  transcriptionId: string;
}
