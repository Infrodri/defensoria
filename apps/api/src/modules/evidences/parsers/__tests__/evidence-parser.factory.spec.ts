import { describe, it, expect, beforeEach } from 'vitest';
import { EvidenceParserFactory } from '../evidence-parser.factory';
import { AudioParser } from '../audio.parser';
import { ImageParser } from '../image.parser';
import { PdfParser } from '../pdf.parser';
import { DocxParser } from '../docx.parser';

describe('EvidenceParserFactory', () => {
  let factory: EvidenceParserFactory;
  let audioParser: AudioParser;
  let imageParser: ImageParser;
  let pdfParser: PdfParser;
  let docxParser: DocxParser;

  beforeEach(() => {
    audioParser = {} as AudioParser;
    imageParser = {} as ImageParser;
    pdfParser = {} as PdfParser;
    docxParser = {} as DocxParser;
    factory = new EvidenceParserFactory(audioParser, imageParser, pdfParser, docxParser);
  });

  it('should return AudioParser for audio/mpeg', () => {
    expect(factory.getParser('audio/mpeg')).toBe(audioParser);
  });

  it('should return AudioParser for video/mp4', () => {
    expect(factory.getParser('video/mp4')).toBe(audioParser);
  });

  it('should return AudioParser for audio/wav', () => {
    expect(factory.getParser('audio/wav')).toBe(audioParser);
  });

  it('should return ImageParser for image/jpeg', () => {
    expect(factory.getParser('image/jpeg')).toBe(imageParser);
  });

  it('should return ImageParser for image/png', () => {
    expect(factory.getParser('image/png')).toBe(imageParser);
  });

  it('should return PdfParser for application/pdf', () => {
    expect(factory.getParser('application/pdf')).toBe(pdfParser);
  });

  it('should return DocxParser for DOCX mime type', () => {
    expect(factory.getParser('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(docxParser);
  });

  it('should return DocxParser for legacy Word mime type', () => {
    expect(factory.getParser('application/msword')).toBe(docxParser);
  });

  it('should return null for unsupported types', () => {
    expect(factory.getParser('application/zip')).toBeNull();
  });

  it('should return null for text/plain', () => {
    expect(factory.getParser('text/plain')).toBeNull();
  });

  it('should handle case-insensitive mime types', () => {
    expect(factory.getParser('IMAGE/JPEG')).toBe(imageParser);
    expect(factory.getParser('Audio/MPEG')).toBe(audioParser);
  });
});
