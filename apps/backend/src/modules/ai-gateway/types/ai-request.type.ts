import { AiMessage } from './ai-message.type';

export interface AiGenerateRequest {
  model: string;
  messages: AiMessage[];
  temperature?: number;
  maxTokens?: number;
}
