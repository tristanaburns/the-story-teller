import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from './api-key.strategy';
import { ApiKeyGuard } from './api-key.guard';

@Module({
  imports: [ConfigModule],
  providers: [ApiKeyStrategy, ApiKeyGuard],
  exports: [ApiKeyStrategy, ApiKeyGuard],
})
export class AuthModule {}
