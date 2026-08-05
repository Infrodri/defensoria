import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class AdminConfigService {
  private readonly logger = new Logger(AdminConfigService.name);

  constructor(private prisma: PrismaService) {}

  async getConfig() {
    const keys = ['OLLAMA_ENDPOINT', 'OLLAMA_MODEL', 'OLLAMA_VISION_MODEL', 'WHISPER_API_URL'];
    const settings = await this.prisma.systemSetting.findMany({
      where: { key: { in: keys } },
    });

    const map = new Map(settings.map((s) => [s.key, s.value]));

    return {
      ollamaEndpoint: map.get('OLLAMA_ENDPOINT') || 'http://localhost:11434',
      ollamaModel: map.get('OLLAMA_MODEL') || 'mistral',
      ollamaVisionModel: map.get('OLLAMA_VISION_MODEL') || 'gemma4-tasks:latest',
      whisperApiUrl: map.get('WHISPER_API_URL') || 'http://localhost:8000/v1/audio/transcriptions',
    };
  }

  async updateConfig(dto: {
    ollamaEndpoint?: string;
    ollamaModel?: string;
    ollamaVisionModel?: string;
    whisperApiUrl?: string;
  }, userId: string) {
    const updates = [];

    if (dto.ollamaEndpoint !== undefined) {
      updates.push({
        key: 'OLLAMA_ENDPOINT',
        value: dto.ollamaEndpoint,
      });
    }
    if (dto.ollamaModel !== undefined) {
      updates.push({
        key: 'OLLAMA_MODEL',
        value: dto.ollamaModel,
      });
    }
    if (dto.ollamaVisionModel !== undefined) {
      updates.push({
        key: 'OLLAMA_VISION_MODEL',
        value: dto.ollamaVisionModel,
      });
    }
    if (dto.whisperApiUrl !== undefined) {
      updates.push({
        key: 'WHISPER_API_URL',
        value: dto.whisperApiUrl,
      });
    }

    for (const item of updates) {
      await this.prisma.systemSetting.upsert({
        where: { key: item.key },
        update: { value: item.value, updatedBy: userId },
        create: {
          key: item.key,
          value: item.value,
          description: `Configuracin IA: ${item.key}`,
          updatedBy: userId,
        },
      });
    }

    return { success: true, message: 'Configuracin actualizada' };
  }

  async checkOllamaHealth() {
    const startTime = Date.now();
    try {
      const config = await this.getConfig();
      const response = await axios.get(`${config.ollamaEndpoint}/api/tags`, {
        timeout: 5000,
      });
      const models = response.data.models?.map((m: any) => m.name) || [];

      return {
        name: 'Ollama',
        status: 'OK' as const,
        responseTime: Date.now() - startTime,
        models,
        endpoint: config.ollamaEndpoint,
      };
    } catch (error: any) {
      return {
        name: 'Ollama',
        status: 'OFFLINE' as const,
        responseTime: Date.now() - startTime,
        error: error.message,
        endpoint: 'http://localhost:11434',
      };
    }
  }

  async checkWhisperHealth() {
    const startTime = Date.now();
    try {
      const config = await this.getConfig();
      const baseUrl = config.whisperApiUrl.replace('/v1/audio/transcriptions', '');
      const response = await axios.get(`${baseUrl}/docs`, {
        timeout: 5000,
      });

      return {
        name: 'Whisper',
        status: 'OK' as const,
        responseTime: Date.now() - startTime,
        endpoint: config.whisperApiUrl,
      };
    } catch (error: any) {
      return {
        name: 'Whisper',
        status: 'OFFLINE' as const,
        responseTime: Date.now() - startTime,
        error: error.message,
        endpoint: 'http://localhost:8000',
      };
    }
  }

  async checkAllHealth() {
    const [ollama, whisper] = await Promise.all([
      this.checkOllamaHealth(),
      this.checkWhisperHealth(),
    ]);

    const overallStatus =
      ollama.status === 'OFFLINE' || whisper.status === 'OFFLINE'
        ? 'DEGRADED'
        : 'HEALTHY';

    return {
      overallStatus,
      tools: { ollama, whisper },
      timestamp: new Date(),
    };
  }
}