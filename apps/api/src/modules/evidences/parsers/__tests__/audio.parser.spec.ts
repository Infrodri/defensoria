import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AudioParser } from '../audio.parser';
import axios from 'axios';

vi.mock('axios');

describe('AudioParser', () => {
  let parser: AudioParser;

  beforeEach(() => {
    parser = new AudioParser();
    vi.clearAllMocks();
  });

  it('should return sourceType audio_transcript', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { text: 'Transcribed audio content from Whisper service' },
    });

    const result = await parser.parse({
      buffer: Buffer.from('fake audio data'),
      originalname: 'recording.mp3',
      mimetype: 'audio/mpeg',
    });

    expect(result.sourceType).toBe('audio_transcript');
    expect(result.text).toBe('Transcribed audio content from Whisper service');
    expect(result.metadata.source).toBe('whisper_transcription');
  });

  it('should fallback to description when Whisper is unavailable', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await parser.parse(
      { buffer: Buffer.from('audio'), originalname: 'rec.mp3', mimetype: 'audio/mpeg' },
      'Interview with guardian',
    );

    expect(result.text).toContain('Interview with guardian');
  });

  it('should use filename in fallback when no description', async () => {
    vi.mocked(axios.post).mockRejectedValueOnce(new Error('timeout'));

    const result = await parser.parse({
      buffer: Buffer.from('audio'),
      originalname: 'evidence-audio.wav',
      mimetype: 'audio/wav',
    });

    expect(result.text).toContain('evidence-audio.wav');
  });
});
