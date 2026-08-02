const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const docs = await prisma.legalDocument.findMany();
    if (docs.length > 0) {
      const docId = docs[0].id;
      const chunks = await prisma.$queryRaw`
        SELECT id, content, metadata
        FROM legal_chunks
        WHERE "legalDocumentId" = ${docId}::uuid
        ORDER BY (metadata->>'chunkIndex')::int ASC
      `;
      console.log('Success:', chunks.length);
    } else {
      console.log('No docs');
    }
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
