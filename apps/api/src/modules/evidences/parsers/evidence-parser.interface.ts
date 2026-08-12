/**
 * Result of parsing an evidence file.
 */
export interface ParsedContent {
  /** Type of source: 'audio_transcript' | 'image_description' | 'pdf_text' | 'docx_text' | 'document_text' */
  sourceType: string;
  /** Full extracted text (before chunking) */
  text: string;
  /** Pre-split chunks if the parser handles chunking (e.g., PDF, DOCX) */
  chunks?: string[];
  /** Metadata to attach to each chunk */
  metadata: Record<string, any>;
}

/**
 * Strategy interface for evidence file parsing.
 * Each implementation handles a specific file type.
 */
export interface IEvidenceParser {
  parse(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    description?: string,
  ): Promise<ParsedContent>;
}
