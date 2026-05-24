import type { ChatMessage, ToolDefinition } from '../../../shared/types/agent';

export interface AiGenerateRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
}
