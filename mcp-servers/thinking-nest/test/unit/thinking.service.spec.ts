import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ThinkingService } from '../../src/thinking/thinking.service';
import { ThinkingRepository } from '../../src/thinking/repositories/thinking.repository';
import { ThinkingType } from '../../src/thinking/dto/analyze-problem.dto';
import { ThinkingStatus } from '../../src/thinking/dto/search-thinking-processes.dto';

describe('ThinkingService', () => {
  let service: ThinkingService;
  let repository: ThinkingRepository;

  // Mock repository methods
  const mockThinkingRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    addStep: jest.fn(),
    updateStep: jest.fn(),
    completeProcess: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    buildSearchFilter: jest.fn(),
  };

  // Mock config service
  const mockConfigService = {
    get: jest.fn().mockImplementation((key, defaultValue) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThinkingService,
        {
          provide: ThinkingRepository,
          useValue: mockThinkingRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ThinkingService>(ThinkingService);
    repository = module.get<ThinkingRepository>(ThinkingRepository);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return server health status', async () => {
      mockThinkingRepository.count.mockResolvedValue(42);
      
      const result = await service.getHealth();
      
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('serverId', 'thinking-mcp');
      expect(result).toHaveProperty('mongodbConnected', true);
      expect(result).toHaveProperty('processCount', 42);
      expect(mockThinkingRepository.count).toHaveBeenCalledWith({});
    });
  });

  describe('analyzeProblem', () => {
    it('should create a new thinking process', async () => {
      const mockDto = {
        serverId: 'thinking-mcp',
        action: 'analyze',
        userId: 'user123',
        requestId: 'req_abc123',
        timestamp: 1234567890,
        payload: {
          title: 'Test thinking process',
          description: 'Test description',
          thinkingType: ThinkingType.CHARACTER,
          tags: ['test'],
          storyId: 'story123',
          contextId: 'context123',
          metadata: { test: 'data' },
        },
      };

      const mockCreatedProcess = {
        _id: 'process123',
        userId: 'user123',
        title: 'Test thinking process',
        description: 'Test description',
        thinkingType: ThinkingType.CHARACTER,
        tags: ['test'],
        storyId: 'story123',
        contextId: 'context123',
        metadata: { test: 'data' },
        steps: [],
        conclusions: [],
        status: ThinkingStatus.IN_PROGRESS,
        timestamp: 1234567890,
      };

      mockThinkingRepository.create.mockResolvedValue(mockCreatedProcess);

      const result = await service.analyzeProblem(mockDto);

      expect(result).toHaveProperty('status', 'success');
      expect(result).toHaveProperty('payload.processId', 'process123');
      expect(mockThinkingRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user123',
        title: 'Test thinking process',
        description: 'Test description',
        thinkingType: ThinkingType.CHARACTER,
      }));
    });

    it('should throw an error if title or description is missing', async () => {
      const mockDto = {
        serverId: 'thinking-mcp',
        action: 'analyze',
        userId: 'user123',
        requestId: 'req_abc123',
        timestamp: 1234567890,
        payload: {
          thinkingType: ThinkingType.CHARACTER,
        },
      };

      await expect(service.analyzeProblem(mockDto)).rejects.toThrow('Missing required fields');
    });
  });

  // Add more test cases for other methods

});
