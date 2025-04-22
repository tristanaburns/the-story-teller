/**
 * @file db-middleware.ts
 * @description Middleware for handling user-specific database connections
 * @module database/DbMiddleware
 * @exports Functions for managing database connections in API routes
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getUserDatabase, initUserDatabase } from './init-database';
import { Logger } from '../logging/logger';

// Create a logger for the database middleware
const logger = new Logger('DbMiddleware');

// MongoDB connection URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';

// Cache for database connections to avoid reconnecting on every request
const dbCache: Record<string, any> = {};

/**
 * Get the user ID from the session
 * @returns User ID or null if not authenticated
 */
export async function getUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id || null;
  } catch (error) {
    logger.error('Failed to get user ID from session', error);
    return null;
  }
}

/**
 * Get the user's database
 * @param userId - User ID
 * @param options - Optional database options
 * @returns MongoDB database instance
 */
export async function getDatabase(
  userId: string,
  options = { createIfNotExists: true }
): Promise<any> {
  try {
    // Check cache first
    if (dbCache[userId]) {
      return dbCache[userId];
    }
    
    // Get database
    let db;
    try {
      db = await getUserDatabase(userId, { mongoUri: MONGODB_URI });
      
      // Verify database by checking for metadata collection
      const metadata = await db.collection('metadata').findOne({ userId });
      
      if (!metadata && options.createIfNotExists) {
        // Database exists but is not initialized or missing metadata
        db = await initUserDatabase(userId, { 
          mongoUri: MONGODB_URI,
          dropExisting: false
        });
      }
    } catch (error) {
      // Database might not exist yet
      if (options.createIfNotExists) {
        logger.info(`Creating database for user ${userId}`);
        db = await initUserDatabase(userId, { 
          mongoUri: MONGODB_URI,
          dropExisting: false
        });
      } else {
        throw error;
      }
    }
    
    // Cache database connection
    dbCache[userId] = db;
    
    return db;
  } catch (error) {
    logger.error(`Failed to get database for user ${userId}`, error);
    throw error;
  }
}

/**
 * Middleware for handling database connections in API routes
 * @param handler - API route handler
 * @returns Handler function with database access
 */
export function withDatabase(
  handler: (req: NextRequest, res: NextResponse, db: any) => Promise<NextResponse>
): (req: NextRequest, res: NextResponse) => Promise<NextResponse> {
  return async (req: NextRequest, res: NextResponse) => {
    try {
      // Get user ID from session
      const userId = await getUserId();
      
      if (!userId) {
        logger.warn('Unauthorized access attempt to database');
        return NextResponse.json(
          { success: false, error: { message: 'Unauthorized' } },
          { status: 401 }
        );
      }
      
      // Get database
      const db = await getDatabase(userId);
      
      // Call handler with database
      return await handler(req, res, db);
    } catch (error) {
      logger.error('Database middleware error', error);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Database error',
            details: error instanceof Error ? error.message : 'Unknown error'
          }
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Reset the database cache
 * Useful for testing and debugging
 */
export function resetDbCache(): void {
  Object.keys(dbCache).forEach(key => {
    delete dbCache[key];
  });
}
