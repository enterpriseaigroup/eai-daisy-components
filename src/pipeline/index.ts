/**
 * DAISY v1 Component Extraction Pipeline - Complete System
 *
 * Comprehensive pipeline orchestration layer that coordinates extraction, transformation,
 * and validation of DAISY v1 components to Configurator v2 architecture.
 *
 * Includes Phase 4: Advanced Pipeline Orchestration & CLI Interface
 *
 * @fileoverview Complete pipeline orchestration and exports
 * @version 4.0.0
 */

import { mkdir, writeFile } from 'fs/promises';
import { dirname, join } from 'path';
import type {
  BundleSizeImpact,
  ComponentDefinition,
  ExtractionConfig,
  GeneratedArtifacts,
  GeneratedFile,
  MigrationIssue,
  MigrationOperation,
  MigrationPerformance,
  MigrationResult,
  OperationStep,
  QualityAssessment,
} from '../types/index.js';
import { ComponentExtractor, type ExtractionResult } from './extractor.js';
import {
  BusinessLogicTransformer,
  type TransformationResult,
} from './transformer.js';
import { type ComparisonResult, EquivalencyValidator } from './validator.js';
import { getGlobalLogger } from '../utils/logging.js';

// ============================================================================
// PIPELINE TYPES
// ============================================================================

/**
 * Pipeline execution options
 */
export interface PipelineOptions {
  /** Extraction configuration */
  readonly config: ExtractionConfig;

  /** Whether to save artifacts */
  readonly saveArtifacts?: boolean;

  /** Whether to generate reports */
  readonly generateReports?: boolean;
}

/**
 * Pipeline execution result
 */
export interface PipelineExecutionResult {
  /** Total components processed */
  readonly totalComponents: number;

  /** Successfully migrated components */
  readonly successfulMigrations: number;

  /** Failed migrations */
  readonly failedMigrations: number;

  /** Individual migration results */
  readonly results: MigrationResult[];

  /** Overall execution time */
  readonly executionTime: number;

  /** Pipeline performance metrics */
  readonly performance: PipelinePerformanceMetrics;
}

/**
 * Pipeline performance metrics
 */
export interface PipelinePerformanceMetrics {
  /** Total execution time in milliseconds */
  readonly totalTime: number;

  /** Average time per component */
  readonly averageTime: number;

  /** Peak memory usage */
  readonly peakMemory: number;

  /** Total file operations */
  readonly fileOperations: number;
}

// ============================================================================
// MIGRATION PIPELINE CLASS
// ============================================================================

/**
 * Main migration pipeline orchestrator
 *
 * Coordinates the complete migration workflow from extraction through
 * validation and artifact generation.
 */
export class MigrationPipeline {
  private readonly logger = getGlobalLogger('MigrationPipeline');
  private readonly extractor: ComponentExtractor;
  private readonly transformer: BusinessLogicTransformer;
  private readonly validator: EquivalencyValidator;

  constructor() {
    this.extractor = new ComponentExtractor();
    this.transformer = new BusinessLogicTransformer();
    this.validator = new EquivalencyValidator();
  }

  /**
   * Execute complete migration pipeline
   *
   * @param options - Pipeline execution options
   * @returns Pipeline execution result
   */
  public async execute(
    options: PipelineOptions,
  ): Promise<PipelineExecutionResult> {
    const startTime = Date.now();
    this.logger.info('Starting migration pipeline execution');

    const { config, saveArtifacts = true, generateReports = true } = options;

    try {
      // Extract components from source
      this.logger.info(`Extracting components from ${config.sourcePath}`);
      const extractions = await this.extractor.extractFromDirectory(
        config.sourcePath,
        {
          deepAnalysis: true,
          extractDocs: config.output.generateDocs,
          analyzeDependencies: true,
        },
      );

      const results: MigrationResult[] = [];
      let successCount = 0;
      let failCount = 0;

      // Process each extracted component
      for (const extraction of extractions) {
        if (!extraction.success) {
          failCount++;
          results.push(this.createFailedMigrationResult(extraction, config));
          continue;
        }

        try {
          // Migrate individual component
          const migrationResult = await this.migrateComponent(
            extraction,
            config,
            saveArtifacts,
          );

          results.push(migrationResult);

          if (migrationResult.success) {
            successCount++;
          } else {
            failCount++;
          }
        } catch (error) {
          this.logger.error(
            `Failed to migrate component ${extraction.component.name}`,
            error as Error,
          );
          failCount++;
          results.push(
            this.createFailedMigrationResult(extraction, config, error as Error),
          );
        }
      }

      const executionTime = Date.now() - startTime;

      // Generate reports if requested
      if (generateReports) {
        await this.generateReports(results, config, executionTime);
      }

      const pipelineResult: PipelineExecutionResult = {
        totalComponents: extractions.length,
        successfulMigrations: successCount,
        failedMigrations: failCount,
        results,
        executionTime,
        performance: this.calculatePerformanceMetrics(results, executionTime),
      };

      this.logger.info('Pipeline execution completed', {
        total: pipelineResult.totalComponents,
        successful: pipelineResult.successfulMigrations,
        failed: pipelineResult.failedMigrations,
        duration: executionTime,
      });

      return pipelineResult;
    } catch (error) {
      this.logger.error('Pipeline execution failed', error as Error);
      throw error;
    }
  }

  /**
   * Migrate a single component
   *
   * @param extraction - Extraction result
   * @param config - Migration configuration
   * @param saveArtifacts - Whether to save artifacts
   * @returns Migration result
   */
  public async migrateComponent(
    extraction: ExtractionResult,
    config: ExtractionConfig,
    saveArtifacts: boolean = true,
  ): Promise<MigrationResult> {
    const component = extraction.component;
    const operationStart = new Date();
    const steps: OperationStep[] = [];

    this.logger.info(`Migrating component ${component.name}`);

    try {
      // Step 1: Transform component
      const transformStart = Date.now();
      const transformation = await this.transformer.transformComponent(
        component,
        {
          targetVersion: '2.0.0',
          transformAPICalls: true,
          addConfiguratorIntegration: true,
        },
      );

      steps.push({
        name: 'transform',
        description: 'Transform business logic to Configurator architecture',
        startTime: new Date(transformStart),
        endTime: new Date(),
        duration: Date.now() - transformStart,
        success: transformation.success,
        data: {
          transformations: transformation.transformations.length,
          strategy: transformation.strategy,
        },
      });

      if (!transformation.success) {
        throw new Error('Transformation failed');
      }

      // Step 2: Validate equivalency (comparing against original)
      const validationStart = Date.now();
      const comparison = await this.validator.compare(
        component,
        transformation.component,
        {
          strict: config.validation.strict,
          validateBusinessLogic: config.validation.businessLogicPreservation,
          validateTypes: config.validation.typescript,
        },
      );

      steps.push({
        name: 'validate',
        description: 'Validate functional equivalency',
        startTime: new Date(validationStart),
        endTime: new Date(),
        duration: Date.now() - validationStart,
        success: comparison.validation.valid,
        data: {
          businessLogicScore: comparison.businessLogicScore,
          typeSafetyScore: comparison.typeSafetyScore,
          equivalent: comparison.equivalent,
        },
      });

      // Step 3: Assess quality
      const qualityStart = Date.now();
      const quality = await this.validator.assessQuality(
        component,
        transformation.component,
      );

      steps.push({
        name: 'quality-assessment',
        description: 'Assess component quality',
        startTime: new Date(qualityStart),
        endTime: new Date(),
        duration: Date.now() - qualityStart,
        success: quality.overallScore >= 70,
        data: {
          overallScore: quality.overallScore,
          issues: quality.issues.length,
        },
      });

      // Step 4: Generate artifacts
      const artifactsStart = Date.now();
      const artifacts = await this.generateArtifacts(
        component,
        transformation,
        config,
        saveArtifacts,
      );

      steps.push({
        name: 'generate-artifacts',
        description: 'Generate migration artifacts',
        startTime: new Date(artifactsStart),
        endTime: new Date(),
        duration: Date.now() - artifactsStart,
        success: true,
        data: {
          filesGenerated: this.countArtifacts(artifacts),
        },
      });

      // Build migration operation details
      const operationEnd = new Date();
      const operation: MigrationOperation = {
        startTime: operationStart,
        endTime: operationEnd,
        duration: operationEnd.getTime() - operationStart.getTime(),
        steps,
        config,
        strategy: transformation.strategy,
      };

      // Calculate performance metrics
      const performance: MigrationPerformance = {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        peakMemoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuTime: operation.duration,
        fileOperations: saveArtifacts ? this.countArtifacts(artifacts) : 0,
        bundleSizeImpact: this.calculateBundleSizeImpact(
          component,
          transformation,
        ),
        warnings: [],
      };

      // Collect issues
      const issues: MigrationIssue[] = [
        ...comparison.validation.errors.map(e => this.createIssueFromError(e)),
        ...comparison.validation.warnings.map(w =>
          this.createIssueFromWarning(w),
        ),
        ...transformation.warnings.map(w => ({
          severity: 'warning' as const,
          category: 'component-generation' as const,
          message: w,
          blocking: false,
        })),
      ];

      // Generate recommendations
      const recommendations = this.generateRecommendations(quality, comparison);

      const result: MigrationResult = {
        success: comparison.equivalent && quality.overallScore >= 70,
        component: transformation.component,
        operation,
        performance,
        quality,
        artifacts,
        issues,
        recommendations,
      };

      this.logger.info(`Successfully migrated component ${component.name}`, {
        success: result.success,
        qualityScore: quality.overallScore,
        issues: issues.length,
      });

      return result;
    } catch (error) {
      this.logger.error(
        `Migration failed for component ${component.name}`,
        error as Error,
      );

      const operationEnd = new Date();
      const operation: MigrationOperation = {
        startTime: operationStart,
        endTime: operationEnd,
        duration: operationEnd.getTime() - operationStart.getTime(),
        steps,
        config,
        strategy: 'manual-review-required',
      };

      const performance: MigrationPerformance = {
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        peakMemoryUsage: process.memoryUsage().heapUsed / 1024 / 1024,
        cpuTime: operation.duration,
        fileOperations: 0,
        bundleSizeImpact: {
          originalSize: 0,
          migratedSize: 0,
          sizeChange: 0,
          percentageChange: 0,
          meetsTarget: false,
        },
        warnings: [error instanceof Error ? error.message : 'Unknown error'],
      };

      return {
        success: false,
        component,
        operation,
        performance,
        quality: this.createDefaultQualityAssessment(),
        artifacts: this.createEmptyArtifacts(),
        issues: [
          {
            severity: 'critical',
            category: 'component-generation',
            message: error instanceof Error ? error.message : 'Unknown error',
            blocking: true,
            error: error as Error,
          },
        ],
        recommendations: ['Manual review required due to migration failure'],
      };
    }
  }

  // ==========================================================================
  // PRIVATE HELPER METHODS
  // ==========================================================================

  /**
   * Generate migration artifacts
   */
  private async generateArtifacts(
    component: ComponentDefinition,
    transformation: TransformationResult,
    config: ExtractionConfig,
    save: boolean,
  ): Promise<GeneratedArtifacts> {
    const componentFile: GeneratedFile = {
      path: join(config.outputPath, `${component.name}.tsx`),
      content: transformation.code,
      size: Buffer.byteLength(transformation.code, 'utf-8'),
      type: 'component',
      generatedAt: new Date(),
    };

    const artifacts: GeneratedArtifacts = {
      component: componentFile,
      types: [],
      tests: [],
      documentation: [],
      examples: [],
      utilities: [],
    };

    if (save) {
      await this.saveArtifact(componentFile);
    }

    return artifacts;
  }

  /**
   * Save artifact to filesystem
   */
  private async saveArtifact(artifact: GeneratedFile): Promise<void> {
    try {
      await mkdir(dirname(artifact.path), { recursive: true });
      await writeFile(artifact.path, artifact.content, 'utf-8');
      this.logger.debug(`Saved artifact: ${artifact.path}`);
    } catch (error) {
      this.logger.error(
        `Failed to save artifact: ${artifact.path}`,
        error as Error,
      );
      throw error;
    }
  }

  /**
   * Generate migration reports
   */
  private async generateReports(
    results: MigrationResult[],
    config: ExtractionConfig,
    executionTime: number,
  ): Promise<void> {
    this.logger.info('Generating migration reports');

    const reportPath = join(config.outputPath, 'migration-report.json');
    const report = {
      generatedAt: new Date().toISOString(),
      executionTime,
      totalComponents: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      averageQuality:
        results.reduce((sum, r) => sum + r.quality.overallScore, 0) /
        results.length,
      components: results.map(r => ({
        name: r.component.name,
        success: r.success,
        quality: r.quality.overallScore,
        issues: r.issues.length,
        duration: r.operation.duration,
      })),
    };

    await this.saveArtifact({
      path: reportPath,
      content: JSON.stringify(report, null, 2),
      size: 0,
      type: 'utility',
      generatedAt: new Date(),
    });
  }

  /**
   * Calculate bundle size impact
   */
  private calculateBundleSizeImpact(
    component: ComponentDefinition,
    transformation: TransformationResult,
  ): BundleSizeImpact {
    const originalSize = component.metadata.performance?.bundleSize || 0;
    const migratedSize = Buffer.byteLength(transformation.code, 'utf-8');
    const sizeChange = migratedSize - originalSize;
    const percentageChange =
      originalSize > 0 ? (sizeChange / originalSize) * 100 : 0;

    return {
      originalSize,
      migratedSize,
      sizeChange,
      percentageChange,
      meetsTarget: percentageChange <= 20, // 20% increase threshold
    };
  }

  /**
   * Generate recommendations based on quality and comparison
   */
  private generateRecommendations(
    quality: QualityAssessment,
    comparison: ComparisonResult,
  ): string[] {
    const recommendations: string[] = [];

    if (quality.businessLogicPreservation < 90) {
      recommendations.push(
        'Review business logic preservation - some functions may be missing',
      );
    }

    if (quality.typeSafety < 90) {
      recommendations.push(
        'Review type definitions - some props may have changed',
      );
    }

    if (comparison.differences.some(d => d.severity === 'error')) {
      recommendations.push(
        'Address critical differences before production deployment',
      );
    }

    if (quality.overallScore < 70) {
      recommendations.push('Consider manual review due to low quality score');
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Component migration successful - ready for testing',
      );
    }

    return recommendations;
  }

  /**
   * Calculate pipeline performance metrics
   */
  private calculatePerformanceMetrics(
    results: MigrationResult[],
    totalTime: number,
  ): PipelinePerformanceMetrics {
    const avgTime = results.length > 0 ? totalTime / results.length : 0;
    const peakMemory = Math.max(
      ...results.map(r => r.performance.peakMemoryUsage),
    );
    const fileOps = results.reduce(
      (sum, r) => sum + r.performance.fileOperations,
      0,
    );

    return {
      totalTime,
      averageTime: avgTime,
      peakMemory,
      fileOperations: fileOps,
    };
  }

  /**
   * Count total artifacts
   */
  private countArtifacts(artifacts: GeneratedArtifacts): number {
    return (
      1 + // component
      artifacts.types.length +
      artifacts.tests.length +
      artifacts.documentation.length +
      artifacts.examples.length +
      artifacts.utilities.length
    );
  }

  /**
   * Create failed migration result from extraction failure
   */
  private createFailedMigrationResult(
    extraction: ExtractionResult,
    config: ExtractionConfig,
    error?: Error,
  ): MigrationResult {
    const now = new Date();

    return {
      success: false,
      component: extraction.component,
      operation: {
        startTime: now,
        endTime: now,
        duration: 0,
        steps: [],
        config,
        strategy: 'manual-review-required',
      },
      performance: {
        memoryUsage: 0,
        peakMemoryUsage: 0,
        cpuTime: 0,
        fileOperations: 0,
        bundleSizeImpact: {
          originalSize: 0,
          migratedSize: 0,
          sizeChange: 0,
          percentageChange: 0,
          meetsTarget: false,
        },
        warnings: extraction.errors,
      },
      quality: this.createDefaultQualityAssessment(),
      artifacts: this.createEmptyArtifacts(),
      issues: [
        ...extraction.errors.map(e => ({
          severity: 'error' as const,
          category: 'parsing' as const,
          message: e,
          blocking: true,
          ...(error instanceof Error ? { error } : {}),
        })),
      ],
      recommendations: ['Fix extraction errors before attempting migration'],
    };
  }

  /**
   * Create default quality assessment
   */
  private createDefaultQualityAssessment(): QualityAssessment {
    return {
      overallScore: 0,
      typeSafety: 0,
      businessLogicPreservation: 0,
      codeQuality: 0,
      performance: 0,
      maintainability: 0,
      issues: [],
    };
  }

  /**
   * Create empty artifacts structure
   */
  private createEmptyArtifacts(): GeneratedArtifacts {
    return {
      component: {
        path: '',
        content: '',
        size: 0,
        type: 'component',
        generatedAt: new Date(),
      },
      types: [],
      tests: [],
      documentation: [],
      examples: [],
      utilities: [],
    };
  }

  /**
   * Create migration issue from validation error
   */
  private createIssueFromError(error: {
    code: string;
    message: string;
    path: string;
  }): MigrationIssue {
    return {
      severity: 'error',
      category: 'validation',
      message: error.message,
      blocking: true,
    };
  }

  /**
   * Create migration issue from validation warning
   */
  private createIssueFromWarning(warning: {
    code: string;
    message: string;
    path: string;
  }): MigrationIssue {
    return {
      severity: 'warning',
      category: 'validation',
      message: warning.message,
      blocking: false,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Re-export pipeline components
export { ComponentExtractor, type ExtractionResult } from './extractor';
export {
  BusinessLogicTransformer,
  type TransformationResult,
} from './transformer';
export { EquivalencyValidator, type ComparisonResult } from './validator';

// Factory function
export function createPipeline(): MigrationPipeline {
  return new MigrationPipeline();
}

// Quick execution helper
export async function executePipeline(
  options: PipelineOptions,
): Promise<PipelineExecutionResult> {
  const pipeline = createPipeline();
  return pipeline.execute(options);
}

// ============================================================================
// PHASE 4 ADVANCED PIPELINE EXPORTS - MAIN CLASSES
// ============================================================================

/**
 * Advanced Pipeline Orchestrator for comprehensive component transformation
 */
export { PipelineOrchestrator } from './orchestrator.js';

/**
 * Command Line Interface for pipeline operations
 */
export { CLIApplication } from './cli.js';

/**
 * Advanced Component Transformer with Configurator v2 integration
 */
export { ComponentTransformer } from './component-transformer.js';

/**
 * Output Generator for organized file generation and validation
 */
export { OutputGenerator } from './output-generator.js';

/**
 * Create a complete Phase 4 pipeline instance
 */
export async function createAdvancedPipeline() {
  const { PipelineOrchestrator } = await import('./orchestrator.js');
  return new PipelineOrchestrator();
}

/**
 * Create a CLI application instance
 */
export async function createCLIApplication() {
  const { CLIApplication } = await import('./cli.js');
  return new CLIApplication();
}

/**
 * Phase 4 pipeline version and capabilities
 */
export const PHASE_4_VERSION = '4.0.0';
export const PHASE_4_CAPABILITIES = [
  'Advanced Pipeline Orchestration',
  'Comprehensive CLI Interface',
  'Configurator v2 Integration',
  'Business Logic Extraction',
  'Automated Output Generation',
  'Content Validation',
  'Progress Tracking',
  'Error Recovery',
] as const;
