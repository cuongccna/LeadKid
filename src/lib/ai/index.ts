import { GeminiProvider } from './gemini-provider';
import { MockAIProvider } from './mock-ai-provider';
import type { AIProvider } from './provider';

export function getAIProvider(isPro: boolean): AIProvider {
  const apiKey = process.env.GEMINI_API_KEY;
  if (isPro && apiKey && apiKey !== 'your_gemini_api_key') {
    return new GeminiProvider(apiKey);
  }
  return new MockAIProvider();
}

export type { AIProvider };
