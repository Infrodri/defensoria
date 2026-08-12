import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EvidenceRagService } from '../evidences/evidence-rag.service';
import { RAGService } from '../knowledge/rag.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';

@Injectable()
export class AiAssistantService {
  private readonly logger = new Logger(AiAssistantService.name);

  constructor(
    private prisma: PrismaService,
    private evidenceRag: EvidenceRagService,
    private ragService: RAGService,
    private caseAccessService: CaseAccessService,
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
    const systemPrompt = `Sos un asistente legal experto en la Ley 548 (Código Niña, Niño y Adolescente) de Bolivia.
IMPORTANTE: Respondé SIEMPRE en español. Nunca uses otro idioma.
Tu tarea es redactar un borrador formal de un escrito legal o memorial dirigido a una autoridad competente (ej. Juez de la Niñez y Adolescencia o Fiscal).
Usá lenguaje jurídico formal boliviano. Estructurá el documento con Suma, Autoridad dirigida, Generales de ley (omitir nombres, usar "NNA", "Denunciante"), Relación de hechos, Petitorio y Otrosíes.
Solo usá la información que esté en el contexto proporcionado. Si no hay datos suficientes, indicalo explícitamente en el borrador.
Terminá siempre indicando que es un borrador generado por IA y requiere revisión profesional.`;

    const prompt = `Basado en el siguiente contexto del expediente, redacta un borrador de escrito legal inicial para presentar el caso ante las autoridades correspondientes.
    
Contexto del Expediente:
${caseContext}
`;

    return this.queryOllama(prompt, systemPrompt);
  }

  async analyzeRisk(narrative: string) {
    const systemPrompt = `Sos un trabajador social y psicólogo experto en protección infantil en Bolivia (Ley 548 - Código Niña, Niño y Adolescente).
IMPORTANTE: Respondé SIEMPRE en español. Nunca uses otro idioma.
Tu tarea es analizar la narrativa de una denuncia y extraer de forma objetiva posibles indicadores de vulnerabilidad o riesgo para el NNA.

Reglas estrictas:
- Solo mencioná riesgos que estén EXPLÍCITAMENTE descritos en la narrativa proporcionada
- Si la narrativa no menciona un factor de riesgo específico, NO lo incluyas ni lo infieras
- Si la narrativa está vacía o es muy breve, indicá que no hay suficiente información para el análisis
- No hagas diagnósticos clínicos
- No inventes situaciones que no estén en el texto

Formato de respuesta:
1. Lista de indicadores de riesgo identificados (solo los que aparecen en el texto)
2. Nivel de urgencia sugerido: BAJO / MEDIO / ALTO
3. Recomendación general

Terminá indicando: "Esta es una sugerencia generada por IA local. El dictamen final depende del equipo psicosocial."`;

    const prompt = `Analizá la siguiente narrativa de denuncia e identificá indicadores de riesgo presentes en el texto:

Narrativa:
${narrative || '(Sin narrativa registrada)'}
`;

    return this.queryOllama(prompt, systemPrompt);
  }

  private roleToCategory(role: string): string[] {
    switch (role) {
      case Role.ABOGADO: return ['LEGAL'];
      case Role.PSICOLOGO: return ['PSICOSOCIAL', 'PLANTILLA_INFORME'];
      case Role.SOCIAL: return ['SOCIAL', 'PLANTILLA_INFORME'];
      default: return ['LEGAL', 'PSICOSOCIAL', 'SOCIAL'];
    }
  }

  private buildGeneralSystemPrompt(role: string): string {
    return `Eres el asistente experto de la Defensoría de la Niñez y Adolescencia de Bolivia.
Tu rol es ${role}.
REGLA ESTRICTA DE PRIVACIDAD: Operas en modo general. No tienes acceso a datos de ningún expediente específico. Si el usuario te pregunta por un caso, un NNA, o datos de un expediente puntual, responde categóricamente que esa consulta debe hacerse desde dentro del expediente correspondiente.
INSTRUCCIONES DE ESTRUCTURA Y CITACIÓN:
1. Cita SIEMPRE de manera explícita los títulos de los documentos, normas, planes o protocolos de los cuales extraes la información (ejemplo: [Fuente: Plan de Prevención de Embarazo en Adolescentes GAMS], [Fuente: Ley N° 548]).
2. Desglosa la respuesta de forma clara, detallada y estructurada por ejes de acción (ej: Ámbito Educativo, Ámbito de Salud, Ámbito Social, Ámbito Comunitario) según la información disponible.
3. Responde basándote ÚNICAMENTE en la normativa, planes y plantillas proporcionadas en el contexto. No inventes artículos ni procedimientos no fundamentados.
4. Termina indicando que es una respuesta general generada por IA local.`;
  }

  private buildCaseSystemPrompt(role: string): string {
    return `Eres el asistente de coordinación del equipo interdisciplinario de la Defensoría de la Niñez y Adolescencia de Bolivia.
Tu rol es ${role}.
REGLA ESTRICTA DE AISLAMIENTO DE EXPEDIENTE: Operas exclusivamente dentro del expediente actual. Si la pregunta del usuario menciona o solicita información sobre otro número o código de expediente (ejemplo: 'DNA-2026-0066', 'caso 66'), debes responder rotundamente que solo posees acceso a los datos del expediente actual y que NO tienes información de otros expedientes. JAMÁS atribuyas los datos o nombres del expediente actual a un código de caso distinto mencionado por el usuario.
REGLA SOBRE ROLES (<mapa_actores>): En el contexto del expediente se incluye la etiqueta XML <mapa_actores>. Identifica estrictamente a la víctima en <victima> y al denunciado/presunto agresor en <denunciado_presunto_agresor>. No confundas ni inviertas sus roles.
Responde cruzando los hechos del expediente (contexto del caso) con la normativa vigente aplicable proporcionada (contexto legal).
Cita explícitamente las normas o fuentes legales aplicadas a los hechos.
Usa lenguaje profesional y claro. No inventes datos que no estén en los contextos proporcionados.
Termina indicando que es una respuesta generada por IA local y que la decisión final depende del equipo interdisciplinario.`;
  }

  async chatGeneral(message: string, userRole: string): Promise<string> {
    const legalChunks = await this.ragService.searchSimilarChunks(
      message,
      8,
      // @ts-ignore - categoryHint parameter
      { categoryHint: this.roleToCategory(userRole) },
    );

    const contextText = legalChunks.map(c => `[Fuente Legal: ${c.documentTitle}] ${c.content}`).join('\n\n');

    const prompt = `## Contexto Normativo\n\n${contextText || '(Sin resultados)'}\n\n---\n\n## Pregunta\n\n${message}`;
    const systemPrompt = this.buildGeneralSystemPrompt(userRole);

    return this.queryOllama(prompt, systemPrompt);
  }

  async chatCase(
    message: string,
    caseId: string,
    userId: string,
    userRole: string,
  ): Promise<string> {
    // 1. Validar acceso al expediente en cada request
    await this.caseAccessService.assertUserHasAccess(caseId, { id: userId, role: userRole as any, officeId: null });

    // 2. Extraer digest (resumen)
    let caseDigest = '';
    try {
      caseDigest = await this.evidenceRag.getCaseDigest(caseId);
    } catch (err: any) {
      this.logger.warn(`[AI] No se pudo recuperar digest del expediente ${caseId}: ${err.message}`);
    }

    // 3. Extraer contexto crudo (Evidence RAG)
    let caseContext = '';
    try {
      caseContext = await this.evidenceRag.searchCaseContext(caseId, message, 5);
    } catch (err: any) {
      this.logger.warn(`[AI] No se pudo recuperar contexto del expediente ${caseId}: ${err.message}`);
    }

    // 4. Extraer normativa (Legal RAG)
    const legalChunks = await this.ragService.searchSimilarChunks(message, 5);
    const legalContext = legalChunks.map(c => `[Fuente Legal: ${c.documentTitle}] ${c.content}`).join('\n\n');

    const prompt = `## Resumen del Caso (Digest)\n\n${caseDigest || '(Sin resumen)'}\n\n---\n\n## Contexto del Expediente\n\n${caseContext || '(Sin evidencia)'}\n\n---\n\n## Contexto Normativo\n\n${legalContext || '(Sin normativa)'}\n\n---\n\n## Pregunta del profesional\n\n${message}`;
    
    const systemPrompt = this.buildCaseSystemPrompt(userRole);

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
Si no tienes información suficiente en el contexto para responder, dilo explícitamente.`;

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
