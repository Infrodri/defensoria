import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReopenCaseDto {
  @ApiProperty({
    description: 'Razn obligatoria para la reapertura del expediente',
    example: 'Nuevas evidencias requieren continuar con la investigacin',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'La razn de reapertura debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La razn de reapertura no puede exceder 1000 caracteres' })
  reopenReason: string;
}