import { IsUUID, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class TranslateClinicalDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  notesText: string;
}
