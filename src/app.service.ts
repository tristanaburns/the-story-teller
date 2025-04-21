/**
 * Main application service for Sequential Thinking MCP Server.
 * This service handles basic application functionality like health checks.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as os from 'os';

@Injectable()
export class AppService {
  private startTime: Date;
  private readonly logger = new Logger(AppService.name);

  constructor(private configService: ConfigService) {
    this.startTime = new Date();
  }

  /**
   * Get service health status
   * @returns Object containing health information like status, version, and uptime
   */
  getHealth() {
    try {
      return {
        status: 'ok',
        serverId: 'sequential-thinking-mcp',
        version: '1.0.0',
        uptime: Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000),
        timestamp: new Date().toISOString(),
        memory: {
          free: os.freemem(),
          total: os.totalmem()
        },
        os: {
          platform: os.platform(),
          type: os.type(),
          release: os.release()
        }
      };
    } catch (error) {
      // Return a properly typed error response
      return {
        status: 'error',
        serverId: 'sequential-thinking-mcp',
        version: '1.0.0',
        uptime: 0,
        timestamp: new Date().toISOString(),
        memory: { free: 0, total: 0 },
        os: { platform: '', type: '', release: '' },
        errorMessage: error instanceof Error ? error.message : String(error)
      };
    }
  }
} 