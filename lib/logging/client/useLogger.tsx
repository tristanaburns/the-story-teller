/**
 * useLogger.tsx
 * 
 * A React hook for accessing the client logger in components
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ClientLogger, createClientLogger, LogLevel } from './clientLogger';

/**
 * Hook for accessing a logger in React components
 * 
 * @param context - The context name for the logger
 * @returns A client logger instance
 */
export function useClientLogger(context: string): ClientLogger {
  // Create a ref to store the logger instance
  const loggerRef = useRef<ClientLogger | null>(null);
  
  // Initialize the logger if it doesn't exist
  if (!loggerRef.current) {
    loggerRef.current = createClientLogger(context);
  }
  
  // Log component lifecycle events
  useEffect(() => {
    const logger = loggerRef.current;
    
    if (logger) {
      logger.debug('Component mounted');
      
      return () => {
        logger.debug('Component unmounted');
      };
    }
  }, []);
  
  return loggerRef.current;
}

/**
 * Hook for performance monitoring in React components
 * 
 * @param componentName - The name of the component
 * @returns An object with performance tracking methods
 */
export function usePerformanceMonitoring(componentName: string) {
  const logger = useClientLogger(`Performance:${componentName}`);
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(0);
  
  // Track render time
  useEffect(() => {
    const renderCount = ++renderCountRef.current;
    const renderTime = performance.now() - lastRenderTimeRef.current;
    
    if (renderCount > 1) {
      // Only log re-renders, not the initial render
      logger.debug(`Component re-rendered (${renderCount})`, {
        performance: {
          type: 'render',
          value: renderTime,
          metric: 'renderTime'
        },
        renderCount
      });
      
      // Log warning for slow renders
      if (renderTime > 16) { // 16ms = 60fps threshold
        logger.warn(`Slow render detected (${renderTime.toFixed(2)}ms)`, {
          performance: {
            type: 'slow-render',
            value: renderTime,
            metric: 'renderTime'
          },
          renderCount
        });
      }
    }
    
    // Update last render time for next render
    lastRenderTimeRef.current = performance.now();
  });
  
  // Create performance tracking methods
  const trackOperation = useCallback((operationName: string, level: LogLevel = LogLevel.DEBUG) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      logger.log(level, `Operation completed: ${operationName}`, {
        performance: {
          type: 'operation',
          value: duration,
          metric: operationName
        }
      });
      
      return duration;
    };
  }, [logger]);
  
  const trackAsyncOperation = useCallback(async <T,>(
    operationName: string,
    operation: Promise<T>,
    level: LogLevel = LogLevel.DEBUG
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await operation;
      const duration = performance.now() - startTime;
      
      logger.log(level, `Async operation completed: ${operationName}`, {
        performance: {
          type: 'async-operation',
          value: duration,
          metric: operationName
        }
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      logger.error(`Async operation failed: ${operationName}`, {
        error,
        performance: {
          type: 'async-operation-error',
          value: duration,
          metric: operationName
        }
      });
      
      throw error;
    }
  }, [logger]);
  
  // Return the monitoring interface
  return {
    logger,
    trackOperation,
    trackAsyncOperation,
    renderCount: renderCountRef.current
  };
}

/**
 * Hook for error handling in React components
 * 
 * @param componentName - The name of the component
 * @returns An error logging function
 */
export function useErrorLogging(componentName: string) {
  const logger = useClientLogger(`Error:${componentName}`);
  
  // Error logging function
  const logError = useCallback((
    error: Error | unknown,
    message = 'Component error',
    contextData = {}
  ) => {
    if (error instanceof Error) {
      logger.error(message, {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        context: contextData
      });
    } else {
      logger.error(message, {
        error: error,
        context: contextData
      });
    }
  }, [logger]);
  
  // Wrap a function with error logging
  const withErrorLogging = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    errorMessage = 'Function error'
  ) => {
    return (...args: T): R => {
      try {
        return fn(...args);
      } catch (error) {
        logError(error, errorMessage, { args });
        throw error;
      }
    };
  }, [logError]);
  
  // Wrap an async function with error logging
  const withAsyncErrorLogging = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    errorMessage = 'Async function error'
  ) => {
    return async (...args: T): Promise<R> => {
      try {
        return await fn(...args);
      } catch (error) {
        logError(error, errorMessage, { args });
        throw error;
      }
    };
  }, [logError]);
  
  return {
    logError,
    withErrorLogging,
    withAsyncErrorLogging
  };
}

/**
 * Hook for user interaction logging
 * 
 * @param componentName - The name of the component
 * @returns Functions for logging user interactions
 */
export function useInteractionLogging(componentName: string) {
  const logger = useClientLogger(`Interaction:${componentName}`);
  
  // Log click events
  const logClick = useCallback((
    elementName: string,
    contextData = {}
  ) => {
    logger.info(`User clicked: ${elementName}`, {
      interaction: {
        type: 'click',
        element: elementName,
        timestamp: new Date().toISOString()
      },
      context: contextData
    });
  }, [logger]);
  
  // Create a click handler with logging
  const createClickHandler = useCallback(<T extends any[]>(
    handler: (...args: T) => void,
    elementName: string,
    contextData = {}
  ) => {
    return (...args: T) => {
      logClick(elementName, contextData);
      handler(...args);
    };
  }, [logClick]);
  
  // Log form submission
  const logFormSubmit = useCallback((
    formName: string,
    contextData = {}
  ) => {
    logger.info(`Form submitted: ${formName}`, {
      interaction: {
        type: 'form_submit',
        form: formName,
        timestamp: new Date().toISOString()
      },
      context: contextData
    });
  }, [logger]);
  
  // Log navigation
  const logNavigation = useCallback((
    destination: string,
    source = 'unknown',
    contextData = {}
  ) => {
    logger.info(`Navigation: ${source} -> ${destination}`, {
      interaction: {
        type: 'navigation',
        from: source,
        to: destination,
        timestamp: new Date().toISOString()
      },
      context: contextData
    });
  }, [logger]);
  
  // Log user input (without capturing sensitive data)
  const logInput = useCallback((
    fieldName: string,
    inputType: string,
    contextData = {}
  ) => {
    logger.debug(`User input: ${fieldName}`, {
      interaction: {
        type: 'input',
        field: fieldName,
        inputType,
        timestamp: new Date().toISOString()
      },
      context: contextData
    });
  }, [logger]);
  
  return {
    logClick,
    createClickHandler,
    logFormSubmit,
    logNavigation,
    logInput
  };
}

/**
 * Hook for feature usage logging
 * 
 * @param featureName - The name of the feature
 * @returns Functions for logging feature usage
 */
export function useFeatureLogging(featureName: string) {
  const logger = useClientLogger(`Feature:${featureName}`);
  
  // Log feature start
  const logFeatureStart = useCallback((
    action: string = 'start',
    contextData = {}
  ) => {
    logger.info(`Feature ${action}: ${featureName}`, {
      feature: {
        name: featureName,
        action,
        state: 'started',
        timestamp: new Date().toISOString()
      },
      context: contextData
    });
  }, [logger, featureName]);
  
  // Log feature completion
  const logFeatureComplete = useCallback((
    action: string = 'complete',
    result: any = null,
    contextData = {}
  ) => {
    logger.info(`Feature ${action}: ${featureName}`, {
      feature: {
        name: featureName,
        action,
        state: 'completed',
        result,
        timestamp: new Date().toISOString()
      },
      context: contextData
    });
  }, [logger, featureName]);
  
  // Log feature abandonment
  const logFeatureAbandon = useCallback((
    action: string = 'abandon',
    reason: string = 'unknown',
    contextData = {}
  ) => {
    logger.info(`Feature ${action}: ${featureName}`, {
      feature: {
        name: featureName,
        action,
        state: 'abandoned',
        reason,
        timestamp: new Date().toISOString()
      },
      context: contextData
    });
  }, [logger, featureName]);
  
  // Wrap a function with feature usage logging
  const withFeatureLogging = useCallback(<T extends any[], R>(
    fn: (...args: T) => R,
    action: string = 'execute'
  ) => {
    return (...args: T): R => {
      logFeatureStart(action, { args });
      
      try {
        const result = fn(...args);
        logFeatureComplete(action, null, { args });
        return result;
      } catch (error) {
        logFeatureAbandon(action, error instanceof Error ? error.message : 'error', { args, error });
        throw error;
      }
    };
  }, [logFeatureStart, logFeatureComplete, logFeatureAbandon]);
  
  // Wrap an async function with feature usage logging
  const withAsyncFeatureLogging = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    action: string = 'execute'
  ) => {
    return async (...args: T): Promise<R> => {
      logFeatureStart(action, { args });
      
      try {
        const result = await fn(...args);
        logFeatureComplete(action, null, { args });
        return result;
      } catch (error) {
        logFeatureAbandon(action, error instanceof Error ? error.message : 'error', { args, error });
        throw error;
      }
    };
  }, [logFeatureStart, logFeatureComplete, logFeatureAbandon]);
  
  return {
    logFeatureStart,
    logFeatureComplete,
    logFeatureAbandon,
    withFeatureLogging,
    withAsyncFeatureLogging
  };
}

export default useClientLogger;
