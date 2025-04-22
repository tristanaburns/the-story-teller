/**
 * mongodb.ts
 * 
 * MongoDB client connection utility with enhanced logging
 * Automatically wraps collection operations with debug logging
 */

import { MongoClient } from 'mongodb';
import { createLogger, logDbOperation, DbOperation } from '@/lib/logging';

// Create a logger for MongoDB operations
const logger = createLogger('MongoDB');

// MongoDB connection string
const uri = process.env.MONGODB_URI || '';

if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// MongoDB client options
const options = {};

// Global client variable to reuse connection
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// In development, use a global variable to keep the connection across hot reloads
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore - global does not have _mongoClientPromise property
  if (!global._mongoClientPromise) {
    logger.debug('Creating new MongoDB client (development)');
    client = new MongoClient(uri, options);
    // @ts-ignore
    global._mongoClientPromise = client.connect();
  }
  // @ts-ignore
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client
  logger.debug('Creating new MongoDB client (production)');
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

// Add connection event logging
clientPromise.then(() => {
  logger.info('Successfully connected to MongoDB');
}).catch((error) => {
  logger.error('Failed to connect to MongoDB', { error });
});

/**
 * Create a logged wrapper around a MongoDB collection
 * Automatically logs all operations with parameters and results
 */
export function wrapCollectionWithLogging(collection: any) {
  // If already wrapped, return as-is
  if (collection._isLoggingWrapper) {
    return collection;
  }
  
  // Get collection name for logging
  const collectionName = collection.collectionName || 'unknown';
  
  // Create a proxy to intercept all method calls
  const proxy = new Proxy(collection, {
    get(target, prop, receiver) {
      // Get the original property
      const original = Reflect.get(target, prop, receiver);
      
      // If not a function or a special property, return as-is
      if (typeof original !== 'function' || prop === 'then' || prop === 'catch' || 
          prop === 'finally' || prop.toString().startsWith('Symbol')) {
        return original;
      }
      
      // Wrap the method with logging
      return function(...args: any[]) {
        // Map method name to operation type
        let operation: DbOperation;
        switch(prop) {
          case 'find': operation = DbOperation.FIND; break;
          case 'findOne': operation = DbOperation.FIND_ONE; break;
          case 'insertOne': 
          case 'insertMany': operation = DbOperation.INSERT; break;
          case 'updateOne': 
          case 'updateMany':
          case 'replaceOne': operation = DbOperation.UPDATE; break;
          case 'deleteOne': 
          case 'deleteMany': operation = DbOperation.DELETE; break;
          case 'aggregate': operation = DbOperation.AGGREGATE; break;
          case 'count':
          case 'countDocuments':
          case 'estimatedDocumentCount': operation = DbOperation.COUNT; break;
          case 'distinct': operation = DbOperation.DISTINCT; break;
          case 'createIndex':
          case 'dropIndex':
          case 'indexes': operation = DbOperation.INDEX; break;
          case 'bulkWrite': operation = DbOperation.BULK; break;
          default: operation = DbOperation.FIND; // Default fallback
        }
        
        // Extract query and options from arguments
        const query = args[0] || {};
        const options = args.length > 1 ? args[1] : {};
        
        // Log the operation with timing
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
  
  // Mark this proxy as a logging wrapper to avoid double wrapping
  Object.defineProperty(proxy, '_isLoggingWrapper', {
    value: true,
    writable: false,
    enumerable: false,
    configurable: false
  });
  
  return proxy;
}

/**
 * Export the MongoDB client promise
 */
export { clientPromise };

/**
 * Get a database instance with logging
 */
export async function getDb(dbName: string) {
  const client = await clientPromise;
  const db = client.db(dbName);
  
  // Wrap the collection method to automatically add logging
  const originalCollection = db.collection.bind(db);
  db.collection = function(name: string, options?: any) {
    const collection = originalCollection(name, options);
    return wrapCollectionWithLogging(collection);
  };
  
  return db;
}
