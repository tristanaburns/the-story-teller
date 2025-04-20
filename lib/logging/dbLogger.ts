/**
 * dbLogger.ts
 * 
 * A utility for logging database operations
 */

import { createLogger } from './logger';

// Create a database logger
const dbLogger = createLogger('Database');

/**
 * Database operation types
 */
export enum DbOperation {
  CONNECT = 'CONNECT',
  DISCONNECT = 'DISCONNECT',
  FIND = 'FIND',
  FIND_ONE = 'FIND_ONE',
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  AGGREGATE = 'AGGREGATE',
  TRANSACTION = 'TRANSACTION',
  INDEX = 'INDEX',
  VALIDATION = 'VALIDATION'
}

/**
 * Log a database operation with timing information
 * 
 * @param operation - The type of database operation
 * @param collection - The collection being operated on
 * @param query - The query or filter being used
 * @param callback - The function that performs the actual database operation
 * @returns The result of the database operation
 */
export async function logDbOperation<T>(
  operation: DbOperation,
  collection: string,
  query: any,
  callback: () => Promise<T>
): Promise<T> {
  // Create a collection-specific logger
  const collectionLogger = dbLogger.createChildLogger(collection);
  
  // Start timing
  const startTime = performance.now();
  
  try {
    // Log the operation start
    collectionLogger.debug(`${operation} started`, sanitizeQuery(query));
    
    // Execute the database operation
    const result = await callback();
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Log the operation completion
    collectionLogger.debug(`${operation} completed in ${duration.toFixed(2)}ms`);
    
    // For find operations, log the result count
    if (operation === DbOperation.FIND && Array.isArray(result)) {
      collectionLogger.debug(`${operation} returned ${result.length} documents`);
    }
    
    return result;
  } catch (error) {
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Log the error
    collectionLogger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
      error,
      collection,
      query: sanitizeQuery(query)
    });
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Sanitize a database query for logging
 */
function sanitizeQuery(query: any): any {
  if (!query || typeof query !== 'object') {
    return query;
  }
  
  // Create a shallow copy
  const sanitized = { ...query };
  
  // List of fields that might contain sensitive information
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
  
  // Replace sensitive fields
  for (const key in sanitized) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeQuery(sanitized[key]);
    }
  }
  
  return sanitized;
}

export default {
  dbLogger,
  logDbOperation,
  DbOperation
};
