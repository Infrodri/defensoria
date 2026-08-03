import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(private prisma: PrismaService) {}

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
    const systemPrompt = `Eres el asistente de coordinación del equipo interdisciplinario de la Defensoría de la Niñez y Adolescencia de Bolivia.
Tu tarea es responder consultas y apoyar el análisis integral de expedientes combinando perspectivas legal, psicológica y social.
Usa lenguaje profesional y claro. No inventes datos que no estén en el contexto proporcionado.
Termina indicando que es una respuesta generada por IA local y que la decisión final depende del equipo interdisciplinario.`;

    const prompt = caseId ? `Expediente ID: ${caseId}\n\n${message}` : message;
    return this.queryOllama(prompt, systemPrompt);
  }
}
