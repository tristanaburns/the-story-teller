import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ 
    status: 200, 
    description: 'Server is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        serverId: { type: 'string', example: 'memory-mcp' },
        version: { type: 'string', example: '1.0.0' },
        timestamp: { type: 'number', example: 1682481632000 }
      }
    }
  })
  getHealth() {
    return this.appService.getHealth();
  }
}
