/**
 * clientLogger.ts
 * 
 * Client-side logger for browser environments
 * Supports local storage, batching, and server synchronization
 */

export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  NONE = 6
}

// Interface for client log entry
export interface ClientLogEntry {
  timestamp: string;
  level: string;
  message: string;
  component?: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  data?: any;
  stackTrace?: string;
  tags?: string[];
}

// Interface for logger configuration
export interface ClientLoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
  serverSyncEnabled: boolean;
  serverEndpoint: string;
  batchSize: number;
  maxBatchSize: number;
  flushInterval: number;
  useLocalStorage: boolean;
  maxLocalStorageSize: number;
  localStorageKey: string;
  maxLogRetention: number; // days
  redactPaths: string[];
  correlationIdKey: string;
  appVersion?: string;
  defaultTags: string[];
}

// Default configuration
const DEFAULT_CONFIG: ClientLoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  enabled: true,
  serverSyncEnabled: true,
  serverEndpoint: '/api/logging/client-logs',
  batchSize: 10,
  maxBatchSize: 100,
  flushInterval: 30000, // 30 seconds
  useLocalStorage: true,
  maxLocalStorageSize: 1024 * 1024, // 1MB
  localStorageKey: 'the-story-teller-logs',
  maxLogRetention: 7, // 7 days
  redactPaths: ['password', 'token', 'secret', 'credentials', 'auth'],
  correlationIdKey: 'x-correlation-id',
  defaultTags: []
};

/**
 * Client-side logger for browser environments
 */
export class ClientLogger {
  private config: ClientLoggerConfig;
  private queue: ClientLogEntry[] = [];
  private flushTimer: number | null = null;
  private isFlushing: boolean = false;
  private sessionId: string;
  private userId: string | null = null;
  private correlationId: string | null = null;
  
  /**
   * Create a new client logger instance
   */
  constructor(
    private component: string,
    config: Partial<ClientLoggerConfig> = {}
  ) {
    // Merge configuration
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    // Generate session ID
    this.sessionId = this.generateSessionId();
    
    // Restore logs from local storage
    if (this.config.useLocalStorage) {
      this.restoreFromLocalStorage();
    }
    
    // Start flush timer
    this.startFlushTimer();
    
    // Register unload handler to flush logs
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.synchronousFlush();
      });
    }
  }
  
  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    // Get from sessionStorage if available
    if (typeof sessionStorage !== 'undefined') {
      const existingId = sessionStorage.getItem('the-story-teller-session-id');
      if (existingId) {
        return existingId;
      }
      
      const newId = Math.random().toString(36).substring(2, 15) + 
                    Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('the-story-teller-session-id', newId);
      return newId;
    }
    
    // Fallback if sessionStorage is not available
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Set the user ID for this logger
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
  }
  
  /**
   * Set the correlation ID for this logger
   */
  setCorrelationId(correlationId: string | null): void {
    this.correlationId = correlationId;
  }
  
  /**
   * Get the current correlation ID
   */
  getCorrelationId(): string | null {
    return this.correlationId;
  }
  
  /**
   * Log a message at a specific level
   */
  log(level: LogLevel, message: string, data?: any, tags?: string[]): void {
    // Skip if logging is disabled or below minimum level
    if (!this.config.enabled || level < this.config.minLevel) {
      return;
    }
    
    // Prepare log entry
    const entry: ClientLogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      component: this.component,
      correlationId: this.correlationId || undefined,
      userId: this.userId || undefined,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      data: data ? this.sanitizeData(data) : undefined,
      tags: [...(this.config.defaultTags || []), ...(tags || [])]
    };
    
    // Get stack trace for errors
    if (level >= LogLevel.ERROR) {
      entry.stackTrace = this.getStackTrace();
    }
    
    // Add to queue
    this.queue.push(entry);
    
    // Flush immediately if batch size reached
    if (this.queue.length >= this.config.batchSize) {
      this.flush();
    }
    
    // Also log to console in development
    if (process.env.NODE_ENV !== 'production') {
      this.logToConsole(level, message, data);
    }
  }
  
  /**
   * Trace level logging
   */
  trace(message: string, data?: any, tags?: string[]): void {
    this.log(LogLevel.TRACE, message, data, tags);
  }
  
  /**
   * Debug level logging
   */
  debug(message: string, data?: any, tags?: string[]): void {
    this.log(LogLevel.DEBUG, message, data, tags);
  }
  
  /**
   * Info level logging
   */
  info(message: string, data?: any, tags?: string[]): void {
    this.log(LogLevel.INFO, message, data, tags);
  }
  
  /**
   * Warning level logging
   */
  warn(message: string, data?: any, tags?: string[]): void {
    this.log(LogLevel.WARN, message, data, tags);
  }
  
  /**
   * Error level logging
   */
  error(message: string, error?: Error | any, tags?: string[]): void {
    // Extract error information
    const errorData = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error as any) // Include any custom properties
    } : error;
    
    this.log(LogLevel.ERROR, message, errorData, tags);
  }
  
  /**
   * Fatal level logging
   */
  fatal(message: string, error?: Error | any, tags?: string[]): void {
    // Extract error information
    const errorData = error instanceof Error ? {
      message: error.message,
      name: error.name,
      stack: error.stack,
      ...(error as any) // Include any custom properties
    } : error;
    
    this.log(LogLevel.FATAL, message, errorData, tags);
  }
  
  /**
   * Get stack trace
   */
  private getStackTrace(): string {
    try {
      throw new Error('Stack trace');
    } catch (e) {
      return (e as Error).stack?.split('\n').slice(2).join('\n') || '';
    }
  }
  
  /**
   * Log to console
   */
  private logToConsole(level: LogLevel, message: string, data?: any): void {
    const formattedMessage = `[${this.component}] ${message}`;
    
    switch (level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data);
        break;
        
      case LogLevel.INFO:
        console.info(formattedMessage, data);
        break;
        
      case LogLevel.WARN:
        console.warn(formattedMessage, data);
        break;
        
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(formattedMessage, data);
        break;
    }
  }
  
  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (typeof window === 'undefined') {
      return; // Not in browser environment
    }
    
    // Clear existing timer
    if (this.flushTimer !== null) {
      window.clearInterval(this.flushTimer);
    }
    
    // Start new timer
    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }
  
  /**
   * Flush logs to server
   */
  async flush(): Promise<void> {
    // Skip if no logs, not in browser, or already flushing
    if (
      this.queue.length === 0 || 
      typeof window === 'undefined' || 
      this.isFlushing
    ) {
      return;
    }
    
    // Mark as flushing
    this.isFlushing = true;
    
    // Get logs to flush
    const logsToFlush = this.queue.slice(0, this.config.maxBatchSize);
    
    try {
      // Send logs to server if enabled
      if (this.config.serverSyncEnabled) {
        await this.sendToServer(logsToFlush);
        
        // Remove sent logs from queue
        this.queue = this.queue.slice(logsToFlush.length);
        
        // Update local storage
        if (this.config.useLocalStorage) {
          this.saveToLocalStorage();
        }
      }
    } catch (error) {
      console.error('Failed to send logs to server:', error);
    } finally {
      this.isFlushing = false;
    }
  }
  
  /**
   * Synchronous flush for unload event
   */
  private synchronousFlush(): void {
    // Skip if no logs or not in browser
    if (this.queue.length === 0 || typeof navigator === 'undefined') {
      return;
    }
    
    // Save to local storage
    if (this.config.useLocalStorage) {
      this.saveToLocalStorage();
    }
    
    // Try to send using sendBeacon if available
    if (
      this.config.serverSyncEnabled && 
      navigator.sendBeacon && 
      typeof navigator.sendBeacon === 'function'
    ) {
      const logsToFlush = this.queue.slice(0, this.config.maxBatchSize);
      
      try {
        const success = navigator.sendBeacon(
          this.config.serverEndpoint,
          JSON.stringify(logsToFlush)
        );
        
        if (success) {
          // Remove sent logs from queue
          this.queue = this.queue.slice(logsToFlush.length);
          
          // Update local storage
          if (this.config.useLocalStorage) {
            this.saveToLocalStorage();
          }
        }
      } catch (error) {
        console.error('Failed to send logs with sendBeacon:', error);
      }
    }
  }
  
  /**
   * Send logs to server
   */
  private async sendToServer(logs: ClientLogEntry[]): Promise<void> {
    if (!logs.length) {
      return;
    }
    
    try {
      const response = await fetch(this.config.serverEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.correlationId ? { 
            [this.config.correlationIdKey]: this.correlationId 
          } : {})
        },
        body: JSON.stringify(logs),
        // Include credentials for authentication
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Save logs to local storage
   */
  private saveToLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      return; // Not in browser environment
    }
    
    try {
      // Prepare logs for storage
      const now = new Date();
      const cutoff = new Date(now.getTime() - (this.config.maxLogRetention * 24 * 60 * 60 * 1000));
      
      // Filter logs by retention period
      const filteredLogs = this.queue.filter(log => {
        const logTime = new Date(log.timestamp);
        return logTime >= cutoff;
      });
      
      // Serialize logs
      const serialized = JSON.stringify(filteredLogs);
      
      // Check size
      if (serialized.length <= this.config.maxLocalStorageSize) {
        localStorage.setItem(this.config.localStorageKey, serialized);
      } else {
        // If too large, store as many logs as possible from newest to oldest
        let sliceSize = filteredLogs.length;
        let slicedLogs = filteredLogs;
        
        // Reduce batch size until it fits
        while (sliceSize > 0) {
          sliceSize = Math.floor(sliceSize * 0.75); // Reduce by 25%
          slicedLogs = filteredLogs.slice(filteredLogs.length - sliceSize);
          
          const slicedSerialized = JSON.stringify(slicedLogs);
          if (slicedSerialized.length <= this.config.maxLocalStorageSize) {
            localStorage.setItem(this.config.localStorageKey, slicedSerialized);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Failed to save logs to local storage:', error);
    }
  }
  
  /**
   * Restore logs from local storage
   */
  private restoreFromLocalStorage(): void {
    if (typeof localStorage === 'undefined') {
      return; // Not in browser environment
    }
    
    try {
      const storedLogs = localStorage.getItem(this.config.localStorageKey);
      
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs) as ClientLogEntry[];
        
        // Prepare logs for restoration
        const now = new Date();
        const cutoff = new Date(now.getTime() - (this.config.maxLogRetention * 24 * 60 * 60 * 1000));
        
        // Filter logs by retention period
        const filteredLogs = parsedLogs.filter(log => {
          const logTime = new Date(log.timestamp);
          return logTime >= cutoff;
        });
        
        // Add to queue
        this.queue = [...filteredLogs, ...this.queue];
        
        // Remove from local storage
        localStorage.removeItem(this.config.localStorageKey);
      }
    } catch (error) {
      console.error('Failed to restore logs from local storage:', error);
    }
  }
  
  /**
   * Sanitize data for logging
   */
  private sanitizeData(data: any): any {
    return this.redactSensitiveInfo(data, this.config.redactPaths);
  }
  
  /**
   * Redact sensitive information from data
   */
  private redactSensitiveInfo(data: any, paths: string[], currentPath: string = ''): any {
    if (!data || typeof data !== 'object') {
      return data;
    }
    
    // Handle arrays
    if (Array.isArray(data)) {
      return data.map((item, index) => 
        this.redactSensitiveInfo(item, paths, `${currentPath}[${index}]`)
      );
    }
    
    // Handle objects
    const result = { ...data };
    
    for (const key in result) {
      const newPath = currentPath ? `${currentPath}.${key}` : key;
      
      // Check if this path should be redacted
      const shouldRedact = paths.some(pattern => {
        if (pattern.includes('*')) {
          // Handle wildcard patterns
          const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
          return regex.test(newPath);
        }
        
        return newPath === pattern || key === pattern;
      });
      
      if (shouldRedact) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object' && result[key] !== null) {
        // Recursively check nested objects
        result[key] = this.redactSensitiveInfo(result[key], paths, newPath);
      }
    }
    
    return result;
  }
  
  /**
   * Update logger configuration
   */
  updateConfig(config: Partial<ClientLoggerConfig>): void {
    // Update config
    this.config = { ...this.config, ...config };
    
    // Restart flush timer if interval changed
    if (config.flushInterval !== undefined) {
      this.startFlushTimer();
    }
  }
  
  /**
   * Create a child logger with extended context
   */
  createChildLogger(childComponent: string): ClientLogger {
    const childLogger = new ClientLogger(
      `${this.component}:${childComponent}`,
      this.config
    );
    
    // Share user ID and correlation ID
    childLogger.setUserId(this.userId);
    childLogger.setCorrelationId(this.correlationId);
    
    return childLogger;
  }
}

/**
 * Create a singleton logger
 */
export function createClientLogger(
  component: string,
  config: Partial<ClientLoggerConfig> = {}
): ClientLogger {
  return new ClientLogger(component, config);
}

// Export a singleton logger for the application
export const clientLogger = createClientLogger('App');
