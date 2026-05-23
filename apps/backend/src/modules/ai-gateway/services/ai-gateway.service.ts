import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ErrorCode } from '../../../common/constants/error-code';
import {
  AiGenerateRequest,
  AiGenerateResponse,
  AiStreamChunk,
  AiProvider,
  AiProviderConfig,
} from '../types';
import type {
  ChatMessage,
  ToolCall,
  ToolDefinition,
} from '../../../shared/types/agent';
import { AiProviderInterface } from '../providers/ai-provider.interface';
import { OpenAiProvider } from '../providers/openai.provider';
import { DeepSeekProvider } from '../providers/deepseek.provider';

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
  private readonly provider: AiProviderInterface;

  constructor(private readonly configService: ConfigService) {
    this.provider = this.createProvider();
  }

  async generate(request: AiGenerateRequest): Promise<AiGenerateResponse> {
    return this.provider.generate(request);
  }

  async *generateStream(
    request: AiGenerateRequest,
  ): AsyncGenerator<AiStreamChunk, void, unknown> {
    yield* this.provider.generateStream(request);
  }

  async *chatStream(
    input: ChatStreamInput,
  ): AsyncGenerator<ChatStreamChunk, void, unknown> {
    for await (const chunk of this.generateStream({
      model: input.model,
      messages: this.toAiMessages(input.messages),
      temperature: input.temperature,
      maxTokens: input.maxTokens,
    })) {
      if (chunk.content) {
        yield { content: chunk.content };
      }

      if (chunk.isFinished) {
        yield { finishReason: 'stop' };
      }
    }
  }

  private createProvider(): AiProviderInterface {
    const provider = this.configService.get<AiProvider>('ai.provider');

    if (!provider) {
      throw new BusinessException(
        'AI_PROVIDER 未配置',
        ErrorCode.AiConfigError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    let config: AiProviderConfig;

    switch (provider) {
      case AiProvider.OPENAI:
        config = {
          provider: AiProvider.OPENAI,
          apiKey: this.configService.get<string>('ai.openai.apiKey')!,
          baseUrl: this.configService.get<string>('ai.openai.baseUrl')!,
          defaultModel:
            this.configService.get<string>('ai.openai.model') || 'gpt-4o-mini',
        };
        break;

      case AiProvider.DEEPSEEK:
        config = {
          provider: AiProvider.DEEPSEEK,
          apiKey: this.configService.get<string>('ai.deepseek.apiKey')!,
          baseUrl: this.configService.get<string>('ai.deepseek.baseUrl')!,
          defaultModel:
            this.configService.get<string>('ai.deepseek.model') ||
            'deepseek-chat',
        };
        break;

      default:
        throw new BusinessException(
          `不支持的 AI 提供商: ${provider as string}`,
          ErrorCode.AiConfigError,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }

    // 统一校验
    if (!config.apiKey || !config.baseUrl) {
      throw new BusinessException(
        `${provider} AI 配置缺失`,
        ErrorCode.AiConfigError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    switch (provider) {
      case AiProvider.OPENAI:
        return new OpenAiProvider(config);
      case AiProvider.DEEPSEEK:
        return new DeepSeekProvider(config);
      default:
        return new OpenAiProvider(config);
    }
  }

  private toAiMessages(messages: ChatMessage[]) {
    return messages
      .filter((message) => message.role !== 'tool')
      .map((message) => ({
        role: message.role as 'system' | 'user' | 'assistant',
        content: message.content ?? '',
      }));
  }
}
