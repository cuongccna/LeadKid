import { PrismaClient } from '@prisma/client';
import { calculateLeadScore } from '../src/lib/intent';

const prisma = new PrismaClient();

/**
 * Backfill lead scores, intent signals, and intent summary for existing leads
 * that were created before the Monetization V1.2 migration.
 *
 * Run: npx tsx --tsconfig tsconfig.json scripts/backfill-lead-scores.ts
 */
async function backfillLeads() {
  console.log('🔧 Backfill Lead Scores & Intent Signals\n');

  // Find all leads with default score (0) and empty intent signals
  const leads = await prisma.lead.findMany({
    where: {
      OR: [
        { leadScore: 0 },
        { intentSignals: { equals: [] } },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${leads.length} leads to backfill\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const progress = `[${i + 1}/${leads.length}]`;

    try {
      // ─── Detect intent from website URL ───
      const intentSignals: Array<{
        type: string;
        label: string;
        confidence?: number;
        source?: string;
        evidence?: string;
      }> = [];

      const websiteUrl = lead.websiteUrl || '';
      const websiteLower = websiteUrl.toLowerCase();

      if (websiteLower.includes('facebook.com')) {
        intentSignals.push({
          type: 'has_facebook_page',
          label: '📘 Có Fanpage Facebook',
          confidence: 0.9,
          source: 'website_url',
          evidence: `URL: ${websiteUrl}`,
        });
      }

      if (websiteLower.includes('shopee.vn') || websiteLower.includes('shopee')) {
        intentSignals.push({
          type: 'has_ecommerce',
          label: '🛒 Đang bán hàng online (Shopee)',
          confidence: 0.8,
          source: 'website_url',
          evidence: `URL: ${websiteUrl}`,
        });
      }

      // ─── Build intent summary ───
      let intentSummary = '';
      if (intentSignals.length > 0) {
        intentSummary = intentSignals
          .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
          .slice(0, 2)
          .map((s) => s.label)
          .join('. ');
      }

      // ─── Calculate lead age in days ───
      const leadAgeDays = Math.floor(
        (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      // ─── Calculate score ───
      const painSignals = (lead.painSignals as string[]) || [];
      const hasPhone = !!lead.phone;
      const hasZalo = websiteLower.includes('zalo.me');
      const hasFacebook = websiteLower.includes('facebook.com');

      const scoreResult = calculateLeadScore({
        intentSignals,
        hasPhone,
        hasZalo,
        hasFacebook,
        hasEmail: false,
        painSignals,
        leadAgeDays,
      });

      // ─── Determine facebookPageUrl ───
      let facebookPageUrl: string | null = null;
      if (websiteLower.includes('facebook.com')) {
        facebookPageUrl = websiteUrl;
      }

      // ─── Only update if something changed ───
      const needsUpdate =
        lead.leadScore === 0 ||
        (lead.intentSignals as any[]).length === 0 ||
        !lead.intentSummary;

      if (!needsUpdate) {
        skipped++;
        continue;
      }

      await prisma.lead.update({
        where: { id: lead.id },
        data: {
          leadScore: scoreResult.score,
          leadScoreLabel: scoreResult.label,
          intentSignals: intentSignals as any,
          intentSummary: intentSummary || null,
          facebookPageUrl,
        },
      });

      updated++;
      console.log(
        `${progress} ${lead.companyName.padEnd(30)} | Score: ${scoreResult.score.toString().padStart(2)}/${scoreResult.label.padEnd(6)} | Intent: ${intentSignals.length} signals`
      );
    } catch (err) {
      errors++;
      console.error(`${progress} ERROR processing ${lead.companyName}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log('\n───────────────────────────────────────');
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors:  ${errors}`);
  console.log('───────────────────────────────────────');
}

backfillLeads()
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
