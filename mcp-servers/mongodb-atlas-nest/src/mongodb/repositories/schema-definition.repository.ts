import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SchemaDefinition } from '../schemas/schema-definition.schema';

@Injectable()
export class SchemaDefinitionRepository {
  private readonly logger = new Logger(SchemaDefinitionRepository.name);

  constructor(
    @InjectModel(SchemaDefinition.name)
    private readonly schemaDefinitionModel: Model<SchemaDefinition>,
  ) {}

  async createOrUpdate(schemaDefinition: Partial<SchemaDefinition>): Promise<SchemaDefinition> {
    const { userId, databaseName, collectionName } = schemaDefinition;
    
    this.logger.debug(`Creating/updating schema definition for ${databaseName}.${collectionName}`, {
      userId,
      databaseName,
      collectionName,
      isDraft: schemaDefinition.isDraft,
    });
    
    // Find existing schema definition
    const existingSchema = await this.schemaDefinitionModel.findOne({
      userId,
      databaseName,
      collectionName,
    }).exec();

    if (existingSchema) {
      // Update existing schema
      this.logger.debug(`Updating existing schema definition for ${databaseName}.${collectionName}`, {
        userId,
        schemaId: existingSchema._id,
      });

      // Increment version number
      schemaDefinition.version = existingSchema.version + 1;
      
      // Update the document
      Object.assign(existingSchema, schemaDefinition);
      existingSchema.updatedAt = Date.now();
      
      return existingSchema.save();
    } else {
      // Create new schema
      this.logger.debug(`Creating new schema definition for ${databaseName}.${collectionName}`, {
        userId,
      });
      
      const newSchema = new this.schemaDefinitionModel({
        ...schemaDefinition,
        version: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      
      return newSchema.save();
    }
  }

  async findByCollection(
    userId: string,
    databaseName: string,
    collectionName: string,
  ): Promise<SchemaDefinition | null> {
    this.logger.debug(`Finding schema definition for ${databaseName}.${collectionName}`, {
      userId,
      databaseName,
      collectionName,
    });
    
    return this.schemaDefinitionModel.findOne({
      userId,
      databaseName,
      collectionName,
      isActive: true,
    }).exec();
  }

  async findAllByUserId(userId: string): Promise<SchemaDefinition[]> {
    this.logger.debug(`Finding all schema definitions for userId: ${userId}`);
    
    return this.schemaDefinitionModel
      .find({ userId, isActive: true })
      .sort({ databaseName: 1, collectionName: 1 })
      .exec();
  }

  async deactivateSchema(
    userId: string,
    databaseName: string,
    collectionName: string,
  ): Promise<boolean> {
    this.logger.debug(`Deactivating schema definition for ${databaseName}.${collectionName}`, {
      userId,
    });
    
    const result = await this.schemaDefinitionModel.updateOne(
      { userId, databaseName, collectionName },
      { $set: { isActive: false, updatedAt: Date.now() } },
    ).exec();
    
    return result.modifiedCount > 0;
  }

  async validateDocumentAgainstSchema(
    userId: string,
    databaseName: string,
    collectionName: string,
    document: Record<string, any>,
  ): Promise<{ isValid: boolean; errors: string[] }> {
    this.logger.debug(`Validating document against schema for ${databaseName}.${collectionName}`, {
      userId,
    });
    
    const schema = await this.findByCollection(userId, databaseName, collectionName);
    
    if (!schema) {
      this.logger.debug(`No schema found for ${databaseName}.${collectionName}`, { userId });
      return { isValid: true, errors: [] }; // No schema means no validation
    }

    // In a real implementation, we would use a JSON Schema validator here
    // For now, we'll just return a simple validity check
    // TODO: Implement proper JSON Schema validation
    const isValid = true;
    const errors: string[] = [];
    
    this.logger.debug(`Document validation result for ${databaseName}.${collectionName}: ${isValid}`, {
      userId,
      errorsCount: errors.length,
    });
    
    return { isValid, errors };
  }
}
