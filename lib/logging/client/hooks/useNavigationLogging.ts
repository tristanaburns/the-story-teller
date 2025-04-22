/**
 * useNavigationLogging.ts
 * 
 * A React hook for tracking Next.js navigation events
 * Logs route changes, navigation timing, and rendering events
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useClientLogger } from '../useLogger';

/**
 * Hook to automatically log Next.js navigation events
 * Should be placed in layout or template components
 * 
 * @param componentName Name of the component using this hook
 */
export function useNavigationLogging(componentName: string = 'UnnamedComponent') {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const logger = useClientLogger('Navigation');
  
  // Log initial page load and subsequent navigations
  useEffect(() => {
    const navigationPerf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    // Collect query parameters
    const queryParams: Record<string, string> = {};
    if (searchParams) {
      for (const [key, value] of searchParams.entries()) {
        queryParams[key] = value;
      }
    }
    
    // Log navigation event with timing information
    logger.debug(`Navigation to ${pathname}`, {
      path: pathname,
      queryParams,
      component: componentName,
      timings: navigationPerf ? {
        domComplete: navigationPerf.domComplete,
        domContentLoaded: navigationPerf.domContentLoadedEventEnd,
        loadEvent: navigationPerf.loadEventEnd,
        fetchStart: navigationPerf.fetchStart,
        domInteractive: navigationPerf.domInteractive,
        responseEnd: navigationPerf.responseEnd,
        navigationType: navigationPerf.type
      } : undefined
    });
    
    // Function to log page exit
    return () => {
      logger.debug(`Exiting ${pathname}`, {
        path: pathname,
        component: componentName,
        duration: performance.now() - (navigationPerf?.startTime || 0)
      });
    };
  }, [pathname, searchParams, logger, componentName]);
  
  // Log performance metrics after render
  useEffect(() => {
    // Use requestAnimationFrame to ensure we measure after paint
    const rafId = requestAnimationFrame(() => {
      // Use requestIdleCallback to ensure we don't impact user experience
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          // Log performance metrics
          const metrics = {
            // Time since navigation start
            timeToRender: performance.now(),
            // First Contentful Paint (if available)
            fcp: getFCP(),
            // Largest Contentful Paint (if available)
            lcp: getLCP(),
            // First Input Delay (if available)
            fid: getFID(),
            // Cumulative Layout Shift (if available)
            cls: getCLS()
          };
          
          logger.debug(`Component ${componentName} rendered`, {
            path: pathname,
            component: componentName,
            metrics
          });
        });
      }
    });
    
    return () => cancelAnimationFrame(rafId);
  }, [pathname, componentName, logger]);
  
  return {
    logNavigation: (action: string, data?: Record<string, any>) => {
      logger.debug(`Navigation action: ${action}`, {
        path: pathname,
        component: componentName,
        action,
        ...data
      });
    }
  };
}

// Helper functions to get web vitals metrics
function getFCP(): number | undefined {
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  return fcpEntry ? (fcpEntry as PerformanceEntry).startTime : undefined;
}

function getLCP(): number | undefined {
  // LCP is not available via standard performance API, would need web-vitals library
  return undefined;
}

function getFID(): number | undefined {
  // FID is not available via standard performance API, would need web-vitals library
  return undefined;
}

function getCLS(): number | undefined {
  // CLS is not available via standard performance API, would need web-vitals library
  return undefined;
} 