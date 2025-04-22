/**
 * Log Analytics Module
 * 
 * Provides advanced analytics capabilities for log data
 * including pattern detection, anomaly detection, and performance insights
 */

import { LogLevel } from '../logger';
import { LogEntry } from '../types';
import { createLogger } from '../logger';

// Create a logger for the analytics module
const logger = createLogger('LogAnalytics');

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  api: { [key: string]: number };      // API endpoint thresholds in ms
  database: { [key: string]: number }; // Database operation thresholds in ms
  mcp: { [key: string]: number };      // MCP operation thresholds in ms
  rendering: { [key: string]: number }; // Rendering operation thresholds in ms
}

/**
 * Default performance thresholds
 */
const DEFAULT_PERFORMANCE_THRESHOLDS: PerformanceThresholds = {
  api: {
    default: 500,            // Default API threshold: 500ms
    '/api/stories': 1000,    // Stories API can take longer
    '/api/analytics': 2000   // Analytics API can take even longer
  },
  database: {
    default: 100,            // Default DB operation: 100ms
    aggregation: 1000,       // Aggregation operations: 1000ms
    'full-text-search': 500  // Full-text search: 500ms
  },
  mcp: {
    default: 2000,           // Default MCP operation: 2000ms
    'memory-recall': 500,    // Memory recall: 500ms
    'everart-generate': 5000 // Art generation: 5000ms
  },
  rendering: {
    default: 50,             // Default rendering: 50ms
    'timeline-view': 200,    // Timeline rendering: 200ms
    'relationship-graph': 500 // Relationship graph: 500ms
  }
};

/**
 * Current performance thresholds
 */
let currentThresholds = { ...DEFAULT_PERFORMANCE_THRESHOLDS };

/**
 * Configure performance thresholds
 */
export function configurePerformanceThresholds(thresholds: Partial<PerformanceThresholds>): void {
  currentThresholds = {
    ...currentThresholds,
    ...thresholds,
    // Merge nested objects
    api: { ...currentThresholds.api, ...(thresholds.api || {}) },
    database: { ...currentThresholds.database, ...(thresholds.database || {}) },
    mcp: { ...currentThresholds.mcp, ...(thresholds.mcp || {}) },
    rendering: { ...currentThresholds.rendering, ...(thresholds.rendering || {}) }
  };
  
  logger.info('Performance thresholds configured', { thresholds: currentThresholds });
}

/**
 * Performance issue detection result
 */
export interface PerformanceIssue {
  type: 'api' | 'database' | 'mcp' | 'rendering';
  operation: string;
  duration: number;
  threshold: number;
  timestamp: Date;
  correlationId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Detect performance issues in log entries
 */
export function detectPerformanceIssues(logs: LogEntry[]): PerformanceIssue[] {
  const issues: PerformanceIssue[] = [];
  
  for (const log of logs) {
    // Skip logs without duration
    if (!log.duration) continue;
    
    if (log.path && log.path.startsWith('/api/')) {
      // API performance check
      const threshold = currentThresholds.api[log.path] || currentThresholds.api.default;
      
      if (log.duration > threshold) {
        issues.push({
          type: 'api',
          operation: log.path,
          duration: log.duration,
          threshold,
          timestamp: new Date(log.timestamp),
          correlationId: log.correlationId,
          userId: log.userId,
          metadata: {
            method: log.method,
            statusCode: log.statusCode
          }
        });
      }
    } else if (log.component?.includes('Database') || log.method?.includes('db')) {
      // Database performance check
      const dbOperation = log.method || 'unknown';
      let threshold = currentThresholds.database.default;
      
      // Check for specific database operations
      if (dbOperation.includes('aggregate')) {
        threshold = currentThresholds.database.aggregation;
      } else if (dbOperation.includes('search') || dbOperation.includes('text')) {
        threshold = currentThresholds.database['full-text-search'];
      }
      
      if (log.duration > threshold) {
        issues.push({
          type: 'database',
          operation: dbOperation,
          duration: log.duration,
          threshold,
          timestamp: new Date(log.timestamp),
          correlationId: log.correlationId,
          userId: log.userId,
          metadata: {
            collection: log.metadata?.collection,
            query: log.metadata?.query
          }
        });
      }
    } else if (log.mcpServer) {
      // MCP performance check
      const mcpOperation = log.method || 'unknown';
      let threshold = currentThresholds.mcp.default;
      
      // Check for specific MCP operations
      if (mcpOperation.includes('memory') && mcpOperation.includes('recall')) {
        threshold = currentThresholds.mcp['memory-recall'];
      } else if (mcpOperation.includes('everart') && mcpOperation.includes('generate')) {
        threshold = currentThresholds.mcp['everart-generate'];
      }
      
      if (log.duration > threshold) {
        issues.push({
          type: 'mcp',
          operation: mcpOperation,
          duration: log.duration,
          threshold,
          timestamp: new Date(log.timestamp),
          correlationId: log.correlationId,
          userId: log.userId,
          metadata: {
            mcpServer: log.mcpServer,
            method: log.method
          }
        });
      }
    } else if (log.component?.includes('Render') || log.method?.includes('render')) {
      // Rendering performance check
      const renderOperation = log.method || 'unknown';
      let threshold = currentThresholds.rendering.default;
      
      // Check for specific rendering operations
      if (renderOperation.includes('timeline')) {
        threshold = currentThresholds.rendering['timeline-view'];
      } else if (renderOperation.includes('relationship') || renderOperation.includes('graph')) {
        threshold = currentThresholds.rendering['relationship-graph'];
      }
      
      if (log.duration > threshold) {
        issues.push({
          type: 'rendering',
          operation: renderOperation,
          duration: log.duration,
          threshold,
          timestamp: new Date(log.timestamp),
          correlationId: log.correlationId,
          userId: log.userId,
          metadata: {
            component: log.component
          }
        });
      }
    }
  }
  
  return issues;
}

/**
 * Error pattern detection configuration
 */
export interface ErrorPatternConfig {
  minOccurrences: number;      // Minimum occurrences to consider a pattern
  timeWindowMinutes: number;   // Time window to consider in minutes
  groupBy: ('message' | 'component' | 'path' | 'userId' | 'mcpServer')[]; // Fields to group by
}

/**
 * Default error pattern configuration
 */
const DEFAULT_ERROR_PATTERN_CONFIG: ErrorPatternConfig = {
  minOccurrences: 3,
  timeWindowMinutes: 15,
  groupBy: ['message', 'component', 'path']
};

/**
 * Error pattern detection result
 */
export interface ErrorPattern {
  pattern: string;
  count: number;
  firstOccurrence: Date;
  lastOccurrence: Date;
  affectedUsers: number;
  sampleLogs: LogEntry[];
  groupKey: string;
}

/**
 * Detect error patterns in log entries
 */
export function detectErrorPatterns(
  logs: LogEntry[], 
  config: Partial<ErrorPatternConfig> = {}
): ErrorPattern[] {
  // Merge with default config
  const finalConfig: ErrorPatternConfig = {
    ...DEFAULT_ERROR_PATTERN_CONFIG,
    ...config
  };
  
  // Filter to only error and fatal logs
  const errorLogs = logs.filter(log => 
    log.level === LogLevel[LogLevel.ERROR] || 
    log.level === LogLevel[LogLevel.FATAL]
  );
  
  if (errorLogs.length === 0) {
    return [];
  }
  
  // Set time threshold
  const timeThreshold = new Date();
  timeThreshold.setMinutes(timeThreshold.getMinutes() - finalConfig.timeWindowMinutes);
  
  // Filter logs within time window
  const recentErrorLogs = errorLogs.filter(log => 
    new Date(log.timestamp) >= timeThreshold
  );
  
  // Group logs by pattern
  const errorGroups: { [key: string]: LogEntry[] } = {};
  
  for (const log of recentErrorLogs) {
    // Create a group key based on configured fields
    const groupParts: string[] = [];
    
    for (const field of finalConfig.groupBy) {
      let value = '';
      
      if (field === 'message') {
        // For messages, extract the main part without details like IDs
        const messageParts = (log.message || '').split(/[0-9a-f-]{36}/); // Split on UUIDs
        value = messageParts[0].trim();
      } else {
        // For other fields, use the value directly
        value = log[field] || '';
      }
      
      groupParts.push(`${field}:${value}`);
    }
    
    const groupKey = groupParts.join('|');
    
    if (!errorGroups[groupKey]) {
      errorGroups[groupKey] = [];
    }
    
    errorGroups[groupKey].push(log);
  }
  
  // Convert groups to patterns
  const patterns: ErrorPattern[] = [];
  
  for (const [groupKey, logs] of Object.entries(errorGroups)) {
    if (logs.length >= finalConfig.minOccurrences) {
      // Get unique affected users
      const uniqueUsers = new Set(logs.map(log => log.userId).filter(Boolean));
      
      // Sort logs by timestamp
      const sortedLogs = [...logs].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      
      // Extract sample logs (first 3)
      const sampleLogs = sortedLogs.slice(0, 3);
      
      patterns.push({
        pattern: groupKey.split('|')[0].split(':')[1], // Extract message part
        count: logs.length,
        firstOccurrence: new Date(sortedLogs[0].timestamp),
        lastOccurrence: new Date(sortedLogs[sortedLogs.length - 1].timestamp),
        affectedUsers: uniqueUsers.size,
        sampleLogs,
        groupKey
      });
    }
  }
  
  // Sort patterns by count (descending)
  return patterns.sort((a, b) => b.count - a.count);
}

/**
 * Usage pattern result
 */
export interface UsagePattern {
  userId: string;
  requestCount: number;
  apiCalls: { [path: string]: number };
  averageResponseTime: number;
  lastActive: Date;
  sessionCount: number;
  mostUsedFeatures: string[];
  errorRate: number;
  totalErrors: number;
}

/**
 * Analyze user usage patterns
 */
export function analyzeUserPatterns(logs: LogEntry[]): UsagePattern[] {
  // Group logs by user
  const userLogs: { [userId: string]: LogEntry[] } = {};
  
  for (const log of logs) {
    if (!log.userId) continue;
    
    if (!userLogs[log.userId]) {
      userLogs[log.userId] = [];
    }
    
    userLogs[log.userId].push(log);
  }
  
  // Process each user's logs
  const patterns: UsagePattern[] = [];
  
  for (const [userId, logs] of Object.entries(userLogs)) {
    // Count API calls by path
    const apiCalls: { [path: string]: number } = {};
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    let totalErrors = 0;
    const featureCounts: { [feature: string]: number } = {};
    
    // Track session data based on time gaps
    const sessions: Date[] = [];
    let lastTimestamp: Date | null = null;
    const SESSION_GAP_MINUTES = 30; // Consider a new session after 30 minutes of inactivity
    
    // Sort logs by timestamp
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    for (const log of sortedLogs) {
      // Track API usage
      if (log.path && log.path.startsWith('/api/')) {
        if (!apiCalls[log.path]) {
          apiCalls[log.path] = 0;
        }
        apiCalls[log.path]++;
        
        // Extract feature from path
        const pathParts = log.path.split('/');
        if (pathParts.length >= 3) {
          const feature = pathParts[2]; // e.g., /api/stories -> stories
          if (!featureCounts[feature]) {
            featureCounts[feature] = 0;
          }
          featureCounts[feature]++;
        }
      }
      
      // Track response time
      if (log.duration && log.path) {
        totalResponseTime += log.duration;
        responseTimeCount++;
      }
      
      // Track errors
      if (log.level === LogLevel[LogLevel.ERROR] || log.level === LogLevel[LogLevel.FATAL]) {
        totalErrors++;
      }
      
      // Track sessions
      const timestamp = new Date(log.timestamp);
      if (lastTimestamp === null) {
        // First log, start first session
        sessions.push(timestamp);
      } else {
        // Check if we need to start a new session
        const diffMinutes = (timestamp.getTime() - lastTimestamp.getTime()) / (1000 * 60);
        if (diffMinutes > SESSION_GAP_MINUTES) {
          sessions.push(timestamp);
        }
      }
      
      lastTimestamp = timestamp;
    }
    
    // Calculate average response time
    const averageResponseTime = responseTimeCount > 0 
      ? totalResponseTime / responseTimeCount 
      : 0;
    
    // Calculate error rate
    const errorRate = logs.length > 0 
      ? (totalErrors / logs.length) * 100 
      : 0;
    
    // Get most used features
    const mostUsedFeatures = Object.entries(featureCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([feature]) => feature);
    
    // Add user pattern
    patterns.push({
      userId,
      requestCount: logs.length,
      apiCalls,
      averageResponseTime,
      lastActive: new Date(sortedLogs[sortedLogs.length - 1].timestamp),
      sessionCount: sessions.length,
      mostUsedFeatures,
      errorRate,
      totalErrors
    });
  }
  
  // Sort patterns by request count (descending)
  return patterns.sort((a, b) => b.requestCount - a.requestCount);
}

/**
 * Request flow result
 */
export interface RequestFlow {
  correlationId: string;
  steps: {
    component: string;
    operation: string;
    timestamp: Date;
    duration?: number;
    status: 'success' | 'error';
  }[];
  totalDuration: number;
  startTime: Date;
  endTime: Date;
  userId?: string;
  succeeded: boolean;
}

/**
 * Analyze request flows by correlation ID
 */
export function analyzeRequestFlows(logs: LogEntry[]): RequestFlow[] {
  // Group logs by correlation ID
  const correlationLogs: { [correlationId: string]: LogEntry[] } = {};
  
  for (const log of logs) {
    if (!log.correlationId) continue;
    
    if (!correlationLogs[log.correlationId]) {
      correlationLogs[log.correlationId] = [];
    }
    
    correlationLogs[log.correlationId].push(log);
  }
  
  // Process each correlation group
  const flows: RequestFlow[] = [];
  
  for (const [correlationId, logs] of Object.entries(correlationLogs)) {
    // Skip if too few logs to be meaningful
    if (logs.length < 2) continue;
    
    // Sort logs by timestamp
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Extract steps
    const steps = sortedLogs.map(log => ({
      component: log.component || 'unknown',
      operation: log.method || log.path || 'unknown',
      timestamp: new Date(log.timestamp),
      duration: log.duration,
      status: (log.level === LogLevel[LogLevel.ERROR] || log.level === LogLevel[LogLevel.FATAL])
        ? 'error' as const
        : 'success' as const
    }));
    
    // Calculate overall flow metrics
    const startTime = new Date(sortedLogs[0].timestamp);
    const endTime = new Date(sortedLogs[sortedLogs.length - 1].timestamp);
    const totalDuration = endTime.getTime() - startTime.getTime();
    
    // Check if any steps failed
    const hasErrors = steps.some(step => step.status === 'error');
    
    // Get user ID if available
    const userId = sortedLogs.find(log => log.userId)?.userId;
    
    flows.push({
      correlationId,
      steps,
      totalDuration,
      startTime,
      endTime,
      userId,
      succeeded: !hasErrors
    });
  }
  
  // Sort flows by start time (most recent first)
  return flows.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
}

/**
 * System health metrics
 */
export interface SystemHealthMetrics {
  errorRate: number;
  averageResponseTime: number;
  p95ResponseTime: number;
  requestRate: number;
  totalRequests: number;
  totalErrors: number;
  topErrorPaths: { path: string; count: number }[];
  timeWindowMinutes: number;
}

/**
 * Calculate system health metrics
 */
export function calculateSystemHealth(
  logs: LogEntry[], 
  timeWindowMinutes: number = 15
): SystemHealthMetrics {
  // Set time threshold
  const timeThreshold = new Date();
  timeThreshold.setMinutes(timeThreshold.getMinutes() - timeWindowMinutes);
  
  // Filter logs within time window
  const recentLogs = logs.filter(log => 
    new Date(log.timestamp) >= timeThreshold
  );
  
  if (recentLogs.length === 0) {
    return {
      errorRate: 0,
      averageResponseTime: 0,
      p95ResponseTime: 0,
      requestRate: 0,
      totalRequests: 0,
      totalErrors: 0,
      topErrorPaths: [],
      timeWindowMinutes
    };
  }
  
  // Filter API request logs
  const apiLogs = recentLogs.filter(log => 
    log.path && log.path.startsWith('/api/')
  );
  
  // Filter error logs
  const errorLogs = recentLogs.filter(log => 
    log.level === LogLevel[LogLevel.ERROR] || 
    log.level === LogLevel[LogLevel.FATAL]
  );
  
  // Count errors by path
  const errorsByPath: { [path: string]: number } = {};
  
  for (const log of errorLogs) {
    if (!log.path) continue;
    
    if (!errorsByPath[log.path]) {
      errorsByPath[log.path] = 0;
    }
    
    errorsByPath[log.path]++;
  }
  
  // Get top error paths
  const topErrorPaths = Object.entries(errorsByPath)
    .map(([path, count]) => ({ path, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // Calculate response times
  const responseTimes = apiLogs
    .filter(log => log.duration !== undefined)
    .map(log => log.duration!) // Non-null assertion after filter
    .sort((a, b) => a - b);
  
  const averageResponseTime = responseTimes.length > 0
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
    : 0;
  
  // Calculate 95th percentile response time
  const p95Index = Math.floor(responseTimes.length * 0.95);
  const p95ResponseTime = responseTimes.length > 0
    ? responseTimes[p95Index] || responseTimes[responseTimes.length - 1]
    : 0;
  
  // Calculate request rate per minute
  const requestRate = apiLogs.length / timeWindowMinutes;
  
  // Calculate error rate
  const errorRate = apiLogs.length > 0
    ? (errorLogs.length / apiLogs.length) * 100
    : 0;
  
  return {
    errorRate,
    averageResponseTime,
    p95ResponseTime,
    requestRate,
    totalRequests: apiLogs.length,
    totalErrors: errorLogs.length,
    topErrorPaths,
    timeWindowMinutes
  };
}

/**
 * Export the analytics functions
 */
export default {
  detectPerformanceIssues,
  detectErrorPatterns,
  analyzeUserPatterns,
  analyzeRequestFlows,
  calculateSystemHealth,
  configurePerformanceThresholds
};
