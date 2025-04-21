/**
 * mongoTransport.ts
 * 
 * A transport for storing logs in MongoDB
 */

import { MongoClient, Collection, Document } from 'mongodb';
import { LogLevel } from '../logger';

// Interface for log entries stored in MongoDB
export interface LogEntry extends Document {
  timestamp: Date;
  level: string;
  message: string;
  context: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  component?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  environment: string;
  appVersion?: string;
  mcpServer?: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    code?: string;
    details?: any;
  };
  clientInfo?: {
    ip?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
  };
  metadata?: Record<string, any>;
}

// Options for MongoDB transport
export interface MongoTransportOptions {
  connectionString?: string;
  dbName?: string;
  collectionName?: string;
  expireAfterSeconds?: number;
  batchSize?: number;
  flushInterval?: number;
  minLevel?: LogLevel;
}

/**
 * A transport that stores logs in MongoDB
 */
export class MongoTransport {
  private client: MongoClient | null = null;
  private collection: Collection<LogEntry> | null = null;
  private options: MongoTransportOptions;
  private logQueue: LogEntry[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private connected = false;
  private connecting = false;

  constructor(options: MongoTransportOptions) {
    this.options = {
      expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days by default
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      minLevel: LogLevel.INFO,
      ...options
    };
  }

  /**
   * Connect to MongoDB
   */
  public async connect(): Promise<void> {
    if (this.connected || this.connecting) {
      return;
    }

    // Skip if connection string is missing
    if (!this.options.connectionString) {
      console.warn('MongoDB connection string is missing for logging');
      return;
    }

    this.connecting = true;

    try {
      this.client = new MongoClient(this.options.connectionString);
      await this.client.connect();

      const dbName = this.options.dbName || 'logs';
      const collectionName = this.options.collectionName || 'logs';
      
      const db = this.client.db(dbName);
      this.collection = db.collection<LogEntry>(collectionName);

      // Create TTL index if it doesn't exist
      if (this.options.expireAfterSeconds) {
        await this.collection.createIndex(
          { timestamp: 1 },
          { 
            expireAfterSeconds: this.options.expireAfterSeconds,
            background: true 
          }
        );
      }

      // Create indexes for common queries
      await this.collection.createIndex({ level: 1 });
      await this.collection.createIndex({ context: 1 });
      await this.collection.createIndex({ correlationId: 1 });
      await this.collection.createIndex({ userId: 1 });
      await this.collection.createIndex({ requestId: 1 });
      await this.collection.createIndex({ timestamp: 1 });

      this.connected = true;
      this.connecting = false;

      // Start flushing logs periodically
      this.startFlushInterval();
    } catch (error) {
      this.connecting = false;
      console.error('Failed to connect to MongoDB for logging:', error);
      
      // Try to reconnect after a delay
      setTimeout(() => this.connect(), 10000);
    }
  }

  /**
   * Start the flush interval
   */
  private startFlushInterval(): void {
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
    }

    this.flushTimeout = setInterval(
      () => this.flush(),
      this.options.flushInterval
    );
  }

  /**
   * Log an entry
   */
  public async log(entry: Partial<LogEntry>): Promise<void> {
    // Add timestamp
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level: 'info', // Default level
      message: '', // Default message
      context: '', // Default context
      environment: process.env.NODE_ENV || 'development',
      appVersion: process.env.APP_VERSION || '1.0.0',
      ...entry
    };

    // Add to queue
    this.logQueue.push(logEntry);

    // Connect if not already connected
    if (!this.connected && !this.connecting) {
      this.connect();
    }

    // Flush if batch size reached
    if (this.logQueue.length >= this.options.batchSize!) {
      this.flush();
    }
  }

  /**
   * Flush queued logs to MongoDB
   */
  public async flush(): Promise<void> {
    if (!this.connected || this.logQueue.length === 0) {
      return;
    }

    const logs = [...this.logQueue];
    this.logQueue = [];

    try {
      if (this.collection) {
        await this.collection.insertMany(logs, { ordered: false });
      }
    } catch (error) {
      console.error('Failed to write logs to MongoDB:', error);
      
      // Put logs back in queue
      this.logQueue = [...logs, ...this.logQueue];
    }
  }

  /**
   * Close the MongoDB connection
   */
  public async close(): Promise<void> {
    // Flush any remaining logs
    await this.flush();

    // Clear the flush interval
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
      this.flushTimeout = null;
    }

    // Close the connection
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.collection = null;
      this.connected = false;
    }
  }
}

export default MongoTransport;
