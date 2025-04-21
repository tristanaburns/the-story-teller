/**
 * Tests for the NestJS Logging Interceptor
 * 
 * @jest-environment node
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { ClsService } from 'nestjs-cls';
import { MCPLoggerService } from '../../../../mcp-servers/shared/logging/mcp-logger.service';
import { LoggingInterceptor } from '../../../../mcp-servers/shared/logging/logging.interceptor';

// Mock logger service
const mockLoggerService = {
  debug: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  setContext: jest.fn().mockReturnThis(),
};

// Mock ClsService
const mockClsService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  
  beforeEach(async () => {
    // Create testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        { provide: MCPLoggerService, useValue: mockLoggerService },
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();
    
    // Get interceptor instance
    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    
    // Reset mocks
    jest.clearAllMocks();
  });
  
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
  
  it('should log HTTP request and response', () => {
    // Mock execution context
    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'x-correlation-id': 'test-correlation-id',
        'user-agent': 'test-user-agent',
      },
      ip: '127.0.0.1',
      body: { test: 'value' },
      query: { q: 'search' },
      params: { id: '123' },
      user: { id: 'user-123' },
    };
    
    const mockResponse = {
      statusCode: 200,
      setHeader: jest.fn(),
    };
    
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
      getType: jest.fn().mockReturnValue('http'),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      getHandler: jest.fn().mockReturnValue({ name: 'testMethod' }),
    } as unknown as ExecutionContext;
    
    // Mock next function (call handler)
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ result: 'success' })),
    };
    
    // Call interceptor
    interceptor.intercept(mockContext, mockCallHandler).subscribe();
    
    // Verify ClsService was called to store correlation ID and request ID
    expect(mockClsService.set).toHaveBeenCalledWith('correlationId', 'test-correlation-id');
    expect(mockClsService.set).toHaveBeenCalledWith('requestId', expect.any(String));
    expect(mockClsService.set).toHaveBeenCalledWith('userId', 'user-123');
    
    // Verify request was logged
    expect(mockLoggerService.debug).toHaveBeenCalledWith(
      'Request: GET /api/test',
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        userId: 'user-123',
        method: 'testMethod',
        path: '/api/test',
        clientInfo: expect.objectContaining({
          ip: '127.0.0.1',
          userAgent: 'test-user-agent',
        }),
      })
    );
    
    // Verify response was logged
    expect(mockLoggerService.debug).toHaveBeenCalledWith(
      'Response: GET /api/test 200',
      expect.objectContaining({
        correlationId: 'test-correlation-id',
        userId: 'user-123',
        method: 'testMethod',
        path: '/api/test',
        statusCode: 200,
        duration: expect.any(Number),
      })
    );
    
    // Verify response header was set
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      'test-correlation-id'
    );
    
    // Verify next function was called
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });
  
  it('should log HTTP errors', (done) => {
    // Mock execution context
    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-user-agent',
      },
      ip: '127.0.0.1',
      body: { test: 'value' },
      query: {},
      params: {},
    };
    
    const mockResponse = {
      statusCode: 500,
      setHeader: jest.fn(),
    };
    
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
      getType: jest.fn().mockReturnValue('http'),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      getHandler: jest.fn().mockReturnValue({ name: 'testMethod' }),
    } as unknown as ExecutionContext;
    
    // Create HTTP exception
    const httpException = new HttpException('Test error', HttpStatus.BAD_REQUEST);
    
    // Mock next function (call handler) to throw error
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(throwError(() => httpException)),
    };
    
    // Call interceptor
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (error) => {
        // Verify error was logged
        expect(mockLoggerService.error).toHaveBeenCalledWith(
          'Error: GET /api/test 400',
          expect.any(String),
          expect.objectContaining({
            method: 'testMethod',
            path: '/api/test',
            statusCode: 400,
            duration: expect.any(Number),
            metadata: expect.objectContaining({
              errorResponse: expect.objectContaining({
                message: 'Test error',
              }),
            }),
          })
        );
        
        // Verify error is correct
        expect(error).toBe(httpException);
        
        done();
      },
    });
  });
  
  it('should skip non-HTTP contexts', () => {
    // Mock non-HTTP execution context
    const mockContext = {
      getType: jest.fn().mockReturnValue('rpc'),
    } as unknown as ExecutionContext;
    
    // Mock next function (call handler)
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('result')),
    };
    
    // Call interceptor
    interceptor.intercept(mockContext, mockCallHandler).subscribe();
    
    // Verify logger was not called
    expect(mockLoggerService.debug).not.toHaveBeenCalled();
    
    // Verify next function was called
    expect(mockCallHandler.handle).toHaveBeenCalled();
  });
  
  it('should generate correlation ID if not provided', () => {
    // Mock execution context without correlation ID
    const mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {
        'user-agent': 'test-user-agent',
      },
      ip: '127.0.0.1',
      body: {},
      query: {},
      params: {},
    };
    
    const mockResponse = {
      statusCode: 200,
      setHeader: jest.fn(),
    };
    
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
      getType: jest.fn().mockReturnValue('http'),
      getClass: jest.fn().mockReturnValue({ name: 'TestController' }),
      getHandler: jest.fn().mockReturnValue({ name: 'testMethod' }),
    } as unknown as ExecutionContext;
    
    // Mock next function
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ result: 'success' })),
    };
    
    // Call interceptor
    interceptor.intercept(mockContext, mockCallHandler).subscribe();
    
    // Verify correlation ID was generated and set
    expect(mockClsService.set).toHaveBeenCalledWith('correlationId', expect.any(String));
    
    // Verify response header was set with generated correlation ID
    expect(mockResponse.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      expect.any(String)
    );
  });
  
  it('should sanitize sensitive information', () => {
    // Mock execution context with sensitive information
    const mockRequest = {
      method: 'POST',
      url: '/api/auth/login',
      headers: {
        'user-agent': 'test-user-agent',
        'authorization': 'Bearer token123',
        'cookie': 'session=abc123',
      },
      ip: '127.0.0.1',
      body: {
        username: 'testuser',
        password: 'secret',
        token: 'abc123',
        nested: {
          secret: 'hidden',
          data: 'public'
        }
      },
      query: {},
      params: {},
    };
    
    const mockResponse = {
      statusCode: 200,
      setHeader: jest.fn(),
    };
    
    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
      getType: jest.fn().mockReturnValue('http'),
      getClass: jest.fn().mockReturnValue({ name: 'AuthController' }),
      getHandler: jest.fn().mockReturnValue({ name: 'login' }),
    } as unknown as ExecutionContext;
    
    // Mock next function
    const mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ token: 'new-token-123' })),
    };
    
    // Call interceptor
    interceptor.intercept(mockContext, mockCallHandler).subscribe();
    
    // Verify request was logged with sanitized data
    expect(mockLoggerService.debug).toHaveBeenCalledWith(
      'Request: POST /api/auth/login',
      expect.objectContaining({
        method: 'login',
        path: '/api/auth/login',
        metadata: expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': '[REDACTED]',
            'cookie': '[REDACTED]',
          }),
        }),
      })
    );
  });
});
