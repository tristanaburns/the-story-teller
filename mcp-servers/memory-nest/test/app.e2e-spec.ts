import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { getModelToken } from '@nestjs/mongoose';
import { Memory } from '../src/memory/schemas/memory.schema';

describe('MemoryController (e2e)', () => {
  let app: INestApplication;
  
  // Mock memory model
  const mockMemoryModel = {
    findOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    countDocuments: jest.fn().mockReturnThis(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getModelToken(Memory.name))
      .useValue(mockMemoryModel)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Set up global filters and pipes just like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    
    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new HttpExceptionFilter(),
    );
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('serverId', 'memory-mcp');
      });
  });

  // Add more e2e tests for other endpoints
});
