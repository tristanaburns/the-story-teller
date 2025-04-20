import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { MemoryService } from '../src/memory/memory.service';
import { MemoryRepository } from '../src/memory/repositories/memory.repository';
import { Memory } from '../src/memory/schemas/memory.schema';

describe('MemoryService', () => {
  let service: MemoryService;
  let repository: MemoryRepository;

  const mockMemoryModel = {
    findOne: jest.fn(),
    find: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    countDocuments: jest.fn().mockReturnThis(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => {
      if (key === 'API_KEY_REQUIRED') return 'false';
      if (key === 'API_KEY') return 'test-api-key';
      return defaultValue;
    }),
  };

  const mockMemoryRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    buildSearchFilter: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemoryService,
        {
          provide: MemoryRepository,
          useValue: mockMemoryRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MemoryService>(MemoryService);
    repository = module.get<MemoryRepository>(MemoryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      mockMemoryRepository.count.mockResolvedValue(42);
      
      const result = await service.getHealth();
      
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('serverId', 'memory-mcp');
      expect(result).toHaveProperty('version', '1.0.0');
      expect(result).toHaveProperty('memoryCount', 42);
      expect(result).toHaveProperty('mongodbConnected', true);
      expect(result).toHaveProperty('uptime');
      expect(result).toHaveProperty('timestamp');
    });
  });

  describe('storeMemory', () => {
    it('should store and return a memory', async () => {
      const mockMemory = {
        _id: 'test-id',
        userId: 'user-123',
        content: 'Test memory content',
        importance: 5,
        tags: ['test', 'memory'],
        metadata: { storyId: 'story-123' },
        contextId: 'context-123',
        timestamp: Date.now(),
      };

      mockMemoryRepository.create.mockResolvedValue(mockMemory);

      const result = await service.storeMemory({
        serverId: 'memory-mcp',
        action: 'store',
        userId: 'user-123',
        requestId: 'req-123',
        timestamp: Date.now(),
        payload: {
          content: 'Test memory content',
          importance: 5,
          tags: ['test', 'memory'],
          storyId: 'story-123',
          contextId: 'context-123',
        },
      });

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('action', 'store');
      expect(result.payload).toHaveProperty('memoryId', 'test-id');
      expect(result.payload).toHaveProperty('content', 'Test memory content');
      expect(mockMemoryRepository.create).toHaveBeenCalledTimes(1);
    });
  });

  // Add more test cases for other methods

});
