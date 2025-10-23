/**
 * Migration Job Orchestrator
 *
 * Orchestrates the complete migration process for components from DAISY v1 to Configurator v2.
 *
 * @fileoverview Migration job orchestrator
 * @version 1.0.0
 */

import type {
  ComponentDefinition,
  ExtractionConfig,
  MigrationResult,
} from '@/types';
import { ComponentDiscoveryService } from './extractors/discovery';
import { V1ComponentExtractor } from './extractors/v1-extractor';
import { ConfiguratorTransformer } from './transformers/configurator-transformer';
import { CSSToTailwindTransformer } from './transformers/css-to-tailwind-transformer';
import { PseudoCodeGenerator } from './transformers/pseudo-code-generator';
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

  private async migrateComponent(
    component: ComponentDefinition,
  ): Promise<MigrationResult> {
    const perfStart = this.performanceMonitor.startMonitoring(component.name);

    try {
      const sourceCode = await this.fileManager.readFile(
        `${this.config.sourcePath}/${component.sourcePath}`,
      );

      const extractor = new V1ComponentExtractor(this.config);
      await extractor.extractComponent(component);

      // Step 1: Convert CSS to Tailwind (ensures TypeScript parseability)
      this.logger.debug(`Converting CSS to Tailwind for ${component.name}`);
      const cssTransformer = new CSSToTailwindTransformer({
        preserveVisualFidelity: true,
        useArbitraryValues: true,
        removeCSSFiles: false,
      });
      const cssTransformResult = await cssTransformer.transform(
        sourceCode,
        `${this.config.sourcePath}/${component.sourcePath}`
      );

      // Step 2: Generate pseudo-code documentation (for v1 baseline)
      this.logger.debug(`Generating pseudo-code documentation for ${component.name}`);
      const pseudoCodeGen = new PseudoCodeGenerator({
        includeWhySection: true,
        includeWhatSection: true,
        includeCallsSection: true,
        includeDataFlowSection: true,
        includeDependenciesSection: true,
        includeSpecialBehaviorSection: true,
        addMigrationNotes: false, // v1 baseline, no migration notes yet
      });
      const v1Documentation = await pseudoCodeGen.generate(
        cssTransformResult.transformedCode,
        component.name,
        false // isV2Component = false
      );

      // Use documented v1 code for transformation
      const documentedSourceCode = v1Documentation.success
        ? v1Documentation.documentedCode
        : cssTransformResult.transformedCode;

      // Step 3: Main configurator transformation
      const transformer = new ConfiguratorTransformer();
      const transformation = await transformer.transform(component, documentedSourceCode);

      // Step 4: Generate V2 component
      const generator = new V2ComponentGenerator(this.config);
      const generation = await generator.generate(transformation, documentedSourceCode);

      // Step 5: Add pseudo-code documentation to v2 component (with migration notes)
      this.logger.debug(`Adding migration documentation to v2 ${component.name}`);
      const v2PseudoCodeGen = new PseudoCodeGenerator({
        includeWhySection: true,
        includeWhatSection: true,
        includeCallsSection: true,
        includeDataFlowSection: true,
        includeDependenciesSection: true,
        includeSpecialBehaviorSection: true,
        addMigrationNotes: true, // v2 component, add migration notes
      });

      // Apply documentation to generated v2 component
      const v2Component = generation.artifacts.component;
      if (v2Component) {
        const v2Documentation = await v2PseudoCodeGen.generate(
          v2Component.content,
          component.name,
          true, // isV2Component = true
        );
        if (v2Documentation.success) {
          // Note: GeneratedFile.content is readonly, update would need to recreate the object
          // For now, documentation is generated but not re-integrated
        }
      }

      const validator = new MigrationValidator(this.config);
      const validation = await validator.validate(
        component,
        transformation,
        generation,
      );

      const performance = this.performanceMonitor.endMonitoring(
        component.name,
        perfStart,
      );

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
          businessLogicPreservation: transformation.businessLogicPreserved
            ? 100
            : 0,
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
