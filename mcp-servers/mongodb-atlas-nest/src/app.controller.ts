import { Controller, Get, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);
  
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get server info' })
  @ApiResponse({ status: 200, description: 'Welcome message and server info' })
  getInfo(): string {
    this.logger.log('Getting server info');
    return this.appService.getInfo();
  }

  @Get('health')
  @ApiOperation({ summary: 'Check server health' })
  @ApiResponse({ status: 200, description: 'Health check response' })
  getHealth(): object {
    this.logger.log('Health check requested');
    return this.appService.getHealth();
  }
}
