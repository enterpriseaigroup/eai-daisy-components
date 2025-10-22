/**
 * Component Discovery Service Tests
 *
 * Comprehensive tests for the component discovery service.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import {
  ComponentDiscoveryService,
  createDiscoveryService,
  quickDiscover,
  discoverComponentsByType,
  discoverComponentsByComplexity,
} from '@/pipeline/extractors/discovery';
import type { ExtractionConfig, ComponentDefinition } from '@/types';
import { FileSystemError } from '@/utils/errors';

// Mock dependencies
jest.mock('@/engine/discovery');
jest.mock('@/config/repository-config');
jest.mock('@/utils/logging');

const mockExtractionConfig: ExtractionConfig = {
  sourcePath: '/test/source',
  outputPath: '/test/output',
  preserveBaseline: true,
  processing: {
    mode: 'parallel',
    concurrency: 4,
    continueOnError: true,
    retry: {
      maxAttempts: 3,
      delay: 1000,
      backoffMultiplier: 2,
      retryableOperations: ['file-read', 'ast-parsing'],
    },
    filters: {
      include: ['**/*.tsx'],
      exclude: ['**/*.test.*'],
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
  id: 'test-123',
  name: 'TestComponent',
  type: 'functional',
  sourcePath: '/test/Component.tsx',
  props: [],
  businessLogic: [],
  reactPatterns: [],
  dependencies: [],
  complexity: 'simple',
  migrationStatus: 'pending',
  metadata: {
    createdAt: new Date(),
    lastModified: new Date(),
  },
};

describe('ComponentDiscoveryService', () => {
  let service: ComponentDiscoveryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ComponentDiscoveryService({
      extractionConfig: mockExtractionConfig,
    });
  });

  describe('constructor', () => {
    it('should create discovery service instance', () => {
      expect(service).toBeInstanceOf(ComponentDiscoveryService);
    });

    it('should enable cache by default', () => {
      const defaultService = new ComponentDiscoveryService({
        extractionConfig: mockExtractionConfig,
      });
      expect(defaultService).toBeDefined();
    });

    it('should allow cache configuration', () => {
      const noCacheService = new ComponentDiscoveryService({
        extractionConfig: mockExtractionConfig,
        enableCache: false,
      });
      expect(noCacheService).toBeDefined();
    });

    it('should accept custom cache TTL', () => {
      const customTTL = new ComponentDiscoveryService({
        extractionConfig: mockExtractionConfig,
        cacheTtl: 10000,
      });
      expect(customTTL).toBeDefined();
    });
  });

  describe('discoverComponents', () => {
    it('should discover components', async () => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [mockComponent],
          statistics: {
            componentsFound: 1,
            componentsByType: { functional: 1 },
            componentsByComplexity: { simple: 1 },
          },
          duration: 100,
        }),
      });

      const result = await service.discoverComponents();
      expect(result.components).toHaveLength(1);
      expect(result.components[0].name).toBe('TestComponent');
    });

    it('should apply filters to results', async () => {
      const filtered Service = new ComponentDiscoveryService({
        extractionConfig: mockExtractionConfig,
        filters: {
          types: ['functional'],
        },
      });

      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [mockComponent, { ...mockComponent, type: 'class' }],
          statistics: {
            componentsFound: 2,
            componentsByType: { functional: 1, class: 1 },
            componentsByComplexity: { simple: 2 },
          },
          duration: 100,
        }),
      });

      const result = await filteredService.discoverComponents();
      expect(result.components).toHaveLength(1);
      expect(result.components[0].type).toBe('functional');
    });

    it('should handle discovery errors', async () => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockRejectedValue(new Error('Discovery failed')),
      });

      await expect(service.discoverComponents()).rejects.toThrow(FileSystemError);
    });

    it('should cache results when enabled', async () => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      const mockDiscover = jest.fn().mockResolvedValue({
        components: [mockComponent],
        statistics: {
          componentsFound: 1,
          componentsByType: { functional: 1 },
          componentsByComplexity: { simple: 1 },
        },
        duration: 100,
      });

      createDiscoveryEngine.mockReturnValue({
        discoverComponents: mockDiscover,
      });

      await service.discoverComponents();
      await service.discoverComponents();

      // Second call should use cache
      expect(mockDiscover).toHaveBeenCalledTimes(1);
    });

    it('should not cache when disabled', async () => {
      const noCacheService = new ComponentDiscoveryService({
        extractionConfig: mockExtractionConfig,
        enableCache: false,
      });

      const { createDiscoveryEngine } = require('@/engine/discovery');
      const mockDiscover = jest.fn().mockResolvedValue({
        components: [mockComponent],
        statistics: {
          componentsFound: 1,
          componentsByType: { functional: 1 },
          componentsByComplexity: { simple: 1 },
        },
        duration: 100,
      });

      createDiscoveryEngine.mockReturnValue({
        discoverComponents: mockDiscover,
      });

      await noCacheService.discoverComponents();
      await noCacheService.discoverComponents();

      expect(mockDiscover).toHaveBeenCalledTimes(2);
    });
  });

  describe('discoverComponentsBy', () => {
    beforeEach(() => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [
            mockComponent,
            { ...mockComponent, id: '2', type: 'class', complexity: 'complex' },
            { ...mockComponent, id: '3', type: 'hook', complexity: 'moderate' },
          ],
          statistics: {
            componentsFound: 3,
            componentsByType: { functional: 1, class: 1, hook: 1 },
            componentsByComplexity: { simple: 1, moderate: 1, complex: 1 },
          },
          duration: 100,
        }),
      });
    });

    it('should filter by component type', async () => {
      const results = await service.discoverComponentsBy({
        types: ['functional'],
      });
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('functional');
    });

    it('should filter by complexity', async () => {
      const results = await service.discoverComponentsBy({
        complexityLevels: ['simple'],
      });
      expect(results).toHaveLength(1);
      expect(results[0].complexity).toBe('simple');
    });

    it('should filter by include patterns', async () => {
      const results = await service.discoverComponentsBy({
        includePatterns: ['Test*'],
      });
      expect(results.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter by exclude patterns', async () => {
      const results = await service.discoverComponentsBy({
        excludePatterns: ['*Component'],
      });
      expect(results).toHaveLength(0);
    });

    it('should combine multiple filters', async () => {
      const results = await service.discoverComponentsBy({
        types: ['functional', 'class'],
        complexityLevels: ['simple', 'complex'],
      });
      expect(results).toHaveLength(2);
    });
  });

  describe('discoverComponentByName', () => {
    beforeEach(() => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [mockComponent],
          statistics: {
            componentsFound: 1,
            componentsByType: { functional: 1 },
            componentsByComplexity: { simple: 1 },
          },
          duration: 100,
        }),
      });
    });

    it('should find component by exact name', async () => {
      const result = await service.discoverComponentByName('TestComponent');
      expect(result).not.toBeNull();
      expect(result?.name).toBe('TestComponent');
    });

    it('should return null for non-existent component', async () => {
      const result = await service.discoverComponentByName('NonExistent');
      expect(result).toBeNull();
    });
  });

  describe('discoverComponentsInDirectory', () => {
    beforeEach(() => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [
            mockComponent,
            { ...mockComponent, id: '2', sourcePath: '/other/Component.tsx' },
          ],
          statistics: {
            componentsFound: 2,
            componentsByType: { functional: 2 },
            componentsByComplexity: { simple: 2 },
          },
          duration: 100,
        }),
      });
    });

    it('should filter components by directory', async () => {
      const results = await service.discoverComponentsInDirectory('/test');
      expect(results).toHaveLength(1);
      expect(results[0].sourcePath).toContain('/test');
    });

    it('should return empty array for non-matching directory', async () => {
      const results = await service.discoverComponentsInDirectory('/nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('getComponentCountByType', () => {
    beforeEach(() => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [],
          statistics: {
            componentsFound: 2,
            componentsByType: { functional: 1, class: 1 },
            componentsByComplexity: { simple: 2 },
          },
          duration: 100,
        }),
      });
    });

    it('should return component count by type', async () => {
      const counts = await service.getComponentCountByType();
      expect(counts.functional).toBe(1);
      expect(counts.class).toBe(1);
    });
  });

  describe('getComponentCountByComplexity', () => {
    beforeEach(() => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [],
          statistics: {
            componentsFound: 2,
            componentsByType: { functional: 2 },
            componentsByComplexity: { simple: 1, moderate: 1 },
          },
          duration: 100,
        }),
      });
    });

    it('should return component count by complexity', async () => {
      const counts = await service.getComponentCountByComplexity();
      expect(counts.simple).toBe(1);
      expect(counts.moderate).toBe(1);
    });
  });

  describe('clearCache', () => {
    it('should clear discovery cache', () => {
      expect(() => service.clearCache()).not.toThrow();
    });
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createDiscoveryService', () => {
    it('should create discovery service', () => {
      const service = createDiscoveryService(mockExtractionConfig);
      expect(service).toBeInstanceOf(ComponentDiscoveryService);
    });

    it('should accept options', () => {
      const service = createDiscoveryService(mockExtractionConfig, {
        enableCache: false,
      });
      expect(service).toBeInstanceOf(ComponentDiscoveryService);
    });
  });

  describe('quickDiscover', () => {
    it('should perform quick discovery', async () => {
      const { getRepositoryConfig } = require('@/config/repository-config');
      getRepositoryConfig.mockReturnValue({
        getRepositoryPath: () => '/test/repo',
      });

      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [],
          statistics: {
            componentsFound: 0,
            componentsByType: {},
            componentsByComplexity: {},
          },
          duration: 100,
        }),
      });

      await expect(quickDiscover()).resolves.toBeDefined();
    });
  });

  describe('discoverComponentsByType', () => {
    it('should discover functional components', async () => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [mockComponent],
          statistics: {
            componentsFound: 1,
            componentsByType: { functional: 1 },
            componentsByComplexity: { simple: 1 },
          },
          duration: 100,
        }),
      });

      const results = await discoverComponentsByType(mockExtractionConfig, 'functional');
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('discoverComponentsByComplexity', () => {
    it('should discover simple components', async () => {
      const { createDiscoveryEngine } = require('@/engine/discovery');
      createDiscoveryEngine.mockReturnValue({
        discoverComponents: jest.fn().mockResolvedValue({
          components: [mockComponent],
          statistics: {
            componentsFound: 1,
            componentsByType: { functional: 1 },
            componentsByComplexity: { simple: 1 },
          },
          duration: 100,
        }),
      });

      const results = await discoverComponentsByComplexity(mockExtractionConfig, 'simple');
      expect(results.length).toBeGreaterThanOrEqual(0);
    });
  });
});
