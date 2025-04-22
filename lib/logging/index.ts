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
