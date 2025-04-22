/**
 * Tests for the logging alerting system
 * This file contains tests for the alerting functionality including:
 * - Alert rule evaluation
 * - Alert notifications
 * - Alert throttling and deduplication
 * - Alert severity levels and types
 */

import { jest } from '@jest/globals';
import { AlertManager } from '@/lib/logging/alerting/alertManager';
import { AlertSeverity, AlertType, NotificationChannel } from '@/lib/logging/types';

// Mock nodemailer for email notifications
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  }),
}));

// Mock axios for webhook notifications
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ status: 200 }),
}));

describe('AlertManager', () => {
  let alertManager: AlertManager;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on console methods for notification testing
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    
    alertManager = new AlertManager({
      enabled: true,
      defaultThrottleInterval: 60000, // 1 minute
      channels: [NotificationChannel.CONSOLE],
    });
  });
  
  afterEach(() => {
    // Restore console methods
    jest.restoreAllMocks();
  });
  
  describe('Alert Rule Evaluation', () => {
    test('should evaluate error pattern alert rules', async () => {
      // Setup test data
      const errorPatterns = [
        { message: 'Connection refused', count: 5, component: 'api' },
      ];
      
      // Create rule
      alertManager.addRule({
        name: 'High error rate for connection refused',
        type: AlertType.ERROR_PATTERN,
        severity: AlertSeverity.ERROR,
        condition: (data) => data.count >= 3 && data.message.includes('Connection'),
        throttleInterval: 300000, // 5 minutes
      });
      
      // Mock the evaluateErrorPatterns method to return our test data
      // @ts-ignore - we're intentionally mocking
      alertManager.fetchErrorPatterns = jest.fn().mockResolvedValue(errorPatterns);
      
      // Execute
      await alertManager.evaluateRules();
      
      // Assert
      expect(console.error).toHaveBeenCalled();
      const errorCall = (console.error as jest.Mock).mock.calls[0][0];
      expect(errorCall).toContain('High error rate for connection refused');
      expect(errorCall).toContain('Connection refused');
    });
    
    test('should evaluate performance issue alert rules', async () => {
      // Setup test data
      const performanceIssues = [
        { operation: 'dbQuery', avgDuration: 1500, threshold: 1000 },
      ];
      
      // Create rule
      alertManager.addRule({
        name: 'Slow database queries',
        type: AlertType.PERFORMANCE_ISSUE,
        severity: AlertSeverity.WARNING,
        condition: (data) => data.operation === 'dbQuery' && data.avgDuration > data.threshold,
        throttleInterval: 600000, // 10 minutes
      });
      
      // Mock the fetchPerformanceIssues method
      // @ts-ignore
      alertManager.fetchPerformanceIssues = jest.fn().mockResolvedValue(performanceIssues);
      
      // Execute
      await alertManager.evaluateRules();
      
      // Assert
      expect(console.warn).toHaveBeenCalled();
      const warnCall = (console.warn as jest.Mock).mock.calls[0][0];
      expect(warnCall).toContain('Slow database queries');
      expect(warnCall).toContain('dbQuery');
    });
    
    test('should evaluate system health alert rules', async () => {
      // Setup test data
      const systemHealth = {
        errorRate: 0.15, // 15% error rate
        warningRate: 0.25, // 25% warning rate
        healthScore: 0.6, // 60% health score
      };
      
      // Create rule
      alertManager.addRule({
        name: 'System health degradation',
        type: AlertType.SYSTEM_HEALTH,
        severity: AlertSeverity.CRITICAL,
        condition: (data) => data.errorRate > 0.1 || data.healthScore < 0.7,
        throttleInterval: 900000, // 15 minutes
      });
      
      // Mock the fetchSystemHealth method
      // @ts-ignore
      alertManager.fetchSystemHealth = jest.fn().mockResolvedValue(systemHealth);
      
      // Execute
      await alertManager.evaluateRules();
      
      // Assert
      expect(console.error).toHaveBeenCalled();
      const errorCall = (console.error as jest.Mock).mock.calls[0][0];
      expect(errorCall).toContain('System health degradation');
      expect(errorCall).toContain('errorRate: 0.15');
    });
    
    test('should evaluate custom alert rules', async () => {
      // Setup custom alert data
      const customData = {
        metricName: 'activeUsers',
        value: 0,
        threshold: 10,
      };
      
      // Create custom rule
      alertManager.addRule({
        name: 'No active users',
        type: AlertType.CUSTOM,
        severity: AlertSeverity.INFO,
        condition: (data) => data.value < data.threshold,
        throttleInterval: 1800000, // 30 minutes
      });
      
      // Trigger custom alert
      await alertManager.triggerCustomAlert(customData);
      
      // Assert
      expect(console.info).toHaveBeenCalled();
      const infoCall = (console.info as jest.Mock).mock.calls[0][0];
      expect(infoCall).toContain('No active users');
      expect(infoCall).toContain('activeUsers');
    });
  });
  
  describe('Alert Throttling and Deduplication', () => {
    test('should throttle repeated alerts within throttle interval', async () => {
      // Create rule with short throttle interval for testing
      alertManager.addRule({
        name: 'Test throttled alert',
        type: AlertType.ERROR_PATTERN,
        severity: AlertSeverity.ERROR,
        condition: () => true, // Always trigger
        throttleInterval: 1000, // 1 second
      });
      
      // Mock the fetchErrorPatterns method
      // @ts-ignore
      alertManager.fetchErrorPatterns = jest.fn().mockResolvedValue([{ message: 'Test error', count: 1 }]);
      
      // First evaluation - should trigger alert
      await alertManager.evaluateRules();
      expect(console.error).toHaveBeenCalledTimes(1);
      
      // Reset mock to check second call
      jest.clearAllMocks();
      
      // Second evaluation immediately after - should be throttled
      await alertManager.evaluateRules();
      expect(console.error).not.toHaveBeenCalled();
      
      // Reset mock again
      jest.clearAllMocks();
      
      // Wait for throttle interval to expire
      await new Promise((resolve) => setTimeout(resolve, 1100));
      
      // Third evaluation after delay - should trigger again
      await alertManager.evaluateRules();
      expect(console.error).toHaveBeenCalledTimes(1);
    });
    
    test('should deduplicate identical alerts', async () => {
      // Setup for deduplication testing
      alertManager = new AlertManager({
        enabled: true,
        defaultThrottleInterval: 0, // No throttling by default
        deduplicationEnabled: true,
        channels: [NotificationChannel.CONSOLE],
      });
      
      // Create two identical rules
      alertManager.addRule({
        name: 'Duplicate alert 1',
        type: AlertType.SYSTEM_HEALTH,
        severity: AlertSeverity.WARNING,
        condition: () => true,
      });
      
      alertManager.addRule({
        name: 'Duplicate alert 2',
        type: AlertType.SYSTEM_HEALTH,
        severity: AlertSeverity.WARNING,
        condition: () => true,
      });
      
      // Mock the fetchSystemHealth method
      // @ts-ignore
      alertManager.fetchSystemHealth = jest.fn().mockResolvedValue({ errorRate: 0.05, healthScore: 0.9 });
      
      // Execute
      await alertManager.evaluateRules();
      
      // Assert - only one notification despite two triggered rules
      expect(console.warn).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Notification Channels', () => {
    test('should send email notifications when configured', async () => {
      // Configure for email notifications
      alertManager = new AlertManager({
        enabled: true,
        channels: [NotificationChannel.EMAIL],
        emailConfig: {
          host: 'smtp.example.com',
          port: 587,
          auth: {
            user: 'test@example.com',
            pass: 'password',
          },
          from: 'alerts@storyteller.com',
          to: 'admin@storyteller.com',
        },
      });
      
      // Create rule
      alertManager.addRule({
        name: 'Email test alert',
        type: AlertType.CUSTOM,
        severity: AlertSeverity.ERROR,
        condition: () => true,
      });
      
      // Trigger custom alert
      await alertManager.triggerCustomAlert({ test: true });
      
      // Assert
      const nodemailer = require('nodemailer');
      const sendMail = nodemailer.createTransport().sendMail;
      expect(sendMail).toHaveBeenCalled();
      expect(sendMail.mock.calls[0][0].subject).toContain('Email test alert');
      expect(sendMail.mock.calls[0][0].to).toBe('admin@storyteller.com');
    });
    
    test('should send webhook notifications when configured', async () => {
      // Configure for webhook notifications
      alertManager = new AlertManager({
        enabled: true,
        channels: [NotificationChannel.WEBHOOK],
        webhookConfig: {
          url: 'https://example.com/webhook',
          headers: { 'Content-Type': 'application/json' },
        },
      });
      
      // Create rule
      alertManager.addRule({
        name: 'Webhook test alert',
        type: AlertType.CUSTOM,
        severity: AlertSeverity.WARNING,
        condition: () => true,
      });
      
      // Trigger custom alert
      await alertManager.triggerCustomAlert({ test: true });
      
      // Assert
      const axios = require('axios');
      expect(axios.post).toHaveBeenCalled();
      expect(axios.post.mock.calls[0][0]).toBe('https://example.com/webhook');
      expect(axios.post.mock.calls[0][1].alert).toContain('Webhook test alert');
    });
    
    test('should handle notification failures gracefully', async () => {
      // Configure with a failing webhook
      alertManager = new AlertManager({
        enabled: true,
        channels: [NotificationChannel.WEBHOOK],
        webhookConfig: {
          url: 'https://example.com/failing-webhook',
          headers: { 'Content-Type': 'application/json' },
        },
      });
      
      // Mock axios to fail
      const axios = require('axios');
      axios.post.mockRejectedValue(new Error('Network error'));
      
      // Create rule
      alertManager.addRule({
        name: 'Failed notification test',
        type: AlertType.CUSTOM,
        severity: AlertSeverity.INFO,
        condition: () => true,
      });
      
      // Spy on error handler
      // @ts-ignore
      jest.spyOn(alertManager, 'handleNotificationError');
      
      // Trigger custom alert - should not throw
      await expect(alertManager.triggerCustomAlert({ test: true })).resolves.not.toThrow();
      
      // Assert error handler was called
      // @ts-ignore
      expect(alertManager.handleNotificationError).toHaveBeenCalled();
    });
  });
  
  describe('Alert History and Management', () => {
    test('should store alert history correctly', async () => {
      // Create rule
      alertManager.addRule({
        name: 'History test alert',
        type: AlertType.CUSTOM,
        severity: AlertSeverity.WARNING,
        condition: () => true,
      });
      
      // Trigger custom alert
      await alertManager.triggerCustomAlert({ test: true });
      
      // Get alert history
      const history = alertManager.getAlertHistory();
      
      // Assert
      expect(history).toHaveLength(1);
      expect(history[0].name).toBe('History test alert');
      expect(history[0].severity).toBe(AlertSeverity.WARNING);
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });
    
    test('should limit alert history size', async () => {
      // Configure with small history limit
      alertManager = new AlertManager({
        enabled: true,
        channels: [NotificationChannel.CONSOLE],
        maxHistorySize: 2,
      });
      
      // Create rule
      alertManager.addRule({
        name: 'History limit test',
        type: AlertType.CUSTOM,
        severity: AlertSeverity.INFO,
        condition: () => true,
        throttleInterval: 0,
      });
      
      // Trigger alert multiple times
      await alertManager.triggerCustomAlert({ id: 1 });
      await alertManager.triggerCustomAlert({ id: 2 });
      await alertManager.triggerCustomAlert({ id: 3 });
      
      // Get alert history
      const history = alertManager.getAlertHistory();
      
      // Assert - should only keep last 2 alerts
      expect(history).toHaveLength(2);
      expect(history[0].data.id).toBe(2);
      expect(history[1].data.id).toBe(3);
    });
  });
}); 