import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckResponseDto {
  @ApiProperty({ 
    description: 'Status of the server', 
    example: 'ok', 
    enum: ['ok', 'error', 'degraded'] 
  })
  status: string;

  @ApiProperty({ 
    description: 'ID of the MCP server', 
    example: 'memory-mcp' 
  })
  serverId: string;

  @ApiProperty({ 
    description: 'Version of the MCP server', 
    example: '1.0.0' 
  })
  version: string;

  @ApiProperty({ 
    description: 'Timestamp of the health check', 
    example: 1682481632000 
  })
  timestamp: number;

  @ApiProperty({ 
    description: 'MongoDB connection status', 
    example: true,
    required: false
  })
  mongodbConnected?: boolean;

  @ApiProperty({ 
    description: 'Memory count in database', 
    example: 42,
    required: false
  })
  memoryCount?: number;

  @ApiProperty({ 
    description: 'System uptime in seconds', 
    example: 3600,
    required: false
  })
  uptime?: number;
}
