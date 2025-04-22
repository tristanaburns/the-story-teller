/**
 * logFunction.ts
 * 
 * A utility for wrapping standalone functions with logging
 * Similar to the LogMethod decorator but for use with regular functions
 */

import { createLogger, LogLevel } from '../logger';

/**
 * Wraps a function with debug logging for inputs and outputs
 * Useful for standalone functions, callbacks, and handlers
 * 
 * @param fn The function to wrap with logging
 * @param functionName Name for the function in logs
 * @param component Component or module name for context
 * @param level Log level for normal execution (defaults to DEBUG)
 * @param errorLevel Log level for errors (defaults to ERROR)
 * @returns The wrapped function with logging
 */
export function logFunction<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  component: string = 'Function',
  level: LogLevel = LogLevel.DEBUG,
  errorLevel: LogLevel = LogLevel.ERROR
): T {
  // Create a logger with the component and function name
  const logger = createLogger(`${component}.${functionName}`);
  
  return ((...args: Parameters<T>): ReturnType<T> => {
    // Log function call with parameters
    logger.log(level, `${functionName} called`, { 
      functionParams: args,
      method: functionName
    });
    
    try {
      // Call the original function
      const result = fn(...args) as ReturnType<T>;
      
      // Handle promises/async functions
      if (result instanceof Promise) {
        return result
          .then((asyncResult) => {
            // Log successful completion with result
            logger.log(level, `${functionName} completed successfully`, { 
              functionResult: asyncResult,
              method: functionName
            });
            return asyncResult;
          })
          .catch((error) => {
            // Log error with details
            logger.log(errorLevel, `${functionName} failed with error`, { 
              error: errorToObject(error),
              functionParams: args,
              method: functionName
            });
            throw error;
          }) as ReturnType<T>;
      }
      
      // Handle synchronous functions
      logger.log(level, `${functionName} completed successfully`, { 
        functionResult: result,
        method: functionName
      });
      return result;
    } catch (error) {
      // Log error with details
      logger.log(errorLevel, `${functionName} failed with error`, { 
        error: errorToObject(error),
        functionParams: args,
        method: functionName
      });
      throw error;
    }
  }) as T;
}

/**
 * Shorthand for wrapping with trace level
 */
export function logFunctionTrace<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  component: string = 'Function'
): T {
  return logFunction(fn, functionName, component, LogLevel.TRACE);
}

/**
 * Shorthand for wrapping with debug level
 */
export function logFunctionDebug<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  component: string = 'Function'
): T {
  return logFunction(fn, functionName, component, LogLevel.DEBUG);
}

/**
 * Shorthand for wrapping with info level
 */
export function logFunctionInfo<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string,
  component: string = 'Function'
): T {
  return logFunction(fn, functionName, component, LogLevel.INFO);
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