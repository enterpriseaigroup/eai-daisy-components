/**
 * Logger Utilities
 *
 * Re-exports logging infrastructure with convenient utility functions
 * for common logging scenarios in the migration pipeline.
 *
 * @fileoverview Logger utility exports and helpers
 * @version 1.0.0
 */

// Re-export everything from logging module
export * from './logging';

// Re-export specific types and classes for convenience
export type {
  LogEntry,
  LogSource,
  LogFormatter,
  LogOutputTarget,
  LoggerConfig,
  PerformanceMeasurement,
} from './logging';

export {
  Logger,
  LoggingManager,
  SimpleFormatter,
  DetailedFormatter,
  JsonFormatter,
  StructuredFormatter,
  ConsoleOutputTarget,
  FileOutputTarget,
  JsonFileOutputTarget,
  createLoggingManager,
  createSimpleLogger,
  createFileLogger,
  initializeLogging,
  getGlobalLogger,
  shutdownLogging,
  DEFAULT_LOGGING_CONFIG,
} from './logging';

import type { LogLevel } from '@/types';
import { getGlobalLogger } from './logging';

// ============================================================================
// CONVENIENCE LOGGER FUNCTIONS
// ============================================================================

/**
 * Get a logger for a specific module or component
 *
 * @param name - Logger name (usually module or component name)
 * @param level - Optional log level override
 * @returns Logger instance
 */
export function getLogger(name: string, level?: LogLevel) {
  return getGlobalLogger(name);
}

/**
 * Log info message to default logger
 *
 * @param message - Log message
 * @param context - Optional context data
 */
export function logInfo(
  message: string,
  context?: Record<string, unknown>
): void {
  const logger = getGlobalLogger('default');
  logger.info(message, context);
}

/**
 * Log error message to default logger
 *
 * @param message - Error message
 * @param error - Optional error object
 * @param context - Optional context data
 */
export function logError(
  message: string,
  error?: Error,
  context?: Record<string, unknown>
): void {
  const logger = getGlobalLogger('default');
  logger.error(message, error, context);
}

/**
 * Log warning message to default logger
 *
 * @param message - Warning message
 * @param context - Optional context data
 */
export function logWarning(
  message: string,
  context?: Record<string, unknown>
): void {
  const logger = getGlobalLogger('default');
  logger.warn(message, context);
}

/**
 * Log debug message to default logger
 *
 * @param message - Debug message
 * @param context - Optional context data
 */
export function logDebug(
  message: string,
  context?: Record<string, unknown>
): void {
  const logger = getGlobalLogger('default');
  logger.debug(message, context);
}

/**
 * Measure and log performance of an async operation
 *
 * @param operationName - Name of the operation
 * @param fn - Async function to measure
 * @returns Result of the operation
 */
export async function measurePerformance<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  const logger = getGlobalLogger('performance');
  return logger.measurePerformance(operationName, fn);
}

/**
 * Create a scoped logger with additional context
 *
 * @param baseName - Base logger name
 * @param context - Additional context to include in all logs
 * @returns Scoped logger instance
 */
export function createScopedLogger(
  baseName: string,
  context: Record<string, unknown>
) {
  const logger = getGlobalLogger(baseName);
  return logger.child(context);
}

// ============================================================================
// PIPELINE-SPECIFIC LOGGING HELPERS
// ============================================================================

/**
 * Log component extraction start
 *
 * @param componentName - Name of component being extracted
 * @param sourcePath - Source file path
 */
export function logExtractionStart(
  componentName: string,
  sourcePath: string
): void {
  const logger = getGlobalLogger('extractor');
  logger.info(`Starting extraction: ${componentName}`, { sourcePath });
}

/**
 * Log component extraction completion
 *
 * @param componentName - Name of component
 * @param duration - Extraction duration in ms
 * @param success - Whether extraction succeeded
 */
export function logExtractionComplete(
  componentName: string,
  duration: number,
  success: boolean
): void {
  const logger = getGlobalLogger('extractor');

  if (success) {
    logger.info(`Extraction completed: ${componentName}`, {
      duration,
      success,
    });
  } else {
    logger.error(`Extraction failed: ${componentName}`, undefined, {
      duration,
      success,
    });
  }
}

/**
 * Log component transformation start
 *
 * @param componentName - Name of component being transformed
 */
export function logTransformationStart(componentName: string): void {
  const logger = getGlobalLogger('transformer');
  logger.info(`Starting transformation: ${componentName}`);
}

/**
 * Log component transformation completion
 *
 * @param componentName - Name of component
 * @param duration - Transformation duration in ms
 * @param transformationCount - Number of transformations applied
 */
export function logTransformationComplete(
  componentName: string,
  duration: number,
  transformationCount: number
): void {
  const logger = getGlobalLogger('transformer');
  logger.info(`Transformation completed: ${componentName}`, {
    duration,
    transformationCount,
  });
}

/**
 * Log validation start
 *
 * @param componentName - Name of component being validated
 */
export function logValidationStart(componentName: string): void {
  const logger = getGlobalLogger('validator');
  logger.info(`Starting validation: ${componentName}`);
}

/**
 * Log validation completion
 *
 * @param componentName - Name of component
 * @param valid - Whether validation passed
 * @param score - Validation score
 */
export function logValidationComplete(
  componentName: string,
  valid: boolean,
  score: number
): void {
  const logger = getGlobalLogger('validator');

  if (valid) {
    logger.info(`Validation passed: ${componentName}`, { score });
  } else {
    logger.warn(`Validation failed: ${componentName}`, { score });
  }
}

/**
 * Log pipeline execution start
 *
 * @param componentCount - Number of components to process
 * @param config - Pipeline configuration summary
 */
export function logPipelineStart(
  componentCount: number,
  config: Record<string, unknown>
): void {
  const logger = getGlobalLogger('pipeline');
  logger.info('Starting pipeline execution', { componentCount, config });
}

/**
 * Log pipeline execution completion
 *
 * @param results - Pipeline execution results summary
 */
export function logPipelineComplete(results: {
  total: number;
  successful: number;
  failed: number;
  duration: number;
}): void {
  const logger = getGlobalLogger('pipeline');
  logger.info('Pipeline execution completed', results);
}

/**
 * Log file operation
 *
 * @param operation - Operation type (copy, write, delete, etc.)
 * @param path - File path
 * @param success - Whether operation succeeded
 */
export function logFileOperation(
  operation: string,
  path: string,
  success: boolean
): void {
  const logger = getGlobalLogger('file-operations');

  if (success) {
    logger.debug(`File operation succeeded: ${operation}`, { path });
  } else {
    logger.warn(`File operation failed: ${operation}`, { path });
  }
}
