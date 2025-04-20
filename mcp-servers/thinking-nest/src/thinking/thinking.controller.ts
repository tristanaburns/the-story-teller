import { Controller, Post, Body, Get, UseGuards, Logger, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { ThinkingService } from './thinking.service';
import { 
  AnalyzeProblemDto,
  AddThinkingStepDto,
  CompleteThinkingProcessDto,
  GetThinkingProcessDto,
  SearchThinkingProcessesDto,
  DeleteThinkingProcessDto,
  BaseMCPResponseDto,
  HealthCheckResponseDto
} from './dto';
import { ApiKeyGuard } from '../auth/api-key.guard';

@ApiTags('thinking')
@Controller()
@UseGuards(ApiKeyGuard)
@ApiBearerAuth()
export class ThinkingController {
  private readonly logger = new Logger(ThinkingController.name);

  constructor(private readonly thinkingService: ThinkingService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Server is healthy',
    type: HealthCheckResponseDto
  })
  async getHealth(): Promise<HealthCheckResponseDto> {
    return this.thinkingService.getHealth();
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process thinking MCP requests' })
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
        case 'analyze':
          return await this.thinkingService.analyzeProblem(requestDto as AnalyzeProblemDto);
        case 'addStep':
          return await this.thinkingService.addThinkingStep(requestDto as AddThinkingStepDto);
        case 'complete':
          return await this.thinkingService.completeThinkingProcess(requestDto as CompleteThinkingProcessDto);
        case 'getProcess':
          return await this.thinkingService.getThinkingProcess(requestDto as GetThinkingProcessDto);
        case 'search':
          return await this.thinkingService.searchThinkingProcesses(requestDto as SearchThinkingProcessesDto);
        case 'delete':
          return await this.thinkingService.deleteThinkingProcess(requestDto as DeleteThinkingProcessDto);
        default:
          return {
            serverId: 'thinking-mcp',
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
        serverId: 'thinking-mcp',
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

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Analyze a problem with sequential thinking' })
  @ApiBody({ type: AnalyzeProblemDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Problem analysis started successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.BAD_REQUEST, 
    description: 'Invalid request parameters' 
  })
  async analyzeProblem(@Body() analyzeProblemDto: AnalyzeProblemDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Starting problem analysis with request ID ${analyzeProblemDto.requestId}`);
    return this.thinkingService.analyzeProblem(analyzeProblemDto);
  }

  @Post('addStep')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add a step to a thinking process' })
  @ApiBody({ type: AddThinkingStepDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Step added successfully', 
    type: BaseMCPResponseDto 
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Thinking process not found' 
  })
  async addThinkingStep(@Body() addThinkingStepDto: AddThinkingStepDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Adding step to process ${addThinkingStepDto.payload.processId} with request ID ${addThinkingStepDto.requestId}`);
    return this.thinkingService.addThinkingStep(addThinkingStepDto);
  }

  @Post('complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete a thinking process with conclusions' })
  @ApiBody({ type: CompleteThinkingProcessDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Process completed successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Thinking process not found' 
  })
  async completeThinkingProcess(@Body() completeThinkingProcessDto: CompleteThinkingProcessDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Completing thinking process ${completeThinkingProcessDto.payload.processId} with request ID ${completeThinkingProcessDto.requestId}`);
    return this.thinkingService.completeThinkingProcess(completeThinkingProcessDto);
  }

  @Post('getProcess')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get a thinking process by ID' })
  @ApiBody({ type: GetThinkingProcessDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Process retrieved successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Thinking process not found' 
  })
  async getThinkingProcess(@Body() getThinkingProcessDto: GetThinkingProcessDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Retrieving thinking process ${getThinkingProcessDto.payload.processId} with request ID ${getThinkingProcessDto.requestId}`);
    return this.thinkingService.getThinkingProcess(getThinkingProcessDto);
  }

  @Post('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Search for thinking processes' })
  @ApiBody({ type: SearchThinkingProcessesDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Search results',
    type: BaseMCPResponseDto
  })
  async searchThinkingProcesses(@Body() searchThinkingProcessesDto: SearchThinkingProcessesDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Searching thinking processes with request ID ${searchThinkingProcessesDto.requestId}`);
    return this.thinkingService.searchThinkingProcesses(searchThinkingProcessesDto);
  }

  @Post('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a thinking process' })
  @ApiBody({ type: DeleteThinkingProcessDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Process deleted successfully',
    type: BaseMCPResponseDto
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'Thinking process not found' 
  })
  async deleteThinkingProcess(@Body() deleteThinkingProcessDto: DeleteThinkingProcessDto): Promise<BaseMCPResponseDto> {
    this.logger.log(`Deleting thinking process ${deleteThinkingProcessDto.payload.processId} with request ID ${deleteThinkingProcessDto.requestId}`);
    return this.thinkingService.deleteThinkingProcess(deleteThinkingProcessDto);
  }

  private generateResponseId(): string {
    return 'res_' + Math.random().toString(36).substring(2, 15);
  }
}
