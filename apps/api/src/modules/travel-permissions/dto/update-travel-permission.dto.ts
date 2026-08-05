import { IsBoolean, IsDateString, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TravelType, TravelCompanionType } from '@prisma/client';

export class UpdateTravelPermissionDto {
  @ApiPropertyOptional({ enum: TravelType })
  @IsOptional()
  @IsEnum(TravelType, { message: 'travelType no válido' })
  travelType?: TravelType;

  @ApiPropertyOptional({ enum: TravelCompanionType })
  @IsOptional()
  @IsEnum(TravelCompanionType, { message: 'companionType no válido' })
  companionType?: TravelCompanionType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  originCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  destinationCity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'departureDate debe ser una fecha válida' })
  departureDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'returnDate debe ser una fecha válida' })
  returnDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companionFullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companionIdentityNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  companionRelation?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  bothParentsPresent?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  oppositionNotes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isIssued?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString({}, { message: 'issuedAt debe ser una fecha válida' })
  issuedAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID('4', { message: 'issuedById debe ser un UUID válido' })
  issuedById?: string;
}
