import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  constructor(private configService: ConfigService) {
    super(
      { header: 'Authorization', prefix: 'Api-Key ' },
      true,
      async (apiKey, done) => {
        return this.validate(apiKey, done);
      }
    );
  }

  async validate(
    apiKey: string, 
    done: (error: Error | null, data: boolean | null) => void
  ): Promise<void> {
    const validApiKey = this.configService.get<string>('API_KEY');
    
    if (validApiKey && apiKey === validApiKey) {
      done(null, true);
    } else {
      done(new UnauthorizedException('Invalid API key'), null);
    }
  }
} 