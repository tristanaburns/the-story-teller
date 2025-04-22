/**
 * API Authentication Middleware
 * 
 * Shared authentication and authorization logic for API endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createLogger } from '@/lib/logging';
import { createApiResponse } from './apiHelpers';

// Logger for authentication middleware
const logger = createLogger('API:AuthMiddleware');

/**
 * User access levels for different APIs
 */
export enum AccessLevel {
  PUBLIC = 'public',       // No authentication required
  USER = 'user',           // Any authenticated user
  DEVELOPER = 'developer', // Users with developer role
  ADMIN = 'admin',         // Users with admin role
}

/**
 * Options for authentication middleware
 */
export interface AuthOptions {
  // Required access level
  accessLevel: AccessLevel;
  // Custom permission check
  permissionCheck?: (user: any) => boolean;
  // Whether to log the request
  logRequest?: boolean;
}

/**
 * Default authentication options
 */
const defaultAuthOptions: AuthOptions = {
  accessLevel: AccessLevel.USER,
  logRequest: true,
};

/**
 * Checks if a user has the required access level
 */
export async function checkUserAccess(request: NextRequest, options: Partial<AuthOptions> = {}): Promise<{
  authorized: boolean;
  session: any;
  error?: string;
}> {
  const opts = { ...defaultAuthOptions, ...options };
  
  try {
    // Public access - no authentication needed
    if (opts.accessLevel === AccessLevel.PUBLIC) {
      return { authorized: true, session: null };
    }
    
    // Get user session
    const session = await getServerSession(authOptions);
    
    // No session - not authenticated
    if (!session?.user) {
      return {
        authorized: false,
        session: null,
        error: 'Authentication required'
      };
    }
    
    const { user } = session;
    
    // For USER level access, any authenticated user is fine
    if (opts.accessLevel === AccessLevel.USER) {
      return { authorized: true, session };
    }
    
    // Check roles
    const roles = user.roles || [];
    const isAdmin = roles.includes('admin');
    const isDeveloper = roles.includes('developer');
    
    // Admin access required
    if (opts.accessLevel === AccessLevel.ADMIN) {
      if (!isAdmin) {
        return {
          authorized: false,
          session,
          error: 'Admin access required'
        };
      }
      return { authorized: true, session };
    }
    
    // Developer access required
    if (opts.accessLevel === AccessLevel.DEVELOPER) {
      if (!isAdmin && !isDeveloper) {
        return {
          authorized: false,
          session,
          error: 'Developer access required'
        };
      }
      return { authorized: true, session };
    }
    
    // Custom permission check
    if (opts.permissionCheck && !opts.permissionCheck(user)) {
      return {
        authorized: false,
        session,
        error: 'Insufficient permissions'
      };
    }
    
    // Default to authorized if all checks passed
    return { authorized: true, session };
  } catch (error) {
    logger.error('Error checking user access', error);
    return {
      authorized: false,
      session: null,
      error: 'Authentication error'
    };
  }
}

/**
 * Authentication middleware for API routes
 */
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, session: any) => Promise<NextResponse>,
  options: Partial<AuthOptions> = {}
): Promise<NextResponse> {
  const { authorized, session, error } = await checkUserAccess(request, options);
  
  if (!authorized) {
    return createApiResponse({ error }, 403);
  }
  
  return handler(request, session);
}

/**
 * Checks if user has view logs permission
 */
export function hasViewLogsPermission(user: any): boolean {
  if (!user) return false;
  
  // Check for admin or developer role
  const roles = user.roles || [];
  if (roles.includes('admin') || roles.includes('developer')) {
    return true;
  }
  
  // Check for specific permission
  const permissions = user.permissions || [];
  return permissions.includes('view_logs');
} 