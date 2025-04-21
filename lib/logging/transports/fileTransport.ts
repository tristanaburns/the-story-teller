/**
 * fileTransport.ts
 * 
 * A transport for storing logs in files with rotation support
 */

import fs from 'fs';
import path from 'path';
import { LogLevel } from '../logger';

// Options for file transport
export interface FileTransportOptions {
  directory: string;
  filename: string;
  maxSize: number; // in bytes
  maxFiles: number;
  minLevel: LogLevel;
}

/**
 * A transport that stores logs in files with rotation
 */
export class FileTransport {
  private options: FileTransportOptions;
  private currentSize: number = 0;
  private writeStream: fs.WriteStream | null = null;
  private currentFilePath: string = '';
  private queue: string[] = [];
  private processing: boolean = false;

  constructor(options: Partial<FileTransportOptions> = {}) {
    this.options = {
      directory: path.join(process.cwd(), 'logs'),
      filename: 'app.log',
      maxSize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      minLevel: LogLevel.INFO,
      ...options
    };

    // Create directory if it doesn't exist
    if (!fs.existsSync(this.options.directory)) {
      fs.mkdirSync(this.options.directory, { recursive: true });
    }

    // Initialize write stream
    this.openWriteStream();
  }

  /**
   * Open a write stream to the current log file
   */
  private openWriteStream(): void {
    this.currentFilePath = path.join(
      this.options.directory,
      this.options.filename
    );

    // Check if the file exists, and get its size
    if (fs.existsSync(this.currentFilePath)) {
      const stats = fs.statSync(this.currentFilePath);
      this.currentSize = stats.size;

      // Rotate if the file is too large
      if (this.currentSize >= this.options.maxSize) {
        this.rotateLog();
      }
    } else {
      this.currentSize = 0;
    }

    // Create write stream
    this.writeStream = fs.createWriteStream(this.currentFilePath, {
      flags: 'a',
      encoding: 'utf8'
    });

    // Handle errors
    this.writeStream.on('error', (error) => {
      console.error('Error writing to log file:', error);
    });
  }

  /**
   * Rotate log files
   */
  private rotateLog(): void {
    // Close current write stream if it exists
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }

    // Rotate existing log files
    for (let i = this.options.maxFiles - 1; i > 0; i--) {
      const oldPath = path.join(
        this.options.directory,
        `${this.options.filename}.${i}`
      );
      const newPath = path.join(
        this.options.directory,
        `${this.options.filename}.${i + 1}`
      );

      // Delete the oldest log file if it exists
      if (i === this.options.maxFiles - 1 && fs.existsSync(newPath)) {
        fs.unlinkSync(newPath);
      }

      // Rename log files
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, newPath);
      }
    }

    // Rename current log file
    const newPath = path.join(
      this.options.directory,
      `${this.options.filename}.1`
    );
    
    if (fs.existsSync(this.currentFilePath)) {
      fs.renameSync(this.currentFilePath, newPath);
    }

    // Reset current size
    this.currentSize = 0;
  }

  /**
   * Write a log entry to the file
   */
  public log(level: LogLevel, message: string): void {
    if (level < this.options.minLevel) {
      return;
    }

    // Format log entry
    const timestamp = new Date().toISOString();
    const levelName = LogLevel[level];
    const formattedMessage = `[${timestamp}] [${levelName}] ${message}\n`;

    // Add to queue
    this.queue.push(formattedMessage);

    // Process queue
    this.processQueue();
  }

  /**
   * Process the queue of log entries
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    try {
      // Ensure write stream is open
      if (!this.writeStream) {
        this.openWriteStream();
      }

      // Process all items in the queue
      while (this.queue.length > 0) {
        const message = this.queue.shift()!;
        const size = Buffer.byteLength(message, 'utf8');

        // Check if rotation is needed
        if (this.currentSize + size > this.options.maxSize) {
          this.rotateLog();
          this.openWriteStream();
        }

        // Write to the log file
        if (this.writeStream) {
          // Use a promise to wait for drain if needed
          await new Promise<void>((resolve, reject) => {
            if (!this.writeStream) {
              return reject(new Error('Write stream is null'));
            }

            const canContinue = this.writeStream.write(message, (error) => {
              if (error) {
                reject(error);
              }
            });

            if (canContinue) {
              resolve();
            } else {
              this.writeStream.once('drain', resolve);
            }
          });

          // Update current size
          this.currentSize += size;
        }
      }
    } catch (error) {
      console.error('Error processing log queue:', error);
      
      // Sleep before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      this.processing = false;

      // If there are new items in the queue, process them
      if (this.queue.length > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * Close the transport
   */
  public close(): void {
    if (this.writeStream) {
      this.writeStream.end();
      this.writeStream = null;
    }
  }
}

export default FileTransport;
