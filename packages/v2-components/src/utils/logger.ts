/**
 * JSON Logger
 *
 * Implements structured logging with JSON Lines format per NFR-005 and NFR-006.
 */

import * as fs from 'fs';
import * as fsp from 'fs/promises';
import * as path from 'path';
import type { LogEntry, LogLevel, OperationType, LogStatus } from '../types/logging.js';

const LOG_DIR = '.specify/logs';
const MAX_LOG_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const MAX_LOG_ENTRIES = 1000;

export class JSONLogger {
  private logFilePath: string;
  private writeStream: fs.WriteStream | null = null;
  private entryCount: number = 0;
  private verbose: boolean = false;

  constructor(verbose: boolean = false) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFilePath = path.join(LOG_DIR, `v2-generation-${timestamp}.jsonl`);
    this.verbose = verbose;
  }

  /**
   * Initializes the logger and creates log directory
   */
  async initialize(): Promise<void> {
    await fsp.mkdir(path.dirname(this.logFilePath), { recursive: true });
    this.writeStream = fs.createWriteStream(this.logFilePath, { flags: 'a' });
  }

  /**
   * Logs an entry to the JSON Lines file
   */
  async log(
    level: LogLevel,
    componentName: string,
    operation: OperationType,
    duration: number,
    status: LogStatus,
    errorDetails?: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      componentName,
      operation,
      duration,
      status,
      ...(errorDetails ? { errorDetails } : {}),
      ...(metadata ? { metadata } : {}),
    };

    await this.writeEntry(entry);

    // Check for rotation
    if (this.shouldRotate()) {
      await this.rotate();
    }
  }

  /**
   * Convenience method for info logs
   */
  async info(
    componentName: string,
    operation: OperationType,
    duration: number,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> {
    await this.log('info', componentName, operation, duration, 'success', undefined, metadata);
  }

  /**
   * Convenience method for error logs
   */
  async error(
    componentName: string,
    operation: OperationType,
    duration: number,
    errorDetails: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> {
    await this.log('error', componentName, operation, duration, 'failure', errorDetails, metadata);
  }

  /**
   * Convenience method for warning logs
   */
  async warn(
    componentName: string,
    operation: OperationType,
    duration: number,
    errorDetails?: string,
    metadata?: Record<string, string | number | boolean>
  ): Promise<void> {
    await this.log('warn', componentName, operation, duration, 'partial', errorDetails, metadata);
  }

  /**
   * Writes an entry to the log file
   */
  private async writeEntry(entry: LogEntry): Promise<void> {
    if (!this.writeStream) {
      throw new Error('Logger not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      const entryString = JSON.stringify(entry);
      const redactedEntry = this.redactSensitiveData(entryString);
      const line = redactedEntry + '\n';
      
      this.writeStream!.write(line, (error) => {
        if (error) {
          reject(error);
        } else {
          this.entryCount++;
          if (this.verbose && entry.level === 'debug') {
            console.log(`[DEBUG] ${entry.componentName} - ${entry.operation}: ${entry.status}`);
          }
          resolve();
        }
      });
    });
  }

  /**
   * Redacts sensitive data from log entries (NFR-014)
   * Masks API keys, tokens, secrets, cookies, emails, and SSNs
   */
  private redactSensitiveData(message: string): string {
    let redacted = message;

    // API keys, tokens, secrets, passwords (matches key=value, apiKey:value, etc.)
    redacted = redacted.replace(
      /(\b(?:api[_-]?key|token|secret|password|authorization|auth)\s*[=:]\s*)([^\s&"',}]+)/gi,
      '$1[REDACTED]'
    );

    // Bearer tokens in Authorization headers
    redacted = redacted.replace(
      /(Bearer\s+)([^\s"']+)/gi,
      '$1[REDACTED]'
    );

    // Cookies and Set-Cookie headers
    redacted = redacted.replace(
      /(Cookie|Set-Cookie)\s*:\s*([^;\n"']+)/gi,
      '$1: [REDACTED]'
    );

    // Email addresses
    redacted = redacted.replace(
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      '[EMAIL_REDACTED]'
    );

    // Social Security Numbers (XXX-XX-XXXX)
    redacted = redacted.replace(
      /\b\d{3}-\d{2}-\d{4}\b/g,
      '[SSN_REDACTED]'
    );

    // Credit card numbers (simplified pattern)
    redacted = redacted.replace(
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
      '[CC_REDACTED]'
    );

    return redacted;
  }

  /**
   * Checks if log rotation is needed
   */
  private shouldRotate(): boolean {
    if (this.entryCount >= MAX_LOG_ENTRIES) {
      return true;
    }

    try {
      const stats = fs.statSync(this.logFilePath);
      return stats.size >= MAX_LOG_SIZE_BYTES;
    } catch {
      return false;
    }
  }

  /**
   * Rotates the log file
   */
  private async rotate(): Promise<void> {
    await this.close();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFilePath = path.join(LOG_DIR, `v2-generation-${timestamp}.jsonl`);
    this.entryCount = 0;

    await this.initialize();
  }

  /**
   * Closes the logger and flushes remaining data
   */
  async close(): Promise<void> {
    if (this.writeStream) {
      return new Promise((resolve, reject) => {
        this.writeStream!.end((error: Error | null | undefined) => {
          if (error) {
            reject(error);
          } else {
            this.writeStream = null;
            resolve();
          }
        });
      });
    }
  }

  /**
   * Gets the current log file path
   */
  getLogFilePath(): string {
    return this.logFilePath;
  }
}
