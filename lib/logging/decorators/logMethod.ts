/**
 * logMethod.ts
 * 
 * A TypeScript decorator for logging function inputs and outputs
 * Automatically logs function parameters, return values, and errors
 */

import { createLogger, LogLevel } from '../logger';

/**
 * Method decorator that automatically logs function entry with parameters
 * and function exit with return value or error.
 * 
 * @param level - Log level for normal execution (defaults to DEBUG)
 * @param errorLevel - Log level for errors (defaults to ERROR)
 * @param component - Component name for the logger (defaults to the class name)
 * @returns Method decorator
 */
export function LogMethod(
  level: LogLevel = LogLevel.DEBUG,
  errorLevel: LogLevel = LogLevel.ERROR,
  component?: string
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    // Save the original method
    const originalMethod = descriptor.value;
    
    // Replace the original method with the wrapped one
    descriptor.value = function (...args: any[]) {
      // Determine component name from context if not provided
      const componentName = component || 
                            (this?.constructor?.name || target.name || 'Unknown');
      
      // Create a logger for this method
      const logger = createLogger(`${componentName}.${propertyKey}`);
      
      // Log method entry with parameters (safeSanitize prevents circular references)
      logger.log(level, `${propertyKey} called`, { 
        functionParams: safeSanitize(args),
        method: propertyKey
      });
      
      try {
        // Call the original method
        const result = originalMethod.apply(this, args);
        
        // Handle promises
        if (result instanceof Promise) {
          // For async methods
          return result.then((asyncResult) => {
            // Log successful completion with result
            logger.log(level, `${propertyKey} completed successfully`, { 
              functionResult: safeSanitize(asyncResult),
              method: propertyKey
            });
            return asyncResult;
          }).catch((error) => {
            // Log error with details
            logger.log(errorLevel, `${propertyKey} failed with error`, { 
              error: errorToObject(error),
              functionParams: safeSanitize(args),
              method: propertyKey
            });
            throw error;
          });
        } else {
          // For synchronous methods
          logger.log(level, `${propertyKey} completed successfully`, { 
            functionResult: safeSanitize(result),
            method: propertyKey
          });
          return result;
        }
      } catch (error) {
        // Log synchronous errors
        logger.log(errorLevel, `${propertyKey} failed with error`, { 
          error: errorToObject(error),
          functionParams: safeSanitize(args),
          method: propertyKey
        });
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * Method decorator for class methods with specific log level
 */
export function LogTrace() {
  return LogMethod(LogLevel.TRACE);
}

/**
 * Method decorator for class methods with DEBUG log level
 */
export function LogDebug() {
  return LogMethod(LogLevel.DEBUG);
}

/**
 * Method decorator for class methods with INFO log level
 */
export function LogInfo() {
  return LogMethod(LogLevel.INFO);
}

/**
 * Safe sanitizer that handles circular references
 */
function safeSanitize(obj: any): any {
  if (!obj) {
    return obj;
  }
  
  try {
    // Use a WeakSet to track visited objects
    const visited = new WeakSet();
    
    const replaceCircular = (value: any, key: string): any => {
      // Handle non-objects
      if (typeof value !== 'object' || value === null) {
        return value;
      }
      
      // Check for circular references
      if (visited.has(value)) {
        return '[Circular Reference]';
      }
      
      // Mark this object as visited
      visited.add(value);
      
      // Handle arrays
      if (Array.isArray(value)) {
        return value.map((item, index) => replaceCircular(item, index.toString()));
      }
      
      // Handle objects
      const result: Record<string, any> = {};
      
      // Process each property
      for (const prop in value) {
        // Skip functions and some common problematic properties
        if (typeof value[prop] === 'function' || 
            prop === 'constructor' ||
            prop === 'prototype' ||
            prop === '__proto__') {
          continue;
        }
        
        // Handle sensitive properties
        if (isPrivateOrSensitiveKey(prop)) {
          result[prop] = '[REDACTED]';
        } else {
          // Recursively process nested properties
          try {
            result[prop] = replaceCircular(value[prop], prop);
          } catch (error) {
            // If accessing a property throws an error, skip it
            result[prop] = '[Error accessing property]';
          }
        }
      }
      
      return result;
    };
    
    return replaceCircular(obj, 'root');
  } catch (error) {
    return '[Error sanitizing object]';
  }
}

/**
 * Check if a key might be private or sensitive
 */
function isPrivateOrSensitiveKey(key: string): boolean {
  const sensitivePatterns = [
    /password/i, /token/i, /secret/i, /key/i, /auth/i, 
    /cookie/i, /session/i, /credential/i, /private/i
  ];
  
  // Check if property starts with '_' or '#' (typical for private properties)
  if (key.startsWith('_') || key.startsWith('#')) {
    return true;
  }
  
  // Check against sensitive patterns
  return sensitivePatterns.some(pattern => pattern.test(key));
}

/**
 * Convert an error to a serializable object
 */
function errorToObject(error: any): Record<string, any> {
  if (!(error instanceof Error)) {
    return { message: String(error) };
  }
  
  const result: Record<string, any> = {
    name: error.name,
    message: error.message,
    stack: error.stack
  };
  
  // Include any custom properties
  for (const key in error) {
    if (Object.prototype.hasOwnProperty.call(error, key) && 
        !['name', 'message', 'stack'].includes(key)) {
      result[key] = error[key];
    }
  }
  
  return result;
} 