export interface IntentSignal {
  type: string;
  label: string;
  confidence?: number; // 0-1
  source?: string;
  evidence?: string;
}

export interface IntentDetectionResult {
  signals: IntentSignal[];
  summary: string;
  score: number; // 0-40 intent score
}

export interface IntentDetector {
  name: string;
  detect(input: IntentDetectorInput): Promise<IntentSignal[]>;
}

export interface IntentDetectorInput {
  companyName: string;
  websiteUrl?: string;
  html?: string | null;
  facebookPageUrl?: string;
  placeId?: string;
  rating?: number;
  userRatingCount?: number;
}
