import { PrismaClient } from '@prisma/client';
import { calculateLeadScore } from '../src/lib/intent';

const prisma = new PrismaClient();

/**
 * Backfill reputation intent signals and recalculate scores for all leads.
 *
 * Run: npx tsx --tsconfig tsconfig.json scripts/backfill-reputation.ts
 */
async function backfillReputation() {
  console.log('⭐ Backfill Reputation Intent Signals\n');

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: 'desc' },
  });

  console.log(`Found ${leads.length} leads to process\n`);

  let updated = 0;
  let unchanged = 0;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const progress = `[${i + 1}/${leads.length}]`;

    // Build existing intent signals
    const existingSignals = (lead.intentSignals as Array<{
      type: string;
      label: string;
      confidence?: number;
      source?: string;
      evidence?: string;
    }>) || [];

    // Detect reputation signals from existing data
    const newSignals = [];
    const rating = lead.rating ? parseFloat(String(lead.rating)) : undefined;
    const count = lead.userRatingCount || 0;

    if (rating !== undefined && count > 0) {
      if (rating >= 4.5 && count >= 50) {
        newSignals.push({
          type: 'strong_reputation',
          label: `⭐ Uy tín cao (${rating}★, ${count} đánh giá)`,
          confidence: Math.min(0.6 + count / 1000, 0.95),
          source: 'google_maps_reviews',
          evidence: `Rating ${rating} với ${count} đánh giá`,
        });
      } else if (rating >= 4.0 && count >= 100) {
        newSignals.push({
          type: 'strong_reputation',
          label: `⭐ Uy tín tốt (${rating}★, ${count} đánh giá)`,
          confidence: 0.7,
          source: 'google_maps_reviews',
          evidence: `Rating ${rating} với ${count} đánh giá`,
        });
      }

      if (count >= 200) {
        newSignals.push({
          type: 'high_engagement',
          label: `💬 Nhiều tương tác (${count} đánh giá)`,
          confidence: 0.8,
          source: 'google_maps_reviews',
          evidence: `${count} đánh giá trên Google Maps`,
        });
      }
    }

    // Merge signals, avoid duplicates by type
    const signalMap = new Map(existingSignals.map((s) => [s.type, s]));
    for (const ns of newSignals) {
      if (!signalMap.has(ns.type)) {
        signalMap.set(ns.type, ns);
      }
    }
    const mergedSignals = Array.from(signalMap.values());

    // Recalculate score
    const leadAgeDays = Math.floor(
      (Date.now() - lead.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const painSignals = (lead.painSignals as string[]) || [];
    const hasPhone = !!lead.phone;
    const hasZalo = lead.websiteUrl?.includes('zalo.me') || false;
    const hasFacebook = lead.websiteUrl?.includes('facebook.com') || false;

    const scoreResult = calculateLeadScore({
      intentSignals: mergedSignals,
      hasPhone,
      hasZalo,
      hasFacebook,
      hasEmail: false,
      painSignals,
      leadAgeDays,
    });

    // Build intent summary
    let intentSummary = '';
    if (mergedSignals.length > 0) {
      intentSummary = mergedSignals
        .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
        .slice(0, 2)
        .map((s) => s.label)
        .join('. ');
    }

    // Check if changed
    const oldScore = lead.leadScore;
    const oldLabel = lead.leadScoreLabel;
    const oldSignalCount = existingSignals.length;

    if (
      oldScore === scoreResult.score &&
      oldLabel === scoreResult.label &&
      oldSignalCount === mergedSignals.length
    ) {
      unchanged++;
      continue;
    }

    await prisma.lead.update({
      where: { id: lead.id },
      data: {
        leadScore: scoreResult.score,
        leadScoreLabel: scoreResult.label,
        intentSignals: mergedSignals as any,
        intentSummary: intentSummary || null,
      },
    });

    updated++;
    console.log(
      `${progress} ${lead.companyName.padEnd(35)} | ${oldScore}/${oldLabel} → ${scoreResult.score}/${scoreResult.label} | Signals: ${oldSignalCount}→${mergedSignals.length}`
    );
  }

  console.log('\n───────────────────────────────────────');
  console.log(`✅ Updated:   ${updated}`);
  console.log(`⏭️  Unchanged: ${unchanged}`);
  console.log(`📊 Total:     ${leads.length}`);
  console.log('───────────────────────────────────────');
}

backfillReputation()
  .catch((err) => {
    console.error('Backfill failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
