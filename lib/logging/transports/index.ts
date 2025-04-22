/**
 * index.ts
 * 
 * Exports all transport classes for the logger
 */

// Export all transport classes
export * from './consoleTransport';
export * from './fileTransport';
export * from './mongoTransport';

/**
 * @deprecated Import LogEntry from '@/lib/logging/types' or '@/lib/logging' instead
 * This export will be removed in a future version
 */
export type { MongoLogEntry as LogEntry } from './mongoTransport';
