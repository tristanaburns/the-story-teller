'use client';

import { useEffect, useState } from 'react';
import { getClientLogger, ClientLogger } from '@/lib/logging/clientLogger';

/**
 * React hook for accessing client logger in components
 * 
 * @param component Component name for log context
 * @returns ClientLogger instance
 */
export function useClientLogger(component: string = 'UnnamedComponent'): ClientLogger {
  const [logger] = useState(() => getClientLogger());
  
  useEffect(() => {
    // Add component as a metadata provider
    logger.addMetadataProvider('component', () => component);
    
    // Track page views when component mounts
    if (typeof window !== 'undefined') {
      logger.trackPageView(window.location.pathname, { component });
    }
    
    // Clean up metadata provider
    return () => {
      logger.removeMetadataProvider('component');
    };
  }, [logger, component]);
  
  return logger;
}
