import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateCatalogItemDto {
  @IsString()
  value: string;

  @IsString()
  label: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateCatalogItemDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
