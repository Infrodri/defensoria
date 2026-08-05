import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSpecTrabajoNNATSDto {
  @ApiPropertyOptional({ description: 'Cuenta con certificado de escolaridad' })
  @IsOptional()
  @IsBoolean()
  hasEscolaridadCert?: boolean;

  @ApiPropertyOptional({ description: 'Cuenta con aptitud médica del SUS' })
  @IsOptional()
  @IsBoolean()
  hasAptitudMedicaSUS?: boolean;

  @ApiPropertyOptional({ description: 'Se realizó la inspección laboral' })
  @IsOptional()
  @IsBoolean()
  inspeccionRealizada?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de la inspección', example: '2026-08-01' })
  @IsOptional()
  @IsDateString({}, { message: 'fechaInspeccion debe ser una fecha válida' })
  fechaInspeccion?: string;

  @ApiPropertyOptional({ description: 'ID del inspector que realizó la inspección' })
  @IsOptional()
  @IsUUID('4', { message: 'inspectorId debe ser un UUID válido' })
  inspectorId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Riesgos identificados en el puesto laboral' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risksIdentified?: string[];

  @ApiPropertyOptional({ description: 'El trabajo está prohibido por normativa' })
  @IsOptional()
  @IsBoolean()
  isProhibitedWork?: boolean;

  @ApiProperty({
    description: 'Horas semanales de trabajo del NNA',
    example: 20,
  })
  @IsInt({ message: 'hoursPerWeek debe ser un número entero' })
  @Min(0, { message: 'hoursPerWeek no puede ser negativo' })
  @Max(40, { message: 'Máximo 40 horas semanales permitidas por normativa' })
  hoursPerWeek: number;

  @ApiProperty({ description: 'Salario mensual en bolivianos', example: 500 })
  @IsNumber({}, { message: 'salaryBs debe ser un número' })
  @Min(0, { message: 'salaryBs no puede ser negativo' })
  salaryBs: number;

  @ApiPropertyOptional({ description: 'Se le otorgan horas de estudio' })
  @IsOptional()
  @IsBoolean()
  studyHoursGrant?: boolean;

  @ApiPropertyOptional({ description: 'Cuenta con seguridad social' })
  @IsOptional()
  @IsBoolean()
  hasSocialSecurity?: boolean;
}
