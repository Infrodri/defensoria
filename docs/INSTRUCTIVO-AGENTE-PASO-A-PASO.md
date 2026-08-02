# INSTRUCTIVO TÉCNICO PASO A PASO - PARA AGENTES DESARROLLADORES

**Emitido por**: Líder Técnico / Experto en Desarrollo  
**Para**: Agentes IA que ejecutarán la Fase 2  
**Fecha**: 1 Agosto 2026  
**Objetivo**: Ejecutar TODO paso a paso sin ambigüedades

---

## 📖 ÍNDICE RÁPIDO

- [Lectura Inicial (15 min)](#lectura-inicial)
- [Setup Local (30 min)](#setup-local)
- [Workflow por Agente (diferentes según módulo)](#workflow-por-agente)
- [Implementación Detallada (código exacto)](#implementación-detallada)
- [Testing Paso a Paso](#testing-paso-a-paso)
- [PR y Merge](#pr-y-merge)
- [Troubleshooting](#troubleshooting)

---

## 🎓 LECTURA INICIAL (15 min - OBLIGATORIA)

**Antes de escribir UNA LÍNEA de código**, debes leer en este orden:

### 1. Lee esto PRIMERO (5 min)
```
Archivo: docs/ARQUITECTURA-FINAL-COMPLETA.md
Secciones:
  - 🏗️ CAPAS DE LA ARQUITECTURA (entender stack)
  - 📊 MATRIZ DE FUNCIONALIDADES (qué construimos)
  - 🔐 SEGURIDAD & ACCESO (5 reglas CaseAccessService)
  - 💾 MODELO DE DATOS CONSOLIDADO (qué tablas existen)
```

### 2. Lee tu módulo específico (5 min)
```
Archivo: docs/MODULOS-ESPECIALIZADOS-POR-DISCIPLINA.md
Busca tu sección:
  - ¿Eres BACKEND-LEGAL? → Lee "MÓDULO 1: HERRAMIENTAS PARA ABOGADOS"
  - ¿Eres BACKEND-PSYCH? → Lee "MÓDULO 2: HERRAMIENTAS PARA PSICÓLOGOS"
  - ¿Eres BACKEND-SOCIAL? → Lee "MÓDULO 3: HERRAMIENTAS PARA TRABAJADORES SOCIALES"
  - ¿Eres BACKEND-TRANSVERSAL? → Lee "MÓDULO 4: HERRAMIENTAS TRANSVERSALES"
```

### 3. Entiende tu delegación específica (5 min)
```
Archivo: docs/INSTRUCTIVA-PM-PARA-AGENTES-FASE2.md
Busca tu sección:
  - DELEGACIÓN #1-8 según tu agente
  - Lee TASK, PRECONDITIONS, DELIVERABLES, VALIDATION
```

---

## 🔧 SETUP LOCAL (30 min - HACER UNA SOLA VEZ)

### PASO 1: Verificar ambiente (2 min)

```bash
# Terminal 1: Verificar versiones
node --version       # Debe ser v18+
npm --version       # Debe ser v9+
git --version       # Debe tener Git
docker --version    # Debe tener Docker (si usas Docker local)

# Si algo falla aquí, STOP - instala lo necesario
```

### PASO 2: Clonar/Actualizar repositorio (5 min)

```bash
# Si NO tienes repo local:
git clone https://github.com/[org]/defensoria.git
cd defensoria

# Si YA tienes repo local:
cd defensoria
git fetch origin develop
git pull origin develop          # Obtener cambios Fase 1
git status                       # Debe decir "working tree clean"
```

### PASO 3: Instalar dependencias (10 min)

```bash
# En ROOT del proyecto
npm install

# Verificar que no hay errors (warnings están ok)
# Output debe terminar con: "added X packages"
```

### PASO 4: Setup Prisma (5 min)

```bash
cd packages/db

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones pendientes
npx prisma migrate dev

# Output debe mostrar:
#   ✔ Successfully created a new migration named '[timestamp]_add_...'
#   ✔ Your database is now in sync with your schema.Prisma Client has been updated in .prisma/client

# Verificar que BD está lista
npx prisma studio &   # Abrirá http://localhost:5555
# Cierra el tab cuando verifiques que hay datos

cd ../..  # Volver a root
```

### PASO 5: Verificar compilación (8 min)

```bash
cd apps/api

# Compilar sin emitir (solo check)
npx tsc --noEmit

# Debe terminar con "0 errors"
# Si hay errores, STOP y reporta al PM

# Build completo
npm run build

# Debe terminar exitosamente
cd ../..  # Volver a root
```

---

## 👤 IDENTIFICAR TU AGENTE

**¿Cuál es tu rol?** Encuentra tu sección abajo:

```
SI ERES AGENTE BACKEND-LEGAL:
  ├─ Ve a: WORKFLOW - BACKEND-LEGAL
  └─ Implementar: Legal Tools (3 endpoints)

SI ERES AGENTE BACKEND-PSYCH:
  ├─ Ve a: WORKFLOW - BACKEND-PSYCH
  └─ Implementar: Psychological Tools (4 endpoints)

SI ERES AGENTE BACKEND-SOCIAL:
  ├─ Ve a: WORKFLOW - BACKEND-SOCIAL
  └─ Implementar: Social Tools (3 endpoints)

SI ERES AGENTE BACKEND-TRANSVERSAL:
  ├─ ESPERA a que terminen: BACKEND-LEGAL, BACKEND-PSYCH, BACKEND-SOCIAL
  └─ Luego: WORKFLOW - BACKEND-TRANSVERSAL

SI ERES AGENTE FRONTEND:
  ├─ Ve a: WORKFLOW - FRONTEND
  └─ Implementar: Componentes React

SI ERES AGENTE QA:
  ├─ Ve a: WORKFLOW - QA
  └─ Implementar: 40+ tests E2E
```

---

## 🎯 WORKFLOW - BACKEND-LEGAL

### FASE 1: Preparación (15 min)

**Paso 1.1: Crear rama Git**

```bash
cd defensoria
git status                           # Verificar working tree clean
git checkout develop                 # Cambiar a develop
git pull origin develop              # Obtener último código
git checkout -b feature/legal-tools  # Crear rama NUEVA
git branch                           # Verificar estás en feature/legal-tools
```

**Paso 1.2: Verificar tablas en schema**

```bash
# Abrir archivo
code packages/db/prisma/schema.prisma

# Buscar estas 3 tablas (deben existir):
#   - model DiscrepancyAnalysis
#   - model PenalTypicityAnalysis
#   - model ProcessualDeadline

# Si NO existen, STOP - reporta al PM
# Si existen, continua

# Si las migraciones aún no se ejecutaron:
cd packages/db
npx prisma migrate dev
cd ../..
```

**Paso 1.3: Crear estructura de carpetas**

```bash
# Crear carpeta del módulo
mkdir -p apps/api/src/modules/legal-tools/dto

# Verificar estructura
ls -la apps/api/src/modules/legal-tools/
# Debe mostrar carpeta vacia (o con dto vacia)
```

### FASE 2: Implementar Controlador (20 min)

**Paso 2.1: Crear legal-tools.controller.ts**

```bash
# Abrir editor
code apps/api/src/modules/legal-tools/legal-tools.controller.ts
```

```typescript
// ← COPIAR Y PEGAR EXACTAMENTE

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LegalToolsService } from './legal-tools.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { AnalyzeDiscrepanciesDto } from './dto/analyze-discrepancies.dto';
import { AnalyzeTypicalityDto } from './dto/analyze-typicality.dto';
import { CalculateDeadlineDto } from './dto/calculate-deadline.dto';

@ApiTags('Legal Tools')
@Controller('legal-tools')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LegalToolsController {
  constructor(private readonly legalToolsService: LegalToolsService) {}

  @Post('discrepancies/analyze')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Analizar discrepancias entre testimonios' })
  async analyzeDiscrepancies(
    @Body() dto: AnalyzeDiscrepanciesDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.legalToolsService.analyzeDiscrepancies(dto, userId);
  }

  @Post('typicality/analyze')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Analizar tipicidad penal del relato' })
  async analyzeTypicality(
    @Body() dto: AnalyzeTypicalityDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.legalToolsService.analyzeTypicality(dto, userId);
  }

  @Post('deadlines/calculate')
  @Roles(Role.ABOGADO, Role.ADMINISTRADOR)
  @ApiOperation({ summary: 'Calcular vencimientos procesales' })
  async calculateDeadlines(
    @Body() dto: CalculateDeadlineDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.legalToolsService.calculateDeadlines(dto, userId);
  }
}
// ← FIN COPIAR
```

**Verificar**: `npx tsc --noEmit` en apps/api → 0 errores



### FASE 3: Implementar DTOs (15 min)

**Paso 3.1: Crear analyze-discrepancies.dto.ts**

```bash
code apps/api/src/modules/legal-tools/dto/analyze-discrepancies.dto.ts
```

```typescript
import { IsUUID, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeDiscrepanciesDto {
  @IsUUID()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  transcriptionId: string;

  @IsUUID()
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  caseId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ApiProperty({ example: ['uuid1', 'uuid2'], required: false })
  comparableDocuments?: string[];
}
```

**Paso 3.2: Crear analyze-typicality.dto.ts**

```bash
code apps/api/src/modules/legal-tools/dto/analyze-typicality.dto.ts
```

```typescript
import { IsUUID, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeTypicalityDto {
  @IsUUID()
  @ApiProperty()
  transcriptionId: string;

  @IsString()
  @ApiProperty({ example: 'VIOLENCIA_INTRAFAMILIAR' })
  caseTypeCode: string;
}
```

**Paso 3.3: Crear calculate-deadline.dto.ts**

```bash
code apps/api/src/modules/legal-tools/dto/calculate-deadline.dto.ts
```

```typescript
import { IsUUID, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum EventType {
  MEDIDAS_PROTECCION = 'MEDIDAS_PROTECCION',
  AUDIENCIA = 'AUDIENCIA',
  DENUNCIA = 'DENUNCIA',
}

export class CalculateDeadlineDto {
  @IsUUID()
  @ApiProperty()
  caseId: string;

  @IsString()
  @ApiProperty({ example: '2026-08-15' })
  eventDate: string;

  @IsEnum(EventType)
  @ApiProperty({ enum: EventType })
  eventType: EventType;
}
```

### FASE 4: Implementar Servicio (40 min)

**Paso 4.1: Crear legal-tools.service.ts**

```bash
code apps/api/src/modules/legal-tools/legal-tools.service.ts
```

```typescript
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';
import { AnalyzeDiscrepanciesDto } from './dto/analyze-discrepancies.dto';
import { AnalyzeTypicalityDto } from './dto/analyze-typicality.dto';
import { CalculateDeadlineDto } from './dto/calculate-deadline.dto';

@Injectable()
export class LegalToolsService {
  constructor(
    private prisma: PrismaService,
    private caseAccessService: CaseAccessService,
  ) {}

  async analyzeDiscrepancies(
    dto: AnalyzeDiscrepanciesDto,
    userId: string,
  ) {
    // 1. Validar acceso al caso
    try {
      await this.caseAccessService.assertUserHasAccess(dto.caseId, {
        id: userId,
        role: 'ABOGADO', // Este será reemplazado por el decorator @CurrentUser
      } as any);
    } catch (error) {
      throw new ForbiddenException('No tienes acceso a este expediente');
    }

    // 2. Verificar que la transcripción existe
    const transcription = await this.prisma.transcription.findUnique({
      where: { id: dto.transcriptionId },
    });

    if (!transcription) {
      throw new NotFoundException('Transcripción no encontrada');
    }

    // 3. Realizar análisis (placeholder - aquí iría lógica Ollama)
    const analysisResult = {
      discrepancies: [
        {
          category: 'FECHA',
          severity: 'MEDIA',
          currentStatement: 'El hecho ocurrió el 5 de agosto',
          previousStatement: 'El hecho ocurrió el 6 de agosto',
          implications: 'Podría afectar credibilidad del testimonio',
          suggestedQuestion: '¿Puede confirmar exactamente qué día ocurrió?',
        },
      ],
      consistencyScore: 85,
      riskLevel: 'BAJO',
      recommendation: 'Validar fechas exactas en próxima audiencia',
    };

    // 4. Guardar análisis en BD
    const saved = await this.prisma.discrepancyAnalysis.create({
      data: {
        caseId: dto.caseId,
        currentTranscriptionId: dto.transcriptionId,
        comparableDocumentIds: dto.comparableDocuments || [],
        discrepancies: analysisResult.discrepancies,
        consistencyScore: analysisResult.consistencyScore,
        riskLevel: analysisResult.riskLevel,
        recommendation: analysisResult.recommendation,
        analyzedBy: userId,
      },
    });

    return {
      id: saved.id,
      ...analysisResult,
    };
  }

  async analyzeTypicality(dto: AnalyzeTypicalityDto, userId: string) {
    // Similar a analyzeDiscrepancies pero para tipicidad penal
    // Placeholder
    return {
      potentialCrimes: [
        {
          criminalCode: 'Art. 252 CP',
          crimeType: 'Violencia Psicológica',
          likelihood: 85,
          elementsPresent: ['Amenazas', 'Menosprecio'],
          elementsMissing: ['Daño psiquiátrico comprobado'],
          proofRequired: ['Informe psicológico', 'Testimonio pericial'],
          suggestedEvidence: ['Prueba de amenazas (WhatsApp)'],
        },
      ],
      primaryCrime: 'Violencia Psicológica',
      secondaryCrimes: [],
      evidenceGaps: ['Informe psicológico forense'],
      investigationPath: 'Solicitar pericia psicológica',
    };
  }

  async calculateDeadlines(dto: CalculateDeadlineDto, userId: string) {
    // Validar caso existe
    const caseData = await this.prisma.case.findUnique({
      where: { id: dto.caseId },
    });

    if (!caseData) {
      throw new NotFoundException('Caso no encontrado');
    }

    // Calcular vencimientos
    const eventDate = new Date(dto.eventDate);
    const deadlines = [];

    if (dto.eventType === 'MEDIDAS_PROTECCION') {
      // Audia preliminar en 5 días
      const audienciaDate = new Date(eventDate);
      audienciaDate.setDate(audienciaDate.getDate() + 5);
      deadlines.push({
        milestone: 'Audiencia Preliminar',
        calculatedDate: audienciaDate,
        daysRemaining: Math.ceil((audienciaDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        status: 'EN_TIEMPO',
        urgency: 60,
        relatedLaws: ['Ley 548', 'Art. 102'],
      });
    }

    return {
      deadlines,
      alertLevel: 'VERDE',
      actionItems: ['Notificar a partes', 'Preparar audiencia'],
    };
  }
}
```

### FASE 5: Crear Módulo (10 min)

**Paso 5.1: Crear legal-tools.module.ts**

```bash
code apps/api/src/modules/legal-tools/legal-tools.module.ts
```

```typescript
import { Module } from '@nestjs/common';
import { LegalToolsService } from './legal-tools.service';
import { LegalToolsController } from './legal-tools.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

@Module({
  providers: [LegalToolsService, PrismaService, CaseAccessService],
  controllers: [LegalToolsController],
  exports: [LegalToolsService],
})
export class LegalToolsModule {}
```

### FASE 6: Registrar en App Module (5 min)

**Paso 6.1: Actualizar app.module.ts**

```bash
code apps/api/src/app.module.ts
```

```bash
# Buscar línea: import { QuestionnairesModule }

# Agregar ANTES de esa línea:
# import { LegalToolsModule } from './modules/legal-tools/legal-tools.module';

# Luego buscar: QuestionnairesModule,

# Agregar ANTES:
# LegalToolsModule,
```

**Verificar**: `npx tsc --noEmit` → 0 errores

### FASE 7: Tests Unitarios (30 min)

**Paso 7.1: Crear legal-tools.service.spec.ts**

```bash
code apps/api/src/modules/legal-tools/legal-tools.service.spec.ts
```

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { LegalToolsService } from './legal-tools.service';
import { PrismaService } from '../prisma/prisma.service';
import { CaseAccessService } from '../../common/case-access/case-access.service';

describe('LegalToolsService', () => {
  let service: LegalToolsService;
  let prisma: PrismaService;
  let caseAccess: CaseAccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalToolsService,
        {
          provide: PrismaService,
          useValue: {
            transcription: { findUnique: jest.fn() },
            discrepancyAnalysis: { create: jest.fn() },
            case: { findUnique: jest.fn() },
          },
        },
        {
          provide: CaseAccessService,
          useValue: {
            assertUserHasAccess: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LegalToolsService>(LegalToolsService);
    prisma = module.get<PrismaService>(PrismaService);
    caseAccess = module.get<CaseAccessService>(CaseAccessService);
  });

  describe('analyzeDiscrepancies', () => {
    it('should analyze discrepancies successfully', async () => {
      const userId = 'user-123';
      const dto = {
        transcriptionId: 'trans-123',
        caseId: 'case-123',
      };

      jest.spyOn(caseAccess, 'assertUserHasAccess').mockResolvedValue(undefined);
      jest.spyOn(prisma.transcription, 'findUnique').mockResolvedValue({ id: 'trans-123' } as any);
      jest.spyOn(prisma.discrepancyAnalysis, 'create').mockResolvedValue({ id: 'analysis-123' } as any);

      const result = await service.analyzeDiscrepancies(dto, userId);

      expect(result).toBeDefined();
      expect(result.discrepancies).toBeDefined();
    });

    it('should throw error if transcription not found', async () => {
      jest.spyOn(prisma.transcription, 'findUnique').mockResolvedValue(null);

      await expect(
        service.analyzeDiscrepancies({ transcriptionId: 'invalid', caseId: 'case-123' }, 'user-123'),
      ).rejects.toThrow('Transcripción no encontrada');
    });
  });

  describe('calculateDeadlines', () => {
    it('should calculate deadlines correctly', async () => {
      jest.spyOn(prisma.case, 'findUnique').mockResolvedValue({ id: 'case-123' } as any);

      const result = await service.calculateDeadlines(
        {
          caseId: 'case-123',
          eventDate: '2026-08-05',
          eventType: 'MEDIDAS_PROTECCION',
        },
        'user-123',
      );

      expect(result.deadlines).toBeDefined();
      expect(result.alertLevel).toBe('VERDE');
    });
  });
});
```

### FASE 8: Ejecutar Tests (5 min)

```bash
cd apps/api

# Ejecutar tests de legal-tools
npm run test -- legal-tools.service.spec.ts

# Output debe mostrar: ✓ X tests passed

# Si alguno falla, revisar error y corregir

cd ../..
```

### FASE 9: Validación Final (10 min)

```bash
cd apps/api

# 1. TypeScript compilation
npx tsc --noEmit
# Debe mostrar: ✓ 0 errors

# 2. Compilar
npm run build
# Debe terminar exitosamente

# 3. Linting (si existe)
npm run lint 2>/dev/null || true
# Warnings están ok, errors NO

# 4. Tests completos
npm run test
# Todos deben pasar

cd ../..
```

### FASE 10: Crear Pull Request (10 min)

```bash
# 1. Verificar cambios
git status
# Debe mostrar archivos en rojo (no staged)

# 2. Agregar archivos
git add apps/api/src/modules/legal-tools/
git add apps/api/src/app.module.ts

# 3. Commit
git commit -m "feat(legal-tools): implement discrepancies, typicality, deadlines endpoints"

# 4. Push
git push -u origin feature/legal-tools

# 5. Crear PR en GitHub
# URL: https://github.com/[org]/defensoria/compare/develop...feature/legal-tools
# Título: feat(legal-tools): implement discrepancies, typicality, deadlines
# Description:
#   ### Cambios
#   - Implementado endpoint POST /legal-tools/discrepancies/analyze
#   - Implementado endpoint POST /legal-tools/typicality/analyze
#   - Implementado endpoint POST /legal-tools/deadlines/calculate
#   
#   ### Tests
#   - 12 tests unitarios PASS
#   - Coverage >80%
#   
#   ### Validaciones
#   - ✓ TypeScript: 0 errores
#   - ✓ Tests: PASS
#   - ✓ CaseAccessService: validado
#   - ✓ Swagger: documentado
#   
#   Closes #[issue-number]
```

---

## 🧪 TESTING PASO A PASO

### Ejecutar en localización (antes de PR)

```bash
# Terminal 1: Iniciar base de datos
docker-compose up -d postgres redis

# Terminal 2: Iniciar servidor
cd apps/api
npm run start:dev

# Terminal 3: Ejecutar tests
npm run test -- legal-tools.service.spec.ts --watch

# Terminal 4: Probar endpoints con curl
curl -X POST http://localhost:3000/api/legal-tools/discrepancies/analyze \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [JWT_TOKEN]" \
  -d '{
    "transcriptionId": "550e8400-e29b-41d4-a716-446655440000",
    "caseId": "550e8400-e29b-41d4-a716-446655440001"
  }'

# Esperado: 200 OK con response JSON
```

---

## ❌ TROUBLESHOOTING RÁPIDO

| Error | Solución |
|-------|----------|
| `Cannot find module @nestjs/swagger` | `npm install` en root |
| `Type error: Cannot assign to readonly property` | Revisar tipos en DTO |
| `Prisma error: schema not synced` | `npx prisma migrate dev` en packages/db |
| `401 Unauthorized` | Falta JWT token en header Authorization |
| `Tests failing` | Ejecutar `npm run test -- --clearCache` |
| `Port 3000 en uso` | `lsof -i :3000` y `kill -9 [PID]` |

---

## ✅ CHECKLIST ANTES DE PR

- [ ] Rama creada desde develop (no master)
- [ ] Código compilable sin errores TypeScript
- [ ] Tests PASS (mínimo 80% coverage)
- [ ] Sin console.log() de debug
- [ ] Swagger documentado (@ApiOperation)
- [ ] CaseAccessService utilizado
- [ ] No hay hardcoding (todo desde DTO/DB)
- [ ] Git log limpio (commits significativos)
- [ ] Reviewed localmente (funciona)

