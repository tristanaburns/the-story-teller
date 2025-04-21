"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemoryService = void 0;
const common_1 = require("@nestjs/common");
const memory_repository_1 = require("./repositories/memory.repository");
const config_1 = require("@nestjs/config");
let MemoryService = class MemoryService {
    constructor(memoryRepository, configService) {
        this.memoryRepository = memoryRepository;
        this.configService = configService;
    }
    async getHealth() {
        const memoryCount = await this.memoryRepository.count({});
        return {
            status: 'ok',
            serverId: 'memory-mcp',
            version: '1.0.0',
            timestamp: Date.now(),
            mongodbConnected: true,
            memoryCount,
            uptime: Math.floor(process.uptime()),
        };
    }
    async storeMemory(dto) {
        const { userId, payload, requestId } = dto;
        const { content, importance = 1, tags = [], storyId, contextId = 'default', metadata = {} } = payload;
        if (!content) {
            throw new common_1.BadRequestException('Missing required field: content');
        }
        const memory = await this.memoryRepository.create({
            userId,
            content,
            importance,
            tags,
            metadata: {
                ...metadata,
                storyId,
            },
            timestamp: Date.now(),
            contextId,
        });
        return {
            serverId: 'memory-mcp',
            action: 'store',
            status: 'success',
            payload: {
                memoryId: memory._id.toString(),
                content: memory.content,
                importance: memory.importance,
                tags: memory.tags,
                metadata: memory.metadata,
                contextId: memory.contextId,
            },
            requestId,
            responseId: this.generateResponseId(),
            timestamp: Date.now(),
        };
    }
    async retrieveMemory(dto) {
        const { userId, payload, requestId } = dto;
        const { memoryId } = payload;
        if (!memoryId) {
            throw new common_1.BadRequestException('Missing required field: memoryId');
        }
        const memory = await this.memoryRepository.findById(memoryId, userId);
        if (!memory) {
            throw new common_1.NotFoundException(`Memory not found with ID: ${memoryId}`);
        }
        return {
            serverId: 'memory-mcp',
            action: 'retrieve',
            status: 'success',
            payload: {
                memoryId: memory._id.toString(),
                content: memory.content,
                importance: memory.importance,
                tags: memory.tags,
                metadata: memory.metadata,
                contextId: memory.contextId,
            },
            requestId,
            responseId: this.generateResponseId(),
            timestamp: Date.now(),
        };
    }
    async searchMemories(dto) {
        const { userId, payload, requestId } = dto;
        const { query, tags, timeframe, storyId, contextId, metadata } = payload;
        const filter = await this.memoryRepository.buildSearchFilter({
            userId,
            storyId,
            contextId,
            query,
            tags,
            timeframe,
            metadata,
        });
        const memories = await this.memoryRepository.findMany(filter);
        return {
            serverId: 'memory-mcp',
            action: 'search',
            status: 'success',
            payload: {
                memories: memories.map(memory => ({
                    id: memory._id.toString(),
                    content: memory.content,
                    importance: memory.importance,
                    tags: memory.tags,
                    metadata: memory.metadata,
                    timestamp: memory.timestamp,
                    contextId: memory.contextId,
                })),
            },
            requestId,
            responseId: this.generateResponseId(),
            timestamp: Date.now(),
        };
    }
    async consolidateMemories(dto) {
        const { userId, payload, requestId } = dto;
        const { memoryIds, query, storyId, contextId } = payload;
        let memoriesToConsolidate = [];
        if (memoryIds && memoryIds.length > 0) {
            const memories = await Promise.all(memoryIds.map(id => this.memoryRepository.findById(id, userId)));
            memoriesToConsolidate = memories.filter(Boolean);
        }
        else {
            const filter = await this.memoryRepository.buildSearchFilter({
                userId,
                storyId,
                contextId,
                query,
            });
            memoriesToConsolidate = await this.memoryRepository.findMany(filter);
        }
        if (memoriesToConsolidate.length === 0) {
            throw new common_1.NotFoundException('No memories found to consolidate');
        }
        const consolidatedContent = memoriesToConsolidate
            .sort((a, b) => b.importance - a.importance)
            .map(memory => memory.content)
            .join('\n\n');
        const consolidatedTags = Array.from(new Set(memoriesToConsolidate.flatMap(memory => memory.tags)));
        const maxImportance = Math.max(...memoriesToConsolidate.map(memory => memory.importance));
        const consolidatedMemory = await this.memoryRepository.create({
            userId,
            content: consolidatedContent,
            importance: maxImportance,
            tags: consolidatedTags,
            metadata: {
                sourceMemoryCount: memoriesToConsolidate.length,
                sourceMemoryIds: memoriesToConsolidate.map(m => m._id.toString()),
                storyId: storyId || memoriesToConsolidate[0].metadata?.storyId,
                consolidated: true,
            },
            timestamp: Date.now(),
            contextId: contextId || memoriesToConsolidate[0].contextId,
        });
        return {
            serverId: 'memory-mcp',
            action: 'consolidate',
            status: 'success',
            payload: {
                memoryId: consolidatedMemory._id.toString(),
                content: consolidatedContent,
                tags: consolidatedTags,
                importance: maxImportance,
                metadata: consolidatedMemory.metadata,
                contextId: consolidatedMemory.contextId,
            },
            requestId,
            responseId: this.generateResponseId(),
            timestamp: Date.now(),
        };
    }
    async rankMemories(dto) {
        const { userId, payload, requestId } = dto;
        const { memoryIds, query, storyId, contextId } = payload;
        let memoriesToRank = [];
        if (memoryIds && memoryIds.length > 0) {
            const memories = await Promise.all(memoryIds.map(id => this.memoryRepository.findById(id, userId)));
            memoriesToRank = memories.filter(Boolean);
        }
        else {
            const filter = await this.memoryRepository.buildSearchFilter({
                userId,
                storyId,
                contextId,
                query,
            });
            memoriesToRank = await this.memoryRepository.findMany(filter);
        }
        if (memoriesToRank.length === 0) {
            throw new common_1.NotFoundException('No memories found to rank');
        }
        const rankedMemories = [...memoriesToRank].sort((a, b) => {
            if (b.importance !== a.importance) {
                return b.importance - a.importance;
            }
            return b.timestamp - a.timestamp;
        });
        return {
            serverId: 'memory-mcp',
            action: 'rank',
            status: 'success',
            payload: {
                memories: rankedMemories.map(memory => ({
                    id: memory._id.toString(),
                    content: memory.content,
                    importance: memory.importance,
                    tags: memory.tags,
                    metadata: memory.metadata,
                    timestamp: memory.timestamp,
                    contextId: memory.contextId,
                })),
            },
            requestId,
            responseId: this.generateResponseId(),
            timestamp: Date.now(),
        };
    }
    async deleteMemory(dto) {
        const { userId, payload, requestId } = dto;
        const { memoryId } = payload;
        if (!memoryId) {
            throw new common_1.BadRequestException('Missing required field: memoryId');
        }
        const deleted = await this.memoryRepository.delete(memoryId, userId);
        if (!deleted) {
            throw new common_1.NotFoundException(`Memory not found with ID: ${memoryId}`);
        }
        return {
            serverId: 'memory-mcp',
            action: 'delete',
            status: 'success',
            payload: {
                memoryId,
            },
            requestId,
            responseId: this.generateResponseId(),
            timestamp: Date.now(),
        };
    }
    generateResponseId() {
        return 'res_' + Math.random().toString(36).substring(2, 15);
    }
};
exports.MemoryService = MemoryService;
exports.MemoryService = MemoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [memory_repository_1.MemoryRepository,
        config_1.ConfigService])
], MemoryService);
//# sourceMappingURL=memory.service.js.map