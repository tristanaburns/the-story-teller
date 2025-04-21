/**
 * Tests for test-utils.tsx
 * 
 * This file tests the test utility functions to ensure they're working correctly
 * 
 * @jest-environment jsdom
 */

import React from 'react';
import { screen } from '@testing-library/react';
import { MongoClient } from 'mongodb';
import { 
  customRender, 
  mockSession, 
  startMongoMemoryServer,
  stopMongoMemoryServer,
  getMongoClient,
  createTestDatabase,
  clearTestDatabase,
  mockApiResponse,
  waitFor,
  createMockLogger,
  spyOnAllFunctions
} from '../test-utils';

// Mock MongoMemoryServer and MongoClient
jest.mock('mongodb-memory-server', () => ({
  MongoMemoryServer: {
    create: jest.fn().mockResolvedValue({
      getUri: jest.fn().mockReturnValue('mongodb://localhost:27017'),
      stop: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('mongodb', () => {
  const actualMongodb = jest.requireActual('mongodb');
  return {
    ...actualMongodb,
    MongoClient: jest.fn().mockImplementation(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({
          insertMany: jest.fn().mockResolvedValue({ insertedCount: 2 }),
          deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }),
        }),
        collections: jest.fn().mockResolvedValue([
          { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }) },
          { deleteMany: jest.fn().mockResolvedValue({ deletedCount: 3 }) },
        ]),
      }),
    })),
  };
});

describe('Test Utilities', () => {
  // Reset mocks between tests
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('customRender', () => {
    it('should render components with default session', () => {
      // Test component that displays user information from session
      const TestComponent = () => <div data-testid="user-name">{mockSession.user.name}</div>;
      
      // Render with default session
      customRender(<TestComponent />);
      
      // Check that session data is used
      expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    });
    
    it('should render components with custom session', () => {
      // Test component that displays user information from session
      const TestComponent = () => <div data-testid="user-name">{mockSession.user.name}</div>;
      
      // Custom session data
      const customSession = {
        ...mockSession,
        user: {
          ...mockSession.user,
          name: 'Custom User',
        },
      };
      
      // Render with custom session
      customRender(<TestComponent />, { session: customSession });
      
      // Check that custom session data is used
      expect(screen.getByTestId('user-name')).toHaveTextContent('Custom User');
    });
    
    it('should render components with null session', () => {
      // Test component that handles null session
      const TestComponent = () => <div data-testid="user-name">Not signed in</div>;
      
      // Render with null session
      customRender(<TestComponent />, { session: null });
      
      // Check rendering
      expect(screen.getByTestId('user-name')).toBeInTheDocument();
    });
  });
  
  describe('MongoDB utilities', () => {
    it('should start MongoDB memory server', async () => {
      // Start memory server
      const client = await startMongoMemoryServer();
      
      // Check that client is returned
      expect(client).toBeDefined();
      expect(MongoClient).toHaveBeenCalledWith('mongodb://localhost:27017');
      expect(client.connect).toHaveBeenCalled();
    });
    
    it('should stop MongoDB memory server', async () => {
      // Start memory server first
      const client = await startMongoMemoryServer();
      
      // Stop memory server
      await stopMongoMemoryServer();
      
      // Check that client is closed
      expect(client.close).toHaveBeenCalled();
    });
    
    it('should get MongoDB client', async () => {
      // Start memory server first
      await startMongoMemoryServer();
      
      // Get client
      const client = getMongoClient();
      
      // Check that client is returned
      expect(client).toBeDefined();
      
      // Clean up
      await stopMongoMemoryServer();
    });
    
    it('should throw error when getting client before starting server', async () => {
      // Stop server to ensure it's not running
      await stopMongoMemoryServer();
      
      // Getting client should throw error
      expect(() => getMongoClient()).toThrow('MongoDB memory server is not started');
    });
    
    it('should create test database with collections', async () => {
      // Start memory server
      await startMongoMemoryServer();
      
      // Create test database
      const db = await createTestDatabase('test-db', {
        users: [{ name: 'User 1' }, { name: 'User 2' }],
        posts: [{ title: 'Post 1' }, { title: 'Post 2' }],
      });
      
      // Check that collections were created
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(db.collection).toHaveBeenCalledWith('posts');
      expect(db.collection('users').insertMany).toHaveBeenCalledWith([
        { name: 'User 1' },
        { name: 'User 2' },
      ]);
      
      // Clean up
      await stopMongoMemoryServer();
    });
    
    it('should create test database with empty collections', async () => {
      // Start memory server
      await startMongoMemoryServer();
      
      // Create test database with empty collections
      const db = await createTestDatabase('test-db', {
        emptyCollection: [],
      });
      
      // Check that no insertions were made for empty collections
      expect(db.collection('emptyCollection').insertMany).not.toHaveBeenCalled();
      
      // Clean up
      await stopMongoMemoryServer();
    });
    
    it('should clear test database', async () => {
      // Start memory server
      await startMongoMemoryServer();
      
      // Clear test database
      await clearTestDatabase('test-db');
      
      // Check that collections were cleared
      const client = getMongoClient();
      const db = client.db('test-db');
      expect(db.collections).toHaveBeenCalled();
      
      // Each collection should have deleteMany called
      const collections = await db.collections();
      expect(collections[0].deleteMany).toHaveBeenCalledWith({});
      expect(collections[1].deleteMany).toHaveBeenCalledWith({});
      
      // Clean up
      await stopMongoMemoryServer();
    });
  });
  
  describe('Mock API response', () => {
    it('should create successful API response', () => {
      // Create mock response
      const response = mockApiResponse(200, { message: 'Success' });
      
      // Check response
      expect(response.status).toBe(200);
      expect(response.ok).toBe(true);
      
      // Check json method
      return response.json().then(data => {
        expect(data).toEqual({ message: 'Success' });
      });
    });
    
    it('should create error API response', () => {
      // Create mock response
      const response = mockApiResponse(404, { error: 'Not found' });
      
      // Check response
      expect(response.status).toBe(404);
      expect(response.ok).toBe(false);
      
      // Check json method
      return response.json().then(data => {
        expect(data).toEqual({ error: 'Not found' });
      });
    });
    
    it('should provide text method', () => {
      // Create mock response
      const response = mockApiResponse(200, { message: 'Success' });
      
      // Check text method
      return response.text().then(text => {
        expect(text).toBe('{"message":"Success"}');
      });
    });
  });
  
  describe('waitFor utility', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should wait for specified time', async () => {
      // Create a mock function
      const mockFn = jest.fn();
      
      // Start waiting and set up callback
      const promise = waitFor(1000).then(mockFn);
      
      // Verify callback hasn't been called yet
      expect(mockFn).not.toHaveBeenCalled();
      
      // Advance timers
      jest.advanceTimersByTime(1000);
      
      // Wait for promise to resolve
      await promise;
      
      // Verify callback has been called
      expect(mockFn).toHaveBeenCalled();
    });
  });
  
  describe('createMockLogger', () => {
    it('should create mock logger with all methods', () => {
      // Create mock logger
      const logger = createMockLogger();
      
      // Check that all methods exist
      expect(logger.trace).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.fatal).toBeDefined();
      expect(logger.log).toBeDefined();
      expect(logger.setContext).toBeDefined();
      expect(logger.setCorrelationId).toBeDefined();
      expect(logger.getCorrelationId).toBeDefined();
      expect(logger.createChildLogger).toBeDefined();
      expect(logger.trackMethod).toBeDefined();
      
      // Test method behavior
      logger.info('Test message');
      expect(logger.info).toHaveBeenCalledWith('Test message');
      
      // Test setContext returns this
      const result = logger.setContext('TestContext');
      expect(result).toBe(logger);
      
      // Test trackMethod
      const tracker = logger.trackMethod('testMethod');
      expect(tracker.end).toBeDefined();
      expect(tracker.error).toBeDefined();
      
      // Test tracker.end returns result
      const endResult = tracker.end('result');
      expect(endResult).toBe('result');
      
      // Test tracker.error throws
      const testError = new Error('Test error');
      expect(() => tracker.error(testError)).toThrow(testError);
    });
  });
  
  describe('spyOnAllFunctions', () => {
    it('should create spies for all functions in an object', () => {
      // Create test object with methods
      const testObj = {
        method1: () => 'result1',
        method2: (param: string) => `result: ${param}`,
        property: 'value',
      };
      
      // Spy on all functions
      const spiedObj = spyOnAllFunctions(testObj);
      
      // Check that methods are spied on
      expect(jest.isMockFunction(spiedObj.method1)).toBe(true);
      expect(jest.isMockFunction(spiedObj.method2)).toBe(true);
      
      // Check that non-function properties are not affected
      expect(spiedObj.property).toBe('value');
      
      // Use methods
      spiedObj.method1();
      spiedObj.method2('test');
      
      // Check that spies recorded calls
      expect(spiedObj.method1).toHaveBeenCalled();
      expect(spiedObj.method2).toHaveBeenCalledWith('test');
    });
  });
});
