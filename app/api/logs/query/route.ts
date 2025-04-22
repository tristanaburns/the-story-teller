/**
 * API endpoint for querying logs
 * 
 * DEPRECATED: Use /api/logging/logs instead.
 * This endpoint is maintained for backward compatibility.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { logQueryService, LogQueryParams } from '@/lib/logging/logQuery';
import { withAuth, AccessLevel, hasViewLogsPermission } from '@/lib/api/authMiddleware';
import { createApiResponse, formatError } from '@/lib/api/apiHelpers';

// Create a logger for this API route
const logger = createLogger('API:LogsQuery');

/**
 * Handle POST requests for log querying
 */
export async function POST(request: NextRequest) {
  // Show deprecation warning in logs
  logger.warn('Deprecated endpoint used: /api/logs/query. Use /api/logging/logs instead.');
  
  return withAuth(request, async (request, session) => {
    try {
      // Parse query parameters
      const queryParams: LogQueryParams = await request.json();
      
      // Parse date strings if provided
      if (typeof queryParams.startDate === 'string') {
        queryParams.startDate = new Date(queryParams.startDate);
      }
      
      if (typeof queryParams.endDate === 'string') {
        queryParams.endDate = new Date(queryParams.endDate);
      }
      
      // Execute query
      logger.debug('Querying logs', { queryParams });
      const logs = await logQueryService.queryLogs(queryParams);
      
      return createApiResponse({ 
        logs,
        count: logs.length,
        params: queryParams,
        warning: 'This endpoint is deprecated. Please use /api/logging/logs instead.'
      });
    } catch (error) {
      logger.error('Error querying logs', error);
      return createApiResponse({
        error: 'Failed to query logs',
        details: formatError(error)
      }, 500);
    }
  }, {
    accessLevel: AccessLevel.ADMIN
  });
}

/**
 * Handle GET requests for log counts
 */
export async function GET(request: NextRequest) {
  // Show deprecation warning in logs
  logger.warn('Deprecated endpoint used: /api/logs/query. Use /api/logging/logs instead.');
  
  return withAuth(request, async (request, session) => {
    try {
      // Parse query parameters from URL
      const searchParams = request.nextUrl.searchParams;
      const queryParams: LogQueryParams = {};
      
      // Parse date strings
      if (searchParams.has('startDate')) {
        queryParams.startDate = new Date(searchParams.get('startDate')!);
      }
      
      if (searchParams.has('endDate')) {
        queryParams.endDate = new Date(searchParams.get('endDate')!);
      }
      
      // Parse other parameters
      if (searchParams.has('level')) {
        queryParams.level = searchParams.get('level')!;
      }
      
      if (searchParams.has('context')) {
        queryParams.context = searchParams.get('context')!;
      }
      
      if (searchParams.has('correlationId')) {
        queryParams.correlationId = searchParams.get('correlationId')!;
      }
      
      if (searchParams.has('userId')) {
        queryParams.userId = searchParams.get('userId')!;
      }
      
      if (searchParams.has('search')) {
        queryParams.search = searchParams.get('search')!;
      }
      
      if (searchParams.has('component')) {
        queryParams.component = searchParams.get('component')!;
      }
      
      // Execute count
      logger.debug('Counting logs', { queryParams });
      const count = await logQueryService.countLogs(queryParams);
      
      return createApiResponse({ 
        count, 
        params: queryParams,
        warning: 'This endpoint is deprecated. Please use /api/logging/logs instead.'
      });
    } catch (error) {
      logger.error('Error counting logs', error);
      return createApiResponse({
        error: 'Failed to count logs',
        details: formatError(error)
      }, 500);
    }
  }, {
    accessLevel: AccessLevel.ADMIN
  });
}
