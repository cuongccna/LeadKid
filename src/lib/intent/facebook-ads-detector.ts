import { IntentDetector, IntentSignal, IntentDetectorInput } from './detector';

/**
 * Simplified Facebook Ads detector.
 * In production, this would call Facebook Ad Library API or scrape page transparency.
 * For MVP, we detect signals from website/Facebook page links.
 */
export class FacebookAdsDetector implements IntentDetector {
  name = 'facebook_ads';

  async detect(input: IntentDetectorInput): Promise<IntentSignal[]> {
    const signals: IntentSignal[] = [];

    // Detect from URL even without HTML
    if (!input.html && input.websiteUrl?.includes('facebook.com')) {
      signals.push({
        type: 'has_facebook_page',
        label: '📘 Có Fanpage Facebook',
        confidence: 0.9,
        source: 'website_url',
        evidence: `URL: ${input.websiteUrl}`,
      });
      return signals;
    }

    if (!input.html) return signals;

    const htmlLower = input.html.toLowerCase();

    // Detect Facebook Pixel / Meta tracking → strong signal they run ads
    const adSignals = [
      'facebook.com/tr', // Facebook Pixel
      'connect.facebook.net',
      'fbq(',
      'meta pixel',
      'facebook pixel',
    ];

    const foundSignals = adSignals.filter((s) => htmlLower.includes(s.toLowerCase()));

    if (foundSignals.length > 0) {
      signals.push({
        type: 'running_facebook_ads',
        label: '🔥 Đang chạy Facebook Ads',
        confidence: 0.75,
        source: 'website_tracking',
        evidence: 'Website cài Facebook Pixel / Meta tracking',
      });
    }

    // Detect Facebook page links
    const fbPageMatch = input.html.match(
      /facebook\.com\/(?:pages\/)?([^\/"\s]+)/i
    );
    if (fbPageMatch) {
      signals.push({
        type: 'has_facebook_page',
        label: '📘 Có Fanpage Facebook',
        confidence: 0.9,
        source: 'website_links',
        evidence: `Fanpage: ${fbPageMatch[1]}`,
      });
    }

    return signals;
  }
}

export function createFacebookAdsDetector(): FacebookAdsDetector {
  return new FacebookAdsDetector();
}
