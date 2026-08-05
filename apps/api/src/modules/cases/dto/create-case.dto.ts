import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, Matches } from 'class-validator';
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
  @IsUUID('4', { message: 'ID del NNA debe ser UUID válido' })
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

  // ===== BANDERAS DE SITUACIÓN ESPECIAL DE LA DENUNCIA =====
  @ApiProperty({
    description: 'El NNA se autodenunció (denuncia propia, sin representante)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  menorAutodenuncia?: boolean;

  @ApiProperty({
    description: 'La denuncia es anónima (no se identifica al denunciante)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  denunciaAnonima?: boolean;

  @ApiProperty({
    description: 'El caso involucra a un funcionario público (p.ej. agresor o denunciado es funcionario)',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  involucraFuncionario?: boolean;

  // ===== DENUNCIANTE =====
  @ApiProperty({
    description: '¿La denuncia es presentada por un tercero? (no por el NNA mismo)',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isThirdPartyComplainant?: boolean;

  @ApiProperty({
    description: 'ID del denunciante si está registrado en el sistema',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID del denunciante debe ser UUID válido' })
  complainantId?: string;

  @ApiProperty({
    description: 'Nombre completo del denunciante (si es tercero no registrado)',
    example: 'María Rodríguez García',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  complainantFullName?: string;

  @ApiProperty({
    description: 'Número de documento del denunciante (CI, pasaporte, etc)',
    example: '1234567-LP',
    required: false,
  })
  @IsOptional()
  @IsString()
  complainantDocumentId?: string;

  @ApiProperty({
    description: 'Relación del denunciante con el NNA',
    enum: ['MADRE', 'PADRE', 'TUTOR', 'DOCENTE', 'VECINO', 'VECINA', 'DIRECTOR', 'DIRECTORA', 'TRABAJADOR_SOCIAL', 'MÉDICO', 'OTRO'],
    example: 'MADRE',
    required: false,
  })
  @IsOptional()
  @IsString()
  complainantRelation?: string;

  @ApiProperty({
    description: 'Teléfono de contacto del denunciante',
    example: '+59123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\d\s\+\-\(\)]+$/, { message: 'Teléfono no válido' })
  complainantPhone?: string;

  @ApiProperty({
    description: 'Dirección del denunciante',
    example: 'Calle Bolívar #245, Barrio San Roque',
    required: false,
  })
  @IsOptional()
  @IsString()
  complainantAddress?: string;

  // ===== DENUNCIADO =====
  @ApiProperty({
    description: 'ID de la persona denunciada (si está registrada)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'ID del denunciado debe ser UUID válido' })
  accusedId?: string;

  // ===== DATOS DEMOGRÁFICOS NNA =====
  @ApiProperty({
    description: 'Fecha de nacimiento del NNA (YYYY-MM-DD)',
    example: '2014-03-14',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Fecha debe estar en formato YYYY-MM-DD' })
  nnaBirthDate?: string;

  @ApiProperty({
    description: 'Género del NNA',
    enum: ['MASCULINO', 'FEMENINO', 'OTRO'],
    example: 'FEMENINO',
    required: false,
  })
  @IsOptional()
  @IsString()
  nnaGender?: string;

  @ApiProperty({
    description: 'Ciudad de residencia del NNA',
    example: 'Sucre',
    required: false,
  })
  @IsOptional()
  @IsString()
  nnaCity?: string;

  @ApiProperty({
    description: 'Teléfono de contacto del NNA',
    example: '71234501',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\d\s\+\-\(\)]+$/, { message: 'Teléfono no válido' })
  nnaPhone?: string;

  @ApiProperty({
    description: 'Dirección de residencia del NNA',
    example: 'Calle Bolívar #245, Barrio San Roque',
    required: false,
  })
  @IsOptional()
  @IsString()
  nnaAddress?: string;
}
