/**
 * clientLogger.ts
 * 
 * Client-side logging implementation for browser environments
 * Captures client-side errors, performance metrics, and user interactions
 */

// Log levels
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  NONE = 6
}

// Log transport configuration
export interface LogTransportConfig {
  endpoint: string;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  retryDelay: number;
  includeContext: boolean;
}

// Logger configuration
export interface ClientLoggerConfig {
  minLevel: LogLevel;
  context: Record<string, any>;
  transport: LogTransportConfig;
  consoleOutput: boolean;
  maskSensitiveData: boolean;
  sensitivePatterns: RegExp[];
  captureErrors: boolean;
  captureLogs: boolean;
  capturePerformance: boolean;
  captureNetworkRequests: boolean;
  bufferLogs: boolean;
  offlineStorage: boolean;
  maxOfflineEntries: number;
}

// Client log entry
export interface ClientLogEntry {
  timestamp: string;
  level: string;
  message: string;
  context: string;
  correlationId?: string;
  userId?: string;
  sessionId?: string;
  data?: any;
  error?: {
    message: string;
    stack?: string;
    type?: string;
  };
  userAgent?: string;
  url?: string;
  performance?: {
    type: string;
    value: number;
    metric?: string;
  };
  network?: {
    url: string;
    method: string;
    status?: number;
    duration?: number;
    size?: number;
  };
}

// Default configuration
const defaultConfig: ClientLoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
  context: {},
  transport: {
    endpoint: '/api/logs',
    batchSize: 10,
    flushInterval: 5000, // 5 seconds
    maxRetries: 3,
    retryDelay: 1000,
    includeContext: true
  },
  consoleOutput: process.env.NODE_ENV !== 'production',
  maskSensitiveData: true,
  sensitivePatterns: [
    /password/i, /token/i, /secret/i, /key/i, /auth/i, /cookie/i, /session/i,
    /credit/i, /card/i, /cvv/i, /ssn/i, /social/i, /security/i
  ],
  captureErrors: true,
  captureLogs: true,
  capturePerformance: true,
  captureNetworkRequests: true,
  bufferLogs: true,
  offlineStorage: true,
  maxOfflineEntries: 100
};

// Map of log level to console methods
const consoleMethods = {
  [LogLevel.TRACE]: console.trace,
  [LogLevel.DEBUG]: console.debug,
  [LogLevel.INFO]: console.info,
  [LogLevel.WARN]: console.warn,
  [LogLevel.ERROR]: console.error,
  [LogLevel.FATAL]: console.error,
  [LogLevel.NONE]: () => {}
};

/**
 * Client-side logger implementation
 */
export class ClientLogger {
  private config: ClientLoggerConfig;
  private context: string;
  private logQueue: ClientLogEntry[] = [];
  private flushTimeout: number | null = null;
  private isFlushingLogs = false;
  private globalErrorListenerAdded = false;
  private networkMonitoringEnabled = false;
  private performanceMonitoringEnabled = false;
  private correlationId: string | null = null;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private retryCount = 0;
  private offlineQueue: ClientLogEntry[] = [];

  /**
   * Create a new client logger
   */
  constructor(context: string, config: Partial<ClientLoggerConfig> = {}) {
    this.context = context;
    this.config = {
      ...defaultConfig,
      ...config,
      transport: {
        ...defaultConfig.transport,
        ...(config.transport || {})
      }
    };

    // Initialize session ID
    this.sessionId = this.getOrCreateSessionId();

    // Set initial global context
    this.updateContext();

    // Start log processing
    if (this.config.bufferLogs) {
      this.startLogProcessing();
    }

    // Set up global error handling
    if (this.config.captureErrors && typeof window !== 'undefined') {
      this.setupErrorCapture();
    }

    // Set up network request monitoring
    if (this.config.captureNetworkRequests && typeof window !== 'undefined') {
      this.setupNetworkMonitoring();
    }

    // Set up performance monitoring
    if (this.config.capturePerformance && typeof window !== 'undefined') {
      this.setupPerformanceMonitoring();
    }

    // Restore offline logs if available
    if (this.config.offlineStorage && typeof window !== 'undefined') {
      this.restoreOfflineLogs();
    }
  }

  /**
   * Get or create a session ID
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return 'server';
    }

    let sessionId = localStorage.getItem('story_teller_session_id');
    
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem('story_teller_session_id', sessionId);
    }
    
    return sessionId;
  }

  /**
   * Set up global error capture
   */
  private setupErrorCapture(): void {
    if (this.globalErrorListenerAdded || typeof window === 'undefined') {
      return;
    }

    // Capture unhandled errors
    window.addEventListener('error', (event) => {
      this.log(LogLevel.ERROR, 'Unhandled error', {
        error: {
          message: event.message,
          stack: event.error?.stack,
          type: event.error?.name,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        }
      });
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      let errorMessage = 'Unhandled Promise rejection';
      let errorStack = '';
      let errorType = '';

      // Extract error details
      if (event.reason instanceof Error) {
        errorMessage = event.reason.message;
        errorStack = event.reason.stack || '';
        errorType = event.reason.name;
      } else if (typeof event.reason === 'string') {
        errorMessage = event.reason;
      } else if (event.reason && typeof event.reason === 'object') {
        errorMessage = event.reason.message || JSON.stringify(event.reason);
      }

      this.log(LogLevel.ERROR, 'Unhandled Promise rejection', {
        error: {
          message: errorMessage,
          stack: errorStack,
          type: errorType
        }
      });
    });

    // Override console.error to capture errors
    if (this.config.captureLogs) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Call original console.error
        originalConsoleError.apply(console, args);

        // Log the error
        const errorMessage = args.map(arg => 
          typeof arg === 'string' ? arg : 
          arg instanceof Error ? arg.message : 
          JSON.stringify(arg)
        ).join(' ');

        this.log(LogLevel.ERROR, 'Console error', {
          message: errorMessage,
          args: args.map(arg => 
            arg instanceof Error ? {
              message: arg.message,
              stack: arg.stack,
              name: arg.name
            } : arg
          )
        });
      };
    }

    this.globalErrorListenerAdded = true;
  }

  /**
   * Set up network request monitoring
   */
  private setupNetworkMonitoring(): void {
    if (this.networkMonitoringEnabled || typeof window === 'undefined') {
      return;
    }

    // Monkey patch fetch to log requests
    const originalFetch = global.fetch;
    global.fetch = async function instrumentedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const startTime = performance.now();
      
      // Extract the URL
      let url: string;
      if (typeof input === 'string') {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else {
        // Handle Request object
        url = input.url;
      }
      
      // Extract the method
      let method: string;
      if (init?.method) {
        method = init.method;
      } else if (input instanceof Request) {
        method = input.method;
      } else {
        method = 'GET';
      }

      try {
        const response = await originalFetch(input, init);
        
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Log successful network request
        const clientLogger = new ClientLogger('Network');
        clientLogger.log(LogLevel.DEBUG, 'Network request', {
          network: {
            url,
            method,
            status: response.status,
            duration,
            size: parseInt(response.headers.get('content-length') || '0')
          }
        });
        
        return response;
      } catch (error) {
        // Calculate duration
        const duration = performance.now() - startTime;
        
        // Log failed network request
        const clientLogger = new ClientLogger('Network');
        clientLogger.log(LogLevel.WARN, 'Network request failed', {
          network: {
            url,
            method,
            duration,
            error: error instanceof Error ? error.message : String(error)
          }
        });
        
        // Re-throw the error
        throw error;
      }
    };

    // Monkey patch XMLHttpRequest to log AJAX calls
    const originalXhrOpen = XMLHttpRequest.prototype.open;
    
    // Define a type-safe replacement for the open method
    function safeXhrOpen(this: XMLHttpRequest, method: string, url: string | URL, async: boolean = true, username?: string | null, password?: string | null): void {
      // Store info for logging
      this.__logInfo = {
        url: typeof url === 'string' ? url : url.toString(),
        method,
        startTime: performance.now()
      };
      
      // Call the original with all parameters
      originalXhrOpen.call(this, method, url, async, username, password);
    }
    
    // Apply the override
    XMLHttpRequest.prototype.open = safeXhrOpen;

    this.networkMonitoringEnabled = true;
  }

  /**
   * Set up performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (this.performanceMonitoringEnabled || 
        typeof window === 'undefined' || 
        !window.PerformanceObserver) {
      return;
    }

    try {
      // Monitor paint metrics (FP, FCP)
      const paintObserver = new PerformanceObserver((entries) => {
        entries.getEntries().forEach((entry) => {
          this.log(LogLevel.INFO, `Performance paint: ${entry.name}`, {
            performance: {
              type: 'paint',
              value: entry.startTime,
              metric: entry.name
            }
          });
        });
      });
      paintObserver.observe({ entryTypes: ['paint'] });

      // Monitor largest contentful paint (LCP)
      if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
        const lcpObserver = new PerformanceObserver((entries) => {
          const lastEntry = entries.getEntries().pop();
          if (lastEntry) {
            this.log(LogLevel.INFO, 'Performance LCP', {
              performance: {
                type: 'largest-contentful-paint',
                value: lastEntry.startTime,
                metric: 'LCP'
              }
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // Monitor first input delay (FID)
      if (typeof PerformanceObserver !== 'undefined') {
        try {
          const fiObserver = new PerformanceObserver((entries) => {
            entries.getEntries().forEach((entry) => {
              if (entry.entryType === 'first-input') {
                const firstInput = entry as PerformanceEventTiming;
                
                // Log FID (First Input Delay) only if processingStart is defined
                if (firstInput.processingStart !== undefined) {
                  this.log(LogLevel.DEBUG, 'First Input Delay', {
                    performance: {
                      name: 'FID',
                      value: firstInput.processingStart - firstInput.startTime,
                      rating: getRatingFromFID(firstInput.processingStart - firstInput.startTime)
                    }
                  });
                }
              }
            });
          });
          
          fiObserver.observe({ type: 'first-input', buffered: true });
        } catch (error) {
          // Ignore errors, not all browsers support this API
          console.debug('Error setting up First Input Delay observer', error);
        }
      }

      // Monitor layout shifts (CLS)
      if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
        let cumulativeLayoutShift = 0;
        
        const clsObserver = new PerformanceObserver((entries) => {
          for (const entry of entries.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              cumulativeLayoutShift += (entry as any).value;
            }
          }
          
          this.log(LogLevel.DEBUG, 'Performance CLS update', {
            performance: {
              type: 'layout-shift',
              value: cumulativeLayoutShift,
              metric: 'CLS'
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // Log navigation timing on window load
      window.addEventListener('load', () => {
        setTimeout(() => {
          if (window.performance && window.performance.timing) {
            const timing = window.performance.timing;
            const navigationStart = timing.navigationStart;
            
            this.log(LogLevel.INFO, 'Performance timing metrics', {
              performance: {
                type: 'navigation',
                value: timing.loadEventEnd - navigationStart,
                metric: 'page-load'
              },
              navigationTiming: {
                dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                tcpConnection: timing.connectEnd - timing.connectStart,
                requestStart: timing.requestStart - navigationStart,
                responseStart: timing.responseStart - navigationStart,
                responseEnd: timing.responseEnd - navigationStart,
                domInteractive: timing.domInteractive - navigationStart,
                domContentLoaded: timing.domContentLoadedEventEnd - navigationStart,
                domComplete: timing.domComplete - navigationStart,
                loadEvent: timing.loadEventEnd - navigationStart
              }
            });
          }
        }, 0);
      });

      this.performanceMonitoringEnabled = true;
    } catch (error) {
      this.log(LogLevel.WARN, 'Failed to initialize performance monitoring', error);
    }
  }

  /**
   * Start log processing
   */
  private startLogProcessing(): void {
    if (this.flushTimeout !== null) {
      window.clearInterval(this.flushTimeout);
    }

    this.flushTimeout = window.setInterval(
      () => this.flushLogs(),
      this.config.transport.flushInterval
    );
  }

  /**
   * Update global context
   */
  private updateContext(): void {
    if (typeof window === 'undefined') {
      return;
    }

    this.config.context = {
      ...this.config.context,
      url: window.location.href,
      userAgent: window.navigator.userAgent,
      screenSize: {
        width: window.screen.width,
        height: window.screen.height
      },
      viewportSize: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Set the correlation ID for this logger
   */
  public setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }

  /**
   * Set the user ID for this logger
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Create a formatted log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any
  ): ClientLogEntry {
    // Sanitize data if needed
    const sanitizedData = this.config.maskSensitiveData && data
      ? this.sanitizeData(data)
      : data;
    
    return {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: this.context,
      correlationId: this.correlationId || undefined,
      userId: this.userId || undefined,
      sessionId: this.sessionId || undefined,
      data: sanitizedData,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };
  }

  /**
   * Log a message
   */
  public log(level: LogLevel, message: string, data?: any): void {
    // Skip if below minimum level
    if (level < this.config.minLevel) {
      return;
    }

    // Create log entry
    const entry = this.createLogEntry(level, message, data);

    // Output to console if enabled
    if (this.config.consoleOutput) {
      const consoleMethod = consoleMethods[level] || console.log;
      consoleMethod(`[${entry.timestamp}] [${entry.level}] [${entry.context}] ${message}`, data);
    }

    // Add to the queue if buffering is enabled
    if (this.config.bufferLogs) {
      this.logQueue.push(entry);

      // Flush immediately if batch size reached
      if (this.logQueue.length >= this.config.transport.batchSize) {
        this.flushLogs();
      }
    } else {
      // Send immediately if buffering is disabled
      this.sendLogEntry(entry);
    }
  }

  /**
   * Send a single log entry
   */
  private async sendLogEntry(entry: ClientLogEntry): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const response = await fetch(this.config.transport.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': entry.correlationId || '',
        },
        body: JSON.stringify(entry)
      });

      if (!response.ok) {
        throw new Error(`Failed to send log: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      // Store failed log if offline storage is enabled
      if (this.config.offlineStorage) {
        this.storeOfflineLog(entry);
      }

      // Output to console if enabled
      if (this.config.consoleOutput) {
        console.error('Failed to send log:', error);
      }
    }
  }

  /**
   * Flush queued logs
   */
  public async flushLogs(): Promise<void> {
    if (this.isFlushingLogs || this.logQueue.length === 0 || typeof window === 'undefined') {
      return;
    }

    this.isFlushingLogs = true;
    const entries = [...this.logQueue];
    this.logQueue = [];

    try {
      const response = await fetch(this.config.transport.endpoint + '/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Correlation-ID': this.correlationId || '',
        },
        body: JSON.stringify({ entries })
      });

      if (!response.ok) {
        throw new Error(`Failed to send logs: ${response.status} ${response.statusText}`);
      }

      // Reset retry count on success
      this.retryCount = 0;
    } catch (error) {
      // Put logs back in queue for retry
      this.logQueue = [...entries, ...this.logQueue];

      // Store offline if needed and retry limit reached
      if (this.config.offlineStorage && this.retryCount >= this.config.transport.maxRetries) {
        this.storeOfflineLogs();
        this.logQueue = [];
        this.retryCount = 0;
      } else {
        // Increment retry count
        this.retryCount++;

        // Schedule retry if online
        if (navigator.onLine) {
          setTimeout(() => this.flushLogs(), this.config.transport.retryDelay);
        }
      }

      // Output to console if enabled
      if (this.config.consoleOutput) {
        console.error('Failed to send logs:', error);
      }
    } finally {
      this.isFlushingLogs = false;
    }
  }

  /**
   * Store logs for offline use
   */
  private storeOfflineLogs(): void {
    if (!this.config.offlineStorage || typeof window === 'undefined') {
      return;
    }

    try {
      // Merge with existing offline logs
      const existingLogsJson = localStorage.getItem('story_teller_offline_logs');
      let existingLogs: ClientLogEntry[] = [];
      
      if (existingLogsJson) {
        try {
          existingLogs = JSON.parse(existingLogsJson);
        } catch (e) {
          existingLogs = [];
        }
      }

      // Combine and limit size
      const combinedLogs = [...existingLogs, ...this.logQueue];
      const trimmedLogs = combinedLogs.slice(-this.config.maxOfflineEntries);

      // Store in local storage
      localStorage.setItem('story_teller_offline_logs', JSON.stringify(trimmedLogs));
    } catch (error) {
      if (this.config.consoleOutput) {
        console.error('Failed to store offline logs:', error);
      }
    }
  }

  /**
   * Store a single log entry offline
   */
  private storeOfflineLog(entry: ClientLogEntry): void {
    if (!this.config.offlineStorage || typeof window === 'undefined') {
      return;
    }

    try {
      // Add to offline queue
      this.offlineQueue.push(entry);

      // Store if we've reached the batch size
      if (this.offlineQueue.length >= this.config.transport.batchSize) {
        this.storeOfflineLogs();
        this.offlineQueue = [];
      }
    } catch (error) {
      if (this.config.consoleOutput) {
        console.error('Failed to store offline log:', error);
      }
    }
  }

  /**
   * Restore and send offline logs
   */
  private restoreOfflineLogs(): void {
    if (!this.config.offlineStorage || typeof window === 'undefined' || !navigator.onLine) {
      return;
    }

    try {
      const offlineLogsJson = localStorage.getItem('story_teller_offline_logs');
      if (!offlineLogsJson) return;

      const offlineLogs: ClientLogEntry[] = JSON.parse(offlineLogsJson);
      if (offlineLogs.length === 0) return;

      // Add to the queue for normal processing
      this.logQueue = [...offlineLogs, ...this.logQueue];

      // Remove from local storage
      localStorage.removeItem('story_teller_offline_logs');

      // Flush immediately
      this.flushLogs();
    } catch (error) {
      if (this.config.consoleOutput) {
        console.error('Failed to restore offline logs:', error);
      }
    }
  }

  /**
   * Sanitize sensitive data
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    // Clone the object
    const sanitized: Record<string, any> = { ...data };

    // Check each property
    for (const key in sanitized) {
      // Check if the key matches any sensitive patterns
      if (this.config.sensitivePatterns.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        // Recursively sanitize nested objects
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Trace level logging - for extremely detailed diagnostic information
   */
  public trace(message: string, data?: any): void {
    this.log(LogLevel.TRACE, message, data);
  }

  /**
   * Debug level logging - for detailed diagnostic information
   */
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * Info level logging - for general operational information
   */
  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * Warning level logging - for concerning but non-critical issues
   */
  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * Error level logging - for critical issues and exceptions
   */
  public error(message: string, error?: any): void {
    // If an Error object is provided, extract useful information
    if (error instanceof Error) {
      this.log(LogLevel.ERROR, message, {
        error: {
          message: error.message,
          stack: error.stack,
          type: error.name
        }
      });
    } else {
      this.log(LogLevel.ERROR, message, error);
    }
  }

  /**
   * Fatal level logging - for system-crashing errors
   */
  public fatal(message: string, error?: any): void {
    // If an Error object is provided, extract useful information
    if (error instanceof Error) {
      this.log(LogLevel.FATAL, message, {
        error: {
          message: error.message,
          stack: error.stack,
          type: error.name
        }
      });
    } else {
      this.log(LogLevel.FATAL, message, error);
    }
  }

  /**
   * Track method performance
   */
  public time(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.debug(`${label}: ${duration.toFixed(2)}ms`, {
        performance: {
          type: 'timer',
          value: duration,
          metric: label
        }
      });
    };
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    if (this.flushTimeout !== null) {
      window.clearInterval(this.flushTimeout);
      this.flushTimeout = null;
    }

    // Flush any remaining logs
    if (this.logQueue.length > 0) {
      this.flushLogs();
    }
  }
}

// Create a default logger
export const clientLogger = new ClientLogger('App');

/**
 * Create a new client logger instance
 */
export function createClientLogger(context: string, config?: Partial<ClientLoggerConfig>): ClientLogger {
  return new ClientLogger(context, config);
}

export default ClientLogger;

/**
 * Get a rating for First Input Delay based on best practices
 * 
 * @param fid - The First Input Delay time in milliseconds
 * @returns A rating of 'good', 'needs-improvement', or 'poor'
 */
function getRatingFromFID(fid: number): string {
  if (fid < 100) {
    return 'good';
  } else if (fid < 300) {
    return 'needs-improvement';
  } else {
    return 'poor';
  }
}
