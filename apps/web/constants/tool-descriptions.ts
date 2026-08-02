export interface ToolDescription {
  title: string;
  description: string;
  usage: string;
  steps: string[];
  benefits: string[];
  requiredRole: string[];
}

export const TOOL_DESCRIPTIONS: Record<string, ToolDescription> = {
  // HERRAMIENTAS LEGALES
  'legal-discrepancies': {
    title: 'Análisis de Discrepancias',
    description: 'Identifica inconsistencias y contradicciones en testimonios o declaraciones para fortalecer la estrategia legal.',
    usage: 'Se utiliza cuando existen múltiples versiones de los hechos o declaraciones contradictorias que requieren análisis detallado.',
    steps: [
      '1. Subir transcripción de entrevista o testimonio',
      '2. El sistema analiza patrones de inconsistencia',
      '3. Identifica discrepancias temporales, factuales y emocionales',
      '4. Genera preguntas específicas para aclaración',
      '5. Proporciona score de consistencia general'
    ],
    benefits: [
      'Detecta contradicciones que pueden pasar desapercibidas',
      'Fortalece la preparación de casos',
      'Ahorra tiempo en análisis manual',
      'Mejora la calidad de interrogatorios'
    ],
    requiredRole: ['ABOGADO', 'ADMINISTRADOR']
  },

  // HERRAMIENTAS PSICOLÓGICAS
  'psychological-trauma': {
    title: 'Indicadores de Trauma',
    description: 'Detecta signos psicológicos de trauma en testimonios para apoyar la evaluación clínica y legal.',
    usage: 'Esencial en casos de violencia, abuso o situaciones traumáticas donde se requiere evidencia psicológica.',
    steps: [
      '1. Analizar transcripción de entrevista psicológica',
      '2. Identificar patrones de lenguaje traumático',
      '3. Detectar indicadores emocionales y conductuales',
      '4. Clasificar severidad y tipo de trauma',
      '5. Recomendar intervenciones específicas'
    ],
    benefits: [
      'Detección temprana de trauma no reportado',
      'Apoyo en evaluaciones forenses',
      'Guía para tratamiento especializado',
      'Fortalece casos de reparación'
    ],
    requiredRole: ['PSICOLOGO', 'ADMINISTRADOR']
  },

  // HERRAMIENTAS SOCIALES
  'social-family-map': {
    title: 'Mapa Familiar',
    description: 'Genera visualización de redes familiares y sociales para entender dinámicas y factores de riesgo.',
    usage: 'Fundamental en casos de menores, violencia intrafamiliar o cuando las redes de apoyo son clave.',
    steps: [
      '1. Procesar información de entrevista social',
      '2. Identificar miembros del núcleo familiar',
      '3. Mapear relaciones y dinámicas',
      '4. Detectar factores de riesgo y protección',
      '5. Generar recomendaciones de intervención'
    ],
    benefits: [
      'Visualización clara de dinámicas familiares',
      'Identificación de redes de apoyo',
      'Detección de factores de riesgo',
      'Planificación de intervenciones efectivas'
    ],
    requiredRole: ['TRABAJADOR_SOCIAL', 'ADMINISTRADOR']
  },

  // HERRAMIENTAS TRANSVERSALES
  'transversal-timeline': {
    title: 'Línea de Tiempo',
    description: 'Construye cronología precisa de eventos para casos complejos con múltiples incidentes.',
    usage: 'Útil en casos con secuencia temporal compleja o cuando se necesita clarificar orden de eventos.',
    steps: [
      '1. Extraer eventos de múltiples fuentes',
      '2. Ordenar cronológicamente',
      '3. Identificar vacíos temporales',
      '4. Detectar patrones o escaladas',
      '5. Generar visualización interactiva'
    ],
    benefits: [
      'Clarifica secuencia de eventos',
      'Identifica inconsistencias temporales',
      'Facilita comprensión del caso',
      'Apoya narrativa legal'
    ],
    requiredRole: ['ABOGADO', 'PSICOLOGO', 'TRABAJADOR_SOCIAL', 'ADMINISTRADOR']
  },

  'transversal-risk-assessment': {
    title: 'Evaluación de Riesgo',
    description: 'Analiza factores de riesgo multidisciplinarios para determinar nivel de peligro y urgencia.',
    usage: 'Crítico en casos de violencia, amenazas o situaciones que requieren medidas de protección.',
    steps: [
      '1. Integrar información de todas las disciplinas',
      '2. Evaluar factores de riesgo conocidos',
      '3. Aplicar matrices de riesgo validadas',
      '4. Calcular score de peligrosidad',
      '5. Recomendar medidas de protección'
    ],
    benefits: [
      'Evaluación objetiva de riesgo',
      'Priorización de casos urgentes',
      'Justificación de medidas de protección',
      'Prevención de escaladas violentas'
    ],
    requiredRole: ['ABOGADO', 'PSICOLOGO', 'TRABAJADOR_SOCIAL', 'ADMINISTRADOR']
  }
};

export const getToolDescription = (toolKey: string): ToolDescription | null => {
  return TOOL_DESCRIPTIONS[toolKey] || null;
};

export const isToolAvailableForRole = (toolKey: string, userRole: string): boolean => {
  const tool = getToolDescription(toolKey);
  if (!tool) return false;
  return tool.requiredRole.includes(userRole);
};