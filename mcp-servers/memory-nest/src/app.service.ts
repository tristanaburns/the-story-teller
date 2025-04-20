import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      serverId: 'memory-mcp',
      version: '1.0.0',
      timestamp: Date.now(),
    };
  }
}
