import { PrismaClient, Role, DiscrepancyRiskLevel, ProcessualStatus, ProcessualAlertLevel } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PHASE 2 TOOLS seed for LEGAL, PSYCHOLOGICAL, SOCIAL, TRANSVERSAL modules...');

  try {
    // 1. Get 5 existing cases
    console.log('\n📋 Fetching 5 existing cases...');
    const cases = await prisma.case.findMany({
      take: 5,
      include: {
        currentOffice: true,
        parties: {
          where: { isPrimary: true },
          include: { person: true },
        },
      },
    });

    if (cases.length === 0) {
      console.error('❌ No cases found. Run base seed first!');
      process.exit(1);
    }

    console.log(`✅ Found ${cases.length} cases to work with`);

    // 2. Get users by role
    console.log('\n👥 Fetching users by role...');
    
    const abogados = await prisma.user.findMany({
      where: { role: Role.ABOGADO },
      take: 5,
    });

    const psicologos = await prisma.user.findMany({
      where: { role: Role.PSICOLOGO },
      take: 5,
    });

    const sociales = await prisma.user.findMany({
      where: { role: Role.SOCIAL },
      take: 5,
    });

    const jefaturas = await prisma.user.findMany({
      where: { role: Role.JEFATURA },
      take: 1,
    });

    if (abogados.length === 0 || psicologos.length === 0 || sociales.length === 0) {
      console.warn('⚠️  Warning: Not all specialist roles found. Using available users.');
    }

    const defaultAbogado = abogados[0] || jefaturas[0];
    const defaultPsicologo = psicologos[0] || jefaturas[0];
    const defaultSocial = sociales[0] || jefaturas[0];

    console.log(`✅ Found ${abogados.length} abogados, ${psicologos.length} psicologos, ${sociales.length} sociales`);

    // 3. Get evidences for transcription creation
    console.log('\n📄 Fetching evidences for transcriptions...');
    const evidences = await prisma.evidence.findMany({
      take: 5,
    });

    if (evidences.length === 0) {
      console.warn('⚠️  Warning: No evidences found. Creating dummy evidences...');
      // Create dummy evidences if none exist
      const createdEvidences = await Promise.all(
        cases.slice(0, 5).map((caseItem, idx) =>
          prisma.evidence.create({
            data: {
              caseId: caseItem.id,
              fileName: `evidence-${caseItem.id}-${idx}.mp3`,
              mimeType: 'audio/mpeg',
              fileSize: 5242880, // 5MB
              storagePath: `s3://defensoria-evidences/evidence-${caseItem.id}-${idx}.mp3`,
              fileHash: `hash-${caseItem.id}-${idx}`,
              description: `Transcriptible evidence for case ${caseItem.caseCode}`,
              uploadedBy: defaultAbogado.id,
            },
          })
        )
      );
      evidences.push(...createdEvidences);
    }

    console.log(`✅ Found ${evidences.length} evidences available`);

    // 4. For each case, create seed data for all modules
    console.log('\n🔄 Creating Phase 2 Tools data for each case...\n');

    for (let caseIdx = 0; caseIdx < Math.min(cases.length, 5); caseIdx++) {
      const caseItem = cases[caseIdx];
      const evidence = evidences[caseIdx] || evidences[0];
      const abogado = abogados[caseIdx % abogados.length] || defaultAbogado;
      const psicologo = psicologos[caseIdx % psicologos.length] || defaultPsicologo;
      const social = sociales[caseIdx % sociales.length] || defaultSocial;

      console.log(`\n📌 Processing case ${caseIdx + 1}/5: ${caseItem.caseCode}`);

      // 4a. Create Transcription (dummy)
      console.log(`  → Creating Transcription...`);
      const transcription = await prisma.transcription.create({
        data: {
          caseId: caseItem.id,
          evidenceId: evidence.id,
          text: `Transcripción automática de evidencia para caso ${caseItem.caseCode}. Contenido de audio procesado y convertido a texto para análisis forense y legal.`,
          duration: '00:45:30',
          confidence: 0.92,
          language: 'es',
          status: 'COMPLETADA',
          createdBy: abogado.id,
        },
      });
      console.log(`    ✅ Transcription created: ${transcription.id}`);

      // 4b. Create DiscrepancyAnalysis
      console.log(`  → Creating DiscrepancyAnalysis...`);
      const discrepancyAnalysis = await prisma.discrepancyAnalysis.create({
        data: {
          caseId: caseItem.id,
          currentTranscriptionId: transcription.id,
          analyzedBy: abogado.id,
          discrepancies: [
            {
              type: 'TEMPORAL',
              severity: 'ALTO',
              description: 'Inconsistencia temporal en declaración del testigo respecto a hora del evento',
              locations: [{ timestamp: '12:34', statement: 'A las 2 PM' }, { timestamp: '45:12', statement: 'A las 3 PM' }],
            },
            {
              type: 'FACTUAL',
              severity: 'MEDIO',
              description: 'Discrepancia en detalles de la víctima mencionados en diferentes partes de la declaración',
              locations: [{ timestamp: '05:20', statement: 'Víctima con vestimenta roja' }, { timestamp: '32:10', statement: 'Víctima con vestimenta azul' }],
            },
          ],
          consistencyScore: 74.5,
          riskLevel: DiscrepancyRiskLevel.MEDIO,
          recommendation: 'Se recomienda contrainterrogatorio enfocado en aclaración de discrepancias temporales y detalles de identificación de la víctima.',
        },
      });
      console.log(`    ✅ DiscrepancyAnalysis created: ${discrepancyAnalysis.id}`);

      // 4c. Create PenalTypicityAnalysis
      console.log(`  → Creating PenalTypicityAnalysis...`);
      const penalAnalysis = await prisma.penalTypicityAnalysis.create({
        data: {
          caseId: caseItem.id,
          transcriptionId: transcription.id,
          analyzedBy: abogado.id,
          potentialCrimes: [
            {
              crime: 'Maltrato Infantil',
              articles: ['Art. 258 CPE', 'Ley 548'],
              confidence: 0.88,
              evidence: ['Declaración de víctima', 'Lesiones documentadas'],
            },
            {
              crime: 'Negligencia Criminal',
              articles: ['Art. 342 CPE'],
              confidence: 0.65,
              evidence: ['Falta de supervisión documentada'],
            },
          ],
          primaryCrime: 'Maltrato Infantil - Art. 258 CPE',
          secondaryCrimes: ['Negligencia Criminal - Art. 342 CPE'],
          evidenceGaps: ['Informe médico forense completo', 'Testimonio de vecinos corroborantes', 'Registros escolares de asistencia'],
          investigationPath: 'Ruta recomendada: 1) Asegurar evaluación médica forense completa, 2) Entrevistas a terceros corroborantes, 3) Análisis de antecedentes del imputado, 4) Medidas de protección inmediatas de la víctima.',
        },
      });
      console.log(`    ✅ PenalTypicityAnalysis created: ${penalAnalysis.id}`);

      // 4d. Create ProcessualDeadline
      console.log(`  → Creating ProcessualDeadline...`);
      const today = new Date();
      const deadlineDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
      const procesualDeadline = await prisma.processualDeadline.create({
        data: {
          caseId: caseItem.id,
          createdBy: abogado.id,
          milestone: 'Presentación de Pruebas ante Juez de Garantías',
          calculatedDate: deadlineDate,
          daysRemaining: 30,
          status: ProcessualStatus.EN_TIEMPO,
          urgency: 65,
          alertLevel: ProcessualAlertLevel.AMARILLO,
          relatedLaws: ['Ley 548 - SPINA', 'Art. 186 CPC', 'Decreto 25135'],
        },
      });
      console.log(`    ✅ ProcessualDeadline created: ${procesualDeadline.id}`);

      // 4e. Create TransversalUnifiedTimeline
      console.log(`  → Creating TransversalUnifiedTimeline...`);
      const timeline = await prisma.transversalUnifiedTimeline.create({
        data: {
          caseId: caseItem.id,
          createdBy: social.id,
          events: [
            {
              date: '2026-01-15',
              time: '14:30',
              type: 'LEGAL',
              specialist: 'Abogada Mariana',
              event: 'Primera evaluación legal de vulneración',
              details: 'Se documenta narrativa de caso y se evalúa ruta de intervención',
            },
            {
              date: '2026-01-16',
              time: '10:00',
              type: 'PSYCHOLOGICAL',
              specialist: 'Psicólogo Roberto',
              event: 'Evaluación psicológica inicial',
              details: 'Evaluación de estado emocional, trauma, capacidad de resiliencia',
            },
            {
              date: '2026-01-16',
              time: '15:30',
              type: 'SOCIAL',
              specialist: 'Trabajador Social Carlos',
              event: 'Evaluación de contexto familiar y social',
              details: 'Visita domiciliaria, evaluación de red de contención, recursos disponibles',
            },
            {
              date: '2026-01-20',
              time: '09:00',
              type: 'LEGAL',
              specialist: 'Abogada Mariana',
              event: 'Audiencia de medidas de protección',
              details: 'Solicitud y aprobación de medidas cautelares de protección',
            },
            {
              date: '2026-01-25',
              time: '11:00',
              type: 'PSYCHOLOGICAL',
              specialist: 'Psicólogo Roberto',
              event: 'Seguimiento y reevaluación psicológica',
              details: 'Evaluación de respuesta a medidas de protección, ajustes al plan terapéutico',
            },
          ],
        },
      });
      console.log(`    ✅ TransversalUnifiedTimeline created: ${timeline.id}`);

      // 4f. Create TransversalAnonymizedReport
      console.log(`  → Creating TransversalAnonymizedReport...`);
      const anonymizedReport = await prisma.transversalAnonymizedReport.create({
        data: {
          caseId: caseItem.id,
          createdBy: social.id,
          originalReportId: evidence.id, // Relationship to original report
          anonymizedContent: `
INFORME TRANSVERSAL UNIFICADO - ANONIMIZADO
Caso: [CASO-${caseIdx + 1}]
Fecha: ${new Date().toISOString().split('T')[0]}

RESUMEN EJECUTIVO:
Evaluación integral de menor NNA [NOMBRE_ANONIMIZADO_${caseIdx + 1}] (edad [EDAD_ANONIMIZADA]) 
en contexto de [TIPO_VULNERACION_ANONIMIZADA].

HALLAZGOS LEGALES:
- Se identifica potencial tipificación delictiva bajo Art. 258 CPE
- Requiere medidas de protección inmediatas
- Ruta recomendada: Judicialización con protección cautelar

HALLAZGOS PSICOLÓGICOS:
- Indicadores de trauma moderado
- Capacidad de resiliencia presente
- Requiere seguimiento psicoterapéutico

HALLAZGOS SOCIALES:
- Red de contención limitada pero presente
- Recursos económicos insuficientes para manutención
- Requiere apoyo para acceso a servicios básicos

RECOMENDACIONES INTEGRADAS:
1. Medidas legales de protección inmediata
2. Tratamiento psicológico especializado en trauma infantil
3. Apoyo social para acceso a servicios de salud y educación
4. Seguimiento integrado multidisciplinario con evaluaciones cada 30 días
`,
          replacements: {
            '[CASO-${caseIdx + 1}]': `DNA-2026-${String(caseIdx + 1).padStart(4, '0')}`,
            '[NOMBRE_ANONIMIZADO_${caseIdx + 1}]': `NNA_${caseIdx + 1}`,
            '[EDAD_ANONIMIZADA]': `${8 + caseIdx}`,
            '[TIPO_VULNERACION_ANONIMIZADA]': ['Maltrato físico', 'Negligencia', 'Explotación', 'Abuso'][caseIdx % 4],
          },
        },
      });
      console.log(`    ✅ TransversalAnonymizedReport created: ${anonymizedReport.id}`);

      console.log(`\n✅ Case ${caseIdx + 1} completed successfully!`);
    }

    // 5. Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PHASE 2 TOOLS SEED SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Transcriptions created: 5+`);
    console.log(`✅ DiscrepancyAnalysis created: 5+`);
    console.log(`✅ PenalTypicityAnalysis created: 5+`);
    console.log(`✅ ProcessualDeadline created: 5+`);
    console.log(`✅ TransversalUnifiedTimeline created: 5+`);
    console.log(`✅ TransversalAnonymizedReport created: 5+`);
    console.log('='.repeat(60));
    console.log('🎉 Phase 2 seed completed successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
