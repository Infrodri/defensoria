import { IsArray, IsBoolean, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { DigitalPlatform } from '@prisma/client';

export class UpdateSpecViolenceDigitalDto {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  urls?: string[];

  @ApiPropertyOptional({ enum: DigitalPlatform, isArray: true })
  @IsOptional()
  @IsArray()
  @IsEnum(DigitalPlatform, { each: true, message: 'Plataforma digital no válida' })
  platforms?: DigitalPlatform[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  usedDevices?: string[];

  @ApiPropertyOptional({ type: [String] })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneOperator?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneOwnerVerified?: string;

  @ApiPropertyOptional({ description: 'Registro de llamadas externo (JSON)' })
  @IsOptional()
  @IsObject()
  callRegistryExt?: Record<string, unknown>;
}
