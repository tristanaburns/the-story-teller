/**
 * API endpoint for retrieving application logs
 * Supports filtering, pagination, and search
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { logQueryService } from '@/lib/logging/logQuery';
import { withAuth, AccessLevel, hasViewLogsPermission } from '@/lib/api/authMiddleware';
import { createApiResponse, formatError } from '@/lib/api/apiHelpers';

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
  return withAuth(request, async (request, session) => {
    try {
      // Extract query parameters
      const { searchParams } = request.nextUrl;
      
      // Pagination
      const page = parseInt(searchParams.get('page') || '1', 10);
      const pageSize = Math.min(
        parseInt(searchParams.get('pageSize') || String(DEFAULT_PAGE_SIZE), 10),
        MAX_PAGE_SIZE
      );
      
      // Setup query params
      const queryParams = {
        level: searchParams.get('level') || undefined,
        component: searchParams.get('component') || undefined,
        correlationId: searchParams.get('correlationId') || undefined,
        userId: searchParams.get('userId') || undefined,
        search: searchParams.get('search') || undefined,
        mcpServer: searchParams.get('mcpServer') || undefined,
        environment: searchParams.get('environment') || undefined,
        skip: (page - 1) * pageSize,
        limit: pageSize
      };
      
      // Parse dates if provided
      if (searchParams.has('startDate')) {
        queryParams.startDate = new Date(searchParams.get('startDate')!);
      }
      
      if (searchParams.has('endDate')) {
        queryParams.endDate = new Date(searchParams.get('endDate')!);
      }
      
      // Get logs using the logQueryService
      const logs = await logQueryService.queryLogs(queryParams);
      
      // Get total count for pagination
      const total = await logQueryService.countLogs(queryParams);
      
      // Get distinct components for filtering
      const availableComponents = await logQueryService.getDistinctValues('component');
      
      // Log the request (at debug level to avoid excessive logging)
      logger.debug('Logs retrieved', {
        userId: session.user.id,
        queryParams,
        resultCount: logs.length,
        total
      });
      
      // Return response
      return createApiResponse({
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
      return createApiResponse({
        error: 'Internal server error',
        details: formatError(error)
      }, 500);
    }
  }, {
    accessLevel: AccessLevel.DEVELOPER,
    permissionCheck: hasViewLogsPermission
  });
}
