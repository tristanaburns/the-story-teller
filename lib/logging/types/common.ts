/**
 * common.ts
 * 
 * Common type definitions for the logging system
 */

import { LogLevel } from '../logger';

/**
 * Log entry interface representing a stored log record
 */
export interface LogEntry {
  _id?: string;
  timestamp?: string;
  level?: string;
  message?: string;
  context?: string;
  component?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  correlationId?: string;
  userId?: string;
  requestId?: string;
  mcpServer?: string;
  environment?: string;
  appVersion?: string;
  clientInfo?: {
    ip?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
  };
  data?: any;
  error?: {
    message?: string;
    stack?: string;
    name?: string;
    [key: string]: any;
  };
  metadata?: Record<string, any>;
} 