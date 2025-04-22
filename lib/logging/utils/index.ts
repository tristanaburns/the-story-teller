/**
 * logging/utils/index.ts
 * 
 * Exports all utility functions for the logging system
 */

export { 
  getOrCreateCorrelationId,
  addCorrelationToHeaders,
  extractCorrelationFromResponse,
  fetchWithCorrelation,
  mcpRequestWithCorrelation
} from './correlationPropagation';

export { 
  default as maskSensitiveData,
  configureSensitiveDataMasking,
  addSensitivePatterns,
  isSensitiveKey
} from './sensitiveDataMasking';
