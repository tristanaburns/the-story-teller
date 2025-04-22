/**
 * @deprecated This file is deprecated and will be removed in a future version.
 * Please import types from '@/lib/logging/types/index.ts' or '@/lib/logging' instead.
 */

import {
  LogEntry as NewLogEntry,
  LogQueryParams as NewLogQueryParams,
  LogStatisticsSummary as NewLogStatisticsSummary,
  ClientLogData as NewClientLogData,
  ClientLoggerConfig as NewClientLoggerConfig
} from './types/index';

export interface LogEntry extends NewLogEntry {}
export interface LogQueryParams extends NewLogQueryParams {}
export interface LogStatisticsSummary extends NewLogStatisticsSummary {}
export interface ClientLogData extends NewClientLogData {}
export interface ClientLoggerConfig extends NewClientLoggerConfig {}

export interface LoggerMetadata {
  [key: string]: any;
} 