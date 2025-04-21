'use client';

/**
 * Client-side logging implementation
 * Captures browser errors and logs user interactions
 */

import { ClientLogData, ClientLoggerConfig } from './types';
import { LogLevel } from './logger';

// Default configuration
const defaultConfig: ClientLoggerConfig = {
  minLevel: LogLevel.INFO,
  batchInterval: 10000, // 10 seconds
  maxBatchSize: 50,
  url: '/api/logs',
  includeUserInfo: true
};

/**
 * Client-side logger class
 */
export class ClientLogger {
  private config: ClientLoggerConfig;
  private logQueue: ClientLogData[] = [];
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private correlationId: string;
  private metadataProviders: Record<string, () => any> = {};
  private offlineStorage: ClientLogData[] = [];
  private isOnline: boolean = true;
  
  constructor(config: Partial<ClientLoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.correlationId = this.generateCorrelationId();
    
    // Set up interval for batch submission
    this.startBatchInterval();
    
    // Set up offline storage
    this.loadOfflineStorage();
    
    // Set up online/offline detection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.isOnline = navigator.onLine;
    }
  }
  
  /**
   * Start the batch submission interval
   */
  private startBatchInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    
    this.intervalId = setInterval(() => {
      this.submitBatch();
    }, this.config.batchInterval);
  }
  
  /**
   * Handle browser coming online
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    this.debug('Browser is online, submitting stored logs');
    this.submitOfflineLogs();
  };
  
  /**
   * Handle browser going offline
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    this.debug('Browser is offline, logs will be stored locally');
  };
  
  /**
   * Load offline storage from localStorage
   */
  private loadOfflineStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      const storedLogs = localStorage.getItem('client_logs_offline');
      if (storedLogs) {
        this.offlineStorage = JSON.parse(storedLogs);
        this.debug(`Loaded ${this.offlineStorage.length} offline logs`);
      }
    } catch (error) {
      console.error('Error loading offline logs:', error);
    }
  }
  
  /**
   * Save offline storage to localStorage
   */
  private saveOfflineStorage(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // Limit the size of offline storage to 1000 logs
      if (this.offlineStorage.length > 1000) {
        this.offlineStorage = this.offlineStorage.slice(-1000);
      }
      
      localStorage.setItem('client_logs_offline', JSON.stringify(this.offlineStorage));
    } catch (error) {
      console.error('Error saving offline logs:', error);
    }
  }
  
  /**
   * Submit logs stored during offline periods
   */
  private async submitOfflineLogs(): Promise<void> {
    if (this.offlineStorage.length === 0) return;
    
    try {
      // Clone the offline storage
      const logsToSubmit = [...this.offlineStorage];
      
      // Attempt to submit logs
      await this.sendLogsToServer(logsToSubmit);
      
      // Clear offline storage on success
      this.offlineStorage = [];
      this.saveOfflineStorage();
      
      this.debug(`Successfully submitted ${logsToSubmit.length} offline logs`);
    } catch (error) {
      this.debug('Failed to submit offline logs', error);
    }
  }
  
  /**
   * Generate a unique correlation ID
   */
  private generateCorrelationId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
  
  /**
   * Set a correlation ID to link logs across sessions
   */
  public setCorrelationId(correlationId: string): void {
    this.correlationId = correlationId;
  }
  
  /**
   * Get the current correlation ID
   */
  public getCorrelationId(): string {
    return this.correlationId;
  }
  
  /**
   * Add a metadata provider function
   * These will be called when creating logs to add dynamic metadata
   */
  public addMetadataProvider(name: string, provider: () => any): void {
    this.metadataProviders[name] = provider;
  }
  
  /**
   * Remove a metadata provider
   */
  public removeMetadataProvider(name: string): void {
    delete this.metadataProviders[name];
  }
  
  /**
   * Submit the current batch of logs
   */
  private async submitBatch(): Promise<void> {
    if (this.logQueue.length === 0) return;
    
    // Take logs from the queue
    const logsToSubmit = [...this.logQueue];
    this.logQueue = [];
    
    // If offline, store logs for later submission
    if (!this.isOnline) {
      this.offlineStorage.push(...logsToSubmit);
      this.saveOfflineStorage();
      return;
    }
    
    try {
      await this.sendLogsToServer(logsToSubmit);
    } catch (error) {
      // If submission fails, add logs to offline storage
      this.debug('Failed to submit logs, storing offline', error);
      this.offlineStorage.push(...logsToSubmit);
      this.saveOfflineStorage();
    }
  }
  
  /**
   * Send logs to the server
   */
  private async sendLogsToServer(logs: ClientLogData[]): Promise<void> {
    // Don't attempt to send if no logs or no URL
    if (logs.length === 0 || !this.config.url) return;
    
    // Use batch endpoint if multiple logs
    const endpoint = logs.length > 1 ? `${this.config.url}/batch` : this.config.url;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': this.correlationId
      },
      body: JSON.stringify(logs.length > 1 ? logs : logs[0])
    });
    
    if (!response.ok) {
      throw new Error(`Failed to submit logs: ${response.status}`);
    }
  }
  
  /**
   * Add a log entry to the queue
   */
  private addToQueue(level: string, message: string, data?: any): void {
    // Create the log entry
    const log: ClientLogData = {
      level,
      message,
      timestamp: new Date().toISOString(),
      correlationId: this.correlationId,
      component: 'client',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      data
    };
    
    // Add metadata from providers
    for (const [name, provider] of Object.entries(this.metadataProviders)) {
      try {
        const metadata = provider();
        if (metadata) {
          log.data = { ...log.data, [name]: metadata };
        }
      } catch (error) {
        console.error(`Error getting metadata from provider ${name}:`, error);
      }
    }
    
    // Add to queue
    this.logQueue.push(log);
    
    // If queue exceeds batch size, submit immediately
    if (this.logQueue.length >= this.config.maxBatchSize) {
      this.submitBatch();
    }
  }
  
  /**
   * Log at trace level
   */
  public trace(message: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.TRACE) {
      this.addToQueue('TRACE', message, data);
    }
  }
  
  /**
   * Log at debug level
   */
  public debug(message: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.DEBUG) {
      this.addToQueue('DEBUG', message, data);
    }
  }
  
  /**
   * Log at info level
   */
  public info(message: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.INFO) {
      this.addToQueue('INFO', message, data);
    }
  }
  
  /**
   * Log at warn level
   */
  public warn(message: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.WARN) {
      this.addToQueue('WARN', message, data);
    }
  }
  
  /**
   * Log at error level
   */
  public error(message: string, errorOrData?: Error | any): void {
    if (this.config.minLevel <= LogLevel.ERROR) {
      // Extract information from Error objects
      if (errorOrData instanceof Error) {
        this.addToQueue('ERROR', message, {
          error: {
            message: errorOrData.message,
            stack: errorOrData.stack,
            name: errorOrData.name
          }
        });
      } else {
        this.addToQueue('ERROR', message, errorOrData);
      }
    }
  }
  
  /**
   * Log at fatal level
   */
  public fatal(message: string, errorOrData?: Error | any): void {
    if (this.config.minLevel <= LogLevel.FATAL) {
      // Extract information from Error objects
      if (errorOrData instanceof Error) {
        this.addToQueue('FATAL', message, {
          error: {
            message: errorOrData.message,
            stack: errorOrData.stack,
            name: errorOrData.name
          }
        });
      } else {
        this.addToQueue('FATAL', message, errorOrData);
      }
    }
  }
  
  /**
   * Track a user interaction
   */
  public trackInteraction(action: string, element: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.INFO) {
      this.addToQueue('INFO', `User interaction: ${action}`, {
        interaction: {
          action,
          element,
          ...data
        }
      });
    }
  }
  
  /**
   * Track a page view
   */
  public trackPageView(path: string, data?: any): void {
    if (this.config.minLevel <= LogLevel.INFO) {
      this.addToQueue('INFO', `Page view: ${path}`, {
        pageView: {
          path,
          ...data
        }
      });
    }
  }
  
  /**
   * Track a performance metric
   */
  public trackPerformance(name: string, duration: number, data?: any): void {
    if (this.config.minLevel <= LogLevel.INFO) {
      this.addToQueue('INFO', `Performance: ${name}`, {
        performance: {
          name,
          duration,
          ...data
        }
      });
    }
  }
  
  /**
   * Install global error handlers
   */
  public installErrorHandlers(): void {
    if (typeof window === 'undefined') return;
    
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled error', {
        error: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        }
      });
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        error: {
          message: event.reason?.message || 'Unknown promise rejection',
          stack: event.reason?.stack
        }
      });
    });
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Submit any remaining logs
    this.submitBatch();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

// Create a default client logger instance
let clientLogger: ClientLogger | null = null;

/**
 * Initialize the client logger with configuration
 */
export function initClientLogger(config?: Partial<ClientLoggerConfig>): ClientLogger {
  if (!clientLogger) {
    clientLogger = new ClientLogger(config);
    clientLogger.installErrorHandlers();
  } else if (config) {
    // Create a new instance with updated config
    clientLogger.destroy();
    clientLogger = new ClientLogger(config);
    clientLogger.installErrorHandlers();
  }
  
  return clientLogger;
}

/**
 * Get the client logger instance
 */
export function getClientLogger(): ClientLogger {
  if (!clientLogger) {
    initClientLogger();
  }
  
  return clientLogger!;
}
