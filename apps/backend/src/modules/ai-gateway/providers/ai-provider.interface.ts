import { AiGenerateRequest, AiGenerateResponse, AiStreamChunk } from '../types';

export interface AiProviderInterface {
  generate(request: AiGenerateRequest): Promise<AiGenerateResponse>;
  generateStream(
    request: AiGenerateRequest,
  ): AsyncGenerator<AiStreamChunk, void, unknown>;
}
