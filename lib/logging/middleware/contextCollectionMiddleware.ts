/**
 * contextCollectionMiddleware.ts
 * 
 * Middleware for collecting and propagating context information across components
 * Handles correlation IDs, user IDs, and request metadata for comprehensive logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createLogger, Logger } from '../logger';
import { getSession } from 'next-auth/react';

// Create logger instance for this middleware
const logger = createLogger('ContextMiddleware');

/**
 * Context collection options
 */
export interface ContextCollectionOptions {
  excludePaths?: RegExp[];
  includeUserInfo?: boolean;
  includeClientInfo?: boolean;
  includePerformanceMetrics?: boolean;
  includeBrowserInfo?: boolean;
  customContextExtractors?: ContextExtractor[];
}

/**
 * Custom context extractor function type
 */
export type ContextExtractor = (req: NextRequest) => Promise<Record<string, any>>;

/**
 * Default options for context collection
 */
const DEFAULT_OPTIONS: ContextCollectionOptions = {
  excludePaths: [/^\/api\/health/, /^\/api\/monitoring/, /^\/api\/logging/, /^\/favicon.ico/],
  includeUserInfo: true,
  includeClientInfo: true,
  includePerformanceMetrics: true,
  includeBrowserInfo: true,
  customContextExtractors: []
};

/**
 * Current middleware options
 */
let options: ContextCollectionOptions = { ...DEFAULT_OPTIONS };

/**
 * Configure context collection options
 */
export function configureContextCollection(newOptions: Partial<ContextCollectionOptions>): void {
  options = { ...options, ...newOptions };
  logger.info('Context collection configuration updated', { config: options });
}

/**
 * Thread-local storage for context information
 * This will store the current request context during processing
 */
const asyncLocalStorage = new Map<string, any>();

/**
 * Get a value from the context storage
 */
export function getContextValue(key: string): any {
  return asyncLocalStorage.get(key);
}

/**
 * Set a value in the context storage
 */
export function setContextValue(key: string, value: any): void {
  asyncLocalStorage.set(key, value);
}

/**
 * Clear the entire context storage
 */
export function clearContext(): void {
  asyncLocalStorage.clear();
}

/**
 * Get the current correlation ID from context
 */
export function getCorrelationId(): string {
  return asyncLocalStorage.get('correlationId') || 'unknown';
}

/**
 * Get the current user ID from context
 */
export function getUserId(): string | undefined {
  return asyncLocalStorage.get('userId');
}

/**
 * Get the current request ID from context
 */
export function getRequestId(): string | undefined {
  return asyncLocalStorage.get('requestId');
}

/**
 * Middleware for collecting and propagating context information
 */
export async function contextCollectionMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Skip excluded paths
  if (options.excludePaths && options.excludePaths.some(pattern => pattern.test(req.nextUrl.pathname))) {
    return next();
  }
  
  // Clear any existing context
  clearContext();
  
  // Generate or extract correlation ID from headers
  const correlationId = req.headers.get('x-correlation-id') || uuidv4();
  setContextValue('correlationId', correlationId);
  
  // Generate unique request ID
  const requestId = uuidv4();
  setContextValue('requestId', requestId);
  
  // Start time for performance measurement
  const startTime = performance.now();
  setContextValue('requestStartTime', startTime);
  
  // Collect request path and method
  setContextValue('path', req.nextUrl.pathname);
  setContextValue('method', req.method);
  
  // Extract client info if enabled
  if (options.includeClientInfo) {
    const clientInfo = {
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
    };
    setContextValue('clientInfo', clientInfo);
    
    // Parse user-agent for browser and OS info if enabled
    if (options.includeBrowserInfo && clientInfo.userAgent !== 'unknown') {
      try {
        // Simple user agent parsing (in a real app, use a proper UA parser library)
        const browserInfo = {
          browser: parseBrowser(clientInfo.userAgent),
          os: parseOS(clientInfo.userAgent),
          isMobile: /mobile|android|iphone|ipad|ipod/i.test(clientInfo.userAgent)
        };
        setContextValue('browserInfo', browserInfo);
      } catch (error) {
        logger.warn('Failed to parse user agent', { error: error instanceof Error ? error.message : String(error) });
      }
    }
  }
  
  // Try to extract user information from session
  if (options.includeUserInfo) {
    try {
      // This won't work in middleware directly, but is a placeholder for how you'd
      // extract user ID in an API route where this context would be used
      // In actual middleware implementation, this would use cookies or JWT parsing
      // Leaving this comment to indicate the intent
      
      // For demo purposes only:
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // In a real implementation, you would validate and decode the JWT
        // This is just a placeholder to show the concept
        setContextValue('userId', 'user-from-token');
      }
    } catch (error) {
      logger.warn('Failed to extract user information', { error: error instanceof Error ? error.message : String(error) });
    }
  }
  
  // Run custom context extractors
  if (options.customContextExtractors && options.customContextExtractors.length > 0) {
    try {
      const customContextPromises = options.customContextExtractors.map(extractor => extractor(req));
      const customContextResults = await Promise.all(customContextPromises);
      
      // Merge all custom contexts
      customContextResults.forEach(contextData => {
        for (const [key, value] of Object.entries(contextData)) {
          setContextValue(key, value);
        }
      });
    } catch (error) {
      logger.warn('Error running custom context extractors', { error: error instanceof Error ? error.message : String(error) });
    }
  }
  
  // Log context collection
  logger.debug('Request context collected', {
    correlationId,
    requestId,
    path: req.nextUrl.pathname,
    method: req.method
  });
  
  // Process the request
  try {
    const response = await next();
    
    // Calculate request duration if performance metrics are enabled
    if (options.includePerformanceMetrics) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      setContextValue('requestDuration', duration);
      setContextValue('responseStatusCode', response.status);
    }
    
    // Add correlation ID to response headers
    response.headers.set('x-correlation-id', correlationId);
    
    // Log successful completion
    logger.debug('Request processed successfully', {
      correlationId,
      requestId,
      path: req.nextUrl.pathname,
      method: req.method,
      statusCode: response.status,
      duration: options.includePerformanceMetrics ? getContextValue('requestDuration') : undefined
    });
    
    return response;
  } catch (error) {
    // Log error with context
    logger.error('Error processing request', {
      correlationId,
      requestId,
      path: req.nextUrl.pathname,
      method: req.method,
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : String(error)
    });
    
    // Re-throw to continue error handling
    throw error;
  } finally {
    // Context can optionally be cleared here, but often it's useful to keep it
    // around for the rest of the request lifecycle
  }
}

/**
 * Simple browser name parser from user-agent string
 */
function parseBrowser(userAgent: string): string {
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent)) return 'Safari';
  if (/edge|edg/i.test(userAgent)) return 'Edge';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  if (/msie|trident/i.test(userAgent)) return 'Internet Explorer';
  return 'Unknown';
}

/**
 * Simple OS name parser from user-agent string
 */
function parseOS(userAgent: string): string {
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/macintosh|mac os x/i.test(userAgent)) return 'macOS';
  if (/linux/i.test(userAgent)) return 'Linux';
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  return 'Unknown';
}

/**
 * Export the middleware function
 */
export default contextCollectionMiddleware;
