import { IsUUID, IsEnum, IsString, IsNotEmpty, MinLength } from 'class-validator';
import { Role } from '@defensoria/shared';
import { ApiProperty } from '@nestjs/swagger';

export class AssignTeamDto {
  @ApiProperty({
    description: 'ID UUID del profesional a asignar',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4', { message: 'El ID del profesional debe ser un UUID válido' })
  @IsNotEmpty({ message: 'Debe seleccionar un profesional' })
  userId: string;

  @ApiProperty({
    description: 'Rol profesional a asignar al caso',
    enum: [Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL],
    example: Role.ABOGADO,
  })
  @IsEnum(Role, { message: 'El rol seleccionado no es válido' })
  @IsNotEmpty({ message: 'Debe seleccionar un rol' })
  role: Role;

  @ApiProperty({
    description: 'Motivo de la asignación profesional',
    example: 'Asignación inicial del equipo interdisciplinario',
    minLength: 10,
  })
  @IsString()
  @MinLength(10, { message: 'El motivo debe tener al menos 10 caracteres' })
  @IsNotEmpty({ message: 'Debe proporcionar un motivo para la asignación' })
  reason: string;
}
