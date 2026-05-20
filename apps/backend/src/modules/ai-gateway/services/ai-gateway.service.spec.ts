import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { AiGatewayService } from '../services/ai-gateway.service';
import { AiGenerateRequest, AiGenerateResponse, AiStreamChunk } from '../types';

// 模拟 OpenAiProvider
jest.mock('../providers/openai.provider', () => {
  return {
    OpenAiProvider: jest.fn().mockImplementation(() => ({
      generate: jest.fn(),
      generateStream: jest.fn(),
    })),
  };
});

describe('AiGatewayService', () => {
  let configService: { get: jest.Mock };

  beforeEach(() => {
    configService = {
      get: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('初始化 provider', () => {
    it('当 AI_PROVIDER 未配置时应抛出异常', () => {
      configService.get.mockReturnValue(undefined);

      expect(() => new AiGatewayService(configService as any)).toThrow(
        BusinessException,
      );
      expect(() => new AiGatewayService(configService as any)).toThrow(
        expect.objectContaining({
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        } satisfies Partial<BusinessException>),
      );
    });

    it('当配置为 OPENAI 时应成功初始化', () => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          AI_PROVIDER: 'openai',
          OPENAI_API_KEY: 'test-api-key',
          OPENAI_BASE_URL: 'https://api.openai.com',
          OPENAI_MODEL: 'gpt-4o-mini',
        };
        return map[key];
      });

      expect(() => new AiGatewayService(configService as any)).not.toThrow();
    });

    it('当配置为 DEEPSEEK 时应成功初始化', () => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          AI_PROVIDER: 'deepseek',
          DEEPSEEK_API_KEY: 'test-api-key',
          DEEPSEEK_BASE_URL: 'https://api.deepseek.com',
          DEEPSEEK_MODEL: 'deepseek-chat',
        };
        return map[key];
      });

      expect(() => new AiGatewayService(configService as any)).not.toThrow();
    });

    it('当配置不支持的 provider 时应抛出异常', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_PROVIDER') return 'unsupported';
        return undefined;
      });

      expect(() => new AiGatewayService(configService as any)).toThrow(
        BusinessException,
      );
    });

    it('当 API Key 缺失时应抛出异常', () => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string | undefined> = {
          AI_PROVIDER: 'openai',
          OPENAI_API_KEY: undefined,
          OPENAI_BASE_URL: 'https://api.openai.com',
        };
        return map[key];
      });

      expect(() => new AiGatewayService(configService as any)).toThrow(
        BusinessException,
      );
    });
  });

  describe('generate', () => {
    it('应调用 provider.generate 并返回结果', async () => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          AI_PROVIDER: 'openai',
          OPENAI_API_KEY: 'test-api-key',
          OPENAI_BASE_URL: 'https://api.openai.com',
        };
        return map[key];
      });

      const serviceInstance = new AiGatewayService(configService as any);
      const mockResponse: AiGenerateResponse = {
        content: 'Hello',
        model: 'gpt-4o-mini',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      };

      // 获取 mock 的 provider 实例并设置返回值
      const provider = (serviceInstance as any).provider;
      provider.generate.mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const result = await serviceInstance.generate(request);

      expect(provider.generate).toHaveBeenCalledWith(request);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('generateStream', () => {
    it('应调用 provider.generateStream 并 yield 结果', async () => {
      configService.get.mockImplementation((key: string) => {
        const map: Record<string, string> = {
          AI_PROVIDER: 'openai',
          OPENAI_API_KEY: 'test-api-key',
          OPENAI_BASE_URL: 'https://api.openai.com',
        };
        return map[key];
      });

      const serviceInstance = new AiGatewayService(configService as any);
      const mockChunks: AiStreamChunk[] = [
        { content: 'Hello', isFinished: false },
        { content: ' world', isFinished: true },
      ];

      const provider = (serviceInstance as any).provider;
      provider.generateStream.mockImplementation(async function* () {
        for (const chunk of mockChunks) {
          yield chunk;
        }
      });

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const results: AiStreamChunk[] = [];
      for await (const chunk of serviceInstance.generateStream(request)) {
        results.push(chunk);
      }

      expect(results).toEqual(mockChunks);
    });
  });
});
