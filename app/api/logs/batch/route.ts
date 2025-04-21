/**
 * API endpoint for batch processing of client-side logs
 */

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logging';
import { MongoTransport } from '@/lib/logging/transports';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

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
  logger.error('Failed to connect MongoDB transport for client logs batch:', error);
});

/**
 * Handle POST requests (batch log entries)
 */
export async function POST(request: NextRequest) {
  try {
    // Get correlation ID from headers
    const correlationId = request.headers.get('x-correlation-id') || undefined;
    
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || undefined;
    
    // Parse batch request from body
    const { entries } = await request.json();
    
    // Validate input
    if (!Array.isArray(entries)) {
      return NextResponse.json(
        { error: 'Invalid request format. Expected "entries" array.' },
        { status: 400 }
      );
    }
    
    // Add server-side metadata to each entry and store
    const serverMetadata = {
      receivedAt: new Date().toISOString(),
      clientIp: request.headers.get('x-forwarded-for') || request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown'
    };
    
    // Process each entry sequentially
    for (const entry of entries) {
      const enhancedEntry = {
        ...entry,
        ...serverMetadata,
        correlationId: correlationId || entry.correlationId,
        userId: userId || entry.userId
      };
      
      // Store in MongoDB
      await mongoTransport.log(enhancedEntry);
    }
    
    // Log summary (at debug level to avoid excessive logging)
    logger.debug(`Processed batch of ${entries.length} client logs`, {
      correlationId,
      userId,
      count: entries.length,
      clientSide: true
    });
    
    return NextResponse.json({ 
      success: true,
      count: entries.length
    });
  } catch (error) {
    logger.error('Error processing client logs batch', error);
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
