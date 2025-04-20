/**
 * Next.js Middleware
 * 
 * Used to log all incoming requests and integrate with the logging system
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createLogger } from './lib/logging';

// Create a logger for middleware
const logger = createLogger('middleware');

export function middleware(request: NextRequest) {
  const start = performance.now();
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  
  // Log the request
  logger.debug(`${method} ${pathname}${search}`);
  
  // Process the request
  const response = NextResponse.next();
  
  // Log the response time
  const duration = performance.now() - start;
  logger.debug(`${method} ${pathname}${search} completed in ${duration.toFixed(2)}ms`);
  
  return response;
}

// Configure which paths the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
