/**
 * API endpoint for generating log summaries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { logQueryService, LogQueryParams } from '@/lib/logging/logQuery';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create a logger for this API route
const logger = createLogger('API:LogsSummary');

/**
 * Handle POST requests for log summaries
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
    
    // Generate summary
    logger.debug('Generating log summary', { queryParams });
    const summary = await logQueryService.generateSummary(queryParams);
    
    return NextResponse.json({ 
      summary,
      params: queryParams
    });
  } catch (error) {
    logger.error('Error generating log summary', error);
    return NextResponse.json(
      { error: 'Failed to generate log summary' }, 
      { status: 500 }
    );
  }
}

/**
 * Handle GET requests for predefined summaries
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
    
    // Parse time period from URL
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'day';
    
    // Create date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'hour':
        startDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
    
    const queryParams: LogQueryParams = {
      startDate,
      endDate: now
    };
    
    // Generate summary
    logger.debug('Generating log summary for period', { period, queryParams });
    const summary = await logQueryService.generateSummary(queryParams);
    
    return NextResponse.json({ 
      summary,
      period,
      startDate,
      endDate: now
    });
  } catch (error) {
    logger.error('Error generating log summary', error);
    return NextResponse.json(
      { error: 'Failed to generate log summary' }, 
      { status: 500 }
    );
  }
}
