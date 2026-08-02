"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatRiskLevel = exports.formatActionType = exports.formatAppointmentStatus = exports.formatAppointmentType = exports.formatCaseType = exports.formatInterventionPath = exports.formatPhase = exports.createCaseSchema = exports.createPersonSchema = exports.personSearchSchema = exports.loginSchema = exports.Priority = exports.NotificationType = exports.AppointmentStatus = exports.AppointmentType = exports.ReportStatus = exports.ReportType = exports.ActionType = exports.RoleInCase = exports.RiskLevel = exports.InterventionPath = exports.Phase = exports.CaseType = exports.Gender = exports.DocumentType = exports.Role = void 0;
const zod_1 = require("zod");
var Role;
(function (Role) {
    Role["ADMINISTRADOR"] = "ADMINISTRADOR";
    Role["JEFATURA"] = "JEFATURA";
    Role["ABOGADO"] = "ABOGADO";
    Role["PSICOLOGO"] = "PSICOLOGO";
    Role["SOCIAL"] = "SOCIAL";
    Role["SECRETARIA"] = "SECRETARIA";
    Role["REFERENTE_TUTOR"] = "REFERENTE_TUTOR";
})(Role || (exports.Role = Role = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["CI"] = "CI";
    DocumentType["PASAPORTE"] = "PASAPORTE";
    DocumentType["PARTIDA_NACIMIENTO"] = "PARTIDA_NACIMIENTO";
    DocumentType["SIN_DOCUMENTO"] = "SIN_DOCUMENTO";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var Gender;
(function (Gender) {
    Gender["MASCULINO"] = "MASCULINO";
    Gender["FEMENINO"] = "FEMENINO";
    Gender["OTRO"] = "OTRO";
})(Gender || (exports.Gender = Gender = {}));
var CaseType;
(function (CaseType) {
    CaseType["DENUNCIA_VULNERACION"] = "DENUNCIA_VULNERACION";
    CaseType["CONSUMO_SUSTANCIAS"] = "CONSUMO_SUSTANCIAS";
    CaseType["VENTA_ALCOHOL"] = "VENTA_ALCOHOL";
    CaseType["DERECHO_EDUCACION"] = "DERECHO_EDUCACION";
    CaseType["EXTRAVIO"] = "EXTRAVIO";
    CaseType["NNA_INFRACTOR"] = "NNA_INFRACTOR";
    CaseType["FISCALIZACION"] = "FISCALIZACION";
})(CaseType || (exports.CaseType = CaseType = {}));
var Phase;
(function (Phase) {
    Phase["DERIVACION"] = "DERIVACION";
    Phase["EVALUACION"] = "EVALUACION";
    Phase["SEGUIMIENTO"] = "SEGUIMIENTO";
    Phase["JUDICIALIZACION"] = "JUDICIALIZACION";
    Phase["CIERRE"] = "CIERRE";
})(Phase || (exports.Phase = Phase = {}));
var InterventionPath;
(function (InterventionPath) {
    InterventionPath["GESTION_ADMINISTRATIVA"] = "GESTION_ADMINISTRATIVA";
    InterventionPath["CONCILIACION"] = "CONCILIACION";
    InterventionPath["VIA_JUDICIAL"] = "VIA_JUDICIAL";
})(InterventionPath || (exports.InterventionPath = InterventionPath = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["BAJO"] = "BAJO";
    RiskLevel["MEDIO"] = "MEDIO";
    RiskLevel["ALTO"] = "ALTO";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var RoleInCase;
(function (RoleInCase) {
    RoleInCase["NNA"] = "NNA";
    RoleInCase["DENUNCIANTE"] = "DENUNCIANTE";
    RoleInCase["DENUNCIADO"] = "DENUNCIADO";
    RoleInCase["TUTOR"] = "TUTOR";
    RoleInCase["TESTIGO"] = "TESTIGO";
})(RoleInCase || (exports.RoleInCase = RoleInCase = {}));
var ActionType;
(function (ActionType) {
    ActionType["NOTA"] = "NOTA";
    ActionType["ENTREVISTA"] = "ENTREVISTA";
    ActionType["VISITA_DOMICILIARIA"] = "VISITA_DOMICILIARIA";
    ActionType["AUDIENCIA"] = "AUDIENCIA";
    ActionType["DERIVACION"] = "DERIVACION";
    ActionType["CONTACTO_INSTITUCIONAL"] = "CONTACTO_INSTITUCIONAL";
    ActionType["OTRO"] = "OTRO";
})(ActionType || (exports.ActionType = ActionType = {}));
var ReportType;
(function (ReportType) {
    ReportType["INFORME_SOCIAL"] = "INFORME_SOCIAL";
    ReportType["INFORME_PSICOLOGICO"] = "INFORME_PSICOLOGICO";
    ReportType["INFORME_PSICOSOCIAL"] = "INFORME_PSICOSOCIAL";
    ReportType["INFORME_JURIDICO"] = "INFORME_JURIDICO";
})(ReportType || (exports.ReportType = ReportType = {}));
var ReportStatus;
(function (ReportStatus) {
    ReportStatus["BORRADOR"] = "BORRADOR";
    ReportStatus["EMITIDO"] = "EMITIDO";
})(ReportStatus || (exports.ReportStatus = ReportStatus = {}));
var AppointmentType;
(function (AppointmentType) {
    AppointmentType["ENTREVISTA"] = "ENTREVISTA";
    AppointmentType["AUDIENCIA"] = "AUDIENCIA";
    AppointmentType["VISITA_DOMICILIARIA"] = "VISITA_DOMICILIARIA";
    AppointmentType["SEGUIMIENTO"] = "SEGUIMIENTO";
    AppointmentType["OTRO"] = "OTRO";
})(AppointmentType || (exports.AppointmentType = AppointmentType = {}));
var AppointmentStatus;
(function (AppointmentStatus) {
    AppointmentStatus["PROGRAMADA"] = "PROGRAMADA";
    AppointmentStatus["COMPLETADA"] = "COMPLETADA";
    AppointmentStatus["CANCELADA"] = "CANCELADA";
    AppointmentStatus["REPROGRAMADA"] = "REPROGRAMADA";
})(AppointmentStatus || (exports.AppointmentStatus = AppointmentStatus = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["PLAZO_LEGAL"] = "PLAZO_LEGAL";
    NotificationType["RIESGO_ALTO"] = "RIESGO_ALTO";
    NotificationType["ASIGNACION"] = "ASIGNACION";
    NotificationType["DERIVACION"] = "DERIVACION";
    NotificationType["GENERAL"] = "GENERAL";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var Priority;
(function (Priority) {
    Priority["NORMAL"] = "NORMAL";
    Priority["URGENTE"] = "URGENTE";
    Priority["CRITICA"] = "CRITICA";
})(Priority || (exports.Priority = Priority = {}));
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Correo electrónico inválido'),
    password: zod_1.z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});
exports.personSearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(2, 'Ingrese al menos 2 caracteres para buscar'),
});
exports.createPersonSchema = zod_1.z.object({
    documentType: zod_1.z.nativeEnum(DocumentType),
    documentNumber: zod_1.z.string().optional(),
    firstName: zod_1.z.string().min(2, 'El nombre es obligatorio'),
    lastName: zod_1.z.string().min(2, 'El apellido es obligatorio'),
    birthDate: zod_1.z.string().optional(),
    gender: zod_1.z.nativeEnum(Gender),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
exports.createCaseSchema = zod_1.z.object({
    caseType: zod_1.z.nativeEnum(CaseType),
    nnaId: zod_1.z.string().uuid('ID de NNA inválido'),
    complainantId: zod_1.z.string().uuid().optional(),
    accusedId: zod_1.z.string().uuid().optional(),
    intakeNarrative: zod_1.z.string().min(10, 'La narrativa de la denuncia debe tener al menos 10 caracteres'),
});
const formatPhase = (phase) => {
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
exports.formatPhase = formatPhase;
const formatInterventionPath = (path) => {
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
exports.formatInterventionPath = formatInterventionPath;
const formatCaseType = (type) => {
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
exports.formatCaseType = formatCaseType;
const formatAppointmentType = (type) => {
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
exports.formatAppointmentType = formatAppointmentType;
const formatAppointmentStatus = (status) => {
    switch (status) {
        case AppointmentStatus.PROGRAMADA:
            return 'Programada';
        case AppointmentStatus.COMPLETADA:
            return 'Completada';
        case AppointmentStatus.CANCELADA:
            return 'Cancelada';
        case AppointmentStatus.REPROGRAMADA:
            return 'Reprogramada';
        default:
            return status || 'N/A';
    }
};
exports.formatAppointmentStatus = formatAppointmentStatus;
const formatActionType = (type) => {
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
exports.formatActionType = formatActionType;
const formatRiskLevel = (risk) => {
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
exports.formatRiskLevel = formatRiskLevel;
//# sourceMappingURL=index.js.map