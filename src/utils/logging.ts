/**
 * Logging Infrastructure
 *
 * Provides comprehensive logging system with multiple levels, formatters,
 * and output targets for the component extraction pipeline.
 *
 * @fileoverview Structured logging system for pipeline operations
 * @version 1.0.0
 */

import { appendFile, mkdir } from 'fs/promises';
import { dirname, join, resolve } from 'path';
import type { WriteStream } from 'fs';
import { createWriteStream } from 'fs';
import type { LogFormat, LogLevel, LogOutput, LoggingConfig } from '@/types';

// ============================================================================
// LOGGING TYPES
// ============================================================================

/**
 * Log entry structure
 */
export interface LogEntry {
  /** Timestamp of log entry */
  readonly timestamp: Date;

  /** Log level */
  readonly level: LogLevel;

  /** Log message */
  readonly message: string;

  /** Additional context data */
  readonly context?: Record<string, unknown>;

  /** Error object if applicable */
  readonly error?: Error;

  /** Source location */
  readonly source?: LogSource;

  /** Correlation ID for tracking */
  readonly correlationId?: string;
}

/**
 * Log source information
 */
export interface LogSource {
  /** Source file name */
  readonly file?: string;

  /** Function or method name */
  readonly function?: string;

  /** Line number */
  readonly line?: number;

  /** Component or module name */
  readonly component?: string;
}

/**
 * Log formatter interface
 */
export interface LogFormatter {
  /** Format log entry to string */
  format(entry: LogEntry): string;
}

/**
 * Log output target interface
 */
export interface LogOutputTarget {
  /** Write log entry */
  write(formattedEntry: string): Promise<void>;

  /** Close output target */
  close?(): Promise<void>;

  /** Flush pending writes */
  flush?(): Promise<void>;
}

/**
 * Logger configuration for specific component
 */
export interface LoggerConfig {
  /** Logger name/component */
  readonly name: string;

  /** Minimum log level */
  readonly level: LogLevel;

  /** Output targets */
  readonly outputs: LogOutputTarget[];

  /** Log formatter */
  readonly formatter: LogFormatter;

  /** Whether to include stack traces */
  readonly includeStackTrace: boolean;

  /** Context to include in all logs */
  readonly context?: Record<string, unknown>;
}

/**
 * Performance measurement result
 */
export interface PerformanceMeasurement {
  /** Operation name */
  readonly operation: string;

  /** Duration in milliseconds */
  readonly duration: number;

  /** Memory usage delta in bytes */
  readonly memoryDelta?: number;

  /** Additional metrics */
  readonly metrics?: Record<string, number>;
}

// ============================================================================
// LOG FORMATTERS
// ============================================================================

/**
 * Simple text formatter
 */
export class SimpleFormatter implements LogFormatter {
  public format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    let message = `[${timestamp}] ${level} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      message += ` | Context: ${JSON.stringify(entry.context)}`;
    }

    if (entry.error) {
      message += `\nError: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\nStack: ${entry.error.stack}`;
      }
    }

    return message;
  }
}

/**
 * Detailed text formatter with source information
 */
export class DetailedFormatter implements LogFormatter {
  public format(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);

    let message = `[${timestamp}] ${level} ${entry.message}`;

    // Add source information
    if (entry.source) {
      const sourceInfo = [];
      if (entry.source.component) {
        sourceInfo.push(`component=${entry.source.component}`);
      }
      if (entry.source.file) {
        sourceInfo.push(`file=${entry.source.file}`);
      }
      if (entry.source.function) {
        sourceInfo.push(`function=${entry.source.function}`);
      }
      if (entry.source.line) {
        sourceInfo.push(`line=${entry.source.line}`);
      }

      if (sourceInfo.length > 0) {
        message += ` [${sourceInfo.join(', ')}]`;
      }
    }

    // Add correlation ID
    if (entry.correlationId) {
      message += ` [correlation=${entry.correlationId}]`;
    }

    // Add context
    if (entry.context && Object.keys(entry.context).length > 0) {
      message += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    // Add error details
    if (entry.error) {
      message += `\n  Error: ${entry.error.message}`;
      if (entry.error.stack) {
        message += `\n  Stack Trace:\n${entry.error.stack
          .split('\n')
          .map(line => `    ${line}`)
          .join('\n')}`;
      }
    }

    return message;
  }
}

/**
 * JSON formatter for structured logging
 */
export class JsonFormatter implements LogFormatter {
  public format(entry: LogEntry): string {
    const logObject = {
      timestamp: entry.timestamp.toISOString(),
      level: entry.level,
      message: entry.message,
      ...(entry.context && { context: entry.context }),
      ...(entry.correlationId && { correlationId: entry.correlationId }),
      ...(entry.source && { source: entry.source }),
      ...(entry.error && {
        error: {
          name: entry.error.name,
          message: entry.error.message,
          stack: entry.error.stack,
        },
      }),
    };

    return JSON.stringify(logObject);
  }
}

/**
 * Structured formatter for machine-readable logs
 */
export class StructuredFormatter implements LogFormatter {
  public format(entry: LogEntry): string {
    const fields = [
      `timestamp=${entry.timestamp.toISOString()}`,
      `level=${entry.level}`,
      `message="${entry.message.replace(/"/g, '\\"')}"`,
    ];

    if (entry.correlationId) {
      fields.push(`correlation_id=${entry.correlationId}`);
    }

    if (entry.source?.component) {
      fields.push(`component=${entry.source.component}`);
    }

    if (entry.source?.file) {
      fields.push(`file=${entry.source.file}`);
    }

    if (entry.context) {
      Object.entries(entry.context).forEach(([key, value]) => {
        fields.push(`${key}=${JSON.stringify(value)}`);
      });
    }

    if (entry.error) {
      fields.push(`error_name=${entry.error.name}`);
      fields.push(
        `error_message="${entry.error.message.replace(/"/g, '\\"')}"`
      );
    }

    return fields.join(' ');
  }
}

// ============================================================================
// LOG OUTPUT TARGETS
// ============================================================================

/**
 * Console output target
 */
export class ConsoleOutputTarget implements LogOutputTarget {
  private readonly useColors: boolean;

  constructor(useColors: boolean = true) {
    this.useColors = useColors;
  }

  public write(formattedEntry: string): Promise<void> {
    if (this.useColors) {
      // Simple color coding based on log level
      if (formattedEntry.includes('ERROR')) {
        console.error('\x1b[31m%s\x1b[0m', formattedEntry); // Red
      } else if (formattedEntry.includes('WARN')) {
        console.warn('\x1b[33m%s\x1b[0m', formattedEntry); // Yellow
      } else if (formattedEntry.includes('INFO')) {
        console.info('\x1b[32m%s\x1b[0m', formattedEntry); // Green
      } else if (formattedEntry.includes('DEBUG')) {
        console.debug('\x1b[36m%s\x1b[0m', formattedEntry); // Cyan
      } else {
        console.log(formattedEntry);
      }
    } else {
      console.log(formattedEntry);
    }
    return Promise.resolve();
  }
}

/**
 * File output target
 */
export class FileOutputTarget implements LogOutputTarget {
  private readonly filePath: string;
  private writeStream: WriteStream | null = null;

  constructor(filePath: string) {
    this.filePath = resolve(filePath);
  }

  public async write(formattedEntry: string): Promise<void> {
    try {
      // Ensure directory exists
      await mkdir(dirname(this.filePath), { recursive: true });

      // Use write stream for better performance
      if (!this.writeStream) {
        this.writeStream = createWriteStream(this.filePath, { flags: 'a' });
      }

      const stream = this.writeStream;
      return new Promise((resolve, reject) => {
        stream.write(formattedEntry + '\n', error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    } catch (error) {
      // Fallback to direct file write
      await appendFile(this.filePath, formattedEntry + '\n');
    }
  }

  public async close(): Promise<void> {
    if (this.writeStream) {
      const stream = this.writeStream;
      return new Promise(resolve => {
        stream.end(() => {
          this.writeStream = null;
          resolve();
        });
      });
    }
  }

  public async flush(): Promise<void> {
    if (this.writeStream) {
      const stream = this.writeStream;
      return new Promise<void>((resolve, reject) => {
        // WriteStream doesn't have flush, but we can use the 'drain' event
        if (stream.writableNeedDrain) {
          stream.once('drain', () => resolve());
          stream.once('error', (error: Error) => reject(error));
        } else {
          resolve();
        }
      });
    }
  }
}

/**
 * JSON file output target for structured logs
 */
export class JsonFileOutputTarget implements LogOutputTarget {
  private readonly filePath: string;
  private entries: string[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    filePath: string,
    private readonly batchSize: number = 100
  ) {
    this.filePath = resolve(filePath);
  }

  public async write(formattedEntry: string): Promise<void> {
    this.entries.push(formattedEntry);

    if (this.entries.length >= this.batchSize) {
      await this.flush();
    } else if (!this.flushTimer) {
      // Auto-flush after 5 seconds
      this.flushTimer = setTimeout(() => void this.flush(), 5000);
    }
  }

  public async flush(): Promise<void> {
    if (this.entries.length === 0) {
      return;
    }

    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    try {
      await mkdir(dirname(this.filePath), { recursive: true });

      const content = this.entries.join('\n') + '\n';
      await appendFile(this.filePath, content);

      this.entries = [];
    } catch (error) {
      console.error('Failed to flush JSON logs:', error);
    }
  }

  public async close(): Promise<void> {
    await this.flush();
  }
}

// ============================================================================
// LOGGER CLASS
// ============================================================================

/**
 * Main logger implementation
 */
export class Logger {
  private readonly config: LoggerConfig;
  private readonly logLevels: Record<LogLevel, number> = {
    silent: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
  };

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  /**
   * Log error message
   */
  public error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.log('error', message, {
      ...(error ? { error } : {}),
      ...(context ? { context } : {}),
    });
  }

  /**
   * Log warning message
   */
  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context ? { context } : {});
  }

  /**
   * Log info message
   */
  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context ? { context } : {});
  }

  /**
   * Log debug message
   */
  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context ? { context } : {});
  }

  /**
   * Measure performance of operation
   */
  public async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      this.debug(`Starting operation: ${operation}`);
      const result = await fn();

      const duration = Date.now() - startTime;
      const memoryDelta = process.memoryUsage().heapUsed - startMemory;

      this.info(`Operation completed: ${operation}`, {
        duration,
        memoryDelta,
        success: true,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const memoryDelta = process.memoryUsage().heapUsed - startMemory;

      this.error(`Operation failed: ${operation}`, error as Error, {
        duration,
        memoryDelta,
        success: false,
      });

      throw error;
    }
  }

  /**
   * Create child logger with additional context
   */
  public child(additionalContext: Record<string, unknown>): Logger {
    const childConfig: LoggerConfig = {
      ...this.config,
      context: {
        ...this.config.context,
        ...additionalContext,
      },
    };

    return new Logger(childConfig);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    options: {
      error?: Error;
      context?: Record<string, unknown>;
      source?: LogSource;
      correlationId?: string;
    } = {}
  ): void {
    // Check if level should be logged
    if (this.logLevels[level] > this.logLevels[this.config.level]) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      context: {
        ...this.config.context,
        ...options.context,
      },
      ...(options.error ? { error: options.error } : {}),
      ...(options.source ? { source: options.source } : {}),
      ...(options.correlationId
        ? { correlationId: options.correlationId }
        : {}),
    };

    const formattedEntry = this.config.formatter.format(entry);

    // Write to all output targets
    void Promise.all(
      this.config.outputs.map(async output => {
        try {
          await output.write(formattedEntry);
        } catch (error) {
          // Fallback to console for output errors
          console.error('Failed to write log entry:', error);
          console.error('Original log entry:', formattedEntry);
        }
      })
    );
  }
}

// ============================================================================
// LOGGING MANAGER
// ============================================================================

/**
 * Central logging management
 */
export class LoggingManager {
  private readonly loggers: Map<string, Logger> = new Map();
  private readonly globalConfig: LoggingConfig;

  constructor(config: LoggingConfig) {
    this.globalConfig = config;
  }

  /**
   * Get or create logger for component
   */
  public getLogger(name: string, overrides?: Partial<LoggerConfig>): Logger {
    const existingLogger = this.loggers.get(name);
    if (existingLogger) {
      return existingLogger;
    }

    const logger = this.createLogger(name, overrides);
    this.loggers.set(name, logger);
    return logger;
  }

  /**
   * Create new logger with configuration
   */
  private createLogger(
    name: string,
    overrides?: Partial<LoggerConfig>
  ): Logger {
    const formatter = this.createFormatter(this.globalConfig.format);
    const outputs = this.createOutputTargets(this.globalConfig.outputs);

    const config: LoggerConfig = {
      name,
      level: this.globalConfig.level,
      outputs,
      formatter,
      includeStackTrace: this.globalConfig.stackTraces,
      context: { component: name },
      ...overrides,
    };

    return new Logger(config);
  }

  /**
   * Create formatter based on format type
   */
  private createFormatter(format: LogFormat): LogFormatter {
    switch (format) {
      case 'simple':
        return new SimpleFormatter();
      case 'detailed':
        return new DetailedFormatter();
      case 'json':
        return new JsonFormatter();
      case 'structured':
        return new StructuredFormatter();
      default:
        return new DetailedFormatter();
    }
  }

  /**
   * Create output targets based on configuration
   */
  private createOutputTargets(outputs: LogOutput[]): LogOutputTarget[] {
    return outputs.map(output => {
      switch (output) {
        case 'console':
          return new ConsoleOutputTarget();
        case 'file':
          return new FileOutputTarget(
            join(process.cwd(), 'logs', 'pipeline.log')
          );
        case 'json':
          return new JsonFileOutputTarget(
            join(process.cwd(), 'logs', 'pipeline.json')
          );
        case 'structured':
          return new FileOutputTarget(
            join(process.cwd(), 'logs', 'pipeline.structured')
          );
        default:
          return new ConsoleOutputTarget();
      }
    });
  }

  /**
   * Close all loggers and output targets
   */
  public async close(): Promise<void> {
    const closePromises: Promise<void>[] = [];

    for (const logger of this.loggers.values()) {
      for (const output of (logger as any).config.outputs) {
        if (output.close) {
          closePromises.push(output.close());
        }
      }
    }

    await Promise.all(closePromises);
    this.loggers.clear();
  }

  /**
   * Flush all pending log writes
   */
  public async flush(): Promise<void> {
    const flushPromises: Promise<void>[] = [];

    for (const logger of this.loggers.values()) {
      for (const output of (logger as any).config.outputs) {
        if (output.flush) {
          flushPromises.push(output.flush());
        }
      }
    }

    await Promise.all(flushPromises);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create logging manager with configuration
 */
export function createLoggingManager(config: LoggingConfig): LoggingManager {
  return new LoggingManager(config);
}

/**
 * Create simple logger for quick use
 */
export function createSimpleLogger(
  name: string,
  level: LogLevel = 'info'
): Logger {
  const config: LoggerConfig = {
    name,
    level,
    outputs: [new ConsoleOutputTarget()],
    formatter: new DetailedFormatter(),
    includeStackTrace: true,
    context: { component: name },
  };

  return new Logger(config);
}

/**
 * Create file logger
 */
export function createFileLogger(
  name: string,
  filePath: string,
  level: LogLevel = 'info'
): Logger {
  const config: LoggerConfig = {
    name,
    level,
    outputs: [new FileOutputTarget(filePath)],
    formatter: new DetailedFormatter(),
    includeStackTrace: true,
    context: { component: name },
  };

  return new Logger(config);
}

/**
 * Default logging configuration
 */
export const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  level: 'info',
  outputs: ['console'],
  format: 'detailed',
  timestamps: true,
  stackTraces: true,
};

// ============================================================================
// GLOBAL LOGGER INSTANCE
// ============================================================================

let globalLoggingManager: LoggingManager | null = null;

/**
 * Initialize global logging
 */
export function initializeLogging(
  config: LoggingConfig = DEFAULT_LOGGING_CONFIG
): void {
  globalLoggingManager = createLoggingManager(config);
}

/**
 * Get global logger instance
 */
export function getGlobalLogger(name: string): Logger {
  if (!globalLoggingManager) {
    initializeLogging();
  }
  if (!globalLoggingManager) {
    throw new Error('Failed to initialize global logging manager');
  }
  return globalLoggingManager.getLogger(name);
}

/**
 * Shutdown global logging
 */
export async function shutdownLogging(): Promise<void> {
  if (globalLoggingManager) {
    await globalLoggingManager.close();
    globalLoggingManager = null;
  }
}
