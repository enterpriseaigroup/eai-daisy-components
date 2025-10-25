/**
 * Logging Types
 *
 * Defines structured logging interfaces per NFR-005.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export type OperationType =
  | 'analyze'
  | 'transform'
  | 'generate'
  | 'validate'
  | 'compile'
  | 'migration-start'
  | 'migration-complete'
  | 'analyze-start'
  | 'generation-failed'
  | 'validate-pseudocode'
  | 'validate-compilation'
  | 'write-files'
  | 'validation-error'
  | 'business-logic-incomplete'
  | 'compilation-failed'
  | 'fatal-error';

export type LogStatus = 'success' | 'failure' | 'partial';

export interface LogMetadata {
  /** Lines of code in baseline */
  loc?: number;
  /** Component complexity level (1-5) */
  complexity?: number;
  /** Number of dependencies */
  dependencies?: number;
  /** Additional context-specific metadata */
  [key: string]: string | number | boolean | undefined;
}

export interface LogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Log severity level */
  level: LogLevel;
  /** Component name being processed */
  componentName: string;
  /** Operation being performed */
  operation: OperationType;
  /** Duration in milliseconds */
  duration: number;
  /** Operation status */
  status: LogStatus;
  /** Error details if status is failure */
  errorDetails?: string;
  /** Additional metadata */
  metadata?: LogMetadata;
}

export interface ProgressInfo {
  /** Current component index (1-based) */
  current: number;
  /** Total components to process */
  total: number;
  /** Current component name */
  componentName: string;
  /** Elapsed time in milliseconds */
  elapsedMs: number;
  /** Estimated remaining time in milliseconds */
  estimatedRemainingMs?: number;
  /** Number of successful completions */
  successCount: number;
  /** Number of failures */
  failureCount: number;
  /** Number of skipped components */
  skipCount: number;
}
