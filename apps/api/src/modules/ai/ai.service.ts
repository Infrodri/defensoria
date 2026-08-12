import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';
import { RAGService } from '../knowledge/rag.service';
import { EvidenceRagService } from '../evidences/evidence-rag.service';
import { DocumentTemplate } from '@prisma/client';

export class DraftSectionDto {
  @IsString()
  @IsNotEmpty()
  caseId: string;

  @IsString()
  @IsNotEmpty()
  templateCode: string;

  @IsString()
  @IsNotEmpty()
  sectionKey: string;
}

export interface DraftSectionResponse {
  suggestedContent: string;
  citations: string[];
}

interface SectionPrompt {
  template?: string;
  ragQuery?: string;
  ragInstruction?: string;
  systemPrompt?: string;
}

/**
 * Normaliza el promptTemplate de una sección: el seed guarda un string crudo
 * (formato legacy con placeholders {caseContext}/{ragContext}), mientras que
 * las plantillas creadas por API pueden guardar un objeto {template, ragQuery,
 * ragInstruction, systemPrompt}. Ambos shapes se soportan.
 */
function normalizePrompt(promptTemplate: unknown): SectionPrompt {
  if (typeof promptTemplate === 'string') {
    return { template: promptTemplate };
  }
  if (promptTemplate && typeof promptTemplate === 'object') {
    return promptTemplate as SectionPrompt;
  }
  return {};
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RAGService,
    private readonly evidenceRag: EvidenceRagService,
  ) {}

  async draftSection(dto: DraftSectionDto): Promise<DraftSectionResponse> {
    const { caseId, templateCode, sectionKey } = dto;

    // 1. Obtener plantilla base
    const template = await this.prisma.documentTemplate.findUnique({
      where: { code: templateCode },
    });

    if (!template) {
      throw new BadRequestException(`Plantilla ${templateCode} no encontrada`);
    }

    const section = (template.structure as any).sections?.find(
      (s: any) => s.key === sectionKey,
    );

    if (!section) {
      throw new BadRequestException(`Sección ${sectionKey} no encontrada en plantilla ${templateCode}`);
    }

    const prompt = normalizePrompt(section.promptTemplate);

    // 2. Contexto RAG del caso (evidencias, transcripciones, informes previos)
    const caseContext = await this.evidenceRag.searchCaseContext(caseId, prompt.ragQuery || '', 8);

    // 3. Contexto RAG legal (Ley 548, códigos, jurisprudencia)
    const legalContext = await this.ragService.searchSimilarChunks(prompt.ragQuery || '', 5);

    // 4. Construir prompt completo con formato procesal boliviano
    const fullPrompt = this.buildBolivianLegalPrompt(section, prompt, caseContext, legalContext);

    // 5. Invocar Ollama local
    const suggestedContent = await this.callOllama(fullPrompt, prompt.systemPrompt);

    // 6. Extraer citas
    const citations = this.extractCitations(legalContext);

    return {
      suggestedContent,
      citations,
    };
  }

  private buildBolivianLegalPrompt(
    section: any,
    prompt: SectionPrompt,
    caseContext: string,
    legalContext: Array<{ content: string; documentTitle: string }>,
  ): string {
    const ragLegal = legalContext
      .map((c, i) => `[Fuente Legal ${i + 1}: ${c.documentTitle}]\n${c.content}`)
      .join('\n---\n');

    const ragCase = caseContext ? `\n[CONTEXTO DEL EXPEDIENTE]\n${caseContext}` : '';

    const sectionInstruction = prompt.template || '';

    // Reemplaza placeholders legacy si el template crudo los contiene
    let sectionPrompt = sectionInstruction
      .replaceAll('{caseContext}', caseContext || '')
      .replaceAll('{ragContext}', ragLegal);

    const ragInstruction = prompt.ragInstruction || 'Use solo información verificada del expediente y base legal.';

    if (!sectionPrompt.includes('[RAG-INSTRUCTION]') && ragInstruction) {
      sectionPrompt += `\n[RAG-INSTRUCTION]: ${ragInstruction}`;
    }

    return `
${ragLegal}
${ragCase}

---
INSTRUCCIONES ESPECÍFICAS DE LA SECCIÓN: ${sectionPrompt}
`.trim();
  }

  private async callOllama(prompt: string, systemPrompt?: string): Promise<string> {
    const endpointSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_ENDPOINT' },
    });
    const modelSetting = await this.prisma.systemSetting.findUnique({
      where: { key: 'OLLAMA_MODEL' },
    });

    const endpoint = endpointSetting?.value || process.env.OLLAMA_ENDPOINT || 'http://localhost:11434';
    const model = modelSetting?.value || process.env.OLLAMA_MODEL || 'qwen2.5:7b';

    try {
      const response = await fetch(`${endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt,
          system: systemPrompt || this.getBolivianSystemPrompt(),
          stream: false,
          options: {
            temperature: 0.3,
            top_p: 0.9,
          },
        }),
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.trim() || '';
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error llamando Ollama: ${message}`);
      const timeoutHit = error instanceof Error && /abort/i.test(error.message);
      throw new BadRequestException(
        timeoutHit
          ? 'El servicio de IA local (Ollama) no respondió a tiempo. Verifique que Ollama esté corriendo en localhost:11434 con modelo qwen2.5:7b'
          : 'Servicio de IA local (Ollama) no disponible. Verifique que Ollama esté corriendo en localhost:11434 con modelo qwen2.5:7b',
      );
    }
  }

  private getBolivianSystemPrompt(): string {
    return `
ERES EL COPILOTO OFICIAL DE LA DEFENSORÍA DE LA NIÑEZ Y ADOLESCENCIA (DNA) DE SUCRE, BOLIVIA.
RESPONDE SIEMPRE EN ESPAÑOL. Eres un Asistente Jurídico y Psicosocial Especializado bajo el ordenamiento boliviano (Ley Nº 548, Ley 348, Código Penal, CPE). 
⚠️ REGLAS SOBRE ROLES Y MAPA DE ACTORES (<mapa_actores>):
- En el contexto del expediente se proporciona obligatoriamente la etiqueta XML <mapa_actores>.
- Identifica rigurosamente a la víctima en los elementos <victima> y al denunciado o presunto agresor en <denunciado_presunto_agresor>.
- PROHIBIDO alucinar, alterar o invertir los nombres o roles de la víctima y del presunto agresor en el documento.

⚠️ REGLAS ESTRICTAS DE FORMATO PROCESAL BOLIVIANO:
1. NUNCA uses frases de cortesía anglosajonas o informales: "Estimado Señor", "Es un placer", "Atentamente", "Saludos cordiales", "Tengo el honor de dirigirme", "Dear", "Sincerely".
2. NUNCA inventes autoridades genéricas como "Tribunal Judicial de Competencia", "Juez de lo Penal", "Honorable Court".
3. USA SIEMPRE el formato procesal boliviano oficial para MEMORIALES, DICTÁMENES E INFORMES TÉCNICOS:

ESTRUCTURA OBLIGATORIA PARA DOCUMENTOS JURÍDICOS:
- SUMA: [Resumen formal del trámite en una línea]
- AUTORIDAD: SEÑOR FISCAL DE MATERIA DE TURNO EN LO PENAL / SEÑORA JUEZA DE LA NIÑEZ Y ADOLESCENCIA DE SUCRE
- SECCIÓN I: PERSONERÍA Y LEGITIMACIÓN ACTIVA (DNA Sucre, Ley 548 Art. 188)
- SECCIÓN II: RELACIÓN NOMINATIVA DE SUJETOS PROCESALES (NNA Víctima, Denunciado)
- SECCIÓN III: RELACIÓN CIRCUNSTANCIADA DE LOS HECHOS
- SECCIÓN IV: SUBSUNCIÓN JURÍDICA Y TIPICIDAD (Código Penal, Ley 548, Ley 348)
- SECCIÓN V: PETITORIO Y OTROSÍES

ESTRUCTURA OBLIGATORIA PARA INFORMES PSICOSOCIALES/SOCIALES:
- I. IDENTIFICACIÓN Y DATOS DE REFERENCIA
- II. MARCO NORMATIVO Y METODOLÓGICO (Ley 548, Ley 348, Convención CDN)
- III. ANÁLISIS SITUACIONAL / EXPLORACIÓN PSICOLÓGICA-SOCIAL
- IV. DIAGNÓSTICO INTEGRADO (RIESGO: ALTO/MEDIO/BAJO según Ley 548 Art. 14)
- V. PLAN DE INTERVENCIÓN / RECOMENDACIONES (Art. 50 Ley 548)
- VI. FIRMAS DE PROFESIONALES RESPONSABLES (y coautor si corresponde)

4. Cita artículos EXACTOS con numeración boliviana: "Art. 548", "Art. 311 CP", "Art. 15 Ley 348", "Art. 14 Ley 548".
5. Terminología técnico-jurídica boliviana obligatoria: "subsunción", "tipicidad", "antijuridicidad", "culpabilidad", "personería", "legitimación activa", "NNA", "DNA", "FELCC", "SLIM", "Defensoría".
6. Niveles de riesgo: ALTO / MEDIO / BAJO (Ley 548 Art. 14).
7. Cierre formal: "Por lo expuesto, SOLICITA:" seguido de petitorio numerado.
8. Otrosíes: "OTROSÍ: Señala domicilio procesal en..." / "OTROSÍ: Ofrece prueba..."

Ejemplo de apertura correcta MEMORIAL:
"SUMA: Memorial de denuncia penal por el delito de violencia familiar en perjuicio de NNA.
SEÑOR FISCAL DE MATERIA DE TURNO EN LO PENAL:
PRESENTE."

Ejemplo de apertura correcta INFORME PSICOSOCIAL:
"I. IDENTIFICACIÓN Y DATOS DE REFERENCIA
NNA: [nombre], CI: [número], Expediente: DNA-2026-XXXX
Profesionales intervinientes: Psic. [nombre], T.S. [nombre]"

NO generes contenido conversacional, saludos informales, ni contenido en inglés. Solo el documento técnico solicitado en español boliviano.
`.trim();
  }

  private extractCitations(legalContext: Array<{ content: string; documentTitle: string }>): string[] {
    return legalContext.slice(0, 5).map(c => c.documentTitle);
  }
}
