/**
 * DAISY v1 Component Discovery Service
 *
 * Pipeline-integrated component discovery service that wraps the core discovery
 * engine and provides extraction-specific functionality for the migration pipeline.
 *
 * @fileoverview Pipeline component discovery service
 * @version 1.0.0
 */

import type {
  ComponentDiscoveryEngine} from '@/engine/discovery';
import {
  type DiscoveryOptions,
  type DiscoveryResult,
  createDiscoveryEngine,
} from '@/engine/discovery';
import { getRepositoryConfig } from '@/config/repository-config';
import { getGlobalLogger } from '@/utils/logging';
import type {
  ComplexityLevel,
  ComponentDefinition,
  ComponentType,
  ExtractionConfig,
} from '@/types';
import { FileSystemError } from '@/utils/errors';

// ============================================================================
// DISCOVERY SERVICE TYPES
// ============================================================================

/**
 * Discovery filter configuration
 */
export interface DiscoveryFilter {
  /** Component types to include */
  readonly types?: ComponentType[];

  /** Complexity levels to include */
  readonly complexityLevels?: ComplexityLevel[];

  /** Component name patterns to include */
  readonly includePatterns?: string[];

  /** Component name patterns to exclude */
  readonly excludePatterns?: string[];

  /** Minimum component size in lines */
  readonly minSize?: number;

  /** Maximum component size in lines */
  readonly maxSize?: number;
}

/**
 * Discovery service configuration
 */
export interface DiscoveryServiceConfig {
  /** Extraction configuration */
  readonly extractionConfig: ExtractionConfig;

  /** Discovery options */
  readonly discoveryOptions?: DiscoveryOptions;

  /** Discovery filters */
  readonly filters?: DiscoveryFilter;

  /** Enable caching */
  readonly enableCache?: boolean;

  /** Cache TTL in milliseconds */
  readonly cacheTtl?: number;
}

/**
 * Cached discovery result
 */
interface CachedDiscoveryResult {
  /** Discovery result */
  readonly result: DiscoveryResult;

  /** Cache timestamp */
  readonly timestamp: number;

  /** Cache key */
  readonly key: string;
}

// ============================================================================
// COMPONENT DISCOVERY SERVICE
// ============================================================================

/**
 * Pipeline-integrated component discovery service
 */
export class ComponentDiscoveryService {
  private readonly config: DiscoveryServiceConfig;
  private readonly logger = getGlobalLogger('ComponentDiscoveryService');
  private discoveryEngine: ComponentDiscoveryEngine | null = null;
  private readonly cache: Map<string, CachedDiscoveryResult> = new Map();

  constructor(config: DiscoveryServiceConfig) {
    this.config = {
      enableCache: true,
      cacheTtl: 5 * 60 * 1000, // 5 minutes
      ...config,
    };
  }

  /**
   * Discover components in DAISY v1 repository
   */
  public async discoverComponents(): Promise<DiscoveryResult> {
    const cacheKey = this.generateCacheKey();

    // Check cache
    if (this.config.enableCache) {
      const cached = this.getCachedResult(cacheKey);
      if (cached) {
        this.logger.debug('Using cached discovery result');
        return cached;
      }
    }

    this.logger.info('Starting component discovery');

    try {
      // Initialize discovery engine
      const engine = this.getDiscoveryEngine();

      // Perform discovery
      const result = await engine.discoverComponents();

      // Apply filters
      const filteredResult = this.applyFilters(result);

      // Cache result
      if (this.config.enableCache) {
        this.cacheResult(cacheKey, filteredResult);
      }

      this.logger.info('Component discovery completed', {
        componentsFound: filteredResult.components.length,
        duration: filteredResult.duration,
      });

      return filteredResult;
    } catch (error) {
      this.logger.error('Component discovery failed', error as Error);
      throw new FileSystemError(
        'Failed to discover components',
        {
          operation: 'discoverComponents',
          filePath: this.config.extractionConfig.sourcePath,
        },
        error as Error,
      );
    }
  }

  /**
   * Discover components matching specific criteria
   *
   * @param criteria - Discovery criteria
   * @returns Filtered component definitions
   */
  public async discoverComponentsBy(
    criteria: DiscoveryFilter,
  ): Promise<ComponentDefinition[]> {
    const result = await this.discoverComponents();

    return result.components.filter(component =>
      this.matchesCriteria(component, criteria),
    );
  }

  /**
   * Discover single component by name
   *
   * @param componentName - Component name
   * @returns Component definition or null
   */
  public async discoverComponentByName(
    componentName: string,
  ): Promise<ComponentDefinition | null> {
    const result = await this.discoverComponents();

    return result.components.find(c => c.name === componentName) || null;
  }

  /**
   * Discover components in specific directory
   *
   * @param directoryPath - Directory path relative to repository root
   * @returns Component definitions
   */
  public async discoverComponentsInDirectory(
    directoryPath: string,
  ): Promise<ComponentDefinition[]> {
    const result = await this.discoverComponents();

    return result.components.filter(component =>
      component.sourcePath.startsWith(directoryPath),
    );
  }

  /**
   * Get component count by type
   *
   * @returns Component count by type
   */
  public async getComponentCountByType(): Promise<
    Record<ComponentType, number>
  > {
    const result = await this.discoverComponents();
    return result.statistics.componentsByType;
  }

  /**
   * Get component count by complexity
   *
   * @returns Component count by complexity
   */
  public async getComponentCountByComplexity(): Promise<
    Record<ComplexityLevel, number>
  > {
    const result = await this.discoverComponents();
    return result.statistics.componentsByComplexity;
  }

  /**
   * Clear discovery cache
   */
  public clearCache(): void {
    this.cache.clear();
    this.logger.debug('Discovery cache cleared');
  }

  /**
   * Get discovery engine instance
   */
  private getDiscoveryEngine(): ComponentDiscoveryEngine {
    if (!this.discoveryEngine) {
      this.discoveryEngine = createDiscoveryEngine(
        this.config.extractionConfig,
        this.logger,
        this.config.discoveryOptions,
      );
    }
    return this.discoveryEngine;
  }

  /**
   * Apply filters to discovery result
   */
  private applyFilters(result: DiscoveryResult): DiscoveryResult {
    if (!this.config.filters) {
      return result;
    }

    const filteredComponents = result.components.filter(component =>
      this.matchesCriteria(component, this.config.filters || {}),
    );

    return {
      ...result,
      components: filteredComponents,
      statistics: {
        ...result.statistics,
        componentsFound: filteredComponents.length,
      },
    };
  }

  /**
   * Check if component matches filter criteria
   */
  private matchesCriteria(
    component: ComponentDefinition,
    criteria: DiscoveryFilter,
  ): boolean {
    // Type filter
    if (criteria.types && !criteria.types.includes(component.type)) {
      return false;
    }

    // Complexity filter
    if (
      criteria.complexityLevels &&
      !criteria.complexityLevels.includes(component.complexity)
    ) {
      return false;
    }

    // Include pattern filter
    if (criteria.includePatterns) {
      const matches = criteria.includePatterns.some(pattern =>
        this.matchesPattern(component.name, pattern),
      );
      if (!matches) {
        return false;
      }
    }

    // Exclude pattern filter
    if (criteria.excludePatterns) {
      const matches = criteria.excludePatterns.some(pattern =>
        this.matchesPattern(component.name, pattern),
      );
      if (matches) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if name matches pattern (supports wildcards)
   */
  private matchesPattern(name: string, pattern: string): boolean {
    const regexPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${regexPattern}$`, 'i');
    return regex.test(name);
  }

  /**
   * Generate cache key for discovery result
   */
  private generateCacheKey(): string {
    const parts = [
      this.config.extractionConfig.sourcePath,
      JSON.stringify(this.config.filters || {}),
      JSON.stringify(this.config.discoveryOptions || {}),
    ];
    return parts.join('|');
  }

  /**
   * Get cached discovery result
   */
  private getCachedResult(key: string): DiscoveryResult | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    const now = Date.now();
    const age = now - cached.timestamp;

    if (age > (this.config.cacheTtl || 0)) {
      this.cache.delete(key);
      return null;
    }

    return cached.result;
  }

  /**
   * Cache discovery result
   */
  private cacheResult(key: string, result: DiscoveryResult): void {
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      key,
    });

    // Clean up old cache entries
    this.cleanupCache();
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const maxAge = this.config.cacheTtl || 0;

    for (const [key, cached] of this.cache.entries()) {
      const age = now - cached.timestamp;
      if (age > maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create component discovery service
 *
 * @param extractionConfig - Extraction configuration
 * @param options - Discovery options
 * @returns Discovery service instance
 */
export function createDiscoveryService(
  extractionConfig: ExtractionConfig,
  options?: Partial<DiscoveryServiceConfig>,
): ComponentDiscoveryService {
  return new ComponentDiscoveryService({
    extractionConfig,
    ...options,
  });
}

/**
 * Quick component discovery with repository config
 *
 * @returns Discovery result
 */
export async function quickDiscover(): Promise<DiscoveryResult> {
  const repoConfig = getRepositoryConfig();
  // const logger = getGlobalLogger('quickDiscover'); // TODO: Use logger for progress tracking

  const extractionConfig: ExtractionConfig = {
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
        retryableOperations: ['file-read', 'ast-parsing'],
      },
      filters: {
        include: ['**/*.tsx', '**/*.ts'],
        exclude: ['**/node_modules/**', '**/*.test.*'],
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

  const service = createDiscoveryService(extractionConfig);
  return service.discoverComponents();
}

/**
 * Discover components by type
 *
 * @param extractionConfig - Extraction configuration
 * @param types - Component types to discover
 * @returns Component definitions
 */
export async function discoverComponentsByType(
  extractionConfig: ExtractionConfig,
  ...types: ComponentType[]
): Promise<ComponentDefinition[]> {
  const service = createDiscoveryService(extractionConfig, {
    filters: { types },
  });

  return service.discoverComponentsBy({ types });
}

/**
 * Discover components by complexity
 *
 * @param extractionConfig - Extraction configuration
 * @param complexityLevels - Complexity levels to discover
 * @returns Component definitions
 */
export async function discoverComponentsByComplexity(
  extractionConfig: ExtractionConfig,
  ...complexityLevels: ComplexityLevel[]
): Promise<ComponentDefinition[]> {
  const service = createDiscoveryService(extractionConfig, {
    filters: { complexityLevels },
  });

  return service.discoverComponentsBy({ complexityLevels });
}
