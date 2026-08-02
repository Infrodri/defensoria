import { PrismaClient, Role, CaseType, Phase, InterventionPath, RiskLevel, RoleInCase } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting multi-district comprehensive seed for DNA Sucre (All 9 Districts)...');

  // 0. Clean up existing test records for clean idempotent seeding
  await prisma.actionLog.deleteMany({});
  await prisma.report.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.inspectionFinding.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.establishment.deleteMany({});
  await prisma.caseTeamHistory.deleteMany({});
  await prisma.caseOfficeHistory.deleteMany({});
  await prisma.interventionPathHistory.deleteMany({});
  await prisma.caseParty.deleteMany({});
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
}

main()

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
