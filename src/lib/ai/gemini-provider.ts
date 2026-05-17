import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider, AIScriptParams } from './provider';
import { buildPrompt } from './prompts';

export class GeminiProvider implements AIProvider {
  private model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  }

  async generateScript(params: AIScriptParams): Promise<string> {
    const prompt = buildPrompt(params);

    try {
      const result = await this.model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7,
        },
      });

      const response = await result.response;
      let text = response.text().trim();

      // Remove quotes if present
      text = text.replace(/^["']|["']$/g, '');

      // Validate length
      if (text.length > 120) {
        // Retry once with stricter prompt
        const retryResult = await this.model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: `${prompt}\n\nLẦN TRƯỚC VIẾT QUÁ DÀI. LẦN NÀY CHỈ ĐƯỢC TỐI ĐA 120 KÝ TỰ. ĐẾM KỸ.` }]
          }],
          generationConfig: {
            maxOutputTokens: 100,
            temperature: 0.5,
          },
        });
        const retryResponse = await retryResult.response;
        text = retryResponse.text().trim().replace(/^["']|["']$/g, '');
      }

      return text.slice(0, 120);
    } catch (error) {
      console.error('Gemini error:', error);
      throw new Error('Failed to generate script');
    }
  }
}
