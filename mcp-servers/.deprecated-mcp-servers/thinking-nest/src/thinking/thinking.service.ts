import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ThinkingRepository } from './repositories/thinking.repository';
import {
  AnalyzeProblemDto,
  AddThinkingStepDto,
  CompleteThinkingProcessDto,
  GetThinkingProcessDto,
  SearchThinkingProcessesDto,
  DeleteThinkingProcessDto,
  BaseMCPResponseDto,
  HealthCheckResponseDto,
} from './dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ThinkingService {
  constructor(
    private thinkingRepository: ThinkingRepository,
    private configService: ConfigService,
  ) {}

  async getHealth(): Promise<HealthCheckResponseDto> {
    // Get process count for health status
    const processCount = await this.thinkingRepository.count({});
    
    return {
      status: 'ok',
      serverId: 'thinking-mcp',
      version: '1.0.0',
      timestamp: Date.now(),
      mongodbConnected: true,
      processCount,
      uptime: Math.floor(process.uptime()),
    };
  }

  async analyzeProblem(dto: AnalyzeProblemDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { title, description, thinkingType, tags = [], storyId, contextId = 'default', metadata = {} } = payload;

    if (!title || !description) {
      throw new BadRequestException('Missing required fields: title and description');
    }

    const thinkingProcess = await this.thinkingRepository.create({
      userId,
      title,
      description,
      thinkingType,
      tags,
      storyId,
      contextId,
      metadata,
      steps: [],
      conclusions: [],
      status: 'in_progress',
      timestamp: Date.now(),
    });

    return {
      serverId: 'thinking-mcp',
      action: 'analyze',
      status: 'success',
      payload: {
        processId: thinkingProcess._id.toString(),
        title: thinkingProcess.title,
        description: thinkingProcess.description,
        thinkingType: thinkingProcess.thinkingType,
        status: thinkingProcess.status,
        tags: thinkingProcess.tags,
        storyId: thinkingProcess.storyId,
        contextId: thinkingProcess.contextId,
        metadata: thinkingProcess.metadata,
        steps: thinkingProcess.steps,
        conclusions: thinkingProcess.conclusions,
      },
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
    };
  }

  async addThinkingStep(dto: AddThinkingStepDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { processId, title, content, reasoning, conclusion, index } = payload;

    if (!processId) {
      throw new BadRequestException('Missing required field: processId');
    }

    const thinkingProcess = await this.thinkingRepository.findById(processId, userId);
    if (!thinkingProcess) {
      throw new NotFoundException(`Thinking process not found with ID: ${processId}`);
    }

    if (thinkingProcess.status === 'completed') {
      throw new BadRequestException('Cannot add steps to a completed thinking process');
    }

    const step = {
      index,
      title,
      content,
      reasoning,
      conclusion,
    };

    const updatedProcess = await this.thinkingRepository.addStep(processId, userId, step);

    return {
      serverId: 'thinking-mcp',
      action: 'addStep',
      status: 'success',
      payload: {
        processId: updatedProcess._id.toString(),
        step,
        stepCount: updatedProcess.steps.length,
      },
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
    };
  }

  async completeThinkingProcess(dto: CompleteThinkingProcessDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { processId, conclusions } = payload;

    if (!processId) {
      throw new BadRequestException('Missing required field: processId');
    }

    const thinkingProcess = await this.thinkingRepository.findById(processId, userId);
    if (!thinkingProcess) {
      throw new NotFoundException(`Thinking process not found with ID: ${processId}`);
    }

    if (thinkingProcess.status === 'completed') {
      throw new BadRequestException('Thinking process is already completed');
    }

    const updatedProcess = await this.thinkingRepository.completeProcess(processId, userId, conclusions);

    return {
      serverId: 'thinking-mcp',
      action: 'complete',
      status: 'success',
      payload: {
        processId: updatedProcess._id.toString(),
        title: updatedProcess.title,
        conclusions: updatedProcess.conclusions,
        status: updatedProcess.status,
        stepCount: updatedProcess.steps.length,
      },
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
    };
  }

  async getThinkingProcess(dto: GetThinkingProcessDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { processId } = payload;

    if (!processId) {
      throw new BadRequestException('Missing required field: processId');
    }

    const thinkingProcess = await this.thinkingRepository.findById(processId, userId);
    if (!thinkingProcess) {
      throw new NotFoundException(`Thinking process not found with ID: ${processId}`);
    }

    return {
      serverId: 'thinking-mcp',
      action: 'getProcess',
      status: 'success',
      payload: {
        processId: thinkingProcess._id.toString(),
        title: thinkingProcess.title,
        description: thinkingProcess.description,
        thinkingType: thinkingProcess.thinkingType,
        status: thinkingProcess.status,
        tags: thinkingProcess.tags,
        storyId: thinkingProcess.storyId,
        contextId: thinkingProcess.contextId,
        metadata: thinkingProcess.metadata,
        steps: thinkingProcess.steps,
        conclusions: thinkingProcess.conclusions,
        timestamp: thinkingProcess.timestamp,
      },
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
    };
  }

  async searchThinkingProcesses(dto: SearchThinkingProcessesDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { query, thinkingType, status, tags, storyId, contextId } = payload;

    const filter = await this.thinkingRepository.buildSearchFilter({
      userId,
      query,
      thinkingType,
      status,
      tags,
      storyId,
      contextId,
    });

    const processes = await this.thinkingRepository.findMany(filter);

    return {
      serverId: 'thinking-mcp',
      action: 'search',
      status: 'success',
      payload: {
        processes: processes.map(process => ({
          id: process._id.toString(),
          title: process.title,
          description: process.description,
          thinkingType: process.thinkingType,
          status: process.status,
          tags: process.tags,
          storyId: process.storyId,
          contextId: process.contextId,
          stepCount: process.steps.length,
          timestamp: process.timestamp,
        })),
      },
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
    };
  }

  async deleteThinkingProcess(dto: DeleteThinkingProcessDto): Promise<BaseMCPResponseDto> {
    const { userId, payload, requestId } = dto;
    const { processId } = payload;

    if (!processId) {
      throw new BadRequestException('Missing required field: processId');
    }

    const deleted = await this.thinkingRepository.delete(processId, userId);
    
    if (!deleted) {
      throw new NotFoundException(`Thinking process not found with ID: ${processId}`);
    }

    return {
      serverId: 'thinking-mcp',
      action: 'delete',
      status: 'success',
      payload: {
        processId,
      },
      requestId,
      responseId: this.generateResponseId(),
      timestamp: Date.now(),
    };
  }

  private generateResponseId(): string {
    return 'res_' + Math.random().toString(36).substring(2, 15);
  }
}
