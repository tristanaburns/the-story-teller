/**
 * Logging rotation module index file
 * 
 * Provides log rotation functionality to manage log file growth
 * and implement retention policies
 */

export {
  default as logRotation,
  configureRotation,
  rotateFile,
  checkRotation,
  startRotation,
  stopRotation,
  type RotationConfig
} from './logRotation';
