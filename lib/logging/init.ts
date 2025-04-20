/**
 * init.ts
 * 
 * Initialize logging configuration for the application
 * This should be imported as early as possible in the application lifecycle
 */

import { configureLogger, LogLevel } from './logger';

// Initialize logging based on environment variables
export function initializeLogging(): void {
  // Determine log level from environment
  let minLevel = LogLevel.INFO;
  
  if (process.env.LOG_LEVEL) {
    const envLevel = process.env.LOG_LEVEL.toUpperCase();
    if (envLevel === 'DEBUG') minLevel = LogLevel.DEBUG;
    if (envLevel === 'INFO') minLevel = LogLevel.INFO;
    if (envLevel === 'WARN') minLevel = LogLevel.WARN;
    if (envLevel === 'ERROR') minLevel = LogLevel.ERROR;
    if (envLevel === 'NONE') minLevel = LogLevel.NONE;
  } else if (process.env.NODE_ENV === 'development') {
    // Default to DEBUG in development
    minLevel = LogLevel.DEBUG;
  }
  
  // Configure global logger settings
  configureLogger({
    minLevel,
    includeTimestamp: true,
    includeContext: true
  });
  
  // Override console methods in development to add more information
  if (process.env.NODE_ENV === 'development') {
    enhanceConsoleInDevelopment();
  }
}

// Enhances the standard console methods in development with more context
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
