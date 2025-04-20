/**
 * useLogger.ts
 * 
 * A React hook for component-level logging
 */

import { useEffect, useRef } from 'react';
import { createLogger, Logger } from '@/lib/logging';

/**
 * A hook that provides component-level logging functionality
 * 
 * @param componentName - The name of the component for context
 * @returns A logger instance tied to the component lifecycle
 */
export function useLogger(componentName: string): Logger {
  // Create a ref to store the logger instance
  const loggerRef = useRef<Logger | null>(null);
  
  // Initialize logger on first render
  if (!loggerRef.current) {
    loggerRef.current = createLogger(`Component:${componentName}`);
  }
  
  // Log component lifecycle events
  useEffect(() => {
    const logger = loggerRef.current!;
    
    // Log when component mounts
    logger.debug('Component mounted');
    
    // Return cleanup function to log when component unmounts
    return () => {
      logger.debug('Component unmounted');
    };
  }, [componentName]);
  
  return loggerRef.current;
}

export default useLogger;
