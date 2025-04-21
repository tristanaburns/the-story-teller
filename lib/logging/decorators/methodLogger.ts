/**
 * methodLogger.ts
 * 
 * Decorators for logging method entry, exit, parameters, and execution time
 * Supports both synchronous and asynchronous methods
 */

import { createLogger, LogLevel } from '../logger';

/**
 * Options for the method logging decorator
 */
export interface LogMethodOptions {
  level?: LogLevel;
  logParameters?: boolean;
  logResult?: boolean;
  redactParameters?: string[];
  redactResult?: string[];
  logExecutionTime?: boolean;
  logExceptions?: boolean;
  component?: string;
}

/**
 * Default options for method logging
 */
const DEFAULT_OPTIONS: LogMethodOptions = {
  level: LogLevel.DEBUG,
  logParameters: true,
  logResult: true,
  redactParameters: [],
  redactResult: [],
  logExecutionTime: true,
  logExceptions: true
};

/**
 * Function to sanitize data for logging
 * Redacts sensitive fields
 */
function sanitizeData(data: any, redactFields: string[] = []): any {
  if (!data || typeof data !== 'object') {
    return data;
  }
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(item => sanitizeData(item, redactFields));
  }
  
  // Handle objects
  const sanitized = { ...data };
  
  for (const key in sanitized) {
    // Check if the key should be redacted
    if (redactFields.includes(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeData(sanitized[key], redactFields);
    }
  }
  
  return sanitized;
}

/**
 * Decorator for logging method execution
 */
export function LogMethod(options: Partial<LogMethodOptions> = {}) {
  const methodOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const component = methodOptions.component || className;
    
    descriptor.value = function (...args: any[]) {
      // Create logger
      const logger = createLogger(component);
      
      // Sanitize parameters if needed
      const logParams = methodOptions.logParameters 
        ? sanitizeData(args, methodOptions.redactParameters)
        : undefined;
      
      // Log method entry
      logger.log(
        methodOptions.level!, 
        `Enter: ${propertyKey}`,
        { 
          method: propertyKey,
          parameters: logParams
        }
      );
      
      // Start timer
      const startTime = performance.now();
      
      try {
        // Call original method
        const result = originalMethod.apply(this, args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result.then((asyncResult) => {
            // Calculate execution time
            const executionTime = performance.now() - startTime;
            
            // Sanitize result if needed
            const logResult = methodOptions.logResult
              ? sanitizeData(asyncResult, methodOptions.redactResult)
              : undefined;
            
            // Log method exit
            logger.log(
              methodOptions.level!,
              `Exit: ${propertyKey}`,
              {
                method: propertyKey,
                executionTime: methodOptions.logExecutionTime ? executionTime : undefined,
                result: logResult
              }
            );
            
            return asyncResult;
          }).catch((error) => {
            // Calculate execution time
            const executionTime = performance.now() - startTime;
            
            // Log exception
            if (methodOptions.logExceptions) {
              logger.error(
                `Exception in ${propertyKey}`,
                {
                  method: propertyKey,
                  executionTime: methodOptions.logExecutionTime ? executionTime : undefined,
                  error: {
                    message: error.message,
                    stack: error.stack,
                    name: error.name
                  },
                  parameters: logParams
                }
              );
            }
            
            // Re-throw error
            throw error;
          });
        } else {
          // Calculate execution time
          const executionTime = performance.now() - startTime;
          
          // Sanitize result if needed
          const logResult = methodOptions.logResult
            ? sanitizeData(result, methodOptions.redactResult)
            : undefined;
          
          // Log method exit
          logger.log(
            methodOptions.level!,
            `Exit: ${propertyKey}`,
            {
              method: propertyKey,
              executionTime: methodOptions.logExecutionTime ? executionTime : undefined,
              result: logResult
            }
          );
          
          return result;
        }
      } catch (error: any) {
        // Calculate execution time
        const executionTime = performance.now() - startTime;
        
        // Log exception
        if (methodOptions.logExceptions) {
          logger.error(
            `Exception in ${propertyKey}`,
            {
              method: propertyKey,
              executionTime: methodOptions.logExecutionTime ? executionTime : undefined,
              error: {
                message: error.message,
                stack: error.stack,
                name: error.name
              },
              parameters: logParams
            }
          );
        }
        
        // Re-throw error
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Decorator for logging class method execution
 * Applied to all methods in a class
 */
export function LogClass(options: Partial<LogMethodOptions> = {}) {
  return function(constructor: any) {
    // Get all property names of the prototype
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
        propertyName
      );
      
      // Skip if not a method
      if (!descriptor || typeof descriptor.value !== 'function') {
        continue;
      }
      
      // Apply LogMethod decorator
      const decoratedDescriptor = LogMethod({
        ...options,
        component: options.component || constructor.name
      })(
        constructor.prototype,
        propertyName,
        descriptor
      );
      
      // Update the descriptor
      Object.defineProperty(
        constructor.prototype,
        propertyName,
        decoratedDescriptor
      );
    }
  };
}

/**
 * Decorator for logging property access
 */
export function LogProperty(options: Partial<LogMethodOptions> = {}) {
  const propertyOptions = { ...DEFAULT_OPTIONS, ...options };
  
  return function(target: any, propertyKey: string) {
    // Save the original property
    let value: any = target[propertyKey];
    
    // Create property accessor
    Object.defineProperty(target, propertyKey, {
      get: function() {
        // Create logger
        const logger = createLogger(propertyOptions.component || target.constructor.name);
        
        // Log property get
        logger.log(
          propertyOptions.level!,
          `Get: ${propertyKey}`,
          { property: propertyKey }
        );
        
        return value;
      },
      set: function(newValue: any) {
        // Create logger
        const logger = createLogger(propertyOptions.component || target.constructor.name);
        
        // Sanitize value if needed
        const logValue = propertyOptions.logParameters
          ? sanitizeData(newValue, propertyOptions.redactParameters)
          : undefined;
        
        // Log property set
        logger.log(
          propertyOptions.level!,
          `Set: ${propertyKey}`,
          {
            property: propertyKey,
            newValue: logValue,
            oldValue: propertyOptions.logResult
              ? sanitizeData(value, propertyOptions.redactResult)
              : undefined
          }
        );
        
        value = newValue;
      },
      enumerable: true,
      configurable: true
    });
  };
}
