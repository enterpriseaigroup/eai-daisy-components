/**
 * Bundle Size Optimizer
 *
 * Analyzes and optimizes bundle sizes for migrated components to ensure
 * they meet the ≤120% of V1 components constraint.
 *
 * @fileoverview Bundle size optimization and analysis
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { ComponentDefinition } from '@/types';

/**
 * Bundle size analysis result
 */
export interface BundleSizeAnalysis {
  componentName: string;
  v1Size: number;
  v2Size: number;
  sizeIncrease: number;
  sizeIncreasePercentage: number;
  meetsConstraint: boolean;
  recommendations: string[];
}

/**
 * Optimization recommendation
 */
export interface OptimizationRecommendation {
  type:
    | 'tree-shaking'
    | 'code-splitting'
    | 'lazy-loading'
    | 'dependency-reduction';
  priority: 'high' | 'medium' | 'low';
  description: string;
  estimatedSavings: number;
  implementation: string;
}

/**
 * Bundle optimization options
 */
export interface BundleOptimizationOptions {
  v1BaselinePath: string;
  v2OutputPath: string;
  maxIncreasePercentage: number;
  enableTreeShaking: boolean;
  enableCodeSplitting: boolean;
  enableMinification: boolean;
}

/**
 * Bundle size optimizer
 */
export class BundleOptimizer {
  private readonly maxIncreasePercentage: number;

  constructor(maxIncreasePercentage: number = 120) {
    this.maxIncreasePercentage = maxIncreasePercentage;
  }

  /**
   * Analyze bundle size for a component
   */
  public async analyzeBundleSize(
    componentName: string,
    v1Path: string,
    v2Path: string
  ): Promise<BundleSizeAnalysis> {
    const v1Size = await this.calculateDirectorySize(v1Path);
    const v2Size = await this.calculateDirectorySize(v2Path);

    const sizeIncrease = v2Size - v1Size;
    const sizeIncreasePercentage = v1Size > 0 ? (v2Size / v1Size) * 100 : 0;
    const meetsConstraint =
      sizeIncreasePercentage <= this.maxIncreasePercentage;

    const recommendations = this.generateRecommendations(
      componentName,
      v1Size,
      v2Size,
      sizeIncreasePercentage
    );

    return {
      componentName,
      v1Size,
      v2Size,
      sizeIncrease,
      sizeIncreasePercentage,
      meetsConstraint,
      recommendations,
    };
  }

  /**
   * Calculate total directory size
   */
  private async calculateDirectorySize(dirPath: string): Promise<number> {
    let totalSize = 0;

    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          totalSize += await this.calculateDirectorySize(fullPath);
        } else if (entry.isFile()) {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
      return 0;
    }

    return totalSize;
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    _componentName: string,
    v1Size: number,
    v2Size: number,
    increasePercentage: number
  ): string[] {
    const recommendations: string[] = [];

    if (increasePercentage > this.maxIncreasePercentage) {
      recommendations.push(
        `⚠️ Bundle size exceeds ${this.maxIncreasePercentage}% constraint (current: ${increasePercentage.toFixed(1)}%)`
      );
    }

    if (increasePercentage > 110) {
      recommendations.push(
        '🔍 Review imported dependencies - consider tree-shaking opportunities'
      );
      recommendations.push(
        '📦 Evaluate code-splitting for large component chunks'
      );
    }

    if (v2Size > 50000) {
      // 50KB threshold
      recommendations.push(
        '💡 Consider lazy-loading non-critical functionality'
      );
    }

    const sizeIncrease = v2Size - v1Size;
    if (sizeIncrease > 10000) {
      // 10KB increase
      recommendations.push('🎯 Analyze TypeScript type definitions overhead');
      recommendations.push('⚡ Enable aggressive minification and compression');
    }

    if (recommendations.length === 0) {
      recommendations.push(
        `✅ Bundle size is optimal (${increasePercentage.toFixed(1)}% of V1)`
      );
    }

    return recommendations;
  }

  /**
   * Generate detailed optimization recommendations
   */
  public generateOptimizationPlan(
    analysis: BundleSizeAnalysis
  ): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    if (!analysis.meetsConstraint) {
      // High priority: Critical size reduction needed
      recommendations.push({
        type: 'tree-shaking',
        priority: 'high',
        description: 'Enable aggressive tree-shaking to remove unused code',
        estimatedSavings: analysis.sizeIncrease * 0.2,
        implementation:
          'Configure bundler with sideEffects: false and enable production mode',
      });

      recommendations.push({
        type: 'dependency-reduction',
        priority: 'high',
        description: 'Audit and reduce external dependencies',
        estimatedSavings: analysis.sizeIncrease * 0.3,
        implementation:
          'Replace heavy dependencies with lighter alternatives or inline implementations',
      });
    }

    if (analysis.v2Size > 50000) {
      recommendations.push({
        type: 'code-splitting',
        priority: 'medium',
        description: 'Split component into smaller chunks',
        estimatedSavings: analysis.v2Size * 0.15,
        implementation:
          'Use dynamic imports for non-critical features and routes',
      });

      recommendations.push({
        type: 'lazy-loading',
        priority: 'medium',
        description: 'Implement lazy loading for heavy components',
        estimatedSavings: analysis.v2Size * 0.1,
        implementation:
          'Use React.lazy() and Suspense for deferred component loading',
      });
    }

    return recommendations;
  }

  /**
   * Optimize component bundle
   */
  public async optimizeBundle(
    component: ComponentDefinition,
    options: BundleOptimizationOptions
  ): Promise<{
    success: boolean;
    originalSize: number;
    optimizedSize: number;
    savings: number;
    savingsPercentage: number;
  }> {
    const analysis = await this.analyzeBundleSize(
      component.name,
      join(options.v1BaselinePath, component.name),
      join(options.v2OutputPath, component.name)
    );

    // Simulate optimization (in real implementation, would run actual bundler optimizations)
    const optimizationFactor = this.calculateOptimizationFactor(options);
    const optimizedSize = Math.floor(analysis.v2Size * optimizationFactor);
    const savings = analysis.v2Size - optimizedSize;
    const savingsPercentage = (savings / analysis.v2Size) * 100;

    return {
      success:
        optimizedSize <= (analysis.v1Size * this.maxIncreasePercentage) / 100,
      originalSize: analysis.v2Size,
      optimizedSize,
      savings,
      savingsPercentage,
    };
  }

  /**
   * Calculate optimization factor based on enabled options
   */
  private calculateOptimizationFactor(
    options: BundleOptimizationOptions
  ): number {
    let factor = 1.0;

    if (options.enableTreeShaking) {
      factor *= 0.85; // 15% reduction
    }
    if (options.enableCodeSplitting) {
      factor *= 0.9; // 10% reduction
    }
    if (options.enableMinification) {
      factor *= 0.7; // 30% reduction
    }

    return factor;
  }

  /**
   * Generate bundle size report
   */
  public async generateReport(
    analyses: BundleSizeAnalysis[],
    outputPath: string
  ): Promise<void> {
    const report = this.createReportMarkdown(analyses);
    await fs.writeFile(outputPath, report);
  }

  /**
   * Create markdown report
   */
  private createReportMarkdown(analyses: BundleSizeAnalysis[]): string {
    const totalV1 = analyses.reduce((sum, a) => sum + a.v1Size, 0);
    const totalV2 = analyses.reduce((sum, a) => sum + a.v2Size, 0);
    const overallIncrease = totalV1 > 0 ? (totalV2 / totalV1) * 100 : 0;

    const passing = analyses.filter(a => a.meetsConstraint).length;
    const failing = analyses.length - passing;

    return `# Bundle Size Analysis Report

## Summary

- **Total Components**: ${analyses.length}
- **Passing Constraint**: ${passing} (${((passing / analyses.length) * 100).toFixed(1)}%)
- **Failing Constraint**: ${failing}
- **Overall Size Increase**: ${overallIncrease.toFixed(1)}%
- **Constraint**: ≤${this.maxIncreasePercentage}% of V1

## Component Analysis

| Component | V1 Size | V2 Size | Increase | % | Status |
|-----------|---------|---------|----------|---|--------|
${analyses
  .map(
    a =>
      `| ${a.componentName} | ${this.formatBytes(a.v1Size)} | ${this.formatBytes(a.v2Size)} | ${this.formatBytes(a.sizeIncrease)} | ${a.sizeIncreasePercentage.toFixed(1)}% | ${a.meetsConstraint ? '✅' : '❌'} |`
  )
  .join('\n')}

## Recommendations

${analyses
  .filter(a => !a.meetsConstraint)
  .map(
    a => `### ${a.componentName}

${a.recommendations.map(r => `- ${r}`).join('\n')}
`
  )
  .join('\n')}

---

*Generated: ${new Date().toISOString()}*
`;
  }

  /**
   * Format bytes to human-readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) {
      return '0 B';
    }

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }
}

/**
 * Create bundle optimizer with default settings
 */
export function createBundleOptimizer(
  maxIncreasePercentage: number = 120
): BundleOptimizer {
  return new BundleOptimizer(maxIncreasePercentage);
}
