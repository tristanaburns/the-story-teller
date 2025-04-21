/**
 * API endpoint for retrieving log summary statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { logQueryService, LogQueryParams } from '@/lib/logging/logQuery';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create a logger for this API route
const logger = createLogger('API:LogsSummary');

/**
 * Handle GET requests for log summary statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session and verify admin role
    const session = await getServerSession(authOptions);
    
    // Only allow admins to access log statistics
    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 403 }
      );
    }
    
    // Parse query parameters from URL
    const searchParams = request.nextUrl.searchParams;
    const queryParams: LogQueryParams = {};
    
    // Parse date strings
    if (searchParams.has('startDate')) {
      queryParams.startDate = new Date(searchParams.get('startDate')!);
    } else {
      // Default to last 24 hours
      queryParams.startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    }
    
    if (searchParams.has('endDate')) {
      queryParams.endDate = new Date(searchParams.get('endDate')!);
    } else {
      queryParams.endDate = new Date();
    }
    
    // Parse other parameters
    if (searchParams.has('level')) {
      queryParams.level = searchParams.get('level')!;
    }
    
    if (searchParams.has('component')) {
      queryParams.component = searchParams.get('component')!;
    }
    
    if (searchParams.has('correlationId')) {
      queryParams.correlationId = searchParams.get('correlationId')!;
    }
    
    if (searchParams.has('userId')) {
      queryParams.userId = searchParams.get('userId')!;
    }
    
    // Execute query for statistics
    logger.debug('Generating log statistics', { queryParams });
    const statistics = await logQueryService.getLogStatistics(queryParams);
    
    return NextResponse.json({
      statistics,
      params: queryParams
    });
  } catch (error) {
    logger.error('Error generating log statistics', error);
    return NextResponse.json(
      { error: 'Failed to generate log statistics' },
      { status: 500 }
    );
  }
}
