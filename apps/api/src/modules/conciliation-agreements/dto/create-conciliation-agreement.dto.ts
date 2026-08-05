import { IsBoolean, IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConciliationAgreementDto {
  @ApiProperty({ description: 'Materia/objeto del acuerdo' })
  @IsString()
  @IsNotEmpty({ message: 'topic es obligatorio' })
  topic: string;

  @ApiPropertyOptional({ description: 'Monto acordado en bolivianos' })
  @IsOptional()
  @IsNumber({}, { message: 'agreedAmountBs debe ser un número' })
  @Min(0, { message: 'agreedAmountBs no puede ser negativo' })
  agreedAmountBs?: number;

  @ApiProperty({ description: 'Contenido del acuerdo' })
  @IsString()
  @IsNotEmpty({ message: 'agreementContent es obligatorio' })
  agreementContent: string;

  @ApiPropertyOptional({ description: 'El acuerdo fue firmado por las partes' })
  @IsOptional()
  @IsBoolean()
  isSignedByParties?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de presentación ante el juzgado', example: '2026-08-10' })
  @IsOptional()
  @IsDateString({}, { message: 'submittedToCourtAt debe ser una fecha válida' })
  submittedToCourtAt?: string;

  @ApiPropertyOptional({ description: 'Fecha de homologación judicial', example: '2026-08-20' })
  @IsOptional()
  @IsDateString({}, { message: 'courtApprovedAt debe ser una fecha válida' })
  courtApprovedAt?: string;

  @ApiPropertyOptional({ description: 'Código de homologación judicial' })
  @IsOptional()
  @IsString()
  homologationCode?: string;
}
