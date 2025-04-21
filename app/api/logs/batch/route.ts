/**
 * API endpoint for receiving batched client-side logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { MongoTransport } from '@/lib/logging/transports';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { ClientLogData } from '@/lib/logging/types';

// Create a logger for this API route
const logger = createLogger('API:LogsBatch');

// Initialize MongoDB transport
const mongoTransport = new MongoTransport({
  connectionString: process.env.MONGODB_URI || '',
  dbName: process.env.MONGODB_DB || 'the_story_teller',
  collectionName: 'logs',
  expireAfterSeconds: 30 * 24 * 60 * 60 // 30 days
});

// Connect to MongoDB
mongoTransport.connect().catch(error => {
  logger.error('Failed to connect MongoDB transport for client logs:', error);
});

/**
 * Handle POST requests for batched logs
 */
export async function POST(request: NextRequest) {
  try {
    // Get correlation ID from headers
    const correlationId = request.headers.get('x-correlation-id') || undefined;
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || undefined;
    
    // Parse log entries from request
    const logEntries: ClientLogData[] = await request.json();
    
    // Validate input is an array
    if (!Array.isArray(logEntries)) {
      return NextResponse.json(
        { error: 'Request body must be an array of log entries' },
        { status: 400 }
      );
    }
    
    logger.debug('Received batch of client logs', {
      count: logEntries.length,
      correlationId,
      userId
    });
    
    // Process log entries
    const enhancedLogs = logEntries.map(entry => ({
      ...entry,
      correlationId: entry.correlationId || correlationId,
      userId: entry.userId || userId,
      receivedAt: new Date().toISOString(),
      clientIp: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: entry.userAgent || request.headers.get('user-agent') || 'unknown'
    }));
    
    // Store in MongoDB
    for (const log of enhancedLogs) {
      await mongoTransport.log(log);
    }
    
    return NextResponse.json({ 
      success: true,
      count: enhancedLogs.length
    });
  } catch (error) {
    logger.error('Error processing client log batch', error);
    return NextResponse.json(
      { error: 'Failed to process log entries' }, 
      { status: 500 }
    );
  }
}

/**
 * Handle OPTIONS requests (for CORS)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Correlation-ID'
    }
  });
}
