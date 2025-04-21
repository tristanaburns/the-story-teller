/**
 * Main application controller for Sequential Thinking MCP Server.
 * This controller handles basic application endpoints like health checks.
 */

import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get service health status' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns the health status of the service',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        serverId: { type: 'string', example: 'sequential-thinking-mcp' },
        version: { type: 'string', example: '1.0.0' },
        uptime: { type: 'number', example: 3600 },
        timestamp: { type: 'string', format: 'date-time' }
      }
    }
  })
  getHealth() {
    return this.appService.getHealth();
  }
} 