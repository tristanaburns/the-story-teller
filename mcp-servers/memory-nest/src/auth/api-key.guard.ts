import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { AUTH_CONSTANTS } from './auth.constants';

@Injectable()
export class ApiKeyGuard extends AuthGuard(AUTH_CONSTANTS.API_KEY_STRATEGY) {
  private readonly logger = new Logger(ApiKeyGuard.name);

  constructor(private configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isApiKeyRequired = this.configService.get<string>('API_KEY_REQUIRED', 'false') === 'true';
    
    // If API key validation is not required, allow the request
    if (!isApiKeyRequired) {
      this.logger.debug('API key validation is disabled, skipping check');
      return true;
    }
    
    // Otherwise, use the passport strategy
    this.logger.debug('API key validation is enabled, checking key');
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      const action = request.body?.action || 'unknown';
      const requestId = request.body?.requestId || 'unknown';
      
      this.logger.error(`Authentication failed for action: ${action}, requestId: ${requestId}`);
      
      // Generate a standardized error response
      const errorResponse = {
        serverId: 'memory-mcp',
        action,
        status: 'error',
        error: 'Unauthorized: Invalid API key',
        requestId,
        responseId: 'res_' + Math.random().toString(36).substring(2, 15),
        timestamp: Date.now(),
        payload: null
      };
      
      throw new UnauthorizedException(errorResponse);
    }
    
    return user;
  }
}
