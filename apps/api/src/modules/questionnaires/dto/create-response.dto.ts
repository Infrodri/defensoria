import { IsString, IsOptional, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsUUID()
  questionId: string;

  @IsString()
  answer: string;
}

export class CreateResponseDto {
  @IsUUID()
  templateId: string;

  @IsUUID()
  caseId: string;

  @IsOptional()
  @IsUUID()
  appointmentId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
