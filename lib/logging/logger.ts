/**
 * logger.ts
 * 
 * A centralized logging utility for The Story Teller application
 * Supports multiple log levels and contextual information
 */

// Log levels in order of severity
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

// Interface for logger configuration
interface LoggerConfig {
  minLevel: LogLevel;
  includeTimestamp: boolean;
  includeContext: boolean;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  includeTimestamp: true,
  includeContext: true
};

// Global configuration that can be updated at runtime
let globalConfig: LoggerConfig = {
  ...defaultConfig,
  minLevel: getLogLevelFromEnv() 
};

// Extract log level from environment variable
function getLogLevelFromEnv(): LogLevel {
  const envLevel = process.env.LOG_LEVEL?.toUpperCase();
  if (!envLevel) {
    return defaultConfig.minLevel;
  }
  
  switch (envLevel) {
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO': return LogLevel.INFO;
    case 'WARN': return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    case 'NONE': return LogLevel.NONE;
    default: return defaultConfig.minLevel;
  }
}

// Map log levels to console methods
const logMethods = {
  [LogLevel.DEBUG]: console.debug,
  [LogLevel.INFO]: console.info,
  [LogLevel.WARN]: console.warn,
  [LogLevel.ERROR]: console.error,
};

// Color codes for different log levels in development
const logColors = {
  [LogLevel.DEBUG]: '\x1b[90m', // Gray
  [LogLevel.INFO]: '\x1b[36m',  // Cyan
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  reset: '\x1b[0m'
};

// Logger class that can be instantiated for different components
export class Logger {
  private context: string;
  
  constructor(context: string) {
    this.context = context;
  }
  
  /**
   * Log a message at a specific level
   */
  private log(level: LogLevel, message: string, data?: any): void {
    // Skip if this log level is below the minimum configured level
    if (level < globalConfig.minLevel) {
      return;
    }
    
    // Format the message with additional context if needed
    let formattedMessage = message;
    const isProd = process.env.NODE_ENV === 'production';
    const parts: string[] = [];
    
    // Add timestamp
    if (globalConfig.includeTimestamp) {
      const timestamp = new Date().toISOString();
      parts.push(`[${timestamp}]`);
    }
    
    // Add log level
    const levelName = LogLevel[level];
    parts.push(`[${levelName}]`);
    
    // Add context
    if (globalConfig.includeContext && this.context) {
      parts.push(`[${this.context}]`);
    }
    
    // Add the actual message
    parts.push(message);
    
    formattedMessage = parts.join(' ');
    
    // Use colors in development, plain text in production
    if (!isProd) {
      formattedMessage = `${logColors[level]}${formattedMessage}${logColors.reset}`;
    }
    
    // Log the message
    const logFn = logMethods[level];
    if (data !== undefined) {
      logFn(formattedMessage, data);
    } else {
      logFn(formattedMessage);
    }
  }
  
  /**
   * Debug level logging - for detailed diagnostic information
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
  
  /**
   * Info level logging - for general operational information
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }
  
  /**
   * Warning level logging - for concerning but non-critical issues
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }
  
  /**
   * Error level logging - for critical issues and exceptions
   */
  error(message: string, error?: any): void {
    // If an Error object is provided, extract useful information
    if (error instanceof Error) {
      const errorData = {
        message: error.message,
        stack: error.stack,
        ...(error as any)
      };
      this.log(LogLevel.ERROR, message, errorData);
    } else {
      this.log(LogLevel.ERROR, message, error);
    }
  }
  
  /**
   * Track performance by creating a timer and logging the duration
   */
  time(label: string): () => void {
    const start = performance.now();
    
    // Return a function that can be called to end the timer and log the result
    return () => {
      const duration = performance.now() - start;
      this.debug(`${label}: ${duration.toFixed(2)}ms`);
    };
  }
  
  /**
   * Create a child logger with extended context
   */
  createChildLogger(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`);
  }
}

/**
 * Configure the global logger settings
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  globalConfig = {
    ...globalConfig,
    ...config
  };
}

/**
 * Create a new logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}
