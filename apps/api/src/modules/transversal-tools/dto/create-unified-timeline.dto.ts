import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnifiedTimelineDto {
  @ApiProperty({ description: 'ID of the case to unify timeline' })
  @IsUUID()
  @IsNotEmpty()
  caseId: string;
}
