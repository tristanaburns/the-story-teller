/**
 * Logging alerting module index file
 * 
 * Provides alerting functionality based on log patterns and performance issues
 */

export {
  default as alertManager,
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
  initializeAlertManager,
  AlertSeverity,
  AlertType,
  AlertChannel,
  type Alert,
  type AlertRule,
  type ErrorPatternAlertConditions,
  type PerformanceAlertConditions,
  type SystemHealthAlertConditions,
  type AlertManagerConfig
} from './alertManager';
