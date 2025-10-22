/**
 * Migration Job Tests
 */

import { describe, it, expect, jest } from '@jest/globals';
import { MigrationJob, createMigrationJob } from '@/pipeline/migration-job';
import type { ExtractionConfig } from '@/types';

jest.mock('@/pipeline/extractors/discovery');
jest.mock('@/pipeline/extractors/v1-extractor');
jest.mock('@/pipeline/transformers/configurator-transformer');
jest.mock('@/pipeline/generators/v2-generator');
jest.mock('@/pipeline/validators/migration-validator');
jest.mock('@/utils/performance-monitor');
jest.mock('@/utils/filesystem');
jest.mock('@/utils/logging');

const mockConfig: ExtractionConfig = {
  sourcePath: '/test',
  outputPath: '/output',
  preserveBaseline: true,
  processing: {
    mode: 'parallel',
    concurrency: 4,
    continueOnError: true,
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      retryableOperations: [],
    },
    filters: {
      include: [],
      exclude: [],
      types: [],
      complexity: [],
      custom: [],
    },
  },
  performance: {
    memoryLimit: 1024,
    timeoutPerComponent: 30000,
    maxBundleSizeIncrease: 120,
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
    generateDeclarations: true,
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
    format: 'detailed',
    timestamps: true,
    stackTraces: true,
  },
};

const mockComponent = {
  id: 'test',
  name: 'Test',
  type: 'functional' as const,
  sourcePath: '/test.tsx',
  props: [],
  businessLogic: [],
  reactPatterns: [] as any[],
  dependencies: [],
  complexity: 'simple' as const,
  migrationStatus: 'pending' as const,
  metadata: { createdAt: new Date(), lastModified: new Date() },
};

describe('MigrationJob', () => {
  beforeEach(() => {
    const {
      ComponentDiscoveryService,
    } = require('@/pipeline/extractors/discovery');
    const {
      V1ComponentExtractor,
    } = require('@/pipeline/extractors/v1-extractor');
    const {
      ConfiguratorTransformer,
    } = require('@/pipeline/transformers/configurator-transformer');
    const {
      V2ComponentGenerator,
    } = require('@/pipeline/generators/v2-generator');
    const {
      MigrationValidator,
    } = require('@/pipeline/validators/migration-validator');
    const { FileSystemManager } = require('@/utils/filesystem');

    ComponentDiscoveryService.prototype.discoverComponents = jest
      .fn()
      .mockResolvedValue({
        components: [mockComponent],
        statistics: {
          componentsFound: 1,
          componentsByType: {},
          componentsByComplexity: {},
        },
        duration: 100,
      });

    V1ComponentExtractor.prototype.extractComponent = jest
      .fn()
      .mockResolvedValue({
        success: true,
        component: mockComponent,
        extractedFiles: [],
      });

    ConfiguratorTransformer.prototype.transform = jest.fn().mockResolvedValue({
      original: mockComponent,
      transformed: mockComponent,
      strategy: 'direct-translation',
      transformations: [],
      patternMappings: [],
      businessLogicPreserved: true,
      warnings: [],
      requiresManualReview: false,
    });

    V2ComponentGenerator.prototype.generate = jest.fn().mockResolvedValue({
      component: mockComponent,
      artifacts: {
        component: {
          path: 'Test.tsx',
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
      },
      outputPath: '/output',
      success: true,
      errors: [],
    });

    MigrationValidator.prototype.validate = jest.fn().mockResolvedValue({
      valid: true,
      errors: [],
      warnings: [],
      score: 100,
      componentName: 'Test',
      businessLogicPreserved: true,
      typesSafe: true,
      testsPass: true,
    });

    FileSystemManager.prototype.readFile = jest.fn().mockResolvedValue('code');
  });

  describe('execute', () => {
    it('should execute migration job successfully', async () => {
      const job = new MigrationJob({ config: mockConfig });
      const result = await job.execute();

      expect(result.summary.total).toBe(1);
      expect(result.summary.successful).toBe(1);
      expect(result.summary.failed).toBe(0);
    });

    it('should return migration results', async () => {
      const job = new MigrationJob({ config: mockConfig });
      const result = await job.execute();

      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
    });

    it('should calculate summary statistics', async () => {
      const job = new MigrationJob({ config: mockConfig });
      const result = await job.execute();

      expect(result.summary.duration).toBeGreaterThan(0);
      expect(result.summary.averageTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle migration failures', async () => {
      const {
        ConfiguratorTransformer,
      } = require('@/pipeline/transformers/configurator-transformer');
      ConfiguratorTransformer.prototype.transform = jest
        .fn()
        .mockRejectedValue(new Error('Transform failed'));

      const job = new MigrationJob({ config: mockConfig });

      await expect(job.execute()).rejects.toThrow();
    });

    it('should process multiple components', async () => {
      const {
        ComponentDiscoveryService,
      } = require('@/pipeline/extractors/discovery');
      ComponentDiscoveryService.prototype.discoverComponents = jest
        .fn()
        .mockResolvedValue({
          components: [mockComponent, { ...mockComponent, id: '2' }],
          statistics: {
            componentsFound: 2,
            componentsByType: {},
            componentsByComplexity: {},
          },
          duration: 100,
        });

      const job = new MigrationJob({ config: mockConfig });
      const result = await job.execute();

      expect(result.summary.total).toBe(2);
    });
  });
});

describe('Utility Functions', () => {
  it('should create job via factory', () => {
    const job = createMigrationJob({ config: mockConfig });
    expect(job).toBeInstanceOf(MigrationJob);
  });

  it('should accept dry-run option', () => {
    const job = createMigrationJob({ config: mockConfig, dryRun: true });
    expect(job).toBeInstanceOf(MigrationJob);
  });

  it('should accept component name filter', () => {
    const job = createMigrationJob({
      config: mockConfig,
      componentName: 'Test',
    });
    expect(job).toBeInstanceOf(MigrationJob);
  });
});
