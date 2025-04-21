/**
 * Repository for thinking process operations in Sequential Thinking MCP Server.
 * This repository handles database operations for thinking processes.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThinkingProcess } from '../schemas/thinking.schema';

@Injectable()
export class ThinkingRepository {
  private readonly logger = new Logger(ThinkingRepository.name);

  constructor(
    @InjectModel(ThinkingProcess.name) private thinkingModel: Model<ThinkingProcess>
  ) {}

  /**
   * Create a new thinking process
   * @param data The thinking process data
   * @returns The created thinking process
   */
  async create(data: Partial<ThinkingProcess>): Promise<ThinkingProcess> {
    const thinking = new this.thinkingModel(data);
    return thinking.save();
  }

  /**
   * Find a thinking process by ID
   * @param processId The process ID to find
   * @returns The thinking process if found, null otherwise
   */
  async findById(processId: string): Promise<ThinkingProcess | null> {
    return this.thinkingModel.findOne({ processId }).exec();
  }

  /**
   * Find thinking processes by user ID
   * @param userId The user ID to search for
   * @param limit Maximum number of results to return
   * @param offset Number of results to skip
   * @returns Array of thinking processes
   */
  async findByUserId(userId: string, limit = 10, offset = 0): Promise<ThinkingProcess[]> {
    return this.thinkingModel.find({ userId })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  /**
   * Find thinking processes by story ID
   * @param storyId The story ID to search for
   * @param limit Maximum number of results to return
   * @param offset Number of results to skip
   * @returns Array of thinking processes
   */
  async findByStoryId(storyId: string, limit = 10, offset = 0): Promise<ThinkingProcess[]> {
    return this.thinkingModel.find({ storyId })
      .sort({ updatedAt: -1 })
      .skip(offset)
      .limit(limit)
      .exec();
  }

  /**
   * Update a thinking process
   * @param processId The process ID to update
   * @param data The update data
   * @returns The updated thinking process
   */
  async update(processId: string, data: Partial<ThinkingProcess>): Promise<ThinkingProcess | null> {
    return this.thinkingModel.findOneAndUpdate(
      { processId },
      { $set: data },
      { new: true }
    ).exec();
  }

  /**
   * Delete a thinking process
   * @param processId The process ID to delete
   */
  async delete(processId: string): Promise<void> {
    await this.thinkingModel.deleteOne({ processId }).exec();
  }

  /**
   * Count thinking processes by user ID
   * @param userId The user ID to count for
   * @returns The count of thinking processes
   */
  async countByUserId(userId: string): Promise<number> {
    return this.thinkingModel.countDocuments({ userId }).exec();
  }

  /**
   * Count thinking processes by story ID
   * @param storyId The story ID to count for
   * @returns The count of thinking processes
   */
  async countByStoryId(storyId: string): Promise<number> {
    return this.thinkingModel.countDocuments({ storyId }).exec();
  }
} 