/**
 * DTO for updating a thinking process in Sequential Thinking MCP Server.
 * This DTO defines the input structure for the update thinking process API.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject, IsEnum, IsNumber, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ThinkingStepDto {
  @ApiProperty({ description: 'Step number in the sequence' })
  @IsNumber()
  stepNumber: number;

  @ApiProperty({ description: 'Type of this step' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Status of this step' })
  @IsEnum(['pending', 'in-progress', 'completed', 'failed'])
  status: string;

  @ApiProperty({ description: 'Input data for this step', required: false })
  @IsObject()
  @IsOptional()
  input?: Record<string, unknown>;

  @ApiProperty({ description: 'Output data from this step', required: false })
  @IsObject()
  @IsOptional()
  output?: Record<string, unknown>;
}

export class UpdateThinkingDto {
  @ApiProperty({ 
    description: 'Current status of the thinking process',
    example: 'in-progress',
    enum: ['pending', 'in-progress', 'completed', 'failed'],
    required: false
  })
  @IsOptional()
  @IsString()
  @IsEnum(['pending', 'in-progress', 'completed', 'failed'])
  status?: string;

  @ApiProperty({ 
    description: 'Output data from the thinking process',
    example: {
      analysis: 'The story has a strong protagonist but lacks a clear antagonist.',
      suggestions: ['Develop a more complex villain', 'Add more conflict in the middle act']
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  output?: Record<string, unknown>;

  @ApiProperty({ 
    description: 'Error details if the process failed',
    example: {
      message: 'Failed to process the thinking step',
      step: 'character-analysis',
      details: 'Insufficient data provided for character analysis'
    },
    required: false
  })
  @IsOptional()
  @IsObject()
  error?: Record<string, unknown>;

  @ApiProperty({ 
    description: 'Progress of the thinking process (0-100)',
    example: 75,
    minimum: 0,
    maximum: 100,
    required: false
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiProperty({ 
    description: 'Timestamp when the thinking process started',
    example: '2023-05-23T14:56:29.503Z',
    required: false
  })
  @IsOptional()
  startedAt?: Date;

  @ApiProperty({ 
    description: 'Timestamp when the thinking process completed',
    example: '2023-05-23T15:12:45.789Z',
    required: false
  })
  @IsOptional()
  completedAt?: Date;

  @ApiProperty({ description: 'Step data to add or update', required: false })
  @ValidateNested()
  @Type(() => ThinkingStepDto)
  @IsOptional()
  step?: ThinkingStepDto;
} 