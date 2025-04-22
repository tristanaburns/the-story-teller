/**
 * auth/mongodb.ts
 * 
 * Dedicated MongoDB client for Auth.js v5 authentication
 * This module provides MongoDB connection specifically for Auth.js v5
 * to ensure separation from the main application's MongoDB usage.
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

import { MongoClient } from 'mongodb';
import { createLogger } from '@/lib/logging';

// Create a dedicated logger for Auth MongoDB operations
const authMongodbLogger = createLogger('AuthMongoDB');

// MongoDB connection string - same as main connection but dedicated instance
const uri = process.env.MONGODB_URI || '';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable for authentication');
}

// MongoDB client options
const options = {};

// Global client variable to reuse connection
let authMongodbClient: MongoClient;
let authMongodbClientPromise: Promise<MongoClient>;

// In development, use a global variable to keep the connection across hot reloads
// Note that we use a different global variable name than the main MongoDB client
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore - global does not have _authMongodbClientPromise property
  if (!global._authMongodbClientPromise) {
    authMongodbLogger.debug('Creating new Auth MongoDB client (development)');
    authMongodbClient = new MongoClient(uri, options);
    // @ts-ignore
    global._authMongodbClientPromise = authMongodbClient.connect();
  }
  // @ts-ignore
  authMongodbClientPromise = global._authMongodbClientPromise;
} else {
  // In production, create a new client
  authMongodbLogger.debug('Creating new Auth MongoDB client (production)');
  authMongodbClient = new MongoClient(uri, options);
  authMongodbClientPromise = authMongodbClient.connect();
}

// Add connection event logging
authMongodbClientPromise.then(() => {
  authMongodbLogger.info('Successfully connected to Auth MongoDB');
}).catch((error) => {
  authMongodbLogger.error('Failed to connect to Auth MongoDB', { error });
});

/**
 * Export the Auth MongoDB client promise for NextAuth.js adapter
 * This client should ONLY be used for authentication-related operations
 */
export const clientPromise = authMongodbClientPromise;

/**
 * Get database instance for auth operations
 * This function returns a raw database instance without logging wrappers
 */
export async function getAuthMongodbDb(dbName: string = 'auth') {
  const client = await authMongodbClientPromise;
  const db = client.db(dbName);
  return db;
}

/**
 * Verify connection to auth database
 * Can be used to check if the auth database is accessible
 */
export async function verifyAuthMongodbConnection(): Promise<boolean> {
  try {
    const client = await authMongodbClientPromise;
    await client.db('admin').command({ ping: 1 });
    authMongodbLogger.debug('Auth MongoDB connection verified');
    return true;
  } catch (error) {
    authMongodbLogger.error('Auth MongoDB connection verification failed', { error });
    return false;
  }
} 