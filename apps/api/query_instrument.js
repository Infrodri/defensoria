const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const rt = await prisma.disciplineReportType.findUnique({ where: { id: '30416b69-e4e0-4c97-8dc6-6adc6f7a805d' } });
  console.log('ReportType:', rt);
}
main().catch(console.error).finally(() => prisma.$disconnect());
