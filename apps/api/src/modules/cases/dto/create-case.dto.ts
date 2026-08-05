import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { CaseType } from '@defensoria/shared';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCaseDto {
  @ApiProperty({
    description: 'Tipo de caso/trámite',
    enum: CaseType,
  })
  @IsEnum(CaseType, { message: 'Tipo de caso no válido' })
  @IsNotEmpty()
  caseType: CaseType;

  @ApiProperty({
    description: 'ID del NNA titular (víctima/sujeto de derechos)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID(undefined, { message: 'ID debe ser UUID válido' })
  @IsNotEmpty()
  nnaId: string;

  @ApiProperty({
    description: 'Narrativa inicial de los hechos denunciados',
    example: 'Se reporta que el NNA ha sido vulnerado en sus derechos...',
    minLength: 20,
  })
  @IsString()
  @MinLength(20, { message: 'La narrativa debe tener al menos 20 caracteres' })
  @IsNotEmpty()
  intakeNarrative: string;

  @ApiProperty({
    description: 'ID del denunciante si está registrado en el sistema',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'ID del denunciante debe ser UUID válido' })
  complainantId?: string;

  @ApiProperty({
    description: 'ID de la persona denunciada (si está registrada)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'ID del denunciado debe ser UUID válido' })
  accusedId?: string;
}
