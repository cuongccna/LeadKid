export interface AIScriptParams {
  companyName: string;
  painSummary: string | null;
  serviceName: string;
  industry: string;
  reviewInsight?: string | null;
  rating?: number | null;
  userRatingCount?: number | null;
}

export interface AIProvider {
  generateScript(params: AIScriptParams): Promise<string>;
}

export default AIProvider;
