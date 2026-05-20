import { HttpStatus } from '@nestjs/common';
import { BusinessException } from '../../../common/exceptions/business.exception';
import { ErrorCode } from '../../../common/constants/error-code';
import { OpenAiProvider } from './openai.provider';
import { AiProvider, AiGenerateRequest } from '../types';

// 模拟全局 fetch
global.fetch = jest.fn();

describe('OpenAiProvider', () => {
  let provider: OpenAiProvider;
  const config = {
    provider: AiProvider.OPENAI,
    apiKey: 'test-api-key',
    baseUrl: 'https://api.openai.com',
    defaultModel: 'gpt-4o-mini',
  };

  beforeEach(() => {
    provider = new OpenAiProvider(config);
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('应成功返回解析后的响应', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello' } }],
          model: 'gpt-4o-mini',
          usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const result = await provider.generate(request);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer test-api-key',
          },
        }),
      );
      expect(result).toEqual({
        content: 'Hello',
        model: 'gpt-4o-mini',
        usage: { promptTokens: 10, completionTokens: 5, totalTokens: 15 },
      });
    });

    it('当 API 返回错误时应抛出 BusinessException', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: { message: 'Invalid API key' },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      await expect(provider.generate(request)).rejects.toThrow(BusinessException);
      await expect(provider.generate(request)).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      } satisfies Partial<BusinessException>);
    });

    it('当网络请求失败时应抛出 BusinessException', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      await expect(provider.generate(request)).rejects.toThrow(BusinessException);
      await expect(provider.generate(request)).rejects.toThrow('模型请求网络错误');
    });

    it('当未指定 model 时应使用默认模型', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Hello' } }],
          model: 'gpt-4o-mini',
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: '',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      await provider.generate(request);

      const callBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(callBody.model).toBe('gpt-4o-mini');
    });
  });

  describe('generateStream', () => {
    it('应正确解析流式响应', async () => {
      const encoder = new TextEncoder();
      const streamData = [
        'data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n',
        'data: {"choices":[{"delta":{"content":" world"}}]}\n\n',
        'data: [DONE]\n\n',
      ];

      let index = 0;
      const mockReader = {
        read: jest.fn().mockImplementation(() => {
          if (index < streamData.length) {
            return Promise.resolve({
              done: false,
              value: encoder.encode(streamData[index++]),
            });
          }
          return Promise.resolve({ done: true });
        }),
        releaseLock: jest.fn(),
      };

      const mockResponse = {
        ok: true,
        body: {
          getReader: jest.fn().mockReturnValue(mockReader),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const chunks: any[] = [];
      for await (const chunk of provider.generateStream(request)) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual([
        { content: 'Hello', isFinished: false },
        { content: ' world', isFinished: false },
        { content: '', isFinished: true },
      ]);
    });

    it('当响应 body 为空时应抛出异常', async () => {
      const mockResponse = {
        ok: true,
        body: null,
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      await expect(async () => {
        for await (const _ of provider.generateStream(request)) {
          // noop
        }
      }).rejects.toThrow(BusinessException);
    });

    it('当 API 返回错误时应抛出异常', async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: { message: 'Rate limited' },
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      await expect(async () => {
        for await (const _ of provider.generateStream(request)) {
          // noop
        }
      }).rejects.toThrow(BusinessException);
    });

    it('应正确解析包含 usage 的流式块', async () => {
      const encoder = new TextEncoder();
      const streamData = [
        'data: {"choices":[{"delta":{"content":"Hi"}}],"usage":{"prompt_tokens":5,"completion_tokens":3,"total_tokens":8}}\n\n',
      ];

      let index = 0;
      const mockReader = {
        read: jest.fn().mockImplementation(() => {
          if (index < streamData.length) {
            return Promise.resolve({
              done: false,
              value: encoder.encode(streamData[index++]),
            });
          }
          return Promise.resolve({ done: true });
        }),
        releaseLock: jest.fn(),
      };

      const mockResponse = {
        ok: true,
        body: {
          getReader: jest.fn().mockReturnValue(mockReader),
        },
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const request: AiGenerateRequest = {
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hi' }],
      };

      const chunks: any[] = [];
      for await (const chunk of provider.generateStream(request)) {
        chunks.push(chunk);
      }

      expect(chunks[0].usage).toEqual({
        promptTokens: 5,
        completionTokens: 3,
        totalTokens: 8,
      });
    });
  });
});
