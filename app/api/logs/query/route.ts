/**
 * API endpoint for querying logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { logQueryService, LogQueryParams } from '@/lib/logging/logQuery';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create a logger for this API route
const logger = createLogger('API:LogsQuery');

/**
 * Handle POST requests for log querying
 */
export async function POST(request: NextRequest) {
  try {
    // Get user session and verify admin role
    const session = await getServerSession(authOptions);
    
    // Only allow admins to query logs
    if (!session?.user || !session.user.roles?.includes('admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin role required.' },
        { status: 403 }
      );
    }
    
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
    
    return NextResponse.json({ 
      logs,
      count: logs.length,
      params: queryParams
    });
  } catch (error) {
    logger.error('Error querying logs', error);
    return NextResponse.json(
      { error: 'Failed to query logs' }, 
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests for log counts
 */
export async function GET(request: NextRequest) {
  try {
    // Get user session and verify admin role
    const session = await getServerSession(authOptions);
    
    // Only allow admins to query logs
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
    
    return NextResponse.json({ count, params: queryParams });
  } catch (error) {
    logger.error('Error counting logs', error);
    return NextResponse.json(
      { error: 'Failed to count logs' }, 
      { status: 500 }
    );
  }
}
