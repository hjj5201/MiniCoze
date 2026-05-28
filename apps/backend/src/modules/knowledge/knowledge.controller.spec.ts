import { HttpStatus, INestApplication } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { HttpExceptionFilter } from '../../common/filters/http-exception.filter';
import { ResponseInterceptor } from '../../common/interceptors/response.interceptor';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

describe('KnowledgeController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [KnowledgeController],
      providers: [KnowledgeService],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new ResponseInterceptor(new Reflector()));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /knowledge/chunk default + txt → 200 + 结构化 chunks', async () => {
    const res = await request(app.getHttpServer())
      .post('/knowledge/chunk')
      .field('config', JSON.stringify({ chunkType: 'default' }))
      .attach('file', Buffer.from('段落一\n\n段落二', 'utf8'), 'demo.txt');

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.code).toBe(0);
    expect(res.body.data.meta.chunkType).toBe('default');
    expect(res.body.data.meta.fileExtension).toBe('txt');
    expect(Array.isArray(res.body.data.chunks)).toBe(true);
    expect(res.body.data.chunks.length).toBeGreaterThan(0);
  });

  it('POST /knowledge/chunk leveled + md → 含祖先标题', async () => {
    const md = '# A\naa\n## B\nbb';
    const res = await request(app.getHttpServer())
      .post('/knowledge/chunk')
      .field(
        'config',
        JSON.stringify({
          chunkType: 'leveled',
          maxDepth: 3,
          saveTitle: true,
        }),
      )
      .attach('file', Buffer.from(md, 'utf8'), 'guide.md');

    expect(res.status).toBe(HttpStatus.CREATED);
    expect(res.body.data.chunks).toHaveLength(2);
    expect(res.body.data.chunks[1].content).toContain('# A');
    expect(res.body.data.chunks[1].content).toContain('## B');
  });

  it('POST /knowledge/chunk 缺 file → 40000', async () => {
    const res = await request(app.getHttpServer())
      .post('/knowledge/chunk')
      .field('config', '{"chunkType":"default"}');

    expect(res.body.code).toBe(40000);
  });

  it('POST /knowledge/chunk 不支持的扩展名 → 60102', async () => {
    const res = await request(app.getHttpServer())
      .post('/knowledge/chunk')
      .field('config', '{"chunkType":"default"}')
      .attach('file', Buffer.from('x', 'utf8'), 'spec.pdf');

    expect(res.body.code).toBe(60102);
  });

  it('POST /knowledge/chunk leveled 用于 txt → 60101', async () => {
    const res = await request(app.getHttpServer())
      .post('/knowledge/chunk')
      .field(
        'config',
        JSON.stringify({
          chunkType: 'leveled',
          maxDepth: 3,
          saveTitle: true,
        }),
      )
      .attach('file', Buffer.from('hi', 'utf8'), 'demo.txt');

    expect(res.body.code).toBe(60101);
  });

  it('POST /knowledge/chunk overlap >= chunkSize → 60101', async () => {
    const res = await request(app.getHttpServer())
      .post('/knowledge/chunk')
      .field(
        'config',
        JSON.stringify({
          chunkType: 'custom',
          chunkSize: 10,
          overlap: 100,
        }),
      )
      .attach('file', Buffer.from('hello', 'utf8'), 'demo.txt');

    // overlap(100) > Max(99) -> DTO 校验 60101，或在切分核心同样 60101
    expect(res.body.code).toBe(60101);
  });
});
