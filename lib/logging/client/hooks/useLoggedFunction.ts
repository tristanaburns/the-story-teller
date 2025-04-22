/**
 * useLoggedFunction.ts
 * 
 * A hook for wrapping React functions with logging
 */

'use client';

import { useCallback } from 'react';
import { useClientLogger } from '../useLogger';

/**
 * A hook that wraps any function with debug logging for inputs and outputs
 * Particularly useful for event handlers, callbacks, and useEffect dependencies
 * 
 * @param fn The function to wrap with logging
 * @param fnName Optional name for the function (defaults to "unnamed")
 * @returns A wrapped function that logs inputs and outputs
 */
export function useLoggedFunction<T extends (...args: any[]) => any>(
  fn: T,
  fnName: string = 'unnamed'
): T {
  const logger = useClientLogger(`Function:${fnName}`);
  
  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    logger.debug(`${fnName} called`, { functionParams: args });
    
    try {
      const result = fn(...args) as ReturnType<T>;
      
      // Handle promises/async functions
      if (result instanceof Promise) {
        return result
          .then((asyncResult) => {
            logger.debug(`${fnName} completed successfully`, { functionResult: asyncResult });
            return asyncResult;
          })
          .catch((error) => {
            logger.error(`${fnName} failed with error`, { 
              error: error instanceof Error 
                ? { message: error.message, stack: error.stack } 
                : error,
              functionParams: args
            });
            throw error;
          }) as ReturnType<T>;
      }
      
      // Handle synchronous functions
      logger.debug(`${fnName} completed successfully`, { functionResult: result });
      return result;
    } catch (error) {
      logger.error(`${fnName} failed with error`, { 
        error: error instanceof Error 
          ? { message: error.message, stack: error.stack } 
          : error,
        functionParams: args
      });
      throw error;
    }
  }, [fn, fnName, logger]) as T;
}

/**
 * Hooks for common React lifecycle events
 */

/**
 * Wrapper for useEffect callback with logging
 * 
 * @param component Component name
 * @param effectName Descriptive name for the effect
 * @returns A hook that logs the execution of useEffect
 */
export function useLoggedEffect(component: string, effectName: string) {
  const logger = useClientLogger(`${component}:Effect`);
  
  return useCallback(() => {
    logger.debug(`${effectName} effect running`);
    
    // Return cleanup function
    return () => {
      logger.debug(`${effectName} effect cleanup`);
    };
  }, [effectName, logger]);
}

/**
 * Wrapper for event handlers with logging
 * 
 * @param component Component name
 * @param eventName Name of the event (e.g., "onClick", "onChange")
 * @returns A wrapped event handler with logging
 */
export function useLoggedEventHandler<E = any>(
  component: string,
  eventName: string
) {
  const logger = useClientLogger(`${component}:Event`);
  
  return useCallback((event: E) => {
    logger.debug(`${eventName} triggered`, { 
      event: event instanceof Event 
        ? { 
            type: event.type, 
            target: (event as any).target?.id || (event as any).target?.name || 'unknown'
          }
        : event 
    });
  }, [eventName, logger]);
}

/**
 * Wrapper for component state changes with logging
 * 
 * @param component Component name
 * @param stateName Name of the state variable
 * @returns A wrapped state setter function with logging
 */
export function useLoggedState<T>(
  component: string,
  stateName: string
) {
  const logger = useClientLogger(`${component}:State`);
  
  return useCallback((newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === 'function') {
      logger.debug(`${stateName} state update with function`);
    } else {
      logger.debug(`${stateName} state updated`, { 
        newValue,
      });
    }
  }, [stateName, logger]);
} 