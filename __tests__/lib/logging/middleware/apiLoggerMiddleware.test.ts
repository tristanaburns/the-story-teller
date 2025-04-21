/**
 * Tests for the API logger middleware
 * 
 * @jest-environment node
 */

import { NextRequest, NextResponse } from 'next/server';
import apiLoggerMiddleware, { configureAPILogger } from '../../../../lib/logging/middleware/apiLoggerMiddleware';
import { createLogger } from '../../../../lib/logging/logger';

// Mock the logger
jest.mock('../../../../lib/logging/logger', () => {
  return {
    createLogger: jest.fn().mockReturnValue({
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    }),
    LogLevel: {
      TRACE: 0,
      DEBUG: 1,
      INFO: 2,
      WARN: 3,
      ERROR: 4,
      FATAL: 5,
      NONE: 6
    }
  };
});

describe('apiLoggerMiddleware', () => {
  let mockRequest: NextRequest;
  let mockNext: jest.Mock;
  let mockResponse: NextResponse;
  
  beforeEach(() => {
    // Mock request
    mockRequest = {
      method: 'GET',
      nextUrl: {
        pathname: '/api/test',
        searchParams: new URLSearchParams()
      },
      headers: {
        get: jest.fn().mockImplementation((name) => {
          if (name === 'x-correlation-id') return 'test-correlation-id';
          if (name === 'user-agent') return 'test-user-agent';
          return null;
        }),
        forEach: jest.fn(),
      },
      cookies: {
        getAll: jest.fn().mockReturnValue([])
      },
      ip: '127.0.0.1',
      body: { test: 'value' },
      query: {},
      params: {},
      clone: jest.fn().mockReturnThis(),
      text: jest.fn().mockResolvedValue('{"test":"value"}')
    } as unknown as NextRequest;
    
    // Mock response
    mockResponse = {
      status: 200,
      statusText: 'OK',
      headers: {
        set: jest.fn(),
        get: jest.fn(),
        forEach: jest.fn(),
      },
      clone: jest.fn().mockReturnThis(),
      text: jest.fn().mockResolvedValue('{"result":"success"}')
    } as unknown as NextResponse;
    
    // Mock next function
    mockNext = jest.fn().mockResolvedValue(mockResponse);
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  it('should log API requests and responses', async () => {
    // Get logger instance
    const mockLogger = createLogger('APIMiddleware');
    
    // Call middleware
    await apiLoggerMiddleware(mockRequest, mockNext);
    
    // Should have logged request
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('API Request'),
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        method: 'GET',
        path: '/api/test',
      })
    );
    
    // Should have logged response
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('API Response'),
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        method: 'GET',
        path: '/api/test',
        statusCode: 200,
      })
    );
    
    // Next should have been called
    expect(mockNext).toHaveBeenCalled();
    
    // Should have added correlation ID to response headers
    expect(mockResponse.headers.set).toHaveBeenCalledWith(
      'x-correlation-id',
      'test-correlation-id'
    );
  });
  
  it('should log API errors', async () => {
    // Get logger instance
    const mockLogger = createLogger('APIMiddleware');
    
    // Mock next to throw error
    const error = new Error('Test error');
    mockNext.mockRejectedValueOnce(error);
    
    // Call middleware
    await expect(apiLoggerMiddleware(mockRequest, mockNext)).rejects.toThrow(error);
    
    // Should have logged request
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('API Request'),
      expect.any(Object)
    );
    
    // Should have logged error
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('API Error'),
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        method: 'GET',
        path: '/api/test',
      })
    );
  });
  
  it('should skip excluded paths', async () => {
    // Configure logger to exclude paths
    configureAPILogger({
      excludePaths: [/^\/api\/test/],
    });
    
    // Call middleware
    await apiLoggerMiddleware(mockRequest, mockNext);
    
    // Should not have logged
    expect(createLogger('APIMiddleware').info).not.toHaveBeenCalled();
    
    // Next should still have been called
    expect(mockNext).toHaveBeenCalled();
  });
  
  it('should sanitize sensitive data', async () => {
    // Mock request with sensitive data
    mockRequest.headers.get = jest.fn().mockImplementation((name) => {
      if (name === 'x-correlation-id') return 'test-correlation-id';
      if (name === 'user-agent') return 'test-user-agent';
      if (name === 'authorization') return 'Bearer token123';
      return null;
    });
    
    mockRequest.text = jest.fn().mockResolvedValue(JSON.stringify({
      username: 'testuser',
      password: 'secret',
      data: { token: 'abc123' }
    }));
    
    // Call middleware
    await apiLoggerMiddleware(mockRequest, mockNext);
    
    // Get logger instance
    const mockLogger = createLogger('APIMiddleware');
    
    // Should have logged request with sanitized data
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining('API Request'),
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        method: 'GET',
        path: '/api/test',
      })
    );
    
    // Verify sanitization in the second call (where metadata is logged)
    const calls = (mockLogger.info as jest.Mock).mock.calls;
    const requestMetadata = calls[0][1].metadata;
    
    // Headers should be redacted
    expect(requestMetadata.headers).toBeDefined();
    expect(requestMetadata.headers.authorization).toBe('[REDACTED]');
    
    // Body should be logged (will be populated asynchronously)
    expect(requestMetadata).toBeDefined();
  });
  
  it('should configure API logger options', () => {
    // Configure logger
    configureAPILogger({
      excludePaths: [/^\/api\/excluded/],
      redactParameterPatterns: [/custom/i],
      maxBodySize: 5000,
      logHeaders: false,
      logBody: false,
    });
    
    // Mock request with path that should be excluded
    mockRequest.nextUrl.pathname = '/api/excluded';
    
    // Call middleware
    apiLoggerMiddleware(mockRequest, mockNext);
    
    // Should not have logged
    expect(createLogger('APIMiddleware').info).not.toHaveBeenCalled();
  });
});
