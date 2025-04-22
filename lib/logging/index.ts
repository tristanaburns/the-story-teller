/**
 * Logging module index file
 * 
 * Re-exports the logger functionality for easy imports throughout the application
 */

// Core logging functionality
export { 
  createLogger, 
  createLoggerWithCorrelationId,
  configureLogger, 
  Logger, 
  LogLevel,
  LogMethod,
  closeLoggers,
  setLogLevel,
  getCurrentLogLevelName,
  type LogContext,
  type MethodTracker
} from './logger';

// Types - Centralized location for all logging types
export {
  type LogEntry,
  type LogQueryParams,
  type LogStatisticsSummary,
  type ClientLogData,
  type ClientLoggerConfig,
  type LogAggregationResult,
  type LogLevelCount,
  type LogComponentCount,
  type LogTimeframeCount,
  type LogStatusCodeCount,
  type ApiLoggerConfig,
  type DbLoggerConfig,
  type McpLoggerConfig
} from './types';

// Initialization
export { initializeLogging } from './init';

// API logging
export { withApiLogging, correlationMiddleware } from './apiLogger';

// Database logging
export { 
  DbOperation, 
  logDbOperation,
  logDbTransaction,
  createLoggedCollection,
  type DbContext
} from './dbLogger';

// AI logging
export { 
  AiOperation, 
  logAiOperation, 
  logPromptTemplate,
  logAiError,
  estimateTokenCount
} from './aiLogger';

// Transports
export {
  MongoTransport,
  FileTransport,
  ConsoleTransport,
  type MongoTransportOptions,
  type FileTransportOptions,
  type ConsoleTransportOptions
} from './transports';

// Client-side logging (browser environment)
export {
  ClientLogger,
  createClientLogger,
  clientLogger,
  useClientLogger,
  usePerformanceMonitoring,
  useErrorLogging,
  useInteractionLogging,
  useFeatureLogging
} from './client';

// Method decorators for function logging
export {
  LogMethod,
  LogTrace,
  LogDebug,
  LogInfo
} from './decorators/logMethod';

// React hooks for component logging
export {
  useLoggedFunction,
  useLoggedEffect,
  useLoggedEventHandler,
  useLoggedState
} from './client/hooks/useLoggedFunction';

// Function wrapper for non-class functions
export { logFunction } from './utils/logFunction';

// Middleware components
export {
  apiLoggerMiddleware,
  configureAPILogger,
  contextCollectionMiddleware,
  configureContextCollection,
  getContextValue,
  setContextValue,
  clearContext,
  getCorrelationId,
  getUserId,
  getRequestId
} from './middleware';

// Utility functions
export {
  getOrCreateCorrelationId,
  addCorrelationToHeaders,
  extractCorrelationFromResponse,
  fetchWithCorrelation,
  mcpRequestWithCorrelation,
  maskSensitiveData,
  configureSensitiveDataMasking,
  addSensitivePatterns,
  isSensitiveKey
} from './utils';

// Log query functionality
export { 
  queryLogs,
  getLogStatistics,
  getLevelsDistribution,
  getComponentsDistribution,
  getTimeframeDistribution,
  getStatusCodeDistribution,
  getErrorDistribution,
  getPerformanceMetrics,
  getCorrelatedRequests,
  searchLogsFullText
} from './logQuery';

// Analytics functionality
export {
  detectPerformanceIssues,
  detectErrorPatterns,
  analyzeUserPatterns,
  analyzeRequestFlows,
  calculateSystemHealth,
  configurePerformanceThresholds,
  type PerformanceThresholds,
  type PerformanceIssue,
  type ErrorPatternConfig,
  type ErrorPattern,
  type UsagePattern,
  type RequestFlow,
  type SystemHealthMetrics
} from './analytics';

// Alerting functionality
export {
  configureAlertManager,
  registerNotifier,
  addAlertRule,
  removeAlertRule,
  processErrorPatterns,
  processPerformanceIssues,
  processSystemHealth,
  createCustomAlert,
  acknowledgeAlert,
  resolveAlert,
  getRecentAlerts,
  initializeAlertManager,
  AlertSeverity,
  AlertType,
  AlertChannel,
  type Alert,
  type AlertRule,
  type ErrorPatternAlertConditions,
  type PerformanceAlertConditions,
  type SystemHealthAlertConditions,
  type AlertManagerConfig
} from './alerting';

// Log rotation functionality
export {
  configureRotation,
  rotateFile,
  checkRotation,
  startRotation,
  stopRotation,
  type RotationConfig
} from './rotation';

// Initialize the complete logging system
export function initializeComprehensiveLogging(options: {
  logLevel?: LogLevel;
  enableApiLogging?: boolean;
  enableDatabaseLogging?: boolean;
  enableAiLogging?: boolean;
  enableClientLogging?: boolean;
  enableContextCollection?: boolean;
  enableAnalytics?: boolean;
  enableAlerts?: boolean;
  enableRotation?: boolean;
  mongoUri?: string;
  logDirectory?: string;
  enableConsoleTransport?: boolean;
  enableFileTransport?: boolean;
  enableMongoTransport?: boolean;
} = {}): void {
  // Initialize core logging
  initializeLogging({
    minLevel: options.logLevel || LogLevel.INFO,
    enableConsoleTransport: options.enableConsoleTransport !== false,
    enableFileTransport: options.enableFileTransport !== false,
    enableMongoTransport: options.enableMongoTransport !== false && !!options.mongoUri,
    mongoOptions: options.mongoUri ? { connectionString: options.mongoUri } : undefined
  });
  
  // Initialize alert manager if enabled
  if (options.enableAlerts !== false) {
    initializeAlertManager();
  }
  
  // Initialize log rotation if enabled
  if (options.enableRotation !== false) {
    configureRotation({
      enabled: true,
      logDirectory: options.logDirectory || 'logs'
    });
    startRotation();
  }
  
  // Create a logger for this function
  const logger = createLogger('LoggingSystem');
  
  // Log initialization
  logger.info('Comprehensive logging system initialized', {
    options,
    level: LogLevel[options.logLevel || LogLevel.INFO],
    transports: {
      console: options.enableConsoleTransport !== false,
      file: options.enableFileTransport !== false,
      mongo: options.enableMongoTransport !== false && !!options.mongoUri
    },
    features: {
      apiLogging: options.enableApiLogging !== false,
      databaseLogging: options.enableDatabaseLogging !== false,
      aiLogging: options.enableAiLogging !== false,
      clientLogging: options.enableClientLogging !== false,
      contextCollection: options.enableContextCollection !== false,
      analytics: options.enableAnalytics !== false,
      alerts: options.enableAlerts !== false,
      rotation: options.enableRotation !== false
    }
  });
}
