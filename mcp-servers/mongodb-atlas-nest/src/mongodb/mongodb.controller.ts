import { Controller, Post, Body, Get, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MongodbService } from './mongodb.service';
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
import { ApiKeyGuard } from '../auth/api-key.guard';
import { MCPLoggerService } from '../../../shared/logging';
import { LogClass, LogMethod } from '../../../shared/logging/method-logger.decorator';

@ApiTags('mongodb')
@Controller()
@UseGuards(ApiKeyGuard)
@ApiBearerAuth('API Key')
@LogClass({ level: 'debug', logParameters: true })
export class MongodbController {
  constructor(
    private readonly mongodbService: MongodbService,
    private readonly logger: MCPLoggerService
  ) {
    this.logger.setContext('MongodbController');
  }

  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Server is healthy',
    type: HealthCheckResponseDto
  })
  @LogMethod({ level: 'debug' })
  async getHealth(): Promise<HealthCheckResponseDto> {
    return this.mongodbService.getHealth();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process MongoDB Atlas MCP requests' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Request processed successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Bad request parameters' 
  })
  @ApiResponse({ 
    status: HttpStatus.UNAUTHORIZED, 
    description: 'Unauthorized request' 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Resource not found' 
  })
  @LogMethod({ level: 'debug' })
  async processRequest(@Body() requestDto: any): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Processing ${requestDto.action} request with ID ${requestDto.requestId}`, {
      requestId: requestDto.requestId,
      action: requestDto.action,
      userId: requestDto.userId
    });
    
    try {
      const { action } = requestDto;

      switch (action) {
        case 'query':
          return await this.mongodbService.query(requestDto as QueryRequestDto);
        case 'create':
          return await this.mongodbService.create(requestDto as CreateRequestDto);
        case 'update':
          return await this.mongodbService.update(requestDto as UpdateRequestDto);
        case 'delete':
          return await this.mongodbService.delete(requestDto as DeleteRequestDto);
        case 'schema':
          return await this.mongodbService.manageSchema(requestDto as SchemaRequestDto);
        case 'search':
          return await this.mongodbService.search(requestDto as SearchRequestDto);
        case 'execute':
          return await this.mongodbService.execute(requestDto as ExecuteRequestDto);
        default:
          return {
            serverId: 'mongodb-atlas-mcp',
            action,
            status: 'error',
            error: `Unknown action: ${action}`,
            requestId: requestDto.requestId,
            responseId: this.generateResponseId(),
            timestamp: Date.now(),
            payload: null
          };
      }
    } catch (error) {
      this.logger.error(`Error processing request: ${error.message}`, error.stack, {
        requestId: requestDto.requestId,
        action: requestDto.action,
        userId: requestDto.userId,
        error: error.message
      });
      
      return {
        serverId: 'mongodb-atlas-mcp',
        action: requestDto.action || 'unknown',
        status: 'error',
        error: error.message,
        requestId: requestDto.requestId,
        responseId: this.generateResponseId(),
        timestamp: Date.now(),
        payload: null
      };
    }
  }

  @Post('query')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Query documents from MongoDB' })
  @ApiBody({ type: QueryRequestDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Query executed successfully',
    type: BaseMCPResponseDto
  })
  @LogMethod({ level: 'debug' })
  async query(@Body() queryRequestDto: QueryRequestDto): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Querying database with request ID ${queryRequestDto.requestId}`, {
      requestId: queryRequestDto.requestId,
      userId: queryRequestDto.userId,
      database: queryRequestDto.payload.databaseName,
      collection: queryRequestDto.payload.collectionName
    });
    return this.mongodbService.query(queryRequestDto);
  }

  @Post('create')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create documents in MongoDB' })
  @ApiBody({ type: CreateRequestDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Documents created successfully',
    type: BaseMCPResponseDto
  })
  @LogMethod({ level: 'debug' })
  async create(@Body() createRequestDto: CreateRequestDto): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Creating documents with request ID ${createRequestDto.requestId}`, {
      requestId: createRequestDto.requestId,
      userId: createRequestDto.userId,
      database: createRequestDto.payload.databaseName,
      collection: createRequestDto.payload.collectionName,
      documentsCount: createRequestDto.payload.documents.length
    });
    return this.mongodbService.create(createRequestDto);
  }

  @Post('update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update documents in MongoDB' })
  @ApiBody({ type: UpdateRequestDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Documents updated successfully',
    type: BaseMCPResponseDto
  })
  @LogMethod({ level: 'debug' })
  async update(@Body() updateRequestDto: UpdateRequestDto): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Updating documents with request ID ${updateRequestDto.requestId}`, {
      requestId: updateRequestDto.requestId,
      userId: updateRequestDto.userId,
      database: updateRequestDto.payload.databaseName,
      collection: updateRequestDto.payload.collectionName
    });
    return this.mongodbService.update(updateRequestDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete documents from MongoDB' })
  @ApiBody({ type: DeleteRequestDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Documents deleted successfully',
    type: BaseMCPResponseDto
  })
  @LogMethod({ level: 'debug' })
  async delete(@Body() deleteRequestDto: DeleteRequestDto): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Deleting documents with request ID ${deleteRequestDto.requestId}`, {
      requestId: deleteRequestDto.requestId,
      userId: deleteRequestDto.userId,
      database: deleteRequestDto.payload.databaseName,
      collection: deleteRequestDto.payload.collectionName
    });
    return this.mongodbService.delete(deleteRequestDto);
  }

  @Post('schema')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manage MongoDB schema' })
  @ApiBody({ type: SchemaRequestDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Schema operation completed successfully',
    type: BaseMCPResponseDto
  })
  @LogMethod({ level: 'debug' })
  async manageSchema(@Body() schemaRequestDto: SchemaRequestDto): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Managing schema with request ID ${schemaRequestDto.requestId}`, {
      requestId: schemaRequestDto.requestId,
      userId: schemaRequestDto.userId,
      database: schemaRequestDto.payload.databaseName,
      collection: schemaRequestDto.payload.collectionName,
      operation: schemaRequestDto.payload.getSchema ? 'get' : 'set'
    });
    return this.mongodbService.manageSchema(schemaRequestDto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search documents in MongoDB' })
  @ApiBody({ type: SearchRequestDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Search completed successfully',
    type: BaseMCPResponseDto
  })
  @LogMethod({ level: 'debug' })
  async search(@Body() searchRequestDto: SearchRequestDto): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Searching documents with request ID ${searchRequestDto.requestId}`, {
      requestId: searchRequestDto.requestId,
      userId: searchRequestDto.userId,
      database: searchRequestDto.payload.databaseName,
      collection: searchRequestDto.payload.collectionName,
      searchText: searchRequestDto.payload.searchText
    });
    return this.mongodbService.search(searchRequestDto);
  }

  @Post('execute')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute aggregation pipeline in MongoDB' })
  @ApiBody({ type: ExecuteRequestDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Aggregation executed successfully',
    type: BaseMCPResponseDto
  })
  @LogMethod({ level: 'debug' })
  async execute(@Body() executeRequestDto: ExecuteRequestDto): Promise<BaseMCPResponseDto> {
    this.logger.debug(`Executing aggregation with request ID ${executeRequestDto.requestId}`, {
      requestId: executeRequestDto.requestId,
      userId: executeRequestDto.userId,
      database: executeRequestDto.payload.databaseName,
      collection: executeRequestDto.payload.collectionName,
      pipelineStages: executeRequestDto.payload.pipeline.length
    });
    return this.mongodbService.execute(executeRequestDto);
  }

  @LogMethod({ level: 'trace' })
  private generateResponseId(): string {
    return 'res_' + Math.random().toString(36).substring(2, 15);
  }
}
