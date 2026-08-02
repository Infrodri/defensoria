import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SocialIntakeService, CreateSocialIntakeDto } from './social-intake.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('SocialIntake')
@Controller('api/social-intake')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SocialIntakeController {
  constructor(private readonly socialIntakeService: SocialIntakeService) {}

  @Post(':caseId/create')
  @ApiOperation({ summary: 'Crear ficha social para un caso en fase DERIVACION' })
  async create(
    @Param('caseId') caseId: string,
    @Body() dto: CreateSocialIntakeDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.socialIntakeService.createIntakeForm(caseId, userId, dto);
  }

  @Post(':formId/complete')
  @ApiOperation({ summary: 'Completar ficha social y avanzar el caso a EVALUACION' })
  async complete(@Param('formId') formId: string, @CurrentUser('id') userId: string) {
    return this.socialIntakeService.completeIntakeForm(formId, userId);
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Obtener ficha social de un caso' })
  async getByCase(@Param('caseId') caseId: string) {
    return this.socialIntakeService.getIntakeFormByCaseId(caseId);
  }
}