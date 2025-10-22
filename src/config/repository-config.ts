/**
 * Repository Configuration
 *
 * Configuration management for DAISY v1 repository access and path resolution.
 * Provides centralized repository configuration with validation and path utilities.
 *
 * @fileoverview Repository configuration and path management
 * @version 1.0.0
 */

import { resolve, join, isAbsolute } from 'path';
import { promises as fs } from 'fs';
import { ConfigurationError } from '@/utils/errors';

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

/**
 * Repository configuration interface
 */
export interface RepositoryConfig {
  /** Absolute path to DAISY v1 repository root */
  readonly repositoryPath: string;

  /** Source directory within repository */
  readonly sourceDirectory: string;

  /** Component directories to scan */
  readonly componentDirectories: string[];

  /** Whether repository is read-only */
  readonly readOnly: boolean;

  /** Repository metadata */
  readonly metadata: RepositoryMetadata;
}

/**
 * Repository metadata
 */
export interface RepositoryMetadata {
  /** Repository name */
  readonly name: string;

  /** Repository version */
  readonly version: string;

  /** Repository description */
  readonly description?: string;

  /** Repository URL */
  readonly url?: string;
}

/**
 * Path resolution options
 */
export interface PathResolutionOptions {
  /** Whether to verify path exists */
  readonly verify?: boolean;

  /** Whether to create path if missing */
  readonly create?: boolean;

  /** Whether path must be a directory */
  readonly mustBeDirectory?: boolean;

  /** Whether path must be readable */
  readonly mustBeReadable?: boolean;
}

// ============================================================================
// REPOSITORY CONFIGURATION MANAGER
// ============================================================================

/**
 * Manages DAISY v1 repository configuration and access
 */
export class RepositoryConfigManager {
  private config: RepositoryConfig;
  private initialized: boolean = false;

  constructor(repositoryPath: string = '/Users/douglaswross/Code/eai/DAISY-1') {
    this.config = this.createDefaultConfig(repositoryPath);
  }

  /**
   * Initialize repository configuration
   */
  public async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    // Validate repository path
    await this.validateRepositoryPath();

    // Load repository metadata if available
    await this.loadRepositoryMetadata();

    this.initialized = true;
  }

  /**
   * Get repository configuration
   */
  public getConfig(): RepositoryConfig {
    this.ensureInitialized();
    return this.config;
  }

  /**
   * Get absolute repository path
   */
  public getRepositoryPath(): string {
    return this.config.repositoryPath;
  }

  /**
   * Get source directory path
   */
  public getSourcePath(): string {
    return join(this.config.repositoryPath, this.config.sourceDirectory);
  }

  /**
   * Get component directory paths
   */
  public getComponentPaths(): string[] {
    const sourcePath = this.getSourcePath();
    return this.config.componentDirectories.map(dir => join(sourcePath, dir));
  }

  /**
   * Resolve path relative to repository root
   *
   * @param relativePath - Path relative to repository root
   * @param options - Resolution options
   * @returns Absolute resolved path
   */
  public async resolvePath(
    relativePath: string,
    options: PathResolutionOptions = {}
  ): Promise<string> {
    const {
      verify = false,
      create = false,
      mustBeDirectory = false,
      mustBeReadable = true,
    } = options;

    // Resolve path
    const absolutePath = isAbsolute(relativePath)
      ? relativePath
      : join(this.config.repositoryPath, relativePath);

    if (verify || create || mustBeDirectory || mustBeReadable) {
      try {
        const stats = await fs.stat(absolutePath);

        if (mustBeDirectory && !stats.isDirectory()) {
          throw new ConfigurationError(
            `Path is not a directory: ${absolutePath}`,
            { filePath: absolutePath }
          );
        }

        if (mustBeReadable) {
          try {
            await fs.access(absolutePath, fs.constants.R_OK);
          } catch {
            throw new ConfigurationError(
              `Path is not readable: ${absolutePath}`,
              { filePath: absolutePath }
            );
          }
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT' && create) {
          // Create path if requested
          await fs.mkdir(absolutePath, { recursive: true });
        } else if (verify || mustBeDirectory || mustBeReadable) {
          throw error;
        }
      }
    }

    return absolutePath;
  }

  /**
   * Check if path is within repository
   *
   * @param path - Path to check
   * @returns Whether path is within repository
   */
  public isWithinRepository(path: string): boolean {
    const absolutePath = isAbsolute(path) ? path : resolve(path);
    const repoPath = this.config.repositoryPath;

    return absolutePath.startsWith(repoPath);
  }

  /**
   * Get relative path from repository root
   *
   * @param absolutePath - Absolute path
   * @returns Relative path from repository root
   */
  public getRelativePath(absolutePath: string): string {
    const repoPath = this.config.repositoryPath;

    if (!this.isWithinRepository(absolutePath)) {
      throw new ConfigurationError(
        `Path is outside repository: ${absolutePath}`,
        { filePath: absolutePath }
      );
    }

    return absolutePath.substring(repoPath.length + 1);
  }

  /**
   * Update repository configuration
   *
   * @param updates - Configuration updates
   */
  public updateConfig(updates: Partial<RepositoryConfig>): void {
    this.config = {
      ...this.config,
      ...updates,
    };
    this.initialized = false;
  }

  /**
   * Validate repository exists and is accessible
   */
  private async validateRepositoryPath(): Promise<void> {
    const repoPath = this.config.repositoryPath;

    try {
      const stats = await fs.stat(repoPath);

      if (!stats.isDirectory()) {
        throw new ConfigurationError(
          `Repository path is not a directory: ${repoPath}`,
          { filePath: repoPath }
        );
      }

      // Check read access
      await fs.access(repoPath, fs.constants.R_OK);

      // Check if source directory exists
      const sourcePath = this.getSourcePath();
      try {
        await fs.stat(sourcePath);
      } catch (error) {
        throw new ConfigurationError(
          `Source directory not found: ${sourcePath}`,
          { filePath: sourcePath },
          error as Error
        );
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new ConfigurationError(
          `Repository path does not exist: ${repoPath}`,
          { filePath: repoPath },
          error as Error
        );
      }
      throw error;
    }
  }

  /**
   * Load repository metadata from package.json or config file
   */
  private async loadRepositoryMetadata(): Promise<void> {
    const packageJsonPath = join(this.config.repositoryPath, 'package.json');

    try {
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      this.config = {
        ...this.config,
        metadata: {
          name: packageJson.name || 'DAISY v1',
          version: packageJson.version || '1.0.0',
          description: packageJson.description,
          url: packageJson.repository?.url,
        },
      };
    } catch {
      // Package.json not found or invalid, use defaults
      // This is not critical, so we don't throw an error
    }
  }

  /**
   * Create default configuration
   */
  private createDefaultConfig(repositoryPath: string): RepositoryConfig {
    return {
      repositoryPath: resolve(repositoryPath),
      sourceDirectory: 'src',
      componentDirectories: [
        'components',
        'modules',
        'ui',
        'common',
        'shared',
      ],
      readOnly: true,
      metadata: {
        name: 'DAISY v1',
        version: '1.0.0',
        description: 'DAISY v1 Component Library',
      },
    };
  }

  /**
   * Ensure manager is initialized
   */
  private ensureInitialized(): void {
    if (!this.initialized) {
      throw new ConfigurationError(
        'Repository configuration not initialized. Call initialize() first.',
        { operation: 'ensureInitialized' }
      );
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create repository configuration manager
 *
 * @param repositoryPath - Path to DAISY v1 repository
 * @returns Repository configuration manager instance
 */
export function createRepositoryConfig(
  repositoryPath?: string
): RepositoryConfigManager {
  return new RepositoryConfigManager(repositoryPath);
}

/**
 * Get default DAISY v1 repository path
 */
export function getDefaultRepositoryPath(): string {
  return '/Users/douglaswross/Code/eai/DAISY-1';
}

/**
 * Validate repository path exists and is accessible
 *
 * @param repositoryPath - Path to validate
 * @returns Whether path is valid
 */
export async function validateRepositoryPath(repositoryPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(repositoryPath);
    if (!stats.isDirectory()) {
      return false;
    }

    await fs.access(repositoryPath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Find component directories in repository
 *
 * @param repositoryPath - Repository root path
 * @returns Array of component directory paths
 */
export async function findComponentDirectories(
  repositoryPath: string
): Promise<string[]> {
  const srcPath = join(repositoryPath, 'src');
  const componentDirs: string[] = [];

  try {
    const entries = await fs.readdir(srcPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dirPath = join(srcPath, entry.name);

        // Check if directory contains component files
        const hasComponents = await hasComponentFiles(dirPath);
        if (hasComponents) {
          componentDirs.push(entry.name);
        }
      }
    }
  } catch (error) {
    throw new ConfigurationError(
      `Failed to scan component directories: ${srcPath}`,
      { filePath: srcPath },
      error as Error
    );
  }

  return componentDirs;
}

/**
 * Check if directory contains component files
 *
 * @param directoryPath - Directory to check
 * @returns Whether directory contains component files
 */
async function hasComponentFiles(directoryPath: string): Promise<boolean> {
  try {
    const entries = await fs.readdir(directoryPath);

    return entries.some(entry => {
      const ext = entry.split('.').pop();
      return ext === 'tsx' || ext === 'ts' || ext === 'jsx' || ext === 'js';
    });
  } catch {
    return false;
  }
}

// ============================================================================
// GLOBAL CONFIGURATION INSTANCE
// ============================================================================

let globalRepositoryConfig: RepositoryConfigManager | null = null;

/**
 * Initialize global repository configuration
 *
 * @param repositoryPath - Repository path (optional)
 */
export async function initializeRepositoryConfig(
  repositoryPath?: string
): Promise<void> {
  globalRepositoryConfig = createRepositoryConfig(repositoryPath);
  await globalRepositoryConfig.initialize();
}

/**
 * Get global repository configuration
 */
export function getRepositoryConfig(): RepositoryConfigManager {
  if (!globalRepositoryConfig) {
    throw new ConfigurationError(
      'Repository configuration not initialized. Call initializeRepositoryConfig() first.',
      { operation: 'getRepositoryConfig' }
    );
  }
  return globalRepositoryConfig;
}

/**
 * Check if global repository configuration is initialized
 */
export function isRepositoryConfigInitialized(): boolean {
  return globalRepositoryConfig !== null;
}
