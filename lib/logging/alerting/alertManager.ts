/**
 * Alert Manager Module
 * 
 * Provides alerting functionality based on log patterns and performance issues
 * Supports multiple alerting channels and customizable alert rules
 */

import { LogEntry } from '../types';
import { createLogger } from '../logger';
import { PerformanceIssue, ErrorPattern, SystemHealthMetrics } from '../analytics/logAnalytics';

// Create a logger for the alerting module
const logger = createLogger('AlertManager');

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Alert types
 */
export enum AlertType {
  ERROR_PATTERN = 'error_pattern',
  PERFORMANCE_ISSUE = 'performance_issue',
  SYSTEM_HEALTH = 'system_health',
  SECURITY = 'security',
  CUSTOM = 'custom'
}

/**
 * Alert notification channel
 */
export enum AlertChannel {
  CONSOLE = 'console',
  EMAIL = 'email',
  SLACK = 'slack',
  WEBHOOK = 'webhook',
  INTERNAL = 'internal'
}

/**
 * Alert object
 */
export interface Alert {
  id: string;                        // Unique ID for the alert
  type: AlertType;                   // Type of alert
  severity: AlertSeverity;           // Severity level
  title: string;                     // Alert title
  message: string;                   // Alert message
  timestamp: Date;                   // When the alert was generated
  source: {                          // Source of the alert
    component?: string;
    path?: string;
    mcpServer?: string;
  };
  context: Record<string, any>;      // Additional context
  affectedUsers?: number;            // Number of affected users (if known)
  correlationIds?: string[];         // Related correlation IDs
  resolvedAt?: Date;                 // When the alert was resolved
  acknowledged?: {                   // Acknowledgment information
    by: string;
    at: Date;
    comment?: string;
  };
}

/**
 * Alert rule configuration
 */
export interface AlertRule {
  id: string;                        // Unique rule ID
  name: string;                      // Human-readable name
  description: string;               // Rule description
  type: AlertType;                   // Type of alert
  enabled: boolean;                  // Whether the rule is enabled
  severity: AlertSeverity;           // Default severity
  conditions: {                      // Trigger conditions (varies by type)
    [key: string]: any;
  };
  throttle?: {                       // Throttling configuration
    maxAlertsPerHour?: number;
    deduplicationWindow?: number;    // In minutes
    escalationAfterCount?: number;   // Escalate after this many alerts
  };
  channels: AlertChannel[];          // Notification channels
  template?: {                       // Alert templates
    title?: string;
    message?: string;
  };
}

/**
 * Error pattern alert rule conditions
 */
export interface ErrorPatternAlertConditions {
  minOccurrences: number;            // Minimum occurrences to trigger
  timeWindowMinutes: number;         // Time window to consider
  errorMessagePatterns?: string[];   // Specific error message patterns to match
  components?: string[];             // Specific components to monitor
  paths?: string[];                  // Specific paths to monitor
  excludePatterns?: string[];        // Patterns to exclude
  minAffectedUsers?: number;         // Minimum number of affected users
}

/**
 * Performance alert rule conditions
 */
export interface PerformanceAlertConditions {
  thresholds: {                      // Performance thresholds
    api?: { [path: string]: number };
    database?: { [operation: string]: number };
    mcp?: { [operation: string]: number };
    rendering?: { [component: string]: number };
  };
  minOccurrences?: number;           // Minimum occurrences to trigger
  timeWindowMinutes?: number;        // Time window to consider
  components?: string[];             // Specific components to monitor
  paths?: string[];                  // Specific paths to monitor
}

/**
 * System health alert rule conditions
 */
export interface SystemHealthAlertConditions {
  errorRateThreshold?: number;        // Error rate threshold (%)
  avgResponseTimeThreshold?: number;  // Average response time threshold (ms)
  p95ResponseTimeThreshold?: number;  // 95th percentile response time threshold (ms)
  requestRateThreshold?: {           // Request rate thresholds
    min?: number;                    // Minimum acceptable requests per minute
    max?: number;                    // Maximum acceptable requests per minute
  };
  timeWindowMinutes?: number;        // Time window to consider
}

/**
 * Alert notification functions type
 */
type AlertNotifier = (alert: Alert) => Promise<boolean>;

/**
 * Alert manager configuration
 */
export interface AlertManagerConfig {
  enabled: boolean;
  defaultChannels: AlertChannel[];
  throttleDefaults: {
    maxAlertsPerHour: number;
    deduplicationWindow: number;  // In minutes
    escalationAfterCount: number;
  };
  emailConfig?: {
    recipients: string[];
    subjectPrefix: string;
  };
  slackConfig?: {
    webhookUrl: string;
    channel: string;
  };
  webhookConfig?: {
    url: string;
    headers?: Record<string, string>;
  };
}

/**
 * Default alert manager configuration
 */
const DEFAULT_CONFIG: AlertManagerConfig = {
  enabled: true,
  defaultChannels: [AlertChannel.CONSOLE, AlertChannel.INTERNAL],
  throttleDefaults: {
    maxAlertsPerHour: 10,
    deduplicationWindow: 15,  // 15 minutes
    escalationAfterCount: 3
  }
};

/**
 * Alert manager state
 */
interface AlertManagerState {
  rules: AlertRule[];
  recentAlerts: Map<string, Alert[]>;  // Map of rule ID to recent alerts
  alertHistory: Alert[];
  notifiers: Map<AlertChannel, AlertNotifier>;
  config: AlertManagerConfig;
}

/**
 * Alert manager state
 */
const state: AlertManagerState = {
  rules: [],
  recentAlerts: new Map(),
  alertHistory: [],
  notifiers: new Map(),
  config: { ...DEFAULT_CONFIG }
};

/**
 * Configure the alert manager
 */
export function configureAlertManager(config: Partial<AlertManagerConfig>): void {
  state.config = {
    ...state.config,
    ...config
  };
  
  logger.info('Alert manager configured', { config: state.config });
}

/**
 * Add a notification channel
 */
export function registerNotifier(channel: AlertChannel, notifier: AlertNotifier): void {
  state.notifiers.set(channel, notifier);
  logger.info(`Registered notifier for channel: ${channel}`);
}

/**
 * Initialize default notifiers
 */
function initializeDefaultNotifiers(): void {
  // Console notifier
  registerNotifier(AlertChannel.CONSOLE, async (alert: Alert) => {
    const severityColors = {
      [AlertSeverity.INFO]: '\x1b[36m',     // Cyan
      [AlertSeverity.WARNING]: '\x1b[33m',  // Yellow
      [AlertSeverity.ERROR]: '\x1b[31m',    // Red
      [AlertSeverity.CRITICAL]: '\x1b[41m', // Red background
    };
    
    const resetColor = '\x1b[0m';
    const color = severityColors[alert.severity] || '';
    
    console.log(`${color}[ALERT] ${alert.severity.toUpperCase()}: ${alert.title}${resetColor}`);
    console.log(`- ${alert.message}`);
    console.log(`- Time: ${alert.timestamp.toISOString()}`);
    console.log(`- Type: ${alert.type}`);
    
    if (alert.correlationIds && alert.correlationIds.length > 0) {
      console.log(`- Correlation IDs: ${alert.correlationIds.join(', ')}`);
    }
    
    if (alert.affectedUsers) {
      console.log(`- Affected Users: ${alert.affectedUsers}`);
    }
    
    console.log(''); // Empty line for separation
    return true;
  });
  
  // Internal notifier (logs alerts to the application log)
  registerNotifier(AlertChannel.INTERNAL, async (alert: Alert) => {
    const severityToLogLevel = {
      [AlertSeverity.INFO]: 'info',
      [AlertSeverity.WARNING]: 'warn',
      [AlertSeverity.ERROR]: 'error',
      [AlertSeverity.CRITICAL]: 'error'
    };
    
    const logLevel = severityToLogLevel[alert.severity] || 'info';
    
    logger[logLevel](`Alert: ${alert.title}`, {
      alert: {
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        timestamp: alert.timestamp,
        correlationIds: alert.correlationIds,
        affectedUsers: alert.affectedUsers,
        source: alert.source
      }
    });
    
    return true;
  });
}

/**
 * Add an alert rule
 */
export function addAlertRule(rule: AlertRule): void {
  // Check if a rule with this ID already exists
  const existingRuleIndex = state.rules.findIndex(r => r.id === rule.id);
  
  if (existingRuleIndex >= 0) {
    // Replace the existing rule
    state.rules[existingRuleIndex] = rule;
    logger.info(`Updated alert rule: ${rule.id}`, { ruleName: rule.name });
  } else {
    // Add the new rule
    state.rules.push(rule);
    logger.info(`Added alert rule: ${rule.id}`, { ruleName: rule.name });
  }
}

/**
 * Remove an alert rule
 */
export function removeAlertRule(ruleId: string): boolean {
  const initialLength = state.rules.length;
  state.rules = state.rules.filter(rule => rule.id !== ruleId);
  
  const removed = state.rules.length < initialLength;
  
  if (removed) {
    logger.info(`Removed alert rule: ${ruleId}`);
  } else {
    logger.warn(`Failed to remove alert rule: ${ruleId} (not found)`);
  }
  
  return removed;
}

/**
 * Check if an alert should be triggered based on throttling rules
 */
function shouldTriggerAlert(rule: AlertRule, alert: Alert): boolean {
  if (!rule.enabled) {
    return false;
  }
  
  // Get recent alerts for this rule
  const ruleAlerts = state.recentAlerts.get(rule.id) || [];
  
  // Apply throttling rules
  const throttle = rule.throttle || state.config.throttleDefaults;
  
  // Check max alerts per hour
  if (throttle.maxAlertsPerHour) {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const alertsLastHour = ruleAlerts.filter(a => a.timestamp >= oneHourAgo);
    
    if (alertsLastHour.length >= throttle.maxAlertsPerHour) {
      logger.debug(`Alert throttled (maxAlertsPerHour): ${rule.id}`, { 
        alert: alert.title, 
        count: alertsLastHour.length 
      });
      return false;
    }
  }
  
  // Check deduplication window
  if (throttle.deduplicationWindow) {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - throttle.deduplicationWindow);
    
    // Look for similar alerts in the deduplication window
    const similarAlerts = ruleAlerts.filter(a => {
      if (a.timestamp < windowStart) {
        return false;
      }
      
      // Check if it's the same type of alert
      if (a.type !== alert.type) {
        return false;
      }
      
      // For error pattern alerts, check for the same error message
      if (a.type === AlertType.ERROR_PATTERN && 
          a.context.pattern === alert.context.pattern) {
        return true;
      }
      
      // For performance alerts, check for the same operation
      if (a.type === AlertType.PERFORMANCE_ISSUE && 
          a.context.operation === alert.context.operation) {
        return true;
      }
      
      // For system health alerts, always consider them similar
      if (a.type === AlertType.SYSTEM_HEALTH) {
        return true;
      }
      
      // For other types, check if they have the same title
      return a.title === alert.title;
    });
    
    if (similarAlerts.length > 0) {
      logger.debug(`Alert deduplicated: ${rule.id}`, { 
        alert: alert.title, 
        similarAlerts: similarAlerts.length 
      });
      return false;
    }
  }
  
  return true;
}

/**
 * Generate a unique ID for an alert
 */
function generateAlertId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Create and send an alert
 */
async function createAlert(
  type: AlertType,
  severity: AlertSeverity,
  title: string,
  message: string,
  rule: AlertRule,
  context: Record<string, any> = {}
): Promise<Alert | null> {
  // Create the alert object
  const alert: Alert = {
    id: generateAlertId(),
    type,
    severity,
    title,
    message,
    timestamp: new Date(),
    source: {
      component: context.component,
      path: context.path,
      mcpServer: context.mcpServer
    },
    context,
    correlationIds: context.correlationIds || [],
    affectedUsers: context.affectedUsers
  };
  
  // Check if we should trigger this alert
  if (!shouldTriggerAlert(rule, alert)) {
    return null;
  }
  
  // Add to recent alerts
  if (!state.recentAlerts.has(rule.id)) {
    state.recentAlerts.set(rule.id, []);
  }
  state.recentAlerts.get(rule.id)!.push(alert);
  
  // Add to history
  state.alertHistory.push(alert);
  
  // Trim history if it gets too large
  if (state.alertHistory.length > 1000) {
    state.alertHistory = state.alertHistory.slice(-1000);
  }
  
  // Send notifications
  const channels = rule.channels.length > 0 
    ? rule.channels 
    : state.config.defaultChannels;
  
  for (const channel of channels) {
    const notifier = state.notifiers.get(channel);
    
    if (notifier) {
      try {
        await notifier(alert);
      } catch (error) {
        logger.error(`Failed to send alert to channel ${channel}`, error);
      }
    }
  }
  
  return alert;
}

/**
 * Process error patterns against alert rules
 */
export async function processErrorPatterns(
  errorPatterns: ErrorPattern[]
): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  // Find applicable rules
  const errorRules = state.rules.filter(rule => 
    rule.enabled && rule.type === AlertType.ERROR_PATTERN
  );
  
  for (const pattern of errorPatterns) {
    for (const rule of errorRules) {
      const conditions = rule.conditions as ErrorPatternAlertConditions;
      
      // Check if pattern matches the rule conditions
      if (pattern.count < (conditions.minOccurrences || 1)) {
        continue;
      }
      
      // Check component filters
      if (conditions.components && conditions.components.length > 0) {
        const patternComponents = pattern.sampleLogs
          .map(log => log.component)
          .filter(Boolean);
        
        if (!patternComponents.some(comp => 
          conditions.components!.some(ruleComp => 
            comp?.includes(ruleComp)
          )
        )) {
          continue;
        }
      }
      
      // Check path filters
      if (conditions.paths && conditions.paths.length > 0) {
        const patternPaths = pattern.sampleLogs
          .map(log => log.path)
          .filter(Boolean);
        
        if (!patternPaths.some(path => 
          conditions.paths!.some(rulePath => 
            path?.includes(rulePath)
          )
        )) {
          continue;
        }
      }
      
      // Check error message patterns
      if (conditions.errorMessagePatterns && conditions.errorMessagePatterns.length > 0) {
        if (!conditions.errorMessagePatterns.some(msgPattern => 
          pattern.pattern.includes(msgPattern)
        )) {
          continue;
        }
      }
      
      // Check exclude patterns
      if (conditions.excludePatterns && conditions.excludePatterns.length > 0) {
        if (conditions.excludePatterns.some(excludePattern => 
          pattern.pattern.includes(excludePattern)
        )) {
          continue;
        }
      }
      
      // Check affected users
      if (conditions.minAffectedUsers && pattern.affectedUsers < conditions.minAffectedUsers) {
        continue;
      }
      
      // Pattern matches all conditions, create an alert
      const title = rule.template?.title || 
                    `Error pattern detected: ${pattern.pattern.substring(0, 50)}`;
      
      const message = rule.template?.message || 
                     `Error pattern occurred ${pattern.count} times between ${pattern.firstOccurrence.toISOString()} and ${pattern.lastOccurrence.toISOString()}. ` + 
                     `Affecting ${pattern.affectedUsers} user(s).`;
      
      const correlationIds = pattern.sampleLogs
        .map(log => log.correlationId)
        .filter(Boolean) as string[];
      
      const alert = await createAlert(
        AlertType.ERROR_PATTERN,
        rule.severity,
        title,
        message,
        rule,
        {
          pattern: pattern.pattern,
          count: pattern.count,
          firstOccurrence: pattern.firstOccurrence,
          lastOccurrence: pattern.lastOccurrence,
          affectedUsers: pattern.affectedUsers,
          correlationIds,
          sampleLogs: pattern.sampleLogs
        }
      );
      
      if (alert) {
        alerts.push(alert);
      }
    }
  }
  
  return alerts;
}

/**
 * Process performance issues against alert rules
 */
export async function processPerformanceIssues(
  issues: PerformanceIssue[]
): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  // Find applicable rules
  const performanceRules = state.rules.filter(rule => 
    rule.enabled && rule.type === AlertType.PERFORMANCE_ISSUE
  );
  
  // Group issues by type and operation
  const issueGroups: Record<string, PerformanceIssue[]> = {};
  
  for (const issue of issues) {
    const key = `${issue.type}:${issue.operation}`;
    
    if (!issueGroups[key]) {
      issueGroups[key] = [];
    }
    
    issueGroups[key].push(issue);
  }
  
  // Process each issue group
  for (const [key, groupIssues] of Object.entries(issueGroups)) {
    for (const rule of performanceRules) {
      const conditions = rule.conditions as PerformanceAlertConditions;
      
      // Check if we have enough occurrences
      if (conditions.minOccurrences && groupIssues.length < conditions.minOccurrences) {
        continue;
      }
      
      // Get the first issue as a representative
      const issue = groupIssues[0];
      
      // Check if the issue type is covered by this rule's thresholds
      const thresholds = conditions.thresholds;
      let matchesThresholds = false;
      
      switch (issue.type) {
        case 'api':
          if (thresholds.api && (
            thresholds.api[issue.operation] !== undefined || 
            thresholds.api.default !== undefined
          )) {
            matchesThresholds = true;
          }
          break;
        case 'database':
          if (thresholds.database && (
            thresholds.database[issue.operation] !== undefined || 
            thresholds.database.default !== undefined
          )) {
            matchesThresholds = true;
          }
          break;
        case 'mcp':
          if (thresholds.mcp && (
            thresholds.mcp[issue.operation] !== undefined || 
            thresholds.mcp.default !== undefined
          )) {
            matchesThresholds = true;
          }
          break;
        case 'rendering':
          if (thresholds.rendering && (
            thresholds.rendering[issue.operation] !== undefined || 
            thresholds.rendering.default !== undefined
          )) {
            matchesThresholds = true;
          }
          break;
      }
      
      if (!matchesThresholds) {
        continue;
      }
      
      // Generate the alert
      const [type, operation] = key.split(':');
      const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
      
      const title = rule.template?.title || 
                    `Performance issue detected: ${typeLabel} operation "${operation}"`;
      
      const avgDuration = Math.round(
        groupIssues.reduce((sum, i) => sum + i.duration, 0) / groupIssues.length
      );
      
      const message = rule.template?.message || 
                     `${groupIssues.length} performance issues detected for ${typeLabel} operation "${operation}". ` + 
                     `Average duration: ${avgDuration}ms (threshold: ${issue.threshold}ms).`;
      
      // Collect correlation IDs
      const correlationIds = groupIssues
        .map(i => i.correlationId)
        .filter(Boolean) as string[];
      
      // Get unique affected users
      const affectedUsers = new Set(
        groupIssues
          .map(i => i.userId)
          .filter(Boolean)
      ).size;
      
      const alert = await createAlert(
        AlertType.PERFORMANCE_ISSUE,
        rule.severity,
        title,
        message,
        rule,
        {
          type: issue.type,
          operation: issue.operation,
          count: groupIssues.length,
          averageDuration: avgDuration,
          threshold: issue.threshold,
          correlationIds,
          affectedUsers
        }
      );
      
      if (alert) {
        alerts.push(alert);
      }
    }
  }
  
  return alerts;
}

/**
 * Process system health metrics against alert rules
 */
export async function processSystemHealth(
  health: SystemHealthMetrics
): Promise<Alert[]> {
  const alerts: Alert[] = [];
  
  // Find applicable rules
  const healthRules = state.rules.filter(rule => 
    rule.enabled && rule.type === AlertType.SYSTEM_HEALTH
  );
  
  for (const rule of healthRules) {
    const conditions = rule.conditions as SystemHealthAlertConditions;
    
    // Check error rate threshold
    if (conditions.errorRateThreshold !== undefined && 
        health.errorRate >= conditions.errorRateThreshold) {
      
      const title = rule.template?.title || 
                    `System health alert: High error rate`;
      
      const message = rule.template?.message || 
                     `System error rate is ${health.errorRate.toFixed(2)}% ` + 
                     `(threshold: ${conditions.errorRateThreshold}%). ` + 
                     `${health.totalErrors} errors out of ${health.totalRequests} requests ` + 
                     `in the last ${health.timeWindowMinutes} minutes.`;
      
      const alert = await createAlert(
        AlertType.SYSTEM_HEALTH,
        rule.severity,
        title,
        message,
        rule,
        {
          metric: 'errorRate',
          value: health.errorRate,
          threshold: conditions.errorRateThreshold,
          timeWindow: health.timeWindowMinutes,
          topErrorPaths: health.topErrorPaths
        }
      );
      
      if (alert) {
        alerts.push(alert);
      }
    }
    
    // Check average response time threshold
    if (conditions.avgResponseTimeThreshold !== undefined && 
        health.averageResponseTime >= conditions.avgResponseTimeThreshold) {
      
      const title = rule.template?.title || 
                    `System health alert: High average response time`;
      
      const message = rule.template?.message || 
                     `System average response time is ${health.averageResponseTime.toFixed(2)}ms ` + 
                     `(threshold: ${conditions.avgResponseTimeThreshold}ms). ` + 
                     `P95 response time: ${health.p95ResponseTime.toFixed(2)}ms. ` + 
                     `Measured over ${health.totalRequests} requests in the last ${health.timeWindowMinutes} minutes.`;
      
      const alert = await createAlert(
        AlertType.SYSTEM_HEALTH,
        rule.severity,
        title,
        message,
        rule,
        {
          metric: 'averageResponseTime',
          value: health.averageResponseTime,
          threshold: conditions.avgResponseTimeThreshold,
          p95: health.p95ResponseTime,
          timeWindow: health.timeWindowMinutes
        }
      );
      
      if (alert) {
        alerts.push(alert);
      }
    }
    
    // Check P95 response time threshold
    if (conditions.p95ResponseTimeThreshold !== undefined && 
        health.p95ResponseTime >= conditions.p95ResponseTimeThreshold) {
      
      const title = rule.template?.title || 
                    `System health alert: High P95 response time`;
      
      const message = rule.template?.message || 
                     `System P95 response time is ${health.p95ResponseTime.toFixed(2)}ms ` + 
                     `(threshold: ${conditions.p95ResponseTimeThreshold}ms). ` + 
                     `Average response time: ${health.averageResponseTime.toFixed(2)}ms. ` + 
                     `Measured over ${health.totalRequests} requests in the last ${health.timeWindowMinutes} minutes.`;
      
      const alert = await createAlert(
        AlertType.SYSTEM_HEALTH,
        rule.severity,
        title,
        message,
        rule,
        {
          metric: 'p95ResponseTime',
          value: health.p95ResponseTime,
          threshold: conditions.p95ResponseTimeThreshold,
          average: health.averageResponseTime,
          timeWindow: health.timeWindowMinutes
        }
      );
      
      if (alert) {
        alerts.push(alert);
      }
    }
    
    // Check request rate thresholds
    if (conditions.requestRateThreshold) {
      // Check minimum request rate
      if (conditions.requestRateThreshold.min !== undefined && 
          health.requestRate < conditions.requestRateThreshold.min) {
        
        const title = rule.template?.title || 
                      `System health alert: Low request rate`;
        
        const message = rule.template?.message || 
                       `System request rate is ${health.requestRate.toFixed(2)} req/min ` + 
                       `(minimum threshold: ${conditions.requestRateThreshold.min} req/min). ` + 
                       `${health.totalRequests} requests in the last ${health.timeWindowMinutes} minutes.`;
        
        const alert = await createAlert(
          AlertType.SYSTEM_HEALTH,
          rule.severity,
          title,
          message,
          rule,
          {
            metric: 'requestRate',
            value: health.requestRate,
            threshold: conditions.requestRateThreshold.min,
            type: 'minimum',
            timeWindow: health.timeWindowMinutes
          }
        );
        
        if (alert) {
          alerts.push(alert);
        }
      }
      
      // Check maximum request rate
      if (conditions.requestRateThreshold.max !== undefined && 
          health.requestRate > conditions.requestRateThreshold.max) {
        
        const title = rule.template?.title || 
                      `System health alert: High request rate`;
        
        const message = rule.template?.message || 
                       `System request rate is ${health.requestRate.toFixed(2)} req/min ` + 
                       `(maximum threshold: ${conditions.requestRateThreshold.max} req/min). ` + 
                       `${health.totalRequests} requests in the last ${health.timeWindowMinutes} minutes.`;
        
        const alert = await createAlert(
          AlertType.SYSTEM_HEALTH,
          rule.severity,
          title,
          message,
          rule,
          {
            metric: 'requestRate',
            value: health.requestRate,
            threshold: conditions.requestRateThreshold.max,
            type: 'maximum',
            timeWindow: health.timeWindowMinutes
          }
        );
        
        if (alert) {
          alerts.push(alert);
        }
      }
    }
  }
  
  return alerts;
}

/**
 * Create a custom alert
 */
export async function createCustomAlert(
  title: string,
  message: string,
  options: {
    severity?: AlertSeverity;
    correlationIds?: string[];
    component?: string;
    path?: string;
    mcpServer?: string;
    context?: Record<string, any>;
  } = {}
): Promise<Alert | null> {
  // Find a custom alert rule
  const customRules = state.rules.filter(rule => 
    rule.enabled && rule.type === AlertType.CUSTOM
  );
  
  if (customRules.length === 0) {
    // Create a default custom rule if none exists
    const defaultRule: AlertRule = {
      id: 'default-custom-alert',
      name: 'Default Custom Alert Rule',
      description: 'Default rule for custom alerts',
      type: AlertType.CUSTOM,
      enabled: true,
      severity: AlertSeverity.INFO,
      conditions: {},
      channels: state.config.defaultChannels
    };
    
    addAlertRule(defaultRule);
    
    // Use the default rule
    return createAlert(
      AlertType.CUSTOM,
      options.severity || defaultRule.severity,
      title,
      message,
      defaultRule,
      {
        correlationIds: options.correlationIds || [],
        component: options.component,
        path: options.path,
        mcpServer: options.mcpServer,
        ...options.context
      }
    );
  } else {
    // Use the first custom rule
    const rule = customRules[0];
    
    return createAlert(
      AlertType.CUSTOM,
      options.severity || rule.severity,
      title,
      message,
      rule,
      {
        correlationIds: options.correlationIds || [],
        component: options.component,
        path: options.path,
        mcpServer: options.mcpServer,
        ...options.context
      }
    );
  }
}

/**
 * Acknowledge an alert
 */
export function acknowledgeAlert(
  alertId: string, 
  userId: string,
  comment?: string
): boolean {
  // Find the alert in history
  const alert = state.alertHistory.find(a => a.id === alertId);
  
  if (!alert) {
    logger.warn(`Failed to acknowledge alert: ${alertId} (not found)`);
    return false;
  }
  
  // Update the alert
  alert.acknowledged = {
    by: userId,
    at: new Date(),
    comment
  };
  
  logger.info(`Alert acknowledged: ${alertId}`, { 
    by: userId, 
    comment 
  });
  
  return true;
}

/**
 * Mark an alert as resolved
 */
export function resolveAlert(alertId: string): boolean {
  // Find the alert in history
  const alert = state.alertHistory.find(a => a.id === alertId);
  
  if (!alert) {
    logger.warn(`Failed to resolve alert: ${alertId} (not found)`);
    return false;
  }
  
  // Update the alert
  alert.resolvedAt = new Date();
  
  logger.info(`Alert resolved: ${alertId}`);
  
  return true;
}

/**
 * Get recent alerts
 */
export function getRecentAlerts(
  options: {
    limit?: number;
    onlyUnresolved?: boolean;
    onlyUnacknowledged?: boolean;
    type?: AlertType;
    severity?: AlertSeverity;
  } = {}
): Alert[] {
  let alerts = [...state.alertHistory];
  
  // Filter by resolved status
  if (options.onlyUnresolved) {
    alerts = alerts.filter(a => !a.resolvedAt);
  }
  
  // Filter by acknowledged status
  if (options.onlyUnacknowledged) {
    alerts = alerts.filter(a => !a.acknowledged);
  }
  
  // Filter by type
  if (options.type) {
    alerts = alerts.filter(a => a.type === options.type);
  }
  
  // Filter by severity
  if (options.severity) {
    alerts = alerts.filter(a => a.severity === options.severity);
  }
  
  // Sort by timestamp (newest first)
  alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  // Apply limit
  if (options.limit && options.limit > 0) {
    alerts = alerts.slice(0, options.limit);
  }
  
  return alerts;
}

/**
 * Initialize the alert manager
 */
export function initializeAlertManager(): void {
  // Initialize default notifiers
  initializeDefaultNotifiers();
  
  // Add some default rules
  addAlertRule({
    id: 'high-error-rate',
    name: 'High Error Rate',
    description: 'Alert when the system error rate exceeds 5%',
    type: AlertType.SYSTEM_HEALTH,
    enabled: true,
    severity: AlertSeverity.WARNING,
    conditions: {
      errorRateThreshold: 5,
      timeWindowMinutes: 5
    },
    channels: [AlertChannel.CONSOLE, AlertChannel.INTERNAL]
  });
  
  addAlertRule({
    id: 'slow-response-time',
    name: 'Slow Response Time',
    description: 'Alert when the system average response time exceeds 1000ms',
    type: AlertType.SYSTEM_HEALTH,
    enabled: true,
    severity: AlertSeverity.WARNING,
    conditions: {
      avgResponseTimeThreshold: 1000,
      timeWindowMinutes: 5
    },
    channels: [AlertChannel.CONSOLE, AlertChannel.INTERNAL]
  });
  
  addAlertRule({
    id: 'repeated-errors',
    name: 'Repeated Errors',
    description: 'Alert when the same error occurs 3 or more times in 15 minutes',
    type: AlertType.ERROR_PATTERN,
    enabled: true,
    severity: AlertSeverity.ERROR,
    conditions: {
      minOccurrences: 3,
      timeWindowMinutes: 15
    },
    channels: [AlertChannel.CONSOLE, AlertChannel.INTERNAL]
  });
  
  addAlertRule({
    id: 'slow-api-endpoints',
    name: 'Slow API Endpoints',
    description: 'Alert when API endpoints are slow',
    type: AlertType.PERFORMANCE_ISSUE,
    enabled: true,
    severity: AlertSeverity.WARNING,
    conditions: {
      thresholds: {
        api: {
          default: 500
        }
      },
      minOccurrences: 3,
      timeWindowMinutes: 10
    },
    channels: [AlertChannel.CONSOLE, AlertChannel.INTERNAL]
  });
  
  logger.info('Alert manager initialized');
}

// Export alert manager functionality
export default {
  configureAlertManager,
  registerNotifier,
  addAlertRule,
  removeAlertRule,
  processErrorPatterns,
  processPerformanceIssues,
  processSystemHealth,
  createCustomAlert,
  acknowledgeAlert,
  resolveAlert,
  getRecentAlerts,
  initializeAlertManager
};
