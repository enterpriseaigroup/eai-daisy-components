/**
 * Error Handling Framework
 *
 * Provides comprehensive error handling with custom error types, recovery
 * strategies, and user-friendly error messages for the component extraction pipeline.
 *
 * @fileoverview Error handling framework with custom error types and recovery
 * @version 1.0.0
 */

import type { ComponentDefinition, SourceLocation } from '@/types';

// ============================================================================
// ERROR TYPES AND INTERFACES
// ============================================================================

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Error categories for classification
 */
export type ErrorCategory =
  | 'configuration'
  | 'file-system'
  | 'parsing'
  | 'validation'
  | 'transformation'
  | 'generation'
  | 'network'
  | 'memory'
  | 'timeout'
  | 'dependency'
  | 'business-logic'
  | 'type-analysis'
  | 'runtime';

/**
 * Error context information
 */
export interface ErrorContext {
  /** Component being processed when error occurred */
  readonly component?: ComponentDefinition;

  /** File path where error occurred */
  readonly filePath?: string;

  /** Source code location */
  readonly location?: SourceLocation;

  /** Operation being performed */
  readonly operation?: string;

  /** Additional context data */
  readonly data?: Record<string, unknown>;

  /** Stack of operations leading to error */
  readonly operationStack?: string[];

  /** Correlation ID for tracking */
  readonly correlationId?: string;
}

/**
 * Error recovery strategy
 */
export interface ErrorRecoveryStrategy {
  /** Strategy name */
  readonly name: string;

  /** Strategy description */
  readonly description: string;

  /** Whether recovery can be attempted automatically */
  readonly canAutoRecover: boolean;

  /** Recovery function */
  readonly recover: (
    error: PipelineError,
    context: ErrorContext
  ) => Promise<RecoveryResult>;

  /** Applicable error categories */
  readonly applicableCategories: ErrorCategory[];
}

/**
 * Recovery attempt result
 */
export interface RecoveryResult {
  /** Whether recovery was successful */
  readonly success: boolean;

  /** Recovery message */
  readonly message: string;

  /** Recovered data if any */
  readonly data?: unknown;

  /** Additional recovery attempts available */
  readonly alternativeStrategies?: string[];
}

/**
 * User-friendly error information
 */
export interface UserErrorInfo {
  /** User-friendly error title */
  readonly title: string;

  /** Detailed explanation */
  readonly explanation: string;

  /** Suggested actions */
  readonly suggestions: string[];

  /** Links to documentation */
  readonly documentationLinks?: string[];

  /** Whether this is a known issue */
  readonly isKnownIssue: boolean;

  /** Workaround if available */
  readonly workaround?: string;
}

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

/**
 * Base pipeline error class
 */
export class PipelineError extends Error {
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly userInfo: UserErrorInfo;
  public readonly originalError?: Error | undefined;
  public readonly errorCode: string;
  public readonly timestamp: Date;

  constructor(
    message: string,
    category: ErrorCategory,
    severity: ErrorSeverity,
    context: ErrorContext = {},
    userInfo?: Partial<UserErrorInfo>,
    originalError?: Error,
  ) {
    super(message);
    this.name = 'PipelineError';
    this.category = category;
    this.severity = severity;
    this.context = context;
    this.originalError = originalError;
    this.errorCode = this.generateErrorCode();
    this.timestamp = new Date();
    this.userInfo = this.generateUserInfo(userInfo);

    Error.captureStackTrace(this, PipelineError);
  }

  /**
   * Generate unique error code
   */
  private generateErrorCode(): string {
    const categoryCode = this.category.toUpperCase().substring(0, 3);
    const severityCode = this.severity.toUpperCase().substring(0, 1);
    const timestamp = Date.now().toString(36);
    return `${categoryCode}-${severityCode}-${timestamp}`;
  }

  /**
   * Generate user-friendly error information
   */
  private generateUserInfo(partial?: Partial<UserErrorInfo>): UserErrorInfo {
    const defaultInfo = this.getDefaultUserInfo();
    return {
      ...defaultInfo,
      ...partial,
    };
  }

  /**
   * Get default user information based on category
   */
  private getDefaultUserInfo(): UserErrorInfo {
    switch (this.category) {
      case 'configuration':
        return {
          title: 'Configuration Error',
          explanation: 'There was an issue with the pipeline configuration.',
          suggestions: [
            'Check your configuration file syntax',
            'Verify all required fields are provided',
            'Ensure file paths are correct and accessible',
          ],
          isKnownIssue: false,
        };

      case 'file-system':
        return {
          title: 'File System Error',
          explanation: 'A file or directory operation failed.',
          suggestions: [
            'Check file permissions',
            'Verify paths exist and are accessible',
            'Ensure sufficient disk space',
          ],
          isKnownIssue: false,
        };

      case 'parsing':
        return {
          title: 'Code Parsing Error',
          explanation: 'Failed to parse component source code.',
          suggestions: [
            'Check for syntax errors in source code',
            'Ensure TypeScript/JavaScript is valid',
            'Verify component structure follows expected patterns',
          ],
          isKnownIssue: false,
        };

      default:
        return {
          title: 'Pipeline Error',
          explanation: 'An error occurred during component processing.',
          suggestions: [
            'Check the logs for more details',
            'Verify input parameters',
            'Try the operation again',
          ],
          isKnownIssue: false,
        };
    }
  }

  /**
   * Get detailed error message with context
   */
  public getDetailedMessage(): string {
    let message = `${this.userInfo.title}: ${this.message}`;

    if (this.context.component) {
      message += `\nComponent: ${this.context.component.name}`;
    }

    if (this.context.filePath) {
      message += `\nFile: ${this.context.filePath}`;
    }

    if (this.context.location) {
      message += `\nLocation: Line ${this.context.location.line}, Column ${this.context.location.column}`;
    }

    if (this.context.operation) {
      message += `\nOperation: ${this.context.operation}`;
    }

    if (this.originalError) {
      message += `\nCaused by: ${this.originalError.message}`;
    }

    message += `\nError Code: ${this.errorCode}`;
    message += `\nTimestamp: ${this.timestamp.toISOString()}`;

    return message;
  }

  /**
   * Get user-friendly error report
   */
  public getUserReport(): string {
    let report = `${this.userInfo.title}\n\n`;
    report += `${this.userInfo.explanation}\n\n`;

    if (this.userInfo.suggestions.length > 0) {
      report += 'Suggested Actions:\n';
      this.userInfo.suggestions.forEach((suggestion, index) => {
        report += `${index + 1}. ${suggestion}\n`;
      });
      report += '\n';
    }

    if (this.userInfo.workaround) {
      report += `Workaround: ${this.userInfo.workaround}\n\n`;
    }

    if (this.userInfo.documentationLinks?.length) {
      report += 'Documentation:\n';
      this.userInfo.documentationLinks.forEach(link => {
        report += `- ${link}\n`;
      });
      report += '\n';
    }

    report += `Error Code: ${this.errorCode} (for support reference)`;

    return report;
  }
}

/**
 * Configuration-specific error
 */
export class ConfigurationError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'configuration',
      'high',
      context,
      {
        title: 'Configuration Error',
        explanation: 'The pipeline configuration is invalid or incomplete.',
        suggestions: [
          'Review the configuration documentation',
          'Check for missing required fields',
          'Validate JSON syntax if using config file',
          'Ensure all paths are absolute and accessible',
        ],
        documentationLinks: ['https://docs.example.com/configuration'],
      },
      originalError,
    );
    this.name = 'ConfigurationError';
  }
}

/**
 * File system operation error
 */
export class FileSystemError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'file-system',
      'medium',
      context,
      {
        title: 'File System Error',
        explanation: 'A file or directory operation failed.',
        suggestions: [
          'Check file and directory permissions',
          'Verify paths exist and are accessible',
          'Ensure sufficient disk space is available',
          'Check for file locks or conflicts',
        ],
      },
      originalError,
    );
    this.name = 'FileSystemError';
  }
}

/**
 * Code parsing error
 */
export class ParsingError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'parsing',
      'high',
      context,
      {
        title: 'Code Parsing Error',
        explanation: 'Failed to parse the component source code.',
        suggestions: [
          'Check for syntax errors in the source file',
          'Ensure TypeScript/JavaScript is valid',
          'Verify component follows expected patterns',
          'Check for missing imports or dependencies',
        ],
        documentationLinks: ['https://docs.example.com/component-patterns'],
      },
      originalError,
    );
    this.name = 'ParsingError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'validation',
      'medium',
      context,
      {
        title: 'Validation Error',
        explanation: 'Component validation failed.',
        suggestions: [
          'Review component structure and props',
          'Check TypeScript type definitions',
          'Ensure business logic is properly preserved',
          'Verify component exports are correct',
        ],
      },
      originalError,
    );
    this.name = 'ValidationError';
  }
}

/**
 * Transformation error
 */
export class TransformationError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'transformation',
      'high',
      context,
      {
        title: 'Component Transformation Error',
        explanation: 'Failed to transform component to target architecture.',
        suggestions: [
          'Check component complexity',
          'Review unsupported patterns',
          'Consider manual migration for complex components',
          'Verify target architecture compatibility',
        ],
        isKnownIssue: true,
        workaround: 'Consider splitting complex components into smaller parts.',
      },
      originalError,
    );
    this.name = 'TransformationError';
  }
}

/**
 * Memory error
 */
export class MemoryError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'memory',
      'critical',
      context,
      {
        title: 'Memory Error',
        explanation: 'The operation exceeded memory limits.',
        suggestions: [
          'Process components in smaller batches',
          'Increase memory limit in configuration',
          'Check for memory leaks in component code',
          'Consider using serial processing mode',
        ],
        isKnownIssue: true,
        workaround: 'Reduce batch size or process components individually.',
      },
      originalError,
    );
    this.name = 'MemoryError';
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'timeout',
      'medium',
      context,
      {
        title: 'Operation Timeout',
        explanation: 'The operation took longer than the configured timeout.',
        suggestions: [
          'Increase timeout configuration',
          'Check component complexity',
          'Verify system resources',
          'Consider breaking down complex operations',
        ],
      },
      originalError,
    );
    this.name = 'TimeoutError';
  }
}

// ============================================================================
// ERROR RECOVERY STRATEGIES
// ============================================================================

/**
 * Retry strategy for transient failures
 */
export class RetryStrategy implements ErrorRecoveryStrategy {
  public readonly name = 'retry';
  public readonly description = 'Retry the operation with exponential backoff';
  public readonly canAutoRecover = true;
  public readonly applicableCategories: ErrorCategory[] = [
    'file-system',
    'network',
    'timeout',
  ];

  constructor(
    private readonly maxAttempts: number = 3,
    private readonly baseDelay: number = 1000,
    private readonly maxDelay: number = 10000,
  ) {}

  public async recover(
    _error: PipelineError,
    context: ErrorContext,
  ): Promise<RecoveryResult> {
    const attempt = (context.data?.['attempt'] as number) || 1;

    if (attempt >= this.maxAttempts) {
      return {
        success: false,
        message: `Max retry attempts (${this.maxAttempts}) exceeded`,
        alternativeStrategies: ['fallback', 'manual'],
      };
    }

    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.baseDelay * Math.pow(2, attempt - 1),
      this.maxDelay,
    );

    await new Promise(resolve => setTimeout(resolve, delay));

    return {
      success: true,
      message: `Retrying operation (attempt ${attempt + 1}/${this.maxAttempts}) after ${delay}ms`,
      data: { attempt: attempt + 1 },
    };
  }
}

/**
 * Fallback strategy for handling unsupported features
 */
export class FallbackStrategy implements ErrorRecoveryStrategy {
  public readonly name = 'fallback';
  public readonly description = 'Use fallback implementation';
  public readonly canAutoRecover = true;
  public readonly applicableCategories: ErrorCategory[] = [
    'parsing',
    'transformation',
    'business-logic',
  ];

  public recover(
    error: PipelineError,
    _context: ErrorContext,
  ): Promise<RecoveryResult> {
    return Promise.resolve({
      success: true,
      message: 'Using fallback implementation - manual review may be required',
      data: {
        requiresManualReview: true,
        fallbackReason: error.message,
      },
    });
  }
}

/**
 * Skip strategy for non-critical failures
 */
export class SkipStrategy implements ErrorRecoveryStrategy {
  public readonly name = 'skip';
  public readonly description = 'Skip the failed operation and continue';
  public readonly canAutoRecover = true;
  public readonly applicableCategories: ErrorCategory[] = [
    'validation',
    'generation',
  ];

  public recover(
    error: PipelineError,
    _context: ErrorContext,
  ): Promise<RecoveryResult> {
    if (error.severity === 'critical') {
      return Promise.resolve({
        success: false,
        message: 'Cannot skip critical error',
        alternativeStrategies: ['retry', 'manual'],
      });
    }

    return Promise.resolve({
      success: true,
      message:
        'Skipping failed operation and continuing with remaining components',
      data: {
        skipped: true,
        reason: error.message,
      },
    });
  }
}

// ============================================================================
// ERROR HANDLER MANAGER
// ============================================================================

/**
 * Central error handling and recovery management
 */
export class ErrorHandler {
  private readonly strategies: Map<string, ErrorRecoveryStrategy> = new Map();
  private readonly errorHistory: PipelineError[] = [];
  private readonly maxHistorySize: number = 100;

  constructor() {
    // Register default strategies
    this.registerStrategy(new RetryStrategy());
    this.registerStrategy(new FallbackStrategy());
    this.registerStrategy(new SkipStrategy());
  }

  /**
   * Register error recovery strategy
   */
  public registerStrategy(strategy: ErrorRecoveryStrategy): void {
    this.strategies.set(strategy.name, strategy);
  }

  /**
   * Handle error with recovery attempts
   */
  public async handleError(
    error: Error | PipelineError,
    context: ErrorContext = {},
  ): Promise<RecoveryResult | null> {
    // Convert to PipelineError if needed
    const pipelineError =
      error instanceof PipelineError
        ? error
        : this.convertToPipelineError(error, context);

    // Add to error history
    this.addToHistory(pipelineError);

    // Find applicable recovery strategies
    const applicableStrategies = this.getApplicableStrategies(pipelineError);

    // Attempt recovery with each strategy
    for (const strategy of applicableStrategies) {
      if (strategy.canAutoRecover) {
        try {
          const result = await strategy.recover(pipelineError, context);
          if (result.success) {
            return result;
          }
        } catch (recoveryError) {
          console.warn(
            `Recovery strategy ${strategy.name} failed:`,
            recoveryError,
          );
        }
      }
    }

    // No recovery possible
    return null;
  }

  /**
   * Get user-friendly error report
   */
  public getUserReport(error: Error | PipelineError): string {
    if (error instanceof PipelineError) {
      return error.getUserReport();
    }

    const pipelineError = this.convertToPipelineError(error);
    return pipelineError.getUserReport();
  }

  /**
   * Get error statistics
   */
  public getErrorStatistics(): {
    totalErrors: number;
    errorsByCategory: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    recentErrors: PipelineError[];
  } {
    const errorsByCategory: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};

    for (const error of this.errorHistory) {
      errorsByCategory[error.category] =
        (errorsByCategory[error.category] || 0) + 1;
      errorsBySeverity[error.severity] =
        (errorsBySeverity[error.severity] || 0) + 1;
    }

    return {
      totalErrors: this.errorHistory.length,
      errorsByCategory,
      errorsBySeverity,
      recentErrors: this.errorHistory.slice(-10),
    };
  }

  /**
   * Clear error history
   */
  public clearHistory(): void {
    this.errorHistory.length = 0;
  }

  /**
   * Convert generic error to PipelineError
   */
  private convertToPipelineError(
    error: Error,
    context: ErrorContext = {},
  ): PipelineError {
    // Try to infer category from error type or message
    let category: ErrorCategory = 'runtime';
    let severity: ErrorSeverity = 'medium';

    if (error.message.includes('ENOENT') || error.message.includes('file')) {
      category = 'file-system';
    } else if (error.message.includes('timeout')) {
      category = 'timeout';
      severity = 'medium';
    } else if (
      error.message.includes('memory') ||
      error.message.includes('heap')
    ) {
      category = 'memory';
      severity = 'critical';
    } else if (
      error.message.includes('parse') ||
      error.message.includes('syntax')
    ) {
      category = 'parsing';
      severity = 'high';
    }

    return new PipelineError(
      error.message,
      category,
      severity,
      context,
      undefined,
      error,
    );
  }

  /**
   * Get applicable recovery strategies for error
   */
  private getApplicableStrategies(
    error: PipelineError,
  ): ErrorRecoveryStrategy[] {
    return Array.from(this.strategies.values())
      .filter(strategy =>
        strategy.applicableCategories.includes(error.category),
      )
      .sort((a, b) => {
        // Prioritize auto-recoverable strategies
        if (a.canAutoRecover && !b.canAutoRecover) {
return -1;
}
        if (!a.canAutoRecover && b.canAutoRecover) {
return 1;
}
        return 0;
      });
  }

  /**
   * Add error to history with size limit
   */
  private addToHistory(error: PipelineError): void {
    this.errorHistory.push(error);

    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create global error handler instance
 */
export function createErrorHandler(): ErrorHandler {
  return new ErrorHandler();
}

/**
 * Wrap async function with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler: ErrorHandler,
  context?: ErrorContext,
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const recoveryResult = await errorHandler.handleError(
        error as Error,
        context,
      );

      if (recoveryResult?.success) {
        // Retry the operation if recovery suggests it
        if (
          recoveryResult.data &&
          typeof recoveryResult.data === 'object' &&
          'attempt' in recoveryResult.data
        ) {
          return fn(...args);
        }
      }

      // Re-throw if no recovery or recovery failed
      throw error;
    }
  }) as T;
}

/**
 * Assert condition with custom error
 */
export function assert(
  condition: boolean,
  message: string,
  category: ErrorCategory = 'validation',
  context: ErrorContext = {},
): asserts condition {
  if (!condition) {
    throw new PipelineError(message, category, 'high', context);
  }
}

/**
 * Create error from validation result
 */
export function createValidationError(
  message: string,
  context: ErrorContext = {},
): ValidationError {
  return new ValidationError(message, context);
}

// ============================================================================
// GLOBAL ERROR HANDLER
// ============================================================================

let globalErrorHandler: ErrorHandler | null = null;

/**
 * Initialize global error handler
 */
export function initializeErrorHandling(): void {
  globalErrorHandler = createErrorHandler();

  // Set up global error handlers
  process.on('uncaughtException', error => {
    console.error(
      'Uncaught Exception:',
      globalErrorHandler?.getUserReport(error),
    );
    process.exit(1);
  });

  process.on('unhandledRejection', reason => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    console.error(
      'Unhandled Rejection:',
      globalErrorHandler?.getUserReport(error),
    );
  });
}

/**
 * Get global error handler
 */
export function getGlobalErrorHandler(): ErrorHandler {
  if (!globalErrorHandler) {
    initializeErrorHandling();
  }
  if (!globalErrorHandler) {
    throw new Error('Failed to initialize global error handler');
  }
  return globalErrorHandler;
}

// ============================================================================
// ADDITIONAL UTILITY EXPORTS
// ============================================================================

/**
 * Extraction-specific error (alias for backward compatibility)
 */
export class ExtractionError extends PipelineError {
  constructor(
    message: string,
    context: ErrorContext = {},
    originalError?: Error,
  ) {
    super(
      message,
      'parsing',
      'high',
      context,
      {
        title: 'Extraction Error',
        explanation: 'Failed to extract component information.',
        suggestions: [
          'Check component source code for syntax errors',
          'Ensure component follows expected patterns',
          'Verify all required imports are present',
        ],
      },
      originalError,
    );
    this.name = 'ExtractionError';
  }
}

/**
 * Create a custom error with category and severity
 */
export function createError(
  message: string,
  category: ErrorCategory = 'runtime',
  severity: ErrorSeverity = 'medium',
  context: ErrorContext = {},
): PipelineError {
  return new PipelineError(message, category, severity, context);
}

/**
 * Check if error is of specific type
 */
export function isErrorType(error: unknown, errorType: string): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  if (error.constructor.name === errorType) {
    return true;
  }

  // Check name property for custom error classes
  return error.name === errorType;
}

/**
 * Format error message with context
 */
export function formatErrorMessage(error: Error | PipelineError): string {
  if (error instanceof PipelineError) {
    return error.getDetailedMessage();
  }

  let message = `${error.name}: ${error.message}`;

  if (error.stack) {
    const stackLines = error.stack.split('\n').slice(1, 3);
    message += '\n' + stackLines.join('\n');
  }

  return message;
}

/**
 * Get error stack trace as array of lines
 */
export function getErrorStack(error: Error): string[] {
  if (!error.stack) {
    return [];
  }

  return error.stack.split('\n').filter(line => line.trim());
}
