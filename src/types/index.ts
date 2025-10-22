/**
 * Core type definitions for the Component Extraction Pipeline
 * 
 * This module defines all TypeScript interfaces and types used throughout
 * the DAISY v1 to Configurator v2 component migration pipeline.
 * 
 * @fileoverview Core type system for component extraction pipeline
 * @version 1.0.0
 */

import type { ReactNode } from 'react';

// ============================================================================
// COMPONENT DEFINITION TYPES
// ============================================================================

/**
 * Component type classification for DAISY v1 components
 */
export type ComponentType = 
  | 'functional' 
  | 'class' 
  | 'higher-order' 
  | 'hook' 
  | 'utility';

/**
 * React component patterns detected in DAISY v1
 */
export type ReactPattern = 
  | 'useState' 
  | 'useEffect' 
  | 'useContext' 
  | 'useReducer' 
  | 'useMemo' 
  | 'useCallback' 
  | 'custom-hook' 
  | 'render-props' 
  | 'children-as-function';

/**
 * Business logic complexity classification
 */
export type ComplexityLevel = 'simple' | 'moderate' | 'complex' | 'critical';

/**
 * Migration status for tracking component progression
 */
export type MigrationStatus = 
  | 'pending' 
  | 'in-progress' 
  | 'completed' 
  | 'failed' 
  | 'requires-manual-review';

/**
 * Comprehensive definition of a DAISY v1 component
 */
export interface ComponentDefinition {
  /** Unique component identifier */
  readonly id: string;
  
  /** Component display name */
  readonly name: string;
  
  /** Component type classification */
  readonly type: ComponentType;
  
  /** File system path to component source */
  readonly sourcePath: string;
  
  /** Component props interface definition */
  readonly props: PropDefinition[];
  
  /** Business logic functions and methods */
  readonly businessLogic: BusinessLogicDefinition[];
  
  /** React patterns used in component */
  readonly reactPatterns: ReactPattern[];
  
  /** Dependencies on other components */
  readonly dependencies: ComponentDependency[];
  
  /** Component complexity assessment */
  readonly complexity: ComplexityLevel;
  
  /** Migration status */
  readonly migrationStatus: MigrationStatus;
  
  /** Additional metadata */
  readonly metadata: ComponentMetadata;
}

/**
 * Component property definition
 */
export interface PropDefinition {
  /** Property name */
  readonly name: string;
  
  /** TypeScript type definition */
  readonly type: string;
  
  /** Whether property is required */
  readonly required: boolean;
  
  /** Default value if any */
  readonly defaultValue?: unknown;
  
  /** Property description */
  readonly description?: string;
  
  /** Validation rules */
  readonly validation?: ValidationRule[];
}

/**
 * Business logic function definition
 */
export interface BusinessLogicDefinition {
  /** Function or method name */
  readonly name: string;
  
  /** Function signature */
  readonly signature: string;
  
  /** Function purpose description */
  readonly purpose: string;
  
  /** Parameters definition */
  readonly parameters: ParameterDefinition[];
  
  /** Return type */
  readonly returnType: string;
  
  /** Complexity assessment */
  readonly complexity: ComplexityLevel;
  
  /** Dependencies on external services */
  readonly externalDependencies: string[];
}

/**
 * Function parameter definition
 */
export interface ParameterDefinition {
  /** Parameter name */
  readonly name: string;
  
  /** Parameter type */
  readonly type: string;
  
  /** Whether parameter is optional */
  readonly optional: boolean;
  
  /** Parameter description */
  readonly description?: string;
}

/**
 * Component dependency relationship
 */
export interface ComponentDependency {
  /** Dependency component name */
  readonly name: string;
  
  /** Dependency type */
  readonly type: 'component' | 'utility' | 'service' | 'external' | 'internal';
  
  /** Import path */
  readonly importPath: string;
  
  /** Source path for internal dependencies */
  readonly source?: string;
  
  /** Whether dependency is critical */
  readonly critical: boolean;
  
  /** Version constraint if applicable */
  readonly version?: string;
}

/**
 * Component metadata for additional context
 */
export interface ComponentMetadata {
  /** Creation timestamp */
  readonly createdAt: Date;
  
  /** Last modification timestamp */
  readonly lastModified: Date;
  
  /** Original author information */
  readonly author?: string;
  
  /** Component documentation */
  readonly documentation?: string;
  
  /** Usage examples */
  readonly examples?: string[];
  
  /** Performance notes */
  readonly performance?: PerformanceMetadata;
  
  /** Testing information */
  readonly testing?: TestingMetadata;
}

/**
 * Performance-related metadata
 */
export interface PerformanceMetadata {
  /** Bundle size impact */
  readonly bundleSize?: number;
  
  /** Render performance notes */
  readonly renderPerformance?: string;
  
  /** Memory usage considerations */
  readonly memoryUsage?: string;
  
  /** Performance optimizations applied */
  readonly optimizations?: string[];
}

/**
 * Testing-related metadata
 */
export interface TestingMetadata {
  /** Test coverage percentage */
  readonly coverage?: number;
  
  /** Test file path */
  readonly testPath?: string;
  
  /** Testing strategy notes */
  readonly strategy?: string;
  
  /** Known testing issues */
  readonly issues?: string[];
}

// ============================================================================
// EXTRACTION CONFIGURATION TYPES
// ============================================================================

/**
 * Comprehensive configuration for the extraction pipeline
 */
export interface ExtractionConfig {
  /** Source directory containing DAISY v1 components */
  readonly sourcePath: string;
  
  /** Output directory for migrated components */
  readonly outputPath: string;
  
  /** Whether to preserve original /daisyv1/ baseline */
  readonly preserveBaseline: boolean;
  
  /** Processing mode configuration */
  readonly processing: ProcessingConfig;
  
  /** Performance limits and constraints */
  readonly performance: PerformanceConfig;
  
  /** Validation and quality settings */
  readonly validation: ValidationConfig;
  
  /** Output generation options */
  readonly output: OutputConfig;
  
  /** Logging configuration */
  readonly logging: LoggingConfig;
}

/**
 * Processing mode and behavior configuration
 */
export interface ProcessingConfig {
  /** Processing mode */
  readonly mode: 'serial' | 'parallel' | 'adaptive';
  
  /** Maximum concurrent operations for parallel mode */
  readonly concurrency?: number;
  
  /** Whether to continue on errors */
  readonly continueOnError: boolean;
  
  /** Retry configuration for failed operations */
  readonly retry: RetryConfig;
  
  /** Component filtering options */
  readonly filters: ComponentFilters;
}

/**
 * Performance constraints and limits
 */
export interface PerformanceConfig {
  /** Memory limit in megabytes */
  readonly memoryLimit: number;
  
  /** Processing timeout per component in milliseconds */
  readonly timeoutPerComponent: number;
  
  /** Maximum bundle size increase percentage */
  readonly maxBundleSizeIncrease: number;
  
  /** Performance monitoring enabled */
  readonly monitoring: boolean;
}

/**
 * Validation and quality assurance configuration
 */
export interface ValidationConfig {
  /** Strict mode for validation */
  readonly strict: boolean;
  
  /** TypeScript validation enabled */
  readonly typescript: boolean;
  
  /** ESLint validation enabled */
  readonly eslint: boolean;
  
  /** Component structure validation */
  readonly componentStructure: boolean;
  
  /** Business logic preservation validation */
  readonly businessLogicPreservation: boolean;
}

/**
 * Output generation configuration
 */
export interface OutputConfig {
  /** Generate TypeScript declaration files */
  readonly generateDeclarations: boolean;
  
  /** Generate component documentation */
  readonly generateDocs: boolean;
  
  /** Generate usage examples */
  readonly generateExamples: boolean;
  
  /** Output format preferences */
  readonly format: OutputFormat;
  
  /** File naming conventions */
  readonly naming: NamingConventions;
}

/**
 * Output format configuration
 */
export interface OutputFormat {
  /** TypeScript file extension preference */
  readonly typescript: '.ts' | '.tsx';
  
  /** Indentation style */
  readonly indentation: 'spaces' | 'tabs';
  
  /** Indentation size */
  readonly indentationSize: number;
  
  /** Line ending style */
  readonly lineEnding: 'lf' | 'crlf';
  
  /** Quote style for strings */
  readonly quotes: 'single' | 'double';
}

/**
 * File and component naming conventions
 */
export interface NamingConventions {
  /** Component file naming */
  readonly componentFiles: 'PascalCase' | 'kebab-case' | 'camelCase';
  
  /** Component interface naming */
  readonly interfaces: 'PascalCase' | 'IPascalCase';
  
  /** Utility function naming */
  readonly utilities: 'camelCase' | 'snake_case';
  
  /** Constant naming */
  readonly constants: 'UPPER_SNAKE_CASE' | 'UPPER_CAMEL_CASE';
}

/**
 * Retry behavior configuration
 */
export interface RetryConfig {
  /** Maximum retry attempts */
  readonly maxAttempts: number;
  
  /** Delay between retries in milliseconds */
  readonly delay: number;
  
  /** Exponential backoff multiplier */
  readonly backoffMultiplier: number;
  
  /** Operations to retry */
  readonly retryableOperations: RetryableOperation[];
}

/**
 * Operations that can be retried
 */
export type RetryableOperation = 
  | 'file-read' 
  | 'file-write' 
  | 'ast-parsing' 
  | 'type-analysis' 
  | 'validation';

/**
 * Component filtering options
 */
export interface ComponentFilters {
  /** Include components matching patterns */
  readonly include: string[];
  
  /** Exclude components matching patterns */
  readonly exclude: string[];
  
  /** Filter by component type */
  readonly types: ComponentType[];
  
  /** Filter by complexity level */
  readonly complexity: ComplexityLevel[];
  
  /** Custom filter functions */
  readonly custom: ComponentFilterFunction[];
}

/**
 * Custom component filter function type
 */
export type ComponentFilterFunction = (
  component: ComponentDefinition
) => boolean;

/**
 * Logging configuration
 */
export interface LoggingConfig {
  /** Log level */
  readonly level: LogLevel;
  
  /** Log output targets */
  readonly outputs: LogOutput[];
  
  /** Log format */
  readonly format: LogFormat;
  
  /** Whether to include timestamps */
  readonly timestamps: boolean;
  
  /** Whether to include stack traces for errors */
  readonly stackTraces: boolean;
}

/**
 * Log level enumeration
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

/**
 * Log output target
 */
export type LogOutput = 'console' | 'file' | 'json' | 'structured';

/**
 * Log format options
 */
export type LogFormat = 'simple' | 'detailed' | 'json' | 'structured';

// ============================================================================
// MIGRATION RESULT TYPES
// ============================================================================

/**
 * Complete result of component migration operation
 */
export interface MigrationResult {
  /** Operation success status */
  readonly success: boolean;
  
  /** Component that was migrated */
  readonly component: ComponentDefinition;
  
  /** Migration operation details */
  readonly operation: MigrationOperation;
  
  /** Performance metrics */
  readonly performance: MigrationPerformance;
  
  /** Quality assessment */
  readonly quality: QualityAssessment;
  
  /** Generated artifacts */
  readonly artifacts: GeneratedArtifacts;
  
  /** Issues encountered during migration */
  readonly issues: MigrationIssue[];
  
  /** Recommendations for improvement */
  readonly recommendations: string[];
}

/**
 * Migration operation details
 */
export interface MigrationOperation {
  /** Operation start timestamp */
  readonly startTime: Date;
  
  /** Operation end timestamp */
  readonly endTime: Date;
  
  /** Total duration in milliseconds */
  readonly duration: number;
  
  /** Processing steps completed */
  readonly steps: OperationStep[];
  
  /** Configuration used */
  readonly config: ExtractionConfig;
  
  /** Migration strategy applied */
  readonly strategy: MigrationStrategy;
}

/**
 * Individual operation step details
 */
export interface OperationStep {
  /** Step name */
  readonly name: string;
  
  /** Step description */
  readonly description: string;
  
  /** Step start time */
  readonly startTime: Date;
  
  /** Step end time */
  readonly endTime: Date;
  
  /** Step duration in milliseconds */
  readonly duration: number;
  
  /** Step success status */
  readonly success: boolean;
  
  /** Step-specific data */
  readonly data?: Record<string, unknown>;
  
  /** Errors encountered in step */
  readonly errors?: Error[];
}

/**
 * Migration strategy enumeration
 */
export type MigrationStrategy = 
  | 'direct-translation' 
  | 'pattern-mapping' 
  | 'manual-review-required' 
  | 'hybrid-approach';

/**
 * Performance metrics for migration
 */
export interface MigrationPerformance {
  /** Memory usage in megabytes */
  readonly memoryUsage: number;
  
  /** Peak memory usage in megabytes */
  readonly peakMemoryUsage: number;
  
  /** CPU time used in milliseconds */
  readonly cpuTime: number;
  
  /** File I/O operations count */
  readonly fileOperations: number;
  
  /** Bundle size impact */
  readonly bundleSizeImpact: BundleSizeImpact;
  
  /** Performance warnings */
  readonly warnings: string[];
}

/**
 * Bundle size impact analysis
 */
export interface BundleSizeImpact {
  /** Original component size in bytes */
  readonly originalSize: number;
  
  /** Migrated component size in bytes */
  readonly migratedSize: number;
  
  /** Size change in bytes */
  readonly sizeChange: number;
  
  /** Percentage change */
  readonly percentageChange: number;
  
  /** Meets target threshold */
  readonly meetsTarget: boolean;
}

/**
 * Quality assessment of migrated component
 */
export interface QualityAssessment {
  /** Overall quality score (0-100) */
  readonly overallScore: number;
  
  /** Type safety score (0-100) */
  readonly typeSafety: number;
  
  /** Business logic preservation score (0-100) */
  readonly businessLogicPreservation: number;
  
  /** Code quality score (0-100) */
  readonly codeQuality: number;
  
  /** Performance score (0-100) */
  readonly performance: number;
  
  /** Maintainability score (0-100) */
  readonly maintainability: number;
  
  /** Quality issues found */
  readonly issues: QualityIssue[];
}

/**
 * Quality issue definition
 */
export interface QualityIssue {
  /** Issue severity */
  readonly severity: 'low' | 'medium' | 'high' | 'critical';
  
  /** Issue category */
  readonly category: QualityCategory;
  
  /** Issue description */
  readonly description: string;
  
  /** File location if applicable */
  readonly location?: SourceLocation;
  
  /** Suggested fix */
  readonly suggestedFix?: string;
  
  /** Impact assessment */
  readonly impact: string;
}

/**
 * Quality issue categories
 */
export type QualityCategory = 
  | 'type-safety' 
  | 'business-logic' 
  | 'performance' 
  | 'maintainability' 
  | 'accessibility' 
  | 'security';

/**
 * Source code location information
 */
export interface SourceLocation {
  /** File path */
  readonly file: string;
  
  /** Line number */
  readonly line: number;
  
  /** Column number */
  readonly column: number;
  
  /** Length of problematic code */
  readonly length?: number;
}

/**
 * Generated artifacts from migration
 */
export interface GeneratedArtifacts {
  /** Main component file */
  readonly component: GeneratedFile;
  
  /** Type definition files */
  readonly types: GeneratedFile[];
  
  /** Test files */
  readonly tests: GeneratedFile[];
  
  /** Documentation files */
  readonly documentation: GeneratedFile[];
  
  /** Example files */
  readonly examples: GeneratedFile[];
  
  /** Supporting utility files */
  readonly utilities: GeneratedFile[];
}

/**
 * Generated file information
 */
export interface GeneratedFile {
  /** File path */
  readonly path: string;
  
  /** File content */
  readonly content: string;
  
  /** File size in bytes */
  readonly size: number;
  
  /** File type */
  readonly type: GeneratedFileType;
  
  /** Generation timestamp */
  readonly generatedAt: Date;
}

/**
 * Types of generated files
 */
export type GeneratedFileType = 
  | 'component' 
  | 'types' 
  | 'test' 
  | 'documentation' 
  | 'example' 
  | 'utility' 
  | 'config';

/**
 * Migration issue encountered during processing
 */
export interface MigrationIssue {
  /** Issue severity level */
  readonly severity: 'info' | 'warning' | 'error' | 'critical';
  
  /** Issue category */
  readonly category: IssueCategory;
  
  /** Human-readable issue description */
  readonly message: string;
  
  /** Source location if applicable */
  readonly location?: SourceLocation;
  
  /** Error details if applicable */
  readonly error?: Error;
  
  /** Suggested resolution */
  readonly resolution?: string;
  
  /** Whether issue blocks migration */
  readonly blocking: boolean;
}

/**
 * Migration issue categories
 */
export type IssueCategory = 
  | 'parsing' 
  | 'type-analysis' 
  | 'business-logic-extraction' 
  | 'component-generation' 
  | 'validation' 
  | 'file-system' 
  | 'configuration';

// ============================================================================
// VALIDATION TYPES
// ============================================================================

/**
 * Validation rule definition
 */
export interface ValidationRule {
  /** Rule name */
  readonly name: string;
  
  /** Rule description */
  readonly description: string;
  
  /** Validation function */
  readonly validator: ValidationFunction;
  
  /** Error message template */
  readonly errorMessage: string;
  
  /** Rule severity */
  readonly severity: 'warning' | 'error';
}

/**
 * Validation function type
 */
export type ValidationFunction = (value: unknown) => boolean;

/**
 * Validation result
 */
export interface ValidationResult {
  /** Validation success status */
  readonly valid: boolean;
  
  /** Validation errors */
  readonly errors: ValidationError[];
  
  /** Validation warnings */
  readonly warnings: ValidationWarning[];
  
  /** Overall validation score */
  readonly score: number;
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Error code */
  readonly code: string;
  
  /** Error message */
  readonly message: string;
  
  /** Field or property path */
  readonly path: string;
  
  /** Invalid value */
  readonly value: unknown;
  
  /** Suggested fix */
  readonly fix?: string;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  /** Warning code */
  readonly code: string;
  
  /** Warning message */
  readonly message: string;
  
  /** Field or property path */
  readonly path: string;
  
  /** Improvement suggestion */
  readonly suggestion?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deep readonly utility type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Extract keys of a specific type from an interface
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Branded type for additional type safety
 */
export type Brand<T, B> = T & { readonly __brand: B };

/**
 * Component ID branded string type
 */
export type ComponentId = Brand<string, 'ComponentId'>;

/**
 * File path branded string type
 */
export type FilePath = Brand<string, 'FilePath'>;

/**
 * Migration operation ID
 */
export type OperationId = Brand<string, 'OperationId'>;

// ============================================================================
// REACT COMPONENT TYPES
// ============================================================================

/**
 * Generic React component props with children
 */
export interface BaseComponentProps {
  /** React children */
  readonly children?: ReactNode;
  
  /** CSS class name */
  readonly className?: string;
  
  /** Inline styles */
  readonly style?: React.CSSProperties;
  
  /** HTML data attributes */
  readonly [key: `data-${string}`]: string | undefined;
}

/**
 * Props for components that can be disabled
 */
export interface DisableableProps {
  /** Whether component is disabled */
  readonly disabled?: boolean;
}

/**
 * Props for components with loading states
 */
export interface LoadingProps {
  /** Whether component is in loading state */
  readonly loading?: boolean;
  
  /** Loading message */
  readonly loadingMessage?: string;
}

/**
 * Props for components with error states
 */
export interface ErrorProps {
  /** Error object */
  readonly error?: Error | null;
  
  /** Error message override */
  readonly errorMessage?: string;
  
  /** Error recovery callback */
  readonly onErrorRecovery?: () => void;
}

/**
 * Combined utility props for enhanced components
 */
export interface EnhancedComponentProps 
  extends BaseComponentProps, 
          DisableableProps, 
          LoadingProps, 
          ErrorProps {}

// ============================================================================
// NOTE: All types are exported inline above for better tree-shaking
// ============================================================================