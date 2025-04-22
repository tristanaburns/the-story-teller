/**
 * logging/middleware/index.ts
 * 
 * Exports all middleware components for the logging system
 */

export { default as apiLoggerMiddleware, configureAPILogger } from './apiLoggerMiddleware';
export { 
  default as contextCollectionMiddleware, 
  configureContextCollection,
  getContextValue,
  setContextValue,
  clearContext,
  getCorrelationId,
  getUserId,
  getRequestId
} from './contextCollectionMiddleware';
