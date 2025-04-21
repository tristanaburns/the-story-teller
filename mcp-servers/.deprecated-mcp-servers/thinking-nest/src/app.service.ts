import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to the Sequential Thinking MCP Server. Use /api to access the Swagger documentation.';
  }
}
