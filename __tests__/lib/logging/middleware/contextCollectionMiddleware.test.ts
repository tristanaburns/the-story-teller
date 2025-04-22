/**
 * Tests for the context collection middleware
 * This file contains tests for the logging context collection middleware including:
 * - Request context capture
 * - User information extraction
 * - Client device information 
 * - Performance measurement
 */

import { jest } from '@jest/globals';
import { createMocks } from 'node-mocks-http';
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { contextCollectionMiddleware } from '@/lib/logging/middleware/contextCollectionMiddleware';
import { Context } from '@/lib/logging/types';
import { getContextStore } from '@/lib/logging/utils/contextStore';

// Mock next-auth
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// Mock user agent parser
jest.mock('ua-parser-js', () => {
  return jest.fn().mockImplementation(() => ({
    getResult: () => ({
      browser: { name: 'Chrome', version: '120.0.0' },
      device: { model: 'Desktop', type: 'desktop', vendor: '' },
      os: { name: 'Windows', version: '10' },
    }),
  }));
});

describe('Context Collection Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset context store
    const contextStore = getContextStore();
    contextStore.clear();
  });
  
  test('should capture basic request information', async () => {
    // Mock request and response
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
        'x-forwarded-for': '192.168.1.1',
      },
    });
    
    // No session
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Mock handler
    const handler = jest.fn((req, res) => {
      res.status(200).json({ success: true });
    });
    
    // Wrap with middleware
    const wrappedHandler = contextCollectionMiddleware(handler);
    
    // Execute
    await wrappedHandler(req, res);
    
    // Get context from store
    const contextStore = getContextStore();
    const context = contextStore.get() as Context;
    
    // Assert
    expect(context).toBeDefined();
    expect(context.correlationId).toBeDefined(); // Should generate a correlation ID
    expect(context.requestPath).toBe('/api/test');
    expect(context.requestMethod).toBe('GET');
    expect(context.clientIp).toBe('192.168.1.1');
    expect(context.clientInfo.browser).toBe('Chrome');
    expect(context.clientInfo.os).toBe('Windows');
    expect(context.clientInfo.device).toBe('Desktop');
    expect(context.startTime).toBeDefined();
    
    // Ensure handler was called
    expect(handler).toHaveBeenCalledWith(req, res);
  });
  
  test('should capture user information from session', async () => {
    // Mock request and response
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      url: '/api/user/profile',
    });
    
    // Mock session with user
    const mockSession = {
      user: {
        id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
      },
    };
    (getServerSession as jest.Mock).mockResolvedValue(mockSession);
    
    // Mock handler
    const handler = jest.fn((req, res) => {
      res.status(200).json({ success: true });
    });
    
    // Wrap with middleware
    const wrappedHandler = contextCollectionMiddleware(handler);
    
    // Execute
    await wrappedHandler(req, res);
    
    // Get context from store
    const contextStore = getContextStore();
    const context = contextStore.get() as Context;
    
    // Assert user information
    expect(context.userId).toBe('user123');
    expect(context.userInfo).toEqual({
      id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
    });
  });
  
  test('should handle incoming correlation ID header', async () => {
    // Mock request with existing correlation ID
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      url: '/api/data',
      headers: {
        'x-correlation-id': 'existing-correlation-123',
      },
    });
    
    // No session
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Mock handler
    const handler = jest.fn((req, res) => {
      res.status(200).json({ success: true });
    });
    
    // Wrap with middleware
    const wrappedHandler = contextCollectionMiddleware(handler);
    
    // Execute
    await wrappedHandler(req, res);
    
    // Get context from store
    const contextStore = getContextStore();
    const context = contextStore.get() as Context;
    
    // Assert correlation ID is preserved
    expect(context.correlationId).toBe('existing-correlation-123');
    
    // Check response header
    expect(res.getHeader('x-correlation-id')).toBe('existing-correlation-123');
  });
  
  test('should set performance metrics after request completes', async () => {
    // Mock request and response
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      url: '/api/performance-test',
    });
    
    // Mock performance timing
    const mockStartTime = Date.now();
    
    // Mock performance.now for consistent tests
    const originalNow = performance.now;
    performance.now = jest.fn()
      .mockReturnValueOnce(100) // Start time
      .mockReturnValueOnce(150); // End time (50ms elapsed)
      
    // No session
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Mock handler with delay
    const handler = jest.fn(async (req, res) => {
      // Simulate some processing
      await new Promise(resolve => setTimeout(resolve, 5));
      res.status(200).json({ success: true });
    });
    
    // Wrap with middleware
    const wrappedHandler = contextCollectionMiddleware(handler);
    
    // Execute
    await wrappedHandler(req, res);
    
    // Restore performance.now
    performance.now = originalNow;
    
    // Get context from store
    const contextStore = getContextStore();
    const context = contextStore.get() as Context;
    
    // Assert performance metrics
    expect(context.duration).toBe(50); // Mock values: 150 - 100 = 50
    expect(context.endTime).toBeDefined();
  });
  
  test('should handle errors in handler gracefully', async () => {
    // Mock request and response
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      url: '/api/error-test',
    });
    
    // No session
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Mock handler that throws error
    const errorMessage = 'Test error in handler';
    const handler = jest.fn((req, res) => {
      throw new Error(errorMessage);
    });
    
    // Wrap with middleware
    const wrappedHandler = contextCollectionMiddleware(handler);
    
    // Execute and catch error
    let caughtError;
    try {
      await wrappedHandler(req, res);
    } catch (error) {
      caughtError = error;
    }
    
    // Assert error was thrown
    expect(caughtError).toBeDefined();
    expect(caughtError.message).toBe(errorMessage);
    
    // Get context from store
    const contextStore = getContextStore();
    const context = contextStore.get() as Context;
    
    // Assert error information was added to context
    expect(context.error).toBeDefined();
    expect(context.error.message).toBe(errorMessage);
    expect(context.error.stack).toBeDefined();
    
    // Duration should still be set
    expect(context.duration).toBeDefined();
    expect(context.endTime).toBeDefined();
  });
  
  test('should extract custom headers when configured', async () => {
    // Mock request with custom headers
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
      url: '/api/custom-headers',
      headers: {
        'x-request-id': 'req123',
        'x-api-key': 'api-key-123',
        'x-client-version': '1.2.3',
      },
    });
    
    // No session
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Mock handler
    const handler = jest.fn((req, res) => {
      res.status(200).json({ success: true });
    });
    
    // Set custom headers to extract
    const customHeadersToExtract = ['x-request-id', 'x-client-version'];
    
    // Wrap with middleware with custom config
    const wrappedHandler = contextCollectionMiddleware(handler, {
      extractHeaders: customHeadersToExtract,
    });
    
    // Execute
    await wrappedHandler(req, res);
    
    // Get context from store
    const contextStore = getContextStore();
    const context = contextStore.get() as Context;
    
    // Assert custom headers were extracted
    expect(context.headers['x-request-id']).toBe('req123');
    expect(context.headers['x-client-version']).toBe('1.2.3');
    
    // Headers not in the list should not be extracted
    expect(context.headers['x-api-key']).toBeUndefined();
  });
  
  test('should sanitize request parameters', async () => {
    // Mock request with query parameters and body
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      url: '/api/user/login?returnUrl=/dashboard&debug=true',
      body: {
        username: 'testuser',
        password: 'secret123', // Sensitive data
        rememberMe: true,
      },
    });
    
    // No session
    (getServerSession as jest.Mock).mockResolvedValue(null);
    
    // Mock handler
    const handler = jest.fn((req, res) => {
      res.status(200).json({ success: true });
    });
    
    // Wrap with middleware
    const wrappedHandler = contextCollectionMiddleware(handler, {
      sanitizeParams: true,
    });
    
    // Execute
    await wrappedHandler(req, res);
    
    // Get context from store
    const contextStore = getContextStore();
    const context = contextStore.get() as Context;
    
    // Assert query parameters were captured and sanitized
    expect(context.requestParams.query).toBeDefined();
    expect(context.requestParams.query.returnUrl).toBe('/dashboard');
    expect(context.requestParams.query.debug).toBe('true');
    
    // Assert body was sanitized - password should be masked
    expect(context.requestParams.body).toBeDefined();
    expect(context.requestParams.body.username).toBe('testuser');
    expect(context.requestParams.body.password).not.toBe('secret123');
    expect(context.requestParams.body.password).toMatch(/\*+/); // Should be masked with asterisks
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
