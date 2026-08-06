import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceRagService } from '../evidences/evidence-rag.service';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private prisma: PrismaService,
    private evidenceRag: EvidenceRagService,
  ) {}

  private async getOllamaConfig() {
    const endpointSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_ENDPOINT' },
    });
    const modelSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_MODEL' },
    });

    const endpoint = endpointSetting?.value || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    const model = modelSetting?.value || process.env.OLLAMA_MODEL || 'mistral'; // Free local default

    return { endpoint, model };
  }

  private async queryOllama(prompt: string, systemPrompt: string) {
    const { endpoint, model } = await this.getOllamaConfig();
    
    this.logger.log(`Consultando Ollama local en ${endpoint} con modelo ${model}`);

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: systemPrompt,
          stream: false,
          options: {
            temperature: 0.3, // Low temp for more factual/legal generation
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Error en API Ollama: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      this.logger.error(`Fallo al conectar con IA Local: ${error.message}`);
      throw new BadRequestException('El servicio de IA local (Ollama) no está respondiendo. Verifique la configuración del administrador.');
    }
  }

  async draftLegalDocument(caseContext: string) {
    const systemPrompt = `Eres un asistente legal experto en la Ley 548 (Código Niña, Niño y Adolescente) de Bolivia. 
Tu tarea es redactar un borrador formal de un escrito legal o memorial dirigido a una autoridad competente (ej. Juez de la Niñez y Adolescencia o Fiscal).
Usa lenguaje jurídico formal boliviano. Estructura el documento con Suma, Autoridad dirigida, Generales de ley (omitir nombres, usar "NNA", "Denunciante"), Relación de hechos, Petitorio y Otrosíes. 
Nunca inventes datos que no estén en el contexto. Termina siempre indicando que es un borrador generado por IA y requiere revisión.`;

    const prompt = `Basado en el siguiente contexto del expediente, redacta un borrador de escrito legal inicial para presentar el caso ante las autoridades correspondientes.
    
Contexto del Expediente:
${caseContext}
`;

    return this.queryOllama(prompt, systemPrompt);
  }

  async analyzeRisk(narrative: string) {
    const systemPrompt = `Eres un trabajador social y psicólogo experto en protección infantil en Bolivia (Ley 548).
Tu tarea es analizar la narrativa de una denuncia y extraer de forma objetiva posibles indicadores de vulnerabilidad o riesgo para el NNA.
Presenta una lista breve (bullet points) de factores de riesgo identificados y sugiere si amerita valoración urgente.
No des diagnósticos clínicos, solo identifica riesgos evidentes en el texto.
Termina indicando que es una sugerencia generada por IA local y el dictamen final depende del equipo psicosocial.`;

    const prompt = `Analiza la siguiente narrativa de denuncia e identifica indicadores de riesgo:
    
Narrativa:
${narrative}
`;

    return this.queryOllama(prompt, systemPrompt);
  }

  async chat(message: string, caseId?: string) {
    // Buscar contexto real del expediente en case_chunks
    let caseContext = '';
    if (caseId) {
      try {
        caseContext = await this.evidenceRag.searchCaseContext(caseId, message, 8);
      } catch (err: any) {
        this.logger.warn(`[AI] No se pudo recuperar contexto del expediente ${caseId}: ${err.message}`);
      }
    }

    const systemPrompt = `Eres el asistente de coordinación del equipo interdisciplinario de la Defensoría de la Niñez y Adolescencia de Bolivia.
Tu tarea es responder consultas y apoyar el análisis integral de expedientes combinando perspectivas legal, psicológica y social.
Usa lenguaje profesional y claro. No inventes datos que no estén en el contexto proporcionado.
Termina indicando que es una respuesta generada por IA local y que la decisión final depende del equipo interdisciplinario.`;

    const prompt = caseContext
      ? `## Contexto del expediente (material indexado)\n\n${caseContext}\n\n---\n\n## Pregunta del profesional\n\n${message}`
      : message;

    return this.queryOllama(prompt, systemPrompt);
  }

  /**
   * Asistente contextualizado para la redacción de informes.
   * Lee el expediente completo desde case_chunks y ayuda al profesional
   * a responder preguntas específicas mientras completa el informe.
   */
  async assistReport(
    caseId: string,
    reportCategory: string,
    question: string,
    partialContent?: string,
  ) {
    // Recuperar contexto relevante del expediente para la pregunta específica
    let caseContext = '';
    try {
      caseContext = await this.evidenceRag.searchCaseContext(caseId, question, 10);
    } catch (err: any) {
      this.logger.warn(`[AI] No se pudo recuperar contexto para asistencia de informe: ${err.message}`);
    }

    const categoryLabels: Record<string, string> = {
      INFORME_SOCIAL: 'Informe Social',
      INFORME_PSICOLOGICO: 'Informe Psicológico',
      INFORME_PSICOSOCIAL: 'Informe Psicosocial',
      INFORME_JURIDICO: 'Informe Jurídico',
      INFORME_SESION_SEGUIMIENTO: 'Informe de Sesión de Seguimiento',
      INFORME_FINAL_CONCILIACION: 'Informe Final de Conciliación',
      INFORME_COMPLEMENTARIO: 'Informe Complementario',
    };
    const reportLabel = categoryLabels[reportCategory] || reportCategory;

    const systemPrompt = `Eres un asistente especializado de la Defensoría de la Niñez y Adolescencia de Bolivia.
Estás ayudando a un profesional a redactar un ${reportLabel} según los estándares de la Ley 548 y el protocolo interinstitucional.
Tu rol es responder preguntas puntuales del profesional basándote ÚNICAMENTE en el contexto del expediente que se te proporciona.
No inventes datos, no asumas información que no esté en el contexto.
Sé conciso, claro y usa terminología profesional apropiada para el tipo de informe.
Si no tenés información suficiente en el contexto para responder, decilo explícitamente.`;

    const contextSection = caseContext
      ? `## Material del expediente relevante\n\n${caseContext}\n\n---\n\n`
      : '## (Sin contexto indexado disponible para este expediente)\n\n---\n\n';

    const partialSection = partialContent
      ? `## Contenido parcial del informe ya redactado\n\n${partialContent}\n\n---\n\n`
      : '';

    const prompt = `${contextSection}${partialSection}## Pregunta del profesional sobre el ${reportLabel}\n\n${question}`;

    return this.queryOllama(prompt, systemPrompt);
  }
}
