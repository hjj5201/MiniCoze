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
import { AiProviderInterface } from '../providers/ai-provider.interface';
import { OpenAiProvider } from '../providers/openai.provider';

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

  private createProvider(): AiProviderInterface {
    const provider = this.configService.get<string>('AI_PROVIDER');

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
          apiKey: this.configService.get<string>('OPENAI_API_KEY')!,
          baseUrl: this.configService.get<string>('OPENAI_BASE_URL')!,
          defaultModel:
            this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini',
        };
        break;

      case AiProvider.DEEPSEEK:
        config = {
          provider: AiProvider.DEEPSEEK,
          apiKey: this.configService.get<string>('DEEPSEEK_API_KEY')!,
          baseUrl: this.configService.get<string>('DEEPSEEK_BASE_URL')!,
          defaultModel:
            this.configService.get<string>('DEEPSEEK_MODEL') || 'deepseek-chat',
        };
        break;

      default:
        throw new BusinessException(
          `不支持的 AI 提供商: ${provider}`,
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

    // DeepSeek 兼容 OpenAI SDK
    return new OpenAiProvider(config);
  }
}
