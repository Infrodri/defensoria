import { IsUUID, IsEnum, IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CaseType, RoleInCase, IntakeChannel, IncidentFrequency } from '@defensoria/shared';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCasePartyDto {
  @ApiPropertyOptional({
    description: 'ID of existing person (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'personId must be a valid UUID v4' })
  personId?: string;

  @ApiPropertyOptional({
    description: 'First name of the participant',
    example: 'Juan',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Last name of the participant',
    example: 'Pérez',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Document number (CI/Passport)',
    example: '1234567',
  })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({
    description: 'Role of the person in the case',
    enum: RoleInCase,
    example: RoleInCase.NNA,
  })
  @IsEnum(RoleInCase, { message: 'Invalid role in case' })
  @IsNotEmpty()
  roleInCase: RoleInCase;

  @ApiPropertyOptional({
    description: 'Indicates if this is the primary participant for the role',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({
    description: 'Relationship or kinship with NNA (e.g., Padrastro)',
    example: 'Padrastro',
  })
  @IsOptional()
  @IsString()
  relationship?: string;

  @ApiPropertyOptional({
    description: 'Occupation of the person',
    example: 'Comerciante',
  })
  @IsOptional()
  @IsString()
  occupation?: string;

  // SINNA fields for NNA role
  @ApiPropertyOptional({
    description: 'School grade (specific to NNA role)',
    example: '5to Primaria',
  })
  @IsOptional()
  @IsString()
  schoolGrade?: string;

  @ApiPropertyOptional({
    description: 'School name / Educational institution (specific to NNA role)',
    example: 'Unidad Educativa Bolivia',
  })
  @IsOptional()
  @IsString()
  schoolName?: string;

  @ApiPropertyOptional({
    description: 'Living arrangement description (specific to NNA role)',
    example: 'Lives with mother and stepfather',
  })
  @IsOptional()
  @IsString()
  livesWithDescription?: string;
}

export class CreateCaseDto {
  @ApiProperty({
    description: 'Type of case/procedure',
    enum: CaseType,
  })
  @IsEnum(CaseType, { message: 'Invalid case type' })
  @IsNotEmpty()
  caseType: CaseType;

  @ApiProperty({
    description: 'List of case participants',
    type: [CreateCasePartyDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCasePartyDto)
  parties: CreateCasePartyDto[];

  @ApiPropertyOptional({
    description: 'Initial narrative description of reported facts',
    example: 'It is reported that the child rights have been violated...',
    minLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(20, { message: 'Narrative must be at least 20 characters long' })
  intakeNarrative?: string;

  // ===== SPECIAL COMPLAINT STATUS FLAGS =====
  @ApiPropertyOptional({
    description: 'Minor reported themselves (self-complaint)',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  menorAutodenuncia?: boolean;

  @ApiPropertyOptional({
    description: 'Anonymous complaint',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  denunciaAnonima?: boolean;

  @ApiPropertyOptional({
    description: 'Case involves a public official',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  involucraFuncionario?: boolean;

  // ===== NORMATIVE AUDIT FIELDS =====
  @ApiPropertyOptional({
    description: 'District of origin (1-9, Law 548)',
    example: '1',
  })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({
    description: 'Indicates aggressor is unknown',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  aggressorUnknown?: boolean;

  // ===== SINNA NORMATIVE FIELDS =====
  @ApiPropertyOptional({
    description: 'Intake channel for SINNA normative reporting',
    enum: IntakeChannel,
  })
  @IsOptional()
  @IsEnum(IntakeChannel, { message: 'Invalid intake channel' })
  intakeChannel?: IntakeChannel;

  @ApiPropertyOptional({
    description: 'Indicates imminent risk / urgent case',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isUrgent?: boolean;

  @ApiPropertyOptional({
    description: 'Indicates visible injuries on the NNA',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  hasVisibleInjuries?: boolean;

  @ApiPropertyOptional({
    description: 'Incident frequency for SINNA normative reporting',
    enum: IncidentFrequency,
  })
  @IsOptional()
  @IsEnum(IncidentFrequency, { message: 'Invalid incident frequency' })
  incidentFrequency?: IncidentFrequency;
}

