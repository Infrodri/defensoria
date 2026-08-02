import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateMarkdownDto {
  @ApiProperty({ description: 'Contenido Markdown a validar' })
  @IsString()
  @IsNotEmpty()
  content: string;
}

export interface MarkdownValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  articlesDetected: number;
  preview: Array<{
    articleNumber: string;
    articleTitle: string;
    contentPreview: string;
    estimatedChunkSize: number;
  }>;
  statistics: {
    totalCharacters: number;
    totalLines: number;
    estimatedChunks: number;
    averageChunkSize: number;
    hasPreambule: boolean;
  };
}
