/**
 * Pipeline Configuration Tests
 */

import { describe, it, expect, jest } from '@jest/globals';
import {
  createDefaultPipelineConfig,
  loadPipelineConfig,
} from '@/config/pipeline-config';

jest.mock('@/config/repository-config');

describe('Pipeline Configuration', () => {
  beforeEach(() => {
    const { getRepositoryConfig } = require('@/config/repository-config');
    getRepositoryConfig.mockReturnValue({
      getRepositoryPath: () => '/test/repo',
    });
  });

  describe('createDefaultPipelineConfig', () => {
    it('should create default configuration', () => {
      const config = createDefaultPipelineConfig();
      expect(config).toBeDefined();
      expect(config.sourcePath).toBe('/test/repo');
      expect(config.preserveBaseline).toBe(true);
    });

    it('should have processing configuration', () => {
      const config = createDefaultPipelineConfig();
      expect(config.processing.mode).toBe('parallel');
      expect(config.processing.concurrency).toBe(4);
    });

    it('should have performance configuration', () => {
      const config = createDefaultPipelineConfig();
      expect(config.performance.memoryLimit).toBe(2048);
      expect(config.performance.monitoring).toBe(true);
    });

    it('should have validation configuration', () => {
      const config = createDefaultPipelineConfig();
      expect(config.validation.strict).toBe(true);
      expect(config.validation.typescript).toBe(true);
    });

    it('should have output configuration', () => {
      const config = createDefaultPipelineConfig();
      expect(config.output.generateDeclarations).toBe(true);
      expect(config.output.format.typescript).toBe('.tsx');
    });

    it('should have logging configuration', () => {
      const config = createDefaultPipelineConfig();
      expect(config.logging.level).toBe('info');
      expect(config.logging.outputs).toContain('console');
    });
  });

  describe('loadPipelineConfig', () => {
    it('should load configuration', () => {
      const config = loadPipelineConfig();
      expect(config).toBeDefined();
      expect(config.sourcePath).toBeDefined();
    });
  });
});
