import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TravelType, TravelCompanionType } from '@prisma/client';

export class CreateTravelPermissionDto {
  @ApiPropertyOptional({
    description: 'Caso asociado (opcional: el permiso puede tramitarse sin expediente)',
  })
  @IsOptional()
  @IsUUID('4', { message: 'caseId debe ser un UUID válido' })
  caseId?: string;

  @ApiProperty({ enum: TravelType, description: 'Tipo de viaje' })
  @IsEnum(TravelType, { message: 'travelType no válido' })
  travelType: TravelType;

  @ApiProperty({ enum: TravelCompanionType, description: 'Con quién viaja el NNA' })
  @IsEnum(TravelCompanionType, { message: 'companionType no válido' })
  companionType: TravelCompanionType;

  @ApiPropertyOptional({ description: 'Ciudad de origen', default: 'Sucre' })
  @IsOptional()
  @IsString()
  originCity?: string;

  @ApiProperty({ description: 'Ciudad de destino' })
  @IsString()
  @IsNotEmpty({ message: 'destinationCity es obligatorio' })
  destinationCity: string;

  @ApiProperty({ description: 'Fecha de salida (debe ser futura)', example: '2026-08-15' })
  @IsDateString({}, { message: 'departureDate debe ser una fecha válida' })
  departureDate: string;

  @ApiPropertyOptional({ description: 'Fecha de retorno', example: '2026-08-20' })
  @IsOptional()
  @IsDateString({}, { message: 'returnDate debe ser una fecha válida' })
  returnDate?: string;

  @ApiPropertyOptional({ description: 'Nombre completo del acompañante' })
  @IsOptional()
  @IsString()
  companionFullName?: string;

  @ApiPropertyOptional({ description: 'Número de documento del acompañante' })
  @IsOptional()
  @IsString()
  companionIdentityNumber?: string;

  @ApiPropertyOptional({ description: 'Relación del acompañante con el NNA' })
  @IsOptional()
  @IsString()
  companionRelation?: string;

  @ApiPropertyOptional({ description: 'Ambos progenitores están presentes' })
  @IsOptional()
  @IsBoolean()
  bothParentsPresent?: boolean;

  @ApiPropertyOptional({ description: 'Notas de oposición al permiso' })
  @IsOptional()
  @IsString()
  oppositionNotes?: string;

  @ApiPropertyOptional({ description: 'Código de autorización (se genera si no se provee: TV-YYYY-NNNN)' })
  @IsOptional()
  @IsString()
  authorizationCode?: string;

  @ApiPropertyOptional({ description: 'El permiso ya fue emitido' })
  @IsOptional()
  @IsBoolean()
  isIssued?: boolean;

  @ApiPropertyOptional({ description: 'Fecha de emisión', example: '2026-08-14' })
  @IsOptional()
  @IsDateString({}, { message: 'issuedAt debe ser una fecha válida' })
  issuedAt?: string;

  @ApiPropertyOptional({ description: 'ID del usuario que emitió el permiso' })
  @IsOptional()
  @IsUUID('4', { message: 'issuedById debe ser un UUID válido' })
  issuedById?: string;
}
