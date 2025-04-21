import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DatabaseOperationRepository } from './repositories/database-operation.repository';
import { SchemaDefinitionRepository } from './repositories/schema-definition.repository';
import {
  BaseMCPResponseDto,
  HealthCheckResponseDto,
  QueryRequestDto,
  CreateRequestDto,
  UpdateRequestDto,
  DeleteRequestDto,
  SchemaRequestDto,
  SearchRequestDto,
  ExecuteRequestDto
} from './dto';

@Injectable()
export class MongodbService {
  private readonly logger = new Logger(MongodbService.name);
  private readonly startTime: number;

  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService,
    private readonly databaseOperationRepository: DatabaseOperationRepository,
    private readonly schemaDefinitionRepository: SchemaDefinitionRepository
  ) {
    this.startTime = Date.now();
  }

  async getHealth(): Promise<HealthCheckResponseDto> {
    this.logger.log('Performing health check');
    
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    const dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${uptime} seconds`,
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV') || 'development',
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`,
      },
      cpu: os.cpus().length,
      hostname: os.hostname(),
      database: dbStatus
    };
  }

  async query(queryRequestDto: QueryRequestDto): Promise<BaseMCPResponseDto> {
    const { requestId, userId, payload } = queryRequestDto;
    const { databaseName, collectionName, filter, projection, sort, skip, limit } = payload;
    
    this.logger.debug(`Processing query request for ${databaseName}.${collectionName}`, {
      requestId,
      userId,
      databaseName,
      collectionName
    });

    const startTime = Date.now();
    let isSuccessful = false;
    let errorMessage = null;
    let result = null;

    try {
      // In a real implementation, we would connect to MongoDB Atlas API
      // For now, we'll simulate with mock data
      
      // Simulate finding documents
      const documents = [
        { _id: '1', name: 'Sample Document 1', timestamp: Date.now() },
        { _id: '2', name: 'Sample Document 2', timestamp: Date.now() }
      ];
      
      // Log operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'read',
        databaseName,
        collectionName,
        query: filter,
        data: { projection, sort, skip, limit },
        result: { count: documents.length },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: true,
        timestamp: Date.now()
      });
      
      isSuccessful = true;
      result = {
        documents,
        count: documents.length,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          hasMore: false,
          limit: limit || 100,
          skip: skip || 0
        }
      };
    } catch (error) {
      this.logger.error(`Error executing query: ${error.message}`, {
        requestId,
        userId,
        databaseName,
        collectionName,
        filter,
        error: error.message,
        stack: error.stack
      });
      
      // Log failed operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'read',
        databaseName,
        collectionName,
        query: filter,
        data: { projection, sort, skip, limit },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: false,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      isSuccessful = false;
      errorMessage = error.message;
    }

    // Prepare response
    return {
      serverId: 'mongodb-atlas-mcp',
      action: 'query',
      status: isSuccessful ? 'success' : 'error',
      error: errorMessage,
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
      payload: result
    };
  }

  async create(createRequestDto: CreateRequestDto): Promise<BaseMCPResponseDto> {
    const { requestId, userId, payload } = createRequestDto;
    const { databaseName, collectionName, documents, validateSchema } = payload;
    
    this.logger.debug(`Processing create request for ${databaseName}.${collectionName}`, {
      requestId,
      userId,
      databaseName,
      collectionName,
      documentsCount: documents.length
    });

    const startTime = Date.now();
    let isSuccessful = false;
    let errorMessage = null;
    let result = null;

    try {
      // Validate against schema if required
      if (validateSchema) {
        for (const document of documents) {
          const validationResult = await this.schemaDefinitionRepository.validateDocumentAgainstSchema(
            userId,
            databaseName,
            collectionName,
            document
          );
          
          if (!validationResult.isValid) {
            throw new BadRequestException(
              `Schema validation failed: ${validationResult.errors.join(', ')}`
            );
          }
        }
      }

      // In a real implementation, we would connect to MongoDB Atlas API
      // For now, we'll simulate with mock data
      
      // Simulate inserting documents with generated IDs
      const insertedIds = documents.map((_, index) => `doc_${Date.now()}_${index}`);
      
      // Log operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'create',
        databaseName,
        collectionName,
        data: { documents },
        result: { insertedCount: documents.length, insertedIds },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: true,
        timestamp: Date.now()
      });
      
      isSuccessful = true;
      result = {
        insertedCount: documents.length,
        insertedIds,
        metadata: {
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error(`Error executing create: ${error.message}`, {
        requestId,
        userId,
        databaseName,
        collectionName,
        documentsCount: documents.length,
        error: error.message,
        stack: error.stack
      });
      
      // Log failed operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'create',
        databaseName,
        collectionName,
        data: { documents },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: false,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      isSuccessful = false;
      errorMessage = error.message;
    }

    // Prepare response
    return {
      serverId: 'mongodb-atlas-mcp',
      action: 'create',
      status: isSuccessful ? 'success' : 'error',
      error: errorMessage,
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
      payload: result
    };
  }

  async update(updateRequestDto: UpdateRequestDto): Promise<BaseMCPResponseDto> {
    const { requestId, userId, payload } = updateRequestDto;
    const { databaseName, collectionName, filter, update, multi, upsert, validateSchema } = payload;
    
    this.logger.debug(`Processing update request for ${databaseName}.${collectionName}`, {
      requestId,
      userId,
      databaseName,
      collectionName,
      multi: !!multi,
      upsert: !!upsert
    });

    const startTime = Date.now();
    let isSuccessful = false;
    let errorMessage = null;
    let result = null;

    try {
      // In a real implementation, we would connect to MongoDB Atlas API
      // For now, we'll simulate with mock data
      
      // Simulate update result
      const matchedCount = 2;
      const modifiedCount = 2;
      const upsertedId = null;
      
      // Log operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'update',
        databaseName,
        collectionName,
        query: filter,
        data: { update, multi, upsert },
        result: { matchedCount, modifiedCount, upsertedId },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: true,
        timestamp: Date.now()
      });
      
      isSuccessful = true;
      result = {
        matchedCount,
        modifiedCount,
        upsertedId,
        metadata: {
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error(`Error executing update: ${error.message}`, {
        requestId,
        userId,
        databaseName,
        collectionName,
        filter,
        error: error.message,
        stack: error.stack
      });
      
      // Log failed operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'update',
        databaseName,
        collectionName,
        query: filter,
        data: { update, multi, upsert },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: false,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      isSuccessful = false;
      errorMessage = error.message;
    }

    // Prepare response
    return {
      serverId: 'mongodb-atlas-mcp',
      action: 'update',
      status: isSuccessful ? 'success' : 'error',
      error: errorMessage,
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
      payload: result
    };
  }

  async delete(deleteRequestDto: DeleteRequestDto): Promise<BaseMCPResponseDto> {
    const { requestId, userId, payload } = deleteRequestDto;
    const { databaseName, collectionName, filter, multi } = payload;
    
    this.logger.debug(`Processing delete request for ${databaseName}.${collectionName}`, {
      requestId,
      userId,
      databaseName,
      collectionName,
      multi: !!multi
    });

    const startTime = Date.now();
    let isSuccessful = false;
    let errorMessage = null;
    let result = null;

    try {
      // In a real implementation, we would connect to MongoDB Atlas API
      // For now, we'll simulate with mock data
      
      // Simulate delete result
      const deletedCount = multi ? 2 : 1;
      
      // Log operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'delete',
        databaseName,
        collectionName,
        query: filter,
        data: { multi },
        result: { deletedCount },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: true,
        timestamp: Date.now()
      });
      
      isSuccessful = true;
      result = {
        deletedCount,
        metadata: {
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error(`Error executing delete: ${error.message}`, {
        requestId,
        userId,
        databaseName,
        collectionName,
        filter,
        error: error.message,
        stack: error.stack
      });
      
      // Log failed operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'delete',
        databaseName,
        collectionName,
        query: filter,
        data: { multi },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: false,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      isSuccessful = false;
      errorMessage = error.message;
    }

    // Prepare response
    return {
      serverId: 'mongodb-atlas-mcp',
      action: 'delete',
      status: isSuccessful ? 'success' : 'error',
      error: errorMessage,
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
      payload: result
    };
  }

  async manageSchema(schemaRequestDto: SchemaRequestDto): Promise<BaseMCPResponseDto> {
    const { requestId, userId, payload } = schemaRequestDto;
    const { databaseName, collectionName, schema, getSchema, isDraft, description } = payload;
    
    this.logger.debug(`Processing schema request for ${databaseName}.${collectionName}`, {
      requestId,
      userId,
      databaseName,
      collectionName,
      operation: getSchema ? 'get' : 'set'
    });

    const startTime = Date.now();
    let isSuccessful = false;
    let errorMessage = null;
    let result = null;

    try {
      if (getSchema) {
        // Get schema
        const existingSchema = await this.schemaDefinitionRepository.findByCollection(
          userId,
          databaseName,
          collectionName
        );
        
        if (!existingSchema) {
          throw new NotFoundException(
            `No schema found for collection ${databaseName}.${collectionName}`
          );
        }
        
        // Log operation
        await this.databaseOperationRepository.create({
          userId,
          requestId,
          responseId: this.generateResponseId(),
          operationType: 'schema',
          databaseName,
          collectionName,
          result: { schemaId: existingSchema._id },
          executionTimeMs: Date.now() - startTime,
          isSuccessful: true,
          timestamp: Date.now()
        });
        
        isSuccessful = true;
        result = {
          schema: existingSchema.schema,
          version: existingSchema.version,
          isActive: existingSchema.isActive,
          isDraft: existingSchema.isDraft,
          description: existingSchema.description,
          updatedAt: existingSchema.updatedAt,
          createdAt: existingSchema.createdAt,
          metadata: {
            executionTimeMs: Date.now() - startTime
          }
        };
      } else {
        // Create or update schema
        if (!schema) {
          throw new BadRequestException('Schema is required when not using getSchema');
        }
        
        const schemaDefinition = await this.schemaDefinitionRepository.createOrUpdate({
          userId,
          databaseName,
          collectionName,
          schema,
          isDraft: isDraft || false,
          description
        });
        
        // Log operation
        await this.databaseOperationRepository.create({
          userId,
          requestId,
          responseId: this.generateResponseId(),
          operationType: 'schema',
          databaseName,
          collectionName,
          data: { schema, isDraft, description },
          result: { schemaId: schemaDefinition._id, version: schemaDefinition.version },
          executionTimeMs: Date.now() - startTime,
          isSuccessful: true,
          timestamp: Date.now()
        });
        
        isSuccessful = true;
        result = {
          schemaId: schemaDefinition._id,
          version: schemaDefinition.version,
          isActive: schemaDefinition.isActive,
          isDraft: schemaDefinition.isDraft,
          metadata: {
            executionTimeMs: Date.now() - startTime
          }
        };
      }
    } catch (error) {
      this.logger.error(`Error managing schema: ${error.message}`, {
        requestId,
        userId,
        databaseName,
        collectionName,
        operation: getSchema ? 'get' : 'set',
        error: error.message,
        stack: error.stack
      });
      
      // Log failed operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'schema',
        databaseName,
        collectionName,
        data: getSchema ? null : { schema, isDraft, description },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: false,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      isSuccessful = false;
      errorMessage = error.message;
    }

    // Prepare response
    return {
      serverId: 'mongodb-atlas-mcp',
      action: 'schema',
      status: isSuccessful ? 'success' : 'error',
      error: errorMessage,
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
      payload: result
    };
  }

  async search(searchRequestDto: SearchRequestDto): Promise<BaseMCPResponseDto> {
    const { requestId, userId, payload } = searchRequestDto;
    const { databaseName, collectionName, searchText, fields, projection, sort, skip, limit } = payload;
    
    this.logger.debug(`Processing search request for ${databaseName}.${collectionName}`, {
      requestId,
      userId,
      databaseName,
      collectionName,
      searchText
    });

    const startTime = Date.now();
    let isSuccessful = false;
    let errorMessage = null;
    let result = null;

    try {
      // In a real implementation, we would connect to MongoDB Atlas API
      // For now, we'll simulate with mock data
      
      // Simulate search results
      const documents = [
        { _id: '1', name: 'Sample Document 1', description: `Contains ${searchText}`, score: 0.95 },
        { _id: '2', name: 'Sample Document 2', description: `Matches ${searchText} partially`, score: 0.72 }
      ];
      
      // Log operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'search',
        databaseName,
        collectionName,
        query: { searchText, fields },
        data: { projection, sort, skip, limit },
        result: { count: documents.length },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: true,
        timestamp: Date.now()
      });
      
      isSuccessful = true;
      result = {
        documents,
        count: documents.length,
        metadata: {
          executionTimeMs: Date.now() - startTime,
          hasMore: false,
          limit: limit || 100,
          skip: skip || 0
        }
      };
    } catch (error) {
      this.logger.error(`Error executing search: ${error.message}`, {
        requestId,
        userId,
        databaseName,
        collectionName,
        searchText,
        error: error.message,
        stack: error.stack
      });
      
      // Log failed operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'search',
        databaseName,
        collectionName,
        query: { searchText, fields },
        data: { projection, sort, skip, limit },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: false,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      isSuccessful = false;
      errorMessage = error.message;
    }

    // Prepare response
    return {
      serverId: 'mongodb-atlas-mcp',
      action: 'search',
      status: isSuccessful ? 'success' : 'error',
      error: errorMessage,
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
      payload: result
    };
  }

  async execute(executeRequestDto: ExecuteRequestDto): Promise<BaseMCPResponseDto> {
    const { requestId, userId, payload } = executeRequestDto;
    const { databaseName, collectionName, pipeline, options } = payload;
    
    this.logger.debug(`Processing execute request for ${databaseName}.${collectionName}`, {
      requestId,
      userId,
      databaseName,
      collectionName,
      pipelineStages: pipeline.length
    });

    const startTime = Date.now();
    let isSuccessful = false;
    let errorMessage = null;
    let result = null;

    try {
      // In a real implementation, we would connect to MongoDB Atlas API
      // For now, we'll simulate with mock data
      
      // Simulate aggregation results
      const documents = [
        { _id: 'group1', count: 5, total: 500 },
        { _id: 'group2', count: 3, total: 300 }
      ];
      
      // Log operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'query',
        databaseName,
        collectionName,
        query: { pipeline },
        data: { options },
        result: { count: documents.length },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: true,
        timestamp: Date.now()
      });
      
      isSuccessful = true;
      result = {
        documents,
        count: documents.length,
        metadata: {
          executionTimeMs: Date.now() - startTime
        }
      };
    } catch (error) {
      this.logger.error(`Error executing aggregation: ${error.message}`, {
        requestId,
        userId,
        databaseName,
        collectionName,
        pipelineStages: pipeline.length,
        error: error.message,
        stack: error.stack
      });
      
      // Log failed operation
      await this.databaseOperationRepository.create({
        userId,
        requestId,
        responseId: this.generateResponseId(),
        operationType: 'query',
        databaseName,
        collectionName,
        query: { pipeline },
        data: { options },
        executionTimeMs: Date.now() - startTime,
        isSuccessful: false,
        errorMessage: error.message,
        timestamp: Date.now()
      });
      
      isSuccessful = false;
      errorMessage = error.message;
    }

    // Prepare response
    return {
      serverId: 'mongodb-atlas-mcp',
      action: 'execute',
      status: isSuccessful ? 'success' : 'error',
      error: errorMessage,
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
      payload: result
    };
  }

  private generateResponseId(): string {
    return 'res_' + Math.random().toString(36).substring(2, 15);
  }
}
