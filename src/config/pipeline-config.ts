/**
 * Pipeline Configuration
 *
 * Central configuration management for the component migration pipeline.
 *
 * @fileoverview Pipeline configuration and settings
 * @version 1.0.0
 */

import type { ExtractionConfig } from '@/types';
import { getRepositoryConfig } from './repository-config';

export function createDefaultPipelineConfig(): ExtractionConfig {
  const repoConfig = getRepositoryConfig();

  return {
    sourcePath: repoConfig.getRepositoryPath(),
    outputPath: process.cwd(),
    preserveBaseline: true,
    processing: {
      mode: 'parallel',
      concurrency: 4,
      continueOnError: true,
      retry: {
        maxAttempts: 3,
        delay: 1000,
        backoffMultiplier: 2,
        retryableOperations: ['file-read', 'file-write', 'ast-parsing'],
      },
      filters: {
        include: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
        exclude: ['**/node_modules/**', '**/*.test.*', '**/*.spec.*'],
        types: [],
        complexity: [],
        custom: [],
      },
    },
    performance: {
      memoryLimit: 2048,
      timeoutPerComponent: 1800000,
      maxBundleSizeIncrease: 120,
      monitoring: true,
    },
    validation: {
      strict: true,
      typescript: true,
      eslint: true,
      componentStructure: true,
      businessLogicPreservation: true,
    },
    output: {
      generateDeclarations: true,
      generateDocs: true,
      generateExamples: true,
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
      outputs: ['console', 'file'],
      format: 'detailed',
      timestamps: true,
      stackTraces: true,
    },
  };
}

export function loadPipelineConfig(): ExtractionConfig {
  return createDefaultPipelineConfig();
}
