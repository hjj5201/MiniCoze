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

// OpenAI API 响应类型定义
export interface OpenAiApiError {
  message: string;
  type?: string;
  code?: string;
}

export interface OpenAiApiErrorResponse {
  error: OpenAiApiError;
}

export interface OpenAiApiUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAiApiMessage {
  role: string;
  content: string;
}

export interface OpenAiApiChoice {
  index: number;
  message: OpenAiApiMessage;
  finish_reason: string | null;
}

export interface OpenAiApiCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAiApiChoice[];
  usage?: OpenAiApiUsage;
}

export interface OpenAiApiDelta {
  role?: string;
  content?: string;
}

export interface OpenAiApiStreamChoice {
  index: number;
  delta: OpenAiApiDelta;
  finish_reason: string | null;
}

export interface OpenAiApiStreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAiApiStreamChoice[];
  usage?: OpenAiApiUsage;
}
