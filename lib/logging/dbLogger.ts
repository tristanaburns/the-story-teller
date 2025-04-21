/**
 * dbLogger.ts
 * 
 * A utility for logging database operations with detailed metrics
 */

import { createLogger, LogLevel, LogContext } from './logger';

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
  VALIDATION = 'VALIDATION',
  BULK = 'BULK',
  COUNT = 'COUNT',
  DISTINCT = 'DISTINCT'
}

/**
 * Database operation context
 */
export interface DbContext extends LogContext {
  collection: string;
  operation: DbOperation;
  query?: any;
  options?: any;
  documentCount?: number;
  modifiedCount?: number;
  upsertedCount?: number;
  deletedCount?: number;
  indexName?: string;
  pipeline?: any[];
}

/**
 * Log a database operation with timing information
 * 
 * @param operation - The type of database operation
 * @param collection - The collection being operated on
 * @param query - The query or filter being used
 * @param options - Additional options for the operation
 * @param callback - The function that performs the actual database operation
 * @returns The result of the database operation
 */
export async function logDbOperation<T>(
  operation: DbOperation,
  collection: string,
  query: any,
  options: any = {},
  callback: () => Promise<T>
): Promise<T> {
  // Create a collection-specific logger
  const collectionLogger = dbLogger.createChildLogger(collection);
  
  // Start timing
  const startTime = performance.now();
  
  try {
    // Log the operation start with sanitized query
    collectionLogger.debug(`${operation} started`, {
      collection,
      operation,
      query: sanitizeQuery(query),
      options: sanitizeOptions(options)
    });
    
    // Execute the database operation
    const result = await callback();
    
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Prepare context for the completion log
    const context: DbContext = {
      collection,
      operation,
      duration,
      query: sanitizeQuery(query),
      options: sanitizeOptions(options)
    };
    
    // Extract operation-specific metrics
    if (result) {
      // Handle array results (e.g., find operations)
      if (Array.isArray(result)) {
        context.documentCount = result.length;
      } 
      // Handle MongoDB result objects
      else if (typeof result === 'object') {
        // Extract metrics from MongoDB operation results
        // Type assertions to handle unknown property access
        const resultObj = result as Record<string, any>;
        if ('insertedCount' in resultObj) context.documentCount = Number(resultObj.insertedCount);
        if ('modifiedCount' in resultObj) context.modifiedCount = Number(resultObj.modifiedCount);
        if ('upsertedCount' in resultObj) context.upsertedCount = Number(resultObj.upsertedCount);
        if ('deletedCount' in resultObj) context.deletedCount = Number(resultObj.deletedCount);
        if ('matchedCount' in resultObj) context.documentCount = Number(resultObj.matchedCount);
        
        // For count operations
        if (operation === DbOperation.COUNT && typeof result === 'number') {
          context.documentCount = result;
        }
      }
    }
    
    // Determine log level based on duration
    let logLevel = LogLevel.DEBUG;
    if (duration > 1000) {
      logLevel = LogLevel.WARN; // Warn for operations taking more than 1 second
    }
    
    // Log the operation completion
    collectionLogger.log(
      logLevel,
      `${operation} completed in ${duration.toFixed(2)}ms`,
      context
    );
    
    return result;
  } catch (error) {
    // Calculate duration
    const duration = performance.now() - startTime;
    
    // Log the error
    collectionLogger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
      error,
      collection,
      operation,
      duration,
      query: sanitizeQuery(query),
      options: sanitizeOptions(options)
    });
    
    // Re-throw the error
    throw error;
  }
}

/**
 * Log a database transaction with multiple operations
 * 
 * @param collectionName - A name to identify the transaction scope
 * @param callback - Function that performs the transaction
 * @returns The result of the transaction
 */
export async function logDbTransaction<T>(
  collectionName: string,
  callback: () => Promise<T>
): Promise<T> {
  return logDbOperation(
    DbOperation.TRANSACTION,
    collectionName,
    { transaction: true },
    {},
    callback
  );
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
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'apiKey', 'api_key'];
  
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

/**
 * Sanitize database operation options for logging
 */
function sanitizeOptions(options: any): any {
  if (!options || typeof options !== 'object') {
    return options;
  }
  
  // Create a shallow copy
  const sanitized = { ...options };
  
  // Handle special fields
  if (typeof sanitized.projection === 'object') {
    sanitized.projection = { ...sanitized.projection };
  }
  
  if (typeof sanitized.sort === 'object') {
    sanitized.sort = { ...sanitized.sort };
  }
  
  return sanitized;
}

/**
 * Create a logger-wrapped MongoDB collection
 * This adds logging to all database operations
 * 
 * @param collection - The MongoDB collection to wrap
 * @returns A proxy that logs all operations on the collection
 */
export function createLoggedCollection(collection: any): any {
  const collectionName = collection.collectionName || 'unknown';
  
  return new Proxy(collection, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      
      // If the property is not a function, return it as is
      if (typeof original !== 'function') {
        return original;
      }
      
      // Wrap the function with logging
      return function(...args: any[]) {
        // Determine the operation type based on the method name
        let operation: DbOperation;
        
        switch (prop) {
          case 'find':
            operation = DbOperation.FIND;
            break;
          case 'findOne':
            operation = DbOperation.FIND_ONE;
            break;
          case 'insertOne':
          case 'insertMany':
            operation = DbOperation.INSERT;
            break;
          case 'updateOne':
          case 'updateMany':
          case 'replaceOne':
            operation = DbOperation.UPDATE;
            break;
          case 'deleteOne':
          case 'deleteMany':
            operation = DbOperation.DELETE;
            break;
          case 'aggregate':
            operation = DbOperation.AGGREGATE;
            break;
          case 'createIndex':
          case 'dropIndex':
            operation = DbOperation.INDEX;
            break;
          case 'bulkWrite':
            operation = DbOperation.BULK;
            break;
          case 'count':
          case 'countDocuments':
          case 'estimatedDocumentCount':
            operation = DbOperation.COUNT;
            break;
          case 'distinct':
            operation = DbOperation.DISTINCT;
            break;
          default:
            // Default to the method name
            operation = prop as unknown as DbOperation;
        }
        
        // Extract query and options from arguments
        const query = args[0] || {};
        const options = args[1] || {};
        
        // Log the operation
        return logDbOperation(
          operation,
          collectionName,
          query,
          options,
          () => original.apply(target, args)
        );
      };
    }
  });
}

export default {
  dbLogger,
  logDbOperation,
  logDbTransaction,
  createLoggedCollection,
  DbOperation
};
