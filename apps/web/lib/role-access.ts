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
  | 'transversal_anonymize'
  | 'transversal_transcription';

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
  transversal_transcription: {
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
export const TOOL_DESCRIPTIONS: Record<string, { title: string; description: string; icon: string; steps: string }> = {
  legal_discrepancies: {
    title: 'Análisis de Discrepancias',
    description: 'Identifica inconsistencias entre testimonios y documentos',
    icon: '⚖️',
    steps: '1. Selecciona el caso\n2. Sube o elige una transcripción\n3. El sistema detecta contradicciones automáticamente\n4. Revisa las preguntas sugeridas para aclaración',
  },
  legal_typicality: {
    title: 'Tipicidad Penal',
    description: 'Analiza si el relato se ajusta a tipos penales específicos',
    icon: '📋',
    steps: '1. Ingresa o carga el relato del caso\n2. El sistema compara con tipos penales\n3. Recibe un listado de posibles figuras aplicables\n4. Usa la recomendación para fundamentar la denuncia',
  },
  legal_deadlines: {
    title: 'Vencimientos Procesales',
    description: 'Calcula plazos legales importantes del caso',
    icon: '⏰',
    steps: '1. Ingresa la fecha de inicio del proceso\n2. Selecciona el tipo de procedimiento\n3. El sistema calcula todos los plazos críticos\n4. Recibe alertas de vencimientos próximos',
  },
  psychological_indicators: {
    title: 'Indicadores de Trauma',
    description: 'Extrae indicadores de daño emocional y trauma',
    icon: '🧠',
    steps: '1. Carga la transcripción de la entrevista\n2. El sistema analiza el lenguaje y respuestas\n3. Identifica indicadores de trauma presentes\n4. Genera informe con severidad y tipo de trauma',
  },
  psychological_scales: {
    title: 'Escalas de Riesgo',
    description: 'Pre-llena escalas de evaluación psicológica',
    icon: '📊',
    steps: '1. Selecciona la escala a completar (ej. ACES, PHQ-9)\n2. Ingresa la transcripción o resumen de sesión\n3. El sistema pre-llena los ítems con evidencia\n4. Revisa y ajusta antes de finalizar',
  },
  psychological_translation: {
    title: 'Traducción Clínica',
    description: 'Traduce notas clínicas a lenguaje forense',
    icon: '💬',
    steps: '1. Ingresa las notas clínicas del expediente\n2. Selecciona el contexto destino (forense/legal)\n3. El sistema traduce la terminología\n4. Exporta el texto adaptado para el informe',
  },
  psychological_trauma: {
    title: 'Análisis de Trauma',
    description: 'Analiza trauma acumulado y exposición',
    icon: '🔍',
    steps: '1. Carga historial de sesiones o transcripciones\n2. El sistema evalúa exposición acumulada\n3. Identifica patrones de trauma complejo\n4. Sugiere intervenciones terapéuticas',
  },
  social_family: {
    title: 'Estructura Familiar',
    description: 'Genera familiograma y mapa de relaciones',
    icon: '👨‍👩‍👧‍👦',
    steps: '1. Ingresa los datos de la entrevista familiar\n2. El sistema construye el familiograma\n3. Visualiza relaciones y dinámicas\n4. Identifica factores de riesgo y protección',
  },
  social_vulnerability: {
    title: 'Evaluación Vulnerabilidad',
    description: 'Calcula índice de vulnerabilidad social',
    icon: '⚠️',
    steps: '1. Completa los factores sociales del caso\n2. El sistema pondera cada dimensión\n3. Genera un índice de vulnerabilidad\n4. Recibe recomendaciones de intervención',
  },
  social_environmental: {
    title: 'Mapeo Ambiental',
    description: 'Mapea factores de riesgo del entorno',
    icon: '🏘️',
    steps: '1. Ingresa información del entorno del NNA\n2. El sistema identifica riesgos comunitarios\n3. Mapea recursos disponibles en la zona\n4. Genera plan de intervención contextualizado',
  },
  transversal_timeline: {
    title: 'Línea de Tiempo Unificada',
    description: 'Consolida eventos de todos los equipos',
    icon: '📅',
    steps: '1. El sistema recopila eventos de todos los módulos\n2. Los ordena cronológicamente\n3. Detecta vacíos y inconsistencias temporales\n4. Genera visualización compartida del caso',
  },
  transversal_anonymize: {
    title: 'Reporte Anonimizado',
    description: 'Anonimiza datos sensibles en reportes',
    icon: '🔒',
    steps: '1. Selecciona el reporte o documento a anonimizar\n2. El sistema detecta datos identificables\n3. Aplica técnicas de anonimización segura\n4. Descarga el documento listo para compartir',
  },
  transversal_transcription: {
    title: 'Transcripción de Audio/Video',
    description: 'Convierte grabaciones de audio/video a texto usando Whisper AI',
    icon: '🎙️',
    steps: '1. Selecciona el caso y la evidencia de audio/video\n2. El sistema envía el archivo a Whisper para transcribir\n3. Espera a que se complete (estado: PENDIENTE → COMPLETADA)\n4. Ve el resultado en "Ver Transcripción" en la galería de evidencias',
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
