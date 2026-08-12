import { Injectable } from '@nestjs/common';
import { IEvidenceParser } from './evidence-parser.interface';
import { AudioParser } from './audio.parser';
import { ImageParser } from './image.parser';
import { PdfParser } from './pdf.parser';
import { DocxParser } from './docx.parser';

@Injectable()
export class EvidenceParserFactory {
  constructor(
    private readonly audioParser: AudioParser,
    private readonly imageParser: ImageParser,
    private readonly pdfParser: PdfParser,
    private readonly docxParser: DocxParser,
  ) {}

  /**
   * Returns the appropriate parser for the given MIME type.
   * Returns null for unsupported formats (will index description only).
   */
  getParser(mimeType: string): IEvidenceParser | null {
    const mime = mimeType.toLowerCase();

    if (mime.startsWith('audio/') || mime.startsWith('video/')) {
      return this.audioParser;
    }
    if (mime.startsWith('image/')) {
      return this.imageParser;
    }
    if (mime === 'application/pdf') {
      return this.pdfParser;
    }
    if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mime === 'application/msword'
    ) {
      return this.docxParser;
    }

    return null;
  }
}
