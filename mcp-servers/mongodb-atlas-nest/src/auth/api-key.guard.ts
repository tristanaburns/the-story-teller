import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly logger = new Logger(ApiKeyGuard.name);
  private readonly apiKey: string;
  private readonly apiKeyRequired: boolean;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('API_KEY');
    this.apiKeyRequired = this.configService.get<string>('API_KEY_REQUIRED') === 'true';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = request.body?.requestId || 'unknown';
    const action = request.body?.action || 'unknown';
    const providedApiKey = this.extractApiKey(request);

    // If API key is not required, allow the request
    if (!this.apiKeyRequired) {
      this.logger.debug('API key validation is disabled', {
        requestId,
        action,
        path: request.url,
        method: request.method,
      });
      return true;
    }

    // If API key is required but not provided, reject the request
    if (!providedApiKey) {
      this.logger.warn('API key missing in request', {
        requestId,
        action,
        path: request.url,
        method: request.method,
      });
      
      throw new UnauthorizedException({
        serverId: 'mongodb-atlas-mcp',
        action,
        status: 'error',
        error: 'API key is required',
        requestId,
        responseId: 'res_' + Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        payload: null,
      });
    }

    // If API key is provided but doesn't match, reject the request
    if (providedApiKey !== this.apiKey) {
      this.logger.warn('Invalid API key provided', {
        requestId,
        action,
        path: request.url,
        method: request.method,
      });
      
      throw new UnauthorizedException({
        serverId: 'mongodb-atlas-mcp',
        action,
        status: 'error',
        error: 'Invalid API key',
        requestId,
        responseId: 'res_' + Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        payload: null,
      });
    }

    // If we got here, the API key is valid
    this.logger.debug('API key validation successful', {
      requestId,
      action,
      path: request.url,
      method: request.method,
    });
    
    return true;
  }

  private extractApiKey(request: Request): string | undefined {
    // Check Authorization header (Bearer token)
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check X-API-Key header
    const apiKeyHeader = request.headers['x-api-key'];
    if (apiKeyHeader) {
      return Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    }

    // Check query parameter
    if (request.query.apiKey) {
      return request.query.apiKey as string;
    }

    // Check request body
    if (request.body?.apiKey) {
      return request.body.apiKey;
    }

    return undefined;
  }
}
