/**
 * auth/index.ts
 * 
 * Central export for all Auth.js v5 related functionality
 * Provides a clean API for authentication features
 * 
 * IMPORTANT: This project uses Auth.js v5 (NextAuth v5) EXCLUSIVELY.
 * Do NOT mix with v4 patterns or generic Auth.js implementations.
 *
 * @version Auth.js v5
 */

import { authOptions } from './options';
import { verifyAuthMongodbConnection } from './mongodb';

// Re-export the authOptions for use in API routes
export { authOptions };

/**
 * Verify that the authentication database is accessible
 * This can be used during startup to ensure auth is configured correctly
 */
export async function verifyAuthSystem(): Promise<boolean> {
  try {
    return await verifyAuthMongodbConnection();
  } catch (error) {
    console.error('Failed to verify auth system', error);
    return false;
  }
}

/**
 * Export session-related utility functions
 */
export * from './session';

/**
 * Export MongoDB client and utilities
 */
export * from './mongodb'; 