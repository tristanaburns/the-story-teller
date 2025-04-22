/**
 * Tests for correlation propagation utilities
 * This file contains tests for correlation ID propagation including:
 * - Generating correlation IDs
 * - Propagating correlation IDs across API calls
 * - Retrieving correlation IDs from different contexts
 * - Thread-local storage for correlation tracking
 */

import { jest } from '@jest/globals';
import { 
  generateCorrelationId, 
  getCorrelationId, 
  setCorrelationId, 
  clearCorrelationId,
  withCorrelation,
  correlationFetch,
  getCorrelationHeaders,
  extractCorrelationFromRequest
} from '@/lib/logging/utils/correlationPropagation';
import { getContextStore } from '@/lib/logging/utils/contextStore';

// Mock the fetch API
global.fetch = jest.fn();

describe('Correlation Propagation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset context store
    const contextStore = getContextStore();
    contextStore.clear();
    
    // Reset global fetch mock
    (global.fetch as jest.Mock).mockReset();
  });
  
  describe('Correlation ID Generation and Management', () => {
    test('should generate valid correlation IDs', () => {
      const id = generateCorrelationId();
      
      // UUID format validation - simple check
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      
      // Generate another one to ensure uniqueness
      const id2 = generateCorrelationId();
      expect(id).not.toBe(id2);
    });
    
    test('should allow setting and retrieving correlation ID', () => {
      const testId = 'test-correlation-123';
      
      // Set correlation ID
      setCorrelationId(testId);
      
      // Get correlation ID
      const retrievedId = getCorrelationId();
      
      // Assert
      expect(retrievedId).toBe(testId);
    });
    
    test('should clear correlation ID', () => {
      // Set correlation ID
      setCorrelationId('test-correlation-123');
      
      // Clear correlation ID
      clearCorrelationId();
      
      // Get correlation ID
      const retrievedId = getCorrelationId();
      
      // Assert
      expect(retrievedId).toBeUndefined();
    });
    
    test('should generate new ID if none exists', () => {
      // No correlation ID set
      clearCorrelationId();
      
      // Get correlation ID - should generate new one
      const id = getCorrelationId(true);
      
      // Assert
      expect(id).toBeDefined();
      expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });
  
  describe('Correlation Context Management', () => {
    test('should maintain correlation ID within async boundaries', async () => {
      // Set correlation ID
      const testId = 'test-async-correlation';
      setCorrelationId(testId);
      
      // Create nested async functions
      const nestedAsyncFunction = async () => {
        // Should still have the same correlation ID
        return getCorrelationId();
      };
      
      const outerAsyncFunction = async () => {
        const innerResult = await nestedAsyncFunction();
        return innerResult;
      };
      
      // Execute async function chain
      const result = await outerAsyncFunction();
      
      // Assert correlation ID is maintained
      expect(result).toBe(testId);
    });
    
    test('should isolate correlation IDs between parallel executions', async () => {
      // Function that sets and uses its own correlation ID
      const isolatedFunction = async (id: string) => {
        setCorrelationId(id);
        
        // Simulate some asynchronous work
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Return current correlation ID
        return getCorrelationId();
      };
      
      // Execute two instances in parallel
      const [result1, result2] = await Promise.all([
        isolatedFunction('correlation-1'),
        isolatedFunction('correlation-2')
      ]);
      
      // Assert each function maintained its own correlation ID
      expect(result1).toBe('correlation-1');
      expect(result2).toBe('correlation-2');
    });
    
    test('should support scoped correlation with withCorrelation', async () => {
      // Set initial correlation ID
      setCorrelationId('initial-correlation');
      
      // Run with different correlation ID
      const result = await withCorrelation('scoped-correlation', async () => {
        // Inside the scope, we should have the scoped correlation ID
        const insideScope = getCorrelationId();
        
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 10));
        
        // Check again after async work
        const afterAsync = getCorrelationId();
        
        return { insideScope, afterAsync };
      });
      
      // After withCorrelation completes, we should have the original ID
      const afterScope = getCorrelationId();
      
      // Assert
      expect(result.insideScope).toBe('scoped-correlation');
      expect(result.afterAsync).toBe('scoped-correlation');
      expect(afterScope).toBe('initial-correlation');
    });
  });
  
  describe('HTTP Integration', () => {
    test('should add correlation ID to fetch headers', async () => {
      // Set correlation ID
      const testId = 'http-correlation-123';
      setCorrelationId(testId);
      
      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' })
      });
      
      // Use correlation-aware fetch
      await correlationFetch('https://api.example.com/data', {
        method: 'GET'
      });
      
      // Check that fetch was called with correlation headers
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
      
      expect(url).toBe('https://api.example.com/data');
      expect(options.headers).toBeDefined();
      expect(options.headers['x-correlation-id']).toBe(testId);
    });
    
    test('should preserve existing headers in fetch requests', async () => {
      // Set correlation ID
      setCorrelationId('preserve-headers-test');
      
      // Mock successful fetch response
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: 'test' })
      });
      
      // Use correlation-aware fetch with existing headers
      await correlationFetch('https://api.example.com/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer token123'
        },
        body: JSON.stringify({ test: true })
      });
      
      // Check that fetch was called with all headers
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
      
      expect(options.headers['Content-Type']).toBe('application/json');
      expect(options.headers['Authorization']).toBe('Bearer token123');
      expect(options.headers['x-correlation-id']).toBe('preserve-headers-test');
      expect(options.body).toBe(JSON.stringify({ test: true }));
    });
    
    test('should generate correlation headers object', () => {
      // Set correlation ID
      const testId = 'header-generation-test';
      setCorrelationId(testId);
      
      // Generate headers
      const headers = getCorrelationHeaders();
      
      // Assert
      expect(headers).toEqual({
        'x-correlation-id': testId
      });
    });
    
    test('should extract correlation ID from request headers', () => {
      // Mock request with correlation header
      const mockRequest = {
        headers: {
          get: jest.fn().mockImplementation((name) => {
            if (name.toLowerCase() === 'x-correlation-id') {
              return 'extracted-correlation-123';
            }
            return null;
          })
        }
      };
      
      // Extract correlation ID
      const extractedId = extractCorrelationFromRequest(mockRequest as any);
      
      // Assert
      expect(extractedId).toBe('extracted-correlation-123');
      expect(mockRequest.headers.get).toHaveBeenCalledWith('x-correlation-id');
    });
    
    test('should handle missing correlation ID in request', () => {
      // Mock request without correlation header
      const mockRequest = {
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      };
      
      // Extract correlation ID
      const extractedId = extractCorrelationFromRequest(mockRequest as any);
      
      // Assert
      expect(extractedId).toBeUndefined();
    });
  });
  
  describe('Edge Cases', () => {
    test('should handle multiple correlation ID changes', () => {
      // Start with no correlation ID
      clearCorrelationId();
      expect(getCorrelationId()).toBeUndefined();
      
      // Set correlation ID
      setCorrelationId('first-id');
      expect(getCorrelationId()).toBe('first-id');
      
      // Change correlation ID
      setCorrelationId('second-id');
      expect(getCorrelationId()).toBe('second-id');
      
      // Clear correlation ID
      clearCorrelationId();
      expect(getCorrelationId()).toBeUndefined();
    });
    
    test('should handle nested withCorrelation calls', async () => {
      // Set initial correlation ID
      setCorrelationId('outer-correlation');
      
      // Execute nested withCorrelation
      const result = await withCorrelation('middle-correlation', async () => {
        const middleId = getCorrelationId();
        
        // Nested withCorrelation
        const innerResult = await withCorrelation('inner-correlation', async () => {
          const innerId = getCorrelationId();
          return innerId;
        });
        
        // After inner withCorrelation
        const afterInnerId = getCorrelationId();
        
        return {
          middleId,
          innerResult,
          afterInnerId
        };
      });
      
      // After outer withCorrelation
      const outerId = getCorrelationId();
      
      // Assert
      expect(result.middleId).toBe('middle-correlation');
      expect(result.innerResult).toBe('inner-correlation');
      expect(result.afterInnerId).toBe('middle-correlation');
      expect(outerId).toBe('outer-correlation');
    });
  });
});
