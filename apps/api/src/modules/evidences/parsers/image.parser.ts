import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { IEvidenceParser, ParsedContent } from './evidence-parser.interface';

let cachedVisionModel: string | null = null;
let cacheExpiry = 0;

async function getVisionModel(ollamaUrl: string): Promise<string> {
  if (cachedVisionModel && Date.now() < cacheExpiry) {
    return cachedVisionModel;
  }

  let visionModel = process.env.OLLAMA_VISION_MODEL || 'llava';
  try {
    const tagsRes = await axios.get(`${ollamaUrl}/api/tags`, { timeout: 3000 });
    const models: any[] = tagsRes.data?.models || [];
    const found = models.find((m) =>
      m.capabilities?.includes('vision') ||
      ['llava', 'gemma4:12b', 'qwen3.5:35b', 'llama3.2-vision', 'bakllava'].some((v) => m.name?.toLowerCase().includes(v))
    );
    if (found) visionModel = found.name;
  } catch (tagsErr) {
    // use fallback visionModel
  }

  cachedVisionModel = visionModel;
  cacheExpiry = Date.now() + 5 * 60 * 1000; // 5 min TTL
  return cachedVisionModel;
}

@Injectable()
export class ImageParser implements IEvidenceParser {
  private readonly logger = new Logger(ImageParser.name);

  async parse(
    file: { buffer: Buffer; originalname: string; mimetype: string },
    description?: string,
  ): Promise<ParsedContent> {
    const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
    let text = '';

    try {
      const visionModel = await getVisionModel(ollamaUrl);

      this.logger.log(`Using vision model '${visionModel}' for image analysis`);

      const base64Image = file.buffer.toString('base64');
      const response = await axios.post(
        `${ollamaUrl}/api/generate`,
        {
          model: visionModel,
          prompt: `Analiza esta imagen en detalle en español.
Contexto: es evidencia de un caso de la Defensoría de la Niñez y Adolescencia en Bolivia.
Si es una captura de pantalla de chats (WhatsApp, Messenger, Facebook, etc.), mensajes, documentos, cartas o letreros: EXTRAE TODO EL TEXTO VISIBLE LETRA POR LETRA.
Si contiene una escena o personas: describe objetivamente qué se observa sin nombres personales.

Responde estrictamente en este formato:
[DESCRIPCIÓN VISUAL DE LA ESCENA]: ...
[TEXTO EXTRAÍDO (OCR / CHATS / DOCUMENTOS)]: ...`,
          images: [base64Image],
          stream: false,
        },
        { timeout: 90_000 },
      );

      text = response.data.response || '';
    } catch (err: any) {
      this.logger.warn(`Ollama vision unavailable: ${err.message}`);
      text = description
        ? `Attached image: ${description}`
        : `Photographic image attached to case: ${file.originalname}`;
    }

    return {
      sourceType: 'image_description',
      text,
      metadata: {
        fileName: file.originalname,
        description,
        source: 'vision_analysis',
      },
    };
  }
}
