/**
 * Log Rotation Module
 * 
 * Provides log rotation functionality to manage log file growth
 * and implement retention policies.
 */

import { createLogger } from '../logger';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { createReadStream, createWriteStream } from 'fs';

// Create a logger for the rotation module
const logger = createLogger('LogRotation');

/**
 * Log rotation configuration
 */
export interface RotationConfig {
  enabled: boolean;
  logDirectory: string;
  maxSize: number;               // Maximum file size in bytes before rotation
  maxFiles: number;              // Maximum number of files to keep
  compress: boolean;             // Whether to compress rotated logs
  datePattern: string;           // Date pattern for rotated files
  fileExtension: string;         // File extension for log files
  compressExtension: string;     // File extension for compressed files
  intervalCheck: number;         // Interval to check for rotation in milliseconds
}

/**
 * Default rotation configuration
 */
const DEFAULT_CONFIG: RotationConfig = {
  enabled: true,
  logDirectory: 'logs',
  maxSize: 10 * 1024 * 1024,     // 10 MB
  maxFiles: 30,                  // Keep 30 files
  compress: true,                // Compress rotated logs
  datePattern: 'YYYY-MM-DD',     // Date pattern for rotated files
  fileExtension: '.log',         // Log file extension
  compressExtension: '.gz',      // GZip extension for compressed files
  intervalCheck: 5 * 60 * 1000   // Check every 5 minutes
};

/**
 * Current rotation configuration
 */
let currentConfig: RotationConfig = { ...DEFAULT_CONFIG };

/**
 * Timer for scheduled rotation checks
 */
let rotationTimer: NodeJS.Timeout | null = null;

/**
 * Configure log rotation
 */
export function configureRotation(config: Partial<RotationConfig>): void {
  // Update configuration
  currentConfig = {
    ...currentConfig,
    ...config
  };
  
  logger.info('Log rotation configured', { config: currentConfig });
  
  // Create log directory if it doesn't exist
  if (!fs.existsSync(currentConfig.logDirectory)) {
    fs.mkdirSync(currentConfig.logDirectory, { recursive: true });
    logger.info(`Created log directory: ${currentConfig.logDirectory}`);
  }
  
  // Restart the timer if it's already running
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
  
  // Start the timer if rotation is enabled
  if (currentConfig.enabled) {
    scheduleRotationChecks();
  }
}

/**
 * Format date for rotation file names
 */
function formatDate(date: Date, pattern: string): string {
  const year = date.getFullYear().toString();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  
  return pattern
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * Get all log files in the log directory
 */
function getLogFiles(): string[] {
  try {
    // Get all files in the log directory
    const files = fs.readdirSync(currentConfig.logDirectory);
    
    // Filter to only include log files
    return files
      .filter(file => 
        file.endsWith(currentConfig.fileExtension) || 
        (currentConfig.compress && file.endsWith(currentConfig.compressExtension))
      )
      .map(file => path.join(currentConfig.logDirectory, file));
  } catch (error) {
    logger.error('Failed to list log files', { error });
    return [];
  }
}

/**
 * Compress a log file
 */
async function compressFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const compressedPath = `${filePath}${currentConfig.compressExtension}`;
    
    const readStream = createReadStream(filePath);
    const writeStream = createWriteStream(compressedPath);
    const gzip = zlib.createGzip();
    
    // Pipe the file through gzip compression
    readStream
      .pipe(gzip)
      .pipe(writeStream)
      .on('finish', () => {
        // Delete the original file after compression
        fs.unlink(filePath, (err) => {
          if (err) {
            logger.warn(`Failed to delete original file after compression: ${filePath}`, { error: err });
          }
          resolve(compressedPath);
        });
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}

/**
 * Delete old log files based on retention policy
 */
function applyRetentionPolicy(): Promise<void> {
  return new Promise((resolve) => {
    try {
      // Get all log files
      const files = getLogFiles();
      
      // If we're under the limit, no need to delete anything
      if (files.length <= currentConfig.maxFiles) {
        resolve();
        return;
      }
      
      // Sort files by modification time (oldest first)
      const sortedFiles = files.sort((a, b) => {
        const statA = fs.statSync(a);
        const statB = fs.statSync(b);
        return statA.mtime.getTime() - statB.mtime.getTime();
      });
      
      // Delete oldest files if we have too many
      const filesToDelete = sortedFiles.slice(0, sortedFiles.length - currentConfig.maxFiles);
      
      for (const file of filesToDelete) {
        try {
          fs.unlinkSync(file);
          logger.info(`Deleted old log file: ${file}`);
        } catch (error) {
          logger.warn(`Failed to delete old log file: ${file}`, { error });
        }
      }
      
      resolve();
    } catch (error) {
      logger.error('Failed to apply retention policy', { error });
      resolve();
    }
  });
}

/**
 * Rotate a specific log file
 */
export async function rotateFile(filePath: string): Promise<string | null> {
  try {
    // Check if the file exists and is over the size limit
    const stats = fs.statSync(filePath);
    
    if (stats.size < currentConfig.maxSize) {
      return null; // No rotation needed
    }
    
    logger.info(`Rotating log file: ${filePath}`, { size: stats.size });
    
    // Generate a new file name with timestamp
    const date = new Date();
    const timestamp = formatDate(date, currentConfig.datePattern);
    const extension = path.extname(filePath);
    const basename = path.basename(filePath, extension);
    const directory = path.dirname(filePath);
    
    const rotatedFile = path.join(
      directory, 
      `${basename}.${timestamp}${extension}`
    );
    
    // Rename the current file to the rotated file
    fs.renameSync(filePath, rotatedFile);
    
    // Create a new empty file with the original name
    fs.writeFileSync(filePath, '');
    
    // Compress the rotated file if enabled
    if (currentConfig.compress) {
      try {
        const compressedFile = await compressFile(rotatedFile);
        logger.info(`Compressed rotated log file: ${rotatedFile} -> ${compressedFile}`);
        
        // Return the compressed file path
        return compressedFile;
      } catch (error) {
        logger.error(`Failed to compress rotated log file: ${rotatedFile}`, { error });
        return rotatedFile;
      }
    }
    
    return rotatedFile;
  } catch (error) {
    logger.error(`Failed to rotate log file: ${filePath}`, { error });
    return null;
  }
}

/**
 * Check all log files for rotation
 */
export async function checkRotation(): Promise<void> {
  if (!currentConfig.enabled) {
    return;
  }
  
  logger.debug('Checking log files for rotation');
  
  try {
    // Get all log files in the directory that are not compressed
    const files = getLogFiles().filter(file => !file.endsWith(currentConfig.compressExtension));
    
    // Check each file for rotation
    for (const file of files) {
      await rotateFile(file);
    }
    
    // Apply retention policy
    await applyRetentionPolicy();
    
    logger.debug('Log rotation check completed');
  } catch (error) {
    logger.error('Error during log rotation check', { error });
  }
}

/**
 * Schedule regular rotation checks
 */
function scheduleRotationChecks(): void {
  if (rotationTimer) {
    clearInterval(rotationTimer);
  }
  
  rotationTimer = setInterval(() => {
    checkRotation().catch(error => {
      logger.error('Error in scheduled rotation check', { error });
    });
  }, currentConfig.intervalCheck);
  
  logger.info(`Scheduled log rotation checks every ${currentConfig.intervalCheck / 1000} seconds`);
}

/**
 * Start the log rotation system
 */
export function startRotation(): void {
  if (!currentConfig.enabled) {
    logger.info('Log rotation is disabled');
    return;
  }
  
  // Create log directory if it doesn't exist
  if (!fs.existsSync(currentConfig.logDirectory)) {
    fs.mkdirSync(currentConfig.logDirectory, { recursive: true });
    logger.info(`Created log directory: ${currentConfig.logDirectory}`);
  }
  
  // Schedule rotation checks
  scheduleRotationChecks();
  
  // Do an initial rotation check
  checkRotation().catch(error => {
    logger.error('Error in initial rotation check', { error });
  });
  
  logger.info('Log rotation system started');
}

/**
 * Stop the log rotation system
 */
export function stopRotation(): void {
  if (rotationTimer) {
    clearInterval(rotationTimer);
    rotationTimer = null;
  }
  
  logger.info('Log rotation system stopped');
}

/**
 * Export the log rotation functionality
 */
export default {
  configureRotation,
  rotateFile,
  checkRotation,
  startRotation,
  stopRotation
};
