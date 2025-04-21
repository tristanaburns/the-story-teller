/**
 * Tests for the centralized logging system
 * 
 * @jest-environment node
 */

import {
  LogLevel,
  Logger,
  createLogger,
  createLoggerWithCorrelationId,
  configureLogger,
  closeLoggers,
  LogMethod
} from '../../../lib/logging/logger';

// Mock the transports to avoid actual file/MongoDB operations
jest.mock('../../../lib/logging/transports/consoleTransport', () => {
  return {
    ConsoleTransport: jest.fn().mockImplementation(() => {
      return {
        log: jest.fn(),
        close: jest.fn()
      };
    })
  };
});

jest.mock('../../../lib/logging/transports/fileTransport', () => {
  return {
    FileTransport: jest.fn().mockImplementation(() => {
      return {
        log: jest.fn(),
        close: jest.fn(),
        flush: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

jest.mock('../../../lib/logging/transports/mongoTransport', () => {
  return {
    MongoTransport: jest.fn().mockImplementation(() => {
      return {
        log: jest.fn(),
        close: jest.fn(),
        flush: jest.fn().mockResolvedValue(undefined),
        connect: jest.fn().mockResolvedValue(undefined)
      };
    })
  };
});

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  
  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'info').mockImplementation();
    jest.spyOn(console, 'debug').mockImplementation();
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  afterAll(async () => {
    await closeLoggers();
  });
  
  describe('createLogger', () => {
    it('should create a logger with the specified context', () => {
      const logger = createLogger('TestContext');
      expect(logger).toBeInstanceOf(Logger);
    });
  });
  
  describe('createLoggerWithCorrelationId', () => {
    it('should create a logger with the specified correlation ID', () => {
      const correlationId = 'test-correlation-id';
      const logger = createLoggerWithCorrelationId('TestContext', correlationId);
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.getCorrelationId()).toBe(correlationId);
    });
    
    it('should generate a correlation ID if not provided', () => {
      const logger = createLoggerWithCorrelationId('TestContext');
      expect(logger).toBeInstanceOf(Logger);
      expect(logger.getCorrelationId()).toBeDefined();
    });
  });
  
  describe('Logger', () => {
    let logger: Logger;
    
    beforeEach(() => {
      logger = createLogger('TestLogger');
    });
    
    describe('log levels', () => {
      it('should log at trace level', () => {
        logger.trace('Trace message');
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      it('should log at debug level', () => {
        logger.debug('Debug message');
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      it('should log at info level', () => {
        logger.info('Info message');
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      it('should log at warn level', () => {
        logger.warn('Warning message');
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      it('should log at error level', () => {
        logger.error('Error message');
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      it('should log at fatal level', () => {
        logger.fatal('Fatal message');
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      it('should log with Error object', () => {
        const error = new Error('Test error');
        logger.error('Error occurred', error);
        expect(consoleLogSpy).toHaveBeenCalled();
      });
    });
    
    describe('child loggers', () => {
      it('should create a child logger with extended context', () => {
        const childLogger = logger.createChildLogger('ChildContext');
        expect(childLogger).toBeInstanceOf(Logger);
        childLogger.info('Child logger message');
        expect(consoleLogSpy).toHaveBeenCalled();
      });
      
      it('should cache child loggers', () => {
        const childLogger1 = logger.createChildLogger('ChildContext');
        const childLogger2 = logger.createChildLogger('ChildContext');
        expect(childLogger1).toBe(childLogger2);
      });
      
      it('should propagate correlation IDs to child loggers', () => {
        const correlationId = 'parent-correlation-id';
        logger.setCorrelationId(correlationId);
        
        const childLogger = logger.createChildLogger('ChildContext');
        expect(childLogger.getCorrelationId()).toBe(correlationId);
      });
    });
    
    describe('correlation ID', () => {
      it('should set and get correlation ID', () => {
        const correlationId = 'test-correlation-id';
        logger.setCorrelationId(correlationId);
        expect(logger.getCorrelationId()).toBe(correlationId);
      });
    });
    
    describe('method tracking', () => {
      it('should track method execution time', () => {
        const tracker = logger.trackMethod('testMethod');
        const result = tracker.end('result value');
        expect(result).toBe('result value');
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      });
      
      it('should track method errors', () => {
        const tracker = logger.trackMethod('testMethod');
        const error = new Error('Test error');
        
        expect(() => {
          tracker.error(error);
        }).toThrow(error);
        
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      });
    });
    
    describe('context values', () => {
      it('should set and get context values', () => {
        const key = 'testKey';
        const value = 'testValue';
        
        Logger.setContextValue(key, value);
        expect(Logger.getContextValue(key)).toBe(value);
      });
      
      it('should clear context values', () => {
        const key = 'testKey';
        const value = 'testValue';
        
        Logger.setContextValue(key, value);
        Logger.clearContext();
        expect(Logger.getContextValue(key)).toBeUndefined();
      });
    });
    
    describe('withCorrelationId', () => {
      it('should run a function with a correlation ID in the context', () => {
        const correlationId = 'test-correlation-id';
        const result = Logger.withCorrelationId(correlationId, () => {
          return 'test result';
        });
        
        expect(result).toBe('test result');
      });
      
      it('should restore previous correlation ID after execution', () => {
        const originalCorrelationId = 'original-correlation-id';
        const newCorrelationId = 'new-correlation-id';
        
        Logger.setContextValue('correlationId', originalCorrelationId);
        
        Logger.withCorrelationId(newCorrelationId, () => {
          expect(Logger.getContextValue('correlationId')).toBe(newCorrelationId);
        });
        
        expect(Logger.getContextValue('correlationId')).toBe(originalCorrelationId);
      });
    });
  });
  
  describe('LogMethod decorator', () => {
    it('should log method entry and exit', () => {
      class TestClass {
        constructor(public logger: Logger) {}
        
        @LogMethod()
        testMethod(param1: string, param2: number): string {
          return `${param1}-${param2}`;
        }
      }
      
      const logger = createLogger('TestClass');
      const testInstance = new TestClass(logger);
      
      const result = testInstance.testMethod('test', 123);
      
      expect(result).toBe('test-123');
      expect(consoleLogSpy).toHaveBeenCalledTimes(3); // Debug entry, debug args, debug exit
    });
    
    it('should log async method execution', async () => {
      class TestClass {
        constructor(public logger: Logger) {}
        
        @LogMethod()
        async testAsyncMethod(param: string): Promise<string> {
          return Promise.resolve(`async-${param}`);
        }
      }
      
      const logger = createLogger('TestClass');
      const testInstance = new TestClass(logger);
      
      const result = await testInstance.testAsyncMethod('test');
      
      expect(result).toBe('async-test');
      expect(consoleLogSpy).toHaveBeenCalledTimes(3); // Debug entry, debug args, debug exit
    });
    
    it('should log errors in methods', async () => {
      class TestClass {
        constructor(public logger: Logger) {}
        
        @LogMethod()
        testErrorMethod(): void {
          throw new Error('Test error');
        }
      }
      
      const logger = createLogger('TestClass');
      const testInstance = new TestClass(logger);
      
      expect(() => {
        testInstance.testErrorMethod();
      }).toThrow('Test error');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2); // Debug entry, debug args
    });
  });
  
  describe('configureLogger', () => {
    it('should update logger configuration', () => {
      configureLogger({
        minLevel: LogLevel.ERROR,
        includeTimestamp: false
      });
      
      const logger = createLogger('ConfigTest');
      
      // This should not log due to level filtering
      logger.debug('Debug message');
      
      // This should log
      logger.error('Error message');
      
      expect(consoleLogSpy).toHaveBeenCalledTimes(2); // Once for config update, once for error
    });
  });
});
