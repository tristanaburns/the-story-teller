import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    
    // Check if auth is disabled in development mode
    const apiAuthEnabled = this.configService.get<string>('API_AUTH_ENABLED', 'true') === 'true';
    if (!apiAuthEnabled) {
      return true;
    }
    
    const apiKey = request.headers['x-api-key'];
    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }
    
    const validApiKey = this.configService.get<string>('API_KEY');
    if (!validApiKey) {
      throw new UnauthorizedException('API authentication is not properly configured');
    }
    
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
    
    return true;
  }
}
