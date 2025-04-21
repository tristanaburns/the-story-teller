/**
 * consoleTransport.ts
 * 
 * A transport for logging to the console with colorization and formatting
 */

import { LogLevel } from '../logger';

// Options for console transport
export interface ConsoleTransportOptions {
  minLevel: LogLevel;
  colorize: boolean;
  includeTimestamp: boolean;
  format: 'simple' | 'json' | 'pretty';
}

/**
 * A transport that logs to the console with colorization and formatting
 */
export class ConsoleTransport {
  private options: ConsoleTransportOptions;

  // Log colors for terminal output
  private static readonly logColors: Record<number | string, string> = {
    [LogLevel.TRACE]: '\x1b[90m', // Gray
    [LogLevel.DEBUG]: '\x1b[36m', // Cyan
    [LogLevel.INFO]: '\x1b[32m',  // Green
    [LogLevel.WARN]: '\x1b[33m',  // Yellow
    [LogLevel.ERROR]: '\x1b[31m', // Red
    [LogLevel.FATAL]: '\x1b[35m', // Magenta
    'reset': '\x1b[0m'            // Reset
  };

  // Console methods to use for each log level
  private static readonly logMethods: Record<number, typeof console.log> = {
    [LogLevel.TRACE]: console.trace,
    [LogLevel.DEBUG]: console.debug,
    [LogLevel.INFO]: console.info,
    [LogLevel.WARN]: console.warn,
    [LogLevel.ERROR]: console.error,
    [LogLevel.FATAL]: console.error
  };

  constructor(options: Partial<ConsoleTransportOptions> = {}) {
    this.options = {
      minLevel: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
      colorize: process.env.NODE_ENV !== 'production',
      includeTimestamp: true,
      format: process.env.NODE_ENV === 'production' ? 'json' : 'pretty',
      ...options
    };
  }

  /**
   * Log a message to the console
   */
  public log(level: LogLevel, message: string, data?: any): void {
    if (level < this.options.minLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const logFn = ConsoleTransport.logMethods[level] || console.log;

    // Format the log message
    let formattedMessage: string;
    let formattedData: any = data;

    if (this.options.format === 'json') {
      // JSON format for machine parsing
      const logObject = {
        timestamp,
        level: levelName,
        message,
        ...(data ? { data } : {})
      };
      formattedMessage = JSON.stringify(logObject);
    } else if (this.options.format === 'pretty') {
      // Pretty format for development
      formattedMessage = this.options.includeTimestamp
        ? `[${timestamp}] [${levelName}] ${message}`
        : `[${levelName}] ${message}`;

      // Apply colors if enabled
      if (this.options.colorize) {
        const color = ConsoleTransport.logColors[level] || '';
        formattedMessage = `${color}${formattedMessage}${ConsoleTransport.logColors.reset}`;
      }

      // Format data for pretty printing
      if (data) {
        try {
          if (typeof data === 'string') {
            formattedData = data;
          } else if (data instanceof Error) {
            formattedData = {
              message: data.message,
              stack: data.stack,
              ...(data as any)
            };
          } else {
            formattedData = data;
          }
        } catch (error) {
          formattedData = '[Unable to format data]';
        }
      }
    } else {
      // Simple format
      formattedMessage = this.options.includeTimestamp
        ? `[${timestamp}] [${levelName}] ${message}`
        : `[${levelName}] ${message}`;
    }

    // Log the message
    if (formattedData !== undefined) {
      logFn(formattedMessage, formattedData);
    } else {
      logFn(formattedMessage);
    }
  }
}

export default ConsoleTransport;
