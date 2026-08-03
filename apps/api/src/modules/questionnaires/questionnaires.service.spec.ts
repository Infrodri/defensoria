import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionnairesService } from './questionnaires.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Role } from '@defensoria/shared';
import { QuestionnaireCategory, QuestionType } from '@prisma/client';

describe('QuestionnairesService Integration Tests', () => {
  let questionnairesService: QuestionnairesService;
  let caseAccessService: CaseAccessService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      questionnaireTemplate: {
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn().mockResolvedValue({
          id: 'template-1',
          category: QuestionnaireCategory.LEGAL,
          questions: [{ id: 'q1', questionType: QuestionType.TEXT }],
        }),
        create: vi.fn().mockResolvedValue({ id: 'template-new' }),
      },
      question: {
        findMany: vi.fn().mockResolvedValue([{ id: 'q1' }]),
      },
      questionnaireResponse: {
        create: vi.fn().mockResolvedValue({ id: 'resp-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionnairesService,
        { provide: PrismaService, useValue: prismaMock },
        { 
          provide: CaseAccessService, 
          useValue: { assertUserHasAccess: vi.fn() } 
        },
      ],
    }).compile();

    questionnairesService = module.get<QuestionnairesService>(QuestionnairesService);
    caseAccessService = module.get<CaseAccessService>(CaseAccessService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createResponse (Fix 5: sin roles hardcodeados)', () => {
    const userWithRole = (role: Role) => ({ id: 'user-1', role, officeId: 'office-1' });

    it('debería validar acceso con el usuario REAL (su role real), NO fabricar { role: "ABOGADO" }', async () => {
      const dto = { caseId: 'case-1', templateId: 'template-1', answers: [{ questionId: 'q1', value: 'test' }] };
      const realUser = userWithRole(Role.SOCIAL); // rol real del usuario

      await questionnairesService.createResponse(dto, realUser);

      // assertUserHasAccess debe recibir el usuario REAL con su role real
      expect(caseAccessService.assertUserHasAccess).toHaveBeenCalledWith('case-1', realUser);
      expect(caseAccessService.assertUserHasAccess).not.toHaveBeenCalledWith(
        'case-1', 
        expect.objectContaining({ role: 'ABOGADO' }) // NO fabricado
      );
    });

    it('debería funcionar con cualquier rol válido (ABOGADO, PSICOLOGO, SOCIAL, etc.)', async () => {
      const dto = { caseId: 'case-1', templateId: 'template-1', answers: [{ questionId: 'q1', value: 'test' }] };

      for (const role of [Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.SECRETARIA]) {
        vi.clearAllMocks();
        const user = userWithRole(role);
        await expect(questionnairesService.createResponse(dto, user)).resolves.toBeDefined();
        expect(caseAccessService.assertUserHasAccess).toHaveBeenCalledWith('case-1', user);
      }
    });

    it('debería rechazar pregunta inválida (BadRequestException)', async () => {
      vi.mocked(prisma.question.findMany).mockResolvedValue([{ id: 'q1' }]);
      const dto = { caseId: 'case-1', templateId: 'template-1', answers: [{ questionId: 'q-inexistente', value: 'test' }] };

      await expect(questionnairesService.createResponse(dto, userWithRole(Role.ABOGADO)))
        .rejects.toThrow(BadRequestException);
    });
  });
});