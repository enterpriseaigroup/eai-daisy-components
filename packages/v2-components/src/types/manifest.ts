/**
 * Generation Manifest Types
 *
 * Tracks the state of V2 component generation for recovery and reporting.
 */

export interface FailedComponent {
  /** Component name that failed generation */
  component: string;
  /** Error message describing the failure */
  error: string;
  /** ISO 8601 timestamp of failure */
  timestamp: string;
  /** Optional stack trace for debugging */
  stack?: string;
}

export interface GenerationConfig {
  /** Baseline directory path */
  baselinePath: string;
  /** Output directory for V2 components */
  outputPath: string;
  /** Whether dry-run mode was enabled */
  dryRun: boolean;
  /** Whether verbose logging was enabled */
  verbose: boolean;
  /** Whether to skip test generation */
  skipTests: boolean;
  /** TypeScript compiler options used */
  compilerOptions?: Record<string, unknown>;
}

export interface GenerationManifest {
  /** List of successfully generated component names */
  successful: string[];
  /** List of failed components with error details */
  failed: FailedComponent[];
  /** Configuration used for this generation run */
  config: GenerationConfig;
  /** ISO 8601 timestamp when generation started */
  startTime: string;
  /** ISO 8601 timestamp when generation completed */
  endTime?: string;
  /** Total duration in milliseconds */
  duration?: number;
  /** Manifest version for compatibility */
  version: string;
}
