/**
 * logQuery.ts
 * 
 * Utilities for querying and analyzing logs
 */

import { MongoClient, Collection } from 'mongodb';
import { ObjectId } from 'mongodb';
import { createLogger } from './logger';

// Create a logger for this module
const logger = createLogger('LogQuery');

// Rename the import to avoid conflict
import { LogEntry as TransportLogEntry } from './transports';

/**
 * Query parameters for log retrieval
 */
export interface LogQueryParams {
  startDate?: Date;
  endDate?: Date;
  level?: string | string[];
  context?: string | string[];
  correlationId?: string;
  userId?: string;
  search?: string;
  component?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  mcpServer?: string;
  limit?: number;
  skip?: number;
  sort?: Record<string, 1 | -1>;
}

/**
 * Log summary response structure
 */
export interface LogSummary {
  totalLogs: number;
  countByLevel: Record<string, number>;
  countByContext: Record<string, number>;
  averageDuration?: number;
  errorRate?: number;
  topSlowest?: Array<{
    path: string;
    method: string;
    averageDuration: number;
    count: number;
  }>;
  slowestRequests?: Array<{
    path: string;
    method: string;
    averageDuration: number;
    count: number;
  }>;
  mostFrequentErrors?: Array<{
    message: string;
    count: number;
  }>;
  requestsByHour?: Array<{
    hour: number;
    count: number;
  }>;
  timeDistribution?: Array<{
    hour: number;
    count: number;
  }>;
}

interface LogAggregationResult {
  _id: string | number | ObjectId;
  count: number;
  averageDuration?: number;
}

interface LogEntry {
  _id: string | ObjectId;
  timestamp: Date;
  level: string;
  message: string;
  context: Record<string, any>;
  count?: number;
  averageDuration?: number;
  source?: string;
}

/**
 * Create a query builder for the logs collection
 */
export class LogQuery {
  private connectionString: string;
  private databaseName: string;
  private collectionName: string;
  private client: MongoClient | null = null;
  private collection: Collection<TransportLogEntry> | null = null;
  
  /**
   * Constructor
   */
  constructor(
    connectionString: string,
    databaseName: string = 'logs',
    collectionName: string = 'logs'
  ) {
    this.connectionString = connectionString;
    this.databaseName = databaseName;
    this.collectionName = collectionName;
  }
  
  /**
   * Connect to the MongoDB database
   */
  private async connect(): Promise<void> {
    if (this.client) {
      return;
    }
    
    try {
      logger.debug('Connecting to MongoDB for log query');
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      
      const db = this.client.db(this.databaseName);
      this.collection = db.collection<TransportLogEntry>(this.collectionName);
      
      logger.debug('Connected to MongoDB logs database');
    } catch (error) {
      logger.error('Failed to connect to MongoDB logs database', error);
      throw error;
    }
  }
  
  /**
   * Build a MongoDB filter from query parameters
   */
  private buildFilter(params: LogQueryParams): Record<string, any> {
    const filter: Record<string, any> = {};
    
    // Date range
    if (params.startDate || params.endDate) {
      filter.timestamp = {};
      
      if (params.startDate) {
        filter.timestamp.$gte = params.startDate;
      }
      
      if (params.endDate) {
        filter.timestamp.$lte = params.endDate;
      }
    }
    
    // Log level
    if (params.level) {
      if (Array.isArray(params.level)) {
        filter.level = { $in: params.level };
      } else {
        filter.level = params.level;
      }
    }
    
    // Context
    if (params.context) {
      if (Array.isArray(params.context)) {
        filter.context = { $in: params.context };
      } else {
        filter.context = params.context;
      }
    }
    
    // Correlation ID
    if (params.correlationId) {
      filter.correlationId = params.correlationId;
    }
    
    // User ID
    if (params.userId) {
      filter.userId = params.userId;
    }
    
    // Component
    if (params.component) {
      filter.component = params.component;
    }
    
    // Method
    if (params.method) {
      filter.method = params.method;
    }
    
    // Path
    if (params.path) {
      filter.path = params.path;
    }
    
    // Status code
    if (params.statusCode) {
      filter.statusCode = params.statusCode;
    }
    
    // MCP server
    if (params.mcpServer) {
      filter.mcpServer = params.mcpServer;
    }
    
    // Text search
    if (params.search) {
      filter.$text = { $search: params.search };
    }
    
    return filter;
  }
  
  /**
   * Query logs based on parameters
   */
  async queryLogs(options: LogQueryParams): Promise<TransportLogEntry[]> {
    await this.connect();
    
    // Build query filter
    const filter = this.buildFilter(options);
    
    try {
      logger.debug('Querying logs', { filter, options });
      
      // Create a cursor for the query
      const logsCursor = this.collection!.find(filter);
      
      // Apply sort if provided
      if (options.sort) {
        logsCursor.sort(options.sort);
      }
      
      // Apply pagination
      if (options.skip) {
        logsCursor.skip(options.skip);
      }
      
      if (options.limit) {
        logsCursor.limit(options.limit);
      }
      
      // Execute query
      const logs = await logsCursor.toArray();
      
      logger.debug(`Found ${logs.length} logs`);
      return logs;
    } catch (error) {
      logger.error('Error querying logs', error);
      throw error;
    }
  }
  
  /**
   * Count logs matching parameters
   */
  public async countLogs(params: LogQueryParams): Promise<number> {
    await this.connect();
    
    if (!this.collection) {
      throw new Error('MongoDB collection not initialized');
    }
    
    // Build filter
    const filter = this.buildFilter(params);
    
    // Execute count
    logger.debug('Counting logs', { filter });
    
    try {
      const count = await this.collection.countDocuments(filter);
      logger.debug(`Counted ${count} logs`);
      
      return count;
    } catch (error) {
      logger.error('Error counting logs', error);
      throw error;
    }
  }
  
  /**
   * Get a summary of logs
   */
  async generateSummary(options: LogQueryParams): Promise<LogSummary> {
    await this.connect();
    
    const filter = this.buildFilter(options);
    
    try {
      logger.debug('Getting log summary', { filter });
      
      // Create a cursor for the query
      const logsCursor = this.collection!.find(filter);
      
      // Apply count to get total logs
      const totalLogsResult = await this.collection!.countDocuments(filter);
      
      // Calculate count by log level - use aggregate for SQL-like grouping
      const levelResults = await this.collection!.aggregate<LogAggregationResult>([
        { $match: filter },
        { $group: { _id: '$level', count: { $sum: 1 } } }
      ]).toArray();
      
      const countByLevel: Record<string, number> = {};
      levelResults.forEach(result => {
        countByLevel[result._id as string] = result.count;
      });
      
      // Calculate count by context (source)
      const contextResults = await this.collection!.aggregate<LogAggregationResult>([
        { $match: filter },
        { $group: { _id: '$source', count: { $sum: 1 } } }
      ]).toArray();
      
      const countByContext: Record<string, number> = {};
      contextResults.forEach(result => {
        countByContext[result._id as string] = result.count;
      });
      
      // Calculate average duration for API requests
      const durationResults = await this.collection!.aggregate<LogAggregationResult>([
        { 
          $match: { 
            ...filter,
            'context.duration': { $exists: true },
            source: 'API'
          } 
        },
        { 
          $group: { 
            _id: null, 
            averageDuration: { $avg: '$context.duration' } 
          } 
        }
      ]).toArray();
      
      const averageDuration = durationResults.length > 0 ? durationResults[0].averageDuration : undefined;
      
      // Get the slowest API endpoints
      const slowestRequestsPipeline = [
        { 
          $match: { 
            ...filter,
            'context.duration': { $exists: true },
            'context.path': { $exists: true },
            source: 'API'
          } 
        },
        { 
          $group: { 
            _id: {
              path: '$context.path',
              method: '$context.method'
            },
            averageDuration: { $avg: '$context.duration' },
            count: { $sum: 1 }
          } 
        },
        { $sort: { averageDuration: -1 } },
        { $limit: 5 }
      ];
      
      const slowestRequestsResults = await this.collection!.aggregate<any>(slowestRequestsPipeline).toArray();
      
      const topSlowest = slowestRequestsResults.map(result => ({
        path: result._id.path,
        method: result._id.method || 'GET',
        averageDuration: result.averageDuration,
        count: result.count
      }));
      
      // Get most frequent errors
      const mostFrequentErrorsPipeline = [
        { 
          $match: { 
            ...filter,
            level: 'error'
          } 
        },
        { 
          $group: { 
            _id: '$message',
            count: { $sum: 1 }
          } 
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ];
      
      const mostFrequentErrorsResults = await this.collection!.aggregate<LogAggregationResult>(mostFrequentErrorsPipeline).toArray();
      
      const mostFrequentErrors = mostFrequentErrorsResults.map((result) => ({
        message: result._id as string,
        count: result.count ?? 0
      }));
      
      // Get hourly distribution for the last 24 hours
      const hourlyResults = await this.collection!.aggregate<LogAggregationResult>([
        { $match: filter },
        { 
          $group: { 
            _id: { $hour: '$timestamp' }, 
            count: { $sum: 1 } 
          } 
        },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      const requestsByHour = hourlyResults.map(result => ({
        hour: Number(result._id),
        count: result.count
      }));
      
      // Construct the summary response
      const summary: LogSummary = {
        totalLogs: totalLogsResult,
        countByLevel,
        countByContext,
        averageDuration,
        errorRate: 0, // Assuming errorRate is not available in the new summary
        topSlowest,
        slowestRequests: topSlowest,
        mostFrequentErrors,
        requestsByHour,
        timeDistribution: requestsByHour
      };
      
      logger.debug('Log summary generated', { summary });
      return summary;
    } catch (error) {
      logger.error('Error generating log summary', error);
      throw error;
    }
  }
  
  /**
   * Close the database connection
   */
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.collection = null;
      logger.debug('Closed MongoDB connection for log querying');
    }
  }
}

/**
 * Create a log query service
 */
export function createLogQueryService(
  connectionString: string = process.env.MONGODB_URI || '',
  dbName: string = process.env.MONGODB_DB || 'the_story_teller',
  collectionName: string = 'logs'
): LogQuery {
  return new LogQuery(connectionString, dbName, collectionName);
}

// Export a singleton instance for reuse
export const logQueryService = createLogQueryService();
