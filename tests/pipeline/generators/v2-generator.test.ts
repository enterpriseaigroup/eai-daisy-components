/**
 * V2 Component Generator Tests
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
  V2ComponentGenerator,
  createV2Generator,
} from '@/pipeline/generators/v2-generator';
import type { ExtractionConfig, ComponentDefinition } from '@/types';
import type { TransformationResult } from '@/pipeline/transformers/configurator-transformer';

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
  id: 'test',
  name: 'TestComponent',
  type: 'functional',
  sourcePath: '/test.tsx',
  props: [{ name: 'title', type: 'string', required: true }],
  businessLogic: [],
  reactPatterns: [],
  dependencies: [],
  complexity: 'simple',
  migrationStatus: 'pending',
  metadata: { createdAt: new Date(), lastModified: new Date() },
};

const mockTransformation: TransformationResult = {
  original: mockComponent,
  transformed: mockComponent,
  strategy: 'direct-translation',
  transformations: [
    { type: 'state', original: 'useState(0)', transformed: 'useConfiguratorState(0)', description: 'Transform state', pattern: 'useConfiguratorState' },
  ],
  patternMappings: [],
  businessLogicPreserved: true,
  warnings: [],
  requiresManualReview: false,
};

describe('V2ComponentGenerator', () => {
  let generator: V2ComponentGenerator;

  beforeEach(() => {
    generator = new V2ComponentGenerator(mockConfig);

    const { FileSystemManager } = require('@/utils/filesystem');
    FileSystemManager.prototype.createDirectory = jest.fn().mockResolvedValue(undefined);
  });

  describe('generate', () => {
    it('should generate component files', async () => {
      const result = await generator.generate(mockTransformation, 'source code');

      expect(result.success).toBe(true);
      expect(result.artifacts.component).toBeDefined();
      expect(result.component.name).toBe('TestComponent');
    });

    it('should generate types when requested', async () => {
      const result = await generator.generate(mockTransformation, 'code', {
        generateTypes: true,
      });

      expect(result.artifacts.types.length).toBeGreaterThan(0);
    });

    it('should generate tests when requested', async () => {
      const result = await generator.generate(mockTransformation, 'code', {
        generateTests: true,
      });

      expect(result.artifacts.tests.length).toBeGreaterThan(0);
    });

    it('should generate documentation when requested', async () => {
      const result = await generator.generate(mockTransformation, 'code', {
        generateDocs: true,
      });

      expect(result.artifacts.documentation.length).toBeGreaterThan(0);
    });

    it('should generate examples when requested', async () => {
      const result = await generator.generate(mockTransformation, 'code', {
        generateExamples: true,
      });

      expect(result.artifacts.examples.length).toBeGreaterThan(0);
    });

    it('should include comments when requested', async () => {
      const result = await generator.generate(mockTransformation, 'code', {
        includeComments: true,
      });

      expect(result.artifacts.component.content).toContain('/**');
    });

    it('should set correct output path', async () => {
      const result = await generator.generate(mockTransformation, 'code');

      expect(result.outputPath).toContain('TestComponent');
    });
  });
});

describe('Utility Functions', () => {
  it('should create generator via factory', () => {
    const generator = createV2Generator(mockConfig);
    expect(generator).toBeInstanceOf(V2ComponentGenerator);
  });
});
