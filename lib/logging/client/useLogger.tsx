/**
 * useLogger.tsx
 * 
 * React hook for accessing the client logger in components
 * Also provides a LoggerProvider for global configuration
 */

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ClientLogger, ClientLoggerConfig, createClientLogger } from './clientLogger';

// Logger context
const LoggerContext = createContext<ClientLogger | null>(null);

// Props for the logger provider
export interface LoggerProviderProps {
  children: React.ReactNode;
  config?: Partial<ClientLoggerConfig>;
  initialUserId?: string | null;
  initialCorrelationId?: string | null;
  component?: string;
}

/**
 * Provider component for client logger
 * Provides a configured logger instance to all child components
 */
export const LoggerProvider: React.FC<LoggerProviderProps> = ({
  children,
  config = {},
  initialUserId = null,
  initialCorrelationId = null,
  component = 'App'
}) => {
  // Create logger instance
  const logger = useMemo(() => {
    const instance = createClientLogger(component, config);
    
    // Set initial user ID and correlation ID if provided
    if (initialUserId) {
      instance.setUserId(initialUserId);
    }
    
    if (initialCorrelationId) {
      instance.setCorrelationId(initialCorrelationId);
    }
    
    return instance;
  }, [component]); // Only recreate if component changes
  
  // Update configuration when it changes
  useEffect(() => {
    logger.updateConfig(config);
  }, [logger, JSON.stringify(config)]);
  
  // Update user ID when it changes
  useEffect(() => {
    logger.setUserId(initialUserId);
  }, [logger, initialUserId]);
  
  // Update correlation ID when it changes
  useEffect(() => {
    logger.setCorrelationId(initialCorrelationId);
  }, [logger, initialCorrelationId]);
  
  // Flush logs when component unmounts
  useEffect(() => {
    return () => {
      logger.flush();
    };
  }, [logger]);
  
  return (
    <LoggerContext.Provider value={logger}>
      {children}
    </LoggerContext.Provider>
  );
};

/**
 * React hook for accessing the client logger
 * @param childComponent Optional child component name to create a child logger
 * @returns Logger instance
 */
export function useLogger(childComponent?: string): ClientLogger {
  const contextLogger = useContext(LoggerContext);
  
  // Validate logger from context
  if (!contextLogger) {
    // Fallback to a new logger if not in context
    const fallbackLogger = createClientLogger(childComponent || 'Unknown');
    console.warn('useLogger called outside of LoggerProvider, creating standalone logger');
    return fallbackLogger;
  }
  
  // Create child logger if component name provided
  if (childComponent) {
    return contextLogger.createChildLogger(childComponent);
  }
  
  return contextLogger;
}

/**
 * Higher-order component for logging component lifecycle
 * @param Component The component to wrap with logging
 * @param componentName Optional name for the component in logs
 */
export function withLogger<P>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.FC<P> {
  const componentDisplayName = 
    componentName || 
    Component.displayName || 
    Component.name || 
    'UnknownComponent';
  
  const WithLogger: React.FC<P> = (props) => {
    const logger = useLogger(componentDisplayName);
    
    // Log mount
    useEffect(() => {
      logger.debug(`Component mounted`);
      
      return () => {
        logger.debug(`Component unmounted`);
      };
    }, [logger]);
    
    return <Component {...props} />;
  };
  
  WithLogger.displayName = `WithLogger(${componentDisplayName})`;
  
  return WithLogger;
}

/**
 * Hook for logging component renders and re-renders
 * @param componentName Name of the component
 * @param dependencies Optional array of dependencies to track
 */
export function useRenderLogger(
  componentName: string,
  dependencies: any[] = []
): void {
  const logger = useLogger(componentName);
  const depsString = JSON.stringify(dependencies);
  
  // Log initial render
  useEffect(() => {
    logger.debug(`Component initially rendered`);
    
    return () => {
      logger.debug(`Component will unmount`);
    };
  }, [logger]);
  
  // Log re-renders
  useEffect(() => {
    // Skip initial render
    if (depsString === JSON.stringify(dependencies)) {
      return;
    }
    
    logger.debug(`Component re-rendered`, { 
      changedDeps: dependencies.map((_, index) => index) 
    });
  }, [logger, depsString, ...dependencies]);
}

/**
 * Hook for logging performance metrics
 * @param componentName Name of the component
 */
export function usePerformanceLogger(componentName: string): void {
  const logger = useLogger(componentName);
  
  useEffect(() => {
    // Skip if performance API is not available
    if (typeof performance === 'undefined' || typeof window === 'undefined') {
      return;
    }
    
    // Get performance metrics
    setTimeout(() => {
      try {
        const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigationTiming) {
          logger.debug('Performance metrics', {
            dns: navigationTiming.domainLookupEnd - navigationTiming.domainLookupStart,
            connection: navigationTiming.connectEnd - navigationTiming.connectStart,
            response: navigationTiming.responseEnd - navigationTiming.responseStart,
            dom: navigationTiming.domComplete - navigationTiming.domInteractive,
            load: navigationTiming.loadEventEnd - navigationTiming.loadEventStart,
            total: navigationTiming.loadEventEnd - navigationTiming.startTime
          });
        }
        
        // Get largest contentful paint if available
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry) {
            logger.debug('Largest Contentful Paint', {
              time: lastEntry.startTime,
              size: (lastEntry as any).size || 0,
              element: (lastEntry as any).element ? (lastEntry as any).element.tagName : null
            });
          }
          
          observer.disconnect();
        });
        
        // Start observing LCP events
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (error) {
        logger.error('Error collecting performance metrics', error);
      }
    }, 0);
  }, [logger]);
}

export default useLogger;
