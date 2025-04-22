/**
 * Tests for the logging analytics system
 * This file contains tests for the log analytics functionality including:
 * - Performance issue detection
 * - Error pattern detection
 * - User behavior analytics
 * - Request flow analysis
 * - System health metrics calculation
 */

import { jest } from '@jest/globals';
import { LogAnalytics } from '@/lib/logging/analytics/logAnalytics';
import { LogLevel } from '@/lib/logging/types';

// Mock the database client
jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue({
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn(),
        aggregate: jest.fn(),
      }),
    }),
  }),
}));

describe('LogAnalytics', () => {
  let logAnalytics: LogAnalytics;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    logAnalytics = new LogAnalytics();
  });
  
  describe('Performance Issue Detection', () => {
    test('should detect slow operations based on configurable thresholds', async () => {
      // Setup test data
      const mockLogs = [
        { level: LogLevel.INFO, duration: 1500, operation: 'dbQuery', timestamp: new Date() },
        { level: LogLevel.INFO, duration: 200, operation: 'dbQuery', timestamp: new Date() },
        { level: LogLevel.INFO, duration: 2000, operation: 'apiCall', timestamp: new Date() },
      ];
      
      // Mock the find operation
      const mockFind = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockLogs),
      });
      
      // Replace the implementation to use our mock
      const mockCollection = {
        find: mockFind,
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      const mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
      };
      
      // @ts-ignore - we're intentionally mocking
      logAnalytics.getDbClient = jest.fn().mockResolvedValue(mockClient);
      
      // Set thresholds
      const thresholds = {
        dbQuery: 1000,
        apiCall: 1000,
      };
      
      // Execute
      const result = await logAnalytics.detectPerformanceIssues(thresholds);
      
      // Assert
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].operation).toBe('dbQuery');
      expect(result.issues[1].operation).toBe('apiCall');
      expect(mockCollection.find).toHaveBeenCalled();
      expect(mockDb.collection).toHaveBeenCalledWith('logs');
    });
    
    test('should handle empty log collection gracefully', async () => {
      // Mock empty results
      const mockFind = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([]),
      });
      
      const mockCollection = {
        find: mockFind,
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      const mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
      };
      
      // @ts-ignore
      logAnalytics.getDbClient = jest.fn().mockResolvedValue(mockClient);
      
      // Execute
      const result = await logAnalytics.detectPerformanceIssues({});
      
      // Assert
      expect(result.issues).toHaveLength(0);
      expect(result.analysisTime).toBeDefined();
    });
    
    test('should handle database errors during analysis', async () => {
      // Mock database error
      // @ts-ignore
      logAnalytics.getDbClient = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      // Execute and assert
      await expect(logAnalytics.detectPerformanceIssues({})).rejects.toThrow('Database connection failed');
    });
  });
  
  describe('Error Pattern Detection', () => {
    test('should detect recurring error patterns', async () => {
      // Setup test data
      const mockLogs = [
        { level: LogLevel.ERROR, message: 'Connection refused', component: 'api', timestamp: new Date() },
        { level: LogLevel.ERROR, message: 'Connection refused', component: 'api', timestamp: new Date() },
        { level: LogLevel.ERROR, message: 'Invalid input', component: 'validation', timestamp: new Date() },
      ];
      
      // Mock the aggregate operation
      const mockAggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: 'Connection refused', count: 2, component: 'api' },
          { _id: 'Invalid input', count: 1, component: 'validation' },
        ]),
      });
      
      const mockCollection = {
        aggregate: mockAggregate,
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      const mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
      };
      
      // @ts-ignore
      logAnalytics.getDbClient = jest.fn().mockResolvedValue(mockClient);
      
      // Execute
      const result = await logAnalytics.detectErrorPatterns({ minOccurrences: 2 });
      
      // Assert
      expect(result.patterns).toHaveLength(1);
      expect(result.patterns[0].message).toBe('Connection refused');
      expect(result.patterns[0].count).toBe(2);
      expect(mockCollection.aggregate).toHaveBeenCalled();
    });
  });
  
  describe('User Behavior Analytics', () => {
    test('should analyze user behavioral patterns', async () => {
      // Setup test data
      const mockAggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: 'user1', pageViews: 10, avgDuration: 120, lastSeen: new Date() },
          { _id: 'user2', pageViews: 5, avgDuration: 60, lastSeen: new Date() },
        ]),
      });
      
      const mockCollection = {
        aggregate: mockAggregate,
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      const mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
      };
      
      // @ts-ignore
      logAnalytics.getDbClient = jest.fn().mockResolvedValue(mockClient);
      
      // Execute
      const result = await logAnalytics.analyzeUserBehavior();
      
      // Assert
      expect(result.users).toHaveLength(2);
      expect(result.users[0].userId).toBe('user1');
      expect(result.users[0].pageViews).toBe(10);
      expect(mockCollection.aggregate).toHaveBeenCalled();
    });
  });
  
  describe('Request Flow Analysis', () => {
    test('should analyze request flows with correlation IDs', async () => {
      // Setup test data
      const mockFind = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { correlationId: 'corr1', component: 'api', timestamp: new Date(2025, 0, 1, 12, 0, 0) },
          { correlationId: 'corr1', component: 'db', timestamp: new Date(2025, 0, 1, 12, 0, 1) },
          { correlationId: 'corr1', component: 'service', timestamp: new Date(2025, 0, 1, 12, 0, 2) },
        ]),
      });
      
      const mockCollection = {
        find: mockFind,
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      const mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
      };
      
      // @ts-ignore
      logAnalytics.getDbClient = jest.fn().mockResolvedValue(mockClient);
      
      // Execute
      const result = await logAnalytics.analyzeRequestFlow('corr1');
      
      // Assert
      expect(result.flow).toHaveLength(3);
      expect(result.flow[0].component).toBe('api');
      expect(result.flow[1].component).toBe('db');
      expect(result.flow[2].component).toBe('service');
      expect(result.totalDuration).toBeGreaterThan(0);
      expect(mockCollection.find).toHaveBeenCalledWith({ correlationId: 'corr1' });
    });
  });
  
  describe('System Health Metrics', () => {
    test('should calculate system health metrics', async () => {
      // Setup test data
      const mockAggregate = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: 'ERROR', count: 5 },
          { _id: 'WARN', count: 10 },
          { _id: 'INFO', count: 100 },
        ]),
      });
      
      const mockCollection = {
        aggregate: mockAggregate,
      };
      const mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };
      const mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
      };
      
      // @ts-ignore
      logAnalytics.getDbClient = jest.fn().mockResolvedValue(mockClient);
      
      // Execute
      const result = await logAnalytics.calculateSystemHealth();
      
      // Assert
      expect(result.errorRate).toBeDefined();
      expect(result.warningRate).toBeDefined();
      expect(result.healthScore).toBeDefined();
      expect(mockCollection.aggregate).toHaveBeenCalled();
    });
  });
}); 