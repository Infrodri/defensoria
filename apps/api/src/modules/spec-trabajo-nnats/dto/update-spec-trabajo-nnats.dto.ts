import { IsArray, IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSpecTrabajoNNATSDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasEscolaridadCert?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasAptitudMedicaSUS?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  inspeccionRealizada?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'fechaInspeccion debe ser una fecha válida' })
  fechaInspeccion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'inspectorId debe ser un UUID válido' })
  inspectorId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  risksIdentified?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isProhibitedWork?: boolean;

  @ApiPropertyOptional({ description: 'Horas semanales de trabajo del NNA' })
  @IsOptional()
  @IsInt({ message: 'hoursPerWeek debe ser un número entero' })
  @Min(0, { message: 'hoursPerWeek no puede ser negativo' })
  @Max(40, { message: 'Máximo 40 horas semanales permitidas por normativa' })
  hoursPerWeek?: number;

  @ApiPropertyOptional({ description: 'Salario mensual en bolivianos' })
  @IsOptional()
  @IsNumber({}, { message: 'salaryBs debe ser un número' })
  @Min(0, { message: 'salaryBs no puede ser negativo' })
  salaryBs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  studyHoursGrant?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasSocialSecurity?: boolean;
}
