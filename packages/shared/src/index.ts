import { z } from 'zod';

// ==========================================
// ENUMS DE DOMINIO
// ==========================================

export enum Role {
  JEFATURA = 'JEFATURA',
  ABOGADO = 'ABOGADO',
  PSICOLOGO = 'PSICOLOGO',
  SOCIAL = 'SOCIAL',
  SECRETARIA = 'SECRETARIA',
  REFERENTE_TUTOR = 'REFERENTE_TUTOR',
}

export enum DocumentType {
  CI = 'CI',
  PASAPORTE = 'PASAPORTE',
  PARTIDA_NACIMIENTO = 'PARTIDA_NACIMIENTO',
  SIN_DOCUMENTO = 'SIN_DOCUMENTO',
}

export enum Gender {
  MASCULINO = 'MASCULINO',
  FEMENINO = 'FEMENINO',
  OTRO = 'OTRO',
}

export enum CaseType {
  DENUNCIA_VULNERACION = 'DENUNCIA_VULNERACION',
  CONSUMO_SUSTANCIAS = 'CONSUMO_SUSTANCIAS',
  VENTA_ALCOHOL = 'VENTA_ALCOHOL',
  DERECHO_EDUCACION = 'DERECHO_EDUCACION',
  EXTRAVIO = 'EXTRAVIO',
  NNA_INFRACTOR = 'NNA_INFRACTOR',
  FISCALIZACION = 'FISCALIZACION',
}

export enum Phase {
  DERIVACION = 'DERIVACION',
  EVALUACION = 'EVALUACION',
  SEGUIMIENTO = 'SEGUIMIENTO',
  JUDICIALIZACION = 'JUDICIALIZACION',
  CIERRE = 'CIERRE',
}

export enum InterventionPath {
  GESTION_ADMINISTRATIVA = 'GESTION_ADMINISTRATIVA',
  CONCILIACION = 'CONCILIACION',
  VIA_JUDICIAL = 'VIA_JUDICIAL',
}

export enum RiskLevel {
  BAJO = 'BAJO',
  MEDIO = 'MEDIO',
  ALTO = 'ALTO',
}

export enum RoleInCase {
  NNA = 'NNA',
  DENUNCIANTE = 'DENUNCIANTE',
  DENUNCIADO = 'DENUNCIADO',
  TUTOR = 'TUTOR',
  TESTIGO = 'TESTIGO',
}

export enum ActionType {
  NOTA = 'NOTA',
  ENTREVISTA = 'ENTREVISTA',
  VISITA_DOMICILIARIA = 'VISITA_DOMICILIARIA',
  AUDIENCIA = 'AUDIENCIA',
  DERIVACION = 'DERIVACION',
  CONTACTO_INSTITUCIONAL = 'CONTACTO_INSTITUCIONAL',
  OTRO = 'OTRO',
}

export enum ReportType {
  INFORME_SOCIAL = 'INFORME_SOCIAL',
  INFORME_PSICOLOGICO = 'INFORME_PSICOLOGICO',
  INFORME_PSICOSOCIAL = 'INFORME_PSICOSOCIAL',
  INFORME_JURIDICO = 'INFORME_JURIDICO',
}

export enum ReportStatus {
  BORRADOR = 'BORRADOR',
  EMITIDO = 'EMITIDO',
}

export enum AppointmentType {
  ENTREVISTA = 'ENTREVISTA',
  AUDIENCIA = 'AUDIENCIA',
  VISITA_DOMICILIARIA = 'VISITA_DOMICILIARIA',
  SEGUIMIENTO = 'SEGUIMIENTO',
  OTRO = 'OTRO',
}

export enum AppointmentStatus {
  PROGRAMADA = 'PROGRAMADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  REPROGRAMADA = 'REPROGRAMADA',
}

export enum NotificationType {
  PLAZO_LEGAL = 'PLAZO_LEGAL',
  RIESGO_ALTO = 'RIESGO_ALTO',
  ASIGNACION = 'ASIGNACION',
  DERIVACION = 'DERIVACION',
  GENERAL = 'GENERAL',
}

export enum Priority {
  NORMAL = 'NORMAL',
  URGENTE = 'URGENTE',
  CRITICA = 'CRITICA',
}

// ==========================================
// ESQUEMAS DE VALIDACIÓN ZOD
// ==========================================

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const personSearchSchema = z.object({
  query: z.string().min(2, 'Ingrese al menos 2 caracteres para buscar'),
});

export type PersonSearchInput = z.infer<typeof personSearchSchema>;

export const createPersonSchema = z.object({
  documentType: z.nativeEnum(DocumentType),
  documentNumber: z.string().optional(),
  firstName: z.string().min(2, 'El nombre es obligatorio'),
  lastName: z.string().min(2, 'El apellido es obligatorio'),
  birthDate: z.string().optional(),
  gender: z.nativeEnum(Gender),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePersonInput = z.infer<typeof createPersonSchema>;

export const createCaseSchema = z.object({
  caseType: z.nativeEnum(CaseType),
  nnaId: z.string().uuid('ID de NNA inválido'),
  complainantId: z.string().uuid().optional(),
  accusedId: z.string().uuid().optional(),
  intakeNarrative: z.string().min(10, 'La narrativa de la denuncia debe tener al menos 10 caracteres'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
