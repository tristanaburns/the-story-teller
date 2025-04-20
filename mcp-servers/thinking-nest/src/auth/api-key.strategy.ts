import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-http-bearer';
import { AUTH_CONSTANTS } from './auth.constants';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, AUTH_CONSTANTS.API_KEY_STRATEGY) {
  private readonly logger = new Logger(ApiKeyStrategy.name);

  constructor(private configService: ConfigService) {
    super();
  }

  async validate(apiKey: string): Promise<any> {
    const isApiKeyRequired = this.configService.get<string>('API_KEY_REQUIRED', 'false') === 'true';
    
    if (isApiKeyRequired) {
      const validApiKey = this.configService.get<string>('API_KEY');
      
      if (!validApiKey) {
        this.logger.error('API key validation is enabled but no API key is configured');
        throw new UnauthorizedException('API key validation is enabled but no API key is configured');
      }
      
      if (apiKey !== validApiKey) {
        this.logger.warn('Invalid API key provided in request');
        throw new UnauthorizedException('Invalid API key');
      }

      this.logger.debug('API key validation successful');
    } else {
      this.logger.debug('API key validation is disabled');
    }

    // If we get here, the API key is valid or not required
    return { isValid: true };
  }
}
