export interface AiUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AiGenerateResponse {
  content: string;
  model: string;
  usage?: AiUsage;
}

export interface AiStreamChunk {
  content: string;
  isFinished: boolean;
  usage?: AiUsage;
}
