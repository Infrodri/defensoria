import { IsUUID, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum EventType {
  MEDIDAS_PROTECCION = 'MEDIDAS_PROTECCION',
  AUDIENCIA = 'AUDIENCIA',
  DENUNCIA = 'DENUNCIA',
}

export class CalculateDeadlineDto {
  @IsUUID()
  @ApiProperty()
  caseId: string;

  @IsString()
  @ApiProperty({ example: '2026-08-15' })
  eventDate: string;

  @IsEnum(EventType)
  @ApiProperty({ enum: EventType })
  eventType: EventType;
}
