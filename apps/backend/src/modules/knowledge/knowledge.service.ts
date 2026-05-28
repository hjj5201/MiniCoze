import { Injectable } from '@nestjs/common';
import { ErrorCode } from '../../common/constants/error-code';
import { BusinessException } from '../../common/exceptions/business.exception';
import { chunk } from './chunking/chunk';
import type { ChunkResult } from './chunking/types';
import { ChunkConfigDto } from './dto/chunk-config.dto';

// 与 controller 解耦：service 只接收 buffer + 文件名 + raw config 字符串。
export interface ChunkDocumentInput {
  originalName: string;
  buffer: Buffer;
}

@Injectable()
export class KnowledgeService {
  /**
   * 接收上传文件 buffer + multipart 中的 JSON 字符串 config，
   * 完成扩展名识别、配置校验、文本切分。
   */
  chunkDocument(file: ChunkDocumentInput, configRaw: unknown): ChunkResult {
    const ext = this.extractExtension(file.originalName);
    const config = ChunkConfigDto.fromJsonString(configRaw);
    const text = file.buffer.toString('utf8');
    return chunk(text, ext, config);
  }

  private extractExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    if (idx === -1 || idx === filename.length - 1) {
      throw new BusinessException(
        'file has no extension',
        ErrorCode.KnowledgeFileTypeUnsupported,
      );
    }
    return filename.slice(idx + 1).toLowerCase();
  }
}
