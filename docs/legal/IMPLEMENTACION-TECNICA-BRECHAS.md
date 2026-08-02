# 🔧 IMPLEMENTACIÓN TÉCNICA - CORRECCIÓN DE BRECHAS LEGALES

**Objetivo**: Guía técnica paso a paso para implementar las correcciones legales requeridas  
**Audiencia**: Desarrolladores y arquitectos del sistema  
**Prioridad**: ALTA

---

## 📋 ÍNDICE DE IMPLEMENTACIÓN

1. [Brecha #1: Validación por Trabajador Social](#brecha-1-validación-por-trabajador-social)
2. [Brecha #2: Módulo de Conciliación](#brecha-2-módulo-de-conciliación)
3. [Brecha #3: Actualización de Base Legal](#brecha-3-actualización-de-base-legal)
4. [Testing y Verificación](#testing-y-verificación)

---

## 🔴 BRECHA #1: VALIDACIÓN POR TRABAJADOR SOCIAL

### **Cambios en el Modelo de Datos**

#### **1.1 Nuevos Estados de Caso**

```prisma
// packages/db/prisma/schema.prisma

enum CaseStatus {
  // ... estados existentes
  
  // NUEVOS ESTADOS
  PENDIENTE_FICHA_SOCIAL    // Después de ingreso por SECRETARIA
  FICHA_SOCIAL_COMPLETADA   // Después de validación por SOCIAL
  
  // Estados existentes
  PENDIENTE_ASIGNACION
  EN_PROCESO
  // ...
}
```

#### **1.2 Nuevo Modelo: SocialIntakeForm (Ficha Social)**

```prisma
// packages/db/prisma/schema.prisma

model SocialIntakeForm {
  id                String   @id @default(cuid())
  caseId            String   @unique
  case              Case     @relation(fields: [caseId], references: [id])
  
  // Profesional que elabora la ficha
  socialWorkerId    String
  socialWorker      User     @relation(fields: [socialWorkerId], references: [id])
  
  // Datos de la entrevista inicial
  interviewDate     DateTime
  interviewLocation String
  
  // Descripción del hecho denunciado
  incidentDescription       String   @db.Text
  incidentLocation          String
  incidentDate              DateTime?
  incidentWitnesses         String?  @db.Text
  
  // Evaluación social inicial
  familyStructure           String   @db.Text
  socialEconomicSituation   String   @db.Text
  immediateDangerAssessment Boolean  @default(false)
  dangerLevel               String?  // ALTO, MEDIO, BAJO
  
  // Observaciones profesionales
  professionalObservations  String   @db.Text
  initialRecommendations    String   @db.Text
  
  // Estado
  status                    String   @default("BORRADOR") // BORRADOR, COMPLETA, REVISADA
  completedAt               DateTime?
  
  createdAt                 DateTime @default(now())
  updatedAt                 DateTime @updatedAt
  
  @@map("social_intake_forms")
}
```

### **Cambios en el API**

#### **1.3 Nuevo Servicio: SocialIntakeService**

```typescript
// apps/api/src/modules/social-intake/social-intake.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@defensoria/db';

@Injectable()
export class SocialIntakeService {
  constructor(private prisma: PrismaService) {}
  
  /**
   * Crear ficha social (solo TRABAJADOR SOCIAL)
   */
  async createIntakeForm(
    caseId: string,
    socialWorkerId: string,
    data: CreateSocialIntakeDto,
  ) {
    // Verificar que el caso esté en estado correcto
    const caso = await this.prisma.case.findUnique({
      where: { id: caseId },
    });
    
    if (caso.status !== 'PENDIENTE_FICHA_SOCIAL') {
      throw new ForbiddenException(
        'El caso no está en estado PENDIENTE_FICHA_SOCIAL'
      );
    }
    
    // Crear ficha social
    const form = await this.prisma.socialIntakeForm.create({
      data: {
        caseId,
        socialWorkerId,
        ...data,
        status: 'BORRADOR',
      },
    });
    
    return form;
  }
  
  /**
   * Completar y validar ficha social
   */
  async completeIntakeForm(formId: string, socialWorkerId: string) {
    // Verificar que es el mismo trabajador social
    const form = await this.prisma.socialIntakeForm.findUnique({
      where: { id: formId },
    });
    
    if (form.socialWorkerId !== socialWorkerId) {
      throw new ForbiddenException('No puedes completar esta ficha');
    }
    
    // Actualizar ficha
    const updated = await this.prisma.socialIntakeForm.update({
      where: { id: formId },
      data: {
        status: 'COMPLETA',
        completedAt: new Date(),
      },
    });
    
    // Cambiar estado del caso
    await this.prisma.case.update({
      where: { id: form.caseId },
      data: {
        status: 'FICHA_SOCIAL_COMPLETADA',
      },
    });
    
    // Notificar a JEFATURA
    await this.notifyJefatura(form.caseId);
    
    return updated;
  }
  
  private async notifyJefatura(caseId: string) {
    // Implementar notificación
    // TODO: Enviar email o notificación push
  }
}
```

#### **1.4 Modificar CasesService**

```typescript
// apps/api/src/modules/cases/cases.service.ts

async createCase(userId: string, data: CreateCaseDto) {
  // Verificar rol del usuario
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
  });
  
  if (user.role !== 'SECRETARIA') {
    throw new ForbiddenException('Solo SECRETARIA puede crear casos');
  }
  
  // Crear caso en estado PENDIENTE_FICHA_SOCIAL
  const caso = await this.prisma.case.create({
    data: {
      ...data,
      status: 'PENDIENTE_FICHA_SOCIAL', // ← CAMBIO IMPORTANTE
      createdBy: userId,
    },
  });
  
  // Notificar a trabajadores sociales disponibles
  await this.notifySocialWorkers(caso.id);
  
  return caso;
}
```

### **Cambios en el Frontend**

#### **1.5 Nueva Página: Ficha Social**

```typescript
// apps/web/app/(dashboard)/casos/[id]/ficha-social/page.tsx

'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { createSocialIntakeForm } from '@/lib/api-client';

export default function FichaSocialPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    interviewDate: new Date(),
    interviewLocation: '',
    incidentDescription: '',
    incidentLocation: '',
    incidentDate: null,
    incidentWitnesses: '',
    familyStructure: '',
    socialEconomicSituation: '',
    immediateDangerAssessment: false,
    dangerLevel: 'MEDIO',
    professionalObservations: '',
    initialRecommendations: '',
  });
  
  const handleSubmit = async () => {
    try {
      await createSocialIntakeForm(params.id, form);
      alert('Ficha social guardada');
    } catch (error) {
      alert('Error al guardar');
    }
  };
  
  // Solo TRABAJADOR SOCIAL puede acceder
  if (user?.role !== 'SOCIAL') {
    return <div>Acceso denegado</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Ficha Social - Caso #{params.id}</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos de la entrevista */}
        <section>
          <h2 className="text-xl font-semibold mb-4">1. Datos de la Entrevista</h2>
          
          <label>
            Fecha de entrevista:
            <input 
              type="date" 
              value={form.interviewDate}
              onChange={(e) => setForm({...form, interviewDate: e.target.value})}
            />
          </label>
          
          <label>
            Lugar de entrevista:
            <input 
              type="text" 
              value={form.interviewLocation}
              onChange={(e) => setForm({...form, interviewLocation: e.target.value})}
            />
          </label>
        </section>
        
        {/* Descripción del hecho */}
        <section>
          <h2 className="text-xl font-semibold mb-4">2. Descripción del Hecho Denunciado</h2>
          
          <label>
            Descripción detallada:
            <textarea 
              rows={6}
              value={form.incidentDescription}
              onChange={(e) => setForm({...form, incidentDescription: e.target.value})}
              placeholder="Describir los hechos denunciados con el mayor detalle posible..."
            />
          </label>
          
          {/* Más campos... */}
        </section>
        
        {/* Evaluación social */}
        <section>
          <h2 className="text-xl font-semibold mb-4">3. Evaluación Social Inicial</h2>
          
          <label>
            Estructura familiar:
            <textarea 
              rows={4}
              value={form.familyStructure}
              onChange={(e) => setForm({...form, familyStructure: e.target.value})}
            />
          </label>
          
          <label>
            <input 
              type="checkbox"
              checked={form.immediateDangerAssessment}
              onChange={(e) => setForm({...form, immediateDangerAssessment: e.target.checked})}
            />
            ⚠️ Existe peligro inmediato para el NNA
          </label>
          
          {form.immediateDangerAssessment && (
            <select 
              value={form.dangerLevel}
              onChange={(e) => setForm({...form, dangerLevel: e.target.value})}
            >
              <option value="BAJO">Peligro Bajo</option>
              <option value="MEDIO">Peligro Medio</option>
              <option value="ALTO">Peligro Alto</option>
            </select>
          )}
        </section>
        
        {/* Observaciones profesionales */}
        <section>
          <h2 className="text-xl font-semibold mb-4">4. Observaciones Profesionales</h2>
          
          <textarea 
            rows={6}
            value={form.professionalObservations}
            onChange={(e) => setForm({...form, professionalObservations: e.target.value})}
            placeholder="Observaciones desde la perspectiva del trabajo social..."
          />
        </section>
        
        <div className="flex gap-4">
          <button type="button" onClick={handleSubmit}>
            Guardar Borrador
          </button>
          <button type="submit" className="bg-green-600">
            Completar y Enviar a Jefatura
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## 🔴 BRECHA #2: MÓDULO DE CONCILIACIÓN

### **Cambios en el Modelo de Datos**

#### **2.1 Nuevos Modelos**

```prisma
// packages/db/prisma/schema.prisma

// Evaluación de conciliabilidad
model ConciliationEvaluation {
  id                String   @id @default(cuid())
  caseId            String   @unique
  case              Case     @relation(fields: [caseId], references: [id])
  
  evaluatedBy       String
  evaluator         User     @relation(fields: [evaluatedBy], references: [id])
  
  isConciliable     Boolean
  reason            String   @db.Text  // Por qué sí o por qué no
  
  // Motivos de NO conciliabilidad
  hasMaltrato       Boolean  @default(false)
  hasCriminalAction Boolean  @default(false)
  hasAuthorityLoss  Boolean  @default(false)
  
  createdAt         DateTime @default(now())
  
  @@map("conciliation_evaluations")
}

// Proceso de conciliación
model ConciliationProcess {
  id                    String   @id @default(cuid())
  caseId                String
  case                  Case     @relation(fields: [caseId], references: [id])
  
  // Audiencia
  scheduledDate         DateTime
  location              String
  
  // Participantes
  leadLawyerId          String
  leadLawyer            User     @relation("LeadLawyer", fields: [leadLawyerId], references: [id])
  socialWorkerId        String?
  socialWorker          User?    @relation("SocialWorker", fields: [socialWorkerId], references: [id])
  psychologistId        String?
  psychologist          User?    @relation("Psychologist", fields: [psychologistId], references: [id])
  
  // Resultado
  status                String   @default("AGENDADA") // AGENDADA, REALIZADA, ACUERDO, SIN_ACUERDO
  agreementReached      Boolean? 
  agreementText         String?  @db.Text
  agreementDate         DateTime?
  
  // Homologación
  homologationRequested Boolean  @default(false)
  homologationDate      DateTime?
  homologatedBy         String?  // Nombre del juez
  courtDecision         String?  @db.Text
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@map("conciliation_processes")
}
```

#### **2.2 Servicio de Conciliación**

```typescript
// apps/api/src/modules/conciliation/conciliation.service.ts

@Injectable()
export class ConciliationService {
  constructor(private prisma: PrismaService) {}
  
  /**
   * Evaluar si un caso es conciliable (Art. 24, 26)
   */
  async evaluateConciliability(caseId: string, evaluatedBy: string) {
    const caso = await this.prisma.case.findUnique({
      where: { id: caseId },
      include: { 
        violenceType: true,
        actions: true,
      },
    });
    
    // Motivos de NO conciliabilidad (Art. 24)
    const hasMaltrato = caso.violenceType?.includes('MALTRATO');
    const hasAuthorityLoss = caso.actions.some(
      a => a.type === 'SUSPENSION_AUTORIDAD_PATERNA' || 
           a.type === 'PERDIDA_AUTORIDAD_PATERNA'
    );
    const hasCriminalAction = caso.criminalType !== null;
    
    const isConciliable = !(
      hasMaltrato || 
      hasAuthorityLoss || 
      hasCriminalAction
    );
    
    // Generar razón
    let reason = '';
    if (!isConciliable) {
      if (hasMaltrato) reason += 'Caso de maltrato (Art. 24). ';
      if (hasAuthorityLoss) reason += 'Involucra pérdida de autoridad paterna (Art. 24). ';
      if (hasCriminalAction) reason += 'Constituye delito tipificado. ';
    } else {
      reason = 'El caso no constituye delito y no está en los supuestos del Art. 24. Es conciliable según Art. 26.';
    }
    
    // Guardar evaluación
    const evaluation = await this.prisma.conciliationEvaluation.create({
      data: {
        caseId,
        evaluatedBy,
        isConciliable,
        reason,
        hasMaltrato,
        hasCriminalAction,
        hasAuthorityLoss,
      },
    });
    
    // Actualizar estado del caso
    if (isConciliable) {
      await this.prisma.case.update({
        where: { id: caseId },
        data: { status: 'CONCILIABLE' },
      });
    } else {
      await this.prisma.case.update({
        where: { id: caseId },
        data: { status: 'NO_CONCILIABLE_VIA_JUDICIAL' },
      });
    }
    
    return evaluation;
  }
  
  /**
   * Agendar audiencia de conciliación (Art. 27)
   */
  async scheduleHearing(
    caseId: string,
    data: ScheduleConciliationDto,
  ) {
    // Verificar que el caso sea conciliable
    const evaluation = await this.prisma.conciliationEvaluation.findUnique({
      where: { caseId },
    });
    
    if (!evaluation?.isConciliable) {
      throw new ForbiddenException('Este caso no es conciliable');
    }
    
    // Crear proceso de conciliación
    const process = await this.prisma.conciliationProcess.create({
      data: {
        caseId,
        ...data,
        status: 'AGENDADA',
      },
    });
    
    // Notificar a las partes
    await this.notifyParties(caseId, data.scheduledDate);
    
    return process;
  }
  
  /**
   * Registrar resultado de audiencia
   */
  async recordHearingResult(
    processId: string,
    result: ConciliationResultDto,
  ) {
    const updated = await this.prisma.conciliationProcess.update({
      where: { id: processId },
      data: {
        status: result.agreementReached ? 'ACUERDO' : 'SIN_ACUERDO',
        agreementReached: result.agreementReached,
        agreementText: result.agreementText,
        agreementDate: result.agreementReached ? new Date() : null,
      },
    });
    
    if (result.agreementReached) {
      // Cambiar estado del caso
      await this.prisma.case.update({
        where: { id: updated.caseId },
        data: { status: 'ACUERDO_CONCILIATORIO_PENDIENTE_HOMOLOGACION' },
      });
    } else {
      // Si no hay acuerdo, derivar a vía judicial
      await this.prisma.case.update({
        where: { id: updated.caseId },
        data: { status: 'VIA_JUDICIAL' },
      });
    }
    
    return updated;
  }
  
  /**
   * Solicitar homologación judicial (Art. 27)
   */
  async requestHomologation(processId: string, lawyerId: string) {
    const process = await this.prisma.conciliationProcess.findUnique({
      where: { id: processId },
      include: { case: true },
    });
    
    if (!process.agreementReached) {
      throw new ForbiddenException('No hay acuerdo para homologar');
    }
    
    // Actualizar proceso
    await this.prisma.conciliationProcess.update({
      where: { id: processId },
      data: {
        homologationRequested: true,
        homologationDate: new Date(),
      },
    });
    
    // Cambiar estado del caso
    await this.prisma.case.update({
      where: { id: process.caseId },
      data: { status: 'PENDIENTE_HOMOLOGACION_JUDICIAL' },
    });
    
    // Generar documento de solicitud
    // TODO: Generar PDF con acuerdo conciliatorio
    
    return { success: true };
  }
}
```

---

## 🟡 BRECHA #3: ACTUALIZACIÓN DE BASE LEGAL

### **3.1 Verificar Base de Conocimiento RAG**

```typescript
// apps/api/src/modules/knowledge/knowledge.service.ts

// Verificar qué documentos están indexados
async getIndexedDocuments() {
  const docs = await this.prisma.document.findMany({
    select: {
      title: true,
      type: true,
      sourceUrl: true,
      createdAt: true,
    },
  });
  
  // Verificar si incluye Ley 548 (2014)
  const hasLey548 = docs.some(d => d.title.includes('548') || d.title.includes('2014'));
  
  if (!hasLey548) {
    console.warn('⚠️ Base de conocimiento no incluye Ley 548 (vigente)');
  }
  
  return docs;
}
```

### **3.2 Actualizar Prompts del Sistema**

```typescript
// apps/api/src/modules/legal-tools/legal-tools.service.ts

const UPDATED_SYSTEM_PROMPT = `
Eres un asistente legal especializado en Defensoría de la Niñez y Adolescencia en Bolivia.

MARCO LEGAL VIGENTE:
- Ley N° 548 (2014) - Código Niña, Niño y Adolescente [VIGENTE]
- Ley N° 348 (2013) - Ley Integral para Garantizar a las Mujeres una Vida Libre de Violencia
- Ordenanza Municipal N° 136/03 (2003) - Reglamento Municipal de Defensorías de Sucre

IMPORTANTE:
- La Ley N° 2026 (1999) fue DEROGADA por la Ley N° 548 (2014)
- Siempre citar la ley vigente en tus análisis
- Si encuentras referencias a la Ley 2026, actualiza a Ley 548

...
`;
```

---

## ✅ TESTING Y VERIFICACIÓN

### **Tests de Integración**

```typescript
// apps/api/src/modules/cases/cases.spec.ts

describe('Flujo de Ficha Social', () => {
  it('SECRETARIA crea caso en estado PENDIENTE_FICHA_SOCIAL', async () => {
    const caso = await casesService.createCase(secretariaId, caseData);
    expect(caso.status).toBe('PENDIENTE_FICHA_SOCIAL');
  });
  
  it('TRABAJADOR SOCIAL completa ficha social', async () => {
    const form = await socialIntakeService.completeIntakeForm(formId, socialId);
    expect(form.status).toBe('COMPLETA');
    
    const caso = await prisma.case.findUnique({ where: { id: caseId } });
    expect(caso.status).toBe('FICHA_SOCIAL_COMPLETADA');
  });
  
  it('ABOGADO no puede crear ficha social', async () => {
    await expect(
      socialIntakeService.createIntakeForm(caseId, abogadoId, data)
    ).rejects.toThrow('Solo TRABAJADOR SOCIAL puede crear fichas');
  });
});

describe('Módulo de Conciliación', () => {
  it('Identifica caso NO conciliable (maltrato)', async () => {
    const eval = await conciliationService.evaluateConciliability(casoMaltratoId, lawyerId);
    expect(eval.isConciliable).toBe(false);
    expect(eval.hasMaltrato).toBe(true);
  });
  
  it('Identifica caso conciliable', async () => {
    const eval = await conciliationService.evaluateConciliability(casoMenorId, lawyerId);
    expect(eval.isConciliable).toBe(true);
  });
  
  it('Bloquea audiencia si caso no es conciliable', async () => {
    await expect(
      conciliationService.scheduleHearing(casoNoConciliable, data)
    ).rejects.toThrow('Este caso no es conciliable');
  });
});
```

---

**FIN DEL DOCUMENTO TÉCNICO**

Para implementación, seguir el orden:
1. Brecha #1 (2 semanas)
2. Brecha #2 (3 semanas)
3. Brecha #3 (1 semana)

Total estimado: **6 semanas de desarrollo**