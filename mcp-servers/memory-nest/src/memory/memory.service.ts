import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { MemoryRepository } from './repositories/memory.repository';
import {
  StoreMemoryDto,
  RetrieveMemoryDto,
  SearchMemoriesDto,
  ConsolidateMemoriesDto,
  RankMemoriesDto,
  DeleteMemoryDto,
  BaseMCPResponseDto,
  HealthCheckResponseDto
} from './dto';
import { Memory } from './schemas/memory.schema';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MemoryService {
  constructor(
    private memoryRepository: MemoryRepository,
    private configService: ConfigService,
  ) {}

  async getHealth(): Promise<HealthCheckResponseDto> {
    // Get memory count for health status
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

  async storeMemory(dto: StoreMemoryDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { content, importance = 1, tags = [], storyId, contextId = 'default', metadata = {} } = payload;

    if (!content) {
      throw new BadRequestException('Missing required field: content');
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

  async retrieveMemory(dto: RetrieveMemoryDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { memoryId } = payload;

    if (!memoryId) {
      throw new BadRequestException('Missing required field: memoryId');
    }

    const memory = await this.memoryRepository.findById(memoryId, userId);

    if (!memory) {
      throw new NotFoundException(`Memory not found with ID: ${memoryId}`);
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

  async searchMemories(dto: SearchMemoriesDto): Promise<BaseMCPResponseDto> {
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

  async consolidateMemories(dto: ConsolidateMemoriesDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { memoryIds, query, storyId, contextId } = payload;

    let memoriesToConsolidate: Memory[] = [];

    if (memoryIds && memoryIds.length > 0) {
      const memories = await Promise.all(
        memoryIds.map(id => this.memoryRepository.findById(id, userId))
      );
      
      // Filter out null values (memories not found)
      memoriesToConsolidate = memories.filter(Boolean) as Memory[];
    } else {
      // Use search functionality instead
      const filter = await this.memoryRepository.buildSearchFilter({
        userId,
        storyId,
        contextId,
        query,
      });
      
      memoriesToConsolidate = await this.memoryRepository.findMany(filter);
    }

    if (memoriesToConsolidate.length === 0) {
      throw new NotFoundException('No memories found to consolidate');
    }

    // Simple consolidation (in a real implementation, would use more sophisticated NLP)
    const consolidatedContent = memoriesToConsolidate
      .sort((a, b) => b.importance - a.importance)
      .map(memory => memory.content)
      .join('\n\n');

    // Extract all unique tags
    const consolidatedTags = Array.from(
      new Set(memoriesToConsolidate.flatMap(memory => memory.tags))
    );

    // Use highest importance value
    const maxImportance = Math.max(
      ...memoriesToConsolidate.map(memory => memory.importance)
    );

    // Store the consolidated memory
    const consolidatedMemory = await this.memoryRepository.create({
      userId,
      content: consolidatedContent,
      importance: maxImportance,
      tags: consolidatedTags,
      metadata: {
        sourceMemoryCount: memoriesToConsolidate.length,
        sourceMemoryIds: memoriesToConsolidate.map(m => m._id.toString()),
        storyId: storyId || (memoriesToConsolidate[0].metadata?.storyId as string),
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

  async rankMemories(dto: RankMemoriesDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { memoryIds, query, storyId, contextId } = payload;

    let memoriesToRank: Memory[] = [];

    if (memoryIds && memoryIds.length > 0) {
      const memories = await Promise.all(
        memoryIds.map(id => this.memoryRepository.findById(id, userId))
      );
      
      // Filter out null values (memories not found)
      memoriesToRank = memories.filter(Boolean) as Memory[];
    } else {
      // Use search functionality instead
      const filter = await this.memoryRepository.buildSearchFilter({
        userId,
        storyId,
        contextId,
        query,
      });
      
      memoriesToRank = await this.memoryRepository.findMany(filter);
    }

    if (memoriesToRank.length === 0) {
      throw new NotFoundException('No memories found to rank');
    }

    // Sort memories by importance and timestamp
    const rankedMemories = [...memoriesToRank].sort((a, b) => {
      // First sort by importance (descending)
      if (b.importance !== a.importance) {
        return b.importance - a.importance;
      }
      // Then by recency (descending)
      return b.timestamp - a.timestamp;
    });

    // In a real implementation, you might update the importance values based on relevance
    // and other factors, then save those updates back to the database

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

  async deleteMemory(dto: DeleteMemoryDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { memoryId } = payload;

    if (!memoryId) {
      throw new BadRequestException('Missing required field: memoryId');
    }

    const deleted = await this.memoryRepository.delete(memoryId, userId);
    
    if (!deleted) {
      throw new NotFoundException(`Memory not found with ID: ${memoryId}`);
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

  private generateResponseId(): string {
    return 'res_' + Math.random().toString(36).substring(2, 15);
  }
}
