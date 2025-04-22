import { Controller, Post, Body, Get, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { MemoryService } from './memory.service';
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
import { ApiKeyGuard } from '../auth/api-key.guard';
import { MCPLoggerService } from '../../../shared/logging';
import { LogClass, LogMethod } from '../../../shared/logging/method-logger.decorator';

@ApiTags('memory')
@Controller()
@UseGuards(ApiKeyGuard)
@ApiBearerAuth()
@LogClass({ level: 'debug', logParameters: true, logResult: true })
export class MemoryController {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly logger: MCPLoggerService
  ) {
    this.logger.setContext('MemoryController');
  }

  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Server is healthy',
    type: HealthCheckResponseDto
  })
  async getHealth(): Promise<HealthCheckResponseDto> {
    return this.memoryService.getHealth();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process memory MCP requests' })
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
  async processRequest(@Body() requestDto: any): Promise<BaseMCPResponseDto> {
    this.logger.log(`Processing ${requestDto.action} request with ID ${requestDto.requestId}`);
    
    try {
      const { action } = requestDto;

      switch (action) {
        case 'store':
          return await this.memoryService.storeMemory(requestDto as StoreMemoryDto);
        case 'retrieve':
          return await this.memoryService.retrieveMemory(requestDto as RetrieveMemoryDto);
        case 'search':
          return await this.memoryService.searchMemories(requestDto as SearchMemoriesDto);
        case 'consolidate':
          return await this.memoryService.consolidateMemories(requestDto as ConsolidateMemoriesDto);
        case 'rank':
          return await this.memoryService.rankMemories(requestDto as RankMemoriesDto);
        case 'delete':
          return await this.memoryService.deleteMemory(requestDto as DeleteMemoryDto);
        default:
          return {
            serverId: 'memory-mcp',
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
      this.logger.error(`Error processing request: ${error.message}`, error.stack);
      
      return {
        serverId: 'memory-mcp',
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

  @Post('store')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Store a new memory' })
  @ApiBody({ type: StoreMemoryDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Memory stored successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid request parameters' 
  })
  async storeMemory(@Body() storeMemoryDto: StoreMemoryDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Storing new memory with request ID ${storeMemoryDto.requestId}`);
    return this.memoryService.storeMemory(storeMemoryDto);
  }

  @Post('retrieve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retrieve a memory by ID' })
  @ApiBody({ type: RetrieveMemoryDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Memory retrieved successfully', 
    type: BaseMCPResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Memory not found' 
  })
  async retrieveMemory(@Body() retrieveMemoryDto: RetrieveMemoryDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Retrieving memory ${retrieveMemoryDto.payload.memoryId} with request ID ${retrieveMemoryDto.requestId}`);
    return this.memoryService.retrieveMemory(retrieveMemoryDto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search for memories' })
  @ApiBody({ type: SearchMemoriesDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Search results',
    type: BaseMCPResponseDto
  })
  async searchMemories(@Body() searchMemoriesDto: SearchMemoriesDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Searching memories with request ID ${searchMemoriesDto.requestId}`);
    return this.memoryService.searchMemories(searchMemoriesDto);
  }

  @Post('consolidate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Consolidate multiple memories' })
  @ApiBody({ type: ConsolidateMemoriesDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Memories consolidated successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'No memories found to consolidate' 
  })
  async consolidateMemories(@Body() consolidateMemoriesDto: ConsolidateMemoriesDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Consolidating memories with request ID ${consolidateMemoriesDto.requestId}`);
    return this.memoryService.consolidateMemories(consolidateMemoriesDto);
  }

  @Post('rank')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rank memories by importance' })
  @ApiBody({ type: RankMemoriesDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Memories ranked successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'No memories found to rank' 
  })
  async rankMemories(@Body() rankMemoriesDto: RankMemoriesDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Ranking memories with request ID ${rankMemoriesDto.requestId}`);
    return this.memoryService.rankMemories(rankMemoriesDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a memory' })
  @ApiBody({ type: DeleteMemoryDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Memory deleted successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Memory not found' 
  })
  async deleteMemory(@Body() deleteMemoryDto: DeleteMemoryDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Deleting memory ${deleteMemoryDto.payload.memoryId} with request ID ${deleteMemoryDto.requestId}`);
    return this.memoryService.deleteMemory(deleteMemoryDto);
  }

  private generateResponseId(): string {
    return 'res_' + Math.random().toString(36).substring(2, 15);
  }
}
