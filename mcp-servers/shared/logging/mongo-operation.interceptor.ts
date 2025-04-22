/**
 * MongoDB Operation Interceptor
 * 
 * Provides detailed logging for MongoDB operations with timing and query details.
 * This interceptor wraps Mongoose methods to capture operation details.
 */

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Model } from 'mongoose';
import { MCPLoggerService } from './mcp-logger.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class MongoOperationInterceptor implements NestInterceptor {
  constructor(
    private readonly loggerService: MCPLoggerService,
    private readonly clsService: ClsService,
  ) {
    this.loggerService.setContext('MongoDB');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // For REST endpoints that perform MongoDB operations
    const req = context.switchToHttp().getRequest();
    if (!req) {
      return next.handle();
    }

    // Get correlation ID
    const correlationId = 
      this.clsService.get<string>('correlationId') ||
      req.headers['x-correlation-id'];
    
    // Get user ID if available
    const userId = this.clsService.get<string>('userId') || req.user?.id;
    
    // Start timing
    const startTime = process.hrtime();
    
    // Get handler metadata
    const handlerName = context.getHandler().name;
    const className = context.getClass().name;
    
    // Check if this is a MongoDB repository method
    if (className.includes('Repository')) {
      // Log MongoDB operation start
      this.loggerService.debug(`MongoDB: ${className}.${handlerName} started`, {
        correlationId,
        userId,
        component: className,
        method: handlerName,
        metadata: {
          operation: 'start',
          model: this.getModelName(context)
        }
      });
    }
    
    return next.handle().pipe(
      tap((data) => {
        // Only log for MongoDB repository methods
        if (!className.includes('Repository')) {
          return;
        }
        
        // Calculate duration
        const duration = this.calculateDuration(startTime);
        
        // Log MongoDB operation success
        this.loggerService.debug(`MongoDB: ${className}.${handlerName} completed`, {
          correlationId,
          userId,
          component: className,
          method: handlerName,
          duration,
          metadata: {
            operation: 'success',
            model: this.getModelName(context),
            resultSize: this.getResultSize(data)
          }
        });
      }),
      catchError((error) => {
        // Only log for MongoDB repository methods
        if (className.includes('Repository')) {
          // Calculate duration
          const duration = this.calculateDuration(startTime);
          
          // Log MongoDB operation error
          this.loggerService.error(
            `MongoDB: ${className}.${handlerName} failed`,
            error.stack,
            {
              correlationId,
              userId,
              component: className,
              method: handlerName,
              duration,
              metadata: {
                operation: 'error',
                model: this.getModelName(context),
                errorCode: error.code,
                errorName: error.name
              }
            }
          );
        }
        
        // Re-throw the error
        throw error;
      })
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
   * Try to extract model name from context
   */
  private getModelName(context: ExecutionContext): string {
    try {
      const instance = context.getClass().prototype;
      // Look for model properties
      const modelProps = Object.getOwnPropertyNames(instance)
        .filter(prop => prop.toLowerCase().includes('model'));
      
      if (modelProps.length > 0) {
        const modelInstance = instance[modelProps[0]];
        if (modelInstance && modelInstance.modelName) {
          return modelInstance.modelName;
        }
      }
      
      // Fall back to class name
      const className = context.getClass().name;
      if (className.includes('Repository')) {
        return className.replace('Repository', '');
      }
      
      return 'unknown';
    } catch (error) {
      return 'unknown';
    }
  }
  
  /**
   * Determine result size for logging
   */
  private getResultSize(data: any): string {
    if (!data) {
      return 'empty';
    }
    
    if (Array.isArray(data)) {
      return `array(${data.length})`;
    }
    
    if (typeof data === 'object') {
      const keys = Object.keys(data);
      return `object(${keys.length})`;
    }
    
    return typeof data;
  }
}
