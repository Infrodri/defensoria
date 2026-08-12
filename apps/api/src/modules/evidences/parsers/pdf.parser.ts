import { Injectable, Logger } from '@nestjs/common';
import { IEvidenceParser, ParsedContent } from './evidence-parser.interface';

@Injectable()
export class PdfParser implements IEvidenceParser {
  private readonly logger = new Logger(PdfParser.name);

  async parse(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    description?: string,
  ): Promise<ParsedContent> {
    let text = '';

    try {
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(file.buffer);
      text = data.text?.replace(/\x00/g, '').trim() || '';
    } catch (err: any) {
      this.logger.warn(`pdf-parse failed: ${err.message}`);
      text = description
        ? `PDF document: ${description}`
        : `PDF document attached to case: ${file.originalname}`;
    }

    const chunks = text.length > 20 ? this.splitIntoChunks(text, 2000, 200) : undefined;

    return {
      sourceType: 'pdf_text',
      text,
      chunks,
      metadata: {
        fileName: file.originalname,
        description,
        source: 'pdf_extract',
      },
    };
  }

  private splitIntoChunks(text: string, maxSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + maxSize, text.length);
      chunks.push(text.slice(start, end));
      if (end >= text.length) break;
      start = end - overlap;
    }

    return chunks.filter((c) => c.trim().length > 20);
  }
}
