import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DigitalPlatform } from '@prisma/client';

export class CreateSpecViolenceDigitalDto {
  @ApiPropertyOptional({ type: [String], description: 'URLs donde se difundió la violencia digital' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urls?: string[];

  @ApiPropertyOptional({ enum: DigitalPlatform, isArray: true, description: 'Plataformas digitales involucradas' })
  @IsOptional()
  @IsArray()
  @IsEnum(DigitalPlatform, { each: true, message: 'Plataforma digital no válida' })
  platforms?: DigitalPlatform[];

  @ApiPropertyOptional({ type: [String], description: 'Dispositivos utilizados para la agresión' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedDevices?: string[];

  @ApiPropertyOptional({ type: [String], description: 'Métodos de coerción empleados' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  coercionMethods?: string[];

  @ApiPropertyOptional({ description: 'Metadata preservada de las publicaciones (evidencia)' })
  @IsOptional()
  @IsObject()
  metadataPreserved?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Requiere peritaje forense' })
  @IsOptional()
  @IsBoolean()
  requiresForensic?: boolean;

  @ApiPropertyOptional({ description: 'Operadora de telefonía del agresor' })
  @IsOptional()
  @IsString()
  phoneOperator?: string;

  @ApiPropertyOptional({ description: 'Verificación de titularidad del teléfono' })
  @IsOptional()
  @IsString()
  phoneOwnerVerified?: string;

  @ApiPropertyOptional({ description: 'Registro de llamadas externo (JSON)' })
  @IsOptional()
  @IsObject()
  callRegistryExt?: Record<string, unknown>;
}
