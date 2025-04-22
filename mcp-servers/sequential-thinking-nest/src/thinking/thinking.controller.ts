/**
 * Controller for thinking process endpoints in Sequential Thinking MCP Server.
 * This controller handles API requests for thinking processes.
 */

import { 
  Controller, Get, Post, Put, Delete, Param, Query, 
  Body, UseGuards, ParseIntPipe, DefaultValuePipe
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiParam, 
  ApiQuery, ApiBearerAuth, ApiBody 
} from '@nestjs/swagger';
import { ThinkingService } from './thinking.service';
import { CreateThinkingDto } from './dto/create-thinking.dto';
import { UpdateThinkingDto } from './dto/update-thinking.dto';
import { ThinkingResponseDto } from './dto/thinking-response.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { MCPLoggerService } from '../../../shared/logging';
import { LogClass, LogMethod } from '../../../shared/logging/method-logger.decorator';

@ApiTags('thinking')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('thinking')
@LogClass({ level: 'debug', logParameters: true })
export class ThinkingController {
  constructor(
    private readonly thinkingService: ThinkingService,
    private readonly logger: MCPLoggerService
  ) {
    this.logger.setContext('ThinkingController');
  }

  @Post()
  @ApiOperation({ summary: 'Create a new thinking process' })
  @ApiBody({ type: CreateThinkingDto })
  @ApiResponse({ 
    status: 201, 
    description: 'The thinking process has been successfully created.',
    type: ThinkingResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request. Invalid input data.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. Invalid API key.' 
  })
  @LogMethod({ level: 'debug' })
  async createThinkingProcess(@Body() createThinkingDto: CreateThinkingDto): Promise<ThinkingResponseDto> {
    return this.thinkingService.createThinkingProcess(createThinkingDto);
  }

  @Get(':processId')
  @ApiOperation({ summary: 'Get a thinking process by ID' })
  @ApiParam({ name: 'processId', description: 'ID of the thinking process' })
  @ApiResponse({ 
    status: 200, 
    description: 'The thinking process has been successfully retrieved.',
    type: ThinkingResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Thinking process not found.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. Invalid API key.' 
  })
  @LogMethod({ level: 'debug' })
  async getThinkingProcess(@Param('processId') processId: string): Promise<ThinkingResponseDto> {
    return this.thinkingService.getThinkingProcess(processId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get thinking processes by user ID' })
  @ApiParam({ name: 'userId', description: 'ID of the user' })
  @ApiQuery({ name: 'limit', description: 'Maximum number of results to return', required: false, type: Number })
  @ApiQuery({ name: 'offset', description: 'Number of results to skip', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'The thinking processes have been successfully retrieved.',
    type: ThinkingResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. Invalid API key.' 
  })
  @LogMethod({ level: 'debug' })
  async getThinkingProcessesByUserId(
    @Param('userId') userId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
  ): Promise<ThinkingResponseDto> {
    return this.thinkingService.getThinkingProcessesByUserId(userId, limit, offset);
  }

  @Get('story/:storyId')
  @ApiOperation({ summary: 'Get thinking processes by story ID' })
  @ApiParam({ name: 'storyId', description: 'ID of the story' })
  @ApiQuery({ name: 'limit', description: 'Maximum number of results to return', required: false, type: Number })
  @ApiQuery({ name: 'offset', description: 'Number of results to skip', required: false, type: Number })
  @ApiResponse({ 
    status: 200, 
    description: 'The thinking processes have been successfully retrieved.',
    type: ThinkingResponseDto
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. Invalid API key.' 
  })
  @LogMethod({ level: 'debug' })
  async getThinkingProcessesByStoryId(
    @Param('storyId') storyId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number
  ): Promise<ThinkingResponseDto> {
    return this.thinkingService.getThinkingProcessesByStoryId(storyId, limit, offset);
  }

  @Put(':processId')
  @ApiOperation({ summary: 'Update a thinking process' })
  @ApiParam({ name: 'processId', description: 'ID of the thinking process to update' })
  @ApiBody({ type: UpdateThinkingDto })
  @ApiResponse({ 
    status: 200, 
    description: 'The thinking process has been successfully updated.',
    type: ThinkingResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Thinking process not found.' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request. Invalid input data.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. Invalid API key.' 
  })
  @LogMethod({ level: 'debug' })
  async updateThinkingProcess(
    @Param('processId') processId: string,
    @Body() updateThinkingDto: UpdateThinkingDto
  ): Promise<ThinkingResponseDto> {
    return this.thinkingService.updateThinkingProcess(processId, updateThinkingDto);
  }

  @Delete(':processId')
  @ApiOperation({ summary: 'Delete a thinking process' })
  @ApiParam({ name: 'processId', description: 'ID of the thinking process to delete' })
  @ApiResponse({ 
    status: 200, 
    description: 'The thinking process has been successfully deleted.',
    type: ThinkingResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Thinking process not found.' 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized. Invalid API key.' 
  })
  @LogMethod({ level: 'debug' })
  async deleteThinkingProcess(@Param('processId') processId: string): Promise<ThinkingResponseDto> {
    return this.thinkingService.deleteThinkingProcess(processId);
  }
} 