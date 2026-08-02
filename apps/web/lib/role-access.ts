'use client';

/**
 * Sistema centralizado de control de permisos por rol para herramientas Phase 2
 */

export type UserRole = 'ABOGADO' | 'PSICOLOGO' | 'SOCIAL' | 'JEFATURA' | 'ADMINISTRADOR' | 'SECRETARIA';
export type ToolId = 
  | 'legal_discrepancies'
  | 'legal_typicality'
  | 'legal_deadlines'
  | 'psychological_indicators'
  | 'psychological_scales'
  | 'psychological_translation'
  | 'psychological_trauma'
  | 'social_family'
  | 'social_vulnerability'
  | 'social_environmental'
  | 'transversal_timeline'
  | 'transversal_anonymize';

/**
 * Matriz de permisos: quién puede LEER y EDITAR cada herramienta
 */
export const TOOL_PERMISSIONS: Record<ToolId, { read: UserRole[]; write: UserRole[] }> = {
  // Legal Tools
  legal_discrepancies: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['ABOGADO', 'JEFATURA', 'ADMINISTRADOR'],
  },
  legal_typicality: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['ABOGADO', 'JEFATURA', 'ADMINISTRADOR'],
  },
  legal_deadlines: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['ABOGADO', 'JEFATURA', 'ADMINISTRADOR'],
  },

  // Psychological Tools
  psychological_indicators: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['PSICOLOGO', 'JEFATURA', 'ADMINISTRADOR'],
  },
  psychological_scales: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['PSICOLOGO', 'JEFATURA', 'ADMINISTRADOR'],
  },
  psychological_translation: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['PSICOLOGO', 'JEFATURA', 'ADMINISTRADOR'],
  },
  psychological_trauma: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['PSICOLOGO', 'JEFATURA', 'ADMINISTRADOR'],
  },

  // Social Tools
  social_family: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
  },
  social_vulnerability: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
  },
  social_environmental: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
  },

  // Transversal Tools (acceso completo para todos)
  transversal_timeline: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
  },
  transversal_anonymize: {
    read: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
    write: ['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'],
  },
};

/**
 * Orden de herramientas por rol para menú principal
 */
export const TOOL_ORDER_BY_ROLE: Record<UserRole, string[]> = {
  ABOGADO: [
    'Legal Tools',
    'Psychological Tools',
    'Social Tools',
    'Transversal Tools',
  ],
  PSICOLOGO: [
    'Psychological Tools',
    'Legal Tools',
    'Social Tools',
    'Transversal Tools',
  ],
  SOCIAL: [
    'Social Tools',
    'Psychological Tools',
    'Legal Tools',
    'Transversal Tools',
  ],
  JEFATURA: [
    'Legal Tools',
    'Psychological Tools',
    'Social Tools',
    'Transversal Tools',
  ],
  ADMINISTRADOR: [
    'Legal Tools',
    'Psychological Tools',
    'Social Tools',
    'Transversal Tools',
  ],
  SECRETARIA: [],
};

/**
 * Descripción de herramientas por módulo
 */
export const TOOL_DESCRIPTIONS: Record<string, { title: string; description: string; icon: string }> = {
  legal_discrepancies: {
    title: 'Análisis de Discrepancias',
    description: 'Identifica inconsistencias entre testimonios y documentos',
    icon: '⚖️',
  },
  legal_typicality: {
    title: 'Tipicidad Penal',
    description: 'Analiza si el relato se ajusta a tipos penales específicos',
    icon: '📋',
  },
  legal_deadlines: {
    title: 'Vencimientos Procesales',
    description: 'Calcula plazos legales importantes del caso',
    icon: '⏰',
  },
  psychological_indicators: {
    title: 'Indicadores de Trauma',
    description: 'Extrae indicadores de daño emocional y trauma',
    icon: '🧠',
  },
  psychological_scales: {
    title: 'Escalas de Riesgo',
    description: 'Pre-llena escalas de evaluación psicológica',
    icon: '📊',
  },
  psychological_translation: {
    title: 'Traducción Clínica',
    description: 'Traduce notas clínicas a lenguaje forense',
    icon: '💬',
  },
  psychological_trauma: {
    title: 'Análisis de Trauma',
    description: 'Analiza trauma acumulado y exposición',
    icon: '🔍',
  },
  social_family: {
    title: 'Estructura Familiar',
    description: 'Genera familiograma y mapa de relaciones',
    icon: '👨‍👩‍👧‍👦',
  },
  social_vulnerability: {
    title: 'Evaluación Vulnerabilidad',
    description: 'Calcula índice de vulnerabilidad social',
    icon: '⚠️',
  },
  social_environmental: {
    title: 'Mapeo Ambiental',
    description: 'Mapea factores de riesgo del entorno',
    icon: '🏘️',
  },
  transversal_timeline: {
    title: 'Línea de Tiempo Unificada',
    description: 'Consolida eventos de todos los equipos',
    icon: '📅',
  },
  transversal_anonymize: {
    title: 'Reporte Anonimizado',
    description: 'Anonimiza datos sensibles en reportes',
    icon: '🔒',
  },
};

/**
 * Obtener herramientas según rol
 */
export function getToolsByRole(role: UserRole): ToolId[] {
  const tools: ToolId[] = [];

  if (role === 'SECRETARIA') return tools; // Sin herramientas

  // Legal Tools
  if (['ABOGADO', 'JEFATURA', 'ADMINISTRADOR'].includes(role)) {
    tools.push('legal_discrepancies', 'legal_typicality', 'legal_deadlines');
  }

  // Psychological Tools
  if (['PSICOLOGO', 'JEFATURA', 'ADMINISTRADOR'].includes(role)) {
    tools.push('psychological_indicators', 'psychological_scales', 'psychological_translation', 'psychological_trauma');
  }

  // Social Tools
  if (['SOCIAL', 'JEFATURA', 'ADMINISTRADOR'].includes(role)) {
    tools.push('social_family', 'social_vulnerability', 'social_environmental');
  }

  // Transversal (todos excepto Secretaria)
  if (['ABOGADO', 'PSICOLOGO', 'SOCIAL', 'JEFATURA', 'ADMINISTRADOR'].includes(role)) {
    tools.push('transversal_timeline', 'transversal_anonymize');
  }

  return tools;
}

/**
 * Verificar si usuario puede LEER herramienta
 */
export function canReadTool(userRole: UserRole, toolId: ToolId): boolean {
  const permissions = TOOL_PERMISSIONS[toolId];
  if (!permissions) return false;
  return permissions.read.includes(userRole);
}

/**
 * Verificar si usuario puede EDITAR herramienta
 */
export function canWriteTool(userRole: UserRole, toolId: ToolId): boolean {
  const permissions = TOOL_PERMISSIONS[toolId];
  if (!permissions) return false;
  return permissions.write.includes(userRole);
}

/**
 * Agrupar herramientas por módulo
 */
export function groupToolsByModule(tools: ToolId[]): Record<string, ToolId[]> {
  return {
    legal: tools.filter((t) => t.startsWith('legal_')),
    psychological: tools.filter((t) => t.startsWith('psychological_')),
    social: tools.filter((t) => t.startsWith('social_')),
    transversal: tools.filter((t) => t.startsWith('transversal_')),
  };
}

/**
 * Obtener descripción de herramienta
 */
export function getToolDescription(toolId: ToolId) {
  return TOOL_DESCRIPTIONS[toolId] || { title: 'Herramienta', description: '', icon: '🔧' };
}

/**
 * Mensajes de error personalizados por acceso denegado
 */
export const ACCESS_DENIED_MESSAGES: Record<UserRole, string> = {
  ABOGADO: 'Como abogado, solo puedes acceder a herramientas legales y transversales. Consulta con el equipo especializado para otros análisis.',
  PSICOLOGO: 'Como psicólogo, solo puedes acceder a herramientas psicológicas y transversales. Consulta con el equipo legal para otros análisis.',
  SOCIAL: 'Como trabajador social, solo puedes acceder a herramientas sociales y transversales. Consulta con el equipo especializado para otros análisis.',
  JEFATURA: 'Como jefe, tienes acceso a todas las herramientas del equipo.',
  ADMINISTRADOR: 'Como administrador, tienes acceso a todas las herramientas.',
  SECRETARIA: 'Como secretaría, no tienes acceso a herramientas de análisis. Contacta a un profesional del equipo.',
};
