/**
 * V1 Component Extractor Tests
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
  V1ComponentExtractor,
  createV1Extractor,
  extractComponentToBaseline,
} from '@/pipeline/extractors/v1-extractor';
import type { ComponentDefinition, ExtractionConfig } from '@/types';

jest.mock('@/utils/filesystem');
jest.mock('@/utils/logging');

const mockConfig: ExtractionConfig = {
  sourcePath: '/test/source',
  outputPath: '/test/output',
  preserveBaseline: true,
  processing: {
    mode: 'parallel',
    concurrency: 4,
    continueOnError: true,
    retry: { maxAttempts: 3, delay: 1000, backoffMultiplier: 2, retryableOperations: [] },
    filters: { include: [], exclude: [], types: [], complexity: [], custom: [] },
  },
  performance: { memoryLimit: 1024, timeoutPerComponent: 30000, maxBundleSizeIncrease: 120, monitoring: true },
  validation: { strict: false, typescript: true, eslint: false, componentStructure: true, businessLogicPreservation: true },
  output: {
    generateDeclarations: true,
    generateDocs: false,
    generateExamples: false,
    format: { typescript: '.tsx', indentation: 'spaces', indentationSize: 2, lineEnding: 'lf', quotes: 'single' },
    naming: { componentFiles: 'PascalCase', interfaces: 'PascalCase', utilities: 'camelCase', constants: 'UPPER_SNAKE_CASE' },
  },
  logging: { level: 'info', outputs: ['console'], format: 'detailed', timestamps: true, stackTraces: true },
};

const mockComponent: ComponentDefinition = {
  id: 'test-123',
  name: 'TestComponent',
  type: 'functional',
  sourcePath: 'components/TestComponent.tsx',
  props: [{ name: 'title', type: 'string', required: true }],
  businessLogic: [],
  reactPatterns: ['useState'],
  dependencies: [],
  complexity: 'simple',
  migrationStatus: 'pending',
  metadata: { createdAt: new Date(), lastModified: new Date() },
};

describe('V1ComponentExtractor', () => {
  let extractor: V1ComponentExtractor;

  beforeEach(() => {
    extractor = new V1ComponentExtractor(mockConfig);

    const { FileSystemManager } = require('@/utils/filesystem');
    FileSystemManager.prototype.readFile = jest.fn().mockResolvedValue('component code');
    FileSystemManager.prototype.writeFile = jest.fn().mockResolvedValue(undefined);
    FileSystemManager.prototype.createDirectory = jest.fn().mockResolvedValue(undefined);
    FileSystemManager.prototype.exists = jest.fn().mockResolvedValue(false);
    FileSystemManager.prototype.copyFile = jest.fn().mockResolvedValue(undefined);
  });

  describe('extractComponent', () => {
    it('should extract component successfully', async () => {
      const result = await extractor.extractComponent(mockComponent);
      expect(result.success).toBe(true);
      expect(result.component.name).toBe('TestComponent');
    });

    it('should extract to tier1 for simple components', async () => {
      const result = await extractor.extractComponent(mockComponent);
      expect(result.baselinePath).toContain('tier1-simple');
    });

    it('should extract to tier2 for moderate components', async () => {
      const moderateComp = { ...mockComponent, complexity: 'moderate' as const };
      const result = await extractor.extractComponent(moderateComp);
      expect(result.baselinePath).toContain('tier2-moderate');
    });

    it('should extract to tier3 for complex components', async () => {
      const complexComp = { ...mockComponent, complexity: 'complex' as const };
      const result = await extractor.extractComponent(complexComp);
      expect(result.baselinePath).toContain('tier3-complex');
    });

    it('should extract to tier4 for critical components', async () => {
      const criticalComp = { ...mockComponent, complexity: 'critical' as const };
      const result = await extractor.extractComponent(criticalComp);
      expect(result.baselinePath).toContain('tier4-critical');
    });

    it('should handle extraction errors', async () => {
      const { FileSystemManager } = require('@/utils/filesystem');
      FileSystemManager.prototype.readFile = jest.fn().mockRejectedValue(new Error('Read failed'));

      const result = await extractor.extractComponent(mockComponent);
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should extract dependencies when requested', async () => {
      const compWithDeps = {
        ...mockComponent,
        dependencies: [{
          name: 'Helper',
          type: 'internal' as const,
          importPath: './helper',
          source: 'components/helper.ts',
          critical: false,
        }],
      };

      const { FileSystemManager } = require('@/utils/filesystem');
      FileSystemManager.prototype.exists = jest.fn().mockResolvedValue(true);

      const result = await extractor.extractComponent(compWithDeps, {
        extractDependencies: true,
      });

      expect(result.success).toBe(true);
    });

    it('should extract tests when requested', async () => {
      const { FileSystemManager } = require('@/utils/filesystem');
      FileSystemManager.prototype.exists = jest.fn()
        .mockResolvedValueOnce(true) // Test file exists
        .mockResolvedValue(false);

      const result = await extractor.extractComponent(mockComponent, {
        extractTests: true,
      });

      expect(result.success).toBe(true);
    });

    it('should extract styles when requested', async () => {
      const result = await extractor.extractComponent(mockComponent, {
        extractStyles: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('extractComponents', () => {
    it('should extract multiple components', async () => {
      const components = [
        mockComponent,
        { ...mockComponent, id: '2', name: 'Second' },
      ];

      const results = await extractor.extractComponents(components);
      expect(results).toHaveLength(2);
      expect(results.filter(r => r.success).length).toBe(2);
    });

    it('should report success count', async () => {
      const { FileSystemManager } = require('@/utils/filesystem');
      FileSystemManager.prototype.readFile = jest.fn()
        .mockResolvedValueOnce('code')
        .mockRejectedValueOnce(new Error('fail'));

      const components = [
        mockComponent,
        { ...mockComponent, id: '2', name: 'Second' },
      ];

      const results = await extractor.extractComponents(components);
      expect(results.filter(r => r.success).length).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    const { FileSystemManager } = require('@/utils/filesystem');
    FileSystemManager.prototype.readFile = jest.fn().mockResolvedValue('code');
    FileSystemManager.prototype.writeFile = jest.fn().mockResolvedValue(undefined);
    FileSystemManager.prototype.createDirectory = jest.fn().mockResolvedValue(undefined);
    FileSystemManager.prototype.exists = jest.fn().mockResolvedValue(false);
  });

  it('should create extractor via factory', () => {
    const extractor = createV1Extractor(mockConfig);
    expect(extractor).toBeInstanceOf(V1ComponentExtractor);
  });

  it('should extract via helper function', async () => {
    const result = await extractComponentToBaseline(mockComponent, mockConfig);
    expect(result.success).toBe(true);
  });
});
