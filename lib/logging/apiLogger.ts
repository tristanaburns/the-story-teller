/**
 * apiLogger.ts
 * 
 * A utility for adding logging to Next.js API routes with correlation ID tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLoggerWithCorrelationId, Logger, LogLevel } from './logger';
import { headers } from 'next/headers';

// Create a generic API logger
const apiLogger = createLoggerWithCorrelationId('API');

// Get correlation ID from headers or generate a new one
function getCorrelationId(req: NextRequest): string {
  const correlationId = req.headers.get('x-correlation-id') ||
                       req.headers.get('x-request-id') ||
                       `req-${Math.random().toString(36).substring(2, 15)}`;
  
  return correlationId;
}

// Get user ID from request
function getUserId(req: NextRequest): string | undefined {
  // Try to get from session (would need to be set by auth middleware)
  // This is a placeholder - actual implementation would depend on auth setup
  return undefined;
}

// Enhanced request logging
async function logRequest(
  logger: Logger, 
  req: NextRequest, 
  routeName: string
): Promise<void> {
  const { method, url, headers: reqHeaders } = req;
  const parsedUrl = new URL(url);
  
  // Determine if we should log the body
  const shouldLogBody = method !== 'GET' && method !== 'HEAD';
  
  try {
    // Create context for logging
    const context = {
      method,
      path: parsedUrl.pathname,
      query: Object.fromEntries(parsedUrl.searchParams.entries()),
      headers: sanitizeHeaders(reqHeaders),
      clientInfo: {
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      }
    };
    
    // Log the request
    logger.debug(`${method} ${parsedUrl.pathname} request received`, context);
    
    // Log body for non-GET requests
    if (shouldLogBody) {
      try {
        const clone = req.clone();
        const text = await clone.text();
        
        if (text) {
          try {
            const body = JSON.parse(text);
            logger.debug(`${method} ${parsedUrl.pathname} request body`, sanitizeBody(body));
          } catch {
            // If not JSON, log as text
            if (text.length < 1000) {
              logger.debug(`${method} ${parsedUrl.pathname} request body (text)`, text);
            } else {
              logger.debug(`${method} ${parsedUrl.pathname} request body (text, truncated)`, 
                `${text.substring(0, 1000)}... [${text.length - 1000} more bytes]`);
            }
          }
        }
      } catch (error) {
        logger.debug(`Could not parse request body for ${method} ${parsedUrl.pathname}`, error);
      }
    }
  } catch (error) {
    logger.error(`Error logging request for ${method} ${parsedUrl.pathname}`, error);
  }
}

// Enhanced response logging
function logResponse(
  logger: Logger,
  req: NextRequest,
  res: NextResponse,
  startTime: number
): void {
  const { method, url } = req;
  const parsedUrl = new URL(url);
  const duration = performance.now() - startTime;
  
  try {
    // Create context for logging
    const context = {
      method,
      path: parsedUrl.pathname,
      statusCode: res.status,
      duration,
      headers: Object.fromEntries(res.headers.entries())
    };
    
    // Determine log level based on status code
    let logLevel = LogLevel.DEBUG;
    if (res.status >= 500) {
      logLevel = LogLevel.ERROR;
    } else if (res.status >= 400) {
      logLevel = LogLevel.WARN;
    } else if (res.status >= 300) {
      logLevel = LogLevel.INFO;
    }
    
    // Log the response
    logger.log(
      logLevel,
      `${method} ${parsedUrl.pathname} completed with status ${res.status} in ${duration.toFixed(2)}ms`,
      context
    );
    
    // Log performance metrics for slow responses
    if (duration > 1000) {
      logger.warn(`Slow response for ${method} ${parsedUrl.pathname}`, { duration });
    }
  } catch (error) {
    logger.error(`Error logging response for ${method} ${parsedUrl.pathname}`, error);
  }
}

/**
 * API Logger middleware with correlation ID tracing
 * 
 * This higher-order function wraps Next.js API and App Router route handlers
 * with logging functionality. It adds correlation IDs to track requests
 * through the system and logs the request and response details.
 * 
 * @param handler - The original API route handler
 * @param routeName - A name to identify this route in logs
 * @returns A wrapped handler with logging functionality
 */
export function withApiLogging(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse> | NextResponse,
  routeName: string
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async function wrappedHandler(req: NextRequest, context?: any): Promise<NextResponse> {
    // Get or generate correlation ID
    const correlationId = getCorrelationId(req);
    
    // Create a logger with the correlation ID
    const routeLogger = createLoggerWithCorrelationId(`API:${routeName}`, correlationId);
    
    // Start timing
    const startTime = performance.now();
    
    // Log the request
    await logRequest(routeLogger, req, routeName);
    
    try {
      // Call the original handler (with params if provided)
      const response = await handler(req, context);
      
      // Add correlation ID to response headers
      response.headers.set('x-correlation-id', correlationId);
      
      // Log the response
      logResponse(routeLogger, req, response, startTime);
      
      return response;
    } catch (error) {
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Log the error
      routeLogger.error(`${req.method} ${new URL(req.url).pathname} failed after ${duration.toFixed(2)}ms`, error);
      
      // Return a 500 error response with correlation ID
      const errorResponse = NextResponse.json(
        { 
          error: 'Internal Server Error',
          correlationId 
        },
        { status: 500 }
      );
      
      // Add correlation ID to response headers
      errorResponse.headers.set('x-correlation-id', correlationId);
      
      return errorResponse;
    }
  };
}

/**
 * Sanitize request headers for logging
 */
function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = [
    'authorization', 
    'cookie', 
    'set-cookie', 
    'x-csrf-token', 
    'x-xsrf-token',
    'proxy-authorization',
    'x-api-key',
    'api-key'
  ];
  
  headers.forEach((value, key) => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

/**
 * Sanitize request body for logging
 */
function sanitizeBody(body: any): any {
  if (typeof body !== 'object' || body === null) {
    return body;
  }
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 
    'apiKey', 'api_key', 'accessToken', 'refreshToken',
    'credit_card', 'creditCard', 'cvv', 'ssn'
  ];
  
  const sanitized = { ...body };
  
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeBody(sanitized[key]);
    }
  }
  
  return sanitized;
}

/**
 * Middleware for ensuring correlation IDs are passed through the request chain
 */
export function correlationMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Get or generate correlation ID
  const correlationId = getCorrelationId(req);
  
  // Set in async local storage for loggers to access
  Logger.setContextValue('correlationId', correlationId);
  
  // Execute the next middleware or handler
  return Logger.withCorrelationId(correlationId, () => next());
}

export default withApiLogging;
