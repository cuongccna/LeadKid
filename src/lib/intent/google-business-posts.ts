import { IntentDetector, IntentSignal } from './detector';

/**
 * Detects recent activity signals from Google Business Profile.
 * For MVP, we infer from reviews count and rating freshness.
 * In production, this would call Google Business API for posts.
 */
export class GoogleBusinessPostsDetector implements IntentDetector {
  name = 'google_business_posts';

  async detect(): Promise<IntentSignal[]> {
    const signals: IntentSignal[] = [];

    // High review count with recent activity pattern = active business
    // We don't have actual post data in MVP, so we use proxy signals

    return signals; // Placeholder for future GB Posts API integration
  }
}

export function createGoogleBusinessPostsDetector(): GoogleBusinessPostsDetector {
  return new GoogleBusinessPostsDetector();
}
