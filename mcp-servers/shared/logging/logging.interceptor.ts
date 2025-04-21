/**
 * NestJS Logging Interceptor
 * Automatically logs HTTP requests and responses with timing and correlation ID tracking
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { MCPLoggerService } from './mcp-logger.service';
import { ClsService } from 'nestjs-cls';
import { v4 as uuidv4 } from 'uuid';

/**
 * Logging Interceptor for NestJS applications
 * Automatically logs HTTP requests and responses
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly loggerService: MCPLoggerService,
    private readonly clsService: ClsService,
  ) {
    this.loggerService.setContext('HTTP');
  }
  
  /**
   * Intercept HTTP requests and log them
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }
    
    // Get HTTP context
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Get or generate correlation ID
    const correlationId =
      request.headers['x-correlation-id'] ||
      this.clsService.get<string>('correlationId') ||
      uuidv4();
    
    // Get or generate request ID
    const requestId = 
      request.headers['x-request-id'] ||
      this.clsService.get<string>('requestId') ||
      uuidv4();
    
    // Store in CLS
    this.clsService.set('correlationId', correlationId);
    this.clsService.set('requestId', requestId);
    
    // Extract user ID if available
    const userId = request.user?.id;
    if (userId) {
      this.clsService.set('userId', userId);
    }
    
    // Start time for performance measurement
    const startTime = process.hrtime();
    
    // Get route handler info
    const className = context.getClass().name;
    const handlerName = context.getHandler().name;
    
    // Get request info
    const { method, url, body, query, params, ip, headers } = request;
    
    // Sanitize request body and headers
    const sanitizedBody = this.sanitizeSensitiveData(body);
    const sanitizedHeaders = this.sanitizeSensitiveData(headers);
    
    // Log request
    this.loggerService.debug(
      `Request: ${method} ${url}`,
      {
        correlationId,
        requestId,
        userId,
        component: `${className}.${handlerName}`,
        method: handlerName,
        path: url,
        clientInfo: {
          ip,
          userAgent: headers['user-agent'],
        },
        metadata: {
          params,
          query,
          body: sanitizedBody,
          headers: sanitizedHeaders,
        },
      },
    );
    
    // Process request and log response
    return next.handle().pipe(
      tap((data) => {
        // Calculate duration
        const duration = this.calculateDuration(startTime);
        
        // Log successful response
        this.loggerService.debug(
          `Response: ${method} ${url} ${response.statusCode}`,
          {
            correlationId,
            requestId,
            userId,
            component: `${className}.${handlerName}`,
            method: handlerName,
            path: url,
            statusCode: response.statusCode,
            duration,
            clientInfo: {
              ip,
              userAgent: headers['user-agent'],
            },
            metadata: {
              responseData: this.sanitizeResponseData(data),
            },
          },
        );
        
        // Set correlation ID in response header
        response.setHeader('x-correlation-id', correlationId);
      }),
      catchError((error) => {
        // Calculate duration
        const duration = this.calculateDuration(startTime);
        
        // Get status code from HTTP exception or use 500
        const statusCode = error instanceof HttpException
          ? error.getStatus()
          : 500;
        
        // Get error response
        const errorResponse = error instanceof HttpException
          ? error.getResponse()
          : { message: error.message };
        
        // Log error
        this.loggerService.error(
          `Error: ${method} ${url} ${statusCode}`,
          error.stack,
          {
            correlationId,
            requestId,
            userId,
            component: `${className}.${handlerName}`,
            method: handlerName,
            path: url,
            statusCode,
            duration,
            clientInfo: {
              ip,
              userAgent: headers['user-agent'],
            },
            metadata: {
              params,
              query,
              body: sanitizedBody,
              errorResponse,
            },
          },
        );
        
        // Set correlation ID in response header
        response.setHeader('x-correlation-id', correlationId);
        
        // Re-throw error
        throw error;
      }),
    );
  }
  
  /**
   * Calculate duration from hrtime
   */
  private calculateDuration(startTime: [number, number]): number {
    const diff = process.hrtime(startTime);
    return diff[0] * 1000 + diff[1] / 1000000;
  }
  
  /**
   * Sanitize sensitive data in request body or headers
   */
  private sanitizeSensitiveData(data: Record<string, any>): Record<string, any> {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'auth',
      'cookie',
      'session',
    ];
    
    const result = { ...data };
    
    for (const key in result) {
      if (
        sensitiveFields.some((field) =>
          key.toLowerCase().includes(field.toLowerCase()),
        )
      ) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        result[key] = this.sanitizeSensitiveData(result[key]);
      }
    }
    
    return result;
  }
  
  /**
   * Sanitize response data for logging
   */
  private sanitizeResponseData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    // For large arrays, just log the length
    if (Array.isArray(data)) {
      if (data.length > 10) {
        return `Array with ${data.length} items`;
      }
      
      return data.map((item) => this.sanitizeResponseData(item));
    }
    
    // For objects, sanitize recursively
    const sanitized: Record<string, any> = {};
    
    for (const key in data) {
      if (typeof data[key] === 'object' && data[key] !== null) {
        sanitized[key] = this.sanitizeResponseData(data[key]);
      } else {
        sanitized[key] = data[key];
      }
    }
    
    return sanitized;
  }
}
