import { IntentDetectionResult, IntentDetectorInput } from './detector';
import { createHiringDetector } from './hiring-detector';
import { createFacebookAdsDetector } from './facebook-ads-detector';
import { createGoogleBusinessPostsDetector } from './google-business-posts';
import { createReputationDetector } from './reputation-detector';
import { calculateLeadScore, LeadScoreInput } from './scoring';

const detectors = [
  createHiringDetector(),
  createFacebookAdsDetector(),
  createGoogleBusinessPostsDetector(),
  createReputationDetector(),
];

export async function detectIntent(
  input: IntentDetectorInput
): Promise<IntentDetectionResult> {
  const allSignals: IntentDetectionResult['signals'] = [];

  for (const detector of detectors) {
    try {
      const signals = await detector.detect(input);
      allSignals.push(...signals);
    } catch {
      // Ignore individual detector failures
    }
  }

  // Generate summary
  let summary = '';
  if (allSignals.length > 0) {
    const topSignals = allSignals
      .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
      .slice(0, 2);
    summary = topSignals.map((s) => s.label).join('. ');
  }

  // Calculate intent score (0-40)
  let score = 0;
  const types = new Set(allSignals.map((s) => s.type));
  if (types.has('running_facebook_ads')) score += 15;
  if (types.has('recently_hiring')) score += 15;
  if (types.has('has_facebook_page')) score += 5;
  if (types.has('recent_google_posts')) score += 10;
  if (types.has('high_ad_spend')) score += 10;
  if (types.has('strong_reputation')) score += 8;
  if (types.has('high_engagement')) score += 5;

  return {
    signals: allSignals,
    summary,
    score: Math.min(score, 40),
  };
}

export { calculateLeadScore, type LeadScoreInput, type IntentDetectionResult };
export { getScoreLabelVietnamese } from './scoring';
