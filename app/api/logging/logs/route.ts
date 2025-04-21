/**
 * API endpoint for retrieving application logs
 * Supports filtering, pagination, and search
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createLogger } from '@/lib/logging/logger';
import { connectToDatabase } from '@/lib/mongodb';

// Create a logger for this API endpoint
const logger = createLogger('API:LogsEndpoint');

// Maximum number of logs that can be fetched in a single request
const MAX_PAGE_SIZE = 100;

// Default page size if not specified
const DEFAULT_PAGE_SIZE = 20;

/**
 * GET handler for retrieving logs
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get session and ensure user is authorized
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and has the required role
    if (!session?.user || !isAuthorizedUser(session.user)) {
      logger.warn('Unauthorized access attempt to logs API', {
        userId: session?.user?.id || 'unauthenticated'
      });
      
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Extract query parameters
    const { searchParams } = request.nextUrl;
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(
      parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10),
      MAX_PAGE_SIZE
    );
    
    // Filtering
    const level = searchParams.get('level') || null;
    const component = searchParams.get('component') || null;
    const correlationId = searchParams.get('correlationId') || null;
    const userId = searchParams.get('userId') || null;
    const search = searchParams.get('search') || null;
    const startDate = searchParams.get('startDate') || null;
    const endDate = searchParams.get('endDate') || null;
    const mcpServer = searchParams.get('mcpServer') || null;
    const environment = searchParams.get('environment') || null;
    
    // Build query
    const query: Record<string, any> = {};
    
    // Apply filters
    if (level) query.level = level;
    if (component) query.component = component;
    if (correlationId) query.correlationId = correlationId;
    if (userId) query.userId = userId;
    if (mcpServer) query.mcpServer = mcpServer;
    if (environment) query.environment = environment;
    
    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      
      if (startDate) {
        query.timestamp.$gte = new Date(startDate);
      }
      
      if (endDate) {
        query.timestamp.$lte = new Date(endDate);
      }
    }
    
    // Text search
    if (search) {
      // Use text index if available, otherwise search in message field
      try {
        query.$text = { $search: search };
      } catch (error) {
        // Fallback to regex search on message field if text index is not available
        query.message = { $regex: search, $options: 'i' };
      }
    }
    
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;
    
    // Get logs from database
    const logs = await db
      .collection('logs')
      .find(query)
      .sort({ timestamp: -1 }) // Most recent first
      .skip(skip)
      .limit(pageSize)
      .toArray();
    
    // Get total count for pagination
    const total = await db
      .collection('logs')
      .countDocuments(query);
    
    // Get available components for filtering
    const availableComponents = await db
      .collection('logs')
      .distinct('component');
    
    // Log the request
    logger.debug('Logs retrieved', {
      userId: session.user.id,
      filters: {
        level,
        component,
        correlationId,
        userId: userId,
        search,
        startDate,
        endDate,
        mcpServer,
        environment
      },
      pagination: {
        page,
        pageSize,
        total
      }
    });
    
    // Return logs with pagination info
    return NextResponse.json({
      logs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      availableComponents
    });
  } catch (error) {
    // Log error
    logger.error('Error retrieving logs', error);
    
    // Return error response
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if user is authorized to access logs
 */
function isAuthorizedUser(user: any): boolean {
  // Check for admin role
  const isAdmin = user.role === 'admin';
  
  // Check for developer role
  const isDeveloper = user.role === 'developer';
  
  // Check for specific permission
  const hasPermission = Array.isArray(user.permissions) && 
                        user.permissions.includes('view_logs');
  
  return isAdmin || isDeveloper || hasPermission;
}
