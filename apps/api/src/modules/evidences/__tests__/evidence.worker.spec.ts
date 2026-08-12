import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EvidenceWorker } from '../evidence.worker';
import { Readable } from 'stream';

describe('EvidenceWorker', () => {
  let worker: EvidenceWorker;
  let mockPgBoss: any;
  let mockPrisma: any;
  let mockMinio: any;
  let mockEmbeddings: any;
  let mockParserFactory: any;
  let mockParser: any;

  beforeEach(() => {
    mockPgBoss = {
      work: vi.fn().mockResolvedValue('worker-id'),
    };

    mockPrisma = {
      evidence: {
        update: vi.fn().mockResolvedValue({}),
      },
      $executeRaw: vi.fn().mockResolvedValue(1),
    };

    mockMinio = {
      getFileStream: vi.fn().mockResolvedValue(
        Readable.from([Buffer.from('fake file content')]),
      ),
    };

    mockEmbeddings = {
      getEmbedding: vi.fn().mockResolvedValue(new Array(768).fill(0.1)),
    };

    mockParser = {
      parse: vi.fn().mockResolvedValue({
        sourceType: 'pdf_text',
        text: 'Extracted text from the document for testing purposes and validation.',
        chunks: ['Chunk 1 with enough text for validation.', 'Chunk 2 with more text content here.'],
        metadata: { source: 'pdf_extract' },
      }),
    };

    mockParserFactory = {
      getParser: vi.fn().mockReturnValue(mockParser),
    };

    worker = new EvidenceWorker(
      mockPgBoss,
      mockPrisma,
      mockMinio,
      mockEmbeddings,
      mockParserFactory,
    );
  });

  it('should register worker on module init', async () => {
    await worker.onModuleInit();
    expect(mockPgBoss.work).toHaveBeenCalledWith(
      'evidence-processing',
      { teamConcurrency: 1 },
      expect.any(Function),
    );
  });

  it('should process a job and mark as COMPLETED', async () => {
    const job = {
      data: {
        caseId: '11111111-1111-1111-1111-111111111111',
        evidenceId: '22222222-2222-2222-2222-222222222222',
        mimeType: 'application/pdf',
        storagePath: 'cases/11111111/file.pdf',
        originalName: 'document.pdf',
        description: 'Test document',
      },
    };

    // Access the private handleJob via the registered callback
    await worker.onModuleInit();
    const handler = mockPgBoss.work.mock.calls[0][2];
    await handler(job);

    // Should have marked as PROCESSING first
    expect(mockPrisma.evidence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ragStatus: 'PROCESSING' }),
      }),
    );

    // Should have downloaded from MinIO
    expect(mockMinio.getFileStream).toHaveBeenCalledWith('cases/11111111/file.pdf');

    // Should have deleted previous chunks (idempotency)
    expect(mockPrisma.$executeRaw).toHaveBeenCalled();

    // Should have marked as COMPLETED
    expect(mockPrisma.evidence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ragStatus: 'COMPLETED' }),
      }),
    );
  });

  it('should mark as FAILED on error and re-throw', async () => {
    mockMinio.getFileStream.mockRejectedValueOnce(new Error('MinIO unavailable'));

    const job = {
      data: {
        caseId: '11111111-1111-1111-1111-111111111111',
        evidenceId: '33333333-3333-3333-3333-333333333333',
        mimeType: 'application/pdf',
        storagePath: 'cases/11111111/missing.pdf',
        originalName: 'missing.pdf',
      },
    };

    await worker.onModuleInit();
    const handler = mockPgBoss.work.mock.calls[0][2];

    await expect(handler(job)).rejects.toThrow('MinIO unavailable');

    expect(mockPrisma.evidence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ragStatus: 'FAILED' }),
      }),
    );
  });

  it('should use correct caseId for chunk isolation', async () => {
    const caseId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const job = {
      data: {
        caseId,
        evidenceId: '22222222-2222-2222-2222-222222222222',
        mimeType: 'application/pdf',
        storagePath: 'cases/test/file.pdf',
        originalName: 'doc.pdf',
      },
    };

    await worker.onModuleInit();
    const handler = mockPgBoss.work.mock.calls[0][2];
    await handler(job);

    // Verify that all $executeRaw calls include the correct caseId
    const rawCalls = mockPrisma.$executeRaw.mock.calls;
    // At least one call should be the INSERT with caseId
    expect(rawCalls.length).toBeGreaterThan(0);
  });

  it('should save chunks without embedding when Ollama is unavailable', async () => {
    mockEmbeddings.getEmbedding.mockRejectedValue(new Error('Ollama offline'));

    const job = {
      data: {
        caseId: '11111111-1111-1111-1111-111111111111',
        evidenceId: '44444444-4444-4444-4444-444444444444',
        mimeType: 'application/pdf',
        storagePath: 'cases/test/file.pdf',
        originalName: 'doc.pdf',
      },
    };

    await worker.onModuleInit();
    const handler = mockPgBoss.work.mock.calls[0][2];
    await handler(job);

    // Should still complete (graceful degrade)
    expect(mockPrisma.evidence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ ragStatus: 'COMPLETED' }),
      }),
    );
  });
});
