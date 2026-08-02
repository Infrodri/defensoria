import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionnnaireTemplateDto } from './dto/create-questionnaire-template.dto';
import { CreateResponseDto } from './dto/create-response.dto';
import { CaseAccessService } from '../common/case-access/case-access.service';

@Injectable()
export class QuestionnairesService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  /**
   * Listar cuestionarios disponibles
   */
  async listTemplates(category?: string) {
    return this.prisma.questionnaireTemplate.findMany({
      where: {
        isActive: true,
        ...(category && { category }),
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtener cuestionario con todas sus preguntas
   */
  async getTemplate(templateId: string) {
    const template = await this.prisma.questionnaireTemplate.findUnique({
      where: { id: templateId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Cuestionario no encontrado');
    }

    return template;
  }

  /**
   * Crear nueva plantilla de cuestionario (solo ADMINISTRADOR)
   */
  async createTemplate(dto: CreateQuestionnnaireTemplateDto, userId: string) {
    const template = await this.prisma.questionnaireTemplate.create({
      data: {
        name: dto.name,
        description: dto.description,
        category: dto.category,
        createdBy: userId,
        questions: {
          createMany: {
            data: dto.questions.map((q) => ({
              question: q.question,
              questionType: q.questionType,
              order: q.order,
              required: q.required ?? true,
              options: q.options ?? [],
              riskKeywords: q.riskKeywords ?? [],
            })),
          },
        },
      },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    return template;
  }

  /**
   * Crear respuesta a un cuestionario (vinculada a expediente)
   */
  async createResponse(dto: CreateResponseDto, userId: string) {
    // Validar que el cuestionario existe
    const template = await this.prisma.questionnaireTemplate.findUnique({
      where: { id: dto.templateId },
    });

    if (!template) {
      throw new NotFoundException('Cuestionario no encontrado');
    }

    // Validar acceso al caso
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, userId);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    // Validar que todas las respuestas referencia preguntas válidas
    const questions = await this.prisma.question.findMany({
      where: { templateId: dto.templateId },
    });

    const questionIds = new Set(questions.map((q) => q.id));
    for (const answer of dto.answers) {
      if (!questionIds.has(answer.questionId)) {
        throw new BadRequestException(`Pregunta no encontrada: ${answer.questionId}`);
      }
    }

    // Crear respuesta
    const response = await this.prisma.questionnaireResponse.create({
      data: {
        templateId: dto.templateId,
        caseId: dto.caseId,
        appointmentId: dto.appointmentId,
        respondentId: userId,
        notes: dto.notes,
        status: 'PENDIENTE',
        answers: {
          createMany: {
            data: dto.answers.map((a) => ({
              questionId: a.questionId,
              answer: a.answer,
            })),
          },
        },
      },
      include: {
        answers: true,
        template: {
          include: {
            questions: true,
          },
        },
      },
    });

    return response;
  }

  /**
   * Obtener respuestas completadas a un cuestionario
   */
  async getResponse(responseId: string) {
    const response = await this.prisma.questionnaireResponse.findUnique({
      where: { id: responseId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
        template: {
          include: {
            questions: true,
          },
        },
        respondent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundException('Respuestas no encontradas');
    }

    return response;
  }

  /**
   * Completar cuestionario y ejecutar análisis automático
   */
  async submitResponse(responseId: string) {
    const response = await this.prisma.questionnaireResponse.findUnique({
      where: { id: responseId },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!response) {
      throw new NotFoundException('Respuestas no encontradas');
    }

    // Análisis automático de riesgos
    const riskFlags: string[] = [];
    let riskScore = 0;

    for (const answer of response.answers) {
      const question = answer.question;

      // Buscar palabras clave de riesgo en respuestas
      if (question.riskKeywords && question.riskKeywords.length > 0) {
        const answerLower = answer.answer.toLowerCase();
        for (const keyword of question.riskKeywords) {
          if (answerLower.includes(keyword.toLowerCase())) {
            // Incrementar score por cada coincidencia
            riskScore += 1.5;

            // Agregar flag específico basado en keywords
            if (keyword.includes('abuso')) {
              riskFlags.push('ABUSO_IDENTIFICADO');
            } else if (keyword.includes('negligencia')) {
              riskFlags.push('NEGLIGENCIA_IDENTIFICADA');
            } else if (keyword.includes('hambre') || keyword.includes('desnutrición')) {
              riskFlags.push('MALNUTRICION_RIESGO');
            } else if (keyword.includes('trabajo') || keyword.includes('explotación')) {
              riskFlags.push('EXPLOTACION_INFANTIL');
            } else if (keyword.includes('drogas') || keyword.includes('sustancia')) {
              riskFlags.push('CONSUMO_SUSTANCIAS');
            }
          }
        }
      }
    }

    // Normalizar score entre 0 y 10
    riskScore = Math.min(riskScore, 10);

    // Determinar categoría de riesgo
    let riskCategory = 'BAJO';
    if (riskScore >= 6) {
      riskCategory = 'ALTO';
    } else if (riskScore >= 3) {
      riskCategory = 'MEDIO';
    }

    // Eliminar duplicados en flags
    const uniqueFlags = Array.from(new Set(riskFlags));

    // Actualizar respuesta
    const updated = await this.prisma.questionnaireResponse.update({
      where: { id: responseId },
      data: {
        status: 'COMPLETADA',
        completedAt: new Date(),
        riskScore,
        riskFlags: uniqueFlags,
      },
      include: {
        answers: true,
      },
    });

    // Si hay riesgos identificados, crear notificación
    if (uniqueFlags.length > 0) {
      await this.createRiskNotification(response.caseId, responseId, uniqueFlags, riskScore);
    }

    return updated;
  }

  /**
   * Crear notificación de riesgo identificado
   */
  private async createRiskNotification(
    caseId: string,
    responseId: string,
    riskFlags: string[],
    riskScore: number,
  ) {
    try {
      // Obtener profesionales del caso para notificar
      const caseData = await this.prisma.case.findUnique({
        where: { id: caseId },
        include: {
          teamHistory: {
            where: { endDate: null },
            include: { user: true },
          },
        },
      });

      if (caseData && caseData.teamHistory.length > 0) {
        // Crear notificación para cada miembro del equipo
        for (const team of caseData.teamHistory) {
          await this.prisma.notification.create({
            data: {
              userId: team.user.id,
              caseId,
              type: 'RIESGO_ALTO',
              title: `Alertas Identificadas en Cuestionario`,
              message: `Se identificaron ${riskFlags.length} banderas de riesgo: ${riskFlags.join(', ')}. Score: ${riskScore.toFixed(1)}/10`,
              priority: riskScore >= 8 ? 'CRITICA' : riskScore >= 6 ? 'URGENTE' : 'NORMAL',
            },
          });
        }
      }
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Error creating risk notification:', error);
    }
  }

  /**
   * Listar respuestas de un caso
   */
  async listResponsesByCase(caseId: string) {
    return this.prisma.questionnaireResponse.findMany({
      where: { caseId },
      include: {
        template: true,
        respondent: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cambiar estado de respuesta a REVISADA (por supervisor)
   */
  async markAsReviewed(responseId: string, userId: string) {
    const response = await this.prisma.questionnaireResponse.findUnique({
      where: { id: responseId },
    });

    if (!response) {
      throw new NotFoundException('Respuestas no encontradas');
    }

    // Validar acceso al caso
    try {
      await this.caseAccessService.assertUserHasAccess(response.caseId, userId);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    return this.prisma.questionnaireResponse.update({
      where: { id: responseId },
      data: {
        status: 'REVISADA',
      },
    });
  }
}
