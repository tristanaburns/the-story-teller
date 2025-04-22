/**
 * Main application module for Sequential Thinking MCP Server.
 * This module imports and configures all necessary dependencies and sub-modules.
 * It sets up the MongoDB connection, imports feature modules, and registers controllers and providers.
 */

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThinkingModule } from './thinking/thinking.module';
import { AuthModule } from './auth/auth.module';
import { MCPLoggerModule } from '../../shared/logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        dbName: configService.get<string>('MONGODB_DB_NAME', 'sequential-thinking-mcp'),
      }),
    }),
    MCPLoggerModule.forRoot({
      useGlobalInterceptor: true,
      consoleLogLevel: process.env.LOG_LEVEL || 'debug',
      mongoLogLevel: process.env.MONGODB_LOG_LEVEL || 'info',
      disableMongoTransport: process.env.DISABLE_MONGO_LOGGING === 'true',
    }),
    ThinkingModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {} 