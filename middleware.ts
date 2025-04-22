/**
 * middleware.ts
 * 
 * Next.js middleware for Auth.js v5 protection and request logging
 * Provides comprehensive request logging with authentication status
 * and protects routes based on authentication status
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

import { auth } from './auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
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
  
  // Get the authentication session using Auth.js v5
  const session = await auth();
  const isAuthenticated = !!session;
  const userId = session?.user?.id;
  
  // Clone headers to add correlation ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-correlation-id', correlationId);
  
  // Add user ID as a header if available
  if (userId) {
    requestHeaders.set('x-user-id', userId);
  }
  
  // Parse the URL and extract details
  const { pathname, search, origin } = request.nextUrl;
  const fullUrl = `${origin}${pathname}${search}`;
  
  // Determine if this is an API request
  const isApiRequest = pathname.startsWith('/api/');
  
  // Log the request start with detailed context
  logger.debug(`${request.method} ${pathname} started`, {
    method: request.method,
    path: pathname,
    query: Object.fromEntries(request.nextUrl.searchParams.entries()),
    correlationId,
    userId,
    isAuthenticated,
    ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    referer: request.headers.get('referer') || 'unknown',
    contentType: request.headers.get('content-type') || 'unknown',
    isApiRequest,
    fullUrl
  });
  
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
    // Protect routes under /dashboard, /stories, /admin
    const protectedPaths = ['/dashboard', '/stories', '/admin'];
    const isProtectedPath = protectedPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    let response;
    
    if (isProtectedPath && !isAuthenticated) {
      // Redirect to login if trying to access protected route without auth
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', request.url);
      response = NextResponse.redirect(url);
      
      logger.info(`Redirecting unauthenticated user to signin`, {
        path: pathname,
        redirectUrl: url.toString(),
        correlationId
      });
    } else {
      // Process the request normally
      response = NextResponse.next({
        request: requestWithCorrelation
      });
    }
    
    // Add correlation ID to response headers
    response.headers.set('x-correlation-id', correlationId);
    
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Get the response status to determine log level
    const status = response.status || 200;
    
    // Choose log level based on status code
    let logLevel = 'debug';
    if (status >= 500) {
      logLevel = 'error';
    } else if (status >= 400) {
      logLevel = 'warn';
    } else if (status >= 300) {
      logLevel = 'info';
    }

    // Log the request completion with appropriate level
    logger[logLevel](`${request.method} ${pathname} completed with status ${status}`, {
      method: request.method,
      path: pathname,
      correlationId,
      userId,
      isAuthenticated,
      status,
      duration,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    });
    
    return response;
  } catch (error) {
    // Calculate request duration
    const duration = performance.now() - startTime;
    
    // Log the error
    logger.error(`${request.method} ${pathname} failed`, {
      method: request.method,
      path: pathname,
      correlationId,
      userId,
      isAuthenticated,
      duration,
      error: error instanceof Error ? 
        { message: error.message, stack: error.stack, name: error.name } : 
        String(error),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
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

// Apply middleware to all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (static assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
