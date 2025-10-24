/**
 * Integrated Performance Profiler
 *
 * Profiles actual migration pipeline performance
 */

import { performance } from 'perf_hooks';
import { PipelineOrchestrator, type PipelineProgress, type PipelineResult } from '@/pipeline/orchestrator';
import type { ExtractionConfig } from '@/types';

export interface PerformanceProfile {
  component: string;
  totalDuration: number;
  phases: PhaseMetrics[];
  throughput: {
    componentsPerHour: number;
    meetsTarget: boolean;
  };
  pipelineResult?: PipelineResult;
}

export interface PhaseMetrics {
  name: string;
  duration: number;
  percentage: number;
}

export class IntegratedPerformanceProfiler {
  private readonly targetComponentsPerHour: number;
  private readonly phaseTimings: Map<string, number> = new Map();

  constructor(targetComponentsPerHour: number = 10) {
    this.targetComponentsPerHour = targetComponentsPerHour;
  }

  /**
   * Profile a real migration using the pipeline
   */
  public async profileMigration(
    sourcePath: string,
    config?: Partial<ExtractionConfig>,
  ): Promise<PerformanceProfile> {
    console.log(`Profiling migration for: ${sourcePath}`);

    // Create configuration
    const extractionConfig: ExtractionConfig = {
      sourcePath,
      targetFramework: 'configurator-v2',
      outputFormat: 'json',
      includeTests: false,
      preserveComments: true,
      generateDocumentation: false,
      validationLevel: 'strict',
      ...config,
    };

    // Create orchestrator
    const orchestrator = new PipelineOrchestrator();

    // Track phase timings
    this.phaseTimings.clear();
    let currentPhaseStart: number = 0;

    orchestrator.addEventHandler({
      onPhaseStart: (phase) => {
        currentPhaseStart = performance.now();
        console.log(`Phase started: ${phase}`);
      },
      onPhaseComplete: (phase) => {
        const duration = performance.now() - currentPhaseStart;
        this.phaseTimings.set(phase, duration);
        console.log(`Phase completed: ${phase} (${duration.toFixed(2)}ms)`);
      },
      onProgress: (progress: PipelineProgress) => {
        console.log(`Progress: ${progress.overallProgress.toFixed(1)}% - ${progress.currentOperation}`);
      },
    });

    // Execute pipeline
    const startTime = performance.now();
    const result = await orchestrator.execute(extractionConfig, {
      mode: 'full-pipeline',
      parallel: false, // Sequential for accurate timing
      generateReports: false,
      dryRun: false,
    });
    const totalDuration = performance.now() - startTime;

    // Extract phase metrics
    const phases: PhaseMetrics[] = [];
    for (const [name, duration] of this.phaseTimings) {
      phases.push({
        name,
        duration,
        percentage: (duration / totalDuration) * 100,
      });
    }

    // Calculate throughput
    // For single component files, use totalDuration to calculate how many could be processed per hour
    // If pipeline discovered multiple components, use that count; otherwise assume 1 component processed
    const componentsProcessed = result.progress.stats.componentsDiscovered || 1;
    const componentsPerHour = (componentsProcessed / (totalDuration / 3600000));

    const meetsTarget = componentsPerHour >= this.targetComponentsPerHour;

    return {
      component: sourcePath,
      totalDuration,
      phases,
      throughput: {
        componentsPerHour,
        meetsTarget,
      },
      pipelineResult: result,
    };
  }

  /**
   * Profile batch migration
   */
  public async profileBatchMigration(
    sourcePaths: string[],
  ): Promise<{
    totalTime: number;
    averageTime: number;
    throughput: number;
    meetsTarget: boolean;
    profiles: PerformanceProfile[];
  }> {
    const startTime = performance.now();
    const profiles: PerformanceProfile[] = [];

    for (const sourcePath of sourcePaths) {
      try {
        const profile = await this.profileMigration(sourcePath);
        profiles.push(profile);
      } catch (error) {
        console.error(`Failed to profile ${sourcePath}:`, error);
      }
    }

    const totalTime = performance.now() - startTime;
    const averageTime = totalTime / sourcePaths.length;
    const throughput = (3600000 / averageTime);
    const meetsTarget = throughput >= this.targetComponentsPerHour;

    return {
      totalTime,
      averageTime,
      throughput,
      meetsTarget,
      profiles,
    };
  }

  /**
   * Generate performance report
   */
  public generateReport(profile: PerformanceProfile): string {
    const lines: string[] = [
      '# Performance Profile Report',
      '',
      `**Component:** ${profile.component}`,
      `**Total Duration:** ${profile.totalDuration.toFixed(2)}ms`,
      `**Throughput:** ${profile.throughput.componentsPerHour.toFixed(1)} components/hour`,
      `**Status:** ${profile.throughput.meetsTarget ? '✅ MEETS TARGET' : '❌ BELOW TARGET'}`,
      '',
      '## Phase Breakdown',
      '',
      '| Phase | Duration (ms) | Percentage |',
      '|-------|--------------|------------|',
    ];

    for (const phase of profile.phases) {
      lines.push(
        `| ${phase.name} | ${phase.duration.toFixed(2)} | ${phase.percentage.toFixed(1)}% |`,
      );
    }

    if (profile.pipelineResult) {
      lines.push('');
      lines.push('## Pipeline Results');
      lines.push('');
      lines.push(`- Success: ${profile.pipelineResult.success ? '✅' : '❌'}`);
      lines.push(`- Components Discovered: ${profile.pipelineResult.progress.stats.componentsDiscovered}`);
      lines.push(`- Components Parsed: ${profile.pipelineResult.progress.stats.componentsParsed}`);
      lines.push(`- Errors: ${profile.pipelineResult.errors.length}`);
    }

    return lines.join('\n');
  }
}

/**
 * Factory function
 */
export function createIntegratedPerformanceProfiler(
  targetComponentsPerHour?: number,
): IntegratedPerformanceProfiler {
  return new IntegratedPerformanceProfiler(targetComponentsPerHour);
}
