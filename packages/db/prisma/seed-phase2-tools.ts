import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * SEED DATA PARA FASE 2 - LEGAL, PSYCHOLOGICAL, SOCIAL, TRANSVERSAL TOOLS
 * Genera datos de prueba completos para testing end-to-end
 */

async function main() {
  console.log('🌱 Starting Seed for Phase 2 Tools (Legal, Psychological, Social, Transversal)...');

  // Obtener casos existentes
  const cases = await prisma.case.findMany({ take: 10 });
  console.log(`Found ${cases.length} cases to populate with tool data`);

  if (cases.length === 0) {
    console.error('❌ No cases found. Run base seed.ts first.');
    process.exit(1);
  }

  // Obtener usuarios existentes
  const abogado = await prisma.user.findUnique({ where: { email: 'abogado@defensoria.gob.bo' } });
  const psicologo = await prisma.user.findUnique({ where: { email: 'psicologo@defensoria.gob.bo' } });
  const social = await prisma.user.findUnique({ where: { email: 'social@defensoria.gob.bo' } });
  const jefatura = await prisma.user.findUnique({ where: { email: 'jefatura@defensoria.gob.bo' } });

  if (!abogado || !psicologo || !social || !jefatura) {
    console.error('❌ Required users not found. Run base seed.ts first.');
    process.exit(1);
  }

  // ============================================================
  // 1. LEGAL TOOLS DATA
  // ============================================================
  console.log('\n📋 Seeding Legal Tools Data...');

  for (let i = 0; i < Math.min(cases.length, 5); i++) {
    const caseData = cases[i];

    // Discrepancy Analysis
    await prisma.discrepancyAnalysis.create({
      data: {
        caseId: caseData.id,
        analyzedBy: abogado.id,
        riskLevel: i % 3 === 0 ? 'ALTO' : i % 3 === 1 ? 'MEDIO' : 'BAJO',
        consistencyScore: 60 + Math.random() * 40,
        recommendation: `Recomendación legal para caso ${caseData.caseCode}: Se detectaron inconsistencias que requieren aclaración en audiencia.`,
        discrepancies: [
          {
            category: 'Narración de hechos',
            severity: i % 3 === 0 ? 'ALTA' : 'MEDIA',
            currentStatement: 'El incidente ocurrió el 15 de julio en horas de la mañana',
            previousStatement: 'Anteriormente se reportó que fue en la tarde',
            implications: 'Afecta la credibilidad del relato y puede impactar en decisiones del juez',
            suggestedQuestion: '¿A qué hora exacta ocurrieron los hechos?',
          },
          {
            category: 'Identificación de responsables',
            severity: 'MEDIA',
            currentStatement: 'El responsable fue una persona desconocida',
            previousStatement: 'En reporte anterior se mencionó que fue el padrastro',
            implications: 'Requiere clarificación para determinar responsabilidad',
            suggestedQuestion: '¿Conoce la identidad del responsable de los hechos?',
          },
        ],
      },
    });

    // Penal Typicality Analysis
    await prisma.penalTypicityAnalysis.create({
      data: {
        caseId: caseData.id,
        analyzedBy: abogado.id,
        primaryCrime: 'Lesiones Dolosas Graves',
        potentialCrimes: [
          'Lesiones Dolosas Graves (Artículo 291 CP)',
          'Violencia Familiar (Artículo 288 CP)',
          'Maltrato Infantil (Artículo 283 CP)',
        ],
        secondaryCrimes: ['Agresión Sexual (si se comprueba)', 'Explotación Laboral (contexto factual)'],
        evidenceGaps: [
          'Informe médico forense completo',
          'Testimonio de testigos independientes',
          'Pruebas de cadena de custodia',
          'Análisis psicológico de la víctima',
        ],
        investigationPath: 'Prioridad: Asegurar evaluación médica forense. Contactar testigos. Recopilar evidencia física. Realizar entrevista estructurada con menor.',
      },
    });

    // Processual Deadline
    await prisma.processualDeadline.create({
      data: {
        caseId: caseData.id,
        analyzedbBy: abogado.id,
        milestone: 'Presentación de demanda ante juzgado',
        calculatedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        daysRemaining: 30,
        status: 'EN_TIEMPO',
        urgency: 'ALTA',
        alertLevel: 'VERDE',
        relatedLaws: ['Código Niño, Niña y Adolescente - Artículo 142', 'Código Procedimiento Civil - Artículo 189'],
      },
    });
  }

  console.log('✅ Legal Tools data seeded (5 cases with discrepancies, typicality, deadlines)');

  // ============================================================
  // 2. PSYCHOLOGICAL TOOLS DATA
  // ============================================================
  console.log('\n🧠 Seeding Psychological Tools Data...');

  for (let i = 0; i < Math.min(cases.length, 5); i++) {
    const caseData = cases[i];

    // Trauma Indicator Extraction
    await prisma.psychologicalIndicatorExtraction.create({
      data: {
        caseId: caseData.id,
        analyzedbBy: psicologo.id,
        traumaLevel: i % 3 === 0 ? 'ALTO' : i % 3 === 1 ? 'MEDIO' : 'BAJO',
        overallScore: 40 + Math.random() * 60,
        recommendation: `Plan de intervención psicológica para el menor: Iniciar terapia individual con enfoque en procesamiento de trauma. Sesiones 2 veces por semana.`,
        indicators: [
          {
            category: 'Síntomas de Estrés Postraumático',
            severity: i % 3 === 0 ? 'ALTA' : 'MEDIA',
            description: 'Pesadillas recurrentes, flashbacks del evento traumático',
            evidenceFound: 'Relatado por el menor durante evaluación clínica',
            recommendedSupport: 'Terapia de procesamiento de trauma (EMDR o TCC-P)',
          },
          {
            category: 'Depresión',
            severity: 'MEDIA',
            description: 'Aislamiento social, pérdida de interés en actividades previas',
            evidenceFound: 'Observado en entrevista; corroborado por tutores',
            recommendedSupport: 'Terapia individual + evaluación psiquiátrica',
          },
          {
            category: 'Ansiedad Generalizada',
            severity: 'MEDIA',
            description: 'Preocupación excesiva, inquietud motriz',
            evidenceFound: 'Evidencia durante evaluación',
            recommendedSupport: 'Técnicas de regulación emocional y mindfulness',
          },
        ],
      },
    });

    // Risk Scale Prefill
    await prisma.riskScalePrefill.create({
      data: {
        caseId: caseData.id,
        analyzedbBy: psicologo.id,
        sdqScore: 20 + Math.random() * 30,
        sdqInterpretation: 'NORMAL', // o 'BORDERLINE', 'CLINICO'
        rcadsScore: 30 + Math.random() * 40,
        rcadsInterpretation: 'ELEVADO',
        psiScore: 40 + Math.random() * 40,
        psiInterpretation: 'CLINICO',
        recommendation: 'Requiere intervención psicológica especializada. Considerar referencia a psiquiatría infantil para evaluación medicamentosa.',
      },
    });

    // Clinical-Forensic Translation
    await prisma.clinicalForensicTranslation.create({
      data: {
        caseId: caseData.id,
        analyzedbBy: psicologo.id,
        originalText: `El menor presenta síntomas consistentes con trastorno de estrés postraumático. Se observan dificultades en la regulación emocional, episodios de llanto intempestivo, y reactividad exagerada a estímulos sensoriales. El menor verbaliza pensamentos intrusivos relacionados al evento traumático.`,
        translatedText: `Según evaluación clínica, el menor presenta indicadores psicológicos consistentes con experiencia de evento(s) traumático(s), incluyendo: (a) síntomas de re-experimentación (pensamientos intrusivos, pesadillas); (b) dificultades en autorregulación emocional; (c) reactividad neurofisiológica aumentada. Estos hallazgos son compatibles con diagnóstico de Trastorno de Estrés Postraumático en menores.`,
        keyTermsReplaced: [
          { original: 'síntomas de estrés postraumático', translated: 'indicadores psicológicos compatibles con experiencia traumática' },
          { original: 'regulación emocional', translated: 'autorregulación de emociones' },
          { original: 'reactividad exagerada', translated: 'reactividad neurofisiológica aumentada' },
          { original: 'pensamientos intrusivos', translated: 'síntomas de re-experimentación mental' },
        ],
      },
    });
  }

  console.log('✅ Psychological Tools data seeded (5 cases with trauma, scales, translations)');

  // ============================================================
  // 3. SOCIAL TOOLS DATA
  // ============================================================
  console.log('\n👨‍👩‍👧‍👦 Seeding Social Tools Data...');

  for (let i = 0; i < Math.min(cases.length, 5); i++) {
    const caseData = cases[i];

    // Family Structure Generation
    await prisma.socialFamilyMapGeneration.create({
      data: {
        caseId: caseData.id,
        analyzedbBy: social.id,
        familyStructure: 'Monoparental Materna',
        nuclearMembers: 3,
        vulnerabilities: ['Monoparentalidad', 'Ingresos insuficientes', 'Vivienda precaria', 'Acceso limitado a servicios'],
        recommendation: 'Activar programa de fortalecimiento de vínculos familiares. Derivación a programa de asistencia económica. Seguimiento mensual.',
      },
    });

    // Vulnerability Calculation
    await prisma.socialVulnerabilityCalculation.create({
      data: {
        caseId: caseData.id,
        analyzedbBy: social.id,
        vulnerabilityScore: 60 + Math.random() * 40,
        vulnerabilityLevel: i % 3 === 0 ? 'ALTO' : i % 3 === 1 ? 'MEDIO' : 'BAJO',
        riskFactors: [
          { category: 'Vivienda', factor: 'Hacinamiento - 8 personas en 2 ambientes', severity: 'ALTO' },
          { category: 'Empleo', factor: 'Desempleo materno - madre busca trabajo informal', severity: 'ALTO' },
          { category: 'Educación', factor: 'Acceso limitado a educación de calidad', severity: 'MEDIO' },
          { category: 'Servicios', factor: 'Acceso limitado a agua potable', severity: 'MEDIO' },
        ],
        applicablePrograms: [
          { name: 'Bono Juancito Pinto (BJP)', eligibility: 'ELEGIBLE', description: 'Bono de asistencia escolar' },
          { name: 'Programa de Nutrición Escolar', eligibility: 'ELEGIBLE', description: 'Desayuno y almuerzo escolar' },
          { name: 'Crédito Productivo Mujer', eligibility: 'CONDICIONADO', description: 'Para madre - requiere evaluación crediticia' },
        ],
        recommendations: 'Derivación inmediata a Servicios Básicos para mejora de vivienda. Capacitación laboral para madre. Seguimiento trimestral.',
      },
    });

    // Environmental Mapping
    await prisma.socialEnvironmentalMapping.create({
      data: {
        caseId: caseData.id,
        analyzedbBy: social.id,
        location: `Distrito ${i + 1} - Zona Urbano-Marginal`,
        environmentalRisk: i % 2 === 0 ? 'ALTO' : 'MEDIO',
        riskFactorsNearby: [
          'Puntos de venta de bebidas alcohólicas sin control (3 licorías)',
          'Zona de prostitución clandestina (2 cuadras)',
          'Zona de tráfico de sustancias controladas',
          'Falta de iluminación pública',
          'Acceso limitado a transporte público',
        ],
        recommendations: 'Ruta segura hacia escuela establecida. Contacto con Policía Comunitaria. Programa de vigilancia vecinal. Seguimiento de permanencia escolar.',
      },
    });
  }

  console.log('✅ Social Tools data seeded (5 cases with family, vulnerability, environmental)');

  // ============================================================
  // 4. TRANSVERSAL TOOLS DATA
  // ============================================================
  console.log('\n🔀 Seeding Transversal Tools Data...');

  for (let i = 0; i < Math.min(cases.length, 5); i++) {
    const caseData = cases[i];

    // Unified Timeline
    await prisma.transversalUnifiedTimeline.create({
      data: {
        caseId: caseData.id,
        generatedBy: jefatura.id,
        events: [
          {
            timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            actor: 'Secretaría Central',
            actionType: 'CASO_CREADO',
            description: `Caso ${caseData.caseCode} registrado en el sistema`,
            moduleSource: 'system',
            severity: 'info',
          },
          {
            timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            actor: 'Dr. Carlos Mendoza (Abogado)',
            actionType: 'ASIGNACION',
            description: 'Asignación profesional como abogado del caso',
            moduleSource: 'legal',
            severity: 'info',
          },
          {
            timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            actor: 'Dra. Sofía Ríos (Psicóloga)',
            actionType: 'EVALUACION',
            description: 'Evaluación psicológica inicial completada',
            moduleSource: 'psychological',
            severity: 'warning',
          },
          {
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            actor: 'Lic. Roberto Quinteros (Social)',
            actionType: 'INFORME',
            description: 'Informe socio-ambiental generado',
            moduleSource: 'social',
            severity: 'info',
          },
          {
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            actor: 'Sistema',
            actionType: 'ALERTA',
            description: 'Vencimiento de plazo de presentación: 2 días',
            moduleSource: 'system',
            severity: 'critical',
          },
        ],
      },
    });

    // Anonymized Report
    await prisma.transversalAnonymizedReport.create({
      data: {
        caseId: caseData.id,
        generatedBy: jefatura.id,
        confidentialityLevel: 'CONFIDENCIAL',
        reportContent: `REPORTE ANONIMIZADO - CASO [CASO_ID_${i + 1}]

1. INFORMACIÓN DEMOGRÁFICA
   - Víctima: [MENOR_${i + 1}]
   - Edad: [EDAD_ESTIMADA]
   - Género: [GENERO_${i + 1}]
   - Zona de Residencia: [UBICACION_${i + 1}]

2. HALLAZGOS PRINCIPALES
   - [HALLAZGO_LEGAL_${i + 1}]
   - [HALLAZGO_PSICOLOGICO_${i + 1}]
   - [HALLAZGO_SOCIAL_${i + 1}]

3. RECOMENDACIONES PROFESIONALES
   - Derivación a [INSTITUCION]
   - Seguimiento cada [PERIODO]
   - Intervención especializada: [TIPO]

4. FIRMAS AUTORIZADAS
   - Profesional Legal: Dr./Dra. [NOMBRE_ABOGADO]
   - Profesional Psicológico: Dr./Dra. [NOMBRE_PSICOLOGO]
   - Profesional Social: Lic./Lica. [NOMBRE_SOCIAL]
   - Jefatura Responsable: [JEFE_DISTRITAL]

Fecha: ${new Date().toLocaleDateString('es-ES')}
Estado: ANONIMIZADO PARA JUZGADO`,
        anonymizationRules: [
          { pattern: 'nombre_nna', replacedWith: `[MENOR_${i + 1}]`, count: 3 },
          { pattern: 'cedula_nna', replacedWith: `[ID_${i + 1}]`, count: 1 },
          { pattern: 'direccion', replacedWith: `[UBICACION_${i + 1}]`, count: 2 },
          { pattern: 'nombre_tutor', replacedWith: '[RESPONSABLE_LEGAL]', count: 2 },
          { pattern: 'nombre_abogado', replacedWith: '[PROFESIONAL_LEGAL]', count: 1 },
        ],
      },
    });
  }

  console.log('✅ Transversal Tools data seeded (5 cases with timeline, anonymized reports)');

  console.log('\n🎉 All Phase 2 Tools data seeded successfully!');
  console.log('📊 Summary:');
  console.log(`   - Legal Tools: 5 cases (discrepancies, typicality, deadlines)`);
  console.log(`   - Psychological Tools: 5 cases (indicators, scales, translations)`);
  console.log(`   - Social Tools: 5 cases (family, vulnerability, environmental)`);
  console.log(`   - Transversal Tools: 5 cases (timeline, anonymized reports)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
