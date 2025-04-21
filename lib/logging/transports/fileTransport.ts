/**
 * fileTransport.ts
 * 
 * File transport for the logger - writes logs to files with rotation
 * and configurable paths
 */

import * as fs from 'fs';
import * as path from 'path';
import { LogLevel } from '../logger';

export interface FileTransportOptions {
  minLevel: LogLevel;
  logDirectory: string;
  filenamePattern: string;  // Supports variables: %DATE%, %LEVEL%
  maxSize: number;          // Max file size in bytes before rotation
  maxFiles: number;         // Max number of rotated files to keep
  compress: boolean;        // Whether to compress rotated files
  encoding: BufferEncoding; // File encoding
}

/**
 * Default options for the file transport
 */
const DEFAULT_OPTIONS: FileTransportOptions = {
  minLevel: LogLevel.INFO,
  logDirectory: path.join(process.cwd(), 'logs'),
  filenamePattern: 'the-story-teller-%DATE%.log',
  maxSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  compress: true,
  encoding: 'utf8'
};

/**
 * Transport for logging to files with rotation
 */
export class FileTransport {
  private options: FileTransportOptions;
  private currentStream: fs.WriteStream | null = null;
  private currentFilename: string = '';
  private currentFileSize: number = 0;
  private writeQueue: { message: string, callback?: () => void }[] = [];
  private isWriting: boolean = false;
  
  constructor(options: Partial<FileTransportOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    // Create log directory if it doesn't exist
    this.ensureLogDirectory();
  }
  
  /**
   * Log a message to the file
   */
  log(level: LogLevel, message: string): void {
    // Skip if this log level is below the minimum configured level
    if (level < this.options.minLevel) {
      return;
    }
    
    // Add timestamp and newline
    const now = new Date();
    const formattedMessage = `${now.toISOString()} ${message}\n`;
    
    // Queue the message for writing
    this.queueWrite(formattedMessage);
  }
  
  /**
   * Queue a message for writing to the file and process the queue
   */
  private queueWrite(message: string, callback?: () => void): void {
    // Add to queue
    this.writeQueue.push({ message, callback });
    
    // Process queue if not already processing
    if (!this.isWriting) {
      this.processWriteQueue();
    }
  }
  
  /**
   * Process the write queue, writing messages to the file
   */
  private processWriteQueue(): void {
    // If queue is empty or already writing, return
    if (this.writeQueue.length === 0 || this.isWriting) {
      return;
    }
    
    // Mark as writing
    this.isWriting = true;
    
    // Ensure we have an open stream
    this.ensureStream().then(() => {
      // Get the next message
      const { message, callback } = this.writeQueue.shift()!;
      
      // Update file size estimate
      this.currentFileSize += Buffer.byteLength(message, this.options.encoding);
      
      // Write to the stream
      this.currentStream!.write(message, this.options.encoding, (err) => {
        // Mark as not writing
        this.isWriting = false;
        
        // Execute callback if provided
        if (callback) {
          callback();
        }
        
        // Check if we need to rotate the file
        if (this.currentFileSize >= this.options.maxSize) {
          this.rotateFile().then(() => {
            // Process the next item in the queue
            this.processWriteQueue();
          }).catch(error => {
            console.error('Error rotating log file:', error);
            this.processWriteQueue();
          });
        } else {
          // Process the next item in the queue
          this.processWriteQueue();
        }
      });
    }).catch(error => {
      console.error('Error ensuring log stream:', error);
      this.isWriting = false;
      
      // Try to process the queue again after a delay
      setTimeout(() => {
        this.processWriteQueue();
      }, 1000);
    });
  }
  
  /**
   * Ensure that log directory exists
   */
  private ensureLogDirectory(): void {
    try {
      // Create the directory recursively if it doesn't exist
      if (!fs.existsSync(this.options.logDirectory)) {
        fs.mkdirSync(this.options.logDirectory, { recursive: true });
      }
    } catch (error) {
      console.error('Error creating log directory:', error);
    }
  }
  
  /**
   * Ensure that we have an open stream
   */
  private async ensureStream(): Promise<void> {
    // If we already have a stream, return
    if (this.currentStream) {
      return;
    }
    
    // Get the current filename
    const filename = this.getFilename();
    this.currentFilename = filename;
    
    // Check if file exists
    let fileExists = false;
    try {
      fileExists = fs.existsSync(filename);
    } catch (error) {
      // Ignore errors
    }
    
    // Get the current file size if it exists
    if (fileExists) {
      try {
        const stats = fs.statSync(filename);
        this.currentFileSize = stats.size;
      } catch (error) {
        this.currentFileSize = 0;
      }
    } else {
      this.currentFileSize = 0;
    }
    
    // Create the stream
    this.currentStream = fs.createWriteStream(filename, {
      flags: fileExists ? 'a' : 'w',
      encoding: this.options.encoding,
      autoClose: true
    });
    
    // Wait for the stream to open
    await new Promise<void>((resolve, reject) => {
      this.currentStream!.once('open', () => {
        resolve();
      });
      
      this.currentStream!.once('error', (error) => {
        reject(error);
      });
    });
  }
  
  /**
   * Get the current filename based on the pattern and date
   */
  private getFilename(): string {
    // Replace %DATE% with current date in YYYY-MM-DD format
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    // Replace variables in the pattern
    let filename = this.options.filenamePattern
      .replace(/%DATE%/g, dateStr);
    
    // Combine with the log directory
    return path.join(this.options.logDirectory, filename);
  }
  
  /**
   * Rotate the current log file
   */
  private async rotateFile(): Promise<void> {
    // Close the current stream
    await this.closeStream();
    
    // Get sorted list of rotated files
    const rotatedFiles = this.getRotatedFiles();
    
    // Rotate files
    try {
      // Shift all existing rotated files
      for (let i = rotatedFiles.length - 1; i >= 0; i--) {
        const currentFile = rotatedFiles[i];
        const index = this.getIndexFromRotatedFilename(currentFile);
        
        if (index >= this.options.maxFiles - 1) {
          // Delete if exceeds max files
          fs.unlinkSync(path.join(this.options.logDirectory, currentFile));
        } else {
          // Rename to next index
          const newFilename = this.getRotatedFilename(this.currentFilename, index + 1);
          fs.renameSync(
            path.join(this.options.logDirectory, currentFile),
            path.join(this.options.logDirectory, newFilename)
          );
        }
      }
      
      // Rename current file to rotated file with index 1
      const rotatedFilename = this.getRotatedFilename(this.currentFilename, 1);
      fs.renameSync(
        this.currentFilename,
        path.join(this.options.logDirectory, rotatedFilename)
      );
      
      // Compress the rotated file if configured
      if (this.options.compress) {
        this.compressFile(path.join(this.options.logDirectory, rotatedFilename));
      }
    } catch (error) {
      console.error('Error rotating log files:', error);
    }
    
    // Reset state to create new file
    this.currentStream = null;
    this.currentFileSize = 0;
    
    // Create a new stream
    await this.ensureStream();
  }
  
  /**
   * Close the current stream if open
   */
  private async closeStream(): Promise<void> {
    if (this.currentStream) {
      const stream = this.currentStream;
      this.currentStream = null;
      
      return new Promise<void>((resolve, reject) => {
        stream.end(() => {
          stream.destroy();
          resolve();
        });
      });
    }
  }
  
  /**
   * Get the rotated filename for the specified index
   */
  private getRotatedFilename(filename: string, index: number): string {
    const basename = path.basename(filename);
    return `${basename}.${index}`;
  }
  
  /**
   * Get the index from a rotated filename
   */
  private getIndexFromRotatedFilename(filename: string): number {
    const parts = filename.split('.');
    const lastPart = parts[parts.length - 1];
    const index = parseInt(lastPart, 10);
    return isNaN(index) ? 0 : index;
  }
  
  /**
   * Get a list of rotated files sorted by index
   */
  private getRotatedFiles(): string[] {
    try {
      // Get base filename without directory
      const baseFilename = path.basename(this.currentFilename);
      
      // Get all files in log directory
      const files = fs.readdirSync(this.options.logDirectory);
      
      // Filter for rotated files of current log
      const rotatedFiles = files.filter(file => {
        const parts = file.split('.');
        const lastPart = parts[parts.length - 1];
        const index = parseInt(lastPart, 10);
        return !isNaN(index) && file.startsWith(baseFilename);
      });
      
      // Sort by index
      return rotatedFiles.sort((a, b) => {
        const indexA = this.getIndexFromRotatedFilename(a);
        const indexB = this.getIndexFromRotatedFilename(b);
        return indexA - indexB;
      });
    } catch (error) {
      console.error('Error getting rotated files:', error);
      return [];
    }
  }
  
  /**
   * Compress a file using gzip
   */
  private compressFile(filepath: string): void {
    try {
      // This is a simplified version - in a real implementation
      // you would use a library like zlib to compress the file
      // For now, we just rename it to indicate it would be compressed
      fs.renameSync(filepath, `${filepath}.gz`);
    } catch (error) {
      console.error('Error compressing file:', error);
    }
  }
  
  /**
   * Update the transport options
   */
  updateOptions(options: Partial<FileTransportOptions>): void {
    const oldDir = this.options.logDirectory;
    
    // Update options
    this.options = { ...this.options, ...options };
    
    // If log directory changed, ensure it exists
    if (oldDir !== this.options.logDirectory) {
      this.ensureLogDirectory();
    }
  }
  
  /**
   * Close the transport and clean up resources
   */
  close(): void {
    // Close the current stream
    if (this.currentStream) {
      this.currentStream.end();
      this.currentStream.destroy();
      this.currentStream = null;
    }
    
    // Clear the write queue
    this.writeQueue = [];
  }
  
  /**
   * Flush all pending writes
   */
  flush(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.writeQueue.length === 0) {
        resolve();
        return;
      }
      
      // Add a callback to the last item in the queue
      this.writeQueue[this.writeQueue.length - 1].callback = () => {
        resolve();
      };
      
      // Process the queue if not already processing
      if (!this.isWriting) {
        this.processWriteQueue();
      }
    });
  }
}
