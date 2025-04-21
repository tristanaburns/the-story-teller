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
  type ConsoleTransportOptions,
  type LogEntry
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
