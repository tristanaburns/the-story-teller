import { Injectable } from '@nestjs/common';
import { MCPLoggerService } from '../../../../shared/logging';
import { LogClass, LogMethod } from '../../../../shared/logging/method-logger.decorator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memory } from '../schemas/memory.schema';

@Injectable()
@LogClass({ level: 'debug', logParameters: true, logResult: true })
export class MemoryRepository {
  constructor(
    @InjectModel(Memory.name) private memoryModel: Model<Memory>,
    private logger: MCPLoggerService,
  ) {
    this.logger.setContext('MemoryRepository');
  }

  async create(memoryData: Partial<Memory>): Promise<Memory> {
    const newMemory = new this.memoryModel(memoryData);
    return newMemory.save();
  }

  async findById(id: string, userId: string): Promise<Memory | null> {
    try {
      return this.memoryModel.findOne({ _id: id, userId }).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async findMany(filter: any, sort: any = { importance: -1, timestamp: -1 }): Promise<Memory[]> {
    return this.memoryModel.find(filter).sort(sort).exec();
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.memoryModel.deleteOne({ _id: id, userId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      if (error.name === 'CastError') {
        return false;
      }
      throw error;
    }
  }

  async count(filter: any): Promise<number> {
    return this.memoryModel.countDocuments(filter).exec();
  }

  async buildSearchFilter(params: {
    userId: string;
    storyId?: string;
    contextId?: string;
    query?: string;
    tags?: string[];
    timeframe?: { start?: string; end?: string };
    metadata?: Record<string, any>;
  }): Promise<any> {
    const { userId, storyId, contextId, query, tags, timeframe, metadata } = params;
    
    const filter: any = { userId };

    if (storyId) {
      filter['metadata.storyId'] = storyId;
    }

    if (contextId) {
      filter.contextId = contextId;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    if (timeframe) {
      filter.timestamp = {};
      
      if (timeframe.start) {
        filter.timestamp.$gte = new Date(timeframe.start).getTime();
      }
      
      if (timeframe.end) {
        filter.timestamp.$lte = new Date(timeframe.end).getTime();
      }
    }

    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        filter[`metadata.${key}`] = value;
      });
    }

    // Text search using regex (in a production environment, you'd use text indexes)
    if (query) {
      filter.content = { $regex: query, $options: 'i' };
    }

    return filter;
  }
}
