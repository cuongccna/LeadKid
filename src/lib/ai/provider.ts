export interface AIScriptParams {
  companyName: string;
  painSummary: string | null;
  serviceName: string;
  industry: string;
}

export interface AIProvider {
  generateScript(params: AIScriptParams): Promise<string>;
}

export default AIProvider;
