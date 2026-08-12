import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEMPLATES = [
  {
    code: 'IJ-01',
    name: 'Informe Jurídico Inicial y Dictamen de Tipicidad',
    documentType: 'INFORME_JURIDICO',
    targetRole: 'ABOGADO',
    requiresCoAuthor: false,
    structure: {
      sections: [
        { key: 'antecedentes', title: '1. Antecedentes del Caso', required: true, promptTemplate: { template: 'Resume los antecedentes factuales del caso {{caseCode}} referido al NNA {{nnaName}}.', systemPrompt: 'Eres un abogado de la Defensoría DNA de Bolivia. Redacta en estilo jurídico formal.', ragQuery: 'antecedentes hechos denuncia relato', ragInstruction: 'Usa la narrativa de ingesta y evidencias del caso.' } },
        { key: 'marco_juridico', title: '2. Marco Jurídico Aplicable', required: true, promptTemplate: { template: 'Identifica las normas aplicables al caso: CNNA, Código Penal, Ley 348, Ley 2026, tratados internacionales.', systemPrompt: 'Cita artículos específicos de la legislación boliviana vigente.', ragQuery: 'normativa legal artículos ley', ragInstruction: 'Referencia la base normativa del sistema.' } },
        { key: 'tipicidad', title: '3. Análisis de Tipicidad y Subsunción Penal', required: true, promptTemplate: { template: 'Analiza si los hechos se subsumen en algún tipo penal del Código Penal boliviano.', systemPrompt: 'Realiza un análisis dogmático: tipicidad objetiva y subjetiva.', ragQuery: 'tipo penal delito subsunción elementos', ragInstruction: 'Relaciona los hechos con los elementos del tipo penal.' } },
        { key: 'conclusiones', title: '4. Conclusiones y Recomendaciones', required: true, promptTemplate: { template: 'Emite las conclusiones jurídicas y las acciones legales recomendadas.', systemPrompt: 'Sé preciso en las vías procesales disponibles.', ragQuery: 'conclusión recomendación acción legal', ragInstruction: 'Basándote en el análisis previo.' } },
      ],
    },
  },
  {
    code: 'MD-01',
    name: 'Memorial de Denuncia Penal',
    documentType: 'INFORME_JURIDICO',
    targetRole: 'ABOGADO',
    requiresCoAuthor: false,
    structure: {
      sections: [
        { key: 'suma', title: '1. Suma / Objeto', required: true, promptTemplate: { template: 'Redacta la suma del memorial de denuncia penal.', systemPrompt: 'Formato de memorial boliviano ante Ministerio Público.', ragQuery: 'denuncia penal suma memorial', ragInstruction: '' } },
        { key: 'hechos', title: '2. Relación Circunstanciada de los Hechos', required: true, promptTemplate: { template: 'Narra los hechos de forma cronológica y circunstanciada.', systemPrompt: 'Usa lenguaje jurídico procesal boliviano.', ragQuery: 'hechos relato cronología denuncia', ragInstruction: 'Usa la narrativa del caso y evidencias.' } },
        { key: 'fundamentacion', title: '3. Fundamentación Jurídica', required: true, promptTemplate: { template: 'Fundamenta la denuncia citando artículos del CPP y CP.', systemPrompt: 'Cita Art. 284 CPP y los tipos penales aplicables.', ragQuery: 'fundamentación legal artículos código', ragInstruction: '' } },
        { key: 'petitorio', title: '4. Petitorio', required: true, promptTemplate: { template: 'Redacta el petitorio formal del memorial.', systemPrompt: 'Formato estándar de petitorio boliviano.', ragQuery: 'petitorio solicitud', ragInstruction: '' } },
      ],
    },
  },
  {
    code: 'EP-01',
    name: 'Informe de Entrevista Psicológica',
    documentType: 'INFORME_PSICOLOGICO',
    targetRole: 'PSICOLOGO',
    requiresCoAuthor: false,
    structure: {
      sections: [
        { key: 'datos_generales', title: '1. Datos Generales del Expediente', required: true, promptTemplate: { template: 'Completa los datos generales: expediente {{caseCode}}, NNA {{nnaName}}, fecha.', systemPrompt: 'Formato institucional DNA Sucre.', ragQuery: 'datos expediente NNA', ragInstruction: 'Extrae datos del caso.' } },
        { key: 'motivo_consulta', title: '2. Motivo de Consulta / Derivación', required: true, promptTemplate: { template: 'Describe el motivo de la evaluación psicológica.', systemPrompt: 'Lenguaje clínico profesional.', ragQuery: 'motivo consulta derivación evaluación', ragInstruction: '' } },
        { key: 'observacion_conducta', title: '3. Observación de Conducta', required: true, promptTemplate: { template: 'Describe la conducta observada durante la entrevista.', systemPrompt: 'Registro objetivo conductual sin interpretaciones.', ragQuery: 'conducta observación entrevista NNA', ragInstruction: '' } },
        { key: 'analisis', title: '4. Análisis Psicológico', required: true, promptTemplate: { template: 'Realiza el análisis clínico de los hallazgos.', systemPrompt: 'Usa marco teórico apropiado (trauma, desarrollo infantil).', ragQuery: 'análisis psicológico hallazgos evaluación', ragInstruction: '' } },
        { key: 'conclusiones', title: '5. Conclusiones y Recomendaciones', required: true, promptTemplate: { template: 'Emite conclusiones y recomendaciones de intervención.', systemPrompt: 'Incluye nivel de riesgo y necesidades del NNA.', ragQuery: 'conclusión recomendación riesgo intervención', ragInstruction: '' } },
      ],
    },
  },
  {
    code: 'PP-01',
    name: 'Informe Pericial Psicológico',
    documentType: 'INFORME_PSICOLOGICO',
    targetRole: 'PSICOLOGO',
    requiresCoAuthor: false,
    structure: {
      sections: [
        { key: 'datos_generales', title: '1. Datos Generales', required: true, promptTemplate: { template: 'Datos del peritaje: expediente, NNA, solicitante.', systemPrompt: 'Formato pericial forense.', ragQuery: 'datos peritaje expediente', ragInstruction: '' } },
        { key: 'metodologia', title: '2. Metodología Aplicada', required: true, promptTemplate: { template: 'Describe los instrumentos y técnicas utilizadas.', systemPrompt: 'Lista test psicométricos, entrevistas, observaciones.', ragQuery: 'metodología instrumentos test evaluación', ragInstruction: '' } },
        { key: 'resultados', title: '3. Resultados', required: true, promptTemplate: { template: 'Presenta los resultados de cada instrumento aplicado.', systemPrompt: 'Datos cuantitativos y cualitativos.', ragQuery: 'resultados test evaluación puntaje', ragInstruction: '' } },
        { key: 'analisis_pericial', title: '4. Análisis Pericial', required: true, promptTemplate: { template: 'Integra los resultados en un análisis forense.', systemPrompt: 'Relaciona hallazgos con los hechos denunciados.', ragQuery: 'análisis pericial forense daño', ragInstruction: '' } },
        { key: 'conclusiones', title: '5. Conclusiones Periciales', required: true, promptTemplate: { template: 'Emite las conclusiones periciales.', systemPrompt: 'Responde a los puntos de pericia solicitados.', ragQuery: 'conclusiones periciales dictamen', ragInstruction: '' } },
      ],
    },
  },
  {
    code: 'FSH-01',
    name: 'Ficha Social Habilitante',
    documentType: 'INFORME_SOCIAL',
    targetRole: 'SOCIAL',
    requiresCoAuthor: false,
    structure: {
      sections: [
        { key: 'datos_generales', title: '1. Datos Generales del Expediente', required: true, promptTemplate: { template: 'Datos del caso: expediente {{caseCode}}, NNA {{nnaName}}.', systemPrompt: 'Formato institucional DNA.', ragQuery: 'datos expediente NNA familia', ragInstruction: 'Extrae del caso.' } },
        { key: 'marco_normativo', title: '2. Marco Referencial Normativo', required: true, promptTemplate: { template: 'Normativa aplicable: CNNA, Ley 548, protocolos SEDEGES.', systemPrompt: 'Cita artículos de protección social boliviana.', ragQuery: 'normativa social protección NNA ley', ragInstruction: '' } },
        { key: 'metodologia', title: '3. Metodología de Investigación Social', required: true, promptTemplate: { template: 'Describe la metodología de intervención social aplicada.', systemPrompt: 'Técnicas: entrevista, visita domiciliaria, observación.', ragQuery: 'metodología social investigación técnicas', ragInstruction: '' } },
        { key: 'analisis_vulneracion', title: '4. Análisis Situacional de la Vulneración', required: true, promptTemplate: { template: 'Analiza la situación de vulneración de derechos del NNA.', systemPrompt: 'Identifica factores de riesgo y protección.', ragQuery: 'vulneración derechos riesgo protección NNA', ragInstruction: '' } },
        { key: 'diagnostico', title: '5. Diagnóstico Social', required: true, promptTemplate: { template: 'Emite el diagnóstico social del NNA y su entorno.', systemPrompt: 'Integra todos los hallazgos en un diagnóstico.', ragQuery: 'diagnóstico social familia entorno', ragInstruction: '' } },
        { key: 'conclusiones', title: '6. Conclusiones y Recomendaciones', required: true, promptTemplate: { template: 'Conclusiones y recomendaciones de intervención social.', systemPrompt: 'Incluye plan de acción y derivaciones necesarias.', ragQuery: 'conclusiones recomendaciones plan acción', ragInstruction: '' } },
      ],
    },
  },
  {
    code: 'ISI-01',
    name: 'Informe Social Inicial (Diagnóstico Social)',
    documentType: 'INFORME_SOCIAL',
    targetRole: 'SOCIAL',
    requiresCoAuthor: false,
    structure: {
      sections: [
        { key: 'datos', title: '1. Datos de Identificación', required: true, promptTemplate: { template: 'Datos del NNA y su grupo familiar.', systemPrompt: 'Formato DNA.', ragQuery: 'datos NNA familia identificación', ragInstruction: '' } },
        { key: 'situacion_socioeconomica', title: '2. Situación Socioeconómica', required: true, promptTemplate: { template: 'Describe la situación socioeconómica del hogar.', systemPrompt: 'Ingresos, vivienda, servicios básicos, educación.', ragQuery: 'socioeconómico vivienda ingresos educación', ragInstruction: '' } },
        { key: 'dinamica_familiar', title: '3. Dinámica Familiar', required: true, promptTemplate: { template: 'Analiza la dinámica y estructura familiar.', systemPrompt: 'Relaciones, roles, comunicación, conflictos.', ragQuery: 'familia dinámica relaciones roles', ragInstruction: '' } },
        { key: 'diagnostico_social', title: '4. Diagnóstico Social', required: true, promptTemplate: { template: 'Diagnóstico integral de la situación social del NNA.', systemPrompt: 'Factores de riesgo y protección identificados.', ragQuery: 'diagnóstico social riesgo protección', ragInstruction: '' } },
        { key: 'plan_intervencion', title: '5. Plan de Intervención Social', required: true, promptTemplate: { template: 'Propone el plan de intervención social.', systemPrompt: 'Objetivos, actividades, plazos, responsables.', ragQuery: 'plan intervención objetivos actividades', ragInstruction: '' } },
      ],
    },
  },
  {
    code: 'IPS-01',
    name: 'Informe Psicosocial Unificado',
    documentType: 'INFORME_PSICOSOCIAL',
    targetRole: 'PSICOLOGO',
    requiresCoAuthor: true,
    structure: {
      sections: [
        { key: 'datos', title: '1. Datos Generales', required: true, promptTemplate: { template: 'Datos del caso y equipo psicosocial.', systemPrompt: 'Incluir ambos profesionales autor y coautor.', ragQuery: 'datos expediente equipo psicosocial', ragInstruction: '' } },
        { key: 'evaluacion_psicologica', title: '2. Evaluación Psicológica', required: true, promptTemplate: { template: 'Hallazgos de la evaluación psicológica del NNA.', systemPrompt: 'Sección redactada por el/la Psicólogo/a.', ragQuery: 'evaluación psicológica hallazgos NNA', ragInstruction: '' } },
        { key: 'evaluacion_social', title: '3. Evaluación Social', required: true, promptTemplate: { template: 'Hallazgos de la evaluación social del NNA y entorno.', systemPrompt: 'Sección redactada por el/la Trabajador/a Social.', ragQuery: 'evaluación social hallazgos entorno', ragInstruction: '' } },
        { key: 'analisis_integrado', title: '4. Análisis Psicosocial Integrado', required: true, promptTemplate: { template: 'Integración de hallazgos psicológicos y sociales.', systemPrompt: 'Análisis conjunto de ambas disciplinas.', ragQuery: 'análisis integrado psicosocial', ragInstruction: '' } },
        { key: 'conclusiones', title: '5. Conclusiones y Recomendaciones Conjuntas', required: true, promptTemplate: { template: 'Conclusiones y recomendaciones del equipo psicosocial.', systemPrompt: 'Firmado por ambos profesionales.', ragQuery: 'conclusiones recomendaciones psicosocial', ragInstruction: '' } },
      ],
    },
  },
];

async function main() {
  console.log('Seeding document templates...');
  for (const tmpl of TEMPLATES) {
    await prisma.documentTemplate.upsert({
      where: { code: tmpl.code },
      update: { ...tmpl, targetRole: tmpl.targetRole as any, structure: tmpl.structure as any },
      create: { ...tmpl, targetRole: tmpl.targetRole as any, structure: tmpl.structure as any },
    });
    console.log(`  ✅ ${tmpl.code}: ${tmpl.name}`);
  }
  console.log(`\nDone! ${TEMPLATES.length} templates seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
