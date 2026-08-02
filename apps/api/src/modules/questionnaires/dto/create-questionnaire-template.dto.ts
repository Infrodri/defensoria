import { IsString, IsOptional, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionnaireCategory } from '@prisma/client';

export class CreateQuestionDto {
  @IsString()
  question: string;

  @IsEnum(['TEXT', 'MULTIPLE_CHOICE', 'BOOLEAN', 'RATING', 'DATE'])
  questionType: string;

  @Type(() => Number)
  order: number;

  @IsOptional()
  required?: boolean = true;

  @IsOptional()
  @IsArray()
  options?: string[];

  @IsOptional()
  @IsArray()
  riskKeywords?: string[];
}

export class CreateQuestionnnaireTemplateDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['PSICOLOGICO', 'SOCIAL', 'JURIDICO', 'GENERAL'])
  category: QuestionnaireCategory;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[];
}
