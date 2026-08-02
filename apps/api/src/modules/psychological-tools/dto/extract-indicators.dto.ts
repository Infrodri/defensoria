import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractIndicatorsDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  transcriptionId: string;
}
