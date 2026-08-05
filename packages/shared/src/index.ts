import { z } from 'zod';

// ==========================================
// ENUMS DE DOMINIO
// ==========================================

export enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',
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

export enum ReportCategory {
  INFORME_SOCIAL = 'INFORME_SOCIAL',
  INFORME_PSICOLOGICO = 'INFORME_PSICOLOGICO',
  INFORME_PSICOSOCIAL = 'INFORME_PSICOSOCIAL',
  INFORME_JURIDICO = 'INFORME_JURIDICO',
  INFORME_SESION_SEGUIMIENTO = 'INFORME_SESION_SEGUIMIENTO',
  INFORME_FINAL_CONCILIACION = 'INFORME_FINAL_CONCILIACION',
  INFORME_COMPLEMENTARIO = 'INFORME_COMPLEMENTARIO',
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
  PROPUESTA = 'PROPUESTA',
  PROGRAMADA = 'PROGRAMADA',
  CONFIRMADA = 'CONFIRMADA',
  COMPLETADA = 'COMPLETADA',
  CANCELADA = 'CANCELADA',
  REPROGRAMADA = 'REPROGRAMADA',
  NO_ASISTIO = 'NO_ASISTIO',
  RECHAZADA = 'RECHAZADA',
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

// ==========================================
// FORMATEADORES DE ETIQUETAS HUMANAS
// ==========================================

export const formatPhase = (phase?: Phase | string): string => {
  switch (phase) {
    case Phase.DERIVACION:
      return 'Derivación / Recepción';
    case Phase.EVALUACION:
      return 'Evaluación Interdisciplinaria';
    case Phase.SEGUIMIENTO:
      return 'Plan de Acompañamiento';
    case Phase.JUDICIALIZACION:
      return 'Vía Judicial';
    case Phase.CIERRE:
      return 'Cierre de Caso';
    default:
      return phase || 'N/A';
  }
};

export const formatInterventionPath = (path?: InterventionPath | string): string => {
  switch (path) {
    case InterventionPath.GESTION_ADMINISTRATIVA:
      return 'Gestión Administrativa';
    case InterventionPath.CONCILIACION:
      return 'Conciliación';
    case InterventionPath.VIA_JUDICIAL:
      return 'Vía Judicial';
    default:
      return path || 'N/A';
  }
};

export const formatCaseType = (type?: CaseType | string): string => {
  switch (type) {
    case CaseType.DENUNCIA_VULNERACION:
      return 'Denuncia por Vulneración';
    case CaseType.CONSUMO_SUSTANCIAS:
      return 'Consumo de Sustancias';
    case CaseType.VENTA_ALCOHOL:
      return 'Venta de Alcohol a Menores';
    case CaseType.DERECHO_EDUCACION:
      return 'Vulneración al Derecho a la Educación';
    case CaseType.EXTRAVIO:
      return 'Extravío / Desaparición';
    case CaseType.NNA_INFRACTOR:
      return 'NNA en Conflicto con la Ley';
    case CaseType.FISCALIZACION:
      return 'Fiscalización / Inspección';
    default:
      return type || 'N/A';
  }
};

export const formatAppointmentType = (type?: AppointmentType | string): string => {
  switch (type) {
    case AppointmentType.ENTREVISTA:
      return 'Entrevista';
    case AppointmentType.AUDIENCIA:
      return 'Audiencia Judicial';
    case AppointmentType.VISITA_DOMICILIARIA:
      return 'Visita Domiciliaria';
    case AppointmentType.SEGUIMIENTO:
      return 'Sesión de Seguimiento';
    case AppointmentType.OTRO:
      return 'Otra Cita';
    default:
      return type || 'N/A';
  }
};

export const formatAppointmentStatus = (status?: AppointmentStatus | string): string => {
  switch (status) {
    case AppointmentStatus.PROPUESTA:    return 'Propuesta';
    case AppointmentStatus.PROGRAMADA:   return 'Programada';
    case AppointmentStatus.CONFIRMADA:   return 'Confirmada';
    case AppointmentStatus.COMPLETADA:   return 'Completada';
    case AppointmentStatus.CANCELADA:    return 'Cancelada';
    case AppointmentStatus.REPROGRAMADA: return 'Reprogramada';
    case AppointmentStatus.NO_ASISTIO:   return 'No Asistió';
    case AppointmentStatus.RECHAZADA:    return 'Rechazada';
    default: return status || 'N/A';
  }
};

export const formatActionType = (type?: ActionType | string): string => {
  switch (type) {
    case ActionType.NOTA:
      return 'Nota de Campo';
    case ActionType.ENTREVISTA:
      return 'Entrevista / Declaración';
    case ActionType.VISITA_DOMICILIARIA:
      return 'Visita Domiciliaria';
    case ActionType.AUDIENCIA:
      return 'Audiencia / Diligencia';
    case ActionType.DERIVACION:
      return 'Derivación Institucional';
    case ActionType.CONTACTO_INSTITUCIONAL:
      return 'Contacto Institucional';
    case ActionType.OTRO:
      return 'Otra Actuación';
    default:
      return type || 'N/A';
  }
};

export const formatRiskLevel = (risk?: RiskLevel | string): string => {
  switch (risk) {
    case RiskLevel.BAJO:
      return 'Bajo';
    case RiskLevel.MEDIO:
      return 'Medio';
    case RiskLevel.ALTO:
      return 'Alto';
    default:
      return risk || 'Pendiente';
  }
};

