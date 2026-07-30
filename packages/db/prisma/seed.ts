import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Create Central Office
  const centralOffice = await prisma.office.upsert({
    where: { code: 'CENTRAL' },
    update: {},
    create: {
      name: 'Defensoría Central Sucre',
      code: 'CENTRAL',
      address: 'Calle Junín N° 450, Sucre',
      phone: '+591 4 64-51234',
    },
  });

  console.log(`✅ Office created: ${centralOffice.name} (${centralOffice.code})`);

  // 2. Hash default password
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 3. Seed users for each role
  const usersToSeed = [
    {
      email: 'jefatura@defensoria.gob.bo',
      firstName: 'Elena',
      lastName: 'Vargas Jefatura',
      role: Role.JEFATURA,
    },
    {
      email: 'secretaria@defensoria.gob.bo',
      firstName: 'Mariana',
      lastName: 'Soliz Secretaría',
      role: Role.SECRETARIA,
    },
    {
      email: 'abogado@defensoria.gob.bo',
      firstName: 'Carlos',
      lastName: 'Mendoza Abogado',
      role: Role.ABOGADO,
    },
    {
      email: 'psicologo@defensoria.gob.bo',
      firstName: 'Sofía',
      lastName: 'Ríos Psicóloga',
      role: Role.PSICOLOGO,
    },
    {
      email: 'social@defensoria.gob.bo',
      firstName: 'Roberto',
      lastName: 'Quinteros Trabajo Social',
      role: Role.SOCIAL,
    },
  ];

  for (const user of usersToSeed) {
    const createdUser = await prisma.user.upsert({
      where: { email: user.email },
      update: {
        role: user.role,
        officeId: centralOffice.id,
      },
      create: {
        email: user.email,
        passwordHash,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        officeId: centralOffice.id,
      },
    });

    console.log(`👤 User created/updated: ${createdUser.firstName} (${createdUser.email}) - Role: ${createdUser.role}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
