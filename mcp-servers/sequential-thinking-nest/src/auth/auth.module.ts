/**
 * Authentication module for Sequential Thinking MCP Server.
 * This module provides API key authentication for securing endpoints.
 */

import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ApiKeyStrategy } from './strategies/api-key.strategy';
import { AuthGuard } from './guards/auth.guard';

@Module({
  imports: [
    PassportModule,
    ConfigModule
  ],
  providers: [ApiKeyStrategy, AuthGuard],
  exports: [AuthGuard]
})
export class AuthModule {} 