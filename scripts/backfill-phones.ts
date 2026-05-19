import { PrismaClient } from '@prisma/client';
import { normalizeVietnamPhone } from '../src/lib/processing/contact-extractor';

const prisma = new PrismaClient();

/**
 * Backfill phone for leads that have nationalPhoneNumber or internationalPhoneNumber
 * but phone is null.
 *
 * Run: npx tsx --tsconfig tsconfig.json scripts/backfill-phones.ts
 */
async function backfillPhones() {
  console.log('📞 Backfill Phones\n');

  const leads = await prisma.lead.findMany({
    where: {
      phone: null,
      OR: [
        { nationalPhoneNumber: { not: null } },
        { internationalPhoneNumber: { not: null } },
      ],
    },
  });

  console.log(`Found ${leads.length} leads missing phone\n`);

  let updated = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const bestPhone =
      normalizeVietnamPhone(lead.nationalPhoneNumber || '') ||
      normalizeVietnamPhone(lead.internationalPhoneNumber || '') ||
      null;

    if (bestPhone) {
      await prisma.lead.update({
        where: { id: lead.id },
        data: { phone: bestPhone },
      });
      updated++;
      console.log(`[${i + 1}/${leads.length}] ${lead.companyName} → ${bestPhone}`);
    } else {
      console.log(`[${i + 1}/${leads.length}] ${lead.companyName} → SKIP (cannot normalize)`);
    }
  }

  console.log(`\n✅ Updated: ${updated}/${leads.length}`);
}

backfillPhones()
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
