import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DatabaseOperation, DatabaseOperationType } from '../schemas/database-operation.schema';
import { MCPLoggerService } from '../../../../shared/logging';
import { LogClass, LogMethod } from '../../../../shared/logging/method-logger.decorator';

@Injectable()
@LogClass({ level: 'debug', logParameters: true })
export class DatabaseOperationRepository {
  constructor(
    @InjectModel(DatabaseOperation.name)
    private readonly databaseOperationModel: Model<DatabaseOperation>,
    private readonly logger: MCPLoggerService
  ) {
    this.logger.setContext('DatabaseOperationRepository');
  }

  @LogMethod({ level: 'debug' })
  async create(databaseOperation: Partial<DatabaseOperation>): Promise<DatabaseOperation> {
    this.logger.debug(`Creating database operation record for ${databaseOperation.operationType}`, {
      userId: databaseOperation.userId,
      requestId: databaseOperation.requestId,
      operationType: databaseOperation.operationType,
      databaseName: databaseOperation.databaseName,
      collectionName: databaseOperation.collectionName,
    });
    
    const createdOperation = new this.databaseOperationModel(databaseOperation);
    return createdOperation.save();
  }

  @LogMethod({ level: 'debug' })
  async findByRequestId(requestId: string): Promise<DatabaseOperation[]> {
    this.logger.debug(`Finding database operations by requestId: ${requestId}`);
    return this.databaseOperationModel.find({ requestId }).exec();
  }

  @LogMethod({ level: 'debug' })
  async findByUserId(
    userId: string,
    limit: number = 100,
    skip: number = 0,
  ): Promise<DatabaseOperation[]> {
    this.logger.debug(`Finding database operations for userId: ${userId} (limit: ${limit}, skip: ${skip})`);
    return this.databaseOperationModel
      .find({ userId })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  @LogMethod({ level: 'debug' })
  async findByUserIdAndOperationType(
    userId: string,
    operationType: DatabaseOperationType,
    limit: number = 100,
    skip: number = 0,
  ): Promise<DatabaseOperation[]> {
    this.logger.debug(`Finding ${operationType} operations for userId: ${userId} (limit: ${limit}, skip: ${skip})`);
    return this.databaseOperationModel
      .find({ userId, operationType })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  @LogMethod({ level: 'debug' })
  async findByCollection(
    userId: string,
    databaseName: string,
    collectionName: string,
    limit: number = 100,
    skip: number = 0,
  ): Promise<DatabaseOperation[]> {
    this.logger.debug(`Finding operations for collection ${databaseName}.${collectionName} (userId: ${userId})`);
    return this.databaseOperationModel
      .find({ userId, databaseName, collectionName })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  @LogMethod({ level: 'debug' })
  async countByUserId(userId: string): Promise<number> {
    this.logger.debug(`Counting database operations for userId: ${userId}`);
    return this.databaseOperationModel.countDocuments({ userId }).exec();
  }

  @LogMethod({ level: 'debug' })
  async deleteOlderThan(userId: string, timestamp: number): Promise<number> {
    this.logger.debug(`Deleting operations older than ${new Date(timestamp).toISOString()} for userId: ${userId}`);
    const result = await this.databaseOperationModel
      .deleteMany({ userId, timestamp: { $lt: timestamp } })
      .exec();
    
    return result.deletedCount;
  }
}
