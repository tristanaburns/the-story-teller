/**
 * Tests for the MCP Logger Method Decorator
 * 
 * @jest-environment node
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClsService } from 'nestjs-cls';
import { MCPLoggerService } from '../../../../mcp-servers/shared/logging/mcp-logger.service';
import { LogMethod, LogClass } from '../../../../mcp-servers/shared/logging/method-logger.decorator';

// Mock logger service
const mockLoggerService = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  fatal: jest.fn(),
  log: jest.fn(),
  setContext: jest.fn().mockReturnThis(),
  setCorrelationId: jest.fn().mockReturnThis(),
  getCorrelationId: jest.fn().mockReturnValue('test-correlation-id'),
  createChildLogger: jest.fn(),
};

// Mock ConfigService
const mockConfigService = {
  get: jest.fn().mockReturnValue('test'),
};

// Mock ClsService
const mockClsService = {
  get: jest.fn(),
  set: jest.fn(),
};

describe('Method Logger Decorator', () => {
  let module: TestingModule;
  
  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create testing module
    module = await Test.createTestingModule({
      providers: [
        { 
          provide: MCPLoggerService, 
          useValue: mockLoggerService 
        },
        { 
          provide: ConfigService, 
          useValue: mockConfigService 
        },
        { 
          provide: ClsService, 
          useValue: mockClsService 
        },
      ],
    }).compile();
  });
  
  describe('LogMethod decorator', () => {
    it('should log synchronous method entry and exit', () => {
      // Create test class with decorated method
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod()
        testMethod(param1: string, param2: number): string {
          return `${param1}-${param2}`;
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method
      const result = service.testMethod('test', 123);
      
      // Method should work as expected
      expect(result).toBe('test-123');
      
      // Should log method entry
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testMethod',
        expect.objectContaining({
          method: 'testMethod',
          parameters: expect.arrayContaining(['test', 123]),
        })
      );
      
      // Should log method exit
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Exit: testMethod',
        expect.objectContaining({
          method: 'testMethod',
          result: 'test-123',
          duration: expect.any(Number),
        })
      );
    });
    
    it('should log asynchronous method execution', async () => {
      // Create test class with decorated async method
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod()
        async testAsyncMethod(param: string): Promise<string> {
          return Promise.resolve(`async-${param}`);
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method
      const result = await service.testAsyncMethod('test');
      
      // Method should work as expected
      expect(result).toBe('async-test');
      
      // Should log method entry
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testAsyncMethod',
        expect.objectContaining({
          method: 'testAsyncMethod',
          parameters: expect.arrayContaining(['test']),
        })
      );
      
      // Should log method exit
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Exit: testAsyncMethod',
        expect.objectContaining({
          method: 'testAsyncMethod',
          result: 'async-test',
          duration: expect.any(Number),
        })
      );
    });
    
    it('should log errors in synchronous methods', () => {
      // Create test class with decorated method that throws
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod()
        testErrorMethod(): void {
          throw new Error('Test error');
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method (should throw)
      expect(() => {
        service.testErrorMethod();
      }).toThrow('Test error');
      
      // Should log method entry
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testErrorMethod',
        expect.objectContaining({
          method: 'testErrorMethod',
        })
      );
      
      // Should log error
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Exception in testErrorMethod',
        expect.any(String),
        expect.objectContaining({
          method: 'testErrorMethod',
          duration: expect.any(Number),
          error: expect.objectContaining({
            message: 'Test error',
            name: 'Error',
          }),
        })
      );
    });
    
    it('should log errors in async methods', async () => {
      // Create test class with decorated async method that throws
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod()
        async testAsyncErrorMethod(): Promise<void> {
          throw new Error('Async test error');
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method (should throw)
      await expect(service.testAsyncErrorMethod()).rejects.toThrow('Async test error');
      
      // Should log method entry
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testAsyncErrorMethod',
        expect.objectContaining({
          method: 'testAsyncErrorMethod',
        })
      );
      
      // Should log error
      expect(mockLoggerService.error).toHaveBeenCalledWith(
        'Exception in testAsyncErrorMethod',
        expect.any(String),
        expect.objectContaining({
          method: 'testAsyncErrorMethod',
          duration: expect.any(Number),
          error: expect.objectContaining({
            message: 'Async test error',
            name: 'Error',
          }),
        })
      );
    });
    
    it('should respect log level option', () => {
      // Create test class with decorated method using custom log level
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod({ level: 'info' })
        testMethodWithLogLevel(): string {
          return 'result';
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method
      service.testMethodWithLogLevel();
      
      // Should log method entry at specified level
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Enter: testMethodWithLogLevel',
        expect.any(Object)
      );
      
      // Should log method exit at specified level
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Exit: testMethodWithLogLevel',
        expect.any(Object)
      );
    });
    
    it('should respect logParameters option', () => {
      // Create test class with decorated method that doesn't log parameters
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod({ logParameters: false })
        testMethodWithoutParamLogging(secret: string): string {
          return `processed-${secret}`;
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method
      service.testMethodWithoutParamLogging('sensitive-data');
      
      // Should log method entry without parameters
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testMethodWithoutParamLogging',
        expect.objectContaining({
          method: 'testMethodWithoutParamLogging',
        })
      );
      
      // Parameters should not be in the log
      const calls = mockLoggerService.debug.mock.calls;
      const entryCall = calls.find(call => 
        call[0] === 'Enter: testMethodWithoutParamLogging'
      );
      
      expect(entryCall[1].parameters).toBeUndefined();
    });
    
    it('should respect logResult option', () => {
      // Create test class with decorated method that doesn't log result
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod({ logResult: false })
        testMethodWithoutResultLogging(): string {
          return 'sensitive-result';
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method
      service.testMethodWithoutResultLogging();
      
      // Should log method exit without result
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Exit: testMethodWithoutResultLogging',
        expect.objectContaining({
          method: 'testMethodWithoutResultLogging',
        })
      );
      
      // Result should not be in the log
      const calls = mockLoggerService.debug.mock.calls;
      const exitCall = calls.find(call => 
        call[0] === 'Exit: testMethodWithoutResultLogging'
      );
      
      expect(exitCall[1].result).toBeUndefined();
    });
    
    it('should sanitize sensitive parameters', () => {
      // Create test class with decorated method that has sensitive parameters
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod({ redactParameters: ['password', 'token'] })
        testMethodWithSensitiveParams(
          username: string, 
          password: string, 
          token: string
        ): string {
          return 'authenticated';
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Call decorated method
      service.testMethodWithSensitiveParams('user', 'secret', 'abc123');
      
      // Should log method entry with sanitized parameters
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testMethodWithSensitiveParams',
        expect.objectContaining({
          method: 'testMethodWithSensitiveParams',
          parameters: expect.arrayContaining(['user', '[REDACTED]', '[REDACTED]']),
        })
      );
    });
    
    it('should handle missing logger gracefully', () => {
      // Create test class without logger
      class TestServiceWithoutLogger {
        @LogMethod()
        testMethod(): string {
          return 'result';
        }
      }
      
      // Create instance
      const service = new TestServiceWithoutLogger();
      
      // Call should not throw
      expect(() => {
        service.testMethod();
      }).not.toThrow();
      
      // Method should return expected result
      expect(service.testMethod()).toBe('result');
    });
  });
  
  describe('LogClass decorator', () => {
    it('should apply logging to all class methods', () => {
      // Create test class with class-level decorator
      @LogClass()
      class TestClassWithLogging {
        logger = mockLoggerService;
        
        method1(): string {
          return 'result1';
        }
        
        method2(param: number): number {
          return param * 2;
        }
        
        async asyncMethod(): Promise<string> {
          return Promise.resolve('async result');
        }
      }
      
      // Create instance
      const service = new TestClassWithLogging();
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Call methods
      service.method1();
      service.method2(5);
      
      // Both methods should be logged
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: method1',
        expect.objectContaining({
          method: 'method1',
        })
      );
      
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: method2',
        expect.objectContaining({
          method: 'method2',
          parameters: expect.arrayContaining([5]),
        })
      );
      
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Exit: method1',
        expect.objectContaining({
          method: 'method1',
          result: 'result1',
        })
      );
      
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Exit: method2',
        expect.objectContaining({
          method: 'method2',
          result: 10,
        })
      );
    });
    
    it('should apply logging with custom options to all methods', () => {
      // Create test class with class-level decorator and custom options
      @LogClass({ level: 'info', logParameters: false })
      class TestClassWithCustomLogging {
        logger = mockLoggerService;
        
        method1(): string {
          return 'result1';
        }
        
        method2(param: number): number {
          return param * 2;
        }
      }
      
      // Create instance
      const service = new TestClassWithCustomLogging();
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Call methods
      service.method1();
      service.method2(5);
      
      // Both methods should be logged with custom options
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Enter: method1',
        expect.objectContaining({
          method: 'method1',
        })
      );
      
      expect(mockLoggerService.info).toHaveBeenCalledWith(
        'Enter: method2',
        expect.objectContaining({
          method: 'method2',
        })
      );
      
      // Parameters should not be logged
      const calls = mockLoggerService.info.mock.calls;
      const method2EntryCall = calls.find(call => 
        call[0] === 'Enter: method2'
      );
      
      expect(method2EntryCall[1].parameters).toBeUndefined();
    });
    
    it('should skip non-method properties', () => {
      // Create test class with non-method properties
      @LogClass()
      class TestClassWithProperties {
        logger = mockLoggerService;
        public stringProp: string = 'string value';
        public numberProp: number = 123;
        
        method(): string {
          return 'method result';
        }
      }
      
      // Create instance
      const service = new TestClassWithProperties();
      
      // Reset mocks
      jest.clearAllMocks();
      
      // Access properties
      const s = service.stringProp;
      const n = service.numberProp;
      
      // Call method
      service.method();
      
      // Only method should be logged
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: method',
        expect.any(Object)
      );
      
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Exit: method',
        expect.any(Object)
      );
      
      // Should have been called exactly twice (entry and exit for method)
      expect(mockLoggerService.debug).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('Sanitization', () => {
    it('should sanitize sensitive data in objects', () => {
      // Create test class with decorated method
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod()
        testMethodWithObject(data: Record<string, any>): Record<string, any> {
          return { ...data, processed: true };
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Data with sensitive fields
      const data = {
        username: 'user',
        password: 'secret',
        token: 'abc123',
        auth: 'sensitive',
        nested: {
          secret: 'hidden',
          key: 'value'
        }
      };
      
      // Call method
      service.testMethodWithObject(data);
      
      // Should log method entry with sanitized data
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testMethodWithObject',
        expect.objectContaining({
          method: 'testMethodWithObject',
          parameters: expect.arrayContaining([
            expect.objectContaining({
              username: 'user',
              password: '[REDACTED]',
              token: '[REDACTED]',
              auth: '[REDACTED]',
              nested: expect.objectContaining({
                secret: '[REDACTED]',
                key: 'value'
              })
            })
          ]),
        })
      );
    });
    
    it('should handle complex objects with functions and arrays', () => {
      // Create test class with decorated method
      class TestService {
        logger = mockLoggerService;
        
        @LogMethod()
        testMethodWithComplexObject(data: Record<string, any>): void {
          // Do nothing
        }
      }
      
      // Create instance
      const service = new TestService();
      
      // Complex data with functions and arrays
      const data = {
        functionProp: () => 'function result',
        arrayProp: [1, 2, { nested: 'value', password: 'secret' }],
        nullProp: null,
        undefinedProp: undefined,
        dateProp: new Date(),
        password: 'secret'
      };
      
      // Call method
      service.testMethodWithComplexObject(data);
      
      // Should log method entry with sanitized data
      expect(mockLoggerService.debug).toHaveBeenCalledWith(
        'Enter: testMethodWithComplexObject',
        expect.objectContaining({
          method: 'testMethodWithComplexObject',
          parameters: expect.arrayContaining([
            expect.objectContaining({
              functionProp: '[Function]',
              arrayProp: expect.arrayContaining([
                1,
                2,
                expect.objectContaining({
                  nested: 'value',
                  password: '[REDACTED]'
                })
              ]),
              nullProp: null,
              dateProp: expect.any(Date),
              password: '[REDACTED]'
            })
          ]),
        })
      );
    });
  });
});
