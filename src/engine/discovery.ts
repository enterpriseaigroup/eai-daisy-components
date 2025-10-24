/**
 * Component Discovery Engine
 *
 * Scans DAISY v1 codebase to identify React components and extract
 * metadata for migration analysis. Provides comprehensive component
 * discovery with pattern detection and metadata extraction.
 *
 * @fileoverview Component discovery and metadata extraction engine
 * @version 1.0.0
 */

import { basename, dirname, extname, relative, resolve } from 'path';
import { promises as fs } from 'fs';
import type {
  BusinessLogicDefinition,
  ComplexityLevel,
  ComponentDefinition,
  ComponentDependency,
  ComponentMetadata,
  ComponentType,
  ExtractionConfig,
  PerformanceMetadata,
  PropDefinition,
  ReactPattern,
  TestingMetadata,
} from '@/types';
import { FileSystemManager } from '@/utils/filesystem';
import type { Logger } from '@/utils/logging';
import { FileSystemError, PipelineError } from '@/utils/errors';

// ============================================================================
// DISCOVERY TYPES
// ============================================================================

/**
 * Component discovery result
 */
export interface DiscoveryResult {
  /** Discovered components */
  readonly components: ComponentDefinition[];

  /** Discovery statistics */
  readonly statistics: DiscoveryStatistics;

  /** Discovery duration */
  readonly duration: number;

  /** Any errors encountered during discovery */
  readonly errors: PipelineError[];

  /** Files that were skipped */
  readonly skippedFiles: string[];
}

/**
 * Discovery statistics
 */
export interface DiscoveryStatistics {
  /** Total files scanned */
  readonly filesScanned: number;

  /** Component files found */
  readonly componentFiles: number;

  /** Total components discovered */
  readonly componentsFound: number;

  /** Components by type */
  readonly componentsByType: Record<ComponentType, number>;

  /** Components by complexity */
  readonly componentsByComplexity: Record<ComplexityLevel, number>;

  /** React patterns detected */
  readonly reactPatterns: Record<ReactPattern, number>;

  /** Average complexity score */
  readonly averageComplexity: number;
}

/**
 * Component discovery options
 */
export interface DiscoveryOptions {
  /** File patterns to include */
  readonly includePatterns?: string[];

  /** File patterns to exclude */
  readonly excludePatterns?: string[];

  /** Maximum files to process */
  readonly maxFiles?: number;

  /** Enable parallel processing */
  readonly parallel?: boolean;

  /** Number of worker threads */
  readonly workers?: number;

  /** Skip files with errors */
  readonly skipErrors?: boolean;

  /** Extract detailed metadata */
  readonly extractMetadata?: boolean;
}

/**
 * File analysis result
 */
interface FileAnalysisResult {
  /** File path */
  readonly filePath: string;

  /** Discovered components */
  readonly components: ComponentDefinition[];

  /** Analysis errors */
  readonly errors: PipelineError[];

  /** Whether file was skipped */
  readonly skipped: boolean;

  /** Analysis duration */
  readonly duration: number;
}

// ============================================================================
// COMPONENT DISCOVERY ENGINE
// ============================================================================

/**
 * Component discovery engine for DAISY v1 codebases
 */
export class ComponentDiscoveryEngine {
  private readonly config: ExtractionConfig;
  private readonly logger: Logger;
  private readonly fileManager: FileSystemManager;
  private readonly discoveryOptions: Required<DiscoveryOptions>;

  constructor(
    config: ExtractionConfig,
    logger: Logger,
    options: DiscoveryOptions = {}
  ) {
    this.config = config;
    this.logger = logger;
    this.fileManager = new FileSystemManager();

    // Set default options
    this.discoveryOptions = {
      includePatterns: options.includePatterns || [
        '**/*.tsx',
        '**/*.ts',
        '**/*.jsx',
        '**/*.js',
      ],
      excludePatterns: options.excludePatterns || [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/*.d.ts',
        '**/.git/**',
        '**/coverage/**',
      ],
      maxFiles: options.maxFiles || 10000,
      parallel: options.parallel ?? true,
      workers: options.workers || 4,
      skipErrors: options.skipErrors ?? true,
      extractMetadata: options.extractMetadata ?? true,
    };
  }

  /**
   * Discover components in the configured source path
   */
  public async discoverComponents(): Promise<DiscoveryResult> {
    const startTime = Date.now();

    this.logger.info('Starting component discovery', {
      sourcePath: this.config.sourcePath,
      options: this.discoveryOptions,
    });

    try {
      // Find all candidate files
      const candidateFiles = await this.findCandidateFiles();

      this.logger.debug('Found candidate files', {
        count: candidateFiles.length,
        patterns: this.discoveryOptions.includePatterns,
      });

      // Analyze files for components
      const analysisResults = await this.analyzeFiles(candidateFiles);

      // Aggregate results
      const result = this.aggregateResults(
        analysisResults,
        Date.now() - startTime
      );

      this.logger.info('Component discovery completed', {
        duration: `${result.duration}ms`,
        componentsFound: result.components.length,
        filesScanned: result.statistics.filesScanned,
        errorsCount: result.errors.length,
      });

      return result;
    } catch (error) {
      const pipelineError =
        error instanceof PipelineError
          ? error
          : new FileSystemError(
              'Component discovery failed',
              { operation: 'discover-components' },
              error as Error
            );

      this.logger.error('Component discovery failed', pipelineError);

      return {
        components: [],
        statistics: this.createEmptyStatistics(),
        duration: Date.now() - startTime,
        errors: [pipelineError],
        skippedFiles: [],
      };
    }
  }

  /**
   * Find candidate files for component analysis
   */
  private async findCandidateFiles(): Promise<string[]> {
    try {
      const result = await this.fileManager.scanDirectory(
        this.config.sourcePath,
        {
          include: this.discoveryOptions.includePatterns,
          exclude: this.discoveryOptions.excludePatterns,
          recursive: true,
          maxDepth: 10,
        }
      );

      const candidateFiles = result.files
        .map(file => file.path)
        .slice(0, this.discoveryOptions.maxFiles);

      return candidateFiles;
    } catch (error) {
      this.logger.error('Failed to find candidate files', error as Error);
      return [];
    }
  }

  /**
   * Analyze files for component content
   */
  private async analyzeFiles(
    filePaths: string[]
  ): Promise<FileAnalysisResult[]> {
    if (this.discoveryOptions.parallel) {
      return this.analyzeFilesParallel(filePaths);
    } else {
      return this.analyzeFilesSequential(filePaths);
    }
  }

  /**
   * Analyze files sequentially
   */
  private async analyzeFilesSequential(
    filePaths: string[]
  ): Promise<FileAnalysisResult[]> {
    const results: FileAnalysisResult[] = [];

    for (const filePath of filePaths) {
      const result = await this.analyzeFile(filePath);
      results.push(result);

      // Log progress
      if (results.length % 100 === 0) {
        this.logger.debug('Analysis progress', {
          processed: results.length,
          total: filePaths.length,
          percentage: Math.round((results.length / filePaths.length) * 100),
        });
      }
    }

    return results;
  }

  /**
   * Analyze files in parallel (simplified for now)
   */
  private async analyzeFilesParallel(
    filePaths: string[]
  ): Promise<FileAnalysisResult[]> {
    // For now, use Promise.all with limited concurrency
    const BATCH_SIZE = this.discoveryOptions.workers;
    const results: FileAnalysisResult[] = [];

    for (let i = 0; i < filePaths.length; i += BATCH_SIZE) {
      const batch = filePaths.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(filePath => this.analyzeFile(filePath))
      );

      results.push(...batchResults);

      // Log progress
      this.logger.debug('Parallel analysis progress', {
        processed: results.length,
        total: filePaths.length,
        percentage: Math.round((results.length / filePaths.length) * 100),
      });
    }

    return results;
  }

  /**
   * Analyze a single file for components
   */
  private async analyzeFile(filePath: string): Promise<FileAnalysisResult> {
    const startTime = Date.now();

    try {
      // Read file content
      const content = await fs.readFile(filePath, 'utf-8');

      // Quick check if file contains React components
      if (!this.isLikelyComponentFile(content)) {
        return {
          filePath,
          components: [],
          errors: [],
          skipped: true,
          duration: Date.now() - startTime,
        };
      }

      // Extract components from file
      const components = await this.extractComponentsFromFile(
        filePath,
        content
      );

      return {
        filePath,
        components,
        errors: [],
        skipped: false,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      const pipelineError = new FileSystemError(
        `Failed to analyze file: ${filePath}`,
        { filePath },
        error as Error
      );

      if (this.discoveryOptions.skipErrors) {
        this.logger.warn('Skipping file due to error', {
          filePath,
          error: error instanceof Error ? error.message : String(error),
        });

        return {
          filePath,
          components: [],
          errors: [pipelineError],
          skipped: true,
          duration: Date.now() - startTime,
        };
      } else {
        throw pipelineError;
      }
    }
  }

  /**
   * Quick heuristic check if file likely contains React components
   */
  private isLikelyComponentFile(content: string): boolean {
    // Check for React imports
    const hasReactImport = /import\s+.*React/.test(content);
    const hasJSXSyntax = /<\w+/.test(content);
    const hasComponentExport =
      /export\s+(default\s+)?(function|const|class)\s+[A-Z]/.test(content);
    const hasReactHooks = /use[A-Z]\w*\s*\(/.test(content);

    // File is likely a component if it has React patterns
    return (
      hasReactImport || hasJSXSyntax || hasComponentExport || hasReactHooks
    );
  }

  /**
   * Extract components from file content
   */
  private async extractComponentsFromFile(
    filePath: string,
    content: string
  ): Promise<ComponentDefinition[]> {
    const components: ComponentDefinition[] = [];

    // Extract component names and basic info
    const componentMatches = this.findComponentDeclarations(content);

    for (const match of componentMatches) {
      try {
        const component = await this.createComponentDefinition(
          filePath,
          content,
          match
        );

        if (component) {
          components.push(component);
        }
      } catch (error) {
        this.logger.warn('Failed to create component definition', {
          filePath,
          componentName: match.name,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return components;
  }

  /**
   * Find component declarations in content
   */
  private findComponentDeclarations(content: string): Array<{
    name: string;
    type: ComponentType;
    startIndex: number;
    endIndex: number;
  }> {
    const declarations: Array<{
      name: string;
      type: ComponentType;
      startIndex: number;
      endIndex: number;
    }> = [];

    // Function components
    const functionMatches = content.matchAll(
      /(?:export\s+(?:default\s+)?)?function\s+([A-Z][a-zA-Z0-9]*)/g
    );
    for (const match of functionMatches) {
      const name = match[1];
      if (name) {
        declarations.push({
          name,
          type: 'functional',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Arrow function components
    const arrowMatches = content.matchAll(
      /(?:export\s+(?:default\s+)?)?const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*\(/g
    );
    for (const match of arrowMatches) {
      const name = match[1];
      if (name) {
        declarations.push({
          name,
          type: 'functional',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // ForwardRef components
    const forwardRefMatches = content.matchAll(
      /(?:export\s+(?:default\s+)?)?const\s+([A-Z][a-zA-Z0-9]*)\s*=\s*React\.forwardRef/g
    );
    for (const match of forwardRefMatches) {
      const name = match[1];
      if (name) {
        declarations.push({
          name,
          type: 'functional',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Class components
    const classMatches = content.matchAll(
      /(?:export\s+(?:default\s+)?)?class\s+([A-Z][a-zA-Z0-9]*)\s+extends\s+.*Component/g
    );
    for (const match of classMatches) {
      const name = match[1];
      if (name) {
        declarations.push({
          name,
          type: 'class',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    // Custom hooks
    const hookMatches = content.matchAll(
      /(?:export\s+(?:default\s+)?)?(?:function\s+|const\s+)(use[A-Z][a-zA-Z0-9]*)/g
    );
    for (const match of hookMatches) {
      const name = match[1];
      if (name) {
        declarations.push({
          name,
          type: 'hook',
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    return declarations;
  }

  /**
   * Create component definition from parsed information
   */
  private async createComponentDefinition(
    filePath: string,
    content: string,
    match: {
      name: string;
      type: ComponentType;
      startIndex: number;
      endIndex: number;
    }
  ): Promise<ComponentDefinition | null> {
    const componentId = `${relative(this.config.sourcePath, filePath)}:${match.name}`;

    // Extract basic component info
    const props = this.extractProps(content, match);
    const businessLogic = this.extractBusinessLogic(content, match);
    const reactPatterns = this.detectReactPatterns(content);
    const dependencies = this.extractDependencies(content);
    const complexity = this.assessComplexity(
      content,
      props,
      businessLogic,
      reactPatterns
    );

    // Create metadata
    const metadata = this.discoveryOptions.extractMetadata
      ? await this.createComponentMetadata(filePath, content, match)
      : this.createMinimalMetadata();

    const component: ComponentDefinition = {
      id: componentId,
      name: match.name,
      type: match.type,
      sourcePath: relative(this.config.sourcePath, filePath),
      props,
      businessLogic,
      reactPatterns,
      dependencies,
      complexity,
      migrationStatus: 'pending',
      metadata,
    };

    return component;
  }

  /**
   * Extract component props from content
   */
  private extractProps(
    content: string,
    match: { name: string; type: ComponentType }
  ): PropDefinition[] {
    const props: PropDefinition[] = [];

    // Look for TypeScript interface definitions
    const interfacePattern = new RegExp(
      `interface\\s+${match.name}Props\\s*\\{([^}]+)\\}`,
      's'
    );
    const interfaceMatch = content.match(interfacePattern);

    if (interfaceMatch?.[1]) {
      const propsContent = interfaceMatch[1];
      const propMatches = propsContent.matchAll(/(\w+)(\?)?:\s*([^;,\n]+)/g);

      for (const propMatch of propMatches) {
        if (propMatch[1] && propMatch[3]) {
          props.push({
            name: propMatch[1],
            type: propMatch[3].trim(),
            required: !propMatch[2], // No ? means required
            description: `Prop for ${match.name}`,
            defaultValue: undefined,
          });
        }
      }
    }

    return props;
  }

  /**
   * Extract business logic methods
   */
  private extractBusinessLogic(
    content: string,
    match: { name: string; type: ComponentType }
  ): BusinessLogicDefinition[] {
    const businessLogic: BusinessLogicDefinition[] = [];

    // Find function definitions within the component
    const functionPattern =
      /(?:const\s+|function\s+)(\w+)\s*[=:]?\s*\([^)]*\)\s*(?:=>)?\s*\{/g;
    const functionMatches = content.matchAll(functionPattern);

    for (const funcMatch of functionMatches) {
      // Skip constructor and render methods
      const functionName = funcMatch[1];
      if (
        functionName &&
        !['constructor', 'render', 'componentDidMount'].includes(functionName)
      ) {
        businessLogic.push({
          name: functionName,
          signature: `${functionName}()`, // Simplified signature
          purpose: `Business logic method in ${match.name}`,
          parameters: [], // Would need more sophisticated parsing
          returnType: 'unknown',
          complexity: 'simple',
          externalDependencies: [],
        });
      }
    }

    return businessLogic;
  }

  /**
   * Detect React patterns used in component
   */
  private detectReactPatterns(content: string): ReactPattern[] {
    const patterns: ReactPattern[] = [];

    // Check for hooks
    if (/useState\s*\(/.test(content)) {
      patterns.push('useState');
    }
    if (/useEffect\s*\(/.test(content)) {
      patterns.push('useEffect');
    }
    if (/useContext\s*\(/.test(content)) {
      patterns.push('useContext');
    }
    if (/useReducer\s*\(/.test(content)) {
      patterns.push('useReducer');
    }
    if (/useMemo\s*\(/.test(content)) {
      patterns.push('useMemo');
    }
    if (/useCallback\s*\(/.test(content)) {
      patterns.push('useCallback');
    }

    // Check for custom hooks
    if (/use[A-Z]\w*\s*\(/.test(content)) {
      patterns.push('custom-hook');
    }

    // Check for render props
    if (/\{.*\(.*\)\s*=>/.test(content)) {
      patterns.push('render-props');
    }

    // Check for children as function
    if (/children\s*\(/.test(content)) {
      patterns.push('children-as-function');
    }

    return patterns;
  }

  /**
   * Extract component dependencies
   */
  private extractDependencies(content: string): ComponentDependency[] {
    const dependencies: ComponentDependency[] = [];

    // Find import statements
    const importPattern =
      /import\s+(?:\{[^}]+\}|\w+|[*]\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const imports = content.matchAll(importPattern);

    for (const importMatch of imports) {
      const importPath = importMatch[1];

      if (!importPath) {
        continue;
      }

      // Determine dependency type
      let type: ComponentDependency['type'];
      if (importPath.startsWith('./') || importPath.startsWith('../')) {
        type = 'component';
      } else if (importPath.includes('react')) {
        type = 'external';
      } else if (importPath.includes('util') || importPath.includes('helper')) {
        type = 'utility';
      } else {
        type = 'service';
      }

      dependencies.push({
        name: basename(importPath, extname(importPath)),
        type,
        importPath,
        critical: importPath.includes('react'),
      });
    }

    return dependencies;
  }

  /**
   * Assess component complexity
   */
  private assessComplexity(
    content: string,
    props: PropDefinition[],
    businessLogic: BusinessLogicDefinition[],
    reactPatterns: ReactPattern[]
  ): ComplexityLevel {
    let score = 0;

    // Factor in props count
    score += props.length * 2;

    // Factor in business logic
    score += businessLogic.length * 5;

    // Factor in React patterns
    score += reactPatterns.length * 3;

    // Factor in file length
    const lines = content.split('\n').length;
    score += Math.floor(lines / 50);

    // Classify complexity
    if (score <= 10) {
      return 'simple';
    }
    if (score <= 25) {
      return 'moderate';
    }
    if (score <= 50) {
      return 'complex';
    }
    return 'critical';
  }

  /**
   * Create component metadata
   */
  private async createComponentMetadata(
    filePath: string,
    content: string,
    match: { name: string; type: ComponentType }
  ): Promise<ComponentMetadata> {
    const stats = await fs.stat(filePath);

    return {
      createdAt: stats.birthtime,
      lastModified: stats.mtime,
      author: 'Unknown',
      documentation: `Component ${match.name} from ${basename(filePath)}`,
      performance: this.createPerformanceMetadata(content),
      testing: this.createTestingMetadata(filePath),
    };
  }

  /**
   * Create minimal metadata for performance
   */
  private createMinimalMetadata(): ComponentMetadata {
    return {
      createdAt: new Date(),
      lastModified: new Date(),
      author: 'Unknown',
      performance: {
        bundleSize: 0,
        memoryUsage: '0KB',
      },
      testing: {
        coverage: 0,
      },
    };
  }

  /**
   * Create performance metadata
   */
  private createPerformanceMetadata(content: string): PerformanceMetadata {
    return {
      bundleSize: Buffer.from(content).length,
      memoryUsage: '0KB',
    };
  }

  /**
   * Create testing metadata
   */
  private createTestingMetadata(filePath: string): TestingMetadata {
    // Look for corresponding test files
    const dir = dirname(filePath);
    const name = basename(filePath, extname(filePath));
    const testPatterns = [
      `${name}.test.ts`,
      `${name}.test.tsx`,
      `${name}.spec.ts`,
      `${name}.spec.tsx`,
    ];

    const firstPattern = testPatterns[0];
    if (!firstPattern) {
      throw new Error('No test patterns found');
    }

    return {
      coverage: 0,
      testPath: resolve(dir, firstPattern),
    };
  }

  /**
   * Aggregate analysis results
   */
  private aggregateResults(
    analysisResults: FileAnalysisResult[],
    duration: number
  ): DiscoveryResult {
    const components: ComponentDefinition[] = [];
    const errors: PipelineError[] = [];
    const skippedFiles: string[] = [];

    // Collect all components and errors
    for (const result of analysisResults) {
      components.push(...result.components);
      errors.push(...result.errors);

      if (result.skipped) {
        skippedFiles.push(result.filePath);
      }
    }

    // Calculate statistics
    const statistics = this.calculateStatistics(analysisResults, components);

    return {
      components,
      statistics,
      duration,
      errors,
      skippedFiles,
    };
  }

  /**
   * Calculate discovery statistics
   */
  private calculateStatistics(
    analysisResults: FileAnalysisResult[],
    components: ComponentDefinition[]
  ): DiscoveryStatistics {
    const componentsByType: Record<ComponentType, number> = {
      functional: 0,
      class: 0,
      'higher-order': 0,
      hook: 0,
      utility: 0,
    };

    const componentsByComplexity: Record<ComplexityLevel, number> = {
      simple: 0,
      moderate: 0,
      complex: 0,
      critical: 0,
    };

    const reactPatterns: Record<ReactPattern, number> = {
      useState: 0,
      useEffect: 0,
      useContext: 0,
      useReducer: 0,
      useMemo: 0,
      useCallback: 0,
      'custom-hook': 0,
      'render-props': 0,
      'children-as-function': 0,
    };

    // Count components by type and complexity
    for (const component of components) {
      componentsByType[component.type]++;
      componentsByComplexity[component.complexity]++;

      // Count React patterns
      for (const pattern of component.reactPatterns) {
        reactPatterns[pattern]++;
      }
    }

    // Calculate average complexity
    const complexityScores = {
      simple: 1,
      moderate: 2,
      complex: 3,
      critical: 4,
    };

    const totalComplexity = components.reduce(
      (sum, comp) => sum + complexityScores[comp.complexity],
      0
    );
    const averageComplexity =
      components.length > 0 ? totalComplexity / components.length : 0;

    return {
      filesScanned: analysisResults.length,
      componentFiles: analysisResults.filter(r => r.components.length > 0)
        .length,
      componentsFound: components.length,
      componentsByType,
      componentsByComplexity,
      reactPatterns,
      averageComplexity,
    };
  }

  /**
   * Create empty statistics
   */
  private createEmptyStatistics(): DiscoveryStatistics {
    return {
      filesScanned: 0,
      componentFiles: 0,
      componentsFound: 0,
      componentsByType: {
        functional: 0,
        class: 0,
        'higher-order': 0,
        hook: 0,
        utility: 0,
      },
      componentsByComplexity: {
        simple: 0,
        moderate: 0,
        complex: 0,
        critical: 0,
      },
      reactPatterns: {
        useState: 0,
        useEffect: 0,
        useContext: 0,
        useReducer: 0,
        useMemo: 0,
        useCallback: 0,
        'custom-hook': 0,
        'render-props': 0,
        'children-as-function': 0,
      },
      averageComplexity: 0,
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create discovery engine instance
 */
export function createDiscoveryEngine(
  config: ExtractionConfig,
  logger: Logger,
  options?: DiscoveryOptions
): ComponentDiscoveryEngine {
  return new ComponentDiscoveryEngine(config, logger, options);
}

/**
 * Quick component discovery for specific files
 */
export async function discoverComponentsInFiles(
  filePaths: string[],
  config: ExtractionConfig,
  logger: Logger
): Promise<ComponentDefinition[]> {
  const engine = new ComponentDiscoveryEngine(config, logger, {
    includePatterns: filePaths,
    excludePatterns: [],
    parallel: false,
    extractMetadata: false,
  });

  const result = await engine.discoverComponents();
  return result.components;
}

/**
 * Format discovery results for display
 */
export function formatDiscoveryResults(result: DiscoveryResult): string {
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('COMPONENT DISCOVERY RESULTS');
  lines.push('='.repeat(60));
  lines.push('');

  // Summary
  lines.push('📊 SUMMARY');
  lines.push(`Files Scanned: ${result.statistics.filesScanned}`);
  lines.push(`Component Files: ${result.statistics.componentFiles}`);
  lines.push(`Components Found: ${result.statistics.componentsFound}`);
  lines.push(`Duration: ${result.duration}ms`);
  lines.push(`Errors: ${result.errors.length}`);
  lines.push(`Skipped Files: ${result.skippedFiles.length}`);
  lines.push('');

  // Components by type
  lines.push('📝 COMPONENTS BY TYPE');
  Object.entries(result.statistics.componentsByType).forEach(
    ([type, count]) => {
      if (count > 0) {
        lines.push(`${type}: ${count}`);
      }
    }
  );
  lines.push('');

  // Components by complexity
  lines.push('⚡ COMPLEXITY DISTRIBUTION');
  Object.entries(result.statistics.componentsByComplexity).forEach(
    ([complexity, count]) => {
      if (count > 0) {
        lines.push(`${complexity}: ${count}`);
      }
    }
  );
  lines.push(
    `Average Complexity: ${result.statistics.averageComplexity.toFixed(2)}`
  );
  lines.push('');

  // React patterns
  lines.push('⚛️ REACT PATTERNS');
  Object.entries(result.statistics.reactPatterns).forEach(
    ([pattern, count]) => {
      if (count > 0) {
        lines.push(`${pattern}: ${count}`);
      }
    }
  );
  lines.push('');

  // Error summary
  if (result.errors.length > 0) {
    lines.push('❌ ERRORS');
    result.errors.slice(0, 10).forEach((error, index) => {
      lines.push(`${index + 1}. ${error.message}`);
    });
    if (result.errors.length > 10) {
      lines.push(`... and ${result.errors.length - 10} more errors`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
