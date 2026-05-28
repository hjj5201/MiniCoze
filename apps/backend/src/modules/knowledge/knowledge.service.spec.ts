import { ErrorCode } from '../../common/constants/error-code';
import { BusinessException } from '../../common/exceptions/business.exception';
import { KnowledgeService } from './knowledge.service';

describe('KnowledgeService', () => {
  const service = new KnowledgeService();

  it('default 切分 txt：返回 chunks 与 meta', () => {
    const file = {
      originalName: 'demo.txt',
      buffer: Buffer.from('hello\n\nworld', 'utf8'),
    };
    const result = service.chunkDocument(file, '{"chunkType":"default"}');
    expect(result.meta.fileExtension).toBe('txt');
    expect(result.meta.chunkType).toBe('default');
    expect(result.meta.totalChunks).toBe(result.chunks.length);
    expect(result.chunks.length).toBeGreaterThan(0);
  });

  it('leveled 切分 md：调通', () => {
    const file = {
      originalName: 'guide.md',
      buffer: Buffer.from('# A\naa\n## B\nbb', 'utf8'),
    };
    const result = service.chunkDocument(
      file,
      '{"chunkType":"leveled","maxDepth":3,"saveTitle":true}',
    );
    expect(result.meta.fileExtension).toBe('md');
    expect(result.chunks.length).toBe(2);
  });

  it('扩展名为 pdf：抛 KnowledgeFileTypeUnsupported', () => {
    const file = {
      originalName: 'spec.pdf',
      buffer: Buffer.from('x', 'utf8'),
    };
    try {
      service.chunkDocument(file, '{"chunkType":"default"}');
      fail('should throw');
    } catch (e) {
      expect(e).toBeInstanceOf(BusinessException);
      expect((e as BusinessException).getErrorCode()).toBe(
        ErrorCode.KnowledgeFileTypeUnsupported,
      );
    }
  });

  it('文件无扩展名：抛 KnowledgeFileTypeUnsupported', () => {
    const file = { originalName: 'noext', buffer: Buffer.from('x', 'utf8') };
    expect(() =>
      service.chunkDocument(file, '{"chunkType":"default"}'),
    ).toThrow(BusinessException);
  });

  it('config 非法 JSON：抛 KnowledgeChunkConfigInvalid', () => {
    const file = {
      originalName: 'demo.txt',
      buffer: Buffer.from('hi', 'utf8'),
    };
    try {
      service.chunkDocument(file, 'not-json');
      fail('should throw');
    } catch (e) {
      expect((e as BusinessException).getErrorCode()).toBe(
        ErrorCode.KnowledgeChunkConfigInvalid,
      );
    }
  });

  it('custom 缺必填字段：抛 KnowledgeChunkConfigInvalid', () => {
    const file = {
      originalName: 'demo.txt',
      buffer: Buffer.from('hi', 'utf8'),
    };
    expect(() =>
      service.chunkDocument(file, '{"chunkType":"custom"}'),
    ).toThrow(BusinessException);
  });

  it('leveled 用于 txt：抛 KnowledgeChunkConfigInvalid', () => {
    const file = {
      originalName: 'demo.txt',
      buffer: Buffer.from('hi', 'utf8'),
    };
    try {
      service.chunkDocument(
        file,
        '{"chunkType":"leveled","maxDepth":3,"saveTitle":true}',
      );
      fail('should throw');
    } catch (e) {
      expect((e as BusinessException).getErrorCode()).toBe(
        ErrorCode.KnowledgeChunkConfigInvalid,
      );
    }
  });
});
