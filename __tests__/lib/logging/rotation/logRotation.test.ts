/**
 * Tests for the log rotation system
 * This file contains tests for the log rotation functionality including:
 * - Size-based rotation
 * - Automatic compression of rotated logs
 * - Customizable file naming
 * - Retention policy
 * - Scheduled rotation
 */

import { jest } from '@jest/globals';
import { LogRotation } from '@/lib/logging/rotation/logRotation';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

// Mock fs module
jest.mock('fs', () => ({
  promises: {
    stat: jest.fn(),
    readdir: jest.fn(),
    mkdir: jest.fn().mockResolvedValue(undefined),
    writeFile: jest.fn().mockResolvedValue(undefined),
    rename: jest.fn().mockResolvedValue(undefined),
    unlink: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn(),
  },
  existsSync: jest.fn(),
  createWriteStream: jest.fn(),
  createReadStream: jest.fn(),
}));

// Mock zlib module
jest.mock('zlib', () => ({
  createGzip: jest.fn(() => ({
    on: jest.fn(),
    pipe: jest.fn(() => ({
      on: jest.fn(),
    })),
  })),
}));

describe('LogRotation', () => {
  let logRotation: LogRotation;
  const mockConfig = {
    logDirectory: '/var/log/storyteller',
    logFilename: 'app.log',
    maxSize: 10 * 1024 * 1024, // 10 MB
    maxFiles: 5,
    compressRotatedLogs: true,
    filenamePattern: 'yyyy-MM-dd-HH-mm',
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock existsSync to return true by default
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    
    logRotation = new LogRotation(mockConfig);
  });
  
  describe('Size-based Rotation', () => {
    test('should rotate logs when file size exceeds threshold', async () => {
      // Mock file stats to indicate the file is larger than maxSize
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        size: mockConfig.maxSize + 1024, // Exceed maxSize by 1KB
        isFile: () => true,
      });
      
      // Mock readdir to return empty array (no existing rotated logs)
      (fs.promises.readdir as jest.Mock).mockResolvedValue([]);
      
      // Execute rotation
      await logRotation.checkAndRotate();
      
      // Assert file was renamed and a new log file was created
      expect(fs.promises.rename).toHaveBeenCalled();
      const renameCall = (fs.promises.rename as jest.Mock).mock.calls[0];
      expect(renameCall[0]).toContain('app.log');
      expect(renameCall[1]).toMatch(/app-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.log/);
      
      // Check compression was started
      expect(fs.createReadStream).toHaveBeenCalled();
      expect(zlib.createGzip).toHaveBeenCalled();
    });
    
    test('should not rotate logs when file size is below threshold', async () => {
      // Mock file stats to indicate the file is smaller than maxSize
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        size: mockConfig.maxSize - 1024, // Below maxSize by 1KB
        isFile: () => true,
      });
      
      // Execute rotation
      await logRotation.checkAndRotate();
      
      // Assert no rotation occurred
      expect(fs.promises.rename).not.toHaveBeenCalled();
      expect(fs.createReadStream).not.toHaveBeenCalled();
    });
    
    test('should handle non-existent log file gracefully', async () => {
      // Mock existsSync to indicate the log file doesn't exist
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      
      // Execute rotation
      await logRotation.checkAndRotate();
      
      // Assert directory creation was attempted
      expect(fs.promises.mkdir).toHaveBeenCalledWith(mockConfig.logDirectory, { recursive: true });
      
      // But no rotation occurred
      expect(fs.promises.rename).not.toHaveBeenCalled();
    });
  });
  
  describe('Log Directory Management', () => {
    test('should create log directory if it does not exist', async () => {
      // Mock existsSync to indicate directory doesn't exist
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // Initialize log rotation (which should create directory)
      await logRotation.init();
      
      // Assert
      expect(fs.promises.mkdir).toHaveBeenCalledWith(mockConfig.logDirectory, { recursive: true });
    });
    
    test('should handle directory creation errors gracefully', async () => {
      // Mock existsSync to indicate directory doesn't exist
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      // Mock mkdir to throw error
      (fs.promises.mkdir as jest.Mock).mockRejectedValueOnce(new Error('Permission denied'));
      
      // Initialize log rotation (should catch error)
      await expect(logRotation.init()).rejects.toThrow('Permission denied');
    });
  });
  
  describe('Retention Policy', () => {
    test('should enforce retention policy by removing oldest logs', async () => {
      // Mock a situation where we have more logs than maxFiles
      const oldestLog = 'app-2025-01-01-10-00.log.gz';
      const recentLogs = [
        'app-2025-01-02-10-00.log.gz',
        'app-2025-01-03-10-00.log.gz',
        'app-2025-01-04-10-00.log.gz',
        'app-2025-01-05-10-00.log.gz',
        'app-2025-01-06-10-00.log.gz', // Current maxFiles is 5, so this is one too many
      ];
      
      // Mock readdir to return 6 log files (exceeding maxFiles=5)
      (fs.promises.readdir as jest.Mock).mockResolvedValue([oldestLog, ...recentLogs]);
      
      // Mock fs.stat for each file with timestamps in order
      let mockTime = new Date('2025-01-01T10:00:00').getTime();
      
      // Setup the stats mock to return increasing timestamps
      const statsImpl = jest.fn().mockImplementation((filePath) => {
        const fileIndex = [oldestLog, ...recentLogs].findIndex(f => filePath.includes(f));
        return Promise.resolve({
          mtime: new Date(mockTime + fileIndex * 86400000), // Add 1 day per file
          isFile: () => true,
        });
      });
      
      (fs.promises.stat as jest.Mock).mockImplementation(statsImpl);
      
      // Execute enforceRetention
      await logRotation.enforceRetention();
      
      // Assert oldest file was deleted
      expect(fs.promises.unlink).toHaveBeenCalledWith(path.join(mockConfig.logDirectory, oldestLog));
      
      // And only one file was deleted
      expect(fs.promises.unlink).toHaveBeenCalledTimes(1);
    });
    
    test('should not delete any files when under retention limit', async () => {
      // Mock a situation where we have fewer logs than maxFiles
      const logs = [
        'app-2025-01-02-10-00.log.gz',
        'app-2025-01-03-10-00.log.gz',
        'app-2025-01-04-10-00.log.gz',
      ];
      
      // Mock readdir to return 3 log files (below maxFiles=5)
      (fs.promises.readdir as jest.Mock).mockResolvedValue(logs);
      
      // Execute enforceRetention
      await logRotation.enforceRetention();
      
      // Assert no files were deleted
      expect(fs.promises.unlink).not.toHaveBeenCalled();
    });
  });
  
  describe('File Compression', () => {
    test('should compress rotated log files', async () => {
      // Create a scenario where rotation is needed
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        size: mockConfig.maxSize + 1024,
        isFile: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([]);
      
      // Mock the compression-related functions
      const mockReadStream = {
        pipe: jest.fn().mockReturnValue({
          pipe: jest.fn().mockReturnValue({
            on: jest.fn().mockImplementation((event, callback) => {
              if (event === 'finish') {
                callback();
              }
              return {
                on: jest.fn(),
              };
            }),
          }),
        }),
        on: jest.fn().mockImplementation((event, callback) => {
          return mockReadStream;
        }),
      };
      
      (fs.createReadStream as jest.Mock).mockReturnValue(mockReadStream);
      
      const mockGzip = {
        on: jest.fn().mockImplementation((event, callback) => {
          return mockGzip;
        }),
        pipe: jest.fn().mockReturnValue({
          on: jest.fn().mockImplementation((event, callback) => {
            if (event === 'finish') {
              // Simulate compression finished
              setTimeout(callback, 0);
            }
            return {
              on: jest.fn(),
            };
          }),
        }),
      };
      
      (zlib.createGzip as jest.Mock).mockReturnValue(mockGzip);
      
      // Mock the writeStream
      const mockWriteStream = {
        on: jest.fn().mockImplementation((event, callback) => {
          return mockWriteStream;
        }),
      };
      
      (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);
      
      // Execute rotation with compression
      await logRotation.checkAndRotate();
      
      // Assert compression was initiated
      expect(fs.createReadStream).toHaveBeenCalled();
      expect(zlib.createGzip).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalled();
      
      // Check the original file is deleted after compression
      expect(fs.promises.unlink).toHaveBeenCalled();
      const unlinkCall = (fs.promises.unlink as jest.Mock).mock.calls[0][0];
      expect(unlinkCall).toMatch(/app-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.log$/);
    });
    
    test('should skip compression when disabled in config', async () => {
      // Create log rotation with compression disabled
      logRotation = new LogRotation({
        ...mockConfig,
        compressRotatedLogs: false,
      });
      
      // Create a scenario where rotation is needed
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        size: mockConfig.maxSize + 1024,
        isFile: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([]);
      
      // Execute rotation without compression
      await logRotation.checkAndRotate();
      
      // Assert file was renamed but no compression was started
      expect(fs.promises.rename).toHaveBeenCalled();
      expect(fs.createReadStream).not.toHaveBeenCalled();
      expect(zlib.createGzip).not.toHaveBeenCalled();
    });
  });
  
  describe('Manual Rotation', () => {
    test('should allow manual rotation regardless of file size', async () => {
      // Mock file stats to indicate the file is smaller than maxSize
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        size: mockConfig.maxSize - 1024, // Below threshold
        isFile: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([]);
      
      // Execute manual rotation
      await logRotation.rotate();
      
      // Assert rotation occurred despite file being under size threshold
      expect(fs.promises.rename).toHaveBeenCalled();
    });
  });
  
  describe('Error Handling', () => {
    test('should handle rotation errors gracefully', async () => {
      // Mock stat to throw an error
      (fs.promises.stat as jest.Mock).mockRejectedValue(new Error('File access error'));
      
      // Execute rotation - should not throw
      await expect(logRotation.checkAndRotate()).resolves.not.toThrow();
    });
    
    test('should handle compression errors gracefully', async () => {
      // Setup for rotation
      (fs.promises.stat as jest.Mock).mockResolvedValue({
        size: mockConfig.maxSize + 1024,
        isFile: () => true,
      });
      (fs.promises.readdir as jest.Mock).mockResolvedValue([]);
      
      // Mock createReadStream to throw
      (fs.createReadStream as jest.Mock).mockImplementation(() => {
        throw new Error('Stream error');
      });
      
      // Execute rotation - should not throw despite compression error
      await expect(logRotation.checkAndRotate()).resolves.not.toThrow();
      
      // Rename should still have occurred
      expect(fs.promises.rename).toHaveBeenCalled();
    });
  });
}); 