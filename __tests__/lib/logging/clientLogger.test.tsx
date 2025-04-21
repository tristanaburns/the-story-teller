/**
 * Tests for the client-side logging system
 * 
 * @jest-environment jsdom
 */

import { ClientLogger, createClientLogger } from '../../../lib/logging/client/clientLogger';
import { LoggerProvider, useLogger } from '../../../lib/logging/client/useLogger';
import { render, screen, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import React from 'react';

// Mock fetch for API calls
global.fetch = jest.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ status: 'success' }),
  })
);

// Mock local storage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock session storage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  jest.spyOn(console, 'log').mockImplementation();
  jest.spyOn(console, 'error').mockImplementation();
  jest.spyOn(console, 'warn').mockImplementation();
  jest.spyOn(console, 'info').mockImplementation();
  jest.spyOn(console, 'debug').mockImplementation();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
});

describe('ClientLogger', () => {
  describe('createClientLogger', () => {
    it('should create a client logger with the specified component', () => {
      const logger = createClientLogger('TestComponent');
      expect(logger).toBeInstanceOf(ClientLogger);
    });
  });
  
  describe('logging methods', () => {
    let logger: ClientLogger;
    
    beforeEach(() => {
      logger = createClientLogger('TestComponent');
      
      // Clear the log queue before each test
      (logger as any).queue = [];
    });
    
    it('should log at trace level', () => {
      logger.trace('Trace message');
      expect(console.debug).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
    });
    
    it('should log at debug level', () => {
      logger.debug('Debug message');
      expect(console.debug).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
    });
    
    it('should log at info level', () => {
      logger.info('Info message');
      expect(console.info).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
    });
    
    it('should log at warn level', () => {
      logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
    });
    
    it('should log at error level', () => {
      logger.error('Error message');
      expect(console.error).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
    });
    
    it('should log at fatal level', () => {
      logger.fatal('Fatal message');
      expect(console.error).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
    });
    
    it('should log with data object', () => {
      const data = { foo: 'bar', sensitive: 'secret' };
      logger.info('Message with data', data);
      
      expect(console.info).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
      
      const logEntry = (logger as any).queue[0];
      expect(logEntry.data).toBeDefined();
    });
    
    it('should log with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      
      expect(console.error).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
      
      const logEntry = (logger as any).queue[0];
      expect(logEntry.data).toBeDefined();
      expect(logEntry.data.message).toBe('Test error');
    });
    
    it('should sanitize sensitive data', () => {
      const data = { 
        username: 'testuser',
        password: 'secret',
        token: 'abc123',
        nested: { key: 'value', secret: 'hidden' }
      };
      
      logger.info('Message with sensitive data', data);
      
      expect(console.info).toHaveBeenCalled();
      expect((logger as any).queue.length).toBe(1);
      
      const logEntry = (logger as any).queue[0];
      expect(logEntry.data.password).toBe('[REDACTED]');
      expect(logEntry.data.token).toBe('[REDACTED]');
      expect(logEntry.data.nested.secret).toBe('[REDACTED]');
      expect(logEntry.data.username).toBe('testuser');
      expect(logEntry.data.nested.key).toBe('value');
    });
  });
  
  describe('flush', () => {
    let logger: ClientLogger;
    
    beforeEach(() => {
      logger = createClientLogger('TestComponent');
      
      // Clear the log queue
      (logger as any).queue = [];
      
      // Reset mocks
      (fetch as jest.Mock).mockClear();
      localStorageMock.setItem.mockClear();
    });
    
    it('should send logs to server', async () => {
      // Add logs to queue
      logger.info('Test log 1');
      logger.info('Test log 2');
      
      // Flush logs
      await logger.flush();
      
      // Should have called fetch
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Queue should be empty
      expect((logger as any).queue.length).toBe(0);
    });
    
    it('should not send logs if queue is empty', async () => {
      // Flush with empty queue
      await logger.flush();
      
      // Should not have called fetch
      expect(fetch).not.toHaveBeenCalled();
    });
    
    it('should handle fetch errors', async () => {
      // Mock fetch to throw error
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      
      // Add log to queue
      logger.info('Test log');
      
      // Flush logs
      await logger.flush();
      
      // Should have called fetch
      expect(fetch).toHaveBeenCalledTimes(1);
      
      // Queue should still have logs
      expect((logger as any).queue.length).toBe(1);
      
      // Should have logged error
      expect(console.error).toHaveBeenCalled();
    });
  });
  
  describe('child loggers', () => {
    let logger: ClientLogger;
    
    beforeEach(() => {
      logger = createClientLogger('TestComponent');
    });
    
    it('should create a child logger with extended context', () => {
      const childLogger = logger.createChildLogger('ChildComponent');
      
      expect(childLogger).toBeInstanceOf(ClientLogger);
      
      // Log with child logger
      childLogger.info('Child logger message');
      
      // Should log with extended context
      expect((childLogger as any).component).toBe('TestComponent:ChildComponent');
    });
    
    it('should inherit user ID from parent logger', () => {
      // Set user ID on parent
      logger.setUserId('test-user-id');
      
      // Create child logger
      const childLogger = logger.createChildLogger('ChildComponent');
      
      // Child should inherit user ID
      expect((childLogger as any).userId).toBe('test-user-id');
    });
    
    it('should inherit correlation ID from parent logger', () => {
      // Set correlation ID on parent
      logger.setCorrelationId('test-correlation-id');
      
      // Create child logger
      const childLogger = logger.createChildLogger('ChildComponent');
      
      // Child should inherit correlation ID
      expect((childLogger as any).correlationId).toBe('test-correlation-id');
    });
  });
  
  describe('session ID', () => {
    beforeEach(() => {
      sessionStorageMock.getItem.mockClear();
      sessionStorageMock.setItem.mockClear();
    });
    
    it('should generate and store session ID', () => {
      // Mock sessionStorage.getItem to return null
      sessionStorageMock.getItem.mockReturnValueOnce(null);
      
      // Create logger
      const logger = createClientLogger('TestComponent');
      
      // Should have called sessionStorage.getItem
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('the-story-teller-session-id');
      
      // Should have called sessionStorage.setItem with a generated ID
      expect(sessionStorageMock.setItem).toHaveBeenCalled();
      
      // Session ID should be set
      expect((logger as any).sessionId).toBeDefined();
    });
    
    it('should reuse existing session ID', () => {
      // Mock sessionStorage.getItem to return a session ID
      const existingSessionId = 'existing-session-id';
      sessionStorageMock.getItem.mockReturnValueOnce(existingSessionId);
      
      // Create logger
      const logger = createClientLogger('TestComponent');
      
      // Should have called sessionStorage.getItem
      expect(sessionStorageMock.getItem).toHaveBeenCalledWith('the-story-teller-session-id');
      
      // Should not have called sessionStorage.setItem
      expect(sessionStorageMock.setItem).not.toHaveBeenCalled();
      
      // Session ID should be set to existing ID
      expect((logger as any).sessionId).toBe(existingSessionId);
    });
  });
  
  describe('local storage', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockClear();
      localStorageMock.setItem.mockClear();
    });
    
    it('should save logs to local storage', () => {
      const logger = createClientLogger('TestComponent');
      
      // Add log to queue
      logger.info('Test log');
      
      // Call private method to save to local storage
      (logger as any).saveToLocalStorage();
      
      // Should have called localStorage.setItem
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
    
    it('should restore logs from local storage', () => {
      // Mock localStorage.getItem to return logs
      const logs = [
        {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: 'Stored log',
          component: 'TestComponent'
        }
      ];
      
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(logs));
      
      // Create logger
      const logger = createClientLogger('TestComponent');
      
      // Should have called localStorage.getItem
      expect(localStorageMock.getItem).toHaveBeenCalledWith('the-story-teller-logs');
      
      // Should have called localStorage.removeItem
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('the-story-teller-logs');
      
      // Queue should have restored logs
      expect((logger as any).queue.length).toBe(1);
    });
  });
});

describe('LoggerProvider and useLogger', () => {
  // Test component using useLogger
  const TestComponent = () => {
    const logger = useLogger('TestHook');
    
    // Log on mount
    React.useEffect(() => {
      logger.info('Component mounted');
    }, [logger]);
    
    return <div>Test Component</div>;
  };
  
  it('should provide logger through context', () => {
    // Spy on console.info
    jest.spyOn(console, 'info');
    
    // Render component with LoggerProvider
    render(
      <LoggerProvider>
        <TestComponent />
      </LoggerProvider>
    );
    
    // Should have logged
    expect(console.info).toHaveBeenCalled();
  });
  
  it('should create standalone logger when used outside provider', () => {
    // Spy on console.warn and console.info
    jest.spyOn(console, 'warn');
    jest.spyOn(console, 'info');
    
    // Render component without LoggerProvider
    render(<TestComponent />);
    
    // Should have warned about missing provider
    expect(console.warn).toHaveBeenCalled();
    
    // Should still have logged
    expect(console.info).toHaveBeenCalled();
  });
  
  it('should provide logger with configured options', () => {
    // Render hook with LoggerProvider
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <LoggerProvider
        config={{ minLevel: 0 }}  // TRACE level
        initialUserId="test-user"
        initialCorrelationId="test-correlation"
        component="TestApp"
      >
        {children}
      </LoggerProvider>
    );
    
    const { result } = renderHook(() => useLogger('TestHook'), { wrapper });
    
    // Logger should be returned
    expect(result.current).toBeInstanceOf(ClientLogger);
    
    // Logger should have user ID set
    expect((result.current as any).userId).toBe('test-user');
    
    // Logger should have correlation ID set
    expect((result.current as any).correlationId).toBe('test-correlation');
    
    // Log at trace level
    act(() => {
      result.current.trace('Trace message');
    });
    
    // Should log at trace level
    expect(console.debug).toHaveBeenCalled();
  });
});
