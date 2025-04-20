/**
 * mongodb.ts
 * 
 * A MongoDB client wrapper with integrated logging
 */

import { MongoClient, Db, Collection } from 'mongodb';
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
    clientPromise = null;
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
export async function getCollection<T>(collectionName: string): Promise<LoggedCollection<T>> {
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
class LoggedCollection<T> {
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
    return logDbOperation(
      DbOperation.FIND,
      this.collectionName,
      { filter, options },
      async () => {
        const result = await this.collection.find(filter, options).toArray();
        return result;
      }
    );
  }
  
  /**
   * Find a single document with logging
   */
  async findOne(filter: any = {}, options: any = {}): Promise<T | null> {
    return logDbOperation(
      DbOperation.FIND_ONE,
      this.collectionName,
      { filter, options },
      async () => {
        const result = await this.collection.findOne(filter, options);
        return result;
      }
    );
  }
  
  /**
   * Insert a document with logging
   */
  async insertOne(document: any): Promise<any> {
    return logDbOperation(
      DbOperation.INSERT,
      this.collectionName,
      { document },
      async () => {
        const result = await this.collection.insertOne(document);
        return result;
      }
    );
  }
  
  /**
   * Insert multiple documents with logging
   */
  async insertMany(documents: any[]): Promise<any> {
    return logDbOperation(
      DbOperation.INSERT,
      this.collectionName,
      { count: documents.length },
      async () => {
        const result = await this.collection.insertMany(documents);
        return result;
      }
    );
  }
  
  /**
   * Update a document with logging
   */
  async updateOne(filter: any, update: any, options: any = {}): Promise<any> {
    return logDbOperation(
      DbOperation.UPDATE,
      this.collectionName,
      { filter, update, options },
      async () => {
        const result = await this.collection.updateOne(filter, update, options);
        return result;
      }
    );
  }
  
  /**
   * Update multiple documents with logging
   */
  async updateMany(filter: any, update: any, options: any = {}): Promise<any> {
    return logDbOperation(
      DbOperation.UPDATE,
      this.collectionName,
      { filter, update, options },
      async () => {
        const result = await this.collection.updateMany(filter, update, options);
        return result;
      }
    );
  }
  
  /**
   * Delete a document with logging
   */
  async deleteOne(filter: any, options: any = {}): Promise<any> {
    return logDbOperation(
      DbOperation.DELETE,
      this.collectionName,
      { filter, options },
      async () => {
        const result = await this.collection.deleteOne(filter, options);
        return result;
      }
    );
  }
  
  /**
   * Delete multiple documents with logging
   */
  async deleteMany(filter: any, options: any = {}): Promise<any> {
    return logDbOperation(
      DbOperation.DELETE,
      this.collectionName,
      { filter, options },
      async () => {
        const result = await this.collection.deleteMany(filter, options);
        return result;
      }
    );
  }
  
  /**
   * Aggregate with logging
   */
  async aggregate(pipeline: any[], options: any = {}): Promise<any[]> {
    return logDbOperation(
      DbOperation.AGGREGATE,
      this.collectionName,
      { pipeline, options },
      async () => {
        const result = await this.collection.aggregate(pipeline, options).toArray();
        return result;
      }
    );
  }
  
  /**
   * Get the native collection (for operations not covered by the wrapper)
   */
  getNativeCollection(): Collection<T> {
    this.logger.debug('Getting native collection');
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
    clientPromise = null;
  }
}

// Export the MongoDB client cache
export { clientPromise };
