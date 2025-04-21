"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const memory_service_1 = require("../src/memory/memory.service");
const memory_repository_1 = require("../src/memory/repositories/memory.repository");
describe('MemoryService', () => {
    let service;
    let repository;
    const mockMemoryModel = {
        findOne: jest.fn(),
        find: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn(),
        countDocuments: jest.fn().mockReturnThis(),
    };
    const mockConfigService = {
        get: jest.fn((key, defaultValue) => {
            if (key === 'API_KEY_REQUIRED')
                return 'false';
            if (key === 'API_KEY')
                return 'test-api-key';
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
        const module = await testing_1.Test.createTestingModule({
            providers: [
                memory_service_1.MemoryService,
                {
                    provide: memory_repository_1.MemoryRepository,
                    useValue: mockMemoryRepository,
                },
                {
                    provide: config_1.ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();
        service = module.get(memory_service_1.MemoryService);
        repository = module.get(memory_repository_1.MemoryRepository);
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
});
//# sourceMappingURL=memory.service.spec.js.map