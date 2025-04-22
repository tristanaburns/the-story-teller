/**
 * Logging analytics module index file
 * 
 * Provides analytics capabilities for log data including performance monitoring,
 * error pattern detection, and system health metrics
 */

export {
  default as logAnalytics,
  detectPerformanceIssues,
  detectErrorPatterns,
  analyzeUserPatterns,
  analyzeRequestFlows,
  calculateSystemHealth,
  configurePerformanceThresholds,
  type PerformanceThresholds,
  type PerformanceIssue,
  type ErrorPatternConfig,
  type ErrorPattern,
  type UsagePattern,
  type RequestFlow,
  type SystemHealthMetrics
} from './logAnalytics';
