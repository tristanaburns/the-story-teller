/**
 * correlationPropagation.ts
 * 
 * Utilities for propagating correlation IDs across service boundaries
 * Ensures consistent tracking of requests across Next.js and MCP servers
 */

import { v4 as uuidv4 } from 'uuid';
import { getContextValue, setContextValue } from '../middleware';
import { createLogger } from '../logger';

// Create logger instance
const logger = createLogger('CorrelationPropagation');

/**
 * Get the current correlation ID from context or generate a new one
 */
export function getOrCreateCorrelationId(): string {
  const existing = getContextValue('correlationId');
  if (existing) {
    return existing;
  }
  
  // Generate a new correlation ID if none exists
  const newId = uuidv4();
  setContextValue('correlationId', newId);
  logger.debug('Generated new correlation ID', { correlationId: newId });
  
  return newId;
}

/**
 * Options for correlation ID propagation
 */
export interface CorrelationPropagationOptions {
  headerName?: string;
  generateIfMissing?: boolean;
  logPropagation?: boolean;
}

/**
 * Default options for correlation propagation
 */
const DEFAULT_OPTIONS: CorrelationPropagationOptions = {
  headerName: 'x-correlation-id',
  generateIfMissing: true,
  logPropagation: true
};

/**
 * Add correlation ID to fetch request headers
 */
export function addCorrelationToHeaders(
  headers: HeadersInit = {},
  options: Partial<CorrelationPropagationOptions> = {}
): HeadersInit {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const correlationId = getContextValue('correlationId') || 
    (opts.generateIfMissing ? uuidv4() : undefined);
  
  if (!correlationId) {
    return headers;
  }
  
  // Convert headers to a mutable object
  const newHeaders = headers instanceof Headers 
    ? Object.fromEntries(headers.entries()) 
    : { ...headers };
  
  // Add correlation ID header
  newHeaders[opts.headerName || 'x-correlation-id'] = correlationId;
  
  // Log propagation if enabled
  if (opts.logPropagation) {
    logger.debug('Propagating correlation ID to outbound request', { correlationId });
  }
  
  return newHeaders;
}

/**
 * Extract correlation ID from response headers
 */
export function extractCorrelationFromResponse(
  response: Response,
  options: Partial<CorrelationPropagationOptions> = {}
): string | undefined {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const headerName = opts.headerName || 'x-correlation-id';
  
  // Extract correlation ID from response headers
  const correlationId = response.headers.get(headerName);
  
  if (correlationId) {
    // Update context with the correlation ID from the response
    setContextValue('correlationId', correlationId);
    
    // Log extraction if enabled
    if (opts.logPropagation) {
      logger.debug('Extracted correlation ID from response', { correlationId });
    }
  }
  
  return correlationId;
}

/**
 * Wrap a fetch call with correlation ID propagation
 */
export async function fetchWithCorrelation(
  url: RequestInfo | URL,
  options: RequestInit = {},
  correlationOptions: Partial<CorrelationPropagationOptions> = {}
): Promise<Response> {
  // Get or create headers object
  const headers = options.headers || {};
  
  // Add correlation ID to headers
  const headersWithCorrelation = addCorrelationToHeaders(headers, correlationOptions);
  
  // Make the fetch request with correlation headers
  const response = await fetch(url, {
    ...options,
    headers: headersWithCorrelation
  });
  
  // Extract correlation ID from response (in case it changed)
  extractCorrelationFromResponse(response, correlationOptions);
  
  return response;
}

/**
 * Wrap an MCP server request with correlation ID propagation
 * This is a generic function that can be adapted for specific MCP clients
 */
export async function mcpRequestWithCorrelation<T>(
  requestFn: (headers: Record<string, string>) => Promise<T>,
  correlationOptions: Partial<CorrelationPropagationOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Get correlation ID
  const correlationId = getContextValue('correlationId') || 
    (opts.generateIfMissing ? uuidv4() : undefined);
  
  // Create headers object with correlation ID
  const headers: Record<string, string> = {};
  if (correlationId) {
    headers[opts.headerName || 'x-correlation-id'] = correlationId;
    
    // Log propagation if enabled
    if (opts.logPropagation) {
      logger.debug('Propagating correlation ID to MCP server', { correlationId, mcpServer: true });
    }
  }
  
  // Execute the request with correlation headers
  return await requestFn(headers);
}
