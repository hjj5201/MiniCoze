export enum AiProvider {
  OPENAI = 'openai',
  DEEPSEEK = 'deepseek',
}

export interface AiProviderConfig {
  provider: AiProvider;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
}
