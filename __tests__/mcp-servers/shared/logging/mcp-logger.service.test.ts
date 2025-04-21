/**
 * Tests for the MCP Logger Service
 * 
 * @jest-environment node
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { MCPLoggerService } from '../../../../mcp-servers/shared/logging/mcp-logger.service';

// Mock winston
jest.mock('winston', () => {
  const mockFormat = {
    combine: jest.fn().mockReturnThis(),
    timestamp: jest.fn().mockReturnThis(),
    errors: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    colorize: jest.fn().mockReturnThis(),
    printf: jest.fn().mockReturnThis(),
  };
  
  const mockLogger = {
    log: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
    trace: jest.fn(),
    add: jest.fn(),
  };
  
  return {
    format: mockFormat,
    createLogger: jest.fn().mockReturnValue(mockLogger),
    transports: {
      Console: jest.fn(),
      MongoDB: jest.fn(),
    },
  };
});

// Mock ClsService
const mockClsService = {
  get: jest.fn(),
  set: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn((key, defaultValue) => {
    const config = {
      NODE_ENV: 'test',
      APP_VERSION: '1.0.0',
      MCP_SERVER_NAME: 'test-server',
      LOG_LEVEL: 'debug',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      MONGODB_LOGGING_ENABLED: true,
      MONGODB_LOG_LEVEL: 'info',
    };
    return config[key] || defaultValue;
  }),
};

describe('MCPLoggerService', () => {
  let loggerService: MCPLoggerService;
  let winston: any;
  
  beforeEach(async () => {
    // Create a Nest testing module
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MCPLoggerService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: ClsService, useValue: mockClsService },
      ],
    }).compile();
    
    // Get instances
    loggerService = module.get<MCPLoggerService>(MCPLoggerService);
    winston = require('winston');
    
    // Clear mocks
    jest.clearAllMocks();
  });
  
  describe('initialization', () => {
    it('should initialize with default options', () => {
      expect(winston.createLogger).toHaveBeenCalled();
      expect(winston.transports.Console).toHaveBeenCalled();
    });
    
    it('should add MongoDB transport if configured', () => {
      expect(winston.transports.MongoDB).toHaveBeenCalled();
      expect(winston.createLogger().add).toHaveBeenCalled();
    });
  });
  
  describe('logging methods', () => {
    beforeEach(() => {
      // Set context for logger
      loggerService.setContext('TestContext');
    });
    
    it('should log at trace level', () => {
      loggerService.trace('Trace message');
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'trace',
        'Trace message',
        expect.objectContaining({ context: 'TestContext' })
      );
    });
    
    it('should log at debug level', () => {
      loggerService.debug('Debug message');
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'debug',
        'Debug message',
        expect.objectContaining({ context: 'TestContext' })
      );
    });
    
    it('should log at info level', () => {
      loggerService.info('Info message');
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'info',
        'Info message',
        expect.objectContaining({ context: 'TestContext' })
      );
    });
    
    it('should log at warn level', () => {
      loggerService.warn('Warning message');
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'warn',
        'Warning message',
        expect.objectContaining({ context: 'TestContext' })
      );
    });
    
    it('should log at error level', () => {
      loggerService.error('Error message', 'Error stack trace');
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'error',
        'Error message',
        expect.objectContaining({ 
          context: 'TestContext',
          trace: 'Error stack trace'
        })
      );
    });
    
    it('should log at fatal level', () => {
      loggerService.fatal('Fatal message', 'Fatal stack trace');
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'fatal',
        'Fatal message',
        expect.objectContaining({ 
          context: 'TestContext',
          trace: 'Fatal stack trace'
        })
      );
    });
    
    it('should log with metadata', () => {
      const metadata = {
        userId: 'test-user',
        requestId: 'test-request',
        method: 'testMethod',
        path: '/api/test',
        statusCode: 200,
        duration: 123,
      };
      
      loggerService.info('Message with metadata', metadata);
      
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'info',
        'Message with metadata',
        expect.objectContaining({
          context: 'TestContext',
          ...metadata,
        })
      );
    });
  });
  
  describe('context and correlation ID', () => {
    it('should set and use context', () => {
      loggerService.setContext('CustomContext');
      loggerService.info('Message with custom context');
      
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'info',
        'Message with custom context',
        expect.objectContaining({ context: 'CustomContext' })
      );
    });
    
    it('should set and use correlation ID', () => {
      const correlationId = 'test-correlation-id';
      loggerService.setCorrelationId(correlationId);
      loggerService.info('Message with correlation ID');
      
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'info',
        'Message with correlation ID',
        expect.objectContaining({ correlationId })
      );
    });
    
    it('should get correlation ID from CLS if available', () => {
      const correlationId = 'cls-correlation-id';
      mockClsService.get.mockReturnValueOnce(correlationId);
      
      const result = loggerService.getCorrelationId();
      expect(result).toBe(correlationId);
      expect(mockClsService.get).toHaveBeenCalledWith('correlationId');
    });
    
    it('should fall back to instance correlation ID if CLS is empty', () => {
      const correlationId = 'instance-correlation-id';
      mockClsService.get.mockReturnValueOnce(null);
      
      loggerService.setCorrelationId(correlationId);
      const result = loggerService.getCorrelationId();
      
      expect(result).toBe(correlationId);
    });
    
    it('should generate new correlation ID if none is available', () => {
      mockClsService.get.mockReturnValueOnce(null);
      
      const result = loggerService.getCorrelationId();
      
      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });
  });
  
  describe('child loggers', () => {
    it('should create a child logger with extended context', () => {
      // Set parent context and correlation ID
      loggerService.setContext('ParentContext');
      loggerService.setCorrelationId('parent-correlation-id');
      
      // Create child logger
      const childLogger = loggerService.createChildLogger('ChildContext');
      
      // Child should be a logger instance
      expect(childLogger).toBeInstanceOf(MCPLoggerService);
      
      // Log with child logger
      childLogger.info('Child logger message');
      
      // Should log with extended context
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'info',
        'Child logger message',
        expect.objectContaining({ 
          context: 'ParentContext:ChildContext',
          correlationId: 'parent-correlation-id'
        })
      );
    });
  });
  
  describe('method tracking', () => {
    it('should track method execution', () => {
      // Start tracking method
      const methodName = 'testMethod';
      const tracker = loggerService.trackMethod(methodName);
      
      // Should log method entry
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'debug',
        `${methodName} started`,
        expect.any(Object)
      );
      
      // End tracking with result
      const result = { success: true };
      tracker.end(result);
      
      // Should log method completion
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'debug',
        `${methodName} completed`,
        expect.objectContaining({
          method: methodName,
          duration: expect.any(Number),
        })
      );
    });
    
    it('should track method errors', () => {
      // Start tracking method
      const methodName = 'testErrorMethod';
      const tracker = loggerService.trackMethod(methodName);
      
      // Should log method entry
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'debug',
        `${methodName} started`,
        expect.any(Object)
      );
      
      // Create error
      const error = new Error('Test error');
      
      // Track error should throw
      expect(() => tracker.error(error)).toThrow(error);
      
      // Should log error
      expect(winston.createLogger().log).toHaveBeenCalledWith(
        'error',
        expect.stringContaining(methodName),
        expect.objectContaining({
          method: methodName,
          error: expect.objectContaining({
            message: 'Test error',
            name: 'Error',
          }),
        })
      );
    });
  });
  
  describe('result sanitization', () => {
    it('should sanitize sensitive data in results', () => {
      // Create object with sensitive data
      const sensitiveData = {
        username: 'testuser',
        password: 'secret',
        token: 'abc123',
        nested: {
          key: 'value',
          secret: 'hidden',
          auth: 'sensitive'
        }
      };
      
      // Use with method tracker
      const tracker = loggerService.trackMethod('testMethod');
      tracker.end(sensitiveData);
      
      // Get the call arguments
      const calls = winston.createLogger().log.mock.calls;
      const lastCall = calls[calls.length - 1];
      const metadata = lastCall[2];
      
      // Check sanitization
      expect(metadata.result.password).toBe('[REDACTED]');
      expect(metadata.result.token).toBe('[REDACTED]');
      expect(metadata.result.nested.secret).toBe('[REDACTED]');
      expect(metadata.result.nested.auth).toBe('[REDACTED]');
      
      // Non-sensitive data should remain
      expect(metadata.result.username).toBe('testuser');
      expect(metadata.result.nested.key).toBe('value');
    });
  });
});
