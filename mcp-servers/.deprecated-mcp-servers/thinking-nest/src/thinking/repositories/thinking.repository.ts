import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ThinkingProcess } from '../schemas/thinking.schema';
import { ThinkingStatus } from '../dto/search-thinking-processes.dto';
import { ThinkingType } from '../dto/analyze-problem.dto';

@Injectable()
export class ThinkingRepository {
  constructor(
    @InjectModel(ThinkingProcess.name) private thinkingModel: Model<ThinkingProcess>,
  ) {}

  async create(thinkingData: Partial<ThinkingProcess>): Promise<ThinkingProcess> {
    const newThinking = new this.thinkingModel(thinkingData);
    return newThinking.save();
  }

  async findById(id: string, userId: string): Promise<ThinkingProcess | null> {
    try {
      return this.thinkingModel.findOne({ _id: id, userId }).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async findMany(filter: any, sort: any = { timestamp: -1 }): Promise<ThinkingProcess[]> {
    return this.thinkingModel.find(filter).sort(sort).exec();
  }

  async update(id: string, userId: string, updateData: Partial<ThinkingProcess>): Promise<ThinkingProcess | null> {
    try {
      return this.thinkingModel.findOneAndUpdate(
        { _id: id, userId },
        { $set: updateData },
        { new: true }
      ).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async addStep(id: string, userId: string, step: any): Promise<ThinkingProcess | null> {
    try {
      return this.thinkingModel.findOneAndUpdate(
        { _id: id, userId },
        { $push: { steps: step } },
        { new: true }
      ).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async updateStep(id: string, userId: string, stepIndex: number, stepData: any): Promise<ThinkingProcess | null> {
    try {
      const updateQuery = {};
      Object.keys(stepData).forEach(key => {
        updateQuery[`steps.${stepIndex}.${key}`] = stepData[key];
      });

      return this.thinkingModel.findOneAndUpdate(
        { _id: id, userId, [`steps.${stepIndex}`]: { $exists: true } },
        { $set: updateQuery },
        { new: true }
      ).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async completeProcess(id: string, userId: string, conclusions: string[]): Promise<ThinkingProcess | null> {
    try {
      return this.thinkingModel.findOneAndUpdate(
        { _id: id, userId },
        {
          $set: {
            conclusions,
            status: ThinkingStatus.COMPLETED
          }
        },
        { new: true }
      ).exec();
    } catch (error) {
      if (error.name === 'CastError') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string, userId: string): Promise<boolean> {
    try {
      const result = await this.thinkingModel.deleteOne({ _id: id, userId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      if (error.name === 'CastError') {
        return false;
      }
      throw error;
    }
  }

  async count(filter: any): Promise<number> {
    return this.thinkingModel.countDocuments(filter).exec();
  }

  async buildSearchFilter(params: {
    userId: string;
    query?: string;
    storyId?: string;
    contextId?: string;
    thinkingType?: ThinkingType;
    status?: ThinkingStatus;
    tags?: string[];
  }): Promise<any> {
    const { userId, query, storyId, contextId, thinkingType, status, tags } = params;
    
    const filter: any = { userId };

    if (storyId) {
      filter.storyId = storyId;
    }

    if (contextId) {
      filter.contextId = contextId;
    }

    if (thinkingType) {
      filter.thinkingType = thinkingType;
    }

    if (status) {
      filter.status = status;
    }

    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    // Text search using regex (in a production environment, you'd use text indexes)
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    return filter;
  }
}
