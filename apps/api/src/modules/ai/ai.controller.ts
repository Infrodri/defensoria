import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { Role } from '@defensoria/shared';
import { AiService, DraftSectionDto, DraftSectionResponse } from './ai.service';

@ApiTags('IA Local - Copiloto Jurídico')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ABOGADO, Role.PSICOLOGO, Role.SOCIAL, Role.JEFATURA, Role.ADMINISTRADOR)
@Controller('ai')
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly caseAccessService: CaseAccessService,
  ) {}

  @Post('draft-section')
  @ApiOperation({ summary: 'Generar borrador de sección con IA usando RAG del caso y base legal' })
  async draftSection(
    @Body() dto: DraftSectionDto,
    @CurrentUser() user: any,
  ): Promise<DraftSectionResponse> {
    // Validación de acceso al expediente: el caseId viaja en el body, por lo que
    // el CaseAccessGuard (que lee params) no aplica aquí; validamos server-side
    // contra la membresía activa del usuario al equipo del caso.
    await this.caseAccessService.assertUserHasAccess(dto.caseId, user);
    return this.aiService.draftSection(dto);
  }
}
