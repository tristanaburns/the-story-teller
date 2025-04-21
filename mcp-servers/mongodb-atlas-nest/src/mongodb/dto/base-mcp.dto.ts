import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject, IsIn, IsOptional } from 'class-validator';

export class BaseMCPRequestDto {
  @ApiProperty({
    description: 'The ID of the request',
    example: 'req_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  requestId: string;

  @ApiProperty({
    description: 'The action to perform',
    example: 'query',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['query', 'create', 'update', 'delete', 'schema', 'search', 'execute'])
  action: string;

  @ApiProperty({
    description: 'The user ID',
    example: 'user_1234567890',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'The API key for authentication',
    example: 'api_key_1234567890',
    required: false,
  })
  @IsString()
  @IsOptional()
  apiKey?: string;

  @ApiProperty({
    description: 'The request payload containing operation-specific data',
    type: Object,
  })
  @IsObject()
  payload: Record<string, any>;
}

export class BaseMCPResponseDto {
  @ApiProperty({
    description: 'The server ID',
    example: 'mongodb-atlas-mcp',
  })
  serverId: string;

  @ApiProperty({
    description: 'The action that was performed',
    example: 'query',
  })
  action: string;

  @ApiProperty({
    description: 'The status of the operation',
    example: 'success',
    enum: ['success', 'error']
  })
  status: 'success' | 'error';

  @ApiProperty({
    description: 'Error message if any',
    example: 'Collection not found',
    required: false,
  })
  error?: string;

  @ApiProperty({
    description: 'The ID of the request that initiated this response',
    example: 'req_1234567890',
  })
  requestId: string;

  @ApiProperty({
    description: 'The unique ID for this response',
    example: 'res_1234567890',
  })
  responseId: string;

  @ApiProperty({
    description: 'The timestamp when the response was generated',
    example: 1619712000000,
  })
  timestamp: number;

  @ApiProperty({
    description: 'The response payload containing operation-specific data',
    type: Object,
  })
  payload: Record<string, any> | null;
}

export class HealthCheckResponseDto {
  @ApiProperty({
    description: 'The status of the server',
    example: 'ok',
  })
  status: string;

  @ApiProperty({
    description: 'The timestamp when the health check was performed',
    example: '2023-04-29T12:00:00.000Z',
  })
  timestamp: string;

  @ApiProperty({
    description: 'The server uptime in seconds',
    example: '3600 seconds',
  })
  uptime: string;

  @ApiProperty({
    description: 'The server version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'The server environment',
    example: 'development',
  })
  environment: string;

  @ApiProperty({
    description: 'Memory usage information',
    type: Object,
  })
  memory: {
    total: string;
    free: string;
    usage: string;
  };

  @ApiProperty({
    description: 'Number of CPU cores',
    example: 4,
  })
  cpu: number;

  @ApiProperty({
    description: 'The server hostname',
    example: 'mongodb-atlas-mcp',
  })
  hostname: string;
}
