import { IsBoolean, IsDateString, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConciliationAgreementDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber({}, { message: 'agreedAmountBs debe ser un número' })
  @Min(0, { message: 'agreedAmountBs no puede ser negativo' })
  agreedAmountBs?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  agreementContent?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSignedByParties?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'submittedToCourtAt debe ser una fecha válida' })
  submittedToCourtAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'courtApprovedAt debe ser una fecha válida' })
  courtApprovedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  homologationCode?: string;
}
