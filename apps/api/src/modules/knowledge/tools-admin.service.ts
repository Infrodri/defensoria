import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RAGService } from './rag.service';
import axios from 'axios';

export interface ToolHealthStatus {
  name: string;
  status: 'OK' | 'ERROR' | 'DEGRADED';
  lastCheck: Date;
  message: string;
  responseTime?: number;
}

export interface ToolsHealthReport {
  timestamp: Date;
  overallStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  tools: {
    ollama: ToolHealthStatus;
    whisper: ToolHealthStatus;
    rag: ToolHealthStatus;
    database: ToolHealthStatus;
    transcriptions: ToolHealthStatus;
    knowledgeBase: ToolHealthStatus;
  };
}

@Injectable()
export class ToolsAdminService {
  private readonly logger = new Logger(ToolsAdminService.name);

  constructor(
    private prisma: PrismaService,
    private ragService: RAGService,
  ) {}

  /**
   * Verificar health de todas las herramientas
   */
  async checkAllToolsHealth(): Promise<ToolsHealthReport> {
    const startTime = Date.now();
    const results: ToolsHealthReport = {
      timestamp: new Date(),
      overallStatus: 'HEALTHY',
      tools: {
        ollama: await this.checkOllamaHealth(),
        whisper: await this.checkWhisperHealth(),
        rag: await this.checkRAGHealth(),
        database: await this.checkDatabaseHealth(),
        transcriptions: await this.checkTranscriptionsHealth(),
        knowledgeBase: await this.checkKnowledgeBaseHealth(),
      },
    };

    // Determinar status general
    const allStatuses = Object.values(results.tools).map((t) => t.status);
    if (allStatuses.includes('ERROR')) {
      results.overallStatus = 'DOWN';
    } else if (allStatuses.includes('DEGRADED')) {
      results.overallStatus = 'DEGRADED';
    }

    this.logger.log(`Health check completed in ${Date.now() - startTime}ms`);
    return results;
  }

  /**
   * Obtener estado detallado de herramientas
   */
  async getDetailedStatus() {
    const health = await this.checkAllToolsHealth();

    // Obtener estadísticas de análisis
    const [
      totalTranscriptions,
      completedTranscriptions,
      totalAnalyses,
      documentsIndexed,
    ] = await Promise.all([
      this.prisma.transcription.count(),
      this.prisma.transcription.count({ where: { status: 'COMPLETADA' } }),
      this.prisma.discrepancyAnalysis.count(),
      this.prisma.legalDocument.count(),
    ]);

    return {
      health,
      statistics: {
        transcriptions: {
          total: totalTranscriptions,
          completed: completedTranscriptions,
          pending: totalTranscriptions - completedTranscriptions,
          successRate:
            totalTranscriptions > 0
              ? Math.round((completedTranscriptions / totalTranscriptions) * 100)
              : 0,
        },
        analyses: {
          total: totalAnalyses,
        },
        knowledgeBase: {
          documentsIndexed,
        },
      },
      capabilities: {
        legal: {
          enabled: true,
          method: 'Ollama + RAG',
          status: health.tools.ollama.status === 'OK' ? 'ready' : 'unavailable',
        },
        psychological: {
          enabled: true,
          method: 'Ollama + RAG',
          status: health.tools.ollama.status === 'OK' ? 'ready' : 'unavailable',
        },
        social: {
          enabled: true,
          method: 'Ollama + RAG',
          status: health.tools.ollama.status === 'OK' ? 'ready' : 'unavailable',
        },
        transversal: {
          enabled: true,
          method: 'Ollama + RAG',
          status: health.tools.ollama.status === 'OK' ? 'ready' : 'unavailable',
        },
        transcription: {
          enabled: true,
          method: 'Whisper API',
          status: health.tools.whisper.status === 'OK' ? 'ready' : 'unavailable',
        },
      },
    };
  }

  /**
   * Aprobar herramientas como funcionales
   */
  async approveTools(notes?: string) {
    const health = await this.checkAllToolsHealth();

    // Verificar que todas están en OK o DEGRADED (no DOWN)
    const hasErrors = Object.values(health.tools).some((t) => t.status === 'ERROR');
    if (hasErrors) {
      return {
        approved: false,
        message:
          'No se puede aprobar: hay herramientas con errores. Revisar health check.',
        health,
      };
    }

    // Log de aprobación (en producción, guardar en BD con model ToolApproval)
    const timestamp = new Date();
    this.logger.log(`Tools approved at ${timestamp} with notes: ${notes || 'none'}`);

    return {
      approved: true,
      message: 'Herramientas aprobadas como funcionales',
      approvalId: `approval-${timestamp.getTime()}`,
      timestamp,
      health,
    };
  }

  /**
   * Obtener historial de aprobaciones
   */
  async getApprovalHistory() {
    // Por ahora, retornar historial vacío/mock
    // En producción, consultar modelo ToolApproval
    return {
      count: 0,
      message: 'Aprobaciones se registran en logs del sistema',
      approvals: [],
    };
  }

  /**
   * Ejecutar tests en vivo
   */
  async runLiveToolTests() {
    const results: any = {
      timestamp: new Date(),
      tests: {},
    };

    // Test 1: Verificar health
    try {
      results.tests.health = await this.checkAllToolsHealth();
      results.tests.health_status = 'PASSED';
    } catch (error: any) {
      results.tests.health_status = 'FAILED';
      results.tests.health_error = error.message;
    }

    // Test 2: Test Ollama
    try {
      const ollamaTest = await this.testOllama();
      results.tests.ollama = ollamaTest;
      results.tests.ollama_status = 'PASSED';
    } catch (error: any) {
      results.tests.ollama_status = 'FAILED';
      results.tests.ollama_error = error.message;
    }

    // Test 3: Test RAG
    try {
      const ragTest = await this.testRAG();
      results.tests.rag = ragTest;
      results.tests.rag_status = 'PASSED';
    } catch (error: any) {
      results.tests.rag_status = 'FAILED';
      results.tests.rag_error = error.message;
    }

    // Test 4: Test Whisper
    try {
      const whisperTest = await this.testWhisper();
      results.tests.whisper = whisperTest;
      results.tests.whisper_status = 'PASSED';
    } catch (error: any) {
      results.tests.whisper_status = 'FAILED';
      results.tests.whisper_error = error.message;
    }

    // Test 5: Test Transcriptions
    try {
      const transcriptionCount = await this.prisma.transcription.count();
      results.tests.transcriptions = {
        count: transcriptionCount,
        message: `Found ${transcriptionCount} transcriptions in database`,
      };
      results.tests.transcriptions_status = 'PASSED';
    } catch (error: any) {
      results.tests.transcriptions_status = 'FAILED';
      results.tests.transcriptions_error = error.message;
    }

    // Resumen
    const passedTests = Object.keys(results.tests)
      .filter((k) => results.tests[`${k}_status`] === 'PASSED')
      .length;
    const totalTests = Object.keys(results.tests).filter((k) =>
      k.endsWith('_status'),
    ).length;

    results.summary = {
      totalTests,
      passed: passedTests,
      failed: totalTests - passedTests,
      successRate: Math.round((passedTests / totalTests) * 100),
      allPassed: passedTests === totalTests,
    };

    return results;
  }

  // ============================================================================
  // HEALTH CHECKS INDIVIDUALES
  // ============================================================================

  private async checkOllamaHealth(): Promise<ToolHealthStatus> {
    const startTime = Date.now();
    try {
      const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
      const response = await axios.get(`${ollamaUrl}/api/tags`, {
        timeout: 5000,
      });
      const responseTime = Date.now() - startTime;

      return {
        name: 'Ollama',
        status: 'OK',
        lastCheck: new Date(),
        message: `Ollama running with ${response.data.models?.length || 0} models`,
        responseTime,
      };
    } catch (error: any) {
      return {
        name: 'Ollama',
        status: 'ERROR',
        lastCheck: new Date(),
        message: `Ollama unreachable: ${error.message}`,
      };
    }
  }

  private async checkWhisperHealth(): Promise<ToolHealthStatus> {
    const startTime = Date.now();
    try {
      const whisperUrl =
        process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
      const baseUrl = whisperUrl.replace('/v1/audio/transcriptions', '');
      const response = await axios.get(`${baseUrl}/docs`, {
        timeout: 5000,
      });
      const responseTime = Date.now() - startTime;

      return {
        name: 'Whisper API',
        status: 'OK',
        lastCheck: new Date(),
        message: 'Whisper API is responding',
        responseTime,
      };
    } catch (error: any) {
      return {
        name: 'Whisper API',
        status: 'DEGRADED',
        lastCheck: new Date(),
        message: `Whisper API unreachable (optional for fallback): ${error.message}`,
      };
    }
  }

  private async checkRAGHealth(): Promise<ToolHealthStatus> {
    const startTime = Date.now();
    try {
      // Test RAG by checking if we can perform a simple search
      const testResults = await this.ragService.searchSimilarChunks(
        'test legal knowledge',
        5,
      );
      const responseTime = Date.now() - startTime;

      return {
        name: 'RAG Service',
        status: 'OK',
        lastCheck: new Date(),
        message: `RAG ready - found ${testResults.length} similar chunks in test`,
        responseTime,
      };
    } catch (error: any) {
      return {
        name: 'RAG Service',
        status: 'ERROR',
        lastCheck: new Date(),
        message: `RAG error: ${error.message}`,
      };
    }
  }

  private async checkDatabaseHealth(): Promise<ToolHealthStatus> {
    const startTime = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;

      return {
        name: 'PostgreSQL Database',
        status: 'OK',
        lastCheck: new Date(),
        message: 'Database connection healthy',
        responseTime,
      };
    } catch (error: any) {
      return {
        name: 'PostgreSQL Database',
        status: 'ERROR',
        lastCheck: new Date(),
        message: `Database error: ${error.message}`,
      };
    }
  }

  private async checkTranscriptionsHealth(): Promise<ToolHealthStatus> {
    try {
      const count = await this.prisma.transcription.count();
      const completed = await this.prisma.transcription.count({
        where: { status: 'COMPLETADA' },
      });

      return {
        name: 'Transcriptions',
        status: count > 0 ? 'OK' : 'DEGRADED',
        lastCheck: new Date(),
        message: `${count} transcriptions stored (${completed} completed)`,
      };
    } catch (error: any) {
      return {
        name: 'Transcriptions',
        status: 'ERROR',
        lastCheck: new Date(),
        message: `Transcriptions error: ${error.message}`,
      };
    }
  }

  private async checkKnowledgeBaseHealth(): Promise<ToolHealthStatus> {
    try {
      const count = await this.prisma.legalDocument.count();

      return {
        name: 'Knowledge Base',
        status: count > 0 ? 'OK' : 'DEGRADED',
        lastCheck: new Date(),
        message: `${count} documents indexed in knowledge base`,
      };
    } catch (error: any) {
      return {
        name: 'Knowledge Base',
        status: 'ERROR',
        lastCheck: new Date(),
        message: `Knowledge Base error: ${error.message}`,
      };
    }
  }

  // ============================================================================
  // TESTS EN VIVO
  // ============================================================================

  private async testOllama() {
    const ollamaUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    const response = await axios.get(`${ollamaUrl}/api/tags`, {
      timeout: 5000,
    });

    return {
      modelsAvailable: response.data.models?.map((m: any) => m.name) || [],
      responseTime: `${response.status}`,
    };
  }

  private async testRAG() {
    const results = await this.ragService.searchSimilarChunks(
      'ley de protección a la infancia',
      3,
    );
    return {
      queryTest: 'ley de protección a la infancia',
      resultsFound: results.length,
      topResult: results[0]?.metadata?.source || 'N/A',
    };
  }

  private async testWhisper() {
    try {
      const whisperUrl =
        process.env.WHISPER_API_URL || 'http://localhost:8000/v1/audio/transcriptions';
      const baseUrl = whisperUrl.replace('/v1/audio/transcriptions', '');
      const response = await axios.get(`${baseUrl}/docs`, {
        timeout: 5000,
      });
      return {
        status: 'available',
        endpoint: whisperUrl,
      };
    } catch (error: any) {
      return {
        status: 'unavailable',
        endpoint: process.env.WHISPER_API_URL || 'http://localhost:8000',
        error: error.message,
      };
    }
  }
}
