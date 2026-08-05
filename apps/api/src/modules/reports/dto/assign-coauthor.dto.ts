import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignCoAuthorDto {
  @ApiProperty({
    description: 'ID del usuario coautor (disciplina complementaria: PSICOLOGO o SOCIAL)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'coAuthorId debe ser un UUID válido' })
  coAuthorId: string;
}
