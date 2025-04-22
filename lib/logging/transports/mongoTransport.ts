/**
 * mongoTransport.ts
 * 
 * MongoDB transport for the logger - stores logs in MongoDB for
 * advanced querying, analysis, and long-term storage
 */

import { MongoClient, Collection, Db } from 'mongodb';
import { LogLevel } from '../logger';
import { LogEntry } from '../types/common';

export interface MongoTransportOptions {
  minLevel: LogLevel;
  connectionString: string;
  dbName: string;
  collectionName: string;
  batchSize: number;         // Number of logs to batch before writing
  flushInterval: number;     // Milliseconds between forced flushes
  maxRetries: number;        // Max retries for failed writes
  retryInterval: number;     // Milliseconds between retries
  maxQueueSize: number;      // Max logs to queue before dropping
}

/**
 * Log entry for MongoDB
 * @deprecated Use LogEntry from '@/lib/logging/types/common' instead
 */
export interface MongoLogEntry extends LogEntry {
  timestamp: Date; // Override timestamp to be Date type for MongoDB
}

/**
 * Default options for the MongoDB transport
 */
const DEFAULT_OPTIONS: MongoTransportOptions = {
  minLevel: LogLevel.INFO,
  connectionString: '',
  dbName: 'the_story_teller',
  collectionName: 'logs',
  batchSize: 10,
  flushInterval: 5000, // 5 seconds
  maxRetries: 3,
  retryInterval: 1000, // 1 second
  maxQueueSize: 1000
};

/**
 * Transport for logging to MongoDB
 */
export class MongoTransport {
  private options: MongoTransportOptions;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<MongoLogEntry> | null = null;
  private queue: MongoLogEntry[] = [];
  private isConnected: boolean = false;
  private isConnecting: boolean = false;
  private flushTimer: NodeJS.Timeout | null = null;
  private isWriting: boolean = false;
  
  constructor(options: Partial<MongoTransportOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Start flush timer
    this.startFlushTimer();
  }
  
  /**
   * Connect to MongoDB if not already connected
   */
  async connect(): Promise<void> {
    if (this.isConnected || this.isConnecting) {
      return;
    }
    
    // Validate connection string
    if (!this.options.connectionString) {
      throw new Error('MongoDB connection string is required');
    }
    
    this.isConnecting = true;
    
    try {
      // Connect to MongoDB
      this.client = new MongoClient(this.options.connectionString, {
        // Add connection options if needed
      });
      
      await this.client.connect();
      
      // Get database and collection
      this.db = this.client.db(this.options.dbName);
      this.collection = this.db.collection<MongoLogEntry>(this.options.collectionName);
      
      // Set up indexes
      await this.setupIndexes();
      
      this.isConnected = true;
      this.isConnecting = false;
      
      // Flush any queued logs
      this.flush().catch(error => {
        console.error('Failed to flush logs after connection:', error);
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }
  
  /**
   * Set up indexes for the logs collection
   */
  private async setupIndexes(): Promise<void> {
    if (!this.collection) {
      return;
    }
    
    try {
      // Create indexes for commonly queried fields
      await this.collection.createIndexes([
        { key: { timestamp: 1 }, name: 'timestamp_index' },
        { key: { level: 1 }, name: 'level_index' },
        { key: { correlationId: 1 }, name: 'correlationId_index' },
        { key: { userId: 1 }, name: 'userId_index' },
        { key: { requestId: 1 }, name: 'requestId_index' },
        { key: { 'clientInfo.ip': 1 }, name: 'clientIp_index' },
        // Compound indexes for common queries
        { key: { timestamp: 1, level: 1 }, name: 'timestamp_level_index' },
        { key: { userId: 1, timestamp: 1 }, name: 'userId_timestamp_index' },
        // Text index for searching
        { 
          key: { message: 'text', component: 'text', method: 'text', path: 'text' },
          name: 'text_search_index' 
        }
      ]);
    } catch (error) {
      console.error('Failed to create MongoDB indexes:', error);
    }
  }
  
  /**
   * Log a message to MongoDB
   */
  async log(logEntry: Omit<MongoLogEntry, 'timestamp'>): Promise<void> {
    // Skip if this log level is below the minimum configured level
    if (LogLevel[logEntry.level as keyof typeof LogLevel] < this.options.minLevel) {
      return;
    }
    
    // Prepare log entry
    const entry: MongoLogEntry = {
      ...logEntry,
      timestamp: new Date()
    };
    
    // Add to queue
    this.queue.push(entry);
    
    // Drop oldest logs if queue is too large
    if (this.queue.length > this.options.maxQueueSize) {
      this.queue.splice(0, this.queue.length - this.options.maxQueueSize);
    }
    
    // Flush immediately if batch size is reached
    if (this.queue.length >= this.options.batchSize) {
      this.flush().catch(error => {
        console.error('Failed to flush logs:', error);
      });
    }
  }
  
  /**
   * Flush all queued logs to MongoDB
   */
  async flush(): Promise<void> {
    // Skip if no logs to flush or already writing
    if (this.queue.length === 0 || this.isWriting) {
      return;
    }
    
    // Mark as writing
    this.isWriting = true;
    
    try {
      // Connect if not connected
      if (!this.isConnected) {
        await this.connect();
      }
      
      // Get the logs to flush
      const logsToFlush = [...this.queue];
      this.queue = [];
      
      // Write to MongoDB
      if (this.collection) {
        await this.writeToMongo(logsToFlush);
      } else {
        // If collection not available, put logs back in queue
        this.queue = [...logsToFlush, ...this.queue];
      }
    } catch (error) {
      console.error('Failed to flush logs to MongoDB:', error);
      
      // Put logs back in queue
      this.queue = [...this.queue];
    } finally {
      this.isWriting = false;
    }
  }
  
  /**
   * Write logs to MongoDB with retries
   */
  private async writeToMongo(logs: MongoLogEntry[]): Promise<void> {
    if (!this.collection || logs.length === 0) {
      return;
    }
    
    let retries = 0;
    
    while (retries <= this.options.maxRetries) {
      try {
        // Insert logs
        await this.collection.insertMany(logs, { ordered: false });
        return;
      } catch (error) {
        retries++;
        
        if (retries > this.options.maxRetries) {
          throw error;
        }
        
        // Wait before retrying
        await new Promise<void>(resolve => {
          setTimeout(resolve, this.options.retryInterval);
        });
      }
    }
  }
  
  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        console.error('Failed to flush logs on interval:', error);
      });
    }, this.options.flushInterval);
  }
  
  /**
   * Update the transport options
   */
  updateOptions(options: Partial<MongoTransportOptions>): void {
    const oldInterval = this.options.flushInterval;
    
    // Update options
    this.options = { ...this.options, ...options };
    
    // Restart flush timer if interval changed
    if (oldInterval !== this.options.flushInterval) {
      this.startFlushTimer();
    }
  }
  
  /**
   * Close the transport and clean up resources
   */
  async close(): Promise<void> {
    // Clear flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush any remaining logs
    await this.flush();
    
    // Close MongoDB connection
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
      this.isConnected = false;
    }
  }
}
