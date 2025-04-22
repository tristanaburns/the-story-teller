/**
 * Type definitions for the centralized logging system
 */

import { LogLevel } from '../logger';

// Re-export the LogEntry type from common
export { LogEntry } from './common';

/**
 * Log query parameters for filtering logs
 */
export interface LogQueryParams {
  level?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  context?: string;
  component?: string;
  method?: string;
  path?: string;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  mcpServer?: string;
  environment?: string;
  limit?: number;
  skip?: number;
}

/**
 * Log aggregation result for summary endpoints
 */
export interface LogAggregationResult {
  _id: string;
  count: number;
}

/**
 * Log count by level
 */
export interface LogLevelCount {
  level: string;
  count: number;
}

/**
 * Log count by component
 */
export interface LogComponentCount {
  component: string;
  count: number;
}

/**
 * Log count by timeframe
 */
export interface LogTimeframeCount {
  timeframe: string;
  counts: {
    [level: string]: number;
  };
}

/**
 * Log count by status code
 */
export interface LogStatusCodeCount {
  statusCode: number;
  count: number;
}

/**
 * Log statistics summary
 */
export interface LogStatisticsSummary {
  totalLogs: number;
  totalErrors: number;
  avgResponseTime?: number;
  statusCodeDistribution: LogStatusCodeCount[];
  levelDistribution: LogLevelCount[];
  componentDistribution: LogComponentCount[];
  timeframeDistribution: LogTimeframeCount[];
}

/**
 * Client-side log data structure
 */
export interface ClientLogData {
  level: string;
  message: string;
  context?: string;
  component?: string;
  correlationId?: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
  data?: any;
}

/**
 * API Logger configuration
 */
export interface ApiLoggerConfig {
  includeRequest?: boolean;
  includeResponse?: boolean;
  includeDuration?: boolean;
  redactHeaders?: string[];
  redactBodyFields?: string[];
}

/**
 * Database Logger configuration
 */
export interface DbLoggerConfig {
  includeParams?: boolean;
  includeResults?: boolean;
  includeDuration?: boolean;
  logQueries?: boolean;
  maxResultSize?: number;
}

/**
 * MCP Logger configuration
 */
export interface McpLoggerConfig {
  includeRequest?: boolean;
  includeResponse?: boolean;
  includeDuration?: boolean;
  logServerStatus?: boolean;
}

/**
 * Client Logger configuration
 */
export interface ClientLoggerConfig {
  minLevel: LogLevel;
  batchInterval: number;
  maxBatchSize: number;
  url: string;
  includeUserInfo: boolean;
}
