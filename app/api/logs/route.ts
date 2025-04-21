/**
 * API endpoint for receiving client-side logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { MongoTransport } from '@/lib/logging/transports';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

// Create a logger for this API route
const logger = createLogger('API:Logs');

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
 * Handle POST requests (single log entry)
 */
export async function POST(request: NextRequest) {
  try {
    // Get correlation ID from headers
    const correlationId = request.headers.get('x-correlation-id') || undefined;
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || undefined;
    
    // Parse log entry from request
    const logEntry = await request.json();
    
    // Add server-side metadata
    const enhancedLogEntry = {
      ...logEntry,
      correlationId: correlationId || logEntry.correlationId,
      userId: userId || logEntry.userId,
      receivedAt: new Date().toISOString(),
      clientIp: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    // Store in MongoDB
    await mongoTransport.log(enhancedLogEntry);
    
    // Log receipt of client log (at debug level to avoid excessive logging)
    logger.debug('Received client log', {
      correlationId,
      userId,
      level: logEntry.level,
      context: logEntry.context,
      clientSide: true
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error processing client log', error);
    return NextResponse.json(
      { error: 'Failed to process log entry' }, 
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
