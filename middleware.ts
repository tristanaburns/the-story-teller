/**
 * Global middleware for adding correlation IDs and logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';

// Create a logger for middleware
const logger = createLogger('Middleware');

// Generate a correlation ID
function generateCorrelationId(): string {
  return `req-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

export async function middleware(request: NextRequest) {
  const startTime = performance.now();
  
  // Get existing correlation ID or generate a new one
  const correlationId = request.headers.get('x-correlation-id') || 
                        request.headers.get('x-request-id') || 
                        generateCorrelationId();
  
  // Log the request start (debug level to avoid excessive logging)
  logger.debug(`${request.method} ${request.nextUrl.pathname} started`, {
    method: request.method,
    path: request.nextUrl.pathname,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    correlationId,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  });
  
  // Clone headers to add correlation ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);
  
  // Create a new request with modified headers
  const requestWithCorrelation = new NextRequest(request.url, {
    method: request.method,
    headers: requestHeaders,
    body: request.body,
    cache: request.cache,
    credentials: request.credentials,
    integrity: request.integrity,
    keepalive: request.keepalive,
    mode: request.mode,
    redirect: request.redirect,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    signal: request.signal
  });
  
  try {
    // Process the request
    const response = NextResponse.next({
      request: requestWithCorrelation
    });
    
    // Add correlation ID to response headers
    response.headers.set('x-correlation-id', correlationId);
    
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Log the request completion (debug level to avoid excessive logging)
    logger.debug(`${request.method} ${request.nextUrl.pathname} completed`, {
      method: request.method,
      path: request.nextUrl.pathname,
      correlationId,
      duration
    });
    
    return response;
  } catch (error) {
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Log the error
    logger.error(`${request.method} ${request.nextUrl.pathname} failed`, {
      method: request.method,
      path: request.nextUrl.pathname,
      correlationId,
      duration,
      error
    });
    
    // Return error response with correlation ID
    const errorResponse = NextResponse.json(
      { error: 'Internal Server Error', correlationId },
      { status: 500 }
    );
    
    errorResponse.headers.set('x-correlation-id', correlationId);
    return errorResponse;
  }
}

// Only apply middleware to API routes
export const config = {
  matcher: '/api/:path*'
};
