import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CaseAccessGuard } from './case-access.guard';
import { CaseAccessService } from './case-access.service';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Role } from '@defensoria/shared';

describe('CaseAccessGuard (Fix 4: Guard real CanActivate)', () => {
  let guard: CaseAccessGuard;
  let caseAccessService: CaseAccessService;

  const createMockContext = (params: Record<string, string>, user: any) => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ params, user }),
      }),
    } as unknown as ExecutionContext;
    return context;
  };

  beforeEach(async () => {
    const mockCaseAccessService = {
      assertUserHasAccess: vi.fn().mockResolvedValue(undefined),
    };

    guard = new CaseAccessGuard(mockCaseAccessService as any);
    caseAccessService = mockCaseAccessService;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('debería permitir acceso a ADMINISTRADOR sin caseId en params', async () => {
    const context = createMockContext({}, { id: 'user-1', role: Role.ADMINISTRADOR });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(caseAccessService.assertUserHasAccess).not.toHaveBeenCalled();
  });

  it('debería permitir acceso a JEFATURA sin caseId en params', async () => {
    const context = createMockContext({}, { id: 'user-1', role: Role.JEFATURA });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('debería permitir acceso a SECRETARIA sin caseId en params', async () => {
    const context = createMockContext({}, { id: 'user-1', role: Role.SECRETARIA });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
  });

  it('debería DENEGAR acceso a ABOGADO sin caseId en params', async () => {
    const context = createMockContext({}, { id: 'user-1', role: Role.ABOGADO });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('debería DENEGAR acceso a PSICOLOGO sin caseId en params', async () => {
    const context = createMockContext({}, { id: 'user-1', role: Role.PSICOLOGO });
    await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
  });

  it('debería validar acceso con caseId vía params.caseId', async () => {
    const context = createMockContext({ caseId: 'case-123' }, { id: 'user-1', role: Role.ABOGADO });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(caseAccessService.assertUserHasAccess).toHaveBeenCalledWith('case-123', expect.objectContaining({ role: Role.ABOGADO }));
  });

  it('debería validar acceso con caseId vía params.id (fallback)', async () => {
    const context = createMockContext({ id: 'case-456' }, { id: 'user-1', role: Role.PSICOLOGO });
    const result = await guard.canActivate(context);
    expect(result).toBe(true);
    expect(caseAccessService.assertUserHasAccess).toHaveBeenCalledWith('case-456', expect.objectContaining({ role: Role.PSICOLOGO }));
  });

  it('debería propagar ForbiddenException si assertUserHasAccess lanza', async () => {
    const mockService = { assertUserHasAccess: vi.fn().mockRejectedValue(new ForbiddenException('No acceso')) };
    const guardWithMock = new CaseAccessGuard(mockService as any);
    const context = createMockContext({ caseId: 'case-1' }, { id: 'user-1', role: Role.ABOGADO });
    await expect(guardWithMock.canActivate(context)).rejects.toThrow(ForbiddenException);
  });
});