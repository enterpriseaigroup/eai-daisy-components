/**
 * File System Utilities
 * 
 * Provides comprehensive file system operations for the component extraction
 * pipeline with proper error handling, type safety, and performance optimization.
 * 
 * @fileoverview File system utilities for component scanning and management
 * @version 1.0.0
 */

import { promises as fs, constants, Stats } from 'fs';
import { join, resolve, relative, extname, basename, dirname } from 'path';
import { glob } from 'glob';
import type {
  ComponentDefinition,
  ComponentType,
  FilePath,
  ComponentId,
} from '@/types';

// ============================================================================
// FILE SYSTEM TYPES
// ============================================================================

/**
 * File information with metadata
 */
export interface FileInfo {
  /** Absolute file path */
  readonly path: string;
  
  /** File name without path */
  readonly name: string;
  
  /** File extension */
  readonly extension: string;
  
  /** File size in bytes */
  readonly size: number;
  
  /** File modification time */
  readonly modifiedAt: Date;
  
  /** File creation time */
  readonly createdAt: Date;
  
  /** Whether file is readable */
  readonly readable: boolean;
  
  /** Whether file is writable */
  readonly writable: boolean;
  
  /** File stats object */
  readonly stats: Stats;
}

/**
 * Directory scan result
 */
export interface DirectoryScanResult {
  /** Directory path */
  readonly directory: string;
  
  /** All files found */
  readonly files: FileInfo[];
  
  /** Component files only */
  readonly componentFiles: FileInfo[];
  
  /** Subdirectories found */
  readonly subdirectories: string[];
  
  /** Scan statistics */
  readonly stats: ScanStatistics;
}

/**
 * Scan operation statistics
 */
export interface ScanStatistics {
  /** Total files scanned */
  readonly totalFiles: number;
  
  /** Component files found */
  readonly componentFiles: number;
  
  /** Directories scanned */
  readonly directoriesScanned: number;
  
  /** Scan duration in milliseconds */
  readonly duration: number;
  
  /** Errors encountered */
  readonly errors: number;
}

/**
 * Component file detection result
 */
export interface ComponentFileInfo extends FileInfo {
  /** Detected component type */
  readonly componentType: ComponentType;
  
  /** Component name extracted from file */
  readonly componentName: string;
  
  /** Whether file exports React component */
  readonly isReactComponent: boolean;
  
  /** TypeScript or JavaScript */
  readonly language: 'typescript' | 'javascript';
  
  /** Estimated complexity */
  readonly estimatedComplexity: 'simple' | 'moderate' | 'complex';
}

/**
 * File operation options
 */
export interface FileOperationOptions {
  /** Whether to create parent directories */
  readonly createParents?: boolean;
  
  /** File encoding */
  readonly encoding?: BufferEncoding;
  
  /** Whether to overwrite existing files */
  readonly overwrite?: boolean;
  
  /** File mode permissions */
  readonly mode?: number;
  
  /** Whether to preserve timestamps */
  readonly preserveTimestamps?: boolean;
}

/**
 * Directory scan options
 */
export interface ScanOptions {
  /** Include file patterns */
  readonly include?: string[];
  
  /** Exclude file patterns */
  readonly exclude?: string[];
  
  /** Whether to scan recursively */
  readonly recursive?: boolean;
  
  /** Maximum scan depth */
  readonly maxDepth?: number;
  
  /** Whether to follow symbolic links */
  readonly followSymlinks?: boolean;
  
  /** Whether to include hidden files */
  readonly includeHidden?: boolean;
  
  /** Component file extensions to look for */
  readonly componentExtensions?: string[];
}

// ============================================================================
// FILE SYSTEM MANAGER CLASS
// ============================================================================

/**
 * Comprehensive file system operations manager
 */
export class FileSystemManager {
  private readonly defaultScanOptions: Required<ScanOptions> = {
    include: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/*.test.*',
      '**/*.spec.*',
      '**/*.d.ts',
    ],
    recursive: true,
    maxDepth: 10,
    followSymlinks: false,
    includeHidden: false,
    componentExtensions: ['.tsx', '.ts', '.jsx', '.js'],
  };

  /**
   * Scan directory for component files
   * 
   * @param directoryPath - Directory to scan
   * @param options - Scan options
   * @returns Scan result with found files
   */
  public async scanDirectory(
    directoryPath: string,
    options: ScanOptions = {}
  ): Promise<DirectoryScanResult> {
    const startTime = Date.now();
    const resolvedPath = resolve(directoryPath);
    const scanOptions = { ...this.defaultScanOptions, ...options };
    
    try {
      await this.validateDirectoryAccess(resolvedPath);
      
      const globPatterns = scanOptions.include;
      const allFiles: FileInfo[] = [];
      const componentFiles: FileInfo[] = [];
      const subdirectories: string[] = [];
      let errors = 0;

      for (const pattern of globPatterns) {
        try {
          const matches = await glob(pattern, {
            cwd: resolvedPath,
            ignore: scanOptions.exclude,
            dot: scanOptions.includeHidden,
            follow: scanOptions.followSymlinks,
            maxDepth: scanOptions.recursive ? scanOptions.maxDepth : 1,
            absolute: true,
          });

          for (const filePath of matches) {
            try {
              const fileInfo = await this.getFileInfo(filePath);
              allFiles.push(fileInfo);

              if (this.isComponentFile(fileInfo, scanOptions.componentExtensions)) {
                const componentFileInfo = await this.analyzeComponentFile(fileInfo);
                componentFiles.push(componentFileInfo);
              }
            } catch (error) {
              errors++;
              console.warn(`Failed to process file ${filePath}:`, error);
            }
          }
        } catch (error) {
          errors++;
          console.warn(`Failed to scan pattern ${pattern}:`, error);
        }
      }

      // Scan for subdirectories
      try {
        const entries = await fs.readdir(resolvedPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory() && !entry.name.startsWith('.')) {
            subdirectories.push(join(resolvedPath, entry.name));
          }
        }
      } catch (error) {
        errors++;
        console.warn('Failed to scan subdirectories:', error);
      }

      const duration = Date.now() - startTime;

      return {
        directory: resolvedPath,
        files: allFiles,
        componentFiles,
        subdirectories,
        stats: {
          totalFiles: allFiles.length,
          componentFiles: componentFiles.length,
          directoriesScanned: 1 + subdirectories.length,
          duration,
          errors,
        },
      };
    } catch (error) {
      throw new FileSystemError(
        `Failed to scan directory: ${resolvedPath}`,
        error as Error
      );
    }
  }

  /**
   * Get detailed file information
   * 
   * @param filePath - Path to file
   * @returns File information object
   */
  public async getFileInfo(filePath: string): Promise<FileInfo> {
    try {
      const resolvedPath = resolve(filePath);
      const stats = await fs.stat(resolvedPath);
      
      // Check file permissions
      let readable = false;
      let writable = false;
      
      try {
        await fs.access(resolvedPath, constants.R_OK);
        readable = true;
      } catch {
        // File not readable
      }
      
      try {
        await fs.access(resolvedPath, constants.W_OK);
        writable = true;
      } catch {
        // File not writable
      }

      return {
        path: resolvedPath,
        name: basename(resolvedPath),
        extension: extname(resolvedPath),
        size: stats.size,
        modifiedAt: stats.mtime,
        createdAt: stats.birthtime,
        readable,
        writable,
        stats,
      };
    } catch (error) {
      throw new FileSystemError(
        `Failed to get file info for: ${filePath}`,
        error as Error
      );
    }
  }

  /**
   * Read file content with error handling
   * 
   * @param filePath - Path to file
   * @param encoding - File encoding
   * @returns File content
   */
  public async readFile(
    filePath: string,
    encoding: BufferEncoding = 'utf-8'
  ): Promise<string> {
    try {
      const resolvedPath = resolve(filePath);
      await this.validateFileAccess(resolvedPath, constants.R_OK);
      return await fs.readFile(resolvedPath, encoding);
    } catch (error) {
      throw new FileSystemError(
        `Failed to read file: ${filePath}`,
        error as Error
      );
    }
  }

  /**
   * Write file content with options
   * 
   * @param filePath - Path to file
   * @param content - File content
   * @param options - Write options
   */
  public async writeFile(
    filePath: string,
    content: string,
    options: FileOperationOptions = {}
  ): Promise<void> {
    try {
      const resolvedPath = resolve(filePath);
      const {
        createParents = true,
        encoding = 'utf-8',
        overwrite = true,
        mode = 0o644,
        preserveTimestamps = false,
      } = options;

      // Create parent directories if needed
      if (createParents) {
        await fs.mkdir(dirname(resolvedPath), { recursive: true });
      }

      // Check if file exists and handle overwrite
      if (!overwrite) {
        try {
          await fs.access(resolvedPath);
          throw new FileSystemError(
            `File already exists and overwrite is disabled: ${filePath}`,
            new Error('File exists')
          );
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
          }
          // File doesn't exist, continue
        }
      }

      // Get original timestamps if preserving
      let originalStats: Stats | undefined;
      if (preserveTimestamps) {
        try {
          originalStats = await fs.stat(resolvedPath);
        } catch {
          // File doesn't exist, ignore
        }
      }

      // Write file
      await fs.writeFile(resolvedPath, content, { encoding, mode });

      // Restore timestamps if requested
      if (preserveTimestamps && originalStats) {
        await fs.utimes(resolvedPath, originalStats.atime, originalStats.mtime);
      }
    } catch (error) {
      throw new FileSystemError(
        `Failed to write file: ${filePath}`,
        error as Error
      );
    }
  }

  /**
   * Copy file with options
   * 
   * @param sourcePath - Source file path
   * @param destinationPath - Destination file path
   * @param options - Copy options
   */
  public async copyFile(
    sourcePath: string,
    destinationPath: string,
    options: FileOperationOptions = {}
  ): Promise<void> {
    try {
      const resolvedSource = resolve(sourcePath);
      const resolvedDestination = resolve(destinationPath);
      const { createParents = true, overwrite = true } = options;

      await this.validateFileAccess(resolvedSource, constants.R_OK);

      if (createParents) {
        await fs.mkdir(dirname(resolvedDestination), { recursive: true });
      }

      if (!overwrite) {
        try {
          await fs.access(resolvedDestination);
          throw new FileSystemError(
            `Destination file exists and overwrite is disabled: ${destinationPath}`,
            new Error('File exists')
          );
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            throw error;
          }
        }
      }

      await fs.copyFile(resolvedSource, resolvedDestination);
    } catch (error) {
      throw new FileSystemError(
        `Failed to copy file from ${sourcePath} to ${destinationPath}`,
        error as Error
      );
    }
  }

  /**
   * Create directory with parents
   * 
   * @param directoryPath - Directory path to create
   * @param mode - Directory permissions
   */
  public async createDirectory(
    directoryPath: string,
    mode: number = 0o755
  ): Promise<void> {
    try {
      const resolvedPath = resolve(directoryPath);
      await fs.mkdir(resolvedPath, { recursive: true, mode });
    } catch (error) {
      throw new FileSystemError(
        `Failed to create directory: ${directoryPath}`,
        error as Error
      );
    }
  }

  /**
   * Check if path exists
   * 
   * @param path - Path to check
   * @returns Whether path exists
   */
  public async exists(path: string): Promise<boolean> {
    try {
      await fs.access(resolve(path));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Analyze component file for type and complexity
   * 
   * @param fileInfo - File information
   * @returns Enhanced component file info
   */
  private async analyzeComponentFile(fileInfo: FileInfo): Promise<ComponentFileInfo> {
    try {
      const content = await this.readFile(fileInfo.path);
      
      // Detect language
      const language = fileInfo.extension.endsWith('ts') || fileInfo.extension.endsWith('tsx') 
        ? 'typescript' 
        : 'javascript';

      // Basic component analysis (simplified for now)
      const isReactComponent = this.detectReactComponent(content);
      const componentType = this.detectComponentType(content);
      const componentName = this.extractComponentName(fileInfo.name, content);
      const estimatedComplexity = this.estimateComplexity(content);

      return {
        ...fileInfo,
        componentType,
        componentName,
        isReactComponent,
        language,
        estimatedComplexity,
      };
    } catch (error) {
      // Fallback to basic analysis
      return {
        ...fileInfo,
        componentType: 'functional',
        componentName: basename(fileInfo.name, fileInfo.extension),
        isReactComponent: false,
        language: fileInfo.extension.includes('ts') ? 'typescript' : 'javascript',
        estimatedComplexity: 'simple',
      };
    }
  }

  /**
   * Detect if file contains React component
   * 
   * @param content - File content
   * @returns Whether file contains React component
   */
  private detectReactComponent(content: string): boolean {
    const reactPatterns = [
      /import\s+.*\s+from\s+['"]react['"]/,
      /import\s+React/,
      /React\./,
      /jsx|tsx/,
      /<[A-Z][a-zA-Z0-9]*[\s>]/,
      /React\.FC/,
      /React\.Component/,
    ];

    return reactPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Detect component type from content
   * 
   * @param content - File content
   * @returns Detected component type
   */
  private detectComponentType(content: string): ComponentType {
    if (content.includes('React.Component') || content.includes('extends Component')) {
      return 'class';
    }
    if (content.includes('useState') || content.includes('useEffect')) {
      return 'functional';
    }
    if (content.includes('withRouter') || content.includes('connect(')) {
      return 'higher-order';
    }
    if (content.includes('function use') || /export\s+function\s+use[A-Z]/.test(content)) {
      return 'hook';
    }
    return 'utility';
  }

  /**
   * Extract component name from file name and content
   * 
   * @param fileName - File name
   * @param content - File content
   * @returns Component name
   */
  private extractComponentName(fileName: string, content: string): string {
    // Try to extract from export statements
    const exportMatches = content.match(/export\s+(?:default\s+)?(?:const|function|class)\s+([A-Z][a-zA-Z0-9]*)/);
    if (exportMatches?.[1]) {
      return exportMatches[1];
    }

    // Fallback to file name
    const baseName = basename(fileName, extname(fileName));
    return baseName.charAt(0).toUpperCase() + baseName.slice(1);
  }

  /**
   * Estimate component complexity based on content
   * 
   * @param content - File content
   * @returns Estimated complexity level
   */
  private estimateComplexity(content: string): 'simple' | 'moderate' | 'complex' {
    const lines = content.split('\n').length;
    const hooks = (content.match(/use[A-Z][a-zA-Z]*/g) || []).length;
    const functions = (content.match(/function\s+\w+/g) || []).length;
    const complexPatterns = (content.match(/useEffect|useReducer|useContext|async|await/g) || []).length;

    if (lines > 200 || hooks > 5 || functions > 10 || complexPatterns > 5) {
      return 'complex';
    }
    if (lines > 50 || hooks > 2 || functions > 3 || complexPatterns > 2) {
      return 'moderate';
    }
    return 'simple';
  }

  /**
   * Check if file is a component file
   * 
   * @param fileInfo - File information
   * @param extensions - Component file extensions
   * @returns Whether file is a component file
   */
  private isComponentFile(fileInfo: FileInfo, extensions: string[]): boolean {
    return extensions.includes(fileInfo.extension.toLowerCase());
  }

  /**
   * Validate directory access
   * 
   * @param directoryPath - Directory path
   */
  private async validateDirectoryAccess(directoryPath: string): Promise<void> {
    try {
      const stats = await fs.stat(directoryPath);
      if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
      }
      await fs.access(directoryPath, constants.R_OK);
    } catch (error) {
      throw new FileSystemError(
        `Directory access validation failed: ${directoryPath}`,
        error as Error
      );
    }
  }

  /**
   * Validate file access with specific permissions
   * 
   * @param filePath - File path
   * @param mode - Access mode
   */
  private async validateFileAccess(filePath: string, mode: number): Promise<void> {
    try {
      await fs.access(filePath, mode);
    } catch (error) {
      throw new FileSystemError(
        `File access validation failed: ${filePath}`,
        error as Error
      );
    }
  }
}

// ============================================================================
// FILE SYSTEM ERROR CLASS
// ============================================================================

/**
 * Custom error class for file system operations
 */
export class FileSystemError extends Error {
  public readonly originalError: Error | null;

  constructor(message: string, originalError: Error | null = null) {
    super(message);
    this.name = 'FileSystemError';
    this.originalError = originalError;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, FileSystemError);
    }
  }

  /**
   * Get detailed error message with original error
   */
  public getDetailedMessage(): string {
    if (this.originalError) {
      return `${this.message}\nCaused by: ${this.originalError.message}`;
    }
    return this.message;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a file system manager instance
 */
export function createFileSystemManager(): FileSystemManager {
  return new FileSystemManager();
}

/**
 * Quick directory scan with default options
 * 
 * @param directoryPath - Directory to scan
 * @returns Scan result
 */
export async function quickScan(directoryPath: string): Promise<DirectoryScanResult> {
  const manager = createFileSystemManager();
  return manager.scanDirectory(directoryPath);
}

/**
 * Find all component files in directory
 * 
 * @param directoryPath - Directory to search
 * @param recursive - Whether to search recursively
 * @returns Array of component file information
 */
export async function findComponentFiles(
  directoryPath: string,
  recursive: boolean = true
): Promise<ComponentFileInfo[]> {
  const manager = createFileSystemManager();
  const result = await manager.scanDirectory(directoryPath, { recursive });
  return result.componentFiles as ComponentFileInfo[];
}

/**
 * Check if file is a TypeScript/JavaScript component file
 * 
 * @param filePath - File path to check
 * @returns Whether file is a component file
 */
export function isComponentFile(filePath: string): boolean {
  const componentExtensions = ['.tsx', '.ts', '.jsx', '.js'];
  const extension = extname(filePath).toLowerCase();
  return componentExtensions.includes(extension);
}

/**
 * Normalize file path for cross-platform compatibility
 * 
 * @param filePath - File path to normalize
 * @returns Normalized file path
 */
export function normalizePath(filePath: string): string {
  return resolve(filePath).replace(/\\/g, '/');
}

/**
 * Get relative path from base to target
 * 
 * @param from - Base path
 * @param to - Target path
 * @returns Relative path
 */
export function getRelativePath(from: string, to: string): string {
  return relative(from, to).replace(/\\/g, '/');
}

// ============================================================================
// NOTE: All types are exported inline above for better tree-shaking
// ============================================================================