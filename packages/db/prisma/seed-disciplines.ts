/**
 * seed-disciplines.ts
 * Disciplinas profesionales de la DNA Sucre y sus tipos de informe oficiales.
 * Fuente: Guía de Orientación para la Gestión de Casos — DNA Sucre.
 *
 * Ejecutar: npx tsx prisma/seed-disciplines.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding disciplinas y tipos de informe según normativa DNA Sucre...');

  // ─── 1. PSICOLOGÍA ────────────────────────────────────────────────────────

  const psicologia = await prisma.discipline.upsert({
    where: { code: 'PSICOLOGIA' },
    update: { name: 'Psicología', description: 'Área de evaluación clínica, pericial y de contención emocional del NNA', isActive: true },
    create: { code: 'PSICOLOGIA', name: 'Psicología', description: 'Área de evaluación clínica, pericial y de contención emocional del NNA' },
  });

  const psicologiaTypes = [
    {
      code: 'PSI_INTERVENCION_CRISIS',
      name: 'Informe de Intervención en Crisis',
      category: 'INFORME_PSICOLOGICO' as const,
      description: 'Instrumento de contención emocional primaria elaborado inmediatamente después del primer contacto con el NNA víctima en situaciones de alta urgencia psicoafectiva o develación traumática.',
    },
    {
      code: 'PSI_ENTREVISTA_PSICOLOGICA',
      name: 'Informe de Entrevista Psicológica',
      category: 'INFORME_PSICOLOGICO' as const,
      description: 'Informe diagnóstico resultante de las sesiones de evaluación inicial, que sistematiza el estado de las áreas emocional, cognitiva, afectiva y conductual del NNA ante la vivencia de los hechos denunciados.',
    },
    {
      code: 'PSI_PERICIAL_PSICOLOGICO',
      name: 'Informe Pericial Psicológico',
      category: 'INFORME_PSICOLOGICO' as const,
      description: 'Diagnóstico formal exigido a requerimiento fiscal o judicial para determinar técnicamente la existencia de daño psicológico y las manifestaciones del trauma en la víctima, aplicando reactivos psicométricos y proyectivos.',
    },
    {
      code: 'PSI_PSICOSOCIAL_UNIFICADO',
      name: 'Informe Psicosocial Unificado',
      category: 'INFORME_PSICOSOCIAL' as const,
      description: 'Dictamen técnico unificado donde el área de psicología valora la afectación emocional y recomienda, de forma coordinada con el área social, medidas de protección complejas. Requiere coautoría con Trabajo Social.',
    },
    {
      code: 'PSI_SESION_SEGUIMIENTO',
      name: 'Informe de Sesión de Seguimiento',
      category: 'INFORME_SESION_SEGUIMIENTO' as const,
      description: 'Registro técnico de cada sesión individual de seguimiento psicológico al NNA durante el plan de acompañamiento.',
    },
  ];

  for (const rt of psicologiaTypes) {
    await prisma.disciplineReportType.upsert({
      where: { code: rt.code },
      update: { name: rt.name, category: rt.category, description: rt.description, isActive: true },
      create: { disciplineId: psicologia.id, ...rt },
    });
  }

  console.log(`  ✅ Psicología: ${psicologiaTypes.length} tipos de informe`);

  // ─── 2. DERECHO (ABOGACÍA) ────────────────────────────────────────────────

  const derecho = await prisma.discipline.upsert({
    where: { code: 'DERECHO' },
    update: { name: 'Derecho', description: 'Área legal — patrocinio de oficio y defensa socio-jurídica del NNA', isActive: true },
    create: { code: 'DERECHO', name: 'Derecho', description: 'Área legal — patrocinio de oficio y defensa socio-jurídica del NNA' },
  });

  const derechoTypes = [
    {
      code: 'JUR_INFORME_JURIDICO_INICIAL',
      name: 'Informe Jurídico Inicial y Dictamen de Tipicidad',
      category: 'INFORME_JURIDICO' as const,
      description: 'Evaluación jurídica inicial de la denuncia donde el abogado realiza la subsunción de los hechos al Código Penal para discernir si se trata de un delito penal o una infracción administrativa bajo el CNNA.',
    },
    {
      code: 'JUR_MEMORIAL_DENUNCIA_PENAL',
      name: 'Memorial de Denuncia Penal',
      category: 'INFORME_JURIDICO' as const,
      description: 'Escrito formal de radicatoria del caso ante el Ministerio Público. Describe circunstanciadamente los hechos, identifica al presunto agresor y solicita el inicio de la acción penal.',
    },
    {
      code: 'JUR_MEMORIAL_RATIFICACION_MEDIDAS',
      name: 'Memorial de Solicitud de Ratificación de Medidas de Protección Especial de Urgencia',
      category: 'INFORME_JURIDICO' as const,
      description: 'Escrito dirigido al Juez de Niñez y Adolescencia para que ratifique legalmente las medidas aplicadas de inmediato por la DNA (desalojo del agresor, prohibición de acercamiento).',
    },
    {
      code: 'JUR_MEMORIAL_DECLARACION_ANTICIPADA',
      name: 'Memorial de Solicitud de Fijación de Día y Hora para Declaración Anticipada en Cámara Gesell',
      category: 'INFORME_JURIDICO' as const,
      description: 'Petición de fijación de fecha y hora para la entrevista única en Cámara Gesell de la víctima, garantizando que su testimonio tenga validez de prueba preconstituida evitando la revictimización.',
    },
    {
      code: 'JUR_MEMORIAL_OBJECION_RECHAZO',
      name: 'Memorial de Objeción a la Resolución de Rechazo de Denuncia',
      category: 'INFORME_JURIDICO' as const,
      description: 'Escrito para impugnar resoluciones de rechazo fiscal dentro del plazo de 5 días de notificado.',
    },
    {
      code: 'JUR_MEMORIAL_IMPUGNACION_SOBRESEIMIENTO',
      name: 'Memorial de Impugnación de Resolución de Sobreseimiento',
      category: 'INFORME_JURIDICO' as const,
      description: 'Solicitud procesal para que el Fiscal Departamental revoque el sobreseimiento del imputado y ordene la acusación en resguardo de los derechos de la víctima.',
    },
    {
      code: 'JUR_MEMORIAL_ACUSACION_PARTICULAR',
      name: 'Memorial de Presentación de Acusación Particular',
      category: 'INFORME_JURIDICO' as const,
      description: 'Escrito de personamiento penal para sustentar la acusación fiscal formal contra el agresor en la fase de Juicio Oral.',
    },
    {
      code: 'JUR_INFORME_FINAL_CONCILIACION',
      name: 'Informe Final de Conciliación',
      category: 'INFORME_FINAL_CONCILIACION' as const,
      description: 'Documento de cierre del proceso de conciliación que registra los acuerdos alcanzados entre las partes con patrocinio legal de la DNA.',
    },
  ];

  for (const rt of derechoTypes) {
    await prisma.disciplineReportType.upsert({
      where: { code: rt.code },
      update: { name: rt.name, category: rt.category, description: rt.description, isActive: true },
      create: { disciplineId: derecho.id, ...rt },
    });
  }

  console.log(`  ✅ Derecho: ${derechoTypes.length} tipos de informe / memoriales`);

  // ─── 3. TRABAJO SOCIAL ────────────────────────────────────────────────────

  const trabajoSocial = await prisma.discipline.upsert({
    where: { code: 'TRABAJO_SOCIAL' },
    update: { name: 'Trabajo Social', description: 'Área de diagnóstico del entorno familiar y social del NNA — factores de riesgo y protección', isActive: true },
    create: { code: 'TRABAJO_SOCIAL', name: 'Trabajo Social', description: 'Área de diagnóstico del entorno familiar y social del NNA — factores de riesgo y protección' },
  });

  const trabajoSocialTypes = [
    {
      code: 'SOC_FICHA_SOCIAL_HABILITANTE',
      name: 'Ficha Social Habilitante',
      category: 'INFORME_SOCIAL' as const,
      description: 'Primer instrumento de carácter obligatorio del área social que recaba datos del NNA y del cuidador. Su llenado oficial es el único disparador que traslada el caso de Derivación a Evaluación.',
    },
    {
      code: 'SOC_FICHA_VISITA_DOMICILIARIA',
      name: 'Ficha de Visita Domiciliaria Socioeconómica y Croquis',
      category: 'INFORME_SOCIAL' as const,
      description: 'Ficha técnica de campo que registra las características de habitabilidad, riesgos físicos de la vivienda (hacinamiento), higiene, organización y croquis domiciliario detallado.',
    },
    {
      code: 'SOC_INFORME_SOCIAL_INICIAL',
      name: 'Informe Social Inicial (Diagnóstico Social)',
      category: 'INFORME_SOCIAL' as const,
      description: 'Documento que sistematiza la historia familiar, dinámica socio-familiar, recursos económicos, red social de apoyo y evaluación global de riesgos para recomendar medidas de prevención y protección.',
    },
    {
      code: 'SOC_INFORME_SOCIAL_AMPLIADO',
      name: 'Informe Social Ampliado y de Seguimiento',
      category: 'INFORME_SESION_SEGUIMIENTO' as const,
      description: 'Informe de actualización social elaborado durante la etapa preparatoria o de juicio, para evaluar el cumplimiento del plan social o si las condiciones sociofamiliares de la víctima han cambiado.',
    },
    {
      code: 'SOC_INFORME_SEGUIMIENTO_MEDIDAS',
      name: 'Informe de Seguimiento a Medidas de Protección Judiciales',
      category: 'INFORME_SESION_SEGUIMIENTO' as const,
      description: 'Evaluación del cumplimiento de las reglas impuestas al agresor o de la reintegración familiar en centros de acogida. Debe reportarse periódicamente al Juez.',
    },
    {
      code: 'SOC_INFORME_PSICOSOCIAL_COAUTORADO',
      name: 'Informe Psicosocial Coautorado',
      category: 'INFORME_PSICOSOCIAL' as const,
      description: 'Coproducción técnica unificada donde se dictamina el perfil bio-psico-social de la víctima para fundamentar judicialmente el acogimiento temporal o reintegración familiar. Requiere coautoría con Psicología.',
    },
  ];

  for (const rt of trabajoSocialTypes) {
    await prisma.disciplineReportType.upsert({
      where: { code: rt.code },
      update: { name: rt.name, category: rt.category, description: rt.description, isActive: true },
      create: { disciplineId: trabajoSocial.id, ...rt },
    });
  }

  console.log(`  ✅ Trabajo Social: ${trabajoSocialTypes.length} tipos de informe / fichas`);

  // ─── Resumen ──────────────────────────────────────────────────────────────

  const totalTypes = psicologiaTypes.length + derechoTypes.length + trabajoSocialTypes.length;
  console.log(`\n🎉 Seed completado: 3 disciplinas, ${totalTypes} tipos de informe según normativa DNA Sucre.`);
  console.log('   → Los profesionales ahora verán sus tipos de informe disponibles al redactar.');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed de disciplinas:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
