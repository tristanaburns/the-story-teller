/**
 * NestJS Logger Service for MCP servers
 * Provides a unified logging interface with MongoDB storage,
 * correlation ID tracking, and detailed context logging
 */

import { Injectable, LoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as MongoDB from 'winston-mongodb';
import { v4 as uuidv4 } from 'uuid';
import { ClsService } from 'nestjs-cls';

// Custom trace level for Winston
const customLevels = {
  levels: {
    trace: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    fatal: 0,
  },
  colors: {
    trace: 'gray',
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red',
    fatal: 'magenta',
  },
};

/**
 * Interface for logger metadata
 */
export interface LoggerMetadata {
  [key: string]: any;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  component?: string;
  method?: string;
  mcpServer?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  clientInfo?: {
    ip?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
  };
}

/**
 * MCP Logger Service for NestJS applications
 * Provides unified logging across all MCP servers
 */
@Injectable({ scope: Scope.TRANSIENT })
export class MCPLoggerService implements LoggerService {
  private context: string;
  private correlationId?: string;
  private logger: winston.Logger;
  
  /**
   * Create a new logger instance
   */
  constructor(
    private configService: ConfigService,
    private readonly clsService: ClsService,
  ) {
    this.initializeLogger();
  }
  
  /**
   * Initialize the Winston logger with transports
   */
  private initializeLogger() {
    // Default format
    const logFormat = winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );
    
    // Create Winston logger
    this.logger = winston.createLogger({
      levels: customLevels.levels,
      format: logFormat,
      defaultMeta: {
        environment: this.configService.get<string>('NODE_ENV', 'development'),
        appVersion: this.configService.get<string>('APP_VERSION', '1.0.0'),
        mcpServer: this.configService.get<string>('MCP_SERVER_NAME', 'unknown'),
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize({ colors: customLevels.colors }),
            winston.format.timestamp(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              const formattedContext = context ? `[${context}] ` : '';
              const formattedCorrelationId = meta.correlationId ? `(${meta.correlationId}) ` : '';
              
              return `${timestamp} ${level}: ${formattedContext}${formattedCorrelationId}${message}`;
            }),
          ),
          level: this.configService.get<string>('LOG_LEVEL', 'info'),
        }),
      ],
    });
    
    // Add MongoDB transport if configured
    const mongoUri = this.configService.get<string>('MONGODB_URI');
    const mongoEnabled = this.configService.get<boolean>('MONGODB_LOGGING_ENABLED', true);
    
    if (mongoUri && mongoEnabled) {
      this.logger.add(
        new winston.transports.MongoDB({
          db: mongoUri,
          collection: 'logs',
          options: {
            useUnifiedTopology: true,
          },
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
          level: this.configService.get<string>('MONGODB_LOG_LEVEL', 'info'),
          storeHost: true,
          decolorize: true,
        }),
      );
    }
  }
  
  /**
   * Set the context for this logger
   */
  setContext(context: string): this {
    this.context = context;
    return this;
  }
  
  /**
   * Set a correlation ID for this logger
   */
  setCorrelationId(correlationId: string): this {
    this.correlationId = correlationId;
    return this;
  }
  
  /**
   * Get the current correlation ID from context or this instance
   */
  getCorrelationId(): string {
    // Try to get correlation ID from ClsService
    const clsCorrelationId = this.clsService.get<string>('correlationId');
    
    // Use instance correlation ID if ClsService doesn't have one
    return clsCorrelationId || this.correlationId || uuidv4();
  }
  
  /**
   * Prepare metadata for logging
   */
  private prepareMetadata(metadata?: LoggerMetadata): Record<string, any> {
    const correlationId = 
      metadata?.correlationId || 
      this.getCorrelationId();
    
    // Get request ID from context or metadata
    const requestId = 
      metadata?.requestId || 
      this.clsService.get<string>('requestId');
    
    // Get user ID from context or metadata
    const userId = 
      metadata?.userId || 
      this.clsService.get<string>('userId');
    
    return {
      context: this.context,
      correlationId,
      requestId,
      userId,
      ...metadata,
    };
  }
  
  /**
   * Log a message at the specified level
   */
  log(message: string, metadata?: LoggerMetadata): void {
    this.logWithLevel('info', message, metadata);
  }
  
  /**
   * Log a trace level message
   */
  trace(message: string, metadata?: LoggerMetadata): void {
    this.logWithLevel('trace', message, metadata);
  }
  
  /**
   * Log a debug level message
   */
  debug(message: string, metadata?: LoggerMetadata): void {
    this.logWithLevel('debug', message, metadata);
  }
  
  /**
   * Log an info level message
   */
  info(message: string, metadata?: LoggerMetadata): void {
    this.logWithLevel('info', message, metadata);
  }
  
  /**
   * Log a warning level message
   */
  warn(message: string, metadata?: LoggerMetadata): void {
    this.logWithLevel('warn', message, metadata);
  }
  
  /**
   * Log an error level message
   */
  error(message: string, trace?: string, metadata?: LoggerMetadata): void {
    const metaWithTrace = {
      ...(metadata || {}),
      trace,
    };
    
    this.logWithLevel('error', message, metaWithTrace);
  }
  
  /**
   * Log a fatal level message
   */
  fatal(message: string, trace?: string, metadata?: LoggerMetadata): void {
    const metaWithTrace = {
      ...(metadata || {}),
      trace,
    };
    
    this.logWithLevel('fatal', message, metaWithTrace);
  }
  
  /**
   * Log a message with the specified level
   */
  private logWithLevel(
    level: string,
    message: string,
    metadata?: LoggerMetadata,
  ): void {
    const preparedMetadata = this.prepareMetadata(metadata);
    
    this.logger.log(level, message, preparedMetadata);
  }
  
  /**
   * Track method execution time
   */
  trackMethod(methodName: string, level: string = 'debug') {
    const start = performance.now();
    const correlationId = this.getCorrelationId();
    
    this.logWithLevel(level, `${methodName} started`, {
      correlationId,
      method: methodName,
    });
    
    return {
      end: (result?: any) => {
        const duration = performance.now() - start;
        
        this.logWithLevel(level, `${methodName} completed`, {
          correlationId,
          method: methodName,
          duration,
          result: this.sanitizeResult(result),
        });
        
        return result;
      },
      
      error: (error: Error) => {
        const duration = performance.now() - start;
        
        this.error(
          `${methodName} failed after ${duration.toFixed(2)}ms`,
          error.stack,
          {
            correlationId,
            method: methodName,
            duration,
            error: {
              message: error.message,
              name: error.name,
            },
          },
        );
        
        throw error;
      },
    };
  }
  
  /**
   * Create a child logger with the specified context
   */
  createChildLogger(childContext: string): MCPLoggerService {
    const childLogger = new MCPLoggerService(this.configService, this.clsService);
    
    // Set the context to include the parent context
    const fullContext = this.context 
      ? `${this.context}:${childContext}` 
      : childContext;
    
    childLogger.setContext(fullContext);
    
    // Inherit correlation ID
    if (this.correlationId) {
      childLogger.setCorrelationId(this.correlationId);
    }
    
    return childLogger;
  }
  
  /**
   * Sanitize result for logging
   */
  private sanitizeResult(result: any): any {
    if (!result || typeof result !== 'object') {
      return result;
    }
    
    // Skip if result is a primitive type
    if (
      result === null ||
      typeof result === 'string' ||
      typeof result === 'number' ||
      typeof result === 'boolean'
    ) {
      return result;
    }
    
    // Handle arrays
    if (Array.isArray(result)) {
      if (result.length > 10) {
        return `Array(${result.length})`;
      }
      return result.map(item => this.sanitizeResult(item));
    }
    
    // Handle objects
    const sanitized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(result)) {
      // Skip sensitive fields
      if (
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('auth')
      ) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize objects
        sanitized[key] = this.sanitizeResult(value);
      } else if (typeof value === 'function') {
        // Skip functions
        sanitized[key] = '[Function]';
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }
}
