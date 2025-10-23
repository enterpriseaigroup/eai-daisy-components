/**
 * Migration Validator Tests
 */

import { describe, expect, it, jest } from '@jest/globals';
import {
  MigrationValidator,
  createMigrationValidator,
} from '@/pipeline/validators/migration-validator';
import type { ComponentDefinition, ExtractionConfig } from '@/types';
import type { TransformationResult } from '@/pipeline/transformers/configurator-transformer';
import type { GenerationResult } from '@/pipeline/generators/v2-generator';

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

const mockComponent: ComponentDefinition = {
  id: 'test',
  name: 'Test',
  type: 'functional',
  sourcePath: '/test.tsx',
  props: [],
  businessLogic: [],
  reactPatterns: [],
  dependencies: [],
  complexity: 'simple',
  migrationStatus: 'pending',
  metadata: { createdAt: new Date(), lastModified: new Date() },
};

const mockTransformation: TransformationResult = {
  original: mockComponent,
  transformed: { ...mockComponent, migrationStatus: 'completed' },
  strategy: 'direct-translation',
  transformations: [],
  patternMappings: [],
  businessLogicPreserved: true,
  warnings: [],
  requiresManualReview: false,
};

const mockGeneration: GenerationResult = {
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
};

describe('MigrationValidator', () => {
  let validator: MigrationValidator;

  beforeEach(() => {
    validator = new MigrationValidator(mockConfig);
  });

  describe('validate', () => {
    it('should validate successful migration', async () => {
      const result = await validator.validate(
        mockComponent,
        mockTransformation,
        mockGeneration,
      );

      expect(result.valid).toBe(true);
      expect(result.componentName).toBe('Test');
      expect(result.businessLogicPreserved).toBe(true);
    });

    it('should detect business logic preservation issues', async () => {
      const failedTransform = {
        ...mockTransformation,
        businessLogicPreserved: false,
      };
      const result = await validator.validate(
        mockComponent,
        failedTransform,
        mockGeneration,
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should add warnings for manual review', async () => {
      const reviewTransform = {
        ...mockTransformation,
        requiresManualReview: true,
      };
      const result = await validator.validate(
        mockComponent,
        reviewTransform,
        mockGeneration,
      );

      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should calculate validation score', async () => {
      const result = await validator.validate(
        mockComponent,
        mockTransformation,
        mockGeneration,
      );
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
    });

    it('should mark types as safe by default', async () => {
      const result = await validator.validate(
        mockComponent,
        mockTransformation,
        mockGeneration,
      );
      expect(result.typesSafe).toBe(true);
    });

    it('should mark tests as passing by default', async () => {
      const result = await validator.validate(
        mockComponent,
        mockTransformation,
        mockGeneration,
      );
      expect(result.testsPass).toBe(true);
    });
  });

  describe('error and warning handling', () => {
    it('should handle transformation warnings', async () => {
      const warnTransform = {
        ...mockTransformation,
        warnings: ['Warning 1', 'Warning 2'],
        requiresManualReview: true,
      };

      const result = await validator.validate(
        mockComponent,
        warnTransform,
        mockGeneration,
      );
      expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    });

    it('should penalize score for errors', async () => {
      const failedTransform = {
        ...mockTransformation,
        businessLogicPreserved: false,
      };
      const result = await validator.validate(
        mockComponent,
        failedTransform,
        mockGeneration,
      );

      expect(result.score).toBeLessThan(100);
    });

    it('should penalize score for warnings', async () => {
      const warnTransform = {
        ...mockTransformation,
        requiresManualReview: true,
      };
      const result = await validator.validate(
        mockComponent,
        warnTransform,
        mockGeneration,
      );

      expect(result.score).toBeLessThan(100);
    });
  });
});

describe('Utility Functions', () => {
  it('should create validator via factory', () => {
    const validator = createMigrationValidator(mockConfig);
    expect(validator).toBeInstanceOf(MigrationValidator);
  });
});
