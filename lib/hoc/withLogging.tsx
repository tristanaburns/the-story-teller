/**
 * withLogging.tsx
 * 
 * A Higher-Order Component (HOC) that adds logging capabilities to React components
 */

import React, { useEffect } from 'react';
import { createLogger, LogLevel, Logger } from '@/lib/logging';

// Props added by the logging HOC
export interface LoggingProps {
  logger: Logger;
}

/**
 * Wraps a component with logging functionality
 * 
 * @param WrappedComponent - The component to enhance with logging
 * @param componentName - Optional name override for the component
 * @param logLevel - Optional log level for component logs
 * @returns A new component with logging capabilities
 */
export function withLogging<P extends object>(
  WrappedComponent: React.ComponentType<P & Partial<LoggingProps>>,
  componentName?: string,
  logLevel: LogLevel = LogLevel.DEBUG
): React.FC<Omit<P, keyof LoggingProps>> {
  // Get the display name for the wrapped component
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  // Create a logger for this component
  const logger = createLogger(`Component:${displayName}`);
  
  // Create the wrapped component
  const WithLogging: React.FC<P> = (props: P) => {
    // Log component mount
    useEffect(() => {
      logger.debug('Component mounted', { 
        props: sanitizeProps(props)
      });
      
      // Log component unmount
      return () => {
        logger.debug('Component unmounted');
      };
    }, []);
    
    // Log when the component renders
    logger.log(logLevel, 'Rendering component', { 
      props: sanitizeProps(props)
    });
    
    // Measure render time
    const startTime = performance.now();
    
    // Use React's profiling API if available
    try {
      // React 18+ Profiler API
      return (
        <React.Profiler
          id={`${displayName}Profiler`}
          onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime) => {
            // Log detailed render information
            logger.log(logLevel, `${id} [${phase}] rendered`, {
              renderMetrics: {
                actualDuration: actualDuration.toFixed(2),
                baseDuration: baseDuration.toFixed(2),
                startTime: startTime.toFixed(2),
                commitTime: commitTime.toFixed(2)
              }
            });
          }}
        >
          <WrappedComponent {...props} logger={logger} />
        </React.Profiler>
      );
    } catch (error) {
      logger.warn('React Profiler API not available', error);
      
      // Standard render without profiling
      const result = <WrappedComponent {...props} logger={logger} />;
      
      // Log render time
      const renderTime = performance.now() - startTime;
      logger.log(logLevel, `Component rendered in ${renderTime.toFixed(2)}ms`);
      
      return result;
    }
  };
  
  // Set display name for the HOC
  WithLogging.displayName = `withLogging(${displayName})`;
  
  return WithLogging as React.FC<Omit<P, keyof LoggingProps>>;
}

/**
 * Sanitize props for logging to prevent sensitive data exposure
 * and circular references
 */
function sanitizeProps(props: any): any {
  // List of props that might contain sensitive information
  const sensitiveProps = ['password', 'token', 'secret', 'key', 'auth', 
                         'credentials', 'apiKey', 'api_key'];
  
  try {
    // Create a shallow copy of props
    const sanitized = { ...props };
    
    // Replace sensitive properties with placeholders
    for (const key in sanitized) {
      if (sensitiveProps.some(prop => key.toLowerCase().includes(prop))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'function') {
        sanitized[key] = '[FUNCTION]';
      } else if (React.isValidElement(sanitized[key])) {
        sanitized[key] = '[REACT_ELEMENT]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        try {
          // Try to stringify and parse to handle circular references
          sanitized[key] = JSON.parse(JSON.stringify(sanitized[key]));
        } catch (error) {
          sanitized[key] = '[COMPLEX OBJECT]';
        }
      }
    }
    
    return sanitized;
  } catch (error) {
    // If any error occurs during sanitizing, return a simplified version
    return { sanitizationError: true };
  }
}

/**
 * React hook for accessing a logger in functional components
 * 
 * @param componentName - Name of the component using the logger
 * @returns A logger instance for the component
 */
export function useComponentLogger(componentName: string): Logger {
  const logger = React.useMemo(() => {
    return createLogger(`Component:${componentName}`);
  }, [componentName]);
  
  // Log component lifecycle
  useEffect(() => {
    logger.debug('Component mounted');
    
    // Clean up on unmount
    return () => {
      logger.debug('Component unmounted');
    };
  }, [logger]);
  
  return logger;
}

/**
 * HOC that logs performance metrics when a component renders
 * This is a lightweight alternative to withLogging that only focuses
 * on performance metrics
 */
export function withPerformanceLogging<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.FC<P> {
  // Get the display name for the wrapped component
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  // Create a logger for this component
  const logger = createLogger(`Performance:${displayName}`);
  
  // Create the wrapped component
  const WithPerformanceLogging: React.FC<P> = (props: P) => {
    // Measure render time
    const startTime = performance.now();
    
    // Use React's profiling API if available
    try {
      return (
        <React.Profiler
          id={`${displayName}PerformanceProfiler`}
          onRender={(id, phase, actualDuration, baseDuration) => {
            // Only log when performance is concerning
            if (actualDuration > 16) { // 16ms = 60fps threshold
              logger.warn(`Slow render: ${id} [${phase}]`, {
                renderMetrics: {
                  actualDuration: actualDuration.toFixed(2),
                  baseDuration: baseDuration.toFixed(2)
                }
              });
            }
          }}
        >
          <WrappedComponent {...props} />
        </React.Profiler>
      );
    } catch (error) {
      // Standard render without profiling
      const result = <WrappedComponent {...props} />;
      
      // Log render time only if it's concerning
      const renderTime = performance.now() - startTime;
      if (renderTime > 16) {
        logger.warn(`Slow render: ${displayName}`, {
          renderTime: renderTime.toFixed(2)
        });
      }
      
      return result;
    }
  };
  
  // Set display name for the HOC
  WithPerformanceLogging.displayName = `withPerformanceLogging(${displayName})`;
  
  return WithPerformanceLogging;
}

export default withLogging;
