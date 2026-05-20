import { Injectable } from '@nestjs/common';
import { OpenAiProvider } from './openai.provider';
import type { AiProviderConfig } from '../types';

/**
 * DeepSeek Provider
 *
 * DeepSeek API 兼容 OpenAI 格式，因此直接继承 OpenAiProvider。
 * 未来如需处理 DeepSeek 特有逻辑（如特殊响应字段、不同错误格式等），
 * 可在此类中重写对应方法。
 */
@Injectable()
export class DeepSeekProvider extends OpenAiProvider {
  constructor(config: AiProviderConfig) {
    super(config);
  }
}
