import { IntentSignal } from './detector';

export interface LeadScoreInput {
  intentSignals: IntentSignal[];
  hasPhone: boolean;
  hasZalo: boolean;
  hasFacebook: boolean;
  hasEmail: boolean;
  painSignals: string[];
  leadAgeDays: number;
}

export interface LeadScoreResult {
  score: number;
  label: 'hot' | 'good' | 'medium' | 'low';
  breakdown: {
    intent: number;
    contact: number;
    recency: number;
    pain: number;
  };
}

export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
  // ─── Intent Score (0-40) ───
  let intentScore = 0;
  const intentTypes = new Set(input.intentSignals.map((s) => s.type));

  if (intentTypes.has('running_facebook_ads')) intentScore += 15;
  if (intentTypes.has('recently_hiring')) intentScore += 15;
  if (intentTypes.has('has_facebook_page')) intentScore += 5;
  if (intentTypes.has('recent_google_posts')) intentScore += 10;
  if (intentTypes.has('high_ad_spend')) intentScore += 10;
  if (intentTypes.has('strong_reputation')) intentScore += 8;
  if (intentTypes.has('high_engagement')) intentScore += 5;

  intentScore = Math.min(intentScore, 40);

  // ─── Contact Score (0-30) ───
  let contactScore = 0;
  if (input.hasPhone && input.hasZalo) contactScore += 30;
  else if (input.hasPhone) contactScore += 20;
  else if (input.hasFacebook) contactScore += 15;
  else if (input.hasEmail) contactScore += 10;

  // ─── Recency Score (0-20) ───
  let recencyScore = 0;
  if (input.leadAgeDays < 7) recencyScore += 20;
  else if (input.leadAgeDays < 30) recencyScore += 10;

  // ─── Pain Score (0-10) ───
  let painScore = 0;
  const painSet = new Set(input.painSignals);
  if (painSet.has('no_website') && painSet.has('no_booking')) painScore += 10;
  else if (painSet.has('no_website')) painScore += 7;
  else if (painSet.has('slow_website')) painScore += 5;
  else if (painSet.has('no_zalo_chat')) painScore += 3;

  // ─── Total ───
  const totalScore = intentScore + contactScore + recencyScore + painScore;

  let label: LeadScoreResult['label'];
  if (totalScore >= 85) label = 'hot';
  else if (totalScore >= 70) label = 'good';
  else if (totalScore >= 50) label = 'medium';
  else label = 'low';

  return {
    score: totalScore,
    label,
    breakdown: {
      intent: intentScore,
      contact: contactScore,
      recency: recencyScore,
      pain: painScore,
    },
  };
}

export function getScoreLabelVietnamese(label: LeadScoreResult['label']): string {
  const map: Record<string, string> = {
    hot: '🔥 HOT',
    good: '⭐ Good',
    medium: '📊 Medium',
    low: '💤 Low',
  };
  return map[label] || label;
}
