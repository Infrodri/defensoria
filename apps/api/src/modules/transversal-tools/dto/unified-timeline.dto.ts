import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnifiedTimelineDto {
  @IsUUID()
  @ApiProperty()
  caseId: string;
}
