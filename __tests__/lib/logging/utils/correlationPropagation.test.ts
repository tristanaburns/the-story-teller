/**
 * Correlation Propagation Tests
 * 
 * Tests for the correlation ID propagation utilities
 * that ensure proper tracing across service boundaries
 */

import {
  getOrCreateCorrelationId,
  addCorrelationToHeaders,
  extractCorrelationFromResponse,
  fetchWithCorrelation,
  mcpRequestWithCorrelation
} from '../../../../lib/logging/utils';

// Mock the context functions
jest.mock('../../../../lib/logging/middleware', () => ({
  getContextValue: jest.fn(),
  setContextValue: jest.fn(),
  clearContext: jest.fn()
}));

// Import the mocked functions
import { getContextValue, setContextValue, clearContext } from '../../../../lib/logging/middleware';

// Mock uuid generation
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-correlation-id')
}));

// Mock fetch
global.fetch = jest.fn();

describe('Correlation ID Propagation', () => {
  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset fetch mock
    (global.fetch as jest.Mock).mockReset();
  });
  
  describe('getOrCreateCorrelationId', () => {
    it('should return existing correlation ID from context', () => {
      // Mock getContextValue to return a correlation ID
      (getContextValue as jest.Mock).mockReturnValue('existing-correlation-id');
      
      const result = getOrCreateCorrelationId();
      
      // Should return the existing ID
      expect(result).toBe('existing-correlation-id');
      
      // Should have called getContextValue
      expect(getContextValue).toHaveBeenCalledWith('correlationId');
      
      // Should not have called setContextValue
      expect(setContextValue).not.toHaveBeenCalled();
    });
    
    it('should generate and store new correlation ID if none exists', () => {
      // Mock getContextValue to return undefined
      (getContextValue as jest.Mock).mockReturnValue(undefined);
      
      const result = getOrCreateCorrelationId();
      
      // Should return the new ID
      expect(result).toBe('test-correlation-id');
      
      // Should have called getContextValue
      expect(getContextValue).toHaveBeenCalledWith('correlationId');
      
      // Should have called setContextValue with the new ID
      expect(setContextValue).toHaveBeenCalledWith('correlationId', 'test-correlation-id');
    });
  });
  
  describe('addCorrelationToHeaders', () => {
    it('should add correlation ID to headers object', () => {
      // Mock getContextValue to return a correlation ID
      (getContextValue as jest.Mock).mockReturnValue('existing-correlation-id');
      
      const headers = { 'Content-Type': 'application/json' };
      const result = addCorrelationToHeaders(headers);
      
      // Should add correlation ID header
      expect(result).toEqual({
        'Content-Type': 'application/json',
        'x-correlation-id': 'existing-correlation-id'
      });
    });
    
    it('should use default header name', () => {
      // Mock getContextValue to return a correlation ID
      (getContextValue as jest.Mock).mockReturnValue('existing-correlation-id');
      
      const result = addCorrelationToHeaders({});
      
      // Should add correlation ID header with default name
      expect(result).toEqual({
        'x-correlation-id': 'existing-correlation-id'
      });
    });
    
    it('should use custom header name if provided', () => {
      // Mock getContextValue to return a correlation ID
      (getContextValue as jest.Mock).mockReturnValue('existing-correlation-id');
      
      const result = addCorrelationToHeaders({}, { headerName: 'X-Custom-Correlation' });
      
      // Should add correlation ID header with custom name
      expect(result).toEqual({
        'X-Custom-Correlation': 'existing-correlation-id'
      });
    });
    
    it('should generate new correlation ID if none exists and generateIfMissing is true', () => {
      // Mock getContextValue to return undefined
      (getContextValue as jest.Mock).mockReturnValue(undefined);
      
      const result = addCorrelationToHeaders({}, { generateIfMissing: true });
      
      // Should generate and add correlation ID header
      expect(result).toEqual({
        'x-correlation-id': 'test-correlation-id'
      });
    });
    
    it('should not add correlation ID if none exists and generateIfMissing is false', () => {
      // Mock getContextValue to return undefined
      (getContextValue as jest.Mock).mockReturnValue(undefined);
      
      const headers = { 'Content-Type': 'application/json' };
      const result = addCorrelationToHeaders(headers, { generateIfMissing: false });
      
      // Should not modify headers
      expect(result).toEqual({
        'Content-Type': 'application/json'
      });
    });
  });
  
  describe('extractCorrelationFromResponse', () => {
    it('should extract correlation ID from response headers', () => {
      // Create mock response with correlation ID header
      const response = {
        headers: {
          get: jest.fn().mockImplementation(name => {
            if (name === 'x-correlation-id') {
              return 'response-correlation-id';
            }
            return null;
          })
        }
      } as unknown as Response;
      
      const result = extractCorrelationFromResponse(response);
      
      // Should return the correlation ID
      expect(result).toBe('response-correlation-id');
      
      // Should have called response.headers.get
      expect(response.headers.get).toHaveBeenCalledWith('x-correlation-id');
      
      // Should have set the correlation ID in context
      expect(setContextValue).toHaveBeenCalledWith('correlationId', 'response-correlation-id');
    });
    
    it('should use custom header name if provided', () => {
      // Create mock response with custom correlation ID header
      const response = {
        headers: {
          get: jest.fn().mockImplementation(name => {
            if (name === 'X-Custom-Correlation') {
              return 'response-correlation-id';
            }
            return null;
          })
        }
      } as unknown as Response;
      
      const result = extractCorrelationFromResponse(response, { headerName: 'X-Custom-Correlation' });
      
      // Should return the correlation ID
      expect(result).toBe('response-correlation-id');
      
      // Should have called response.headers.get with the custom name
      expect(response.headers.get).toHaveBeenCalledWith('X-Custom-Correlation');
    });
    
    it('should return undefined if correlation ID is not in response headers', () => {
      // Create mock response without correlation ID header
      const response = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as unknown as Response;
      
      const result = extractCorrelationFromResponse(response);
      
      // Should return undefined
      expect(result).toBeUndefined();
      
      // Should have called response.headers.get
      expect(response.headers.get).toHaveBeenCalledWith('x-correlation-id');
      
      // Should not have set the correlation ID in context
      expect(setContextValue).not.toHaveBeenCalled();
    });
  });
  
  describe('fetchWithCorrelation', () => {
    it('should add correlation ID to fetch request and extract from response', async () => {
      // Mock getContextValue to return a correlation ID
      (getContextValue as jest.Mock).mockReturnValue('existing-correlation-id');
      
      // Create mock response
      const mockResponse = {
        headers: {
          get: jest.fn().mockImplementation(name => {
            if (name === 'x-correlation-id') {
              return 'response-correlation-id';
            }
            return null;
          })
        }
      };
      
      // Mock fetch to return the mock response
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      
      // Call fetchWithCorrelation
      const result = await fetchWithCorrelation('https://example.com/api', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Should return the mock response
      expect(result).toBe(mockResponse);
      
      // Should have called fetch with the correlation ID header
      expect(global.fetch).toHaveBeenCalledWith('https://example.com/api', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-correlation-id': 'existing-correlation-id'
        }
      });
      
      // Should have extracted the correlation ID from the response
      expect(setContextValue).toHaveBeenCalledWith('correlationId', 'response-correlation-id');
    });
  });
  
  describe('mcpRequestWithCorrelation', () => {
    it('should add correlation ID to MCP request headers', async () => {
      // Mock getContextValue to return a correlation ID
      (getContextValue as jest.Mock).mockReturnValue('existing-correlation-id');
      
      // Create mock request function
      const mockRequestFn = jest.fn().mockResolvedValue({ success: true });
      
      // Call mcpRequestWithCorrelation
      const result = await mcpRequestWithCorrelation(mockRequestFn);
      
      // Should return the mock request result
      expect(result).toEqual({ success: true });
      
      // Should have called the request function with correlation ID header
      expect(mockRequestFn).toHaveBeenCalledWith({
        'x-correlation-id': 'existing-correlation-id'
      });
    });
    
    it('should use custom header name if provided', async () => {
      // Mock getContextValue to return a correlation ID
      (getContextValue as jest.Mock).mockReturnValue('existing-correlation-id');
      
      // Create mock request function
      const mockRequestFn = jest.fn().mockResolvedValue({ success: true });
      
      // Call mcpRequestWithCorrelation with custom header name
      const result = await mcpRequestWithCorrelation(mockRequestFn, {
        headerName: 'X-Custom-Correlation'
      });
      
      // Should return the mock request result
      expect(result).toEqual({ success: true });
      
      // Should have called the request function with custom correlation ID header
      expect(mockRequestFn).toHaveBeenCalledWith({
        'X-Custom-Correlation': 'existing-correlation-id'
      });
    });
    
    it('should generate new correlation ID if none exists and generateIfMissing is true', async () => {
      // Mock getContextValue to return undefined
      (getContextValue as jest.Mock).mockReturnValue(undefined);
      
      // Create mock request function
      const mockRequestFn = jest.fn().mockResolvedValue({ success: true });
      
      // Call mcpRequestWithCorrelation
      const result = await mcpRequestWithCorrelation(mockRequestFn, {
        generateIfMissing: true
      });
      
      // Should return the mock request result
      expect(result).toEqual({ success: true });
      
      // Should have called the request function with generated correlation ID header
      expect(mockRequestFn).toHaveBeenCalledWith({
        'x-correlation-id': 'test-correlation-id'
      });
    });
  });
});
