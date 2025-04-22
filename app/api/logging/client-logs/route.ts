/**
 * Client log collection API endpoint
 * Receives and stores client-side logs
 * 
 * PREFERRED ENDPOINT: Use this endpoint instead of /api/logs for client-side logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { createLogger } from '@/lib/logging/logger';
import { ClientLogEntry } from '@/lib/logging/client/clientLogger';
import { getClientIp } from '@/lib/utils/network';
import { connectToDatabase } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';
import { validateLogRequest, isRateLimited, createApiResponse } from '@/lib/api/apiHelpers';
import { checkUserAccess } from '@/lib/api/authMiddleware';

// Create a logger for this API endpoint
const logger = createLogger('API:ClientLogs');

/**
 * Rate limiting state
 */
interface RateLimitState {
  requests: number;
  timestamp: number;
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per minute
const rateLimitMap = new Map<string, RateLimitState>();

// Clean up rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, state] of rateLimitMap.entries()) {
    if (now - state.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes

/**
 * Check if a request is rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const state = rateLimitMap.get(ip) || { requests: 0, timestamp: now };
  
  // Reset if outside window
  if (now - state.timestamp > RATE_LIMIT_WINDOW) {
    state.requests = 1;
    state.timestamp = now;
    rateLimitMap.set(ip, state);
    return false;
  }
  
  // Increment request count
  state.requests++;
  rateLimitMap.set(ip, state);
  
  // Check if rate limited
  return state.requests > RATE_LIMIT_MAX_REQUESTS;
}

/**
 * Process and validate a client log entry
 */
function processLogEntry(
  entry: ClientLogEntry, 
  userId: string | null, 
  ip: string
): Record<string, any> {
  // Validate and format the entry
  return {
    timestamp: new Date(entry.timestamp || new Date().toISOString()),
    level: entry.level || 'INFO',
    message: entry.message || '',
    component: entry.component || 'client',
    correlationId: entry.correlationId || uuidv4(),
    userId: userId || entry.userId,
    sessionId: entry.sessionId || uuidv4(),
    url: entry.url || '',
    userAgent: entry.userAgent || '',
    ip: ip,
    data: entry.data || null,
    stackTrace: entry.stackTrace || null,
    tags: Array.isArray(entry.tags) ? entry.tags : [],
    receivedAt: new Date()
  };
}

/**
 * POST handler for client logs
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Get client IP
    const ip = getClientIp(request);
    
    // Check rate limit
    if (isRateLimited(ip)) {
      logger.warn(`Rate limit exceeded for client logs API`, { ip });
      return createApiResponse({ 
        error: 'Rate limit exceeded' 
      }, 429);
    }
    
    // Get session and user
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id || null;
    
    // Extract correlation ID from headers
    const correlationId = 
      request.headers.get('x-correlation-id') || 
      uuidv4();
    
    // Parse request body
    const logs = await request.json();
    
    // Validate logs array
    if (!validateLogRequest(logs)) {
      logger.warn('Invalid logs format', { correlationId, ip });
      return createApiResponse({
        error: 'Invalid request format. Expected array of log entries.'
      }, 400);
    }
    
    // Limit number of logs per request
    const maxLogs = Math.min(logs.length, 100);
    
    // Process logs
    const processedLogs = [];
    
    for (let i = 0; i < maxLogs; i++) {
      const entry = logs[i];
      
      // Skip invalid entries
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      
      // Process and validate the entry
      const processedEntry = processLogEntry(entry, userId, ip);
      processedLogs.push(processedEntry);
      
      // Log high severity entries to server logs
      if (['ERROR', 'FATAL'].includes(processedEntry.level)) {
        const level = processedEntry.level === 'FATAL' ? 'error' : processedEntry.level.toLowerCase();
        
        logger[level](
          `Client ${processedEntry.level}: ${processedEntry.message}`,
          {
            correlationId: processedEntry.correlationId,
            userId: processedEntry.userId,
            component: processedEntry.component,
            url: processedEntry.url,
            stackTrace: processedEntry.stackTrace,
            clientData: processedEntry.data
          }
        );
      }
    }
    
    // Store logs in database
    if (processedLogs.length > 0) {
      try {
        const { db } = await connectToDatabase();
        
        // Store in both collections for backward compatibility during transition
        // Main storage in client_logs
        await db.collection('client_logs').insertMany(processedLogs);
        
        // Also store in the legacy logs collection for backward compatibility
        await db.collection('logs').insertMany(processedLogs);
        
        logger.debug(`Stored ${processedLogs.length} client logs`, { correlationId });
      } catch (dbError) {
        logger.error('Failed to store client logs in database', {
          correlationId,
          error: dbError
        });
        
        // Continue even if DB storage fails
      }
    }
    
    // Return success
    return createApiResponse({ 
      status: 'success', 
      processed: processedLogs.length 
    }, 200, {
      'x-correlation-id': correlationId
    });
  } catch (error) {
    // Log error
    logger.error('Error processing client logs', error);
    
    // Return error response
    return createApiResponse({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, 500);
  }
}

/**
 * OPTIONS handler for CORS
 */
export async function OPTIONS() {
  return createApiResponse(null, 204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Correlation-ID'
  });
}
