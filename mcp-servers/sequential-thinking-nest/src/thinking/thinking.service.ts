/**
 * Service for thinking process operations in Sequential Thinking MCP Server.
 * This service implements the business logic for thinking processes.
 */

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { ThinkingRepository } from './repositories/thinking.repository';
import { CreateThinkingDto } from './dto/create-thinking.dto';
import { UpdateThinkingDto } from './dto/update-thinking.dto';
import { ThinkingProcess } from './schemas/thinking.schema';
import { ThinkingResponseDto } from './dto/thinking-response.dto';
import { MCPLoggerService } from '../../../shared/logging';
import { LogClass, LogMethod } from '../../../shared/logging/method-logger.decorator';

@Injectable()
@LogClass({ level: 'debug', logParameters: true })
export class ThinkingService {
  constructor(
    private readonly thinkingRepository: ThinkingRepository,
    private readonly configService: ConfigService,
    private readonly logger: MCPLoggerService
  ) {
    this.logger.setContext('ThinkingService');
  }

  /**
   * Create a new thinking process
   * @param createThinkingDto The data for creating a thinking process
   * @returns Response with the created thinking process
   */
  @LogMethod({ level: 'debug' })
  async createThinkingProcess(createThinkingDto: CreateThinkingDto): Promise<ThinkingResponseDto> {
    try {
      const processId = createThinkingDto.processId || `thinking-${uuidv4()}`;
      
      // Check if process already exists
      const existingProcess = await this.thinkingRepository.findById(processId);
      if (existingProcess) {
        throw new BadRequestException(`Thinking process with ID ${processId} already exists`);
      }
      
      const newThinking = await this.thinkingRepository.create({
        ...createThinkingDto,
        processId,
        status: 'pending',
        progress: 0,
        steps: []
      });
      
      // Start the thinking process asynchronously
      this.processThinking(processId).catch(error => {
        this.logger.error(`Error in thinking process ${processId}: ${error.message}`, error.stack);
      });
      
      return {
        status: 'success',
        message: 'Thinking process created successfully',
        action: 'create',
        payload: this.formatThinkingProcess(newThinking)
      };
    } catch (error) {
      this.logger.error(`Failed to create thinking process: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a thinking process by ID
   * @param processId The ID of the thinking process to retrieve
   * @returns Response with the thinking process
   */
  @LogMethod({ level: 'debug' })
  async getThinkingProcess(processId: string): Promise<ThinkingResponseDto> {
    try {
      const thinking = await this.thinkingRepository.findById(processId);
      if (!thinking) {
        throw new NotFoundException(`Thinking process with ID ${processId} not found`);
      }
      
      return {
        status: 'success',
        message: 'Thinking process retrieved successfully',
        action: 'get',
        payload: this.formatThinkingProcess(thinking)
      };
    } catch (error) {
      this.logger.error(`Failed to get thinking process ${processId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get thinking processes by user ID
   * @param userId The user ID to search for
   * @param limit Maximum number of results to return
   * @param offset Number of results to skip
   * @returns Response with the thinking processes
   */
  @LogMethod({ level: 'debug' })
  async getThinkingProcessesByUserId(userId: string, limit = 10, offset = 0): Promise<ThinkingResponseDto> {
    try {
      const processes = await this.thinkingRepository.findByUserId(userId, limit, offset);
      const count = await this.thinkingRepository.countByUserId(userId);
      
      return {
        status: 'success',
        message: 'Thinking processes retrieved successfully',
        action: 'list',
        payload: {
          processes: processes.map(this.formatThinkingProcess),
          pagination: {
            total: count,
            limit,
            offset,
            hasMore: offset + processes.length < count
          }
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get thinking processes for user ${userId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get thinking processes by story ID
   * @param storyId The story ID to search for
   * @param limit Maximum number of results to return
   * @param offset Number of results to skip
   * @returns Response with the thinking processes
   */
  @LogMethod({ level: 'debug' })
  async getThinkingProcessesByStoryId(storyId: string, limit = 10, offset = 0): Promise<ThinkingResponseDto> {
    try {
      const processes = await this.thinkingRepository.findByStoryId(storyId, limit, offset);
      const count = await this.thinkingRepository.countByStoryId(storyId);
      
      return {
        status: 'success',
        message: 'Thinking processes retrieved successfully',
        action: 'list',
        payload: {
          processes: processes.map(this.formatThinkingProcess),
          pagination: {
            total: count,
            limit,
            offset,
            hasMore: offset + processes.length < count
          }
        }
      };
    } catch (error) {
      this.logger.error(`Failed to get thinking processes for story ${storyId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Update a thinking process
   * @param processId The ID of the thinking process to update
   * @param updateThinkingDto The data for updating the thinking process
   * @returns Response with the updated thinking process
   */
  @LogMethod({ level: 'debug' })
  async updateThinkingProcess(processId: string, updateThinkingDto: UpdateThinkingDto): Promise<ThinkingResponseDto> {
    try {
      const thinking = await this.thinkingRepository.findById(processId);
      if (!thinking) {
        throw new NotFoundException(`Thinking process with ID ${processId} not found`);
      }
      
      const updateData: Partial<ThinkingProcess> = { ...updateThinkingDto };
      
      // Handle step updates
      if (updateThinkingDto.step) {
        const updatedSteps = [...thinking.steps];
        const stepIndex = updatedSteps.findIndex(s => s.stepNumber === updateThinkingDto.step.stepNumber);
        
        if (stepIndex >= 0) {
          // Update existing step
          updatedSteps[stepIndex] = {
            ...updatedSteps[stepIndex],
            ...updateThinkingDto.step
          };
        } else {
          // Add new step
          updatedSteps.push(updateThinkingDto.step);
        }
        
        updateData.steps = updatedSteps;
        // Remove step property to avoid TypeScript error
        delete updateData.steps;
      }
      
      // Update status timestamps
      if (updateThinkingDto.status === 'in-progress' && !thinking.startedAt) {
        updateData.startedAt = new Date();
      } else if (['completed', 'failed'].includes(updateThinkingDto.status) && !thinking.completedAt) {
        updateData.completedAt = new Date();
      }
      
      const updatedThinking = await this.thinkingRepository.update(processId, updateData);
      
      return {
        status: 'success',
        message: 'Thinking process updated successfully',
        action: 'update',
        payload: this.formatThinkingProcess(updatedThinking)
      };
    } catch (error) {
      this.logger.error(`Failed to update thinking process ${processId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a thinking process
   * @param processId The ID of the thinking process to delete
   * @returns Response indicating success
   */
  @LogMethod({ level: 'debug' })
  async deleteThinkingProcess(processId: string): Promise<ThinkingResponseDto> {
    try {
      const thinking = await this.thinkingRepository.findById(processId);
      if (!thinking) {
        throw new NotFoundException(`Thinking process with ID ${processId} not found`);
      }
      
      await this.thinkingRepository.delete(processId);
      
      return {
        status: 'success',
        message: 'Thinking process deleted successfully',
        action: 'delete',
        payload: { processId }
      };
    } catch (error) {
      this.logger.error(`Failed to delete thinking process ${processId}: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Format a thinking process for API responses
   * @param thinking The thinking process to format
   * @returns Formatted thinking process
   */
  @LogMethod({ level: 'trace' })
  private formatThinkingProcess(thinking: ThinkingProcess): Record<string, any> {
    if (!thinking) return null;
    
    const { 
      processId, userId, storyId, type, status, 
      input, output, error, progress, 
      startedAt, completedAt, steps
    } = thinking;
    
    const formatted = {
      processId,
      userId,
      storyId,
      type,
      status,
      progress,
      startedAt,
      completedAt,
      stepCount: steps ? steps.length : 0,
      createdAt: thinking['createdAt'],
      updatedAt: thinking['updatedAt']
    };
    
    // Include input/output/error data selectively
    if (input) formatted['input'] = input;
    if (output && Object.keys(output).length > 0) formatted['output'] = output;
    if (error) formatted['error'] = error;
    
    // Include latest steps
    if (steps && steps.length > 0) {
      formatted['latestStep'] = steps[steps.length - 1];
    }
    
    return formatted;
  }

  /**
   * Process a thinking request asynchronously
   * @param processId The ID of the thinking process to process
   */
  @LogMethod({ level: 'debug' })
  private async processThinking(processId: string): Promise<void> {
    try {
      // Update status to in-progress
      await this.thinkingRepository.update(processId, { 
        status: 'in-progress',
        startedAt: new Date(),
        progress: 10
      });
      
      const thinking = await this.thinkingRepository.findById(processId);
      if (!thinking) {
        throw new Error(`Thinking process ${processId} not found during processing`);
      }
      
      // TODO: Implement actual thinking logic here
      // This is a placeholder that simulates processing with delays
      
      // Step 1: Initial analysis
      await this.simulateProcessingStep(processId, {
        stepNumber: 1,
        type: 'initial-analysis',
        status: 'in-progress',
        input: thinking.input,
        startedAt: new Date()
      });
      
      await this.delay(2000);
      
      await this.simulateProcessingStep(processId, {
        stepNumber: 1,
        type: 'initial-analysis',
        status: 'completed',
        output: { 
          result: 'Initial analysis completed successfully',
          insights: ['Insight 1', 'Insight 2']
        },
        completedAt: new Date()
      }, 30);
      
      // Step 2: Deep processing
      await this.simulateProcessingStep(processId, {
        stepNumber: 2,
        type: 'deep-processing',
        status: 'in-progress',
        input: { 
          previousStep: 'initial-analysis',
          context: thinking.input.context
        },
        startedAt: new Date()
      });
      
      await this.delay(3000);
      
      await this.simulateProcessingStep(processId, {
        stepNumber: 2,
        type: 'deep-processing',
        status: 'completed',
        output: { 
          result: 'Deep processing completed successfully',
          recommendations: ['Recommendation 1', 'Recommendation 2']
        },
        completedAt: new Date()
      }, 70);
      
      // Step 3: Final synthesis
      await this.simulateProcessingStep(processId, {
        stepNumber: 3,
        type: 'final-synthesis',
        status: 'in-progress',
        input: { 
          previousSteps: [1, 2],
          finalContext: 'Synthesizing all findings'
        },
        startedAt: new Date()
      });
      
      await this.delay(2000);
      
      // Complete the thinking process
      await this.thinkingRepository.update(processId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        output: {
          summary: 'Thinking process completed successfully',
          keyFindings: [
            'Finding 1: The story structure is well-balanced',
            'Finding 2: Character motivations need more development',
            'Finding 3: The world building has strong elements but lacks consistency'
          ],
          recommendations: [
            'Clarify the protagonist\'s journey',
            'Develop stronger connections between characters',
            'Establish clearer rules for the story world'
          ]
        }
      });
      
      // Update the final step
      const updatedThinking = await this.thinkingRepository.findById(processId);
      const steps = updatedThinking.steps || [];
      const lastStepIndex = steps.findIndex(s => s.stepNumber === 3);
      
      if (lastStepIndex >= 0) {
        steps[lastStepIndex] = {
          ...steps[lastStepIndex],
          status: 'completed',
          output: {
            result: 'Final synthesis completed successfully',
            summary: 'All steps completed and synthesized'
          },
          completedAt: new Date()
        };
        
        await this.thinkingRepository.update(processId, { steps });
      }
      
      this.logger.log(`Thinking process ${processId} completed successfully`);
    } catch (error) {
      this.logger.error(`Error processing thinking ${processId}: ${error.message}`, error.stack);
      
      // Update the thinking process with error status
      await this.thinkingRepository.update(processId, {
        status: 'failed',
        completedAt: new Date(),
        error: {
          message: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      });
    }
  }
  
  /**
   * Simulate a processing step in the thinking process
   * @param processId The ID of the thinking process
   * @param stepData The step data to add or update
   * @param progress Optional progress update
   */
  @LogMethod({ level: 'debug' })
  private async simulateProcessingStep(
    processId: string, 
    stepData: any, 
    progress?: number
  ): Promise<void> {
    try {
      const thinking = await this.thinkingRepository.findById(processId);
      if (!thinking) {
        throw new Error(`Thinking process ${processId} not found during step processing`);
      }
      
      const steps = [...(thinking.steps || [])];
      const stepIndex = steps.findIndex(s => s.stepNumber === stepData.stepNumber);
      
      if (stepIndex >= 0) {
        // Update existing step
        steps[stepIndex] = {
          ...steps[stepIndex],
          ...stepData
        };
      } else {
        // Add new step
        steps.push(stepData);
      }
      
      const updateData: any = { steps };
      if (progress !== undefined) {
        updateData.progress = progress;
      }
      
      await this.thinkingRepository.update(processId, updateData);
    } catch (error) {
      this.logger.error(`Error in step processing for ${processId}: ${error.message}`, error.stack);
      throw error;
    }
  }
  
  /**
   * Simple delay function for simulating async processing
   * @param ms Milliseconds to delay
   */
  @LogMethod({ level: 'trace' })
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
} 
