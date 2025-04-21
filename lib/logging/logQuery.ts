/**
 * Log query service for fetching and analyzing logs
 */

import { MongoClient, Collection, ObjectId } from 'mongodb';
import { createLogger, LogMethod } from './logger';
import { LogEntry, LogQueryParams, LogStatisticsSummary } from './types';

// Initialize logger
const logger = createLogger('LogQueryService');

/**
 * Service for querying and analyzing log data
 */
class LogQueryService {
  private client: MongoClient | null = null;
  private collectionName: string = 'logs';
  private dbName: string = '';
  private mongoUri: string = '';
  
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || '';
    this.dbName = process.env.MONGODB_DB || 'the_story_teller';
  }
  
  /**
   * Connect to MongoDB client
   */
  @LogMethod()
  private async getCollection(): Promise<Collection<LogEntry>> {
    if (!this.client) {
      this.client = new MongoClient(this.mongoUri);
      await this.client.connect();
      logger.debug('Connected to MongoDB for log queries');
    }
    
    return this.client.db(this.dbName).collection<LogEntry>(this.collectionName);
  }
  
  /**
   * Build MongoDB query from query parameters
   */
  private buildQuery(params: LogQueryParams): Record<string, any> {
    const query: Record<string, any> = {};
    
    // Filter by level
    if (params.level) {
      query.level = params.level;
    }
    
    // Filter by date range
    if (params.startDate || params.endDate) {
      query.timestamp = {};
      
      if (params.startDate) {
        query.timestamp.$gte = params.startDate.toISOString();
      }
      
      if (params.endDate) {
        query.timestamp.$lte = params.endDate.toISOString();
      }
    }
    
    // Filter by component
    if (params.component) {
      query.component = { $regex: params.component, $options: 'i' };
    }
    
    // Filter by context
    if (params.context) {
      query.context = { $regex: params.context, $options: 'i' };
    }
    
    // Filter by correlation ID
    if (params.correlationId) {
      query.correlationId = params.correlationId;
    }
    
    // Filter by user ID
    if (params.userId) {
      query.userId = params.userId;
    }
    
    // Filter by request ID
    if (params.requestId) {
      query.requestId = params.requestId;
    }
    
    // Filter by MCP server
    if (params.mcpServer) {
      query.mcpServer = params.mcpServer;
    }
    
    // Filter by environment
    if (params.environment) {
      query.environment = params.environment;
    }
    
    // Filter by path
    if (params.path) {
      query.path = { $regex: params.path, $options: 'i' };
    }
    
    // Filter by method
    if (params.method) {
      query.method = params.method;
    }
    
    // Full text search
    if (params.search) {
      query.$or = [
        { message: { $regex: params.search, $options: 'i' } },
        { 'error.message': { $regex: params.search, $options: 'i' } },
        { 'error.stack': { $regex: params.search, $options: 'i' } }
      ];
    }
    
    return query;
  }
  
  /**
   * Query logs using the provided parameters
   */
  @LogMethod()
  public async queryLogs(params: LogQueryParams): Promise<LogEntry[]> {
    try {
      const collection = await this.getCollection();
      const query = this.buildQuery(params);
      
      logger.debug('Querying logs with parameters', { params, query });
      
      const logs = await collection
        .find(query)
        .sort({ timestamp: -1 })
        .skip(params.skip || 0)
        .limit(params.limit || 100)
        .toArray();
      
      logger.info('Log query successful', { count: logs.length });
      return logs;
    } catch (error) {
      logger.error('Error querying logs', error);
      throw error;
    }
  }
  
  /**
   * Count logs matching the provided parameters
   */
  @LogMethod()
  public async countLogs(params: LogQueryParams): Promise<number> {
    try {
      const collection = await this.getCollection();
      const query = this.buildQuery(params);
      
      logger.debug('Counting logs with parameters', { params, query });
      
      const count = await collection.countDocuments(query);
      
      logger.info('Log count successful', { count });
      return count;
    } catch (error) {
      logger.error('Error counting logs', error);
      throw error;
    }
  }
  
  /**
   * Get log statistics summary
   */
  @LogMethod()
  public async getLogStatistics(params: LogQueryParams): Promise<LogStatisticsSummary> {
    try {
      const collection = await this.getCollection();
      const query = this.buildQuery(params);
      
      logger.debug('Getting log statistics with parameters', { params, query });
      
      // Get basic count statistics
      const totalLogs = await collection.countDocuments(query);
      
      // Count errors (ERROR and FATAL levels)
      const errorQuery = { ...query, level: { $in: ['ERROR', 'FATAL'] } };
      const totalErrors = await collection.countDocuments(errorQuery);
      
      // Get average response time for API requests with duration
      const apiRequestsWithDuration = await collection
        .find({ ...query, duration: { $exists: true } })
        .toArray();
      
      const avgResponseTime = apiRequestsWithDuration.length > 0
        ? apiRequestsWithDuration.reduce((sum, log) => sum + (log.duration || 0), 0) / apiRequestsWithDuration.length
        : undefined;
      
      // Get status code distribution
      const statusCodePipeline = [
        { $match: { ...query, statusCode: { $exists: true } } },
        { $group: { _id: '$statusCode', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ];
      
      const statusCodeDistribution = await collection
        .aggregate(statusCodePipeline)
        .toArray();
      
      // Get level distribution
      const levelPipeline = [
        { $match: query },
        { $group: { _id: '$level', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ];
      
      const levelDistribution = await collection
        .aggregate(levelPipeline)
        .toArray();
      
      // Get component distribution
      const componentPipeline = [
        { $match: { ...query, component: { $exists: true } } },
        { $group: { _id: '$component', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ];
      
      const componentDistribution = await collection
        .aggregate(componentPipeline)
        .toArray();
      
      // Get timeframe distribution (by hour)
      const timeframePipeline = [
        { $match: query },
        {
          $project: {
            hour: { $substr: ['$timestamp', 0, 13] },
            level: 1
          }
        },
        {
          $group: {
            _id: {
              hour: '$hour',
              level: '$level'
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.hour',
            levels: {
              $push: {
                level: '$_id.level',
                count: '$count'
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ];
      
      const timeframeResults = await collection
        .aggregate(timeframePipeline)
        .toArray();
      
      // Transform timeframe results into usable format
      const timeframeDistribution = timeframeResults.map(result => {
        const counts: Record<string, number> = {};
        
        result.levels.forEach((levelData: any) => {
          counts[levelData.level] = levelData.count;
        });
        
        return {
          timeframe: result._id,
          counts
        };
      });
      
      // Prepare and return the complete statistics summary
      const statistics: LogStatisticsSummary = {
        totalLogs,
        totalErrors,
        avgResponseTime,
        statusCodeDistribution: statusCodeDistribution.map(item => ({
          statusCode: item._id,
          count: item.count
        })),
        levelDistribution: levelDistribution.map(item => ({
          level: item._id,
          count: item.count
        })),
        componentDistribution: componentDistribution.map(item => ({
          component: item._id,
          count: item.count
        })),
        timeframeDistribution
      };
      
      logger.info('Log statistics generated successfully');
      return statistics;
    } catch (error) {
      logger.error('Error generating log statistics', error);
      throw error;
    }
  }
  
  /**
   * Get related logs by correlation ID
   */
  @LogMethod()
  public async getRelatedLogs(correlationId: string, params?: Partial<LogQueryParams>): Promise<LogEntry[]> {
    try {
      if (!correlationId) {
        throw new Error('Correlation ID is required');
      }
      
      const collection = await this.getCollection();
      const query = { correlationId };
      
      logger.debug('Getting related logs by correlation ID', { correlationId });
      
      const logs = await collection
        .find(query)
        .sort({ timestamp: 1 })
        .limit(params?.limit || 500)
        .toArray();
      
      logger.info('Related logs retrieved successfully', { count: logs.length });
      return logs;
    } catch (error) {
      logger.error('Error retrieving related logs', error);
      throw error;
    }
  }
  
  /**
   * Get specific log by ID
   */
  @LogMethod()
  public async getLogById(id: string): Promise<LogEntry | null> {
    try {
      if (!id) {
        throw new Error('Log ID is required');
      }
      
      const collection = await this.getCollection();
      
      logger.debug('Getting log by ID', { id });
      
      const log = await collection.findOne({ _id: new ObjectId(id) });
      
      if (log) {
        logger.info('Log retrieved successfully', { id });
      } else {
        logger.info('Log not found', { id });
      }
      
      return log;
    } catch (error) {
      logger.error('Error retrieving log by ID', error);
      throw error;
    }
  }
  
  /**
   * Close MongoDB connection
   */
  @LogMethod()
  public async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      logger.info('MongoDB connection closed');
    }
  }
}

// Export a singleton instance of the service
export const logQueryService = new LogQueryService();

// Export the LogQueryParams interface
export type { LogQueryParams };
