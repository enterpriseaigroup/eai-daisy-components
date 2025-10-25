/**
 * V2 Component Generation Integration Tests
 *
 * Validates end-to-end V2 generation pipeline including:
 * - Component generation from baseline
 * - File structure validation
 * - TypeScript compilation
 * - Documentation quality
 * - Performance benchmarks
 */

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import * as fs from 'fs/promises';
import * as path from 'path';
import { generateV2Component } from '../../packages/v2-components/src/pipeline/v2-generator.js';
import type {
  GenerationOptions,
  GenerationResult,
} from '../../packages/v2-components/src/types/v2-component.js';

const TEST_OUTPUT_DIR = path.join(process.cwd(), 'temp', 'integration-test-output');
const TEST_COMPONENT = 'GetAddressCard';
const TEST_BASELINE = path.join(
  process.cwd(),
  'daisyv1',
  'components',
  'tier1-simple',
  `useRender${TEST_COMPONENT}`,
  `${TEST_COMPONENT}.tsx`,
);

describe('V2 Component Generation Integration', () => {
  let generationResult: GenerationResult;
  let generationTime: number;

  beforeAll(async () => {
    // Clean test output directory
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
    await fs.mkdir(TEST_OUTPUT_DIR, { recursive: true });
  });

  afterAll(async () => {
    // Clean up test artifacts
    try {
      await fs.rm(TEST_OUTPUT_DIR, { recursive: true, force: true });
    } catch {
      // Ignore errors
    }
  });

  describe('SC-001: Component Generation', () => {
    it('should generate V2 component from baseline within performance target', async () => {
      const options: GenerationOptions = {
        baselinePath: TEST_BASELINE,
        outputPath: TEST_OUTPUT_DIR,
        componentName: TEST_COMPONENT,
        dryRun: false,
        verbose: false,
      };

      const startTime = Date.now();
      generationResult = await generateV2Component(options);
      generationTime = Date.now() - startTime;

      // Performance benchmark (NFR-001): ≤30s per component
      expect(generationTime).toBeLessThanOrEqual(30000);

      expect(generationResult).toBeDefined();
      expect(generationResult.success).toBe(true);
    }, 35000); // 35s timeout (5s buffer)
  });

  describe('SC-002: File Structure Validation', () => {
    it('should create component file with correct structure', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const exists = await fs
        .access(componentPath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);

      const content = await fs.readFile(componentPath, 'utf-8');

      // Check for essential imports
      expect(content).toContain('import {');
      expect(content).toContain("from 'react'");

      // Check for component export
      expect(content).toContain(`export const ${TEST_COMPONENT}`);

      // Check for TypeScript
      expect(content).toContain('interface');
      expect(content).toContain('Props');
    });

    it('should create README.md with component documentation', async () => {
      const readmePath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, 'README.md');
      const exists = await fs
        .access(readmePath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);

      const content = await fs.readFile(readmePath, 'utf-8');

      // Check for essential sections
      expect(content).toContain('# ' + TEST_COMPONENT);
      expect(content).toContain('## Overview');
      expect(content).toContain('## Props');
      expect(content).toContain('## Usage');
    });

    it('should create index.ts barrel export', async () => {
      const indexPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, 'index.ts');
      const exists = await fs
        .access(indexPath)
        .then(() => true)
        .catch(() => false);

      expect(exists).toBe(true);

      const content = await fs.readFile(indexPath, 'utf-8');
      expect(content).toContain(`export * from './${TEST_COMPONENT}';`);
    });
  });

  describe('SC-003: TypeScript Type Safety', () => {
    it('should not use any type', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Should not contain 'any' type
      const anyMatches = content.match(/:\s*any\b/g) || [];
      expect(anyMatches.length).toBe(0);
    });

    it('should have explicit return types', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Should have explicit return types
      expect(content).toMatch(/\):\s*(?:JSX\.Element|React\.ReactElement|void)/);
    });
  });

  describe('SC-004: Business Logic Documentation', () => {
    it('should include pseudo-code comments', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Check for pseudo-code documentation
      expect(content).toContain('/**');
      expect(content).toContain('BUSINESS LOGIC PSEUDO-CODE');
      expect(content).toContain('WHY EXISTS');
      expect(content).toContain('WHAT IT DOES');
      expect(content).toContain('DATA FLOW');
    });
  });

  describe('SC-005: Configurator SDK Integration', () => {
    it('should import Configurator SDK modules', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Check for SDK imports
      expect(content).toMatch(/import.*from ['"]@eai\/configurator-sdk['"]/);
    });

    it('should include state management patterns', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Check for state hooks
      expect(content).toContain('useState');
      expect(content).toContain('useEffect');

      // Check for state interface
      expect(content).toMatch(/interface.*State/);
    });
  });

  describe('SC-006: shadcn/ui Integration', () => {
    it('should import shadcn/ui components', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Check for UI component imports
      const uiComponents = ['Button', 'Card', 'Alert', 'Input', 'Label'];
      const hasUIComponents = uiComponents.some((comp) => content.includes(comp));

      expect(hasUIComponents).toBe(true);
    });

    it('should use shadcn/ui components in render', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const content = await fs.readFile(componentPath, 'utf-8');

      // Check for JSX usage of UI components
      expect(content).toMatch(/<(?:Button|Card|Alert|Input|Label)/);
    });
  });

  describe('SC-007: Documentation Quality', () => {
    it('should include comprehensive README', async () => {
      const readmePath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');

      // Check for required sections
      const requiredSections = [
        '## Overview',
        '## Props',
        '## Usage',
        '## Migration Notes',
        '## Troubleshooting',
      ];

      for (const section of requiredSections) {
        expect(content).toContain(section);
      }
    });
  });

  describe('SC-008: Performance Benchmarks', () => {
    it('should complete generation within 30 seconds (NFR-001)', () => {
      expect(generationTime).toBeLessThanOrEqual(30000);
    });

    it('should generate bundle size within 120% of baseline (NFR-004)', async () => {
      const componentPath = path.join(TEST_OUTPUT_DIR, TEST_COMPONENT, `${TEST_COMPONENT}.tsx`);
      const stats = await fs.stat(componentPath);
      const generatedSize = stats.size;

      // Baseline size check
      const baselineStats = await fs.stat(TEST_BASELINE);
      const baselineSize = baselineStats.size;

      const sizeRatio = generatedSize / baselineSize;

      // Should be within 120% of baseline
      expect(sizeRatio).toBeLessThanOrEqual(1.2);
    });

    it('should use memory efficiently during generation', () => {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;

      // Memory usage should be reasonable (NFR-003: ≤500MB)
      expect(heapUsedMB).toBeLessThanOrEqual(500);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing baseline gracefully', async () => {
      const options: GenerationOptions = {
        baselinePath: '/nonexistent/path/Component.tsx',
        outputPath: TEST_OUTPUT_DIR,
        componentName: 'NonexistentComponent',
        dryRun: false,
        verbose: false,
      };

      await expect(generateV2Component(options)).rejects.toThrow();
    });
  });
});
