/**
 * Method Logger Decorator for NestJS
 * Provides automatic method logging with timing and parameter tracking
 */

import { MCPLoggerService } from './mcp-logger.service';

/**
 * Options for the method logger decorator
 */
export interface LogMethodOptions {
  /**
   * Log level to use (default: 'debug')
   */
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  
  /**
   * Whether to log method parameters (default: true)
   */
  logParameters?: boolean;
  
  /**
   * Whether to log method return value (default: true)
   */
  logResult?: boolean;
  
  /**
   * Parameter names to redact from logs
   */
  redactParameters?: string[];
  
  /**
   * Properties in the result to redact from logs
   */
  redactResult?: string[];
  
  /**
   * Whether to log execution time (default: true)
   */
  logExecutionTime?: boolean;
  
  /**
   * Whether to log exceptions (default: true)
   */
  logExceptions?: boolean;
}

/**
 * Default options for method logging
 */
const defaultOptions: LogMethodOptions = {
  level: 'debug',
  logParameters: true,
  logResult: true,
  redactParameters: [],
  redactResult: [],
  logExecutionTime: true,
  logExceptions: true,
};

/**
 * Decorator for logging method execution with timing and parameters
 */
export function LogMethod(options: LogMethodOptions = {}) {
  const methodOptions = { ...defaultOptions, ...options };
  
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      // Get logger instance
      const logger: MCPLoggerService = this.logger;
      
      if (!logger) {
        console.warn(
          `LogMethod decorator used on ${propertyKey} without logger instance`,
        );
        return originalMethod.apply(this, args);
      }
      
      // Start timer
      const start = performance.now();
      
      // Sanitize parameters
      const sanitizedParams = methodOptions.logParameters
        ? sanitizeData(args, methodOptions.redactParameters || [])
        : undefined;
      
      // Log method entry
      logger[methodOptions.level || 'debug'](
        `Enter: ${propertyKey}`,
        {
          method: propertyKey,
          parameters: sanitizedParams,
        },
      );
      
      try {
        // Call original method
        const result = await originalMethod.apply(this, args);
        
        // Calculate execution time
        const executionTime = methodOptions.logExecutionTime
          ? performance.now() - start
          : undefined;
        
        // Sanitize result
        const sanitizedResult = methodOptions.logResult
          ? sanitizeData(result, methodOptions.redactResult || [])
          : undefined;
        
        // Log method exit
        logger[methodOptions.level || 'debug'](
          `Exit: ${propertyKey}`,
          {
            method: propertyKey,
            duration: executionTime,
            result: sanitizedResult,
          },
        );
        
        return result;
      } catch (error) {
        // Calculate execution time
        const executionTime = methodOptions.logExecutionTime
          ? performance.now() - start
          : undefined;
        
        // Log exception
        if (methodOptions.logExceptions) {
          logger.error(
            `Exception in ${propertyKey}`,
            error instanceof Error ? error.stack : String(error),
            {
              method: propertyKey,
              duration: executionTime,
              parameters: sanitizedParams,
              error: {
                message: error instanceof Error ? error.message : String(error),
                name: error instanceof Error ? error.name : 'Unknown Error',
              },
            },
          );
        }
        
        // Re-throw the error
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Decorator for logging all methods in a class
 */
export function LogClass(options: LogMethodOptions = {}) {
  return function (constructor: any) {
    // Get all property names from the prototype
    const propertyNames = Object.getOwnPropertyNames(constructor.prototype);
    
    // Apply LogMethod decorator to each method
    for (const propertyName of propertyNames) {
      // Skip constructor
      if (propertyName === 'constructor') {
        continue;
      }
      
      // Get property descriptor
      const descriptor = Object.getOwnPropertyDescriptor(
        constructor.prototype,
        propertyName,
      );
      
      // Skip if not a method or undefined
      if (!descriptor || typeof descriptor.value !== 'function') {
        continue;
      }
      
      // Apply LogMethod decorator
      const decoratedDescriptor = LogMethod(options)(
        constructor.prototype,
        propertyName,
        descriptor,
      );
      
      // Update the descriptor
      Object.defineProperty(
        constructor.prototype,
        propertyName,
        decoratedDescriptor,
      );
    }
  };
}

/**
 * Sanitize data for logging by redacting sensitive fields
 */
function sanitizeData(data: any, redactFields: string[] = []): any {
  if (data === null || data === undefined) {
    return data;
  }
  
  // Handle primitive types
  if (
    typeof data === 'string' ||
    typeof data === 'number' ||
    typeof data === 'boolean'
  ) {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, redactFields));
  }
  
  // Handle objects
  if (typeof data === 'object') {
    const result = { ...data };
    
    for (const key in result) {
      // Check if key should be redacted
      if (
        redactFields.includes(key) ||
        key.toLowerCase().includes('password') ||
        key.toLowerCase().includes('token') ||
        key.toLowerCase().includes('secret') ||
        key.toLowerCase().includes('key') ||
        key.toLowerCase().includes('auth')
      ) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        // Recursively sanitize nested objects
        result[key] = sanitizeData(result[key], redactFields);
      } else if (typeof result[key] === 'function') {
        // Replace functions with placeholder
        result[key] = '[Function]';
      }
    }
    
    return result;
  }
  
  // Default: return as is
  return data;
}
