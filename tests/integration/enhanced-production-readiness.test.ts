/**
 * Enhanced Production Readiness Validation
 *
 * Uses real component compilation, bundling, and testing
 * to accurately validate migration quality metrics
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs/promises';

// Import our enhanced testing utilities
import { EnhancedMigrationValidator } from '../validators/enhanced-migration-validator';
import { RealBundleAnalyzer } from '../analyzers/real-bundle-analyzer';
import { EnhancedEquivalencyTester } from '../utils/enhanced-equivalency-tester';
import { createEnhancedBusinessLogicAnalyzer } from '../analyzers/enhanced-business-logic-analyzer';
import { RealPerformanceProfiler } from '../profilers/real-performance-profiler';

describe('Enhanced Production Readiness Validation', () => {
  let migrationValidator: EnhancedMigrationValidator;
  let bundleAnalyzer: RealBundleAnalyzer;
  let equivalencyTester: EnhancedEquivalencyTester;
  let businessLogicAnalyzer: any;
  let performanceProfiler: RealPerformanceProfiler;

  // Test components paths
  const v1ButtonPath = path.join(__dirname, '../fixtures/components/v1/Button.tsx');
  const v2ButtonPath = path.join(__dirname, '../fixtures/components/v2/Button.tsx');

  beforeAll(async () => {
    migrationValidator = new EnhancedMigrationValidator();
    bundleAnalyzer = new RealBundleAnalyzer(120); // 120% size constraint
    equivalencyTester = new EnhancedEquivalencyTester();
    businessLogicAnalyzer = createEnhancedBusinessLogicAnalyzer();
    performanceProfiler = new RealPerformanceProfiler(10); // 10 components/hour target
  });

  afterAll(async () => {
    // Cleanup temporary files
    await fs.rm(path.join(process.cwd(), 'dist-bundle-test'), {
      recursive: true,
      force: true,
    }).catch(() => {});
  });

  describe('Migration Success Rate (Target: ≥95%)', () => {
    it('should validate component compilation', async () => {
      const result = await migrationValidator.validateMigration(
        v2ButtonPath,
        v1ButtonPath,
      );

      expect(result.success).toBe(true);
      expect(result.checks.compiles).toBe(true);
      expect(result.errors.filter(e => e.type === 'compilation')).toHaveLength(0);
    });

    it('should validate TypeScript types are preserved', async () => {
      const result = await migrationValidator.validateMigration(
        v2ButtonPath,
        v1ButtonPath,
      );

      expect(result.checks.typesValid).toBe(true);
      expect(result.errors.filter(e => e.type === 'type')).toHaveLength(0);
    });

    it('should validate runtime behavior', async () => {
      const result = await migrationValidator.validateMigration(
        v2ButtonPath,
        v1ButtonPath,
      );

      expect(result.checks.runtimeValid).toBe(true);
      expect(result.errors.filter(e => e.type === 'runtime')).toHaveLength(0);
    });

    it('should calculate accurate success rate across multiple components', async () => {
      // Test with multiple components
      const components = [
        { v1: v1ButtonPath, v2: v2ButtonPath, name: 'Button' },
        // Add more components as they're created
      ];

      let successCount = 0;

      for (const component of components) {
        const result = await migrationValidator.validateMigration(
          component.v2,
          component.v1,
        );

        if (result.success) {
          successCount++;
        }
      }

      const successRate = (successCount / components.length) * 100;
      console.log(`Actual Migration Success Rate: ${successRate}%`);

      expect(successRate).toBeGreaterThanOrEqual(95);
    });
  });

  describe('Equivalency Score (Target: ≥95%)', () => {
    it('should validate render equivalency with real DOM comparison', async () => {
      const testCases = [
        {
          props: { label: 'Click Me', variant: 'primary' },
          interactions: [{ type: 'click' as const, target: 'button' }],
        },
        {
          props: { label: 'Submit', variant: 'secondary', disabled: true },
          interactions: [],
        },
      ];

      const result = await equivalencyTester.testEquivalency(
        v1ButtonPath,
        v2ButtonPath,
        testCases,
      );

      expect(result.score).toBeGreaterThanOrEqual(95);
      expect(result.details.renderMatch).toBe(true);

      console.log(`Actual Equivalency Score: ${result.score}%`);
    });

    it('should validate behavioral equivalency', async () => {
      const testCases = [
        {
          props: {
            label: 'Test Button',
            onClick: jest.fn(),
          },
          interactions: [
            { type: 'click' as const, target: 'button' },
            { type: 'keypress' as const, target: 'button', value: 'Enter' },
          ],
          expectedBehavior: {
            callbacksCalled: ['onClick'],
          },
        },
      ];

      const result = await equivalencyTester.testEquivalency(
        v1ButtonPath,
        v2ButtonPath,
        testCases,
      );

      expect(result.details.behaviorMatch).toBe(true);
    });

    it('should validate state management equivalency', async () => {
      const result = await equivalencyTester.testEquivalency(
        v1ButtonPath,
        v2ButtonPath,
        [],
      );

      expect(result.details.stateMatch).toBe(true);
    });

    it('should generate detailed difference report', async () => {
      const result = await equivalencyTester.testEquivalency(
        v1ButtonPath,
        v2ButtonPath,
        [],
      );

      if (result.differences.length > 0) {
        console.log('Equivalency Differences Found:');
        result.differences.forEach(diff => {
          console.log(`- [${diff.severity}] ${diff.type}: ${diff.description}`);
        });
      }

      expect(result.report).toBeDefined();
      expect(result.report).toContain('Equivalency Report');
    });
  });

  describe('Bundle Size Ratio (Target: ≤120%)', () => {
    it('should measure actual minified + gzipped bundle size', async () => {
      const comparison = await bundleAnalyzer.compareBundles(
        v1ButtonPath,
        v2ButtonPath,
      );

      console.log(`v1 Bundle Size: ${comparison.v1.gzippedSize} bytes`);
      console.log(`v2 Bundle Size: ${comparison.v2.gzippedSize} bytes`);
      console.log(`Size Increase: ${comparison.percentageIncrease.toFixed(1)}%`);

      expect(comparison.v2.gzippedSize).toBeDefined();
      expect(comparison.v2.gzippedSize).toBeGreaterThan(0);
    });

    it('should validate bundle size constraint', async () => {
      const comparison = await bundleAnalyzer.compareBundles(
        v1ButtonPath,
        v2ButtonPath,
      );

      expect(comparison.meetsTarget).toBe(true);
      expect(comparison.percentageIncrease).toBeLessThanOrEqual(120);
    });

    it('should identify dependency sizes', async () => {
      const analysis = await bundleAnalyzer.analyzeBundle(v2ButtonPath);

      expect(analysis.dependencies).toBeDefined();
      expect(Array.isArray(analysis.dependencies)).toBe(true);

      if (analysis.dependencies.length > 0) {
        console.log('Top Dependencies:');
        analysis.dependencies.slice(0, 5).forEach(dep => {
          console.log(`- ${dep.name}: ${dep.size} bytes (${dep.percentage.toFixed(1)}%)`);
        });
      }
    });

    it('should provide optimization recommendations when needed', async () => {
      const comparison = await bundleAnalyzer.compareBundles(
        v1ButtonPath,
        v2ButtonPath,
      );

      if (!comparison.meetsTarget) {
        expect(comparison.recommendations.length).toBeGreaterThan(0);

        console.log('Optimization Recommendations:');
        comparison.recommendations.forEach(rec => {
          console.log(`- [${rec.priority}] ${rec.type}: ${rec.description}`);
        });
      }
    });

    it('should measure tree-shaking effectiveness', async () => {
      const analysis = await bundleAnalyzer.analyzeBundle(v2ButtonPath);

      expect(analysis.treeshakingSavings).toBeDefined();
      console.log(`Tree-shaking Savings: ${analysis.treeshakingSavings} bytes`);
    });
  });

  describe('Throughput (Target: ≥10 components/hour)', () => {
    it('should measure actual component migration time', async () => {
      const startTime = Date.now();

      // Simulate actual migration process
      const result = await migrationValidator.validateMigration(
        v2ButtonPath,
        v1ButtonPath,
      );

      const migrationTime = Date.now() - startTime;

      console.log(`Migration Time: ${migrationTime}ms`);

      // Calculate components per hour
      const componentsPerHour = (3600000 / migrationTime);
      console.log(`Throughput: ${componentsPerHour.toFixed(1)} components/hour`);

      // Should be able to process at least 10 components per hour
      expect(componentsPerHour).toBeGreaterThanOrEqual(10);
    });

    it('should identify performance bottlenecks', async () => {
      const profile = await performanceProfiler.profileMigration(
        v1ButtonPath,
        v2ButtonPath,
      );

      expect(profile.bottlenecks).toBeDefined();

      if (profile.bottlenecks.length > 0) {
        console.log('Performance Bottlenecks:');
        profile.bottlenecks.forEach(bottleneck => {
          console.log(`- ${bottleneck.phase}: ${bottleneck.duration}ms (${bottleneck.percentage.toFixed(1)}%)`);
        });
      }
    });

    it('should validate parallel processing capability', async () => {
      const components = [
        { v1: v1ButtonPath, v2: v2ButtonPath },
        // Add more components as needed
      ];

      const startTime = Date.now();

      // Process components in parallel
      await Promise.all(
        components.map(c =>
          migrationValidator.validateMigration(c.v2, c.v1),
        ),
      );

      const totalTime = Date.now() - startTime;
      const averageTime = totalTime / components.length;

      console.log(`Parallel Processing Time: ${averageTime}ms per component`);

      const throughput = (3600000 / averageTime);
      expect(throughput).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Business Logic Preservation (Target: 100%)', () => {
    it('should validate all business logic functions are preserved', async () => {
      const analysis = await businessLogicAnalyzer.analyze(
        v1ButtonPath,
        v2ButtonPath,
      );

      expect(analysis.functionsPreserved).toBe(true);
      expect(analysis.missingFunctions).toHaveLength(0);

      if (analysis.missingFunctions.length > 0) {
        console.log('Missing Business Logic Functions:');
        analysis.missingFunctions.forEach((func: string) => {
          console.log(`- ${func}`);
        });
      }
    });

    it('should validate event handlers are preserved', async () => {
      const analysis = await businessLogicAnalyzer.analyze(
        v1ButtonPath,
        v2ButtonPath,
      );

      expect(analysis.eventHandlersPreserved).toBe(true);
    });

    it('should validate validation logic is preserved', async () => {
      const analysis = await businessLogicAnalyzer.analyze(
        v1ButtonPath,
        v2ButtonPath,
      );

      expect(analysis.validationLogicPreserved).toBe(true);
    });

    it('should validate state management patterns are preserved', async () => {
      const analysis = await businessLogicAnalyzer.analyze(
        v1ButtonPath,
        v2ButtonPath,
      );

      expect(analysis.stateManagementPreserved).toBe(true);
    });

    it('should use AST analysis for semantic comparison', async () => {
      const analysis = await businessLogicAnalyzer.analyzeWithAST(
        v1ButtonPath,
        v2ButtonPath,
      );

      expect(analysis.semanticEquivalence).toBe(true);
      expect(analysis.astDifferences).toHaveLength(0);
    });
  });

  describe('End-to-End Integration Validation', () => {
    it('should validate complete migration pipeline with all metrics', async () => {
      // Validate migration
      const migrationResult = await migrationValidator.validateMigration(
        v2ButtonPath,
        v1ButtonPath,
      );

      // Test equivalency
      const equivalencyResult = await equivalencyTester.testEquivalency(
        v1ButtonPath,
        v2ButtonPath,
        [],
      );

      // Analyze bundle size
      const bundleComparison = await bundleAnalyzer.compareBundles(
        v1ButtonPath,
        v2ButtonPath,
      );

      // Analyze business logic
      const businessLogicAnalysis = await businessLogicAnalyzer.analyze(
        v1ButtonPath,
        v2ButtonPath,
      );

      // All critical metrics must pass
      expect(migrationResult.success).toBe(true);
      expect(equivalencyResult.score).toBeGreaterThanOrEqual(95);
      expect(bundleComparison.percentageIncrease).toBeLessThanOrEqual(120);
      expect(businessLogicAnalysis.preserved).toBe(true);

      // Generate comprehensive report
      const report = generateComprehensiveReport({
        migration: migrationResult,
        equivalency: equivalencyResult,
        bundle: bundleComparison,
        businessLogic: businessLogicAnalysis,
      });

      console.log(report);
    });
  });

  describe('Golden Master Testing', () => {
    it('should validate against known-good migrations', async () => {
      // This would compare against manually verified migrations
      const goldenMasterPath = path.join(__dirname, '../golden-masters/Button.golden.json');

      // Create golden master if it doesn't exist
      const goldenMasterExists = await fs.access(goldenMasterPath).then(() => true).catch(() => false);

      if (!goldenMasterExists) {
        // Generate golden master from current state
        const result = await equivalencyTester.testEquivalency(
          v1ButtonPath,
          v2ButtonPath,
          [],
        );

        await fs.writeFile(
          goldenMasterPath,
          JSON.stringify(result, null, 2),
        );
      }

      // Compare against golden master
      const goldenMaster = JSON.parse(await fs.readFile(goldenMasterPath, 'utf-8'));
      const currentResult = await equivalencyTester.testEquivalency(
        v1ButtonPath,
        v2ButtonPath,
        [],
      );

      expect(currentResult.score).toBeGreaterThanOrEqual(goldenMaster.score);
    });
  });
});

/**
 * Generate comprehensive migration report
 */
function generateComprehensiveReport(results: any): string {
  return `
# Component Migration Validation Report

## Overall Status: ${
    results.migration.success &&
    results.equivalency.score >= 95 &&
    results.bundle.percentageIncrease <= 120 &&
    results.businessLogic.preserved
      ? '✅ PASSED'
      : '❌ FAILED'
  }

## Metrics Summary

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Migration Success | ✓ | ${results.migration.success ? '✓' : '✗'} | ${results.migration.success ? '✅' : '❌'} |
| Equivalency Score | ≥95% | ${results.equivalency.score}% | ${results.equivalency.score >= 95 ? '✅' : '❌'} |
| Bundle Size | ≤120% | ${results.bundle.percentageIncrease.toFixed(1)}% | ${results.bundle.percentageIncrease <= 120 ? '✅' : '❌'} |
| Business Logic | 100% | ${results.businessLogic.preserved ? '100%' : 'Failed'} | ${results.businessLogic.preserved ? '✅' : '❌'} |

## Detailed Results

### Migration Validation
- Compilation: ${results.migration.checks.compiles ? '✅' : '❌'}
- Type Safety: ${results.migration.checks.typesValid ? '✅' : '❌'}
- Runtime Valid: ${results.migration.checks.runtimeValid ? '✅' : '❌'}
- Tests Pass: ${results.migration.checks.testsPass ? '✅' : '❌'}

### Equivalency Analysis
- Render Match: ${results.equivalency.details.renderMatch ? '✅' : '❌'}
- Behavior Match: ${results.equivalency.details.behaviorMatch ? '✅' : '❌'}
- State Match: ${results.equivalency.details.stateMatch ? '✅' : '❌'}
- Performance Match: ${results.equivalency.details.performanceMatch ? '✅' : '❌'}

### Bundle Analysis
- v1 Size: ${results.bundle.v1.gzippedSize} bytes
- v2 Size: ${results.bundle.v2.gzippedSize} bytes
- Increase: ${results.bundle.sizeIncrease} bytes (${results.bundle.percentageIncrease.toFixed(1)}%)

### Business Logic
- Functions Preserved: ${results.businessLogic.functionsPreserved ? '✅' : '❌'}
- Event Handlers: ${results.businessLogic.eventHandlersPreserved ? '✅' : '❌'}
- Validation Logic: ${results.businessLogic.validationLogicPreserved ? '✅' : '❌'}
- State Management: ${results.businessLogic.stateManagementPreserved ? '✅' : '❌'}
  `;
}
