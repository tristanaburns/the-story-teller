/**
 * apiLoggerMiddleware.ts
 * 
 * Middleware for logging API requests and responses in Next.js
 * Captures timing, request/response details, and correlation IDs
 */

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '../logger';

const logger = createLogger('APIMiddleware');

/**
 * Interface for API logging options
 */
export interface APILoggerOptions {
  excludePaths?: RegExp[];
  redactParameterPatterns?: RegExp[];
  maxBodySize?: number;
  logHeaders?: boolean;
  logBody?: boolean;
  logQueryParams?: boolean;
  logCookies?: boolean;
  logResponse?: boolean;
  logResponseBody?: boolean;
  maxResponseBodySize?: number;
}

/**
 * Default options for API logging
 */
const DEFAULT_OPTIONS: APILoggerOptions = {
  excludePaths: [/^\/api\/health/, /^\/api\/monitoring/, /^\/api\/logging/],
  redactParameterPatterns: [
    /password/i, /token/i, /secret/i, /key/i, /auth/i, /cookie/i, /session/i
  ],
  maxBodySize: 10 * 1024, // 10KB
  logHeaders: true,
  logBody: true,
  logQueryParams: true,
  logCookies: false,
  logResponse: true,
  logResponseBody: false,
  maxResponseBodySize: 10 * 1024 // 10KB
};

/**
 * Store the current options
 */
let options: APILoggerOptions = { ...DEFAULT_OPTIONS };

/**
 * Configure API logger options
 */
export function configureAPILogger(newOptions: Partial<APILoggerOptions>): void {
  options = { ...options, ...newOptions };
}

/**
 * Middleware for logging API requests and responses
 */
export function apiLoggerMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Skip logging for excluded paths
  if (options.excludePaths && options.excludePaths.some(pattern => pattern.test(req.nextUrl.pathname))) {
    return next();
  }
  
  // Generate or extract correlation ID
  const correlationId = req.headers.get('x-correlation-id') || uuidv4();
  
  // Start time for request
  const startTime = performance.now();
  
  // Log request
  const requestInfo = buildRequestInfo(req);
  
  logger.info(`API Request: ${req.method} ${req.nextUrl.pathname}`, {
    correlationId,
    method: req.method,
    path: req.nextUrl.pathname,
    clientInfo: {
      ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown'
    },
    metadata: requestInfo
  });
  
  // Process request and add correlation ID header to response
  return next().then(response => {
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Build response info
    const responseInfo = buildResponseInfo(response);
    
    // Log response
    logger.info(`API Response: ${req.method} ${req.nextUrl.pathname} ${response.status}`, {
      correlationId,
      method: req.method,
      path: req.nextUrl.pathname,
      statusCode: response.status,
      duration,
      clientInfo: {
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      },
      metadata: {
        request: requestInfo,
        response: responseInfo
      }
    });
    
    // Add correlation ID to response headers
    response.headers.set('x-correlation-id', correlationId);
    
    return response;
  }).catch(error => {
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Log error
    logger.error(`API Error: ${req.method} ${req.nextUrl.pathname}`, {
      correlationId,
      method: req.method,
      path: req.nextUrl.pathname,
      duration,
      clientInfo: {
        ip: req.ip || req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown'
      },
      metadata: {
        request: requestInfo,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      }
    });
    
    // Re-throw error
    throw error;
  });
}

/**
 * Build a sanitized request info object
 */
function buildRequestInfo(req: NextRequest): any {
  const info: any = {};
  
  // Add query parameters
  if (options.logQueryParams) {
    const query: Record<string, string> = {};
    for (const [key, value] of req.nextUrl.searchParams.entries()) {
      // Redact sensitive parameters
      if (options.redactParameterPatterns && 
          options.redactParameterPatterns.some(pattern => pattern.test(key))) {
        query[key] = '[REDACTED]';
      } else {
        query[key] = value;
      }
    }
    info.query = query;
  }
  
  // Add headers
  if (options.logHeaders) {
    const headers: Record<string, string> = {};
    req.headers.forEach((value, key) => {
      // Redact sensitive headers
      if (options.redactParameterPatterns && 
          options.redactParameterPatterns.some(pattern => pattern.test(key))) {
        headers[key] = '[REDACTED]';
      } else {
        headers[key] = value;
      }
    });
    info.headers = headers;
  }
  
  // Add cookies
  if (options.logCookies) {
    const cookies: Record<string, string> = {};
    req.cookies.getAll().forEach(cookie => {
      // Redact sensitive cookies
      if (options.redactParameterPatterns && 
          options.redactParameterPatterns.some(pattern => pattern.test(cookie.name))) {
        cookies[cookie.name] = '[REDACTED]';
      } else {
        cookies[cookie.name] = cookie.value;
      }
    });
    info.cookies = cookies;
  }
  
  // Add body
  if (options.logBody && req.body) {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        // Clone request to get body without consuming it
        const clonedReq = req.clone();
        
        // Get body as text
        clonedReq.text().then(bodyText => {
          if (bodyText.length <= (options.maxBodySize || 0)) {
            try {
              // Parse and sanitize JSON body
              const body = JSON.parse(bodyText);
              info.body = sanitizeBody(body, options.redactParameterPatterns || []);
            } catch (error) {
              // If JSON parsing fails, store as text
              info.body = `[Unable to parse JSON: ${bodyText}]`;
            }
          } else {
            info.body = `[Body too large: ${bodyText.length} bytes]`;
          }
        }).catch(() => {
          info.body = '[Unable to read body]';
        });
      } catch (error) {
        info.body = '[Error accessing body]';
      }
    } else if (contentType.includes('multipart/form-data')) {
      info.body = '[Multipart form data - body not logged]';
    } else {
      info.body = '[Body format not supported for logging]';
    }
  }
  
  return info;
}

/**
 * Build a sanitized response info object
 */
function buildResponseInfo(response: NextResponse): any {
  const info: any = {};
  
  // Add status
  info.status = response.status;
  info.statusText = response.statusText;
  
  // Add headers
  if (options.logHeaders) {
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      // Redact sensitive headers
      if (options.redactParameterPatterns && 
          options.redactParameterPatterns.some(pattern => pattern.test(key))) {
        headers[key] = '[REDACTED]';
      } else {
        headers[key] = value;
      }
    });
    info.headers = headers;
  }
  
  // Add body
  if (options.logResponseBody && options.logResponse) {
    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      try {
        // Clone response to get body without consuming it
        const clonedRes = response.clone();
        
        // Get body as text
        clonedRes.text().then(bodyText => {
          if (bodyText.length <= (options.maxResponseBodySize || 0)) {
            try {
              // Parse and sanitize JSON body
              const body = JSON.parse(bodyText);
              info.body = sanitizeBody(body, options.redactParameterPatterns || []);
            } catch (error) {
              // If JSON parsing fails, store as text
              info.body = `[Unable to parse JSON: ${bodyText}]`;
            }
          } else {
            info.body = `[Body too large: ${bodyText.length} bytes]`;
          }
        }).catch(() => {
          info.body = '[Unable to read body]';
        });
      } catch (error) {
        info.body = '[Error accessing body]';
      }
    } else {
      info.body = '[Body format not supported for logging]';
    }
  }
  
  return info;
}

/**
 * Sanitize an object by redacting sensitive fields
 */
function sanitizeBody(body: any, patterns: RegExp[]): any {
  if (!body || typeof body !== 'object') {
    return body;
  }
  
  // Handle arrays
  if (Array.isArray(body)) {
    return body.map(item => sanitizeBody(item, patterns));
  }
  
  // Handle objects
  const sanitized = { ...body };
  
  for (const key in sanitized) {
    // Check if the key matches any redaction patterns
    if (patterns.some(pattern => pattern.test(key))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeBody(sanitized[key], patterns);
    }
  }
  
  return sanitized;
}

/**
 * Export the middleware
 */
export default apiLoggerMiddleware;
