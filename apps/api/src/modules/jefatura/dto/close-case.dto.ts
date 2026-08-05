import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseCaseDto {
  @ApiProperty({
    description: 'Razn obligatoria para el cierre del expediente',
    example: 'El expediente ha sido resuelto y se cierra por cumplimiento de objeto',
    minLength: 10,
    maxLength: 1000,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'La razn de cierre debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La razn de cierre no puede exceder 1000 caracteres' })
  closureReason: string;
}