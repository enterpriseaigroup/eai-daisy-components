/**
 * Batch Migration Orchestrator
 *
 * Orchestrates migration of all DAISY v1 components with dependency resolution,
 * parallel processing, and comprehensive error handling.
 *
 * @fileoverview Batch migration orchestration
 * @version 1.0.0
 */

import { Command } from 'commander';
import { ComponentDiscoveryEngine } from '@/engine/discovery';
import { DependencyResolver } from '@/utils/dependency-resolver';
import PipelineOrchestrator from '@/pipeline/orchestrator';
import { MigrationTracker } from '@/utils/migration-tracker';
import { createSimpleLogger, getGlobalLogger } from '@/utils/logging';
import type {
  ComponentDefinition,
  ExtractionConfig,
  MigrationStatus,
} from '@/types';

const logger = getGlobalLogger('MigrateAll');

/**
 * Batch migration options
 */
export interface BatchMigrationOptions {
  /** Source directory for DAISY v1 components */
  sourceDir: string;
  /** Output directory for migrated components */
  outputDir: string;
  /** Baseline preservation directory */
  baselineDir: string;
  /** Maximum parallel migrations */
  parallelism: number;
  /** Continue on error */
  continueOnError: boolean;
  /** Dry run mode */
  dryRun: boolean;
  /** Filter by tier */
  tier?: string;
  /** Filter by complexity */
  complexity?: string;
}

/**
 * Batch migration result
 */
export interface BatchMigrationResult {
  total: number;
  successful: number;
  failed: number;
  skipped: number;
  components: Array<{
    id: string;
    name: string;
    status: MigrationStatus;
    error?: string;
  }>;
  duration: number;
}

/**
 * Batch migration orchestrator
 */
export class BatchMigrationOrchestrator {
  private discovery?: ComponentDiscoveryEngine;
  private readonly resolver: DependencyResolver;
  private readonly orchestrator: PipelineOrchestrator;
  private readonly tracker: MigrationTracker;
  private readonly logger = createSimpleLogger('BatchMigrationOrchestrator');

  constructor() {
    this.orchestrator = new PipelineOrchestrator();
    this.resolver = new DependencyResolver();
    this.tracker = new MigrationTracker();
  }

  /**
   * Initialize discovery engine with config
   */
  private initializeDiscovery(sourceDir: string): void {
    const config: ExtractionConfig = {
      sourcePath: sourceDir,
      outputPath: '',
      preserveBaseline: true,
      processing: {
        mode: 'parallel',
        concurrency: 4,
        continueOnError: false,
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoffMultiplier: 2,
          retryableOperations: ['file-read', 'file-write', 'ast-parsing'],
        },
        filters: {
          include: ['**/*.tsx', '**/*.jsx'],
          exclude: ['**/*.test.*', '**/*.spec.*'],
          types: ['functional', 'class', 'higher-order'],
          complexity: ['simple', 'moderate', 'complex', 'critical'],
          custom: [],
        },
      },
      performance: {
        memoryLimit: 1024,
        timeoutPerComponent: 30000,
        maxBundleSizeIncrease: 20,
        monitoring: true,
      },
      validation: {
        strict: false,
        typescript: true,
        eslint: false,
        componentStructure: true,
        businessLogicPreservation: true,
      },
      output: {
        generateDeclarations: false,
        generateDocs: false,
        generateExamples: false,
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
        format: 'simple',
        timestamps: true,
        stackTraces: true,
      },
    };
    this.discovery = new ComponentDiscoveryEngine(config, this.logger);
  }

  /**
   * Execute batch migration
   */
  public async migrate(
    options: BatchMigrationOptions
  ): Promise<BatchMigrationResult> {
    const startTime = Date.now();

    logger.info('Starting batch migration', { options });

    try {
      // Initialize discovery engine
      this.initializeDiscovery(options.sourceDir);

      // Discover components
      logger.info('Discovering components...');
      if (!this.discovery) {
        throw new Error('Discovery engine not initialized');
      }
      const discoveryResult = await this.discovery.discoverComponents();

      if (discoveryResult.errors.length > 0) {
        throw new Error(
          `Discovery failed: ${discoveryResult.errors.map(e => e.message).join(', ')}`
        );
      }

      let components = discoveryResult.components;

      // Apply filters
      components = this.applyFilters(components, options);

      logger.info(`Found ${components.length} components to migrate`);

      // Resolve dependencies
      logger.info('Resolving dependencies...');
      const resolutionResult = this.resolver.resolve(components);

      if (!resolutionResult.success) {
        logger.error('Dependency resolution failed');
        resolutionResult.errors.forEach(err => logger.error(err));

        if (!options.continueOnError) {
          throw new Error('Circular dependencies detected');
        }
      }

      const orderedComponents = resolutionResult.success
        ? resolutionResult.orderedComponents
        : components;

      // Start migration session
      const sessionId = this.tracker.startSession({
        type: 'batch',
        concurrency: options.parallelism,
        continueOnError: options.continueOnError,
        outputDirectory: options.outputDir,
        reportFormats: ['json', 'markdown'],
      });

      logger.info(`Started migration session: ${sessionId}`);

      // Migrate components
      const result = await this.migrateComponents(
        orderedComponents,
        options,
        sessionId
      );

      // Complete session
      await this.tracker.endSession(sessionId);

      // Generate reports
      await this.generateReports(sessionId, options.outputDir);

      const duration = Date.now() - startTime;
      logger.info('Batch migration completed', {
        ...result,
        duration: `${(duration / 1000).toFixed(2)}s`,
      });

      return { ...result, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(
        'Batch migration failed: ' + errorMessage + ` (duration: ${duration}ms)`
      );
      throw error;
    }
  }

  /**
   * Migrate components in batches
   */
  private async migrateComponents(
    components: ComponentDefinition[],
    options: BatchMigrationOptions,
    sessionId: string
  ): Promise<Omit<BatchMigrationResult, 'duration'>> {
    const result: Omit<BatchMigrationResult, 'duration'> = {
      total: components.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      components: [],
    };

    // Process in batches for parallel execution
    const batchSize = options.parallelism;
    for (let i = 0; i < components.length; i += batchSize) {
      const batch = components.slice(i, i + batchSize);

      logger.info(`Processing batch ${Math.floor(i / batchSize) + 1}`, {
        components: batch.map(c => c.name),
      });

      // Process batch in parallel
      const batchResults = await Promise.allSettled(
        batch.map(component =>
          this.migrateComponent(component, options, sessionId)
        )
      );

      // Aggregate results
      for (let j = 0; j < batchResults.length; j++) {
        const component = batch[j];
        const batchResult = batchResults[j];

        if (!component || !batchResult) {
          continue;
        }

        if (batchResult.status === 'fulfilled' && batchResult.value.success) {
          result.successful++;
          result.components.push({
            id: component.id,
            name: component.name,
            status: 'completed',
          });
        } else {
          result.failed++;
          const error =
            batchResult.status === 'rejected'
              ? (batchResult.reason as Error).message ||
                String(batchResult.reason)
              : batchResult.value.error;

          result.components.push({
            id: component.id,
            name: component.name,
            status: 'failed',
            error: String(error),
          });

          if (!options.continueOnError) {
            throw new Error(`Migration failed for ${component.name}: ${error}`);
          }
        }
      }
    }

    return result;
  }

  /**
   * Migrate a single component
   */
  private async migrateComponent(
    component: ComponentDefinition,
    options: BatchMigrationOptions,
    _sessionId: string
  ): Promise<{ success: boolean; error?: string }> {
    if (options.dryRun) {
      logger.info(`[DRY RUN] Would migrate ${component.name}`);
      return { success: true };
    }

    try {
      logger.info(`Migrating ${component.name}...`);

      // Record migration start
      this.tracker.startMigration(component);

      // Execute migration
      const config: ExtractionConfig = {
        sourcePath: options.sourceDir,
        outputPath: options.outputDir,
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
            include: ['**/*.tsx', '**/*.jsx'],
            exclude: ['**/*.test.*', '**/*.spec.*'],
            types: ['functional', 'class', 'higher-order'],
            complexity: ['simple', 'moderate', 'complex', 'critical'],
            custom: [],
          },
        },
        performance: {
          memoryLimit: 1024,
          timeoutPerComponent: 30000,
          maxBundleSizeIncrease: 20,
          monitoring: true,
        },
        validation: {
          strict: false,
          typescript: true,
          eslint: false,
          componentStructure: true,
          businessLogicPreservation: true,
        },
        output: {
          generateDeclarations: false,
          generateDocs: false,
          generateExamples: false,
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
          format: 'simple',
          timestamps: true,
          stackTraces: true,
        },
      };

      const result = await this.orchestrator.execute(config, {
        mode: 'full-pipeline',
      });

      // Record completion
      this.tracker.updateStatus(
        component.id,
        result.success ? 'completed' : 'failed'
      );

      if (!result.success && result.errors.length > 0) {
        const firstError = result.errors[0];
        if (firstError) {
          const error = new Error(firstError.message);
          this.tracker.recordError(component.id, error);
        }
      }

      return { success: result.success };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error(`Failed to migrate ${component.name}: ${errorMessage}`);

      this.tracker.updateStatus(component.id, 'failed');
      const errorObj = error instanceof Error ? error : new Error(errorMessage);
      this.tracker.recordError(component.id, errorObj);

      return { success: false, error: errorMessage };
    }
  }

  /**
   * Apply filters to component list
   */
  private applyFilters(
    components: ComponentDefinition[],
    options: BatchMigrationOptions
  ): ComponentDefinition[] {
    let filtered = components;

    if (options.complexity) {
      filtered = filtered.filter(c => c.complexity === options.complexity);
    }

    return filtered;
  }

  /**
   * Generate migration reports
   */
  private async generateReports(
    sessionId: string,
    outputDir: string
  ): Promise<void> {
    try {
      logger.info('Generating migration reports...');

      // Get session summary
      const summary = this.tracker.getSessionSummary(sessionId);

      // Save reports
      const fs = await import('fs/promises');
      const path = await import('path');

      const reportDir = path.join(outputDir, 'reports');
      await fs.mkdir(reportDir, { recursive: true });

      // Generate JSON report
      const jsonReport = JSON.stringify(summary, null, 2);
      const jsonPath = path.join(
        reportDir,
        `migration-report-${sessionId}.json`
      );
      await fs.writeFile(jsonPath, jsonReport);
      logger.info(`Generated JSON report: ${jsonPath}`);

      // Generate Markdown report
      const markdownReport = this.generateMarkdownReport(summary);
      const mdPath = path.join(reportDir, `migration-report-${sessionId}.md`);
      await fs.writeFile(mdPath, markdownReport);
      logger.info(`Generated Markdown report: ${mdPath}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      logger.error('Failed to generate reports: ' + errorMessage);
    }
  }

  /**
   * Generate markdown report from summary
   */
  private generateMarkdownReport(summary: any): string {
    return `# Migration Report

## Summary
- Session ID: ${summary.sessionId}
- Duration: ${summary.duration}ms
- Total: ${summary.totalComponents}
- Completed: ${summary.completedComponents}
- Failed: ${summary.failedComponents}
- Success Rate: ${summary.successRate}%
- Average Duration: ${summary.averageDuration}ms
`;
  }
}

/**
 * CLI command for batch migration
 */
export function createMigrateAllCommand(): Command {
  const command = new Command('migrate-all');

  command
    .description('Migrate all DAISY v1 components to Configurator v2')
    .requiredOption(
      '-s, --source <dir>',
      'Source directory for DAISY v1 components'
    )
    .requiredOption(
      '-o, --output <dir>',
      'Output directory for migrated components'
    )
    .requiredOption('-b, --baseline <dir>', 'Baseline preservation directory')
    .option('-p, --parallelism <number>', 'Maximum parallel migrations', '4')
    .option('--continue-on-error', 'Continue migration on error', false)
    .option('--dry-run', 'Dry run mode (no actual migration)', false)
    .option('--tier <tier>', 'Filter by tier')
    .option('--complexity <level>', 'Filter by complexity level')
    .action(async options => {
      const orchestrator = new BatchMigrationOrchestrator();

      try {
        const result = await orchestrator.migrate({
          sourceDir: options.source,
          outputDir: options.output,
          baselineDir: options.baseline,
          parallelism: parseInt(options.parallelism, 10),
          continueOnError: options.continueOnError,
          dryRun: options.dryRun,
          tier: options.tier,
          complexity: options.complexity,
        });

        logger.info('Migration completed successfully');
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        logger.error('Migration failed: ' + errorMessage);
        process.exit(1);
      }
    });

  return command;
}
