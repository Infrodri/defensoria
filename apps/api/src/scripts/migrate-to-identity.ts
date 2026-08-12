import { PrismaClient, RoleInCase, Gender } from '@defensoria/db';

const prisma = new PrismaClient();

const dryRun = process.argv.includes('--dry-run');

export function normalizeCI(ci: string): string {
  if (!ci) return '';
  return ci
    .trim()
    .replace(/[\s-]*(LP|SC|CB|OR|PT|TJ|BE|PD|CH)$/i, '')
    .replace(/\./g, '')
    .replace(/\D/g, '');
}

export function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: 'Desconocido', lastName: 'Desconocido' };
  }
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }
  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1] };
  }
  if (parts.length === 3) {
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }
  return {
    firstName: parts.slice(0, 2).join(' '),
    lastName: parts.slice(2).join(' '),
  };
}

async function migrateToIdentity() {
  if (dryRun) {
    console.log('🚀 Starting identity refactoring migration (DRY RUN)...');
  } else {
    console.log('🚀 Starting identity refactoring migration...');
  }

  // Read flat fields directly from DB table 'cases' so script works cleanly
  const cases = await prisma.$queryRaw<Array<{
    id: string;
    caseCode: string;
    createdBy: string;
    isThirdPartyComplainant: boolean | null;
    complainantFullName: string | null;
    complainantDocumentId: string | null;
    complainantRelation: string | null;
    complainantPhone: string | null;
    complainantAddress: string | null;
    nnaBirthDate: Date | null;
    nnaGender: string | null;
    nnaCity: string | null;
    nnaPhone: string | null;
    nnaAddress: string | null;
  }>>`
    SELECT 
      "id",
      "caseCode",
      "createdBy",
      "isThirdPartyComplainant",
      "complainantFullName",
      "complainantDocumentId",
      "complainantRelation",
      "complainantPhone",
      "complainantAddress",
      "nnaBirthDate",
      "nnaGender",
      "nnaCity",
      "nnaPhone",
      "nnaAddress"
    FROM "cases"
  `;

  console.log(`Found ${cases.length} cases to process.`);

  let totalCasesProcessed = 0;
  let personsCreated = 0;
  let personsReused = 0;
  let partiesCreated = 0;
  let partiesSkipped = 0;
  let nnaUpdated = 0;

  for (const caseItem of cases) {
    totalCasesProcessed++;

    await prisma.$transaction(async (tx) => {
      // 1. Process Third-Party Complainant (Denunciante)
      if (caseItem.isThirdPartyComplainant && caseItem.complainantFullName && caseItem.complainantFullName.trim() !== '') {
        const existingDenuncianteParty = await tx.caseParty.findFirst({
          where: {
            caseId: caseItem.id,
            roleInCase: RoleInCase.DENUNCIANTE,
          },
        });

        if (existingDenuncianteParty) {
          console.log(`[${caseItem.caseCode}] DENUNCIANTE: CaseParty already exists, skipping.`);
          partiesSkipped++;
        } else {
          const { firstName, lastName } = splitName(caseItem.complainantFullName);
          let complainantPerson: any = null;

          const rawDoc = caseItem.complainantDocumentId ? caseItem.complainantDocumentId.trim() : '';
          const normalizedDoc = rawDoc ? normalizeCI(rawDoc) : '';

          if (normalizedDoc) {
            complainantPerson = await tx.person.findFirst({
              where: { documentNumber: normalizedDoc },
            });
            if (!complainantPerson && rawDoc !== normalizedDoc) {
              complainantPerson = await tx.person.findFirst({
                where: { documentNumber: rawDoc },
              });
            }
            if (!complainantPerson) {
              const candidates = await tx.person.findMany({
                where: { documentNumber: { not: null } },
              });
              complainantPerson = candidates.find(
                (p) => p.documentNumber && normalizeCI(p.documentNumber) === normalizedDoc,
              ) || null;
            }
          }

          if (!complainantPerson) {
            complainantPerson = await tx.person.findFirst({
              where: {
                firstName: firstName,
                lastName: lastName,
              },
            });
          }

          if (complainantPerson) {
            personsReused++;
            console.log(`[${caseItem.caseCode}] DENUNCIANTE: reused personId=${complainantPerson.id}`);
          } else {
            personsCreated++;
            if (!dryRun) {
              complainantPerson = await tx.person.create({
                data: {
                  firstName,
                  lastName,
                  documentType: caseItem.complainantDocumentId ? 'CI' : 'SIN_DOCUMENTO',
                  documentNumber: normalizedDoc || (caseItem.complainantDocumentId ? caseItem.complainantDocumentId.trim() : null),
                  phone: caseItem.complainantPhone || null,
                  address: caseItem.complainantAddress || null,
                  createdBy: caseItem.createdBy,
                },
              });
              console.log(`[${caseItem.caseCode}] DENUNCIANTE: created personId=${complainantPerson.id}`);
            } else {
              complainantPerson = { id: 'DRY_RUN_ID' };
              console.log(`[${caseItem.caseCode}] DENUNCIANTE: created personId=DRY_RUN_ID`);
            }
          }

          if (!dryRun) {
            await tx.caseParty.create({
              data: {
                caseId: caseItem.id,
                personId: complainantPerson.id,
                roleInCase: RoleInCase.DENUNCIANTE,
                isPrimary: false,
                createdBy: caseItem.createdBy,
              },
            });
          }
          partiesCreated++;
        }
      }

      // 2. Process NNA Demographics Update
      const nnaParty = await tx.caseParty.findFirst({
        where: {
          caseId: caseItem.id,
          roleInCase: RoleInCase.NNA,
        },
        include: {
          person: true,
        },
      });

      if (nnaParty && nnaParty.person) {
        const personUpdate: any = {};
        if (caseItem.nnaBirthDate) {
          personUpdate.birthDate = caseItem.nnaBirthDate;
        }
        if (caseItem.nnaGender) {
          personUpdate.gender = caseItem.nnaGender as Gender;
        }
        if (caseItem.nnaPhone) {
          personUpdate.phone = caseItem.nnaPhone;
        }

        let newAddress = nnaParty.person.address;
        if (caseItem.nnaAddress || caseItem.nnaCity) {
          if (caseItem.nnaAddress && caseItem.nnaCity) {
            if (!caseItem.nnaAddress.includes(caseItem.nnaCity)) {
              newAddress = `${caseItem.nnaAddress}, ${caseItem.nnaCity}`;
            } else {
              newAddress = caseItem.nnaAddress;
            }
          } else {
            newAddress = caseItem.nnaAddress || caseItem.nnaCity || null;
          }
        }
        if (newAddress && newAddress !== nnaParty.person.address) {
          personUpdate.address = newAddress;
        }

        if (Object.keys(personUpdate).length > 0) {
          if (!dryRun) {
            await tx.person.update({
              where: { id: nnaParty.person.id },
              data: personUpdate,
            });
          }
          console.log(`[${caseItem.caseCode}] NNA: updated personId=${nnaParty.person.id}`);
          nnaUpdated++;
        }
      }
    });
  }

  console.log(`\n✅ Migration complete!`);
  console.log(`- Total cases processed: ${totalCasesProcessed}`);
  console.log(`- Persons created: ${personsCreated}`);
  console.log(`- Persons reused: ${personsReused}`);
  console.log(`- Parties created: ${partiesCreated}`);
  console.log(`- Parties skipped: ${partiesSkipped}`);
}

migrateToIdentity()
  .catch((e) => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

