/**
 * DAISY v1 Component Extractor
 *
 * Extracts DAISY v1 components and copies them to the /daisyv1/ baseline directory
 * with complete business logic preservation and tier organization.
 *
 * @fileoverview Component extraction and baseline preservation
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { FileSystemManager } from '@/utils/filesystem';
import { getGlobalLogger } from '@/utils/logging';
import type {
  ComponentDefinition,
  ExtractionConfig,
  ComplexityLevel,
} from '@/types';

// ============================================================================
// EXTRACTOR TYPES
// ============================================================================

/**
 * Extraction result for a single component
 */
export interface ExtractionResult {
  /** Component that was extracted */
  readonly component: ComponentDefinition;

  /** Source file path */
  readonly sourcePath: string;

  /** Destination baseline path */
  readonly baselinePath: string;

  /** Extracted files */
  readonly extractedFiles: ExtractedFile[];

  /** Extraction success status */
  readonly success: boolean;

  /** Extraction errors */
  readonly errors: Error[];

  /** Extraction warnings */
  readonly warnings: string[];

  /** Extraction duration in milliseconds */
  readonly duration: number;
}

/**
 * Extracted file information
 */
export interface ExtractedFile {
  /** Original file path */
  readonly originalPath: string;

  /** Baseline file path */
  readonly baselinePath: string;

  /** File type */
  readonly type: 'component' | 'types' | 'styles' | 'test' | 'dependency';

  /** File size in bytes */
  readonly size: number;

  /** Whether file was modified during extraction */
  readonly modified: boolean;
}

/**
 * Tier configuration for component organization
 */
export interface TierConfig {
  /** Tier number (1-4) */
  readonly tier: 1 | 2 | 3 | 4;

  /** Tier name */
  readonly name: string;

  /** Complexity levels in this tier */
  readonly complexityLevels: ComplexityLevel[];

  /** Tier directory name */
  readonly directory: string;
}

/**
 * Extraction options
 */
export interface ExtractionOptions {
  /** Whether to overwrite existing baseline files */
  readonly overwrite?: boolean;

  /** Whether to preserve file timestamps */
  readonly preserveTimestamps?: boolean;

  /** Whether to extract dependencies */
  readonly extractDependencies?: boolean;

  /** Whether to extract tests */
  readonly extractTests?: boolean;

  /** Whether to extract styles */
  readonly extractStyles?: boolean;

  /** Tier configuration (auto-detect if not specified) */
  readonly tier?: 1 | 2 | 3 | 4;
}

// ============================================================================
// TIER CONFIGURATION
// ============================================================================

const TIER_CONFIGS: TierConfig[] = [
  {
    tier: 1,
    name: 'Simple Components',
    complexityLevels: ['simple'],
    directory: 'tier1-simple',
  },
  {
    tier: 2,
    name: 'Moderate Components',
    complexityLevels: ['moderate'],
    directory: 'tier2-moderate',
  },
  {
    tier: 3,
    name: 'Complex Components',
    complexityLevels: ['complex'],
    directory: 'tier3-complex',
  },
  {
    tier: 4,
    name: 'Critical Components',
    complexityLevels: ['critical'],
    directory: 'tier4-critical',
  },
];

// ============================================================================
// V1 COMPONENT EXTRACTOR
// ============================================================================

/**
 * Extracts DAISY v1 components to baseline directory
 */
export class V1ComponentExtractor {
  private readonly config: ExtractionConfig;
  private readonly fileManager: FileSystemManager;
  private readonly logger = getGlobalLogger('V1ComponentExtractor');

  constructor(config: ExtractionConfig) {
    this.config = config;
    this.fileManager = new FileSystemManager();
  }

  /**
   * Extract component to baseline directory
   *
   * @param component - Component to extract
   * @param options - Extraction options
   * @returns Extraction result
   */
  public async extractComponent(
    component: ComponentDefinition,
    options: ExtractionOptions = {}
  ): Promise<ExtractionResult> {
    const startTime = Date.now();

    this.logger.info(`Extracting component: ${component.name}`, {
      type: component.type,
      complexity: component.complexity,
    });

    const extractedFiles: ExtractedFile[] = [];
    const errors: Error[] = [];
    const warnings: string[] = [];

    try {
      // Determine tier
      const tier = options.tier || this.determineTier(component);
      const tierConfig = TIER_CONFIGS[tier - 1];

      if (!tierConfig) {
        throw new Error(`Invalid tier: ${tier}`);
      }

      // Create baseline directory structure
      const baselinePath = await this.createBaselineDirectory(component, tierConfig);

      // Extract main component file
      const componentFile = await this.extractComponentFile(
        component,
        baselinePath,
        options
      );
      extractedFiles.push(componentFile);

      // Extract type definitions
      const typeFiles = await this.extractTypeFiles(
        component,
        baselinePath,
        options
      );
      extractedFiles.push(...typeFiles);

      // Extract dependencies if requested
      if (options.extractDependencies) {
        try {
          const depFiles = await this.extractDependencyFiles(
            component,
            baselinePath,
            options
          );
          extractedFiles.push(...depFiles);
        } catch (error) {
          warnings.push(`Failed to extract some dependencies: ${(error as Error).message}`);
        }
      }

      // Extract test files if requested
      if (options.extractTests) {
        try {
          const testFiles = await this.extractTestFiles(
            component,
            baselinePath,
            options
          );
          extractedFiles.push(...testFiles);
        } catch (error) {
          warnings.push(`Failed to extract test files: ${(error as Error).message}`);
        }
      }

      // Extract style files if requested
      if (options.extractStyles) {
        try {
          const styleFiles = await this.extractStyleFiles(
            component,
            baselinePath,
            options
          );
          extractedFiles.push(...styleFiles);
        } catch (error) {
          warnings.push(`Failed to extract style files: ${(error as Error).message}`);
        }
      }

      // Create README with extraction metadata
      await this.createExtractionReadme(component, baselinePath, {
        tier,
        tierConfig,
        extractedFiles,
      });

      this.logger.info(`Component extracted successfully: ${component.name}`, {
        filesExtracted: extractedFiles.length,
        baselinePath,
      });

      return {
        component,
        sourcePath: join(this.config.sourcePath, component.sourcePath),
        baselinePath,
        extractedFiles,
        success: true,
        errors,
        warnings,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.logger.error(`Component extraction failed: ${component.name}`, error as Error);

      return {
        component,
        sourcePath: join(this.config.sourcePath, component.sourcePath),
        baselinePath: '',
        extractedFiles,
        success: false,
        errors: [error as Error, ...errors],
        warnings,
        duration: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract multiple components
   *
   * @param components - Components to extract
   * @param options - Extraction options
   * @returns Extraction results
   */
  public async extractComponents(
    components: ComponentDefinition[],
    options: ExtractionOptions = {}
  ): Promise<ExtractionResult[]> {
    this.logger.info(`Extracting ${components.length} components`);

    const results: ExtractionResult[] = [];

    for (const component of components) {
      const result = await this.extractComponent(component, options);
      results.push(result);
    }

    const successCount = results.filter(r => r.success).length;
    this.logger.info(`Extraction completed: ${successCount}/${components.length} successful`);

    return results;
  }

  /**
   * Determine tier for component based on complexity
   */
  private determineTier(component: ComponentDefinition): 1 | 2 | 3 | 4 {
    for (const tierConfig of TIER_CONFIGS) {
      if (tierConfig.complexityLevels.includes(component.complexity)) {
        return tierConfig.tier;
      }
    }
    return 1; // Default to tier 1
  }

  /**
   * Create baseline directory structure
   */
  private async createBaselineDirectory(
    component: ComponentDefinition,
    tierConfig: TierConfig
  ): Promise<string> {
    const baselinePath = join(
      this.config.outputPath,
      'daisyv1',
      tierConfig.directory,
      component.name
    );

    await this.fileManager.createDirectory(baselinePath);

    return baselinePath;
  }

  /**
   * Extract main component file
   */
  private async extractComponentFile(
    component: ComponentDefinition,
    baselinePath: string,
    options: ExtractionOptions
  ): Promise<ExtractedFile> {
    const sourcePath = join(this.config.sourcePath, component.sourcePath);
    const fileName = basename(sourcePath);
    const destPath = join(baselinePath, fileName);

    // Read source file
    const content = await this.fileManager.readFile(sourcePath);

    // Write to baseline
    await this.fileManager.writeFile(destPath, content, {
      overwrite: options.overwrite ?? true,
      preserveTimestamps: options.preserveTimestamps ?? true,
    });

    const stats = await fs.stat(destPath);

    return {
      originalPath: sourcePath,
      baselinePath: destPath,
      type: 'component',
      size: stats.size,
      modified: false,
    };
  }

  /**
   * Extract type definition files
   */
  private async extractTypeFiles(
    component: ComponentDefinition,
    baselinePath: string,
    options: ExtractionOptions
  ): Promise<ExtractedFile[]> {
    const extractedFiles: ExtractedFile[] = [];
    const sourcePath = join(this.config.sourcePath, component.sourcePath);
    const sourceDir = dirname(sourcePath);
    const baseName = basename(sourcePath, extname(sourcePath));

    // Look for .d.ts files
    const typeFilePaths = [
      join(sourceDir, `${baseName}.d.ts`),
      join(sourceDir, 'types.ts'),
      join(sourceDir, `${baseName}.types.ts`),
    ];

    for (const typeFilePath of typeFilePaths) {
      try {
        if (await this.fileManager.exists(typeFilePath)) {
          const fileName = basename(typeFilePath);
          const destPath = join(baselinePath, fileName);

          await this.fileManager.copyFile(typeFilePath, destPath, {
            overwrite: options.overwrite ?? true,
          });

          const stats = await fs.stat(destPath);

          extractedFiles.push({
            originalPath: typeFilePath,
            baselinePath: destPath,
            type: 'types',
            size: stats.size,
            modified: false,
          });
        }
      } catch (error) {
        this.logger.debug(`Type file not found: ${typeFilePath}`);
      }
    }

    return extractedFiles;
  }

  /**
   * Extract dependency files
   */
  private async extractDependencyFiles(
    component: ComponentDefinition,
    baselinePath: string,
    options: ExtractionOptions
  ): Promise<ExtractedFile[]> {
    const extractedFiles: ExtractedFile[] = [];

    // Extract internal dependencies only
    const internalDeps = component.dependencies.filter(
      dep => dep.type === 'internal' || dep.type === 'component'
    );

    for (const dep of internalDeps) {
      if (dep.source) {
        try {
          const depSourcePath = join(this.config.sourcePath, dep.source);

          if (await this.fileManager.exists(depSourcePath)) {
            const depsDir = join(baselinePath, 'dependencies');
            await this.fileManager.createDirectory(depsDir);

            const fileName = basename(depSourcePath);
            const destPath = join(depsDir, fileName);

            await this.fileManager.copyFile(depSourcePath, destPath, {
              overwrite: options.overwrite ?? true,
            });

            const stats = await fs.stat(destPath);

            extractedFiles.push({
              originalPath: depSourcePath,
              baselinePath: destPath,
              type: 'dependency',
              size: stats.size,
              modified: false,
            });
          }
        } catch (error) {
          this.logger.debug(`Failed to extract dependency: ${dep.name}`);
        }
      }
    }

    return extractedFiles;
  }

  /**
   * Extract test files
   */
  private async extractTestFiles(
    component: ComponentDefinition,
    baselinePath: string,
    options: ExtractionOptions
  ): Promise<ExtractedFile[]> {
    const extractedFiles: ExtractedFile[] = [];
    const sourcePath = join(this.config.sourcePath, component.sourcePath);
    const sourceDir = dirname(sourcePath);
    const baseName = basename(sourcePath, extname(sourcePath));

    // Look for test files
    const testFilePaths = [
      join(sourceDir, `${baseName}.test.ts`),
      join(sourceDir, `${baseName}.test.tsx`),
      join(sourceDir, `${baseName}.spec.ts`),
      join(sourceDir, `${baseName}.spec.tsx`),
    ];

    for (const testFilePath of testFilePaths) {
      try {
        if (await this.fileManager.exists(testFilePath)) {
          const testsDir = join(baselinePath, '__tests__');
          await this.fileManager.createDirectory(testsDir);

          const fileName = basename(testFilePath);
          const destPath = join(testsDir, fileName);

          await this.fileManager.copyFile(testFilePath, destPath, {
            overwrite: options.overwrite ?? true,
          });

          const stats = await fs.stat(destPath);

          extractedFiles.push({
            originalPath: testFilePath,
            baselinePath: destPath,
            type: 'test',
            size: stats.size,
            modified: false,
          });
        }
      } catch (error) {
        this.logger.debug(`Test file not found: ${testFilePath}`);
      }
    }

    return extractedFiles;
  }

  /**
   * Extract style files
   */
  private async extractStyleFiles(
    component: ComponentDefinition,
    baselinePath: string,
    options: ExtractionOptions
  ): Promise<ExtractedFile[]> {
    const extractedFiles: ExtractedFile[] = [];
    const sourcePath = join(this.config.sourcePath, component.sourcePath);
    const sourceDir = dirname(sourcePath);
    const baseName = basename(sourcePath, extname(sourcePath));

    // Look for style files
    const styleFilePaths = [
      join(sourceDir, `${baseName}.css`),
      join(sourceDir, `${baseName}.scss`),
      join(sourceDir, `${baseName}.module.css`),
      join(sourceDir, `${baseName}.module.scss`),
      join(sourceDir, 'styles.css'),
      join(sourceDir, 'styles.scss'),
    ];

    for (const styleFilePath of styleFilePaths) {
      try {
        if (await this.fileManager.exists(styleFilePath)) {
          const fileName = basename(styleFilePath);
          const destPath = join(baselinePath, fileName);

          await this.fileManager.copyFile(styleFilePath, destPath, {
            overwrite: options.overwrite ?? true,
          });

          const stats = await fs.stat(destPath);

          extractedFiles.push({
            originalPath: styleFilePath,
            baselinePath: destPath,
            type: 'styles',
            size: stats.size,
            modified: false,
          });
        }
      } catch (error) {
        this.logger.debug(`Style file not found: ${styleFilePath}`);
      }
    }

    return extractedFiles;
  }

  /**
   * Create README with extraction metadata
   */
  private async createExtractionReadme(
    component: ComponentDefinition,
    baselinePath: string,
    metadata: {
      tier: number;
      tierConfig: TierConfig;
      extractedFiles: ExtractedFile[];
    }
  ): Promise<void> {
    const readmePath = join(baselinePath, 'README.md');

    const content = `# ${component.name} - DAISY v1 Baseline

## Component Information

- **Name**: ${component.name}
- **Type**: ${component.type}
- **Complexity**: ${component.complexity}
- **Tier**: ${metadata.tier} (${metadata.tierConfig.name})
- **Source**: ${component.sourcePath}

## Migration Status

- **Status**: ${component.migrationStatus}
- **Extracted**: ${new Date().toISOString()}

## Extracted Files

${metadata.extractedFiles.map(f => `- \`${basename(f.baselinePath)}\` (${f.type}, ${f.size} bytes)`).join('\n')}

## Component Props

${component.props.map(p => `- **${p.name}** (${p.type}${p.required ? ', required' : ', optional'}): ${p.description || 'No description'}`).join('\n')}

## Business Logic

${component.businessLogic.map(bl => `- **${bl.name}()**: ${bl.purpose}`).join('\n')}

## Dependencies

${component.dependencies.map(d => `- ${d.name} (${d.type})`).join('\n')}

## React Patterns

${component.reactPatterns.join(', ')}

## Notes

This is the DAISY v1 baseline preservation. Business logic and functionality
must be maintained in the migrated Configurator v2 version.

**DO NOT MODIFY** - This baseline serves as the reference implementation.
`;

    await this.fileManager.writeFile(readmePath, content);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create V1 component extractor
 *
 * @param config - Extraction configuration
 * @returns Extractor instance
 */
export function createV1Extractor(config: ExtractionConfig): V1ComponentExtractor {
  return new V1ComponentExtractor(config);
}

/**
 * Extract single component to baseline
 *
 * @param component - Component to extract
 * @param config - Extraction configuration
 * @param options - Extraction options
 * @returns Extraction result
 */
export async function extractComponentToBaseline(
  component: ComponentDefinition,
  config: ExtractionConfig,
  options?: ExtractionOptions
): Promise<ExtractionResult> {
  const extractor = createV1Extractor(config);
  return extractor.extractComponent(component, options);
}
