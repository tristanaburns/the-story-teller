/**
 * DTO for creating a thinking process in Sequential Thinking MCP Server.
 * This DTO defines the input structure for the create thinking process API.
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsEnum, IsOptional } from 'class-validator';

export class CreateThinkingDto {
  @ApiProperty({ description: 'Optional custom process ID' })
  @IsString()
  @IsOptional()
  processId?: string;

  @ApiProperty({ description: 'User ID who owns this thinking process', required: true })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Story ID this thinking process is associated with', required: false })
  @IsString()
  @IsOptional()
  storyId?: string;

  @ApiProperty({ description: 'Type of thinking process', required: true })
  @IsEnum(['character', 'plot', 'worldbuilding', 'analysis'])
  type: string;

  @ApiProperty({ description: 'Input data for the thinking process', required: true })
  @IsObject()
  input: Record<string, unknown>;
} 