import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EverartService } from './everart.service';
import { MCPLoggerService } from '../../../shared/logging';
import { LogClass, LogMethod } from '../../../shared/logging/method-logger.decorator';
import { 
  GenerateArtworkRequestDto,
  GetArtworkRequestDto,
  UpdateArtworkRequestDto,
  CreateStyleRequestDto,
  GetStylesRequestDto,
  UpdateStyleRequestDto,
  McpRequestDto,
  McpResponseDto
} from './dto';
import { ApiKeyGuard } from '../auth/guards/api-key.guard';

@ApiTags('everart')
@Controller()
@UseGuards(ApiKeyGuard)
@ApiBearerAuth('api-key')
@LogClass({ level: 'debug', logParameters: true, logResult: true })
export class EverartController {
  constructor(
    private readonly everartService: EverartService,
    private readonly logger: MCPLoggerService
  ) {
    this.logger.setContext('EverartController');
  }

  @Post()
  @ApiOperation({ summary: 'MCP entry point for all operations' })
  @ApiResponse({ status: 200, description: 'Operation executed successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug', logParameters: true })
  async handleMcpRequest(@Body() request: any): Promise<McpResponseDto> {
    try {
      const action = request.action;
      this.logger.debug(`Processing ${action} request with ID ${request.requestId}`, {
        action,
        requestId: request.requestId,
        userId: request.userId,
      });
      
      switch (action) {
        case 'generateArtwork':
          return await this.everartService.generateArtwork(request);
        
        case 'getArtwork':
          return await this.everartService.getArtwork(request);
        
        case 'updateArtwork':
          return await this.everartService.updateArtwork(request);
        
        case 'deleteArtwork':
          return await this.everartService.deleteArtwork(request.artworkId, request.requestId);
        
        case 'createStyle':
          return await this.everartService.createStyle(request);
        
        case 'getStyles':
          return await this.everartService.getStyles(request);
        
        case 'updateStyle':
          return await this.everartService.updateStyle(request);
        
        case 'deleteStyle':
          return await this.everartService.deleteStyle(request.styleId, request.requestId);
        
        default:
          return {
            requestId: request.requestId,
            status: 'error',
            error: `Unknown action: ${action}`,
          };
      }
    } catch (error) {
      this.logger.error(`Error processing ${request.action} request: ${error.message}`, error.stack, {
        requestId: request.requestId,
        userId: request.userId,
        action: request.action,
      });
      
      return {
        requestId: request.requestId,
        status: 'error',
        error: error.message || 'Internal server error',
      };
    }
  }

  @Post('generate-artwork')
  @ApiOperation({ summary: 'Generate artwork based on description' })
  @ApiResponse({ status: 200, description: 'Artwork generated successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async generateArtwork(@Body() request: GenerateArtworkRequestDto): Promise<McpResponseDto> {
    return this.everartService.generateArtwork(request);
  }

  @Post('get-artwork')
  @ApiOperation({ summary: 'Get artwork by ID or search with filters' })
  @ApiResponse({ status: 200, description: 'Artwork retrieved successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async getArtwork(@Body() request: GetArtworkRequestDto): Promise<McpResponseDto> {
    return this.everartService.getArtwork(request);
  }

  @Post('update-artwork')
  @ApiOperation({ summary: 'Update artwork metadata' })
  @ApiResponse({ status: 200, description: 'Artwork updated successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async updateArtwork(@Body() request: UpdateArtworkRequestDto): Promise<McpResponseDto> {
    return this.everartService.updateArtwork(request);
  }

  @Post('delete-artwork')
  @ApiOperation({ summary: 'Delete artwork' })
  @ApiResponse({ status: 200, description: 'Artwork deleted successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async deleteArtwork(@Body() request: McpRequestDto & { artworkId: string }): Promise<McpResponseDto> {
    return this.everartService.deleteArtwork(request.artworkId, request.requestId);
  }

  @Post('create-style')
  @ApiOperation({ summary: 'Create a new style' })
  @ApiResponse({ status: 200, description: 'Style created successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async createStyle(@Body() request: CreateStyleRequestDto): Promise<McpResponseDto> {
    return this.everartService.createStyle(request);
  }

  @Post('get-styles')
  @ApiOperation({ summary: 'Get styles by ID or search with filters' })
  @ApiResponse({ status: 200, description: 'Styles retrieved successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async getStyles(@Body() request: GetStylesRequestDto): Promise<McpResponseDto> {
    return this.everartService.getStyles(request);
  }

  @Post('update-style')
  @ApiOperation({ summary: 'Update style metadata' })
  @ApiResponse({ status: 200, description: 'Style updated successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async updateStyle(@Body() request: UpdateStyleRequestDto): Promise<McpResponseDto> {
    return this.everartService.updateStyle(request);
  }

  @Post('delete-style')
  @ApiOperation({ summary: 'Delete style' })
  @ApiResponse({ status: 200, description: 'Style deleted successfully' })
  @UsePipes(new ValidationPipe({ transform: true }))
  @LogMethod({ level: 'debug' })
  async deleteStyle(@Body() request: McpRequestDto & { styleId: string }): Promise<McpResponseDto> {
    return this.everartService.deleteStyle(request.styleId, request.requestId);
  }
}
