/**
 * Migration Job Orchestrator
 *
 * Orchestrates the complete migration process for components from DAISY v1 to Configurator v2.
 *
 * @fileoverview Migration job orchestrator
 * @version 1.0.0
 */

import type { ComponentDefinition, ExtractionConfig, MigrationResult } from '@/types';
import { ComponentDiscoveryService } from './extractors/discovery';
import { V1ComponentExtractor } from './extractors/v1-extractor';
import { ConfiguratorTransformer } from './transformers/configurator-transformer';
import { V2ComponentGenerator } from './generators/v2-generator';
import { MigrationValidator } from './validators/migration-validator';
import { PerformanceMonitor } from '@/utils/performance-monitor';
import { FileSystemManager } from '@/utils/filesystem';
import { getGlobalLogger } from '@/utils/logging';

export interface MigrationJobConfig {
  readonly config: ExtractionConfig;
  readonly componentName?: string;
  readonly dryRun?: boolean;
}

export interface MigrationJobResult {
  readonly results: MigrationResult[];
  readonly summary: MigrationSummary;
}

export interface MigrationSummary {
  readonly total: number;
  readonly successful: number;
  readonly failed: number;
  readonly duration: number;
  readonly averageTime: number;
}

export class MigrationJob {
  private readonly config: ExtractionConfig;
  private readonly logger = getGlobalLogger('MigrationJob');
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly fileManager: FileSystemManager;

  constructor(jobConfig: MigrationJobConfig) {
    this.config = jobConfig.config;
    this.performanceMonitor = new PerformanceMonitor();
    this.fileManager = new FileSystemManager();
  }

  public async execute(): Promise<MigrationJobResult> {
    const startTime = Date.now();
    this.logger.info('Starting migration job');

    const discoveryService = new ComponentDiscoveryService({
      extractionConfig: this.config,
    });

    const discovery = await discoveryService.discoverComponents();
    const results: MigrationResult[] = [];

    for (const component of discovery.components) {
      const result = await this.migrateComponent(component);
      results.push(result);
    }

    const summary: MigrationSummary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      duration: Date.now() - startTime,
      averageTime: this.performanceMonitor.getAverageDuration(),
    };

    this.logger.info('Migration job completed', {
      total: summary.total,
      successful: summary.successful,
      failed: summary.failed,
      duration: summary.duration,
    });

    return { results, summary };
  }

  private async migrateComponent(component: ComponentDefinition): Promise<MigrationResult> {
    const perfStart = this.performanceMonitor.startMonitoring(component.name);

    try {
      const sourceCode = await this.fileManager.readFile(
        `${this.config.sourcePath}/${component.sourcePath}`
      );

      const extractor = new V1ComponentExtractor(this.config);
      await extractor.extractComponent(component);

      const transformer = new ConfiguratorTransformer();
      const transformation = await transformer.transform(component, sourceCode);

      const generator = new V2ComponentGenerator(this.config);
      const generation = await generator.generate(transformation, sourceCode);

      const validator = new MigrationValidator(this.config);
      const validation = await validator.validate(component, transformation, generation);

      const performance = this.performanceMonitor.endMonitoring(component.name, perfStart);

      return {
        success: validation.valid,
        component,
        operation: {
          startTime: new Date(perfStart),
          endTime: new Date(performance.endTime),
          duration: performance.duration,
          steps: [],
          config: this.config,
          strategy: transformation.strategy,
        },
        performance: {
          memoryUsage: performance.memoryUsage,
          peakMemoryUsage: performance.memoryUsage,
          cpuTime: 0,
          fileOperations: 0,
          bundleSizeImpact: {
            originalSize: 0,
            migratedSize: 0,
            sizeChange: 0,
            percentageChange: 0,
            meetsTarget: true,
          },
          warnings: [],
        },
        quality: {
          overallScore: validation.score,
          typeSafety: 100,
          businessLogicPreservation: transformation.businessLogicPreserved ? 100 : 0,
          codeQuality: 100,
          performance: 100,
          maintainability: 100,
          issues: validation.errors.map(e => ({
            severity: 'high' as const,
            category: 'business-logic' as const,
            description: e.message,
            impact: 'Critical issue',
          })),
        },
        artifacts: generation.artifacts,
        issues: [],
        recommendations: [],
      };
    } catch (error) {
      this.performanceMonitor.endMonitoring(component.name, perfStart);
      throw error;
    }
  }
}

export function createMigrationJob(config: MigrationJobConfig): MigrationJob {
  return new MigrationJob(config);
}
