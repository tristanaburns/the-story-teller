import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ description: 'Server status', example: 'ok', enum: ['ok', 'error'] })
  status: 'ok' | 'error';

  @ApiProperty({ description: 'Server ID', example: 'thinking-mcp' })
  serverId: string;

  @ApiProperty({ description: 'Server version', example: '1.0.0' })
  version: string;

  @ApiProperty({ description: 'Current timestamp', example: 1682481632000 })
  timestamp: number;

  @ApiProperty({ description: 'MongoDB connection status', example: true })
  mongodbConnected: boolean;

  @ApiProperty({ description: 'Number of thinking processes in the database', example: 42 })
  processCount: number;

  @ApiProperty({ description: 'Server uptime in seconds', example: 3600 })
  uptime: number;
}
