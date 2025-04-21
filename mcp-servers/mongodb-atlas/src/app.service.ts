import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  private readonly startTime: number;

  constructor(private readonly configService: ConfigService) {
    this.startTime = Date.now();
  }

  getInfo(): string {
    this.logger.log('Returning server info');
    return `MongoDB Atlas MCP Server for The Story Teller - Running on port ${
      this.configService.get('PORT') || 3004
    }`;
  }

  getHealth(): object {
    this.logger.log('Performing health check');
    const uptime = Math.floor((Date.now() - this.startTime) / 1000);
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: `${uptime} seconds`,
      version: process.env.npm_package_version || '1.0.0',
      environment: this.configService.get('NODE_ENV') || 'development',
      memory: {
        total: `${Math.round(os.totalmem() / 1024 / 1024)} MB`,
        free: `${Math.round(os.freemem() / 1024 / 1024)} MB`,
        usage: `${Math.round((os.totalmem() - os.freemem()) / os.totalmem() * 100)}%`,
      },
      cpu: os.cpus().length,
      hostname: os.hostname(),
    };
  }
}
