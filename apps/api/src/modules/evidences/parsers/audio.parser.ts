import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import { IEvidenceParser, ParsedContent } from './evidence-parser.interface';

@Injectable()
export class AudioParser implements IEvidenceParser {
  private readonly logger = new Logger(AudioParser.name);

  async parse(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    description?: string,
  ): Promise<ParsedContent> {
    const whisperUrl = process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
    let text = '';

    try {
      const formData = new FormData();
      formData.append('file', file.buffer, {
        filename: file.originalname,
        contentType: file.mimetype,
      });
      formData.append('model', 'whisper-1');
      formData.append('language', 'es');

      const response = await axios.post(whisperUrl, formData, {
        headers: formData.getHeaders(),
        timeout: 120_000,
      });
      text = response.data.text || response.data.result?.text || '';
    } catch (err: any) {
      this.logger.warn(`Whisper unavailable: ${err.message}`);
      text = description
        ? `Audio recording: ${description}`
        : `Audio file attached to case: ${file.originalname}`;
    }

    return {
      sourceType: 'audio_transcript',
      text,
      metadata: {
        fileName: file.originalname,
        description,
        source: 'whisper_transcription',
      },
    };
  }
}
