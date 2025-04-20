import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ status: 200, description: 'Server is healthy' })
  getHealth(): { status: string; timestamp: string; version: string } {
    return this.appService.getHealth();
  }
}
