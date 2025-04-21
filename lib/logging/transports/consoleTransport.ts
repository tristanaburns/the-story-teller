/**
 * consoleTransport.ts
 * 
 * Console transport for the logger - outputs logs to the console
 * with color formatting and configurable verbosity
 */

import { LogLevel } from '../logger';

export interface ConsoleTransportOptions {
  minLevel: LogLevel;
  useColors: boolean;
  showTimestamp: boolean;
  timestampFormat: 'iso' | 'locale';
  showLevel: boolean;
}

/**
 * Default options for the console transport
 */
const DEFAULT_OPTIONS: ConsoleTransportOptions = {
  minLevel: LogLevel.INFO,
  useColors: true,
  showTimestamp: true,
  timestampFormat: 'locale',
  showLevel: true
};

/**
 * ANSI color codes for different log levels
 */
const LEVEL_COLORS = {
  [LogLevel.TRACE]: '\x1b[90m', // Grey
  [LogLevel.DEBUG]: '\x1b[36m', // Cyan
  [LogLevel.INFO]: '\x1b[32m',  // Green
  [LogLevel.WARN]: '\x1b[33m',  // Yellow
  [LogLevel.ERROR]: '\x1b[31m', // Red
  [LogLevel.FATAL]: '\x1b[35m', // Magenta
  [LogLevel.NONE]: '\x1b[37m',  // White
};

/**
 * Reset ANSI color code
 */
const RESET = '\x1b[0m';

/**
 * Transport for logging to the console with color formatting
 */
export class ConsoleTransport {
  private options: ConsoleTransportOptions;
  
  constructor(options: Partial<ConsoleTransportOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }
  
  /**
   * Log a message to the console
   */
  log(level: LogLevel, message: string, data?: any): void {
    // Skip if this log level is below the minimum configured level
    if (level < this.options.minLevel) {
      return;
    }
    
    // Format timestamp if enabled
    const timestamp = this.options.showTimestamp 
      ? this.formatTimestamp() 
      : '';
    
    // Format log level if enabled
    const levelStr = this.options.showLevel 
      ? this.formatLevel(level) 
      : '';
    
    // Build the full message
    let fullMessage = '';
    
    // Add timestamp if enabled
    if (timestamp) {
      fullMessage += `${timestamp} `;
    }
    
    // Add log level if enabled
    if (levelStr) {
      fullMessage += `${levelStr} `;
    }
    
    // Add the message
    fullMessage += message;
    
    // Log to the appropriate console method
    this.writeToConsole(level, fullMessage, data);
  }
  
  /**
   * Format the timestamp according to the configured format
   */
  private formatTimestamp(): string {
    const now = new Date();
    
    if (this.options.timestampFormat === 'iso') {
      return `[${now.toISOString()}]`;
    } else {
      return `[${now.toLocaleString()}]`;
    }
  }
  
  /**
   * Format the log level with color if enabled
   */
  private formatLevel(level: LogLevel): string {
    const levelName = LogLevel[level].padEnd(5, ' ');
    
    if (this.options.useColors && process.stdout.isTTY) {
      const color = LEVEL_COLORS[level] || '';
      return `${color}[${levelName}]${RESET}`;
    } else {
      return `[${levelName}]`;
    }
  }
  
  /**
   * Write to the appropriate console method based on log level
   */
  private writeToConsole(level: LogLevel, message: string, data?: any): void {
    switch(level) {
      case LogLevel.TRACE:
      case LogLevel.DEBUG:
        if (data !== undefined) {
          console.debug(message, data);
        } else {
          console.debug(message);
        }
        break;
        
      case LogLevel.INFO:
        if (data !== undefined) {
          console.info(message, data);
        } else {
          console.info(message);
        }
        break;
        
      case LogLevel.WARN:
        if (data !== undefined) {
          console.warn(message, data);
        } else {
          console.warn(message);
        }
        break;
        
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        if (data !== undefined) {
          console.error(message, data);
        } else {
          console.error(message);
        }
        break;
        
      default:
        if (data !== undefined) {
          console.log(message, data);
        } else {
          console.log(message);
        }
    }
  }
  
  /**
   * Update the transport options
   */
  updateOptions(options: Partial<ConsoleTransportOptions>): void {
    this.options = { ...this.options, ...options };
  }
  
  /**
   * Close the transport (no-op for console)
   */
  close(): void {
    // No cleanup needed for console
  }
}
