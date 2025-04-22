/**
 * Context Collection Middleware Tests
 * 
 * Tests for the context collection middleware component that
 * captures and propagates context information across requests
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  contextCollectionMiddleware,
  configureContextCollection,
  getContextValue,
  setContextValue,
  clearContext,
  getCorrelationId,
  getUserId,
  getRequestId
} from '../../../../lib/logging/middleware';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, init) => {
      return {
        url,
        nextUrl: {
          pathname: url.split('?')[0],
          searchParams: new URLSearchParams(url.split('?')[1] || '')
        },
        method: init?.method || 'GET',
        headers: new Map(Object.entries(init?.headers || {})),
        cookies: {
          getAll: () => []
        },
        ip: '127.0.0.1'
      };
    }),
    NextResponse: {
      json: jest.fn().mockImplementation((body, options) => {
        return {
          status: options?.status || 200,
          headers: new Map(),
          body
        };
      })
    }
  };
});

// Mock v4 uuid generation
jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('test-uuid')
  };
});

describe('Context Collection Middleware', () => {
  beforeEach(() => {
    // Clear context between tests
    clearContext();
    
    // Reset configuration
    configureContextCollection({
      excludePaths: [/^\/api\/health/],
      includeUserInfo: true,
      includeClientInfo: true,
      includePerformanceMetrics: true
    });
    
    // Clear all mocks
    jest.clearAllMocks();
  });
  
  it('should collect and propagate correlation ID', async () => {
    // Create request
    const req = new NextRequest('https://example.com/api/test', {
      method: 'GET',
      headers: {
        'x-correlation-id': 'existing-correlation-id'
      }
    });
    
    // Mock next function
    const next = jest.fn().mockImplementation(() => {
      return Promise.resolve(NextResponse.json({ success: true }));
    });
    
    // Execute middleware
    const response = await contextCollectionMiddleware(req, next);
    
    // Check correlation ID in context
    expect(getCorrelationId()).toBe('existing-correlation-id');
    
    // Check correlation ID in response headers
    expect(response.headers.get('x-correlation-id')).toBe('existing-correlation-id');
  });
  
  it('should generate new correlation ID if none exists', async () => {
    // Create request without correlation ID
    const req = new NextRequest('https://example.com/api/test', {
      method: 'GET'
    });
    
    // Mock next function
    const next = jest.fn().mockImplementation(() => {
      return Promise.resolve(NextResponse.json({ success: true }));
    });
    
    // Execute middleware
    const response = await contextCollectionMiddleware(req, next);
    
    // Check correlation ID in context
    expect(getCorrelationId()).toBe('test-uuid');
    
    // Check correlation ID in response headers
    expect(response.headers.get('x-correlation-id')).toBe('test-uuid');
  });
  
  it('should skip excluded paths', async () => {
    // Create request for excluded path
    const req = new NextRequest('https://example.com/api/health', {
      method: 'GET'
    });
    
    // Mock next function
    const next = jest.fn().mockImplementation(() => {
      return Promise.resolve(NextResponse.json({ status: 'ok' }));
    });
    
    // Execute middleware
    await contextCollectionMiddleware(req, next);
    
    // Check that next was called
    expect(next).toHaveBeenCalled();
    
    // Context should not be set
    expect(getContextValue('correlationId')).toBeUndefined();
  });
  
  it('should collect request details', async () => {
    // Create request
    const req = new NextRequest('https://example.com/api/users?id=123', {
      method: 'POST',
      headers: {
        'user-agent': 'jest-test-agent',
        'content-type': 'application/json'
      }
    });
    
    // Mock next function
    const next = jest.fn().mockImplementation(() => {
      return Promise.resolve(NextResponse.json({ success: true }));
    });
    
    // Execute middleware
    await contextCollectionMiddleware(req, next);
    
    // Check path and method in context
    expect(getContextValue('path')).toBe('/api/users');
    expect(getContextValue('method')).toBe('POST');
    
    // Check client info
    const clientInfo = getContextValue('clientInfo');
    expect(clientInfo).toBeDefined();
    expect(clientInfo.ip).toBe('127.0.0.1');
    expect(clientInfo.userAgent).toBe('jest-test-agent');
  });
  
  it('should measure request duration', async () => {
    // Create request
    const req = new NextRequest('https://example.com/api/test', {
      method: 'GET'
    });
    
    // Mock performance.now to simulate elapsed time
    const originalNow = performance.now;
    let callCount = 0;
    
    performance.now = jest.fn().mockImplementation(() => {
      callCount++;
      return callCount === 1 ? 100 : 150; // Return 100 first time, 150 second time
    });
    
    // Mock next function
    const next = jest.fn().mockImplementation(() => {
      return Promise.resolve(NextResponse.json({ success: true }));
    });
    
    // Execute middleware
    await contextCollectionMiddleware(req, next);
    
    // Check duration in context
    expect(getContextValue('requestDuration')).toBe(50);
    
    // Restore original performance.now
    performance.now = originalNow;
  });
  
  it('should handle errors and preserve context', async () => {
    // Create request
    const req = new NextRequest('https://example.com/api/test', {
      method: 'GET'
    });
    
    // Mock next function to throw an error
    const next = jest.fn().mockImplementation(() => {
      return Promise.reject(new Error('Test error'));
    });
    
    // Execute middleware and expect error
    await expect(contextCollectionMiddleware(req, next)).rejects.toThrow('Test error');
    
    // Context should still be set
    expect(getCorrelationId()).toBe('test-uuid');
    expect(getRequestId()).toBeDefined();
  });
  
  it('should use custom context extractors', async () => {
    // Configure with custom extractor
    configureContextCollection({
      customContextExtractors: [
        async (req) => ({ 
          testKey: 'testValue',
          requestPath: req.nextUrl.pathname
        })
      ]
    });
    
    // Create request
    const req = new NextRequest('https://example.com/api/test', {
      method: 'GET'
    });
    
    // Mock next function
    const next = jest.fn().mockImplementation(() => {
      return Promise.resolve(NextResponse.json({ success: true }));
    });
    
    // Execute middleware
    await contextCollectionMiddleware(req, next);
    
    // Check custom context values
    expect(getContextValue('testKey')).toBe('testValue');
    expect(getContextValue('requestPath')).toBe('/api/test');
  });
  
  // Test context management functions
  describe('Context Management Functions', () => {
    it('should set and get context values', () => {
      setContextValue('testKey', 'testValue');
      expect(getContextValue('testKey')).toBe('testValue');
    });
    
    it('should clear context', () => {
      setContextValue('testKey', 'testValue');
      clearContext();
      expect(getContextValue('testKey')).toBeUndefined();
    });
    
    it('should handle correlation ID getter', () => {
      setContextValue('correlationId', 'test-correlation');
      expect(getCorrelationId()).toBe('test-correlation');
    });
    
    it('should handle user ID getter', () => {
      setContextValue('userId', 'test-user');
      expect(getUserId()).toBe('test-user');
    });
    
    it('should handle request ID getter', () => {
      setContextValue('requestId', 'test-request');
      expect(getRequestId()).toBe('test-request');
    });
  });
});
