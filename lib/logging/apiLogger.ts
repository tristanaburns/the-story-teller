/**
 * apiLogger.ts
 * 
 * A utility for adding logging to Next.js API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from './logger';

// Create a generic API logger
const apiLogger = createLogger('API');

/**
 * Wraps an API handler with logging functionality
 * 
 * @param handler - The API route handler function
 * @param routeName - The name of the API route for context
 * @returns A new handler with logging
 */
export function withApiLogging(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  routeName: string
) {
  // Create a specific logger for this route
  const routeLogger = apiLogger.createChildLogger(routeName);
  
  // Return the wrapped handler
  return async function wrappedHandler(req: NextRequest) {
    const { method, url, headers } = req;
    const startTime = performance.now();
    
    // Log the request
    routeLogger.debug(`${method} ${url}`, {
      headers: sanitizeHeaders(headers),
      query: Object.fromEntries(new URL(url).searchParams.entries())
    });
    
    try {
      // Attempt to parse the request body if it exists
      let body = null;
      if (method !== 'GET' && method !== 'HEAD') {
        try {
          const clone = req.clone();
          const text = await clone.text();
          
          if (text) {
            try {
              body = JSON.parse(text);
            } catch {
              body = text;
            }
          }
        } catch (error) {
          routeLogger.debug('Could not parse request body', error);
        }
      }
      
      // Log the request body if it exists
      if (body) {
        routeLogger.debug('Request body', sanitizeBody(body));
      }
      
      // Call the original handler
      const response = await handler(req);
      
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Log the response
      routeLogger.debug(`${method} ${url} completed in ${duration.toFixed(2)}ms with status ${response.status}`, {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return response;
    } catch (error) {
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Log the error
      routeLogger.error(`${method} ${url} failed after ${duration.toFixed(2)}ms`, error);
      
      // Return a 500 error response
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Sanitize request headers for logging
 */
function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'set-cookie'];
  
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
  
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
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

export default withApiLogging;
