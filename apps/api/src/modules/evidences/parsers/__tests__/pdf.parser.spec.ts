import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PdfParser } from '../pdf.parser';

describe('PdfParser', () => {
  let parser: PdfParser;

  beforeEach(() => {
    parser = new PdfParser();
    vi.restoreAllMocks();
  });

  it('should return sourceType pdf_text with valid PDF buffer', async () => {
    // Create a minimal valid PDF buffer
    const validPdf = Buffer.from(
      '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n' +
      '2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\n' +
      'xref\n0 3\ntrailer\n<< /Root 1 0 R >>\nstartxref\n0\n%%EOF',
    );

    const result = await parser.parse({
      buffer: validPdf,
      originalname: 'test.pdf',
      mimetype: 'application/pdf',
    });

    expect(result.sourceType).toBe('pdf_text');
    expect(result.metadata.source).toBe('pdf_extract');
    expect(result.metadata.fileName).toBe('test.pdf');
  });

  it('should use chunking utility for text splitting', () => {
    // Test the splitIntoChunks method directly via a parser with long text
    // We test this by providing a mock that returns long text
    const longText = 'Word '.repeat(1000); // 5000 chars
    const chunks = (parser as any).splitIntoChunks(longText, 2000, 200);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0].length).toBeLessThanOrEqual(2000);
  });

  it('should fallback to description on pdf-parse failure', async () => {
    // Provide a completely invalid buffer that pdf-parse can't handle
    const result = await parser.parse(
      { buffer: Buffer.from('this is not a pdf at all'), originalname: 'bad.pdf', mimetype: 'application/pdf' },
      'Important document',
    );

    expect(result.text).toContain('Important document');
  });

  it('should use filename in fallback when no description provided', async () => {
    const result = await parser.parse(
      { buffer: Buffer.from('invalid'), originalname: 'report-2026.pdf', mimetype: 'application/pdf' },
    );

    expect(result.text).toContain('report-2026.pdf');
  });
});
