import { IntentDetector, IntentSignal, IntentDetectorInput } from './detector';

export class ReputationDetector implements IntentDetector {
  name = 'reputation';

  async detect(input: IntentDetectorInput): Promise<IntentSignal[]> {
    const signals: IntentSignal[] = [];

    if (input.rating === undefined || input.userRatingCount === undefined) {
      return signals;
    }

    const rating = input.rating;
    const count = input.userRatingCount;

    // Strong reputation signal
    if (rating >= 4.5 && count >= 50) {
      signals.push({
        type: 'strong_reputation',
        label: `⭐ Uy tín cao (${rating}★, ${count} đánh giá)`,
        confidence: Math.min(0.6 + count / 1000, 0.95),
        source: 'google_maps_reviews',
        evidence: `Rating ${rating} với ${count} đánh giá`,
      });
    } else if (rating >= 4.0 && count >= 100) {
      signals.push({
        type: 'strong_reputation',
        label: `⭐ Uy tín tốt (${rating}★, ${count} đánh giá)`,
        confidence: 0.7,
        source: 'google_maps_reviews',
        evidence: `Rating ${rating} với ${count} đánh giá`,
      });
    }

    // High engagement signal
    if (count >= 200) {
      signals.push({
        type: 'high_engagement',
        label: `💬 Nhiều tương tác (${count} đánh giá)`,
        confidence: 0.8,
        source: 'google_maps_reviews',
        evidence: `${count} đánh giá trên Google Maps`,
      });
    }

    return signals;
  }
}

export function createReputationDetector(): ReputationDetector {
  return new ReputationDetector();
}
