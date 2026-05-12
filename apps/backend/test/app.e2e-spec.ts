import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { setupApp } from './../src/setup-app';

interface HealthResponseBody {
  code: number;
  message: string;
  data: {
    status: string;
    service: string;
    timestamp: string;
  };
}

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    setupApp(app);
    await app.init();
  });

  it('/api/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect(({ body }: { body: HealthResponseBody }) => {
        expect(body).toMatchObject({
          code: 0,
          message: 'success',
          data: {
            status: 'ok',
            service: 'MiniCoze Backend',
          },
        });
        expect(typeof body.data.timestamp).toBe('string');
        expect(body.data.timestamp.endsWith('+08:00')).toBe(true);
      });
  });

  it('/api/auth/profile (GET) should require token', () => {
    return request(app.getHttpServer())
      .get('/api/auth/profile')
      .expect(401)
      .expect({
        code: 40100,
        message: 'Unauthorized',
        data: null,
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
