/**
 * API Key authentication strategy for Sequential Thinking MCP Server.
 * This strategy validates API keys using passport-http-bearer.
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-http-bearer';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super();
  }

  /**
   * Validate the provided API key
   * @param token The API key to validate
   * @returns A boolean indicating if the API key is valid
   * @throws UnauthorizedException if the API key is invalid
   */
  async validate(token: string): Promise<boolean> {
    try {
      const apiKey = this.configService.get<string>('API_KEY');
      
      if (!apiKey) {
        console.warn('API_KEY is not configured in environment variables');
        throw new UnauthorizedException('API authentication is not properly configured');
      }
      
      if (token !== apiKey) {
        throw new UnauthorizedException('Invalid API key');
      }
      
      return true;
    } catch (error) {
      console.error('API key validation failed:', error.message);
      throw new UnauthorizedException('Authentication failed');
    }
  }
} 