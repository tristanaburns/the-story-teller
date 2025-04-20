import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString, IsOptional } from 'class-validator';

export class McpRequestDto {
  @ApiProperty({
    description: 'A unique identifier for the request',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  requestId: string;

  @ApiProperty({
    description: 'User identifier',
    example: 'usr_123456',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Story identifier',
    example: 'story_123456',
  })
  @IsString()
  storyId: string;

  @ApiProperty({
    description: 'Additional context information',
    example: {},
    required: false,
  })
  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}

export class McpResponseDto {
  @ApiProperty({
    description: 'Request identifier echoed back',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  requestId: string;

  @ApiProperty({
    description: 'Status of the request',
    example: 'success',
    enum: ['success', 'error'],
  })
  status: string;

  @ApiProperty({
    description: 'Error message if status is error',
    example: 'Error processing request',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'Response data',
    example: {},
    required: false,
  })
  data?: Record<string, any>;
}
