/**
 * withLogging.tsx
 * 
 * A Higher-Order Component (HOC) that adds logging capabilities to any component
 */

import React from 'react';
import { createLogger } from '@/lib/logging';

/**
 * Wraps a component with logging functionality
 * 
 * @param WrappedComponent - The component to enhance with logging
 * @param componentName - Optional name override for the component (defaults to WrappedComponent.displayName)
 * @returns A new component with logging capabilities
 */
export function withLogging<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
): React.FC<P> {
  // Get the display name for the wrapped component
  const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  
  // Create a logger for this component
  const logger = createLogger(`Component:${displayName}`);
  
  // Create the wrapped component
  const WithLogging: React.FC<P> = (props: P) => {
    // Log when the component renders
    logger.debug('Rendering component', { props: sanitizeProps(props) });
    
    // Measure render time
    const startTime = performance.now();
    
    // Use React's profiling API if available
    if (process.env.NODE_ENV === 'development') {
      try {
        // React 18+ Profiler API
        return (
          <React.Profiler
            id={`${displayName}Profiler`}
            onRender={(id, phase, actualDuration) => {
              logger.debug(`${id} [${phase}] rendered in ${actualDuration.toFixed(2)}ms`);
            }}
          >
            <WrappedComponent {...props} logger={logger} />
          </React.Profiler>
        );
      } catch (error) {
        logger.warn('React Profiler API not available', error);
      }
    }
    
    // Standard render without profiling
    const result = <WrappedComponent {...props} logger={logger} />;
    
    // Log render time
    const renderTime = performance.now() - startTime;
    logger.debug(`Component rendered in ${renderTime.toFixed(2)}ms`);
    
    return result;
  };
  
  // Set display name for the HOC
  WithLogging.displayName = `withLogging(${displayName})`;
  
  return WithLogging;
}

/**
 * Sanitize props for logging to prevent sensitive data exposure
 * and circular references
 */
function sanitizeProps(props: any): any {
  // List of props that might contain sensitive information
  const sensitiveProps = ['password', 'token', 'secret', 'key', 'auth'];
  
  // Create a shallow copy of props
  const sanitized = { ...props };
  
  // Replace sensitive properties with placeholders
  for (const key in sanitized) {
    if (sensitiveProps.some(prop => key.toLowerCase().includes(prop))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'function') {
      sanitized[key] = '[FUNCTION]';
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
}

export default withLogging;
