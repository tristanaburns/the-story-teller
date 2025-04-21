/**
 * init.ts
 * 
 * Initialize logging configuration for the application
 * This should be imported as early as possible in the application lifecycle
 */

import { configureLogger, LogLevel, closeLoggers } from './logger';
import path from 'path';

// Default log files location
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

/**
 * Initialize logging based on environment variables and configuration
 */
export function initializeLogging(): void {
  // Determine log level from environment
  let minLevel = determineLogLevel();
  
  // Configure global logger settings
  configureLogger({
    minLevel,
    includeTimestamp: true,
    includeContext: true,
    enableConsoleTransport: true,
    enableFileTransport: process.env.NODE_ENV === 'production' || process.env.ENABLE_FILE_LOGGING === 'true',
    enableMongoTransport: (process.env.NODE_ENV === 'production' || process.env.ENABLE_MONGO_LOGGING === 'true') && 
                         !!process.env.MONGODB_URI,
    
    // Console transport options
    consoleOptions: {
      colorize: process.env.NODE_ENV !== 'production',
      format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
      minLevel
    },
    
    // File transport options
    fileOptions: {
      directory: LOG_DIR,
      filename: `${process.env.NODE_ENV || 'development'}.log`,
      maxSize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      minLevel
    },
    
    // MongoDB transport options
    mongoOptions: {
      connectionString: process.env.MONGODB_URI || '',
      dbName: process.env.MONGODB_DB || 'the_story_teller',
      collectionName: 'logs',
      expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days by default
      minLevel
    },
    
    // Redaction patterns for sensitive data
    redactionPatterns: [
      /password/i, /token/i, /secret/i, /key/i, /auth/i, /cookie/i, /session/i,
      /credit/i, /card/i, /cvv/i, /ssn/i, /social/i, /security/i, /api[-_]?key/i
    ],
    
    // Application version
    appVersion: process.env.APP_VERSION || '1.0.0'
  });
  
  // Override console methods in development to add more information
  if (process.env.NODE_ENV === 'development' && process.env.ENHANCE_CONSOLE === 'true') {
    enhanceConsoleInDevelopment();
  }
  
  // Set up process handlers for cleanup
  setupProcessHandlers();
}

/**
 * Determine the log level based on environment variables
 */
function determineLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  
  if (!envLevel) {
    return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }
  
  switch (envLevel) {
    case 'TRACE': return LogLevel.TRACE;
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO': return LogLevel.INFO;
    case 'WARN': return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    case 'FATAL': return LogLevel.FATAL;
    case 'NONE': return LogLevel.NONE;
    default: return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG;
  }
}

/**
 * Enhances the standard console methods in development with more context
 */
function enhanceConsoleInDevelopment(): void {
  const originalConsole = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };
  
  // Add stack trace info to determine where logs are coming from
  console.log = (...args) => {
    const stack = new Error().stack?.split('\n')[2]?.trim() || '';
    originalConsole.log(...args, '\n', `📍 ${stack}`);
  };
  
  console.info = (...args) => {
    const stack = new Error().stack?.split('\n')[2]?.trim() || '';
    originalConsole.info(...args, '\n', `📍 ${stack}`);
  };
  
  console.warn = (...args) => {
    const stack = new Error().stack?.split('\n')[2]?.trim() || '';
    originalConsole.warn(...args, '\n', `📍 ${stack}`);
  };
  
  console.error = (...args) => {
    const stack = new Error().stack?.split('\n')[2]?.trim() || '';
    originalConsole.error(...args, '\n', `📍 ${stack}`);
  };
  
  console.debug = (...args) => {
    const stack = new Error().stack?.split('\n')[2]?.trim() || '';
    originalConsole.debug(...args, '\n', `📍 ${stack}`);
  };
}

/**
 * Set up process handlers for clean shutdown
 */
function setupProcessHandlers(): void {
  // Handle normal exits
  process.on('exit', () => {
    closeLoggers()
      .catch(error => console.error('Error closing loggers:', error));
  });
  
  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    closeLoggers()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error closing loggers:', error);
        process.exit(1);
      });
  });
  
  // Handle SIGTERM
  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    closeLoggers()
      .then(() => process.exit(0))
      .catch(error => {
        console.error('Error closing loggers:', error);
        process.exit(1);
      });
  });
  
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    closeLoggers()
      .then(() => process.exit(1))
      .catch(() => process.exit(1));
  });
  
  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // We don't exit the process here, just log the error
  });
}
