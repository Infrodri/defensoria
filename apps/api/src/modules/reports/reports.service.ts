import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportType, ReportStatus, RiskLevel, Role, RoleInCase, Phase } from '@defensoria/shared';
import { RAGService } from '../knowledge/rag.service';
import { EvidenceRagService } from '../evidences/evidence-rag.service';
import { AccessUser } from '../../common/case-access/case-access.service';

export interface CreateReportDto {
  caseId: string;
  reportType: ReportType;
  title: string;
  content: string;
  riskAssessment?: RiskLevel;
}

@Injectable()
export class ReportsService {
  constructor(
    private prisma: PrismaService,
    private ragService: RAGService,
    private evidenceRag: EvidenceRagService,
  ) {}

  private checkReportRolePermission(reportType: ReportType, userRole: Role) {
    if (userRole === Role.JEFATURA || userRole === Role.ADMINISTRADOR) return; // Jefatura / Admin can manage all

    if (reportType === ReportType.INFORME_PSICOLOGICO && userRole !== Role.PSICOLOGO) {
      throw new ForbiddenException('Solo el área de Psicología puede redactar informes psicológicos');
    }

    if (reportType === ReportType.INFORME_SOCIAL && userRole !== Role.SOCIAL) {
      throw new ForbiddenException('Solo el área de Trabajo Social puede redactar informes sociales');
    }

    if (reportType === ReportType.INFORME_JURIDICO && userRole !== Role.ABOGADO) {
      throw new ForbiddenException('Solo el área Legal (Abogado/a) puede redactar informes jurídicos');
    }

    if (reportType === ReportType.INFORME_SESION_SEGUIMIENTO) {
      if (userRole !== Role.PSICOLOGO && userRole !== Role.SOCIAL && userRole !== Role.ABOGADO) {
        throw new ForbiddenException('Solo los profesionales intervinientes pueden redactar informes de sesión de seguimiento');
      }
    }

    if (reportType === ReportType.INFORME_FINAL_CONCILIACION) {
      if (userRole !== Role.PSICOLOGO && userRole !== Role.SOCIAL && userRole !== Role.ABOGADO) {
        throw new ForbiddenException('Solo los profesionales del equipo pueden emitir el informe final de conciliación');
      }
    }
  }

  async create(dto: CreateReportDto, authorId: string, authorRole: Role) {
    this.checkReportRolePermission(dto.reportType, authorRole);

    const existingCase = await this.prisma.case.findUnique({ where: { id: dto.caseId } });
    if (!existingCase) {
      throw new NotFoundException('Expediente no encontrado');
    }

    // FIX 3 (Fase 0): snapshot de rol y disciplina VIGENTES del autor al momento
    // de crear el informe. Antes authorRoleSnapshot / authorDisciplineSnapshot
    // nunca se escribían. Fuente canónica de disciplina: user.discipline.name.
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: {
        role: true,
        discipline: { select: { name: true } },
      },
    });

    return this.prisma.report.create({
      data: {
        caseId: dto.caseId,
        authorId,
        reportType: dto.reportType,
        title: dto.title,
        content: dto.content,
        riskAssessment: dto.riskAssessment || null,
        status: ReportStatus.BORRADOR,
        version: 1,
        authorRoleSnapshot: author?.role ?? null,
        authorDisciplineSnapshot: author?.discipline?.name ?? null,
      },
    });
  }

  async emit(id: string, authorId: string) {
    const report = await this.prisma.report.findUnique({ where: { id } });
    if (!report) {
      throw new NotFoundException('Informe no encontrado');
    }

    if (report.authorId !== authorId) {
      throw new ForbiddenException('Solo el autor original del informe puede emitirlo');
    }

    if (report.status === ReportStatus.EMITIDO) {
      throw new BadRequestException('Este informe ya ha sido emitido previamente y está congelado');
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Freeze report status
      const emittedReport = await tx.report.update({
        where: { id },
        data: {
          status: ReportStatus.EMITIDO,
          emittedAt: new Date(),
        },
      });

      // 2. If Psychology report evaluated risk, update Case riskLevel automatically!
      if (report.reportType === ReportType.INFORME_PSICOLOGICO && report.riskAssessment) {
        await tx.case.update({
          where: { id: report.caseId },
          data: {
            riskLevel: report.riskAssessment,
          },
        });
      }

      // 3. Handle Session Tracking (INFORME_SESION_SEGUIMIENTO)
      if (report.reportType === ReportType.INFORME_SESION_SEGUIMIENTO) {
        const activeAssignment = await tx.caseTeamHistory.findFirst({
          where: {
            caseId: report.caseId,
            userId: authorId,
            endDate: null,
          },
        });

        if (activeAssignment) {
          const newCompleted = activeAssignment.completedSessions + 1;
          const isFinished = newCompleted >= activeAssignment.requiredSessions;
          await tx.caseTeamHistory.update({
            where: { id: activeAssignment.id },
            data: {
              completedSessions: newCompleted,
              isInterventionFinished: isFinished,
            },
          });
        }
      }

      // 4. Handle Conciliation Closure (INFORME_FINAL_CONCILIACION)
      if (report.reportType === ReportType.INFORME_FINAL_CONCILIACION) {
        await tx.case.update({
          where: { id: report.caseId },
          data: {
            isClosed: true,
            closedAt: new Date(),
            closedBy: authorId,
            closureReason: 'Cierre por Informe Final de Conciliación',
            currentPhase: 'CIERRE' as any,
            currentInterventionPath: 'CONCILIACION' as any,
          },
        });

        await tx.actionLog.create({
          data: {
            caseId: report.caseId,
            authorId,
            actionType: 'NOTA' as any,
            title: 'Cierre por Conciliación',
            content: 'El caso ha sido cerrado exitosamente tras la emisión del Informe Final de Conciliación.',
            isSigned: true,
            signedAt: new Date(),
          },
        });
      }

      // 5. Automatic Phase Promotion: EVALUACION -> SEGUIMIENTO
      const currentCase = await tx.case.findUnique({
        where: { id: report.caseId },
        select: { id: true, currentPhase: true },
      });

      if (currentCase && (currentCase.currentPhase as string) === 'EVALUACION') {
        const activeTeam = await tx.caseTeamHistory.findMany({
          where: {
            caseId: report.caseId,
            endDate: null,
          },
        });

        if (activeTeam.length > 0) {
          const initialReports = await tx.report.findMany({
            where: {
              caseId: report.caseId,
              status: ReportStatus.EMITIDO,
              reportType: {
                in: [
                  ReportType.INFORME_SOCIAL,
                  ReportType.INFORME_PSICOLOGICO,
                  ReportType.INFORME_JURIDICO,
                  ReportType.INFORME_PSICOSOCIAL,
                ],
              },
            },
            select: { authorId: true, authorRoleSnapshot: true },
          });

          const authorsWhoEmitted = new Set(initialReports.map((r) => r.authorId));
          const allAssignedEmitted = activeTeam.every((member) => authorsWhoEmitted.has(member.userId));

          if (allAssignedEmitted) {
            await tx.case.update({
              where: { id: report.caseId },
              data: {
                currentPhase: 'SEGUIMIENTO' as any,
              },
            });

            await tx.actionLog.create({
              data: {
                caseId: report.caseId,
                authorId,
                actionType: 'DERIVACION' as any,
                title: 'Transición Automática a SEGUIMIENTO',
                content: 'Se ha avanzado automáticamente la fase del caso a SEGUIMIENTO tras la emisión de los informes iniciales de todos los profesionales asignados.',
                isSigned: true,
                signedAt: new Date(),
              },
            });
          }
        }
      }

      return emittedReport;
    });
  }

  async createComplementary(parentReportId: string, content: string, title: string, authorId: string, authorRole: Role) {
    const parent = await this.prisma.report.findUnique({ where: { id: parentReportId } });
    if (!parent) {
      throw new NotFoundException('Informe original no encontrado');
    }

    if (parent.status !== ReportStatus.EMITIDO) {
      throw new BadRequestException('Solo se pueden crear informes complementarios sobre informes ya EMITIDOS');
    }

    this.checkReportRolePermission(parent.reportType as unknown as ReportType, authorRole);

    // FIX 3 (Fase 0): mismo snapshot de rol/disciplina vigentes que en create,
    // para que ningún Report se persista sin estos campos.
    const author = await this.prisma.user.findUnique({
      where: { id: authorId },
      select: {
        role: true,
        discipline: { select: { name: true } },
      },
    });

    return this.prisma.report.create({
      data: {
        caseId: parent.caseId,
        authorId,
        reportType: parent.reportType,
        version: parent.version + 1,
        parentReportId: parent.id,
        title: title || `Complementario v${parent.version + 1} - ${parent.title}`,
        content,
        status: ReportStatus.BORRADOR,
        authorRoleSnapshot: author?.role ?? null,
        authorDisciplineSnapshot: author?.discipline?.name ?? null,
      },
    });
  }

  async findByCaseForRole(caseId: string, userRole: Role) {
    const reports = await this.prisma.report.findMany({
      where: { caseId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
        parentReport: { select: { id: true, title: true, version: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Si es SECRETARIA, filtrar solo metadata (no contenido)
    if (userRole === Role.SECRETARIA) {
      return reports.map((report) => ({
        id: report.id,
        caseId: report.caseId,
        reportType: report.reportType,
        status: report.status,
        version: report.version,
        title: report.title,
        createdAt: report.createdAt,
        author: report.author,
        parentReport: report.parentReport,
        // NO: content, riskAssessment
      }));
    }

    // Para otros roles, retornar completo
    return reports;
  }

  async findByCase(caseId: string) {
    return this.prisma.report.findMany({
      where: { caseId },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, role: true } },
        parentReport: { select: { id: true, title: true, version: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async generateDraft(caseId: string, reportType: ReportType, userRole: Role) {
    this.checkReportRolePermission(reportType, userRole);

    const caseData = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: {
        parties: { include: { person: true } },
      },
    });

    if (!caseData) {
      throw new NotFoundException('Expediente no encontrado');
    }

    const nna = caseData.parties.find((p) => p.isPrimary || p.roleInCase === 'NNA')?.person;
    const nnaName = nna ? `${nna.firstName} ${nna.lastName}` : 'NNA Titular';

    // ── 1. RAG del expediente: evidencia específica de ESTE caso ───────────
    //    Busca en case_chunks WHERE caseId = X (transcripciones, fotos,
    //    PDFs, informes previos, actuaciones). NUNCA mezcla con otros casos.
    const reportTypeLabel = {
      [ReportType.INFORME_JURIDICO]: 'informe jurídico legal',
      [ReportType.INFORME_PSICOLOGICO]: 'informe psicológico clínico',
      [ReportType.INFORME_SOCIAL]: 'informe social familiar',
    }[reportType] || 'informe profesional';

    const caseContext = await this.evidenceRag.searchCaseContext(
      caseId,
      `Evidencia relevante para ${reportTypeLabel}: hechos, testimonios, indicadores, hallazgos`,
      10,
    );

    // ── 2. RAG general: base de conocimiento legal compartida ─────────────
    //    Busca en legal_chunks (Ley 548, Código Penal, memoriales modelo,
    //    normativas, libros). Compartido entre todos los casos.
    const legalQuery = {
      [ReportType.INFORME_JURIDICO]: 'procedimiento legal protección niñez adolescencia medidas legales memorial',
      [ReportType.INFORME_PSICOLOGICO]: 'evaluación psicológica indicadores trauma riesgo niñez protección',
      [ReportType.INFORME_SOCIAL]: 'evaluación social vulnerabilidad familiar vivienda riesgo ambiental niñez',
    }[reportType] || 'informe profesional defensoría niñez';

    let legalContext = '';
    try {
      const legalChunks = await this.ragService.searchSimilarChunks(legalQuery, 5);
      legalContext = this.ragService.buildRAGContext(legalChunks);
    } catch {
      // Si no hay base de conocimiento legal cargada, continuamos sin ella
      legalContext = '';
    }

    // ── 3. Construir prompt con ambas capas ───────────────────────────────
    let structureInstructions = '';
    let defaultTitle = '';

    if (reportType === ReportType.INFORME_JURIDICO) {
      defaultTitle = `Informe Jurídico de Evaluación - ${caseData.caseCode}`;
      structureInstructions = `Estructura requerida:
1. ANTECEDENTES Y HECHOS RELEVANTES
2. ANÁLISIS DE TIPICIDAD Y ENCUADRE LEGAL (Ley 548 / Código Penal)
3. VALORACIÓN DE VIABILIDAD Y MEDIDAS LEGALES RECOMENDADAS
4. CONCLUSIONES Y PASOS SIGUIENTES (Conciliación vs Vía Judicial)`;
    } else if (reportType === ReportType.INFORME_PSICOLOGICO) {
      defaultTitle = `Informe Psicológico Inicial - ${caseData.caseCode}`;
      structureInstructions = `Estructura requerida:
1. MOTIVO DE EVALUACIÓN Y DESCRIPCIÓN DE LA CONDUCTA
2. INDICADORES DE TRAUMA Y AFECTACIÓN EMOCIONAL IDENTIFICADOS
3. VALORACIÓN DE RIESGO Y FACTORES PROTECTORES
4. RECOMENDACIONES TERAPÉUTICAS Y PLAN DE INTERVENCIÓN`;
    } else if (reportType === ReportType.INFORME_SOCIAL) {
      defaultTitle = `Informe Social de Evaluación - ${caseData.caseCode}`;
      structureInstructions = `Estructura requerida:
1. COMPOSICIÓN Y DINÁMICA SOCIOFAMILIAR
2. SITUACIÓN VIVIENDA, ECONÓMICA Y HABITACIONAL
3. FACTORES DE VULNERABILIDAD Y RIESGO AMBIENTAL
4. DIAGNÓSTICO SOCIAL Y RECOMENDACIONES DE INTERVENCIÓN`;
    } else {
      defaultTitle = `Informe de Seguimiento - ${caseData.caseCode}`;
      structureInstructions = `Redactá un informe de seguimiento profesional estructurado.`;
    }

    const systemPrompt = `Sos un profesional perito de la Defensoría de la Niñez y Adolescencia de Bolivia (Ley 548).
Generá un borrador profesional de ${reportTypeLabel.toUpperCase()} en español para el expediente ${caseData.caseCode} sobre el NNA ${nnaName}.

${structureInstructions}

REGLAS ESTRICTAS:
- Basá tu análisis SOLO en la evidencia del expediente y el marco legal proporcionado.
- NO inventés hechos, testimonios ni datos que no estén en el contexto.
- Si la evidencia es insuficiente, indicalo explícitamente como "Pendiente de mayor documentación".
- Este es un BORRADOR que el profesional revisará y completará.`;

    const userPrompt = `
=== NARRATIVA INICIAL DEL CASO ===
${caseData.intakeNarrative || 'Sin narrativa de ingesta registrada.'}

=== EVIDENCIA PROCESADA DEL EXPEDIENTE (transcripciones, fotos, documentos, informes previos) ===
${caseContext || 'No hay evidencia procesada aún para este expediente.'}

=== BASE DE CONOCIMIENTO LEGAL (Ley 548, normativas, modelos) ===
${legalContext || 'No hay documentos legales cargados en la base de conocimiento.'}

Generá el ${reportTypeLabel} estructurado completo para el caso ${caseData.caseCode}.`;

    try {
      const generatedContent = await this.ragService.queryOllama(systemPrompt, userPrompt);

      return {
        title: defaultTitle,
        content: generatedContent,
        riskAssessment: caseData.riskLevel || null,
      };
    } catch (err: any) {
      throw new BadRequestException(
        'No se pudo conectar con la IA local (Ollama) para generar el borrador. Podés redactar el informe manualmente.',
      );
    }
  }

  // =========================================================================
  // GET /reports/filtrar
  // Filtra expedientes por CI / nombre / apellido del NNA, devuelve casos +
  // estadísticas + profesionales con carga de trabajo.
  // RBAC: ADMINISTRADOR ve todo; JEFATURA filtra por su oficina.
  // =========================================================================
  async filtrarExpedientes(query: any, user: AccessUser) {
    const { ci, nombre, apellido, rol, oficina } = query;

    // --- 1. Construir where clause para Person ---
    const personWhere: any = {};
    if (ci) {
      personWhere.OR = [
        { documentNumber: { equals: ci } },
        { documentNumber: { equals: ci.replace(/\D/g, '') } }, // normalizar sin puntos/guiones
      ];
    }
    if (nombre) {
      personWhere.AND = personWhere.AND || [];
      personWhere.AND.push({
        firstName: { contains: nombre, mode: 'insensitive' },
      });
    }
    if (apellido) {
      personWhere.AND = personWhere.AND || [];
      personWhere.AND.push({
        lastName: { contains: apellido, mode: 'insensitive' },
      });
    }

    // --- 2. Buscar personas que coinciden ---
    const matchingPersons = Object.keys(personWhere).length === 0
      ? null // si no hay filtro de persona, buscamos todos los casos
      : await this.prisma.person.findMany({ where: personWhere, select: { id: true } });

    // --- 3. Construir where clause para Cases ---
    const caseWhere: any = {};

    // Filtrar por oficina (JEFATURA solo ve su oficina)
    if (user.role === Role.JEFATURA) {
      const targetOfficeId = oficina || user.officeId;
      if (targetOfficeId) {
        caseWhere.currentOfficeId = targetOfficeId;
      }
    } else if (user.role === Role.ADMINISTRADOR && oficina) {
      caseWhere.currentOfficeId = oficina;
    }

    // Si hay filtro de persona, solo incluir casos que tengan al NNA como party
    if (matchingPersons && matchingPersons.length > 0) {
      const personIds = matchingPersons.map((p) => p.id);
      caseWhere.parties = {
        some: {
          personId: { in: personIds },
          roleInCase: RoleInCase.NNA,
        },
      };
    }

    // --- 4. Buscar casos ---
    const cases = await this.prisma.case.findMany({
      where: caseWhere,
      orderBy: { createdAt: 'desc' },
      include: {
        parties: {
          where: { roleInCase: RoleInCase.NNA },
          include: { person: true },
        },
        currentOffice: { select: { name: true, code: true } },
        teamHistory: {
          where: { endDate: null },
          include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
        },
      },
    });

    // --- 5. Formatear casos ---
    const casosFormateados = cases.map((c) => {
      const nnaParty = c.parties[0];
      const nna = nnaParty?.person || null;
      return {
        id: c.id,
        caseCode: c.caseCode,
        caseType: c.caseType,
        currentPhase: c.currentPhase,
        riskLevel: c.riskLevel,
        isClosed: c.isClosed,
        createdAt: c.createdAt,
        nna: nna
          ? {
              id: nna.id,
              firstName: nna.firstName,
              lastName: nna.lastName,
              birthDate: nna.birthDate,
              gender: nna.gender,
              documentNumber: nna.documentNumber,
            }
          : null,
      };
    });

    // --- 6. Calcular estadísticas ---
    const estadisticas = {
      totalCasos: casosFormateados.length,
      porTipificacion: {} as Record<string, number>,
      porGenero: { FEMENINO: 0, MASCULINO: 0, OTRO: 0 } as Record<string, number>,
      porRangoEdad: {
        '0_5': 0,
        '6_11': 0,
        '12_17': 0,
        '18_24': 0,
        '25_mas': 0,
      } as Record<string, number>,
    };

    for (const caso of casosFormateados) {
      // Tipificación
      const tipo = caso.caseType || 'SIN_TIPIFICACION';
      estadisticas.porTipificacion[tipo] = (estadisticas.porTipificacion[tipo] || 0) + 1;

      // Género + rango de edad
      if (caso.nna) {
        const genero = caso.nna.gender || 'OTRO';
        if (genero in estadisticas.porGenero) {
          estadisticas.porGenero[genero]++;
        } else {
          estadisticas.porGenero['OTRO']++;
        }

        if (caso.nna.birthDate) {
          const age = new Date().getFullYear() - new Date(caso.nna.birthDate).getFullYear();
          const rango = age <= 5 ? '0_5'
            : age <= 11 ? '6_11'
            : age <= 17 ? '12_17'
            : age <= 24 ? '18_24'
            : '25_mas';
          estadisticas.porRangoEdad[rango]++;
        }
      }
    }

    // --- 7. Profesionales con carga ---
    let profesionalesWhere: any = {};
    if (user.role === Role.JEFATURA && user.officeId && !oficina) {
      profesionalesWhere.officeId = user.officeId;
    }

    const usuarios = await this.prisma.user.findMany({
      where: {
        role: { in: [Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL] },
        isActive: true,
        ...(user.role === Role.JEFATURA && user.officeId && !oficina
          ? { officeId: user.officeId }
          : {}),
        ...(oficina ? { officeId: oficina } : {}),
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        role: true,
        officeId: true,
      },
    });

    const profesionales = [];
    for (const u of usuarios) {
      // Contar casos activos/inactivos del profesional
      const [totalActivos, casosCerrados, casosRechazados] = await Promise.all([
        this.prisma.caseTeamHistory.count({
          where: { userId: u.id, endDate: null },
        }),
        this.prisma.case.count({
          where: {
            teamHistory: { some: { userId: u.id, endDate: { not: null } } },
            isClosed: true,
          },
        }),
        this.prisma.case.count({
          where: {
            teamHistory: {
              some: { userId: u.id },
            },
            currentPhase: Phase.CIERRE,
            isClosed: false,
          },
        }),
      ]);

      if (rol && u.role !== rol) continue;

      profesionales.push({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        officeId: u.officeId,
        stats: {
          totalAsignados: totalActivos,
          enCurso: totalActivos,
          cerrados: casosCerrados,
          rechazados: casosRechazados,
        },
      });
    }

    return {
      casos: casosFormateados,
      estadisticas,
      profesionales,
    } as any;
  }
}
