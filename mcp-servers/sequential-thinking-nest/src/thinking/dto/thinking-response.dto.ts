/**
 * DTO for thinking process responses in Sequential Thinking MCP Server.
 * This DTO defines the structure of the responses from the thinking process API.
 */

import { ApiProperty } from '@nestjs/swagger';

export class ThinkingResponseDto {
  @ApiProperty({ description: 'Status of the response', enum: ['success', 'error'] })
  status: 'success' | 'error';

  @ApiProperty({ description: 'Message providing additional information about the response' })
  message: string;

  @ApiProperty({ description: 'Action performed', enum: ['create', 'get', 'list', 'update', 'delete'] })
  action: 'create' | 'get' | 'list' | 'update' | 'delete';

  @ApiProperty({ description: 'Payload with the response data' })
  payload: Record<string, unknown> | Array<Record<string, unknown>> | {
    processes?: Array<Record<string, unknown>>;
    pagination?: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
  };

  @ApiProperty({ 
    description: 'Error details if status is error',
    example: {
      code: 'INVALID_INPUT',
      details: 'Missing required field: userId'
    },
    required: false
  })
  error?: Record<string, unknown>;
} 