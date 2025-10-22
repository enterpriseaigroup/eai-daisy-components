/**
 * File Operations Utilities
 *
 * Provides high-level file operation utilities specifically tailored
 * for component migration pipeline needs including batch operations,
 * safe file handling, and migration-specific helpers.
 *
 * @fileoverview File operation utilities for migration pipeline
 * @version 1.0.0
 */

import { readFile, writeFile, copyFile, mkdir, rm, stat } from 'fs/promises';
import { resolve, join, dirname, basename, extname } from 'path';
import type { ComponentDefinition, GeneratedFile } from '@/types';
import { FileSystemManager, type FileInfo, type DirectoryScanResult } from './filesystem';
import { getGlobalLogger } from './logging';

// ============================================================================
// FILE OPERATION TYPES
// ============================================================================

/**
 * Batch file operation result
 */
export interface BatchOperationResult {
  /** Total files processed */
  readonly total: number;

  /** Successfully processed files */
  readonly successful: number;

  /** Failed operations */
  readonly failed: number;

  /** Individual file results */
  readonly results: FileOperationResult[];

  /** Operation duration in milliseconds */
  readonly duration: number;
}

/**
 * Individual file operation result
 */
export interface FileOperationResult {
  /** File path */
  readonly path: string;

  /** Operation success status */
  readonly success: boolean;

  /** Error message if failed */
  readonly error?: string;

  /** Operation duration */
  readonly duration: number;
}

/**
 * File copy options
 */
export interface CopyOptions {
  /** Whether to overwrite existing files */
  readonly overwrite?: boolean;

  /** Whether to preserve timestamps */
  readonly preserveTimestamps?: boolean;

  /** Whether to create parent directories */
  readonly createParents?: boolean;

  /** File name transformation function */
  readonly transformName?: (name: string) => string;
}

/**
 * Backup options
 */
export interface BackupOptions {
  /** Backup directory path */
  readonly backupDir: string;

  /** Whether to include timestamp in backup */
  readonly includeTimestamp?: boolean;

  /** Backup file suffix */
  readonly suffix?: string;
}

// ============================================================================
// FILE OPERATIONS CLASS
// ============================================================================

/**
 * High-level file operations manager
 *
 * Provides migration-specific file operations with error handling,
 * logging, and batch processing capabilities.
 */
export class FileOperations {
  private readonly logger = getGlobalLogger('FileOperations');
  private readonly fileSystem: FileSystemManager;

  constructor() {
    this.fileSystem = new FileSystemManager();
  }

  /**
   * Copy component baseline to daisyv1 directory
   *
   * @param sourcePath - Source component path
   * @param baselineDir - Baseline directory path
   * @param options - Copy options
   * @returns Copied file path
   */
  public async copyToBaseline(
    sourcePath: string,
    baselineDir: string,
    options: CopyOptions = {}
  ): Promise<string> {
    this.logger.info(`Copying component to baseline: ${sourcePath}`);

    const { overwrite = false, createParents = true, transformName } = options;

    const resolvedSource = resolve(sourcePath);
    const fileName = transformName
      ? transformName(basename(sourcePath))
      : basename(sourcePath);
    const destination = join(baselineDir, fileName);

    try {
      // Check if destination exists
      if (!overwrite) {
        const exists = await this.fileSystem.exists(destination);
        if (exists) {
          throw new Error(`Baseline file already exists: ${destination}`);
        }
      }

      // Create parent directories
      if (createParents) {
        await mkdir(dirname(destination), { recursive: true });
      }

      // Copy file
      await this.fileSystem.copyFile(resolvedSource, destination, options);

      this.logger.info(`Successfully copied to baseline: ${destination}`);
      return destination;

    } catch (error) {
      this.logger.error(`Failed to copy to baseline: ${sourcePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Save migrated component to output directory
   *
   * @param component - Component definition
   * @param code - Generated component code
   * @param outputDir - Output directory path
   * @returns Saved file path
   */
  public async saveMigratedComponent(
    component: ComponentDefinition,
    code: string,
    outputDir: string
  ): Promise<string> {
    this.logger.info(`Saving migrated component: ${component.name}`);

    const fileName = `${component.name}.tsx`;
    const outputPath = join(outputDir, fileName);

    try {
      await mkdir(dirname(outputPath), { recursive: true });
      await writeFile(outputPath, code, 'utf-8');

      this.logger.info(`Successfully saved migrated component: ${outputPath}`);
      return outputPath;

    } catch (error) {
      this.logger.error(`Failed to save migrated component: ${component.name}`, error as Error);
      throw error;
    }
  }

  /**
   * Batch copy files to destination
   *
   * @param files - Array of source file paths
   * @param destinationDir - Destination directory
   * @param options - Copy options
   * @returns Batch operation result
   */
  public async batchCopy(
    files: string[],
    destinationDir: string,
    options: CopyOptions = {}
  ): Promise<BatchOperationResult> {
    this.logger.info(`Batch copying ${files.length} files to ${destinationDir}`);

    const startTime = Date.now();
    const results: FileOperationResult[] = [];
    let successCount = 0;
    let failCount = 0;

    for (const file of files) {
      const fileStart = Date.now();

      try {
        const fileName = options.transformName
          ? options.transformName(basename(file))
          : basename(file);
        const destination = join(destinationDir, fileName);

        await this.fileSystem.copyFile(file, destination, options);

        results.push({
          path: file,
          success: true,
          duration: Date.now() - fileStart,
        });
        successCount++;

      } catch (error) {
        results.push({
          path: file,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - fileStart,
        });
        failCount++;
        this.logger.warn(`Failed to copy file: ${file}`, { error });
      }
    }

    const duration = Date.now() - startTime;

    this.logger.info(`Batch copy completed`, {
      total: files.length,
      successful: successCount,
      failed: failCount,
      duration,
    });

    return {
      total: files.length,
      successful: successCount,
      failed: failCount,
      results,
      duration,
    };
  }

  /**
   * Create backup of file or directory
   *
   * @param sourcePath - Path to backup
   * @param options - Backup options
   * @returns Backup file path
   */
  public async createBackup(
    sourcePath: string,
    options: BackupOptions
  ): Promise<string> {
    this.logger.info(`Creating backup of ${sourcePath}`);

    const {
      backupDir,
      includeTimestamp = true,
      suffix = '.bak',
    } = options;

    const resolvedSource = resolve(sourcePath);
    const baseName = basename(sourcePath, extname(sourcePath));
    const ext = extname(sourcePath);

    let backupName = baseName;

    if (includeTimestamp) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      backupName = `${baseName}-${timestamp}`;
    }

    backupName = `${backupName}${suffix}${ext}`;
    const backupPath = join(backupDir, backupName);

    try {
      await mkdir(backupDir, { recursive: true });
      await copyFile(resolvedSource, backupPath);

      this.logger.info(`Backup created: ${backupPath}`);
      return backupPath;

    } catch (error) {
      this.logger.error(`Failed to create backup: ${sourcePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Save generated artifacts
   *
   * @param artifacts - Array of generated files
   * @returns Array of saved file paths
   */
  public async saveArtifacts(artifacts: GeneratedFile[]): Promise<string[]> {
    this.logger.info(`Saving ${artifacts.length} artifacts`);

    const savedPaths: string[] = [];

    for (const artifact of artifacts) {
      try {
        await mkdir(dirname(artifact.path), { recursive: true });
        await writeFile(artifact.path, artifact.content, 'utf-8');
        savedPaths.push(artifact.path);
        this.logger.debug(`Saved artifact: ${artifact.path}`);

      } catch (error) {
        this.logger.error(`Failed to save artifact: ${artifact.path}`, error as Error);
      }
    }

    this.logger.info(`Successfully saved ${savedPaths.length}/${artifacts.length} artifacts`);
    return savedPaths;
  }

  /**
   * Clean output directory
   *
   * @param outputDir - Directory to clean
   * @param options - Clean options
   */
  public async cleanOutputDirectory(
    outputDir: string,
    options: { preserveBaseline?: boolean } = {}
  ): Promise<void> {
    this.logger.info(`Cleaning output directory: ${outputDir}`);

    const { preserveBaseline = true } = options;

    try {
      const exists = await this.fileSystem.exists(outputDir);

      if (!exists) {
        this.logger.debug('Output directory does not exist, nothing to clean');
        return;
      }

      // If preserving baseline, only remove non-baseline files
      if (preserveBaseline) {
        const scanResult = await this.fileSystem.scanDirectory(outputDir);

        for (const file of scanResult.files) {
          if (!file.path.includes('daisyv1')) {
            await rm(file.path, { force: true });
            this.logger.debug(`Removed file: ${file.path}`);
          }
        }
      } else {
        // Remove entire directory
        await rm(outputDir, { recursive: true, force: true });
        this.logger.info(`Removed entire output directory: ${outputDir}`);
      }

    } catch (error) {
      this.logger.error(`Failed to clean output directory: ${outputDir}`, error as Error);
      throw error;
    }
  }

  /**
   * Ensure directory structure exists
   *
   * @param paths - Array of directory paths to create
   */
  public async ensureDirectories(paths: string[]): Promise<void> {
    this.logger.debug(`Ensuring ${paths.length} directories exist`);

    for (const path of paths) {
      try {
        await this.fileSystem.createDirectory(path);
      } catch (error) {
        this.logger.error(`Failed to create directory: ${path}`, error as Error);
        throw error;
      }
    }
  }

  /**
   * Get file size in bytes
   *
   * @param filePath - Path to file
   * @returns File size in bytes
   */
  public async getFileSize(filePath: string): Promise<number> {
    try {
      const stats = await stat(resolve(filePath));
      return stats.size;
    } catch (error) {
      this.logger.error(`Failed to get file size: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Check if file is a component file
   *
   * @param filePath - Path to check
   * @returns Whether file is a component
   */
  public isComponentFile(filePath: string): boolean {
    const componentExtensions = ['.tsx', '.ts', '.jsx', '.js'];
    const ext = extname(filePath).toLowerCase();
    const name = basename(filePath, ext);

    // Check extension
    if (!componentExtensions.includes(ext)) {
      return false;
    }

    // Exclude test files
    if (name.includes('.test') || name.includes('.spec')) {
      return false;
    }

    // Exclude type definition files
    if (name.endsWith('.d')) {
      return false;
    }

    return true;
  }

  /**
   * Read component source code
   *
   * @param filePath - Component file path
   * @returns Source code content
   */
  public async readComponentSource(filePath: string): Promise<string> {
    this.logger.debug(`Reading component source: ${filePath}`);

    try {
      return await this.fileSystem.readFile(filePath);
    } catch (error) {
      this.logger.error(`Failed to read component source: ${filePath}`, error as Error);
      throw error;
    }
  }

  /**
   * Find all component files in directory
   *
   * @param directory - Directory to search
   * @param recursive - Whether to search recursively
   * @returns Array of component file paths
   */
  public async findComponentFiles(
    directory: string,
    recursive: boolean = true
  ): Promise<string[]> {
    this.logger.debug(`Finding component files in ${directory}`);

    const scanResult = await this.fileSystem.scanDirectory(directory, { recursive });
    const componentPaths = scanResult.componentFiles.map(f => f.path);

    this.logger.debug(`Found ${componentPaths.length} component files`);
    return componentPaths;
  }
}

// ============================================================================
// FACTORY FUNCTIONS AND EXPORTS
// ============================================================================

/**
 * Create file operations instance
 */
export function createFileOperations(): FileOperations {
  return new FileOperations();
}

/**
 * Quick copy to baseline helper
 */
export async function copyToBaseline(
  sourcePath: string,
  baselineDir: string,
  options?: CopyOptions
): Promise<string> {
  const ops = createFileOperations();
  return ops.copyToBaseline(sourcePath, baselineDir, options);
}

/**
 * Quick save migrated component helper
 */
export async function saveMigratedComponent(
  component: ComponentDefinition,
  code: string,
  outputDir: string
): Promise<string> {
  const ops = createFileOperations();
  return ops.saveMigratedComponent(component, code, outputDir);
}

/**
 * Quick batch copy helper
 */
export async function batchCopyFiles(
  files: string[],
  destinationDir: string,
  options?: CopyOptions
): Promise<BatchOperationResult> {
  const ops = createFileOperations();
  return ops.batchCopy(files, destinationDir, options);
}
