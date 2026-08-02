import { z } from 'zod';
export declare enum Role {
    ADMINISTRADOR = "ADMINISTRADOR",
    JEFATURA = "JEFATURA",
    ABOGADO = "ABOGADO",
    PSICOLOGO = "PSICOLOGO",
    SOCIAL = "SOCIAL",
    SECRETARIA = "SECRETARIA",
    REFERENTE_TUTOR = "REFERENTE_TUTOR"
}
export declare enum DocumentType {
    CI = "CI",
    PASAPORTE = "PASAPORTE",
    PARTIDA_NACIMIENTO = "PARTIDA_NACIMIENTO",
    SIN_DOCUMENTO = "SIN_DOCUMENTO"
}
export declare enum Gender {
    MASCULINO = "MASCULINO",
    FEMENINO = "FEMENINO",
    OTRO = "OTRO"
}
export declare enum CaseType {
    DENUNCIA_VULNERACION = "DENUNCIA_VULNERACION",
    CONSUMO_SUSTANCIAS = "CONSUMO_SUSTANCIAS",
    VENTA_ALCOHOL = "VENTA_ALCOHOL",
    DERECHO_EDUCACION = "DERECHO_EDUCACION",
    EXTRAVIO = "EXTRAVIO",
    NNA_INFRACTOR = "NNA_INFRACTOR",
    FISCALIZACION = "FISCALIZACION"
}
export declare enum Phase {
    DERIVACION = "DERIVACION",
    EVALUACION = "EVALUACION",
    SEGUIMIENTO = "SEGUIMIENTO",
    JUDICIALIZACION = "JUDICIALIZACION",
    CIERRE = "CIERRE"
}
export declare enum InterventionPath {
    GESTION_ADMINISTRATIVA = "GESTION_ADMINISTRATIVA",
    CONCILIACION = "CONCILIACION",
    VIA_JUDICIAL = "VIA_JUDICIAL"
}
export declare enum RiskLevel {
    BAJO = "BAJO",
    MEDIO = "MEDIO",
    ALTO = "ALTO"
}
export declare enum RoleInCase {
    NNA = "NNA",
    DENUNCIANTE = "DENUNCIANTE",
    DENUNCIADO = "DENUNCIADO",
    TUTOR = "TUTOR",
    TESTIGO = "TESTIGO"
}
export declare enum ActionType {
    NOTA = "NOTA",
    ENTREVISTA = "ENTREVISTA",
    VISITA_DOMICILIARIA = "VISITA_DOMICILIARIA",
    AUDIENCIA = "AUDIENCIA",
    DERIVACION = "DERIVACION",
    CONTACTO_INSTITUCIONAL = "CONTACTO_INSTITUCIONAL",
    OTRO = "OTRO"
}
export declare enum ReportType {
    INFORME_SOCIAL = "INFORME_SOCIAL",
    INFORME_PSICOLOGICO = "INFORME_PSICOLOGICO",
    INFORME_PSICOSOCIAL = "INFORME_PSICOSOCIAL",
    INFORME_JURIDICO = "INFORME_JURIDICO"
}
export declare enum ReportStatus {
    BORRADOR = "BORRADOR",
    EMITIDO = "EMITIDO"
}
export declare enum AppointmentType {
    ENTREVISTA = "ENTREVISTA",
    AUDIENCIA = "AUDIENCIA",
    VISITA_DOMICILIARIA = "VISITA_DOMICILIARIA",
    SEGUIMIENTO = "SEGUIMIENTO",
    OTRO = "OTRO"
}
export declare enum AppointmentStatus {
    PROGRAMADA = "PROGRAMADA",
    COMPLETADA = "COMPLETADA",
    CANCELADA = "CANCELADA",
    REPROGRAMADA = "REPROGRAMADA"
}
export declare enum NotificationType {
    PLAZO_LEGAL = "PLAZO_LEGAL",
    RIESGO_ALTO = "RIESGO_ALTO",
    ASIGNACION = "ASIGNACION",
    DERIVACION = "DERIVACION",
    GENERAL = "GENERAL"
}
export declare enum Priority {
    NORMAL = "NORMAL",
    URGENTE = "URGENTE",
    CRITICA = "CRITICA"
}
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email?: string;
    password?: string;
}, {
    email?: string;
    password?: string;
}>;
export type LoginInput = z.infer<typeof loginSchema>;
export declare const personSearchSchema: z.ZodObject<{
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query?: string;
}, {
    query?: string;
}>;
export type PersonSearchInput = z.infer<typeof personSearchSchema>;
export declare const createPersonSchema: z.ZodObject<{
    documentType: z.ZodNativeEnum<typeof DocumentType>;
    documentNumber: z.ZodOptional<z.ZodString>;
    firstName: z.ZodString;
    lastName: z.ZodString;
    birthDate: z.ZodOptional<z.ZodString>;
    gender: z.ZodNativeEnum<typeof Gender>;
    phone: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    firstName?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    documentType?: DocumentType;
    documentNumber?: string;
    birthDate?: string;
    gender?: Gender;
    notes?: string;
}, {
    firstName?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    documentType?: DocumentType;
    documentNumber?: string;
    birthDate?: string;
    gender?: Gender;
    notes?: string;
}>;
export type CreatePersonInput = z.infer<typeof createPersonSchema>;
export declare const createCaseSchema: z.ZodObject<{
    caseType: z.ZodNativeEnum<typeof CaseType>;
    nnaId: z.ZodString;
    complainantId: z.ZodOptional<z.ZodString>;
    accusedId: z.ZodOptional<z.ZodString>;
    intakeNarrative: z.ZodString;
}, "strip", z.ZodTypeAny, {
    caseType?: CaseType;
    nnaId?: string;
    complainantId?: string;
    accusedId?: string;
    intakeNarrative?: string;
}, {
    caseType?: CaseType;
    nnaId?: string;
    complainantId?: string;
    accusedId?: string;
    intakeNarrative?: string;
}>;
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export declare const formatPhase: (phase?: Phase | string) => string;
export declare const formatInterventionPath: (path?: InterventionPath | string) => string;
export declare const formatCaseType: (type?: CaseType | string) => string;
export declare const formatAppointmentType: (type?: AppointmentType | string) => string;
export declare const formatAppointmentStatus: (status?: AppointmentStatus | string) => string;
export declare const formatActionType: (type?: ActionType | string) => string;
export declare const formatRiskLevel: (risk?: RiskLevel | string) => string;
