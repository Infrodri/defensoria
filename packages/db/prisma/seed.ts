import { PrismaClient, Role, CaseType, Phase, InterventionPath, RiskLevel, RoleInCase } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// =====================================================
// 7 NORMATIVE DOCUMENT TEMPLATES - LEY 548 (SUCRE)
// =====================================================
const templates = [
  {
    code: 'TS-01',
    name: 'Ficha Social',
    documentType: 'FICHA_SOCIAL',
    targetRole: Role.SOCIAL,
    requiresCoAuthor: false,
    structure: {
      sections: [
        {
          key: 'identificacion',
          title: '1. Identificación del NNA y Grupo Familiar',
          required: true,
          promptTemplate: 'Redacte la identificación completa del NNA y su grupo familiar. Incluya: nombre completo, fecha de nacimiento, documento de identidad, composición familiar (padres, tutores, hermanos), dirección y teléfono de contacto. {caseContext} {ragContext} [RAG-INSTRUCTION: Use solo datos verificados en la ficha de ingesta y evidencias del expediente. No invente información.]',
        },
        {
          key: 'motivo_ingreso',
          title: '2. Motivo de Ingreso / Denuncia',
          required: true,
          promptTemplate: 'Describa el motivo de ingreso o denuncia que originó la intervención. Detalle: tipo de vulneración detectada, fuente de la denuncia, fecha y circunstancias. {caseContext} {ragContext} [RAG-INSTRUCTION: Base su redacción en el relato de ingesta y actas de entrevista. Cite textualmente cuando sea posible.]',
        },
        {
          key: 'antecedentes',
          title: '3. Antecedentes Familiares y Sociales',
          required: true,
          promptTemplate: 'Exponga los antecedentes relevantes: situación habitacional, ingresos económicos, red de apoyo, historial de intervenciones previas, consumo de sustancias en el hogar, violencia intrafamiliar. {caseContext} {ragContext} [RAG-INSTRUCTION: Priorice información de visitas domiciliarias, informes previos y declaraciones de referentes comunitarios.]',
        },
        {
          key: 'evaluacion_riesgo',
          title: '4. Evaluación de Riesgo y Protección',
          required: true,
          promptTemplate: 'Analice los factores de riesgo y protección según Ley 548 Art. 14. Identifique: peligrosidad inminente, vulnerabilidad del NNA, capacidad protectora de los cuidadores, red comunitaria disponible. Concluya con nivel de riesgo (ALTO/MEDIO/BAJO). {caseContext} {ragContext} [RAG-INSTRUCTION: Use la escala de riesgo institucional. Justifique cada factor con evidencia del expediente.]',
        },
        {
          key: 'plan_intervencion',
          title: '5. Plan de Intervención Inmediata',
          required: true,
          promptTemplate: 'Proponga medidas inmediatas de protección (Art. 50 Ley 548): separación del agresor, acogimiento, derivación a servicios de salud/educación, activación de red de apoyo. Especifique responsables, plazos y criterios de seguimiento. {caseContext} {ragContext} [RAG-INSTRUCTION: Las medidas deben ser concretas, ejecutables y con responsable designado. Cite base legal.]',
        },
      ],
    },
  },
  {
    code: 'TS-02',
    name: 'Informe Social Inicial',
    documentType: 'INFORME_SOCIAL_INICIAL',
    targetRole: Role.SOCIAL,
    requiresCoAuthor: false,
    structure: {
      sections: [
        {
          key: 'datos_generales',
          title: '1. Datos Generales del Expediente',
          required: true,
          promptTemplate: 'Consigne: número de caso, fecha de inicio de intervención, profesional a cargo, oficina distrital, tipo de vulneración. {caseContext}',
        },
        {
          key: 'marco_referencial',
          title: '2. Marco Referencial Normativo',
          required: true,
          promptTemplate: 'Cite la base legal: Ley 548 (Código Niña, Niño y Adolescente), Arts. 14, 50, 51, 52; Constitución Política del Estado Arts. 58, 59; Convención sobre Derechos del Niño. {ragContext} [RAG-INSTRUCTION: Use citas textuales de los artículos aplicables al caso.]',
        },
        {
          key: 'metodologia',
          title: '3. Metodología de Investigación Social',
          required: true,
          promptTemplate: 'Describa técnicas aplicadas: entrevista familiar, visita domiciliaria, observación participante, genograma, ecomapa, consulta a fuentes institucionales (SALUD, EDUCACIÓN, FELCC). Fechas y responsables de cada actuación. {caseContext} {ragContext}',
        },
        {
          key: 'analisis_situacional',
          title: '4. Análisis Situacional de la Vulneración',
          required: true,
          promptTemplate: 'Analice la vulneración desde el enfoque de derechos: derecho vulnerado, autor/es de la vulneración, contexto de ocurrimiento, impacto en el desarrollo del NNA, factores de persistencia. {caseContext} {ragContext} [RAG-INSTRUCTION: Distinga hechos probados de presunciones. Use evidencia del expediente.]',
        },
        {
          key: 'diagnostico_social',
          title: '5. Diagnóstico Social',
          required: true,
          promptTemplate: 'Formule diagnóstico social integrando: situación de riesgo, capacidades protectoras familiares, red de apoyo disponible, pronóstico sin intervención. {caseContext} {ragContext}',
        },
        {
          key: 'conclusiones_recomendaciones',
          title: '6. Conclusiones y Recomendaciones',
          required: true,
          promptTemplate: 'Presente conclusiones fundadas y recomendaciones concretas: medidas de protección (Art. 50), derivaciones, seguimiento, plazos de reevalución. {caseContext} {ragContext} [RAG-INSTRUCTION: Cada recomendación debe tener responsable, plazo y criterio de verificación.]',
        },
      ],
    },
  },
  {
    code: 'PSI-01',
    name: 'Intervención en Crisis',
    documentType: 'INTERVENCION_CRISIS',
    targetRole: Role.PSICOLOGO,
    requiresCoAuthor: false,
    structure: {
      sections: [
        {
          key: 'datos_intervencion',
          title: '1. Datos de la Intervención en Crisis',
          required: true,
          promptTemplate: 'Registre: fecha, hora, lugar, motivo de activación (tentativa autoeliminatoria, brote psicótico, trauma agudo, violencia sexual), profesional interviniente, acompañantes. {caseContext}',
        },
        {
          key: 'evaluacion_inicial',
          title: '2. Evaluación Inicial de Riesgo Inminente',
          required: true,
          promptTemplate: 'Aplique protocolo de evaluación de riesgo: ideación/plan/medios suicidas, nivel de consciencia, riesgo heteroagresivo, necesidad de contención física/farmacológica. Escala utilizada (ej. Columbia-Suicide Severity Rating Scale adaptada). {caseContext} {ragContext} [RAG-INSTRUCTION: Documente hallazgos observables, no impresiones. Cite instrumento.]',
        },
        {
          key: 'contencion_estabilizacion',
          title: '3. Contención y Estabilización',
          required: true,
          promptTemplate: 'Describa técnicas de contención aplicadas: validación emocional, grounding, psicoeducación inmediata, plan de seguridad, activación red de apoyo, derivación a servicio de urgencia. {caseContext} {ragContext}',
        },
        {
          key: 'plan_seguimiento',
          title: '4. Plan de Seguimiento Post-Crisis',
          required: true,
          promptTemplate: 'Establezca: citas de control (24h, 72h, 7 días), responsable de seguimiento, señal de alarma para reactivación, compromisos del NNA y familia, derivaciones a psiquiatría/terapia. {caseContext} {ragContext} [RAG-INSTRUCTION: El plan debe ser escrito, firmado por NNA/familia y profesional.]',
        },
      ],
    },
  },
  {
    code: 'PSI-02',
    name: 'Informe Psicológico Inicial',
    documentType: 'INFORME_PSICOLOGICO_INICIAL',
    targetRole: Role.PSICOLOGO,
    requiresCoAuthor: false,
    structure: {
      sections: [
        {
          key: 'identificacion',
          title: '1. Identificación y Datos de Referencia',
          required: true,
          promptTemplate: 'Datos del NNA, fecha de evaluación, motivo de derivación, fuente de derivación, instrumentos aplicados, sesiones realizadas. {caseContext}',
        },
        {
          key: 'marco_teorico',
          title: '2. Marco Teórico y Metodológico',
          required: true,
          promptTemplate: 'Enfoque utilizado (sistémico, cognitivo-conductual, trauma-informed), instrumentos estandarizados (ej. HTC, CAT-A, CES-DC, Escala de Resiliencia), consideraciones éticas (confidencialidad, consentimiento). {ragContext}',
        },
        {
          key: 'historia_clinica',
          title: '3. Historia Clínica y Desarrollo',
          required: true,
          promptTemplate: 'Antecedentes prenatales/perinatales, hitos del desarrollo, historia médica, antecedentes psiquiátricos familiares, eventos vitales traumáticos, escolaridad, funcionamiento social. {caseContext} {ragContext} [RAG-INSTRUCTION: Integre información de entrevistas, historia social y registros médicos.]',
        },
        {
          key: 'exploracion_actual',
          title: '4. Exploración Psicológica Actual',
          required: true,
          promptTemplate: 'Estado mental (apariencia, conducta, lenguaje, pensamiento, afecto, conciencia, orientación, memoria, atención, juicio, insight), resultados de pruebas proyectivas y psicométricas, hallazgos clínicos relevantes. {caseContext} {ragContext}',
        },
        {
          key: 'analisis_diagnostico',
          title: '5. Análisis e Impresión Diagnóstica',
          required: true,
          promptTemplate: 'Integración de datos: hipótesis diagnóstica (CIE-11/DSM-5), diagnóstico diferencial, comorbilidades, factores de riesgo y protección, funcionamiento global (Escala GAF/WHODAS). {caseContext} {ragContext} [RAG-INSTRUCTION: Diferencie síntomas reactivos de trastornos establecidos. Fundamente con criterios diagnósticos.]',
        },
        {
          key: 'pronostico_tratamiento',
          title: '6. Pronóstico y Plan de Tratamiento',
          required: true,
          promptTemplate: 'Pronóstico (favorable/reservado/guarded), objetivos terapéuticos (corto/mediano/largo plazo), modalidad (individual/familiar/grupal), frecuencia, técnicas, criterios de alta, derivaciones interdisciplinarias. {caseContext} {ragContext}',
        },
      ],
    },
  },
  {
    code: 'LEG-01',
    name: 'Dictamen de Tipicidad',
    documentType: 'DICTAMEN_TIPICIDAD',
    targetRole: Role.ABOGADO,
    requiresCoAuthor: false,
    structure: {
      sections: [
        {
          key: 'identificacion_caso',
          title: '1. Identificación del Caso y Hechos Denunciados',
          required: true,
          promptTemplate: 'Número de expediente, NNA víctima, denunciante, hechos denunciados (lugar, fecha, modo, participantes), calificación legal preliminar. {caseContext}',
        },
        {
          key: 'marco_normativo',
          title: '2. Marco Normativo Aplicable',
          required: true,
          promptTemplate: 'Cite artículos del Código Penal Boliviano, Ley 548, Ley 348 (Violencia contra la Mujer), Ley 263 (Trata y Tráfico), Convención sobre Derechos del Niño, según tipo penal imputado. {ragContext} [RAG-INSTRUCTION: Use texto legal vigente. Diferencie tipos penales dolosos/culposos.]',
        },
        {
          key: 'analisis_tipicidad',
          title: '3. Análisis de Tipicidad Objetiva y Subjetiva',
          required: true,
          promptTemplate: 'Verifique cada elemento del tipo penal: conducta (acción/omisión), resultado, nexo causal, tipicidad objetiva (adecuación típica), tipicidad subjetiva (dolo/culpa), autoría y participación. {caseContext} {ragContext} [RAG-INSTRUCTION: Analice elemento por elemento. Cite jurisprudencia del TSJ y TCP si aplica.]',
        },
        {
          key: 'antijuricidad_culpabilidad',
          title: '4. Antijuridicidad y Culpabilidad',
          required: true,
          promptTemplate: 'Analice causas de justificación (legítima defensa, estado de necesidad, cumplimiento de deber, consentimiento) y causas de inculpabilidad (inimputabilidad, error de tipo, coacción irresistible). Edad de imputabilidad (Art. 197 Ley 548: 14 años). {caseContext} {ragContext}',
        },
        {
          key: 'conclusion_petitum',
          title: '5. Conclusión y Petitum',
          required: true,
          promptTemplate: 'Conclusión fundamentada: existe/no existe tipicidad. Si existe: calificación legal precisa, pena prevista, solicitud de apertura de investigación penal, medidas cautelares (detención preventiva, arraigo, prohibición de salida). {caseContext} {ragContext} [RAG-INSTRUCTION: El petitum debe ser claro, concreto y jurídicamente fundado.]',
        },
      ],
    },
  },
  {
    code: 'LEG-02',
    name: 'Memorial Denuncia Penal',
    documentType: 'MEMORIAL_DENUNCIA_PENAL',
    targetRole: Role.ABOGADO,
    requiresCoAuthor: false,
    structure: {
      sections: [
        {
          key: 'encabezado',
          title: '1. Encabezado y Competencia',
          required: true,
          promptTemplate: 'Dirigido a Fiscalía Departamental/Seccional correspondiente. Identificación del denunciante (Defensor/a), NNA víctima, domicilio procesal, competencia ratione materiae y loci. {caseContext}',
        },
        {
          key: 'hechos',
          title: '2. Relato de Hechos',
          required: true,
          promptTemplate: 'Narración cronológica, clara y precisa de los hechos denunciados: quién, qué, cuándo, dónde, cómo, con qué medios. Diferencie hechos directos de referidos. {caseContext} {ragContext} [RAG-INSTRUCTION: Use lenguaje técnico-jurídico. Evite calificaciones jurídicas en el relato fáctico.]',
        },
        {
          key: 'fundamentos_juridicos',
          title: '3. Fundamentos Jurídicos y Calificación Legal',
          required: true,
          promptTemplate: 'Calificación legal provisional (tipo penal, artículo, inciso), fundamentación de cada elemento del tipo, jurisprudencia aplicable, doctrina. {ragContext} [RAG-INSTRUCTION: Cite artículos exactos. Distinga entre autoría y participación.]',
        },
        {
          key: 'pruebas_ofrecidas',
          title: '4. Pruebas Ofrecidas',
          required: true,
          promptTemplate: 'Enumere y describa: testificales (identifique testigos), documentales (informes médicos, psicológicos, sociales, actas), periciales (médico-forense, psicológica, ambiental), indicios materiales, inspección ocular. {caseContext} {ragContext} [RAG-INSTRUCTION: Relacione cada prueba con el elemento del tipo que acredita.]',
        },
        {
          key: 'petitorio',
          title: '5. Petitorio',
          required: true,
          promptTemplate: 'Solicite: recepción de denuncia, apertura de investigación preparatoria, citación a declarar al denunciado, medidas cautelares personales/reales, protección de la víctima (Art. 50 Ley 548), reserva del caso. {caseContext} [RAG-INSTRUCTION: Petitorio numerado, claro y fundado.]',
        },
      ],
    },
  },
  {
    code: 'IPS-01',
    name: 'Informe Psicosocial',
    documentType: 'INFORME_PSICOSOCIAL',
    targetRole: Role.PSICOLOGO,
    requiresCoAuthor: true,
    structure: {
      sections: [
        {
          key: 'identificacion_conjunta',
          title: '1. Identificación y Profesionales Intervinientes',
          required: true,
          promptTemplate: 'Datos del NNA, número de caso, profesionales firmantes: Psicólogo/a (nombre, matrícula) y Trabajador/a Social (nombre, matrícula), fechas de evaluación conjunta. {caseContext}',
        },
        {
          key: 'metodologia_integrada',
          title: '2. Metodología de Evaluación Integrada',
          required: true,
          promptTemplate: 'Describa abordaje interdisciplinario: entrevistas conjuntas/separadas, observación de interacción familiar, genograma/ecomapa compartido, aplicación de escalas validadas (ej. FACES-IV, APGAR familiar, Escala de Riesgo Psicosocial). {caseContext} {ragContext}',
        },
        {
          key: 'analisis_psicologico',
          title: '3. Análisis Psicológico (Ámbito Psicológico)',
          required: true,
          promptTemplate: 'Estado emocional, indicadores de trauma, apego, funcionamiento cognitivo, recursos de afrontamiento, sintomatología, diagnóstico provisional. Responsable: Psicólogo/a. {caseContext} {ragContext} [RAG-INSTRUCTION: El psicólogo firma esta sección.]',
        },
        {
          key: 'analisis_social',
          title: '4. Análisis Social (Ámbito Social)',
          required: true,
          promptTemplate: 'Dinámica familiar, red de apoyo, condiciones habitacionales, situación socioeconómica, riesgo social, factores protectores comunitarios, intervenciones previas. Responsable: Trabajador/a Social. {caseContext} {ragContext} [RAG-INSTRUCTION: El trabajador social firma esta sección.]',
        },
        {
          key: 'sintesis_integrada',
          title: '5. Síntesis Integrada y Diagnóstico Psicosocial',
          required: true,
          promptTemplate: 'Integración de hallazgos: interacción entre factores psicológicos y sociales, diagnóstico psicosocial compartido, nivel de riesgo integral (ALTO/MEDIO/BAJO), pronóstico conjunto. Firmado por AMBOS profesionales. {caseContext} {ragContext} [RAG-INSTRUCTION: Requiere firma de ambos profesionales. Consenso obligatorio en diagnóstico y riesgo.]',
        },
        {
          key: 'recomendaciones_conjuntas',
          title: '6. Recomendaciones Interdisciplinarias',
          required: true,
          promptTemplate: 'Medidas de protección (Art. 50 Ley 548), plan de intervención psicosocial, derivaciones especializadas, criterios de seguimiento y reevalución, responsables y plazos. Firmado por AMBOS. {caseContext} {ragContext} [RAG-INSTRUCTION: Cada recomendación con responsable (psicología/social/both), plazo y indicador de cumplimiento.]',
        },
      ],
    },
  },
];

async function main() {
  console.log('🌱 Starting multi-district comprehensive seed for DNA Sucre (All 9 Districts)...');

  // 0. Clean up existing test records for clean idempotent seeding
  await prisma.actionLog.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.inspectionFinding.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.establishment.deleteMany({});
  await prisma.transcription.deleteMany({});
  await prisma.evidence.deleteMany({});
  await prisma.caseTeamHistory.deleteMany({});
  await prisma.caseOfficeHistory.deleteMany({});
  await prisma.interventionPathHistory.deleteMany({});
  await prisma.caseParty.deleteMany({});
  await prisma.caseChunk.deleteMany({});
  await prisma.case.deleteMany({});
  await prisma.person.deleteMany({});
  await prisma.systemModule.deleteMany({});

  // Seed Default System Modules for RBAC Matrix
  const defaultModules = [
    {
      code: 'MOD_DISTRICTS',
      name: 'Gestión de Distritos (CRUD)',
      description: 'Administración de oficinas distritales y sedes municipales',
      isCustom: false,
      permissions: { ADMINISTRADOR: '✅ Total', JEFATURA: '❌', ABOGADO: '❌', PSICOLOGO: '❌', SOCIAL: '❌', SECRETARIA: '❌' },
    },
    {
      code: 'MOD_USERS',
      name: 'Gestión de Funcionarios & Roles',
      description: 'Alta, edición, asignación de distritos y claves de personal',
      isCustom: false,
      permissions: { ADMINISTRADOR: '✅ Total', JEFATURA: '✅ Lectura/Creación', ABOGADO: '❌', PSICOLOGO: '❌', SOCIAL: '❌', SECRETARIA: '❌' },
    },
    {
      code: 'MOD_CASES_INGEST',
      name: 'Ingesta de Expedientes',
      description: 'Registro e ingreso formal de denuncias y derivaciones',
      isCustom: false,
      permissions: { ADMINISTRADOR: '✅', JEFATURA: '✅', ABOGADO: '❌', PSICOLOGO: '❌', SOCIAL: '❌', SECRETARIA: '✅ Titular' },
    },
    {
      code: 'MOD_CASES_ACCESS',
      name: 'Acceso a Expedientes',
      description: 'Visualización y seguimiento de casos',
      isCustom: false,
      permissions: { ADMINISTRADOR: '✅ Todos', JEFATURA: '✅ Todos', ABOGADO: '📋 Asignados', PSICOLOGO: '📋 Asignados', SOCIAL: '📋 Asignados', SECRETARIA: '✅ Todos' },
    },
    {
      code: 'MOD_REPORTS',
      name: 'Emisión de Informes Especialidad',
      description: 'Redacción e inmutabilidad de informes técnicos',
      isCustom: false,
      permissions: { ADMINISTRADOR: 'Lectura', JEFATURA: 'Lectura', ABOGADO: 'Jurídicos', PSICOLOGO: 'Psicológicos', SOCIAL: 'Sociales', SECRETARIA: '❌' },
    },
    {
      code: 'MOD_INSPECTIONS',
      name: 'Inspecciones & Fiscalización',
      description: 'Operativos en vía pública, establecimientos nocturnos y escuelas',
      isCustom: false,
      permissions: { ADMINISTRADOR: '✅ Total', JEFATURA: '✅', ABOGADO: '✅', PSICOLOGO: '❌', SOCIAL: '❌', SECRETARIA: '✅' },
    },
    {
      code: 'MOD_AUDIT',
      name: 'Auditoría Inmutable de Sistema',
      description: 'Consulta de bitácora general inmutable de eventos',
      isCustom: false,
      permissions: { ADMINISTRADOR: '✅ Consulta Total', JEFATURA: '✅ Consulta', ABOGADO: '❌', PSICOLOGO: '❌', SOCIAL: '❌', SECRETARIA: '❌' },
    },
  ];

  for (const mod of defaultModules) {
    await prisma.systemModule.upsert({
      where: { code: mod.code },
      update: mod,
      create: mod,
    });
  }

  // 1. Create All 9 District Offices of Sucre
  const officesToSeed = [
    { code: 'CENTRAL', name: 'Defensoría Central Sucre', address: 'Calle Junín N° 450, Sucre', phone: '+591 4 64-51234' },
    { code: 'DIST_1', name: 'Defensoría Distrital 1 - Mercado Campesino', address: 'Av. Las Delicias N° 120, Sucre', phone: '+591 4 64-59876' },
    { code: 'DIST_2', name: 'Defensoría Distrital 2 - Alto Delicias / Lajastambo', address: 'Av. Juana Azurduy N° 850, Sucre', phone: '+591 4 64-52211' },
    { code: 'DIST_3', name: 'Defensoría Distrital 3 - Yurac Yurac / Max Toledo', address: 'Av. 6 de Marzo N° 310, Sucre', phone: '+591 4 64-53322' },
    { code: 'DIST_4', name: 'Defensoría Distrital 4 - San José / Villa Armonía', address: 'Av. Jaime Mendoza N° 1100, Sucre', phone: '+591 4 64-54433' },
    { code: 'DIST_5', name: 'Defensoría Distrital 5 - Aranjuez / Azari', address: 'Av. Panamericana N° 420, Sucre', phone: '+591 4 64-55544' },
    { code: 'DIST_6', name: 'Defensoría Distrital 6 - Distrito Rural Arabate', address: 'Subalcaldía Arabate, Comunidad Arabate', phone: '+591 4 64-56655' },
    { code: 'DIST_7', name: 'Defensoría Distrital 7 - Distrito Rural Chataquila', address: 'Centro Cívico Chataquila, Sucre', phone: '+591 4 64-57766' },
    { code: 'DIST_8', name: 'Defensoría Distrital 8 - Distrito Rural Potolo', address: 'Subalcaldía Potolo, Plaza Principal Potolo', phone: '+591 4 64-58877' },
  ];

  const officeMap: Record<string, any> = {};

  for (const off of officesToSeed) {
    const created = await prisma.office.upsert({
      where: { code: off.code },
      update: { name: off.name, address: off.address, phone: off.phone },
      create: { code: off.code, name: off.name, address: off.address, phone: off.phone },
    });
    officeMap[off.code] = created;
  }

  console.log(`✅ All 9 District Offices created successfully!`);

  // 2. Hash default password
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 3. Seed Staff Users for EACH District (Prefixed by District Name)
  const usersToSeed = [
    // Oficina Central
    { email: 'admin@defensoria.gob.bo', firstName: '[Central]', lastName: 'Administrador General', role: Role.ADMINISTRADOR, officeCode: 'CENTRAL' },
    { email: 'jefatura@defensoria.gob.bo', firstName: '[Central]', lastName: 'Elena Vargas', role: Role.JEFATURA, officeCode: 'CENTRAL' },
    { email: 'secretaria@defensoria.gob.bo', firstName: '[Central]', lastName: 'Mariana Soliz', role: Role.SECRETARIA, officeCode: 'CENTRAL' },
    { email: 'abogado@defensoria.gob.bo', firstName: '[Central]', lastName: 'Carlos Mendoza', role: Role.ABOGADO, officeCode: 'CENTRAL' },
    { email: 'psicologo@defensoria.gob.bo', firstName: '[Central]', lastName: 'Sofía Ríos', role: Role.PSICOLOGO, officeCode: 'CENTRAL' },
    { email: 'social@defensoria.gob.bo', firstName: '[Central]', lastName: 'Roberto Quinteros', role: Role.SOCIAL, officeCode: 'CENTRAL' },

    // Distrito 1
    { email: 'secretaria.d1@defensoria.gob.bo', firstName: '[Distrito 1]', lastName: 'Patricia Villalba', role: Role.SECRETARIA, officeCode: 'DIST_1' },
    { email: 'abogado.d1@defensoria.gob.bo', firstName: '[Distrito 1]', lastName: 'Fernando Morales', role: Role.ABOGADO, officeCode: 'DIST_1' },
    { email: 'psicologo.d1@defensoria.gob.bo', firstName: '[Distrito 1]', lastName: 'Valeria Paz', role: Role.PSICOLOGO, officeCode: 'DIST_1' },

    // Distrito 2
    { email: 'secretaria.d2@defensoria.gob.bo', firstName: '[Distrito 2]', lastName: 'Isabela Mamani', role: Role.SECRETARIA, officeCode: 'DIST_2' },
    { email: 'abogado.d2@defensoria.gob.bo', firstName: '[Distrito 2]', lastName: 'Javier Condori', role: Role.ABOGADO, officeCode: 'DIST_2' },

    // Distrito 3
    { email: 'secretaria.d3@defensoria.gob.bo', firstName: '[Distrito 3]', lastName: 'Carmen Choque', role: Role.SECRETARIA, officeCode: 'DIST_3' },
    { email: 'social.d3@defensoria.gob.bo', firstName: '[Distrito 3]', lastName: 'Gonzalo Quispe', role: Role.SOCIAL, officeCode: 'DIST_3' },

    // Distrito 4
    { email: 'secretaria.d4@defensoria.gob.bo', firstName: '[Distrito 4]', lastName: 'Daniela Mercado', role: Role.SECRETARIA, officeCode: 'DIST_4' },
    { email: 'abogado.d4@defensoria.gob.bo', firstName: '[Distrito 4]', lastName: 'Mauricio Yáñez', role: Role.ABOGADO, officeCode: 'DIST_4' },

    // Distrito 5
    { email: 'secretaria.d5@defensoria.gob.bo', firstName: '[Distrito 5]', lastName: 'Paola Cárdenas', role: Role.SECRETARIA, officeCode: 'DIST_5' },

    // Distrito 6
    { email: 'secretaria.d6@defensoria.gob.bo', firstName: '[Distrito 6]', lastName: 'Teresa Colque', role: Role.SECRETARIA, officeCode: 'DIST_6' },

    // Distrito 7
    { email: 'secretaria.d7@defensoria.gob.bo', firstName: '[Distrito 7]', lastName: 'Luciana Nina', role: Role.SECRETARIA, officeCode: 'DIST_7' },

    // Distrito 8
    { email: 'secretaria.d8@defensoria.gob.bo', firstName: '[Distrito 8]', lastName: 'Marisol Ayaviri', role: Role.SECRETARIA, officeCode: 'DIST_8' },
  ];

  const userMap: Record<string, string> = {};

  for (const u of usersToSeed) {
    const targetOffice = officeMap[u.officeCode];
    const created = await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, officeId: targetOffice.id, firstName: u.firstName, lastName: u.lastName },
      create: {
        email: u.email,
        passwordHash,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        officeId: targetOffice.id,
      },
    });
    userMap[u.email] = created.id;
  }

  const centralSecretaria = userMap['secretaria@defensoria.gob.bo'];
  const centralAbogado = userMap['abogado@defensoria.gob.bo'];
  const centralPsicologo = userMap['psicologo@defensoria.gob.bo'];
  const centralSocial = userMap['social@defensoria.gob.bo'];
  const centralJefatura = userMap['jefatura@defensoria.gob.bo'];

  console.log(`✅ Seeded ${usersToSeed.length} staff members across all 9 districts!`);

  // 4. Seed Cases for ALL 9 District Offices
  const casesToSeed = [
    {
      code: 'DNA-2026-0001',
      officeCode: 'CENTRAL',
      caseType: CaseType.DENUNCIA_VULNERACION,
      phase: Phase.EVALUACION,
      path: InterventionPath.VIA_JUDICIAL,
      risk: RiskLevel.ALTO,
      nnaName: '[Central] Mateo Gutiérrez Ramos',
      nnaDoc: '10482938-CH',
      narrative: 'Denuncia por malos tratos físicos periódicos hacia el menor Mateo G. (9 años) por parte de su padrastro.',
      pin: '123456',
    },
    {
      code: 'DNA-2026-0002',
      officeCode: 'CENTRAL',
      caseType: CaseType.DERECHO_EDUCACION,
      phase: Phase.SEGUIMIENTO,
      path: InterventionPath.GESTION_ADMINISTRATIVA,
      risk: RiskLevel.MEDIO,
      nnaName: '[Central] Camila Rocha Fernández',
      nnaDoc: '11029384-CH',
      narrative: 'Reporte escolar por inasistencia ininterrumpida de la niña Camila Rocha por más de 3 semanas.',
      pin: '654321',
    },
    {
      code: 'DNA-2026-0003',
      officeCode: 'DIST_1',
      caseType: CaseType.EXTRAVIO,
      phase: Phase.DERIVACION,
      path: InterventionPath.VIA_JUDICIAL,
      risk: RiskLevel.ALTO,
      nnaName: '[Distrito 1] Valentina Mamani Aguilar',
      nnaDoc: '12940192-CH',
      narrative: 'Reporte de extravío de la niña Valentina M. (6 años) en inmediaciones de la Terminal de Buses. Activación de protocolo de búsqueda inmediata.',
      pin: '445566',
    },
    {
      code: 'DNA-2026-0004',
      officeCode: 'DIST_2',
      caseType: CaseType.CONSUMO_SUSTANCIAS,
      phase: Phase.EVALUACION,
      path: InterventionPath.GESTION_ADMINISTRATIVA,
      risk: RiskLevel.ALTO,
      nnaName: '[Distrito 2] Sebastián Velasco Torrez',
      nnaDoc: '13940193-CH',
      narrative: 'Adolescente Sebastián V. (15 años) hallado en vía pública en Lajastambo bajo efectos de alcohol. Requiere plan psicosocial de contención.',
      pin: '112233',
    },
    {
      code: 'DNA-2026-0005',
      officeCode: 'DIST_3',
      caseType: CaseType.NNA_INFRACTOR,
      phase: Phase.JUDICIALIZACION,
      path: InterventionPath.VIA_JUDICIAL,
      risk: RiskLevel.MEDIO,
      nnaName: '[Distrito 3] Lucas Benítez Ortiz',
      nnaDoc: '14940194-CH',
      narrative: 'Adolescente Lucas B. (16 años) imputado por infracción a la propiedad privada en Yurac Yurac. Acompañamiento legal bajo el Sistema Penal para Adolescentes.',
      pin: '998877',
    },
    {
      code: 'DNA-2026-0006',
      officeCode: 'DIST_4',
      caseType: CaseType.DERECHO_EDUCACION,
      phase: Phase.EVALUACION,
      path: InterventionPath.GESTION_ADMINISTRATIVA,
      risk: RiskLevel.BAJO,
      nnaName: '[Distrito 4] Mariela Aguilar Soliz',
      nnaDoc: '15940195-CH',
      narrative: 'Deserción escolar repentina en la U.E. San José por traslado no notificado.',
      pin: '101010',
    },
    {
      code: 'DNA-2026-0007',
      officeCode: 'DIST_5',
      caseType: CaseType.VENTA_ALCOHOL,
      phase: Phase.DERIVACION,
      path: InterventionPath.GESTION_ADMINISTRATIVA,
      risk: RiskLevel.MEDIO,
      nnaName: '[Distrito 5] Andrés Saavedra Paz',
      nnaDoc: '16940196-CH',
      narrative: 'Intervención en operativo nocturno en licorería de Azari expendiendo bebidas alcohólicas a menores.',
      pin: '202020',
    },
    {
      code: 'DNA-2026-0008',
      officeCode: 'DIST_6',
      caseType: CaseType.DENUNCIA_VULNERACION,
      phase: Phase.EVALUACION,
      path: InterventionPath.GESTION_ADMINISTRATIVA,
      risk: RiskLevel.ALTO,
      nnaName: '[Distrito 6] Tomasa Huanca Colque',
      nnaDoc: '17940197-CH',
      narrative: 'Vulneración de derechos y presunta desnutrición detectada en inspección comunal en Arabate.',
      pin: '303030',
    },
    {
      code: 'DNA-2026-0009',
      officeCode: 'DIST_7',
      caseType: CaseType.FISCALIZACION,
      phase: Phase.SEGUIMIENTO,
      path: InterventionPath.GESTION_ADMINISTRATIVA,
      risk: RiskLevel.MEDIO,
      nnaName: '[Distrito 7] Raúl Nina Ramos',
      nnaDoc: '18940198-CH',
      narrative: 'Trabajo agrícola no regulado en menores de 14 años en la zona de Chataquila.',
      pin: '404040',
    },
    {
      code: 'DNA-2026-0010',
      officeCode: 'DIST_8',
      caseType: CaseType.DENUNCIA_VULNERACION,
      phase: Phase.EVALUACION,
      path: InterventionPath.VIA_JUDICIAL,
      risk: RiskLevel.ALTO,
      nnaName: '[Distrito 8] Francisca Catacora Ayaviri',
      nnaDoc: '19940199-CH',
      narrative: 'Tutela de hecho irregular e indicios de abandono en la comunidad rural de Potolo.',
      pin: '505050',
    },
  ];

  for (const c of casesToSeed) {
    const targetOffice = officeMap[c.officeCode];
    const pinHash = await bcrypt.hash(c.pin, 10);

    const nnaPerson = await prisma.person.create({
      data: {
        documentType: 'CI',
        documentNumber: c.nnaDoc,
        firstName: c.nnaName.split(' ')[0] + ' ' + c.nnaName.split(' ')[1],
        lastName: c.nnaName.split(' ').slice(2).join(' ') || 'Sucre',
        gender: 'MASCULINO',
        createdBy: centralSecretaria,
      },
    });

    await prisma.case.create({
      data: {
        caseCode: c.code,
        caseType: c.caseType,
        currentPhase: c.phase,
        currentInterventionPath: c.path,
        riskLevel: c.risk,
        intakeNarrative: c.narrative,
        accessPinHash: pinHash,
        currentOfficeId: targetOffice.id,
        createdBy: centralSecretaria,
        parties: {
          create: [{ personId: nnaPerson.id, roleInCase: RoleInCase.NNA, isPrimary: true, createdBy: centralSecretaria }],
        },
        teamHistory: {
          create: [
            { userId: centralAbogado, role: Role.ABOGADO, reason: 'Asignación Abogado Legal', assignedBy: centralJefatura },
            { userId: centralPsicologo, role: Role.PSICOLOGO, reason: 'Asignación Psicología', assignedBy: centralJefatura },
          ],
        },
      },
    });
  }

  console.log(`📁 Seeded ${casesToSeed.length} Cases across ALL 9 Districts of Sucre!`);

  // 5. Seed Action Logs & Appointments
  const firstCase = await prisma.case.findFirst({ where: { caseCode: 'DNA-2026-0001' } });
  if (firstCase) {
    await prisma.actionLog.createMany({
      data: [
        { caseId: firstCase.id, authorId: centralSecretaria, actionType: 'NOTA', title: 'Apertura e Ingesta [Central]', content: 'Apertura e ingreso a sistema.', isSigned: true, signedAt: new Date() },
        { caseId: firstCase.id, authorId: centralPsicologo, actionType: 'ENTREVISTA', title: 'Evaluación Psicológica [Central]', content: 'Evaluación de contención emocional.', isSigned: true, signedAt: new Date() },
      ],
    });

    await prisma.appointment.createMany({
      data: [
        { caseId: firstCase.id, title: 'Audiencia Medidas de Protección [Central]', appointmentType: 'AUDIENCIA', scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000 * 2), location: 'Juzgado Público N° 1 de Niñez', status: 'PROGRAMADA', createdBy: centralAbogado },
      ],
    });
  }

  console.log('🎉 Multi-district seed completed successfully for all 9 offices in Sucre!');
  
  // 6. Seed System Catalogs (Case Types)
  const caseTypesCatalog = await prisma.systemCatalog.upsert({
    where: { code: 'CASE_TYPES' },
    update: {}, // No update needed, just ensure exists
    create: {
      code: 'CASE_TYPES',
      name: 'Tipos de Casos / Trámites',
      description: 'Catálogo de tipos de casos que puede registrar la Defensoría',
    },
  });

  // Seed catalog items for case types
  const caseTypesItems = [
    { value: 'DENUNCIA_VULNERACION', label: 'Denuncia por Vulneración de Derechos', order: 1 },
    { value: 'CONSUMO_SUSTANCIAS', label: 'Consumo de Sustancias', order: 2 },
    { value: 'VENTA_ALCOHOL', label: 'Venta de Alcohol a Menores', order: 3 },
    { value: 'DERECHO_EDUCACION', label: 'Vulneración del Derecho a la Educación', order: 4 },
    { value: 'EXTRAVIO', label: 'Extravío / Desaparición', order: 5 },
    { value: 'NNA_INFRACTOR', label: 'NNA Infractor de Ley Penal', order: 6 },
    { value: 'FISCALIZACION', label: 'Fiscalización / Operativo', order: 7 },
  ];

  for (const item of caseTypesItems) {
    await prisma.catalogItem.upsert({
      where: { catalogId_value: { catalogId: caseTypesCatalog.id, value: item.value } },
      update: { label: item.label, order: item.order },
      create: { catalogId: caseTypesCatalog.id, ...item },
    });
  }

  console.log('✅ Case Type Catalog seeded successfully!');

  // 7. Seed Document Templates (7 Normative Templates - Ley 548 Sucre)
  console.log('📄 Seeding 7 normative document templates...');
  for (const t of templates) {
    await prisma.documentTemplate.upsert({
      where: { code: t.code },
      update: {
        name: t.name,
        documentType: t.documentType,
        targetRole: t.targetRole,
        requiresCoAuthor: t.requiresCoAuthor,
        structure: t.structure,
        version: 1,
        isActive: true,
      },
      create: {
        code: t.code,
        name: t.name,
        documentType: t.documentType,
        targetRole: t.targetRole,
        requiresCoAuthor: t.requiresCoAuthor,
        structure: t.structure,
        version: 1,
        isActive: true,
      },
    });
  }
  console.log(`✅ Seeded ${templates.length} document templates successfully!`);

  // 8. Seed Instruments de Evaluación (Herramientas de campo/clínicas por disciplina)
  console.log('🔬 Seeding instrumentos de evaluación por disciplina...');
  
  // Primero obtener (o crear si faltan) las disciplinas
  const disciplineMap: Record<string, any> = {};
  const disciplineCodes = ['TRABAJO_SOCIAL', 'PSICOLOGIA', 'DERECHO'];
  const disciplineDefinitions: Record<string, { name: string; description: string }> = {
    TRABAJO_SOCIAL: { name: 'Trabajo Social', description: 'Área de diagnóstico del entorno familiar y social del NNA — factores de riesgo y protección' },
    PSICOLOGIA: { name: 'Psicología', description: 'Área de evaluación clínica, pericial y de contención emocional del NNA' },
    DERECHO: { name: 'Derecho', description: 'Área legal — patrocinio de oficio y defensa socio-jurídica del NNA' },
  };
  for (const code of disciplineCodes) {
    const def = disciplineDefinitions[code];
    const d = await prisma.discipline.upsert({
      where: { code },
      update: { name: def.name, description: def.description },
      create: { code, name: def.name, description: def.description },
    });
    disciplineMap[code] = d;
  }

  // Mapear plantillas a códigos para vincular
  const templateMap: Record<string, any> = {};
  for (const t of templates) {
    const tmpl = await prisma.documentTemplate.findUnique({ where: { code: t.code } });
    if (tmpl) templateMap[t.code] = tmpl;
  }

  const instruments = [
    // TRABAJO SOCIAL
    {
      code: 'INST-TS-01',
      name: 'Ficha Social SID/MID',
      instrumentType: 'FICHA_SOCIAL_SID_MID',
      disciplineCode: 'TRABAJO_SOCIAL',
      templateCode: 'TS-01', // Ficha Social
      structuredContent: {
        description: 'Ficha de Identificación y Diagnóstico Social (SID/MID) según estándares DNA Bolivia',
        campos: [
          'Datos de identificación del NNA y grupo familiar',
          'Composición familiar y dinámica relacional',
          'Situación habitacional y socioeconómica',
          'Red de apoyo familiar y comunitaria',
          'Factores de riesgo y protección (Ley 548 Art. 14)',
          'Impresión diagnóstica social preliminar'
        ],
        instrucciones: 'Completar en visita domiciliaria y entrevista familiar. Base para Informe Social Inicial (TS-02).'
      }
    },
    {
      code: 'INST-TS-02',
      name: 'Ficha de Visita Domiciliaria Socioeconómica',
      instrumentType: 'VISITA_DOMICILIARIA_SOCIOECONOMICA',
      disciplineCode: 'TRABAJO_SOCIAL',
      templateCode: 'TS-01', // Ficha Social
      structuredContent: {
        description: 'Registro sistemático de visita domiciliaria para evaluación de condiciones de vida',
        campos: [
          'Fecha, hora y duración de la visita',
          'Personas presentes y su relación con el NNA',
          'Condiciones habitacionales (servicios básicos, hacinamiento, salubridad)',
          'Ingresos económicos y seguridad alimentaria',
          'Red de apoyo vecinal/comunitaria',
          'Observaciones de riesgo ambiental'
        ],
        instrucciones: 'Registrar in situ con georreferencia y firma de testigos. Adjuntar al informe social.'
      }
    },
    {
      code: 'INST-TS-03',
      name: 'Genograma Familiar ESTRUCTURADO',
      instrumentType: 'GENOGRAMA_FAMILIAR',
      disciplineCode: 'TRABAJO_SOCIAL',
      templateCode: 'TS-02', // Informe Social Inicial
      structuredContent: {
        description: 'Construcción gráfica y análisis de estructura familiar multigeneracional',
        campos: [
          'Mínimo 3 generaciones (abuelos, padres, NNA y hermanos)',
          'Símbolos estandarizados: sexo, fallecimientos, separaciones',
          'Patrones de vínculo: alianzas, coaliciones, conflictos',
          'Indicadores de riesgo: violencia, adicciones, abandono, migración',
          'Recursos de resiliencia: figuras de apego seguro, redes extendidas'
        ],
        instrucciones: 'Construir en entrevista conjunta con cuidadores. Anotar fecha y responsable. Base para diagnóstico social.'
      }
    },

    // PSICOLOGÍA
    {
      code: 'INST-PSI-01',
      name: 'Cuestionario de Perfil CASIC',
      instrumentType: 'CUESTIONARIO_PERFIL_CASIC',
      disciplineCode: 'PSICOLOGIA',
      templateCode: 'PSI-02', // Informe Psicológico Inicial
      structuredContent: {
        description: 'Cuestionario de Autoinforme de Síntomas e Indicadores Clínicos (CASIC) adaptado Bolivia',
        campos: [
          'Área emocional: ansiedad, depresión, ira, miedos',
          'Área conductual: agresividad, aislamiento, impulsividad',
          'Área cognitiva: concentración, memoria, creencias disfuncionales',
          'Área relacional: apego, confianza, habilidades sociales',
          'Escala de riesgo suicida/autoagresivo (ítems críticos)',
          'Recursos de afrontamiento y resiliencia'
        ],
        instrucciones: 'Aplicar en sesión individual (30-45 min). Puntuación estandarizada percentiles Bolivia. Requiere consentimiento informado.'
      }
    },
    {
      code: 'INST-PSI-02',
      name: 'Protocolo de Entrevista NICHD',
      instrumentType: 'ENTREVISTA_NICHD',
      disciplineCode: 'PSICOLOGIA',
      templateCode: 'PSI-01', // Intervención en Crisis
      structuredContent: {
        description: 'Entrevista forense estructurada NICHD para NNA víctimas de abuso sexual/violencia',
        campos: [
          'Fase 1: Rapport y reglas de la entrevista',
          'Fase 2: Entrenamiento en reporte de detalles',
          'Fase 3: Narrativa libre ("Cuéntame todo lo que pasó")',
          'Fase 4: Preguntas abiertas de seguimiento (quién, qué, dónde, cuándo, cómo)',
          'Fase 5: Cierre y verificación de comprensión',
          'Registro de indicadores de credibilidad (consistencia, detalle sensorial, afecto congruente)'
        ],
        instrucciones: 'Aplicar en cámara Gesell o sala amigable. Grabada en audio/video. Solo psicólogo/a forense certificado/a NICHD.'
      }
    },
    {
      code: 'INST-PSI-03',
      name: 'Test de Daño Emocional / Batería Psicométrica',
      instrumentType: 'BATERIA_PSICOMETRICA_DANO_EMOCIONAL',
      disciplineCode: 'PSICOLOGIA',
      templateCode: 'PSI-02', // Informe Psicológico Inicial
      structuredContent: {
        description: 'Batería para cuantificación de daño emocional en NNA (adaptación Bolivia)',
        campos: [
          'Escala de Impacto Traumático (ITE-R adaptada)',
          'Inventario de Depresión Infantil (CDI-2)',
          'Escala de Ansiedad Manifiesta Infantil (CMAS-R)',
          'Test de Apego (AQC / ECR-R según edad)',
          'Evaluación de Funcionamiento Global (Escala GAF / WHODAS 2.0)',
          'Indicadores de estrés postraumático (CPSS / UCLA PTSD RI)'
        ],
        instrucciones: 'Aplicar en 2-3 sesiones. Corrección y reporte con percentiles poblacionales Bolivia. Informe técnico para pericia judicial.'
      }
    },

    // DERECHO
    {
      code: 'INST-LEG-01',
      name: 'Módulo de Tipicidad y Subsunción Penal',
      instrumentType: 'MODULO_TIPICIDAD_SUBSUNCION',
      disciplineCode: 'DERECHO',
      templateCode: 'LEG-01', // Dictamen de Tipicidad
      structuredContent: {
        description: 'Matriz estructurada para análisis de tipicidad objetiva y subjetiva (Código Penal Bolivia)',
        campos: [
          'Identificación del tipo penal base (Art. CP / Ley 348 / Ley 548)',
          'Tipicidad objetiva: conducta, resultado, nexo causal, bien jurídico tutelado',
          'Tipicidad subjetiva: dolo (directo/eventual) / culpa (consciente/inconsciente)',
          'Autoría y participación (Art. 27-30 CP): autor, coautor, partícipe, instigador',
          'Causas de justificación (Art. 30-34 CP): legítima defensa, estado de necesidad, cumplimiento deber',
          'Causas de inculpabilidad (Art. 35-38 CP): inimputabilidad, error de tipo, coacción irresistible',
          'Concurso de delitos y unidad de acción (Art. 55-59 CP)'
        ],
        instrucciones: 'Completar por cada tipo penal imputado. Base para Dictamen de Tipicidad (LEG-01) y Memorial (LEG-02). Citar jurisprudencia TSJ/TCP.'
      }
    },
    {
      code: 'INST-LEG-02',
      name: 'Matriz de Análisis de Discrepancias',
      instrumentType: 'MATRIZ_ANALISIS_DISCREPANCIAS',
      disciplineCode: 'DERECHO',
      templateCode: 'LEG-02', // Memorial Denuncia Penal
      structuredContent: {
        description: 'Herramienta para detectar inconsistencias entre declaraciones, pruebas y calificaciones jurídicas',
        campos: [
          'Comparativa: denuncia inicial vs. declaración ampliatoria vs. prueba pericial',
          'Identificación de omisiones, contradicciones, evoluciones en el relato',
          'Cotejo con evidencia física/documental (informes médicos, psicológicos, sociales)',
          'Evaluación de credibilidad según criterios: consistencia interna, detalle sensorial, persistencia, ausencia de sugestión',
          'Impacto en calificación jurídica y petición fiscal'
        ],
        instrucciones: 'Completar tras cada acto de investigación. Base para fundamentar tipicidad y petitum en Memorial (LEG-02).'
      }
    },

    // DUPLA INTERDISCIPLINARIA
    {
      code: 'INST-IPS-01',
      name: 'Matriz Dual de Valoración Técnica Psicosocial',
      instrumentType: 'MATRIZ_DUAL_VALORACION_PSICOSOCIAL',
      disciplineCode: 'PSICOLOGIA',
      templateCode: 'IPS-01', // Informe Psicosocial
      structuredContent: {
        description: 'Instrumento unificado para valoración conjunta Psicología + Trabajo Social (Informe Psicosocial IPS-01)',
        campos: [
          'ÁMBITO PSICOLÓGICO (responsable: Psicólogo/a): estado emocional, indicadores trauma, apego, funcionamiento cognitivo, diagnóstico provisional CIE-11',
          'ÁMBITO SOCIAL (responsable: T.S.): dinámica familiar, red apoyo, condiciones habitacionales, riesgo social, factores protectores comunitarios',
          'SÍNTESIS INTEGRADA: interacción factores psicológicos-sociales, diagnóstico psicosocial compartido, nivel de riesgo integral (ALTO/MEDIO/BAJO Ley 548 Art. 14)',
          'PRONÓSTICO CONJUNTO: factibilidad de reintegración familiar, necesidad medidas protección (Art. 50 Ley 548)',
          'RECOMENDACIONES INTERDISCIPLINARIAS: plan de intervención psicosocial, derivaciones, criterios seguimiento, responsables y plazos'
        ],
        instrucciones: 'Completar EN CONJUNTO por Psicólogo/a y Trabajador/a Social. Requiere FIRMA DE AMBOS profesionales. Consenso obligatorio en diagnóstico y nivel de riesgo. Base para Informe Psicosocial (IPS-01).'
      }
    },
  ];

  let instrumentsCreated = 0;
  for (const inst of instruments) {
    const discipline = disciplineMap[inst.disciplineCode];
    const template = templateMap[inst.templateCode];
    
    if (!discipline) {
      console.warn(`⚠️ Disciplina no encontrada: ${inst.disciplineCode} para instrumento ${inst.code}`);
      continue;
    }

    // Generar ID determinista válido UUID v4 usando namespace DNS
    const { createHash } = await import('crypto');
    const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'; // UUID namespace DNS
    const idHash = createHash('sha256').update(namespace + inst.code).digest('hex');
    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuid = [
      idHash.slice(0, 8),
      idHash.slice(8, 12),
      '4' + idHash.slice(12, 15),
      '8' + idHash.slice(15, 18),
      idHash.slice(18, 30)
    ].join('-');

    await prisma.instrument.upsert({
      where: { id: uuid },
      update: {
        name: inst.name,
        instrumentType: inst.instrumentType,
        disciplineId: discipline.id,
        documentTemplateId: template?.id,
        structuredContent: inst.structuredContent,
        isActive: true,
      },
      create: {
        id: uuid,
        name: inst.name,
        instrumentType: inst.instrumentType,
        disciplineId: discipline.id,
        documentTemplateId: template?.id,
        structuredContent: inst.structuredContent,
        isActive: true,
      },
    });
    instrumentsCreated++;
  }

  console.log(`✅ Seeded ${instrumentsCreated} instrumentos de evaluación exitosamente!`);

}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
