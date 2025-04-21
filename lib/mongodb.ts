/**
 * mongodb.ts
 * 
 * A MongoDB client wrapper with integrated logging
 */

import { MongoClient, Db, Collection, Document } from 'mongodb';
import { createLogger, DbOperation, logDbOperation } from './logging';

// MongoDB connection string from environment variables
const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB || 'storyteller';

// Create a MongoDB-specific logger
const logger = createLogger('MongoDB');

// MongoDB client instance cache
let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> = initializeClientPromise();

// Initialize the client promise
function initializeClientPromise(): Promise<MongoClient> {
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  const defaultClient = new MongoClient(uri);
  return defaultClient.connect();
}

/**
 * Get a MongoDB client instance with logging
 */
export async function getClient(): Promise<MongoClient> {
  // If we have an active client, return it
  if (client) {
    return client;
  }
  
  // If we have a pending connection, return it
  if (clientPromise) {
    client = await clientPromise;
    return client;
  }
  
  // No existing connection, create a new one
  logger.info('Creating new MongoDB client instance');
  
  // Validate connection string
  if (!uri) {
    logger.error('MongoDB connection string is not defined');
    throw new Error('MongoDB connection string is not defined');
  }
  
  // Create a new client
  const newClient = new MongoClient(uri);
  
  // Connect with timing and logging
  const startTime = performance.now();
  logger.debug('Connecting to MongoDB');
  
  // Create a promise to connect
  clientPromise = newClient.connect().then((client) => {
    const duration = performance.now() - startTime;
    logger.info(`Connected to MongoDB in ${duration.toFixed(2)}ms`);
    return client;
  }).catch((error) => {
    const duration = performance.now() - startTime;
    logger.error(`Failed to connect to MongoDB after ${duration.toFixed(2)}ms`, error);
    throw error;
  });
  
  // Wait for the connection
  client = await clientPromise;
  
  // Add connection event handlers
  client.on('serverClosed', () => {
    logger.info('MongoDB server connection closed');
    client = null;
    clientPromise = null as unknown as Promise<MongoClient>;
  });
  
  client.on('error', (error) => {
    logger.error('MongoDB connection error', error);
  });
  
  return client;
}

/**
 * Get a MongoDB database instance with logging
 */
export async function getDb(): Promise<Db> {
  const client = await getClient();
  return client.db(dbName);
}

/**
 * Get a MongoDB collection with logging wrapper
 */
export async function getCollection<T extends Document>(collectionName: string): Promise<LoggedCollection<T>> {
  const db = await getDb();
  const collection = db.collection<T>(collectionName);
  
  // Create a collection-specific logger
  const collectionLogger = logger.createChildLogger(collectionName);
  
  // Return a wrapped collection with logging
  return new LoggedCollection<T>(collection, collectionName, collectionLogger);
}

/**
 * A wrapper for MongoDB collections that adds logging
 */
class LoggedCollection<T extends Document> {
  private collection: Collection<T>;
  private collectionName: string;
  private logger: any;
  
  constructor(collection: Collection<T>, collectionName: string, logger: any) {
    this.collection = collection;
    this.collectionName = collectionName;
    this.logger = logger;
  }
  
  /**
   * Find documents with logging
   */
  async find(filter: any = {}, options: any = {}): Promise<T[]> {
    const operation = DbOperation.FIND;
    const collection = this.collectionName;
    const query = { filter, options };
    // Using a different approach to log instead of calling logDbOperation
    // Start timing
    const startTime = performance.now();
    
    try {
      // Log the operation start with sanitized query
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        query
      });
      
      // Execute the database operation directly
      const result = await this.collection.find(filter, options).toArray();
      
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Log the operation completion
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          documentCount: result.length
        }
      );
      
      // Return as T[] with correct type assertion
      return result as unknown as T[];
    } catch (error) {
      // Calculate duration
      const duration = performance.now() - startTime;
      
      // Log the error
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        query
      });
      
      // Re-throw the error
      throw error;
    }
  }
  
  /**
   * Find a single document with logging
   */
  async findOne(filter: any = {}, options: any = {}): Promise<T | null> {
    const operation = DbOperation.FIND_ONE;
    const collection = this.collectionName;
    const query = { filter, options };
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        query
      });
      
      const result = await this.collection.findOne(filter, options);
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          documentCount: result ? 1 : 0
        }
      );
      
      return result as unknown as T | null;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        query
      });
      
      throw error;
    }
  }
  
  /**
   * Insert a document with logging
   */
  async insertOne(document: any): Promise<any> {
    const operation = DbOperation.INSERT;
    const collection = this.collectionName;
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation
      });
      
      const result = await this.collection.insertOne(document);
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          documentCount: 1
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration
      });
      
      throw error;
    }
  }
  
  /**
   * Insert multiple documents with logging
   */
  async insertMany(documents: any[]): Promise<any> {
    const operation = DbOperation.INSERT;
    const collection = this.collectionName;
    const count = documents.length;
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        count
      });
      
      const result = await this.collection.insertMany(documents);
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          documentCount: count
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        count
      });
      
      throw error;
    }
  }
  
  /**
   * Update a document with logging
   */
  async updateOne(filter: any, update: any, options: any = {}): Promise<any> {
    const operation = DbOperation.UPDATE;
    const collection = this.collectionName;
    const query = { filter, update, options };
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        query
      });
      
      const result = await this.collection.updateOne(filter, update, options);
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        query
      });
      
      throw error;
    }
  }
  
  /**
   * Update multiple documents with logging
   */
  async updateMany(filter: any, update: any, options: any = {}): Promise<any> {
    const operation = DbOperation.UPDATE;
    const collection = this.collectionName;
    const query = { filter, update, options };
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        query
      });
      
      const result = await this.collection.updateMany(filter, update, options);
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          modifiedCount: result.modifiedCount,
          matchedCount: result.matchedCount
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        query
      });
      
      throw error;
    }
  }
  
  /**
   * Delete a document with logging
   */
  async deleteOne(filter: any, options: any = {}): Promise<any> {
    const operation = DbOperation.DELETE;
    const collection = this.collectionName;
    const query = { filter, options };
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        query
      });
      
      const result = await this.collection.deleteOne(filter, options);
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          deletedCount: result.deletedCount
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        query
      });
      
      throw error;
    }
  }
  
  /**
   * Delete multiple documents with logging
   */
  async deleteMany(filter: any, options: any = {}): Promise<any> {
    const operation = DbOperation.DELETE;
    const collection = this.collectionName;
    const query = { filter, options };
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        query
      });
      
      const result = await this.collection.deleteMany(filter, options);
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          deletedCount: result.deletedCount
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        query
      });
      
      throw error;
    }
  }
  
  /**
   * Aggregate with logging
   */
  async aggregate(pipeline: any[], options: any = {}): Promise<any[]> {
    const operation = DbOperation.AGGREGATE;
    const collection = this.collectionName;
    const query = { pipeline, options };
    const startTime = performance.now();
    
    try {
      this.logger.debug(`${operation} started`, {
        collection,
        operation,
        query
      });
      
      const result = await this.collection.aggregate(pipeline, options).toArray();
      
      const duration = performance.now() - startTime;
      
      this.logger.debug(
        `${operation} completed in ${duration.toFixed(2)}ms`,
        {
          collection,
          operation,
          duration,
          documentCount: result.length
        }
      );
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      this.logger.error(`${operation} failed after ${duration.toFixed(2)}ms`, {
        error,
        collection,
        operation,
        duration,
        query
      });
      
      throw error;
    }
  }
  
  /**
   * Get the native MongoDB collection object
   */
  getNativeCollection(): Collection<T> {
    return this.collection;
  }
}

/**
 * Close the MongoDB connection with logging
 */
export async function closeConnection(): Promise<void> {
  if (!client) {
    logger.debug('No MongoDB connection to close');
    return;
  }
  
  logger.info('Closing MongoDB connection');
  const startTime = performance.now();
  
  try {
    await client.close();
    const duration = performance.now() - startTime;
    logger.info(`MongoDB connection closed in ${duration.toFixed(2)}ms`);
  } catch (error) {
    const duration = performance.now() - startTime;
    logger.error(`Error closing MongoDB connection after ${duration.toFixed(2)}ms`, error);
    throw error;
  } finally {
    client = null;
    clientPromise = null as unknown as Promise<MongoClient>;
  }
}

// Export the MongoDB client cache
export { clientPromise };

export async function disconnectFromDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    clientPromise = null as unknown as Promise<MongoClient>;
    logger.info('Disconnected from MongoDB', { source: 'mongodb' });
  }
}

// Add export for development testing
if (process.env.NODE_ENV === 'development') {
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, closing MongoDB connection', { source: 'mongodb' });
    if (client) {
      await client.close();
      client = null;
      clientPromise = null as unknown as Promise<MongoClient>;
      logger.info('Closed MongoDB connection', { source: 'mongodb' });
    }
    process.exit(0);
  });
}
