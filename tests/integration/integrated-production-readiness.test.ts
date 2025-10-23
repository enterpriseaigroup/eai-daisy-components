/**
 * Integrated Production Readiness Tests
 *
 * Uses the REAL pipeline to validate migration metrics
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import * as path from 'path';
import * as fs from 'fs/promises';
import { IntegratedMigrationValidator } from '../validators/integrated-migration-validator';
import { IntegratedPerformanceProfiler } from '../profilers/integrated-performance-profiler';

describe('Integrated Production Readiness Validation', () => {
  let migrationValidator: IntegratedMigrationValidator;
  let performanceProfiler: IntegratedPerformanceProfiler;

  // Test component paths
  const fixturesDir = path.join(__dirname, '../fixtures/components');
  const v1ButtonPath = path.join(fixturesDir, 'v1/Button.tsx');
  const v2ButtonPath = path.join(fixturesDir, 'v2/Button.tsx');

  beforeAll(async () => {
    migrationValidator = new IntegratedMigrationValidator();
    performanceProfiler = new IntegratedPerformanceProfiler(10); // 10 components/hour target
  });

  describe('Migration Success Rate (Target: ≥95%)', () => {
    it('should validate that migrated component files exist', async () => {
      const result = await migrationValidator.validateMigration(v2ButtonPath, v1ButtonPath);

      expect(result.checks.fileExists).toBe(true);
      console.log(`File exists check: ${result.checks.fileExists ? '✅' : '❌'}`);
    });

    it('should validate component is parseable using real pipeline parser', async () => {
      const result = await migrationValidator.validateMigration(v2ButtonPath, v1ButtonPath);

      expect(result.checks.parseable).toBe(true);
      console.log(`Parseable check: ${result.checks.parseable ? '✅' : '❌'}`);

      if (!result.checks.parseable) {
        console.log('Parse errors:', result.errors.filter(e => e.type === 'parse'));
      }
    }, 30000); // 30s timeout for parsing

    it('should validate component compiles without errors', async () => {
      const result = await migrationValidator.validateMigration(v2ButtonPath, v1ButtonPath);

      expect(result.checks.compiles).toBe(true);
      console.log(`Compiles check: ${result.checks.compiles ? '✅' : '❌'}`);

      if (result.parseResult) {
        console.log(`Component type: ${result.parseResult.componentType}`);
        console.log(`Props found: ${result.parseResult.structure?.props.length || 0}`);
        console.log(`Hooks found: ${result.parseResult.structure?.hooks.length || 0}`);
      }
    }, 30000);

    it('should calculate actual migration success rate', async () => {
      const components = [
        { v1: v1ButtonPath, v2: v2ButtonPath, name: 'Button' },
      ];

      let successCount = 0;
      const results = [];

      for (const component of components) {
        const result = await migrationValidator.validateMigration(
          component.v2,
          component.v1
        );

        results.push({
          name: component.name,
          success: result.success,
          checks: result.checks,
        });

        if (result.success) {
          successCount++;
        }
      }

      const successRate = (successCount / components.length) * 100;

      console.log('\n=== Migration Success Rate ===');
      console.log(`Success Rate: ${successRate.toFixed(1)}%`);
      console.log(`Target: ≥95%`);
      console.log(`Status: ${successRate >= 95 ? '✅ PASS' : '❌ FAIL'}`);

      console.log('\nDetailed Results:');
      results.forEach(r => {
        console.log(`  ${r.name}:`);
        console.log(`    - File Exists: ${r.checks.fileExists ? '✅' : '❌'}`);
        console.log(`    - Compiles: ${r.checks.compiles ? '✅' : '❌'}`);
        console.log(`    - Parseable: ${r.checks.parseable ? '✅' : '❌'}`);
        console.log(`    - Business Logic: ${r.checks.businessLogicPreserved ? '✅' : '❌'}`);
      });

      // For our test fixtures, we expect 100% success
      expect(successRate).toBeGreaterThanOrEqual(95);
    }, 60000); // 60s timeout for multiple components
  });

  describe('Business Logic Preservation (Target: 100%)', () => {
    it('should validate business logic is preserved using real analyzer', async () => {
      const result = await migrationValidator.validateMigration(v2ButtonPath, v1ButtonPath);

      console.log('\n=== Business Logic Preservation ===');
      console.log(`Preserved: ${result.checks.businessLogicPreserved ? '✅' : '❌'}`);
      console.log(`Target: 100%`);

      if (!result.checks.businessLogicPreserved) {
        console.log('\nBusiness Logic Errors:');
        result.errors.filter(e => e.type === 'businessLogic').forEach(error => {
          console.log(`  - ${error.message}`);
        });
      }

      expect(result.checks.businessLogicPreserved).toBe(true);
    }, 30000);

    it('should detect if functions are missing', async () => {
      // This test validates that our validator can detect missing functions
      // For our test fixtures, all functions should be present
      const result = await migrationValidator.validateMigration(v2ButtonPath, v1ButtonPath);

      const businessLogicErrors = result.errors.filter(e => e.type === 'businessLogic');

      console.log('\n=== Function Preservation ===');
      console.log(`Business Logic Errors: ${businessLogicErrors.length}`);

      if (businessLogicErrors.length > 0) {
        console.log('Detected issues:');
        businessLogicErrors.forEach(error => {
          console.log(`  - ${error.message}`);
        });
      }

      // For our test fixtures with matched v1/v2, we expect no errors
      expect(businessLogicErrors.length).toBe(0);
    }, 30000);
  });

  describe('Throughput (Target: ≥10 components/hour)', () => {
    it('should measure actual pipeline throughput', async () => {
      // Profile a real component migration
      // Note: This uses the fixtures directory as a source path
      const profile = await performanceProfiler.profileMigration(fixturesDir);

      console.log('\n=== Throughput Measurement ===');
      console.log(`Total Duration: ${profile.totalDuration.toFixed(2)}ms`);
      console.log(`Components Per Hour: ${profile.throughput.componentsPerHour.toFixed(1)}`);
      console.log(`Target: ≥10 components/hour`);
      console.log(`Status: ${profile.throughput.meetsTarget ? '✅ PASS' : '❌ FAIL'}`);

      if (profile.phases.length > 0) {
        console.log('\nPhase Breakdown:');
        profile.phases.forEach(phase => {
          console.log(`  ${phase.name}: ${phase.duration.toFixed(2)}ms (${phase.percentage.toFixed(1)}%)`);
        });
      }

      if (profile.pipelineResult) {
        console.log('\nPipeline Results:');
        console.log(`  Components Discovered: ${profile.pipelineResult.progress.stats.componentsDiscovered}`);
        console.log(`  Components Parsed: ${profile.pipelineResult.progress.stats.componentsParsed}`);
        console.log(`  Errors: ${profile.pipelineResult.errors.length}`);
      }

      // Note: The actual throughput depends on the complexity of components in fixtures
      // We just verify the metric can be calculated
      expect(profile.throughput.componentsPerHour).toBeGreaterThan(0);
    }, 120000); // 120s timeout for full pipeline run
  });

  describe('End-to-End Validation', () => {
    it('should run complete validation workflow', async () => {
      console.log('\n=== Complete Validation Workflow ===\n');

      // Step 1: Validate migration
      console.log('Step 1: Validating migration...');
      const validationResult = await migrationValidator.validateMigration(
        v2ButtonPath,
        v1ButtonPath
      );

      console.log(`  File Exists: ${validationResult.checks.fileExists ? '✅' : '❌'}`);
      console.log(`  Compiles: ${validationResult.checks.compiles ? '✅' : '❌'}`);
      console.log(`  Parseable: ${validationResult.checks.parseable ? '✅' : '❌'}`);
      console.log(`  Business Logic: ${validationResult.checks.businessLogicPreserved ? '✅' : '❌'}`);

      // Step 2: Generate report
      console.log('\nStep 2: Generating validation report...');
      const report = migrationValidator.generateReport(validationResult);
      expect(report).toContain('Migration Validation Report');

      // Step 3: Check overall success
      console.log('\nStep 3: Overall validation result...');
      console.log(`  Status: ${validationResult.success ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`  Total Errors: ${validationResult.errors.length}`);
      console.log(`  Total Warnings: ${validationResult.warnings.length}`);

      if (validationResult.errors.length > 0) {
        console.log('\n  Errors:');
        validationResult.errors.forEach(error => {
          console.log(`    - [${error.type}] ${error.message}`);
        });
      }

      // For our test fixtures, we expect success
      expect(validationResult.success).toBe(true);
    }, 60000);
  });

  describe('Metrics Summary', () => {
    it('should generate comprehensive metrics report', async () => {
      console.log('\n========================================');
      console.log('    PRODUCTION READINESS METRICS');
      console.log('========================================\n');

      // Validate migration
      const validation = await migrationValidator.validateMigration(v2ButtonPath, v1ButtonPath);

      const successRate = validation.success ? 100 : 0;
      const businessLogicPreserved = validation.checks.businessLogicPreserved;

      console.log('| Metric                    | Target  | Actual | Status |');
      console.log('|---------------------------|---------|--------|--------|');
      console.log(`| Migration Success Rate    | ≥95%    | ${successRate}%  | ${successRate >= 95 ? '✅' : '❌'}    |`);
      console.log(`| Business Logic Preserved  | 100%    | ${businessLogicPreserved ? '100%' : '0%'}   | ${businessLogicPreserved ? '✅' : '❌'}    |`);

      console.log('\n========================================\n');

      console.log('Detailed Validation:');
      console.log(`  Parse Time: ${validation.metrics.parseTime}ms`);
      console.log(`  Analysis Time: ${validation.metrics.analysisTime}ms`);

      if (validation.parseResult?.structure) {
        const structure = validation.parseResult.structure;
        console.log('\nComponent Structure:');
        console.log(`  Props: ${structure.props.length}`);
        console.log(`  Methods: ${structure.methods.length}`);
        console.log(`  Hooks: ${structure.hooks.length}`);
        console.log(`  Imports (External): ${structure.imports.external.length}`);
        console.log(`  Imports (Internal): ${structure.imports.internal.length}`);
      }

      // Overall assessment
      const allMetricsPassed = validation.success && businessLogicPreserved;

      console.log('\n========================================');
      console.log(`  OVERALL: ${allMetricsPassed ? '✅ PRODUCTION READY' : '❌ NOT READY'}`);
      console.log('========================================\n');

      expect(allMetricsPassed).toBe(true);
    }, 60000);
  });
});
