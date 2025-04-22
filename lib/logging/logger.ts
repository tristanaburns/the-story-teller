/**
 * logger.ts
 * 
 * A centralized logging utility for The Story Teller application
 * Supports multiple log levels, contextual information, and various transports
 */

// Import transports
import { 
  MongoTransport, MongoTransportOptions, 
  FileTransport, FileTransportOptions,
  ConsoleTransport, ConsoleTransportOptions 
} from './transports';

// Log levels in order of severity
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  NONE = 6
}

// Interface for logger configuration
export interface LoggerConfig {
  minLevel: LogLevel;
  includeTimestamp: boolean;
  includeContext: boolean;
  enableConsoleTransport: boolean;
  enableFileTransport: boolean;
  enableMongoTransport: boolean;
  consoleOptions: Partial<ConsoleTransportOptions>;
  fileOptions: Partial<FileTransportOptions>;
  mongoOptions: Partial<MongoTransportOptions>;
  redactionPatterns: RegExp[];
  correlationIdFn?: () => string | undefined;
  userIdFn?: () => string | undefined;
  requestIdFn?: () => string | undefined;
  appVersion?: string;
  logFunctionInputsOutputs: boolean;
}

// Context information for logs
export interface LogContext {
  correlationId?: string;
  userId?: string;
  requestId?: string;
  component?: string;
  method?: string;
  mcpServer?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  functionParams?: any[];
  functionResult?: any;
  clientInfo?: {
    ip?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
  };
  metadata?: Record<string, any>;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  minLevel: LogLevel.DEBUG,
  includeTimestamp: true,
  includeContext: true,
  enableConsoleTransport: true,
  enableFileTransport: true,
  enableMongoTransport: !!process.env.MONGODB_URI,
  consoleOptions: {},
  fileOptions: {},
  mongoOptions: {
    connectionString: process.env.MONGODB_URI || '',
    dbName: process.env.MONGODB_DB || 'the_story_teller',
    collectionName: 'logs'
  },
  redactionPatterns: [
    /password/i, /token/i, /secret/i, /key/i, /auth/i, /cookie/i, /session/i
  ],
  appVersion: process.env.APP_VERSION || '1.0.0',
  logFunctionInputsOutputs: true
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
    case 'TRACE': return LogLevel.TRACE;
    case 'DEBUG': return LogLevel.DEBUG;
    case 'INFO': return LogLevel.INFO;
    case 'WARN': return LogLevel.WARN;
    case 'ERROR': return LogLevel.ERROR;
    case 'FATAL': return LogLevel.FATAL;
    case 'NONE': return LogLevel.NONE;
    default: return defaultConfig.minLevel;
  }
}

// Transport instances
let consoleTransport: ConsoleTransport | null = null;
let fileTransport: FileTransport | null = null;
let mongoTransport: MongoTransport | null = null;

// Initialize transports based on configuration
function initializeTransports(): void {
  // Initialize console transport
  if (globalConfig.enableConsoleTransport && !consoleTransport) {
    consoleTransport = new ConsoleTransport({
      minLevel: globalConfig.minLevel,
      ...globalConfig.consoleOptions
    });
  }

  // Initialize file transport
  if (globalConfig.enableFileTransport && !fileTransport) {
    fileTransport = new FileTransport({
      minLevel: globalConfig.minLevel,
      ...globalConfig.fileOptions
    });
  }

  // Initialize MongoDB transport
  if (globalConfig.enableMongoTransport && 
      globalConfig.mongoOptions.connectionString && 
      !mongoTransport) {
    mongoTransport = new MongoTransport({
      minLevel: globalConfig.minLevel,
      ...globalConfig.mongoOptions
    });
    
    // Connect to MongoDB
    mongoTransport.connect().catch(error => {
      console.error('Failed to connect MongoDB transport:', error);
    });
  }
}

// Generate a random ID for correlation
function generateCorrelationId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// Thread-local storage for correlation ID
const asyncLocalStorage = new Map<string, any>();

// Logger class that can be instantiated for different components
export class Logger {
  private context: string;
  private correlationId?: string;
  private childLoggers: Map<string, Logger> = new Map();
  
  constructor(context: string, correlationId?: string) {
    this.context = context;
    this.correlationId = correlationId;
    
    // Ensure transports are initialized
    initializeTransports();
  }
  
  /**
   * Log a message at a specific level with additional context
   */
  public async log(level: LogLevel, message: string, contextOrData?: LogContext | any): Promise<void> {
    // Skip if this log level is below the minimum configured level
    if (level < globalConfig.minLevel) {
      return;
    }

    // Determine if the parameter is context or data
    const isContextObject = contextOrData && typeof contextOrData === 'object' && 
                          ('correlationId' in contextOrData || 
                           'userId' in contextOrData || 
                           'requestId' in contextOrData ||
                           'component' in contextOrData ||
                           'functionParams' in contextOrData ||
                           'functionResult' in contextOrData);
    
    // Extract context and data
    const context: LogContext = isContextObject ? contextOrData : {};
    const data: any = isContextObject ? undefined : contextOrData;
    
    // Get correlation ID from context, instance, or global function
    const correlationId = context.correlationId || 
                          this.correlationId || 
                          (globalConfig.correlationIdFn && globalConfig.correlationIdFn()) ||
                          asyncLocalStorage.get('correlationId');
    
    // Get user ID from context or global function
    const userId = context.userId || 
                  (globalConfig.userIdFn && globalConfig.userIdFn()) ||
                  asyncLocalStorage.get('userId');
    
    // Get request ID from context or global function
    const requestId = context.requestId || 
                     (globalConfig.requestIdFn && globalConfig.requestIdFn()) ||
                     asyncLocalStorage.get('requestId');
    
    // Combine all context information
    const logContext: LogContext = {
      correlationId,
      userId,
      requestId,
      component: this.context,
      ...context
    };

    // Remove undefined values
    Object.keys(logContext).forEach(key => {
      if (logContext[key as keyof LogContext] === undefined) {
        delete logContext[key as keyof LogContext];
      }
    });

    // Sanitize data if provided
    const sanitizedData = data !== undefined ? this.sanitizeData(data) : undefined;

    // Use transports to log the message
    if (consoleTransport) {
      const prettyContext = Object.keys(logContext).length > 0 
        ? ` [${JSON.stringify(logContext)}]` 
        : '';
      consoleTransport.log(level, `${message}${prettyContext}`, sanitizedData);
    }

    if (fileTransport) {
      const formattedMessage = `${message} ${JSON.stringify({
        context: logContext,
        data: sanitizedData
      })}`;
      fileTransport.log(level, formattedMessage);
    }

    if (mongoTransport) {
      await mongoTransport.log({
        level: LogLevel[level],
        message,
        context: this.context,
        correlationId,
        userId,
        requestId,
        component: context.component,
        method: context.method,
        path: context.path,
        statusCode: context.statusCode,
        duration: context.duration,
        mcpServer: context.mcpServer,
        clientInfo: context.clientInfo,
        metadata: context.metadata,
        data: sanitizedData,
        environment: process.env.NODE_ENV || 'development',
        appVersion: globalConfig.appVersion
      });
    }
  }

  /**
   * Trace level logging - for extremely detailed diagnostic information
   */
  trace(message: string, contextOrData?: LogContext | any): void {
    this.log(LogLevel.TRACE, message, contextOrData);
  }
  
  /**
   * Debug level logging - for detailed diagnostic information
   */
  debug(message: string, contextOrData?: LogContext | any): void {
    this.log(LogLevel.DEBUG, message, contextOrData);
  }
  
  /**
   * Info level logging - for general operational information
   */
  info(message: string, contextOrData?: LogContext | any): void {
    this.log(LogLevel.INFO, message, contextOrData);
  }
  
  /**
   * Warning level logging - for concerning but non-critical issues
   */
  warn(message: string, contextOrData?: LogContext | any): void {
    this.log(LogLevel.WARN, message, contextOrData);
  }
  
  /**
   * Error level logging - for critical issues and exceptions
   */
  error(message: string, errorOrContext?: Error | LogContext | any): void {
    // If an Error object is provided, extract useful information
    if (errorOrContext instanceof Error) {
      const errorData = {
        message: errorOrContext.message,
        stack: errorOrContext.stack,
        name: errorOrContext.name,
        ...(errorOrContext as any)
      };
      
      // Log with error context
      this.log(LogLevel.ERROR, message, {
        error: errorData
      });
    } else {
      // Use the provided context or data
      this.log(LogLevel.ERROR, message, errorOrContext);
    }
  }
  
  /**
   * Fatal level logging - for system-crashing errors
   */
  fatal(message: string, errorOrContext?: Error | LogContext | any): void {
    // If an Error object is provided, extract useful information
    if (errorOrContext instanceof Error) {
      const errorData = {
        message: errorOrContext.message,
        stack: errorOrContext.stack,
        name: errorOrContext.name,
        ...(errorOrContext as any)
      };
      
      // Log with error context
      this.log(LogLevel.FATAL, message, {
        error: errorData
      });
    } else {
      // Use the provided context or data
      this.log(LogLevel.FATAL, message, errorOrContext);
    }
  }
  
  /**
   * Track performance by creating a timer and logging the duration
   */
  time(label: string, logLevel: LogLevel = LogLevel.DEBUG): () => void {
    const start = performance.now();
    
    // Return a function that can be called to end the timer and log the result
    return () => {
      const duration = performance.now() - start;
      this.log(logLevel, `${label}`, { duration: duration });
    };
  }

  /**
   * Track method execution time and log entry/exit
   */
  trackMethod(methodName: string, logLevel: LogLevel = LogLevel.DEBUG): MethodTracker {
    const start = performance.now();
    
    // Log method entry
    this.log(logLevel, `${methodName} started`);
    
    // Return a method tracker
    return {
      // Log success and duration
      end: (result?: any) => {
        const duration = performance.now() - start;
        this.log(logLevel, `${methodName} completed`, { 
          duration,
          result: result !== undefined ? this.sanitizeData(result) : undefined
        });
        return result;
      },
      
      // Log error and duration
      error: (error: Error) => {
        const duration = performance.now() - start;
        this.error(`${methodName} failed after ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
  }
  
  /**
   * Create a child logger with extended context
   */
  createChildLogger(childContext: string): Logger {
    // Check if this child logger already exists
    if (this.childLoggers.has(childContext)) {
      return this.childLoggers.get(childContext)!;
    }
    
    // Create a new child logger
    const fullContext = `${this.context}:${childContext}`;
    const childLogger = new Logger(fullContext, this.correlationId);
    
    // Cache the child logger
    this.childLoggers.set(childContext, childLogger);
    
    return childLogger;
  }

  /**
   * Set the correlation ID for this logger
   */
  setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
    
    // Update child loggers
    this.childLoggers.forEach(logger => {
      logger.setCorrelationId(correlationId);
    });
  }

  /**
   * Get the current correlation ID
   */
  getCorrelationId(): string | undefined {
    return this.correlationId;
  }

  /**
   * Set a value in the async local storage
   */
  static setContextValue(key: string, value: any): void {
    asyncLocalStorage.set(key, value);
  }

  /**
   * Get a value from the async local storage
   */
  static getContextValue(key: string): any {
    return asyncLocalStorage.get(key);
  }

  /**
   * Clear all values from the async local storage
   */
  static clearContext(): void {
    asyncLocalStorage.clear();
  }

  /**
   * Run a function with a correlation ID in the context
   */
  static withCorrelationId<T>(correlationId: string | undefined, fn: () => T): T {
    // Save the old correlation ID
    const oldCorrelationId = asyncLocalStorage.get('correlationId');
    
    try {
      // Set the new correlation ID
      if (correlationId) {
        asyncLocalStorage.set('correlationId', correlationId);
      }
      
      // Run the function
      return fn();
    } finally {
      // Restore the old correlation ID
      if (oldCorrelationId) {
        asyncLocalStorage.set('correlationId', oldCorrelationId);
      } else {
        asyncLocalStorage.delete('correlationId');
      }
    }
  }

  /**
   * Sanitize sensitive data from objects
   */
  private sanitizeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    // Handle objects
    const sanitized = { ...data };

    for (const key in sanitized) {
      // Check if the key matches any redaction patterns
      if (globalConfig.redactionPatterns.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }
}

// Interface for method tracking
export interface MethodTracker {
  end(result?: any): any;
  error(error: Error): never;
}

/**
 * Configure the global logger settings
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  // Update configuration
  globalConfig = {
    ...globalConfig,
    ...config
  };

  // Re-initialize transports if needed
  initializeTransports();
  
  // Log the configuration change
  const configLogger = createLogger('LoggerConfig');
  configLogger.info('Logger configuration updated', { 
    minLevel: LogLevel[globalConfig.minLevel],
    transports: {
      console: globalConfig.enableConsoleTransport,
      file: globalConfig.enableFileTransport,
      mongo: globalConfig.enableMongoTransport
    }
  });
}

/**
 * Create a new logger instance with a correlation ID
 */
export function createLoggerWithCorrelationId(
  context: string, 
  correlationId?: string
): Logger {
  return new Logger(
    context, 
    correlationId || generateCorrelationId()
  );
}

/**
 * Create a new logger instance for a specific context
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

/**
 * Close all transports and clean up resources
 * This should be called when the application is shutting down
 */
export async function closeLoggers(): Promise<void> {
  // Close file transport
  if (fileTransport) {
    fileTransport.close();
    fileTransport = null;
  }
  
  // Close MongoDB transport
  if (mongoTransport) {
    await mongoTransport.flush();
    await mongoTransport.close();
    mongoTransport = null;
  }
}

/**
 * Get the current log level name
 */
export function getCurrentLogLevelName(): string {
  return LogLevel[globalConfig.minLevel];
}

/**
 * Set the minimum log level
 */
export function setLogLevel(level: LogLevel): void {
  configureLogger({ minLevel: level });
}

/**
 * Method decorator for tracking method execution
 */
export function LogMethod(level: LogLevel = LogLevel.DEBUG) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      // Get the class name
      const className = this.constructor.name;
      
      // Create a logger for this class
      const logger = createLogger(className);
      
      // Create a method tracker
      const tracker = logger.trackMethod(`${propertyKey}`, level);
      
      try {
        // Log method arguments
        logger.debug(`${propertyKey} called with args:`, { 
          args: logger['sanitizeData'](args) 
        });
        
        // Call the original method
        const result = originalMethod.apply(this, args);
        
        // If the result is a Promise, handle it appropriately
        if (result instanceof Promise) {
          return result
            .then(value => tracker.end(value))
            .catch(error => tracker.error(error));
        }
        
        // For synchronous methods, log the result and return
        return tracker.end(result);
      } catch (error) {
        // Handle synchronous errors
        tracker.error(error as Error);
      }
    };
    
    return descriptor;
  };
}

// Export a singleton instance of the logger
export const logger = createLogger('App');
