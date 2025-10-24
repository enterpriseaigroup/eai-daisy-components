/**
 * Configuration Management System
 *
 * Provides runtime-validated configuration management for the component
 * extraction pipeline using Zod schemas for type safety and validation.
 *
 * @fileoverview Configuration management with Zod validation
 * @version 1.0.0
 */

import { z } from 'zod';
import { isAbsolute, resolve } from 'path';
import { accessSync, constants, existsSync } from 'fs';
import type {
  ComplexityLevel,
  ComponentFilters,
  ComponentType,
  ExtractionConfig,
  LogOutput,
  LoggingConfig,
  NamingConventions,
  OutputConfig,
  OutputFormat,
  PerformanceConfig,
  ProcessingConfig,
  RetryConfig,
  RetryableOperation,
  ValidationConfig,
} from '@/types';

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for component type validation
 */
const ComponentTypeSchema = z.enum([
  'functional',
  'class',
  'higher-order',
  'hook',
  'utility',
]);

/**
 * Schema for complexity level validation
 */
const ComplexityLevelSchema = z.enum([
  'simple',
  'moderate',
  'complex',
  'critical',
]);

/**
 * Schema for log level validation
 */
const LogLevelSchema = z.enum(['debug', 'info', 'warn', 'error', 'silent']);

/**
 * Schema for log output validation
 */
const LogOutputSchema = z.enum(['console', 'file', 'json', 'structured']);

/**
 * Schema for log format validation
 */
const LogFormatSchema = z.enum(['simple', 'detailed', 'json', 'structured']);

/**
 * Schema for retryable operations
 */
const RetryableOperationSchema = z.enum([
  'file-read',
  'file-write',
  'ast-parsing',
  'type-analysis',
  'validation',
]);

/**
 * Schema for file path validation with existence check
 */
const FilePathSchema = z
  .string()
  .min(1, 'Path cannot be empty')
  .refine(path => {
    if (!isAbsolute(path)) {
      return false;
    }
    return true;
  }, 'Path must be absolute')
  .refine(path => {
    try {
      accessSync(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }, 'Path must exist and be accessible');

/**
 * Schema for directory path validation
 */
const DirectoryPathSchema = z
  .string()
  .min(1, 'Directory path cannot be empty')
  .refine(path => isAbsolute(path), 'Directory path must be absolute');

/**
 * Schema for output format configuration
 */
const OutputFormatSchema: z.ZodType<OutputFormat> = z.object({
  typescript: z.enum(['.ts', '.tsx']).default('.tsx'),
  indentation: z.enum(['spaces', 'tabs']).default('spaces'),
  indentationSize: z.number().int().min(1).max(8).default(2),
  lineEnding: z.enum(['lf', 'crlf']).default('lf'),
  quotes: z.enum(['single', 'double']).default('single'),
}) as z.ZodType<OutputFormat>;

/**
 * Schema for naming conventions configuration
 */
const NamingConventionsSchema: z.ZodType<NamingConventions> = z.object({
  componentFiles: z
    .enum(['PascalCase', 'kebab-case', 'camelCase'])
    .default('PascalCase'),
  interfaces: z.enum(['PascalCase', 'IPascalCase']).default('PascalCase'),
  utilities: z.enum(['camelCase', 'snake_case']).default('camelCase'),
  constants: z
    .enum(['UPPER_SNAKE_CASE', 'UPPER_CAMEL_CASE'])
    .default('UPPER_SNAKE_CASE'),
}) as z.ZodType<NamingConventions>;

/**
 * Schema for retry configuration
 */
const RetryConfigSchema: z.ZodType<RetryConfig> = z.object({
  maxAttempts: z.number().int().min(0).max(10).default(3),
  delay: z.number().int().min(0).max(60000).default(1000),
  backoffMultiplier: z.number().min(1).max(5).default(2),
  retryableOperations: z
    .array(RetryableOperationSchema)
    .default(['file-read', 'file-write', 'ast-parsing']),
}) as z.ZodType<RetryConfig>;

/**
 * Schema for component filters configuration
 */
const ComponentFiltersSchema: z.ZodType<ComponentFilters> = z.object({
  include: z.array(z.string()).default(['**/*']),
  exclude: z
    .array(z.string())
    .default([
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.*',
      '**/*.spec.*',
    ]),
  types: z
    .array(ComponentTypeSchema)
    .default(['functional', 'class', 'higher-order', 'hook']),
  complexity: z
    .array(ComplexityLevelSchema)
    .default(['simple', 'moderate', 'complex', 'critical']),
  custom: z.array(z.function()).default([]),
}) as z.ZodType<ComponentFilters>;

/**
 * Schema for processing configuration
 */
const ProcessingConfigSchema: z.ZodType<ProcessingConfig> = z.object({
  mode: z.enum(['serial', 'parallel', 'adaptive']).default('serial'),
  concurrency: z.number().int().min(1).max(16).optional(),
  continueOnError: z.boolean().default(false),
  retry: RetryConfigSchema.default(() => ({
    maxAttempts: 3,
    delay: 1000,
    backoffMultiplier: 2,
    retryableOperations: [
      'file-read',
      'file-write',
      'ast-parsing',
    ] as RetryableOperation[],
  })),
  filters: ComponentFiltersSchema.default(() => ({
    include: ['**/*'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    types: ['functional', 'class', 'higher-order'] as ComponentType[],
    complexity: ['simple', 'moderate', 'complex'] as ComplexityLevel[],
    custom: [],
  })),
}) as z.ZodType<ProcessingConfig>;

/**
 * Schema for performance configuration
 */
const PerformanceConfigSchema: z.ZodType<PerformanceConfig> = z.object({
  memoryLimit: z.number().int().min(128).max(8192).default(500),
  timeoutPerComponent: z.number().int().min(1000).max(3600000).default(1800000), // 30 minutes
  maxBundleSizeIncrease: z.number().min(0).max(200).default(120),
  monitoring: z.boolean().default(true),
}) as z.ZodType<PerformanceConfig>;

/**
 * Schema for validation configuration
 */
const ValidationConfigSchema: z.ZodType<ValidationConfig> = z.object({
  strict: z.boolean().default(true),
  typescript: z.boolean().default(true),
  eslint: z.boolean().default(true),
  componentStructure: z.boolean().default(true),
  businessLogicPreservation: z.boolean().default(true),
}) as z.ZodType<ValidationConfig>;

/**
 * Schema for output configuration
 */
const OutputConfigSchema: z.ZodType<OutputConfig> = z.object({
  generateDeclarations: z.boolean().default(true),
  generateDocs: z.boolean().default(true),
  generateExamples: z.boolean().default(true),
  format: OutputFormatSchema.default(() => ({
    typescript: '.tsx' as const,
    indentation: 'spaces' as const,
    indentationSize: 2,
    lineEnding: 'lf' as const,
    quotes: 'single' as const,
  })),
  naming: NamingConventionsSchema.default(() => ({
    componentFiles: 'PascalCase' as const,
    interfaces: 'PascalCase' as const,
    utilities: 'camelCase' as const,
    constants: 'UPPER_SNAKE_CASE' as const,
  })),
}) as z.ZodType<OutputConfig>;

/**
 * Schema for logging configuration
 */
const LoggingConfigSchema: z.ZodType<LoggingConfig> = z.object({
  level: LogLevelSchema.default('info'),
  outputs: z.array(LogOutputSchema).default(['console']),
  format: LogFormatSchema.default('detailed'),
  timestamps: z.boolean().default(true),
  stackTraces: z.boolean().default(true),
}) as z.ZodType<LoggingConfig>;

/**
 * Main extraction configuration schema
 */
const ExtractionConfigSchema: z.ZodType<ExtractionConfig> = z.object({
  sourcePath: FilePathSchema,
  outputPath: DirectoryPathSchema,
  preserveBaseline: z.boolean().default(true),
  processing: ProcessingConfigSchema.default(() => ({
    mode: 'serial' as const,
    continueOnError: true,
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      retryableOperations: [
        'file-read',
        'file-write',
        'ast-parsing',
      ] as RetryableOperation[],
    },
    filters: {
      include: ['**/*'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      types: ['functional', 'class', 'higher-order'] as ComponentType[],
      complexity: ['simple', 'moderate', 'complex'] as ComplexityLevel[],
      custom: [],
    },
  })),
  performance: PerformanceConfigSchema.default(() => ({
    memoryLimit: 500,
    timeoutPerComponent: 1800000,
    maxBundleSizeIncrease: 120,
    monitoring: true,
  })),
  validation: ValidationConfigSchema.default(() => ({
    strict: true,
    typescript: true,
    eslint: true,
    componentStructure: true,
    businessLogicPreservation: true,
  })),
  output: OutputConfigSchema.default(() => ({
    generateDeclarations: true,
    generateDocs: true,
    generateExamples: true,
    format: {
      typescript: '.tsx' as const,
      indentation: 'spaces' as const,
      indentationSize: 2,
      lineEnding: 'lf' as const,
      quotes: 'single' as const,
    },
    naming: {
      componentFiles: 'PascalCase' as const,
      interfaces: 'PascalCase' as const,
      utilities: 'camelCase' as const,
      constants: 'UPPER_SNAKE_CASE' as const,
    },
  })),
  logging: LoggingConfigSchema.default(() => ({
    level: 'info' as const,
    outputs: ['console', 'file'] as LogOutput[],
    format: 'simple' as const,
    timestamps: true,
    stackTraces: true,
  })),
}) as z.ZodType<ExtractionConfig>;

// ============================================================================
// CONFIGURATION MANAGER CLASS
// ============================================================================

/**
 * Configuration manager with validation and defaults
 */
export class ConfigurationManager {
  private config: ExtractionConfig | null = null;
  private readonly configSchema = ExtractionConfigSchema;

  /**
   * Create a new configuration manager instance
   */
  constructor() {
    // Initialize with empty config
  }

  /**
   * Load and validate configuration from object
   *
   * @param configData - Raw configuration data
   * @returns Validated configuration
   * @throws {ConfigurationError} When validation fails
   */
  public loadFromObject(configData: unknown): ExtractionConfig {
    try {
      const validatedConfig = this.configSchema.parse(configData);
      this.config = validatedConfig;
      this.validatePaths(validatedConfig);
      return validatedConfig;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ConfigurationError(
          'Configuration validation failed',
          this.formatZodErrors(error),
        );
      }
      throw new ConfigurationError('Configuration loading failed', [
        error as Error,
      ]);
    }
  }

  /**
   * Load configuration from JSON file
   *
   * @param filePath - Path to configuration file
   * @returns Validated configuration
   */
  public async loadFromFile(filePath: string): Promise<ExtractionConfig> {
    try {
      const fs = await import('fs/promises');
      const configData = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(configData);
      return this.loadFromObject(parsedData);
    } catch (error) {
      throw new ConfigurationError(
        `Failed to load configuration from file: ${filePath}`,
        [error as Error],
      );
    }
  }

  /**
   * Create configuration with minimal required options
   *
   * @param sourcePath - Source directory path
   * @param outputPath - Output directory path
   * @param overrides - Optional configuration overrides
   * @returns Validated configuration
   */
  public createMinimal(
    sourcePath: string,
    outputPath: string,
    overrides: Partial<ExtractionConfig> = {},
  ): ExtractionConfig {
    const minimalConfig = {
      sourcePath: resolve(sourcePath),
      outputPath: resolve(outputPath),
      ...overrides,
    };

    return this.loadFromObject(minimalConfig);
  }

  /**
   * Get current configuration
   *
   * @returns Current configuration or null if not loaded
   */
  public getCurrentConfig(): ExtractionConfig | null {
    return this.config;
  }

  /**
   * Validate configuration paths
   *
   * @param config - Configuration to validate
   * @throws {ConfigurationError} When path validation fails
   */
  private validatePaths(config: ExtractionConfig): void {
    const errors: string[] = [];

    // Validate source path exists and is readable
    if (!existsSync(config.sourcePath)) {
      errors.push(`Source path does not exist: ${config.sourcePath}`);
    } else {
      try {
        accessSync(config.sourcePath, constants.R_OK);
      } catch {
        errors.push(`Source path is not readable: ${config.sourcePath}`);
      }
    }

    // Validate output path is writable (create if needed)
    try {
      const fs = require('fs');
      fs.mkdirSync(config.outputPath, { recursive: true });
      accessSync(config.outputPath, constants.W_OK);
    } catch {
      errors.push(`Output path is not writable: ${config.outputPath}`);
    }

    if (errors.length > 0) {
      throw new ConfigurationError(
        'Path validation failed',
        errors.map(msg => new Error(msg)),
      );
    }
  }

  /**
   * Format Zod validation errors for user-friendly display
   *
   * @param zodError - Zod validation error
   * @returns Array of formatted error messages
   */
  private formatZodErrors(zodError: z.ZodError): Error[] {
    return zodError.errors.map(error => {
      const path = error.path.join('.');
      const message = `${path}: ${error.message}`;
      return new Error(message);
    });
  }

  /**
   * Get default configuration
   *
   * @returns Default configuration with placeholder paths
   */
  public static getDefaults(): Partial<ExtractionConfig> {
    return {
      preserveBaseline: true,
      processing: {
        mode: 'serial',
        continueOnError: false,
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoffMultiplier: 2,
          retryableOperations: ['file-read', 'file-write', 'ast-parsing'],
        },
        filters: {
          include: ['**/*'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/*.test.*',
            '**/*.spec.*',
          ],
          types: ['functional', 'class', 'higher-order', 'hook'],
          complexity: ['simple', 'moderate', 'complex', 'critical'],
          custom: [],
        },
      },
      performance: {
        memoryLimit: 500,
        timeoutPerComponent: 1800000, // 30 minutes
        maxBundleSizeIncrease: 120,
        monitoring: true,
      },
      validation: {
        strict: true,
        typescript: true,
        eslint: true,
        componentStructure: true,
        businessLogicPreservation: true,
      },
      output: {
        generateDeclarations: true,
        generateDocs: true,
        generateExamples: true,
        format: {
          typescript: '.tsx',
          indentation: 'spaces',
          indentationSize: 2,
          lineEnding: 'lf',
          quotes: 'single',
        },
        naming: {
          componentFiles: 'PascalCase',
          interfaces: 'PascalCase',
          utilities: 'camelCase',
          constants: 'UPPER_SNAKE_CASE',
        },
      },
      logging: {
        level: 'info',
        outputs: ['console'],
        format: 'detailed',
        timestamps: true,
        stackTraces: true,
      },
    };
  }

  /**
   * Validate individual configuration section
   *
   * @param section - Configuration section name
   * @param data - Section data to validate
   * @returns Validated section data
   */
  public validateSection<T extends keyof ExtractionConfig>(
    section: T,
    data: unknown,
  ): ExtractionConfig[T] {
    const sectionSchemas = {
      processing: ProcessingConfigSchema,
      performance: PerformanceConfigSchema,
      validation: ValidationConfigSchema,
      output: OutputConfigSchema,
      logging: LoggingConfigSchema,
    };

    const schema = sectionSchemas[section as keyof typeof sectionSchemas] as
      | z.ZodSchema
      | undefined;
    if (!schema) {
      throw new ConfigurationError(
        `Unknown configuration section: ${String(section)}`,
        [],
      );
    }

    try {
      return schema.parse(data) as ExtractionConfig[T];
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ConfigurationError(
          `Validation failed for section: ${String(section)}`,
          this.formatZodErrors(error),
        );
      }
      throw error;
    }
  }
}

// ============================================================================
// CONFIGURATION ERROR CLASS
// ============================================================================

/**
 * Custom error class for configuration-related errors
 */
export class ConfigurationError extends Error {
  public readonly errors: Error[];

  constructor(message: string, errors: Error[] = []) {
    super(message);
    this.name = 'ConfigurationError';
    this.errors = errors;

    // Maintain proper stack trace
    Error.captureStackTrace(this, ConfigurationError);
  }

  /**
   * Get formatted error message with all validation errors
   */
  public getDetailedMessage(): string {
    if (this.errors.length === 0) {
      return this.message;
    }

    const errorMessages = this.errors
      .map(error => `  - ${error.message}`)
      .join('\n');
    return `${this.message}:\n${errorMessages}`;
  }

  /**
   * Get all error messages as array
   */
  public getAllErrors(): string[] {
    return [this.message, ...this.errors.map(error => error.message)];
  }
}

// ============================================================================
// CONFIGURATION UTILITIES
// ============================================================================

/**
 * Create a configuration manager instance
 */
export function createConfigurationManager(): ConfigurationManager {
  return new ConfigurationManager();
}

/**
 * Quick configuration creation for common use cases
 *
 * @param sourcePath - Source directory path
 * @param outputPath - Output directory path
 * @param options - Optional configuration overrides
 * @returns Validated configuration
 */
export function createQuickConfig(
  sourcePath: string,
  outputPath: string,
  options: Partial<ExtractionConfig> = {},
): ExtractionConfig {
  const manager = createConfigurationManager();
  return manager.createMinimal(sourcePath, outputPath, options);
}

/**
 * Validate configuration object without creating manager
 *
 * @param configData - Configuration data to validate
 * @returns Validation result
 */
export function validateConfiguration(configData: unknown): {
  valid: boolean;
  config?: ExtractionConfig;
  errors?: string[];
} {
  try {
    const manager = createConfigurationManager();
    const config = manager.loadFromObject(configData);
    return { valid: true, config };
  } catch (error) {
    if (error instanceof ConfigurationError) {
      return {
        valid: false,
        errors: error.getAllErrors(),
      };
    }
    return {
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Merge configuration objects with validation
 *
 * @param base - Base configuration
 * @param override - Override configuration
 * @returns Merged and validated configuration
 */
export function mergeConfigurations(
  base: Partial<ExtractionConfig>,
  override: Partial<ExtractionConfig>,
): ExtractionConfig {
  const merged = {
    ...base,
    ...override,
    // Deep merge for nested objects
    processing: { ...base.processing, ...override.processing },
    performance: { ...base.performance, ...override.performance },
    validation: { ...base.validation, ...override.validation },
    output: {
      ...base.output,
      ...override.output,
      format: { ...base.output?.format, ...override.output?.format },
      naming: { ...base.output?.naming, ...override.output?.naming },
    },
    logging: { ...base.logging, ...override.logging },
  };

  const manager = createConfigurationManager();
  return manager.loadFromObject(merged);
}

// ============================================================================
// EXPORTS
// ============================================================================

export {
  // Schemas for external use
  ExtractionConfigSchema,
  ProcessingConfigSchema,
  PerformanceConfigSchema,
  ValidationConfigSchema,
  OutputConfigSchema,
  LoggingConfigSchema,

  // Schema components
  ComponentTypeSchema,
  ComplexityLevelSchema,
  LogLevelSchema,
  LogOutputSchema,
  LogFormatSchema,
  RetryableOperationSchema,
};

export type {
  // Re-export types for convenience
  ExtractionConfig,
  ProcessingConfig,
  PerformanceConfig,
  ValidationConfig,
  OutputConfig,
  LoggingConfig,
} from '@/types';

// ============================================================================
// ADDITIONAL UTILITY EXPORTS
// ============================================================================

/**
 * Create default configuration (alias for getDefaults)
 */
export function createDefaultConfig(): Partial<ExtractionConfig> {
  return ConfigurationManager.getDefaults();
}

/**
 * Load configuration from file (async wrapper)
 */
export async function loadConfigFromFile(
  filePath: string,
): Promise<ExtractionConfig> {
  const manager = createConfigurationManager();
  return manager.loadFromFile(filePath);
}
