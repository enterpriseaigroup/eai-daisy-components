/**
 * Utilities Module
 *
 * Central export point for all utility functions, classes, and types
 * used throughout the component extraction pipeline.
 *
 * @fileoverview Utility exports for migration pipeline
 * @version 1.0.0
 */

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

export * from './config';
export {
  ConfigurationManager,
  createDefaultConfig,
  loadConfigFromFile,
  validateConfiguration,
  mergeConfigurations,
} from './config';

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export * from './errors';
export {
  PipelineError,
  ExtractionError,
  TransformationError,
  ValidationError as PipelineValidationError,
  ConfigurationError,
  FileSystemError as UtilFileSystemError,
  createError,
  isErrorType,
  formatErrorMessage,
  getErrorStack,
} from './errors';

// ============================================================================
// FILE SYSTEM UTILITIES
// ============================================================================

export * from './filesystem';
export {
  FileSystemManager,
  FileSystemError,
  createFileSystemManager,
  quickScan,
  findComponentFiles,
  isComponentFile,
  normalizePath,
  getRelativePath,
} from './filesystem';

export type {
  FileInfo,
  DirectoryScanResult,
  ScanStatistics,
  ComponentFileInfo,
  FileOperationOptions,
  ScanOptions,
} from './filesystem';

// ============================================================================
// LOGGING UTILITIES
// ============================================================================

export * from './logging';
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

export type {
  LogEntry,
  LogSource,
  LogFormatter,
  LogOutputTarget,
  LoggerConfig,
  PerformanceMeasurement,
} from './logging';

// ============================================================================
// LOGGER CONVENIENCE UTILITIES
// ============================================================================

export {
  getLogger,
  logInfo,
  logError,
  logWarning,
  logDebug,
  measurePerformance,
  createScopedLogger,
  logExtractionStart,
  logExtractionComplete,
  logTransformationStart,
  logTransformationComplete,
  logValidationStart,
  logValidationComplete,
  logPipelineStart,
  logPipelineComplete,
  logFileOperation,
} from './logger';

// ============================================================================
// FILE OPERATIONS UTILITIES
// ============================================================================

export * from './file-operations';
export {
  FileOperations,
  createFileOperations,
  copyToBaseline,
  saveMigratedComponent,
  batchCopyFiles,
} from './file-operations';

export type {
  BatchOperationResult,
  FileOperationResult,
  CopyOptions,
  BackupOptions,
} from './file-operations';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export * from './validation';
export type { ValidationEngine } from './validation';
export {
  createValidationEngine,
  validateComponentDefinition,
  validateExtractionConfig,
  validateMigrationResult,
} from './validation';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Initialize all utility subsystems
 *
 * Sets up logging, file system, and other utilities with default configuration.
 * Should be called once at application startup.
 */
export function initializeUtilities(): void {
  // Import logging functions directly to avoid circular dependency
  const { initializeLogging, getGlobalLogger } = require('./logging');

  // Initialize logging with default config
  initializeLogging();

  // Log initialization
  const logger = getGlobalLogger('utilities');
  logger.info('Utilities initialized');
}

/**
 * Shutdown all utility subsystems
 *
 * Cleanly shuts down logging and other utilities.
 * Should be called before application exit.
 */
export async function shutdownUtilities(): Promise<void> {
  // Import logging functions directly to avoid circular dependency
  const { getGlobalLogger, shutdownLogging } = require('./logging');

  const logger = getGlobalLogger('utilities');
  logger.info('Shutting down utilities');

  // Shutdown logging
  await shutdownLogging();
}

/**
 * Get utility system status
 *
 * Returns status information about utility subsystems.
 */
export function getUtilityStatus(): {
  logging: boolean;
  fileSystem: boolean;
  validation: boolean;
} {
  return {
    logging: true, // Could check if logging manager is initialized
    fileSystem: true, // File system is always available
    validation: true, // Validation is always available
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if value is a valid file path string
 *
 * @param value - Value to check
 * @returns Whether value is a valid file path
 */
export function isFilePath(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Check if value is a valid component name
 *
 * @param value - Value to check
 * @returns Whether value is a valid component name
 */
export function isComponentName(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  // Component names should start with uppercase letter
  return /^[A-Z][a-zA-Z0-9]*$/.test(value);
}

/**
 * Check if value is a valid directory path
 *
 * @param value - Value to check
 * @returns Whether value is a directory path
 */
export function isDirectoryPath(value: unknown): value is string {
  if (typeof value !== 'string') {
    return false;
  }

  // Basic directory path validation
  return value.length > 0 && !value.includes('\0');
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration in human-readable format
 *
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }

  const seconds = Math.floor(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
}

/**
 * Format percentage
 *
 * @param value - Numeric value
 * @param total - Total value
 * @param decimals - Number of decimal places
 * @returns Formatted percentage
 */
export function formatPercentage(
  value: number,
  total: number,
  decimals: number = 1,
): string {
  if (total === 0) {
    return '0%';
  }

  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Format timestamp
 *
 * @param date - Date object or timestamp
 * @returns Formatted timestamp
 */
export function formatTimestamp(date: Date | number): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  return d.toISOString();
}

// ============================================================================
// PATH UTILITIES
// ============================================================================

/**
 * Ensure path has trailing slash
 *
 * @param path - Directory path
 * @returns Path with trailing slash
 */
export function ensureTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}

/**
 * Remove trailing slash from path
 *
 * @param path - Directory path
 * @returns Path without trailing slash
 */
export function removeTrailingSlash(path: string): string {
  return path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * Join path segments safely
 *
 * @param segments - Path segments
 * @returns Joined path
 */
export function joinPaths(...segments: string[]): string {
  return segments
    .map((segment, index) => {
      if (index === 0) {
        return removeTrailingSlash(segment);
      }
      return segment.replace(/^\/+/, '').replace(/\/+$/, '');
    })
    .filter(Boolean)
    .join('/');
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Chunk array into smaller arrays
 *
 * @param array - Array to chunk
 * @param size - Chunk size
 * @returns Array of chunks
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];

  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Remove duplicates from array
 *
 * @param array - Array with potential duplicates
 * @returns Array without duplicates
 */
export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Group array items by key
 *
 * @param array - Array to group
 * @param keyFn - Function to extract grouping key
 * @returns Map of grouped items
 */
export function groupBy<T, K>(array: T[], keyFn: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();

  for (const item of array) {
    const key = keyFn(item);
    const group = map.get(key) || [];
    group.push(item);
    map.set(key, group);
  }

  return map;
}

// ============================================================================
// OBJECT UTILITIES
// ============================================================================

/**
 * Deep clone an object
 *
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if object is empty
 *
 * @param obj - Object to check
 * @returns Whether object is empty
 */
export function isEmptyObject(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0;
}

/**
 * Pick specific keys from object
 *
 * @param obj - Source object
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Omit specific keys from object
 *
 * @param obj - Source object
 * @param keys - Keys to omit
 * @returns New object without specified keys
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };

  for (const key of keys) {
    delete result[key];
  }

  return result as Omit<T, K>;
}
