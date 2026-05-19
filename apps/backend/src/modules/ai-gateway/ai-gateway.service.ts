import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  ChatMessage,
  ToolDefinition,
  ToolCall,
} from '../../shared/types/agent';

export interface ChatStreamInput {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  maxTokens?: number;
  tools?: ToolDefinition[];
}

export interface ChatStreamChunk {
  content?: string;
  toolCalls?: ToolCall[];
  finishReason?: string;
}

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);
  private readonly apiBase: string;
  private readonly apiKey: string;

  constructor(configService: ConfigService) {
    this.apiBase = configService.get<string>('ai.apiBase') ?? '';
    this.apiKey = configService.get<string>('ai.apiKey') ?? '';
    if (this.apiBase && this.apiKey) {
      this.logger.log(`AI Gateway ready: ${this.apiBase}`);
    } else {
      this.logger.warn('AI Gateway not configured');
    }
  }

  async *chatStream(_: ChatStreamInput): AsyncGenerator<ChatStreamChunk> {}

  private buildBody() {}

  private fetch() {}
}
