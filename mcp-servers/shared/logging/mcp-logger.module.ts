/**
 * NestJS Logger Module for MCP servers
 * Provides a unified logging service with MongoDB storage and correlation ID tracking
 */

import { Module, Global, DynamicModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsModule } from 'nestjs-cls';
import { MCPLoggerService } from './mcp-logger.service';
import { LoggingInterceptor } from './logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

/**
 * Options for the MCP Logger Module
 */
export interface MCPLoggerModuleOptions {
  /**
   * Whether to register the logging interceptor globally
   */
  useGlobalInterceptor?: boolean;
  
  /**
   * Whether to disable MongoDB transport (default: false)
   */
  disableMongoTransport?: boolean;
  
  /**
   * Minimum log level for console logs (default: 'info')
   */
  consoleLogLevel?: string;
  
  /**
   * Minimum log level for MongoDB logs (default: 'info')
   */
  mongoLogLevel?: string;
}

/**
 * Global MCP Logger Module for NestJS applications
 */
@Global()
@Module({
  imports: [
    ConfigModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: (req: any) => {
          // Use existing correlation ID from header if available
          return req.headers['x-correlation-id'] || crypto.randomUUID();
        },
      },
    }),
  ],
  providers: [
    MCPLoggerService,
  ],
  exports: [
    MCPLoggerService,
  ],
})
export class MCPLoggerModule {
  /**
   * Register the MCP Logger Module with options
   */
  static forRoot(options: MCPLoggerModuleOptions = {}): DynamicModule {
    const providers = [MCPLoggerService];
    
    // Register global interceptor if requested
    if (options.useGlobalInterceptor) {
      providers.push({
        provide: APP_INTERCEPTOR,
        useClass: LoggingInterceptor,
      });
    }
    
    return {
      module: MCPLoggerModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          expandVariables: true,
          cache: true,
          load: [
            () => ({
              MONGODB_LOGGING_ENABLED: !options.disableMongoTransport,
              LOG_LEVEL: options.consoleLogLevel || 'info',
              MONGODB_LOG_LEVEL: options.mongoLogLevel || 'info',
            }),
          ],
        }),
        ClsModule.forRoot({
          global: true,
          middleware: {
            mount: true,
            generateId: true,
            idGenerator: (req: any) => {
              // Use existing correlation ID from header if available
              return req.headers['x-correlation-id'] || crypto.randomUUID();
            },
          },
        }),
      ],
      providers,
      exports: [MCPLoggerService],
    };
  }
}
