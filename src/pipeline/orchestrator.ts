/**
 * Pipeline Orchestrator for DAISY v1 Component Extraction Pipeline
 * 
 * Main execution engine that coordinates discovery, parsing, analysis, and
 * inventory generation. Provides configurable execution modes, progress
 * tracking, and comprehensive error handling.
 * 
 * @version 1.0.0
 * @author DAISY Component Extraction Pipeline
 */

import { resolve, join } from 'path';
import { createSimpleLogger, type Logger } from '../utils/logging.js';
import { FileSystemManager } from '../utils/filesystem.js';
import type { ExtractionConfig, ComponentDefinition } from '@/types';

// Import our analysis engines
import { ComponentDiscoveryEngine, type DiscoveryResult } from '../engine/discovery.js';
import { ComponentParser, type ParseResult } from '../engine/parser.js';
import { DependencyAnalyzer, type DependencyAnalysisResult } from '../engine/analyzer.js';
import { ComponentInventoryGenerator, type ComponentInventory } from '../engine/inventory.js';

/**
 * Pipeline execution mode
 */
export type ExecutionMode = 
  | 'discovery-only'     // Only run component discovery
  | 'analysis-only'      // Discovery + parsing + dependency analysis
  | 'full-pipeline'      // Complete analysis + inventory generation
  | 'incremental';       // Resume from previous state

/**
 * Pipeline execution options
 */
export interface PipelineOptions {
  /** Execution mode */
  mode: ExecutionMode;
  
  /** Enable parallel processing */
  parallel: boolean;
  
  /** Maximum number of worker threads */
  maxWorkers: number;
  
  /** Skip components with errors */
  skipErrors: boolean;
  
  /** Generate detailed reports */
  generateReports: boolean;
  
  /** Output directory for results */
  outputDir: string;
  
  /** Save intermediate results */
  saveIntermediateResults: boolean;
  
  /** Resume from checkpoint */
  resumeFromCheckpoint?: string;
  
  /** Maximum execution time (minutes) */
  maxExecutionTime: number;
  
  /** Dry run mode - no file writes */
  dryRun: boolean;
}

/**
 * Pipeline execution context
 */
export interface PipelineContext {
  /** Execution start time */
  startTime: Date;
  
  /** Current phase */
  currentPhase: PipelinePhase;
  
  /** Total components to process */
  totalComponents: number;
  
  /** Components processed so far */
  processedComponents: number;
  
  /** Execution options */
  options: PipelineOptions;
  
  /** Configuration */
  config: ExtractionConfig;
  
  /** Working directory */
  workingDir: string;
}

/**
 * Pipeline execution phase
 */
export type PipelinePhase = 
  | 'initialization'
  | 'discovery'
  | 'parsing'
  | 'dependency-analysis'
  | 'inventory-generation'
  | 'output-generation'
  | 'cleanup'
  | 'completed'
  | 'failed';

/**
 * Pipeline progress information
 */
export interface PipelineProgress {
  /** Current phase */
  phase: PipelinePhase;
  
  /** Phase progress (0-100) */
  phaseProgress: number;
  
  /** Overall progress (0-100) */
  overallProgress: number;
  
  /** Current operation description */
  currentOperation: string;
  
  /** Estimated time remaining */
  estimatedTimeRemaining?: string;
  
  /** Processing statistics */
  stats: {
    componentsDiscovered: number;
    componentsParsed: number;
    componentsAnalyzed: number;
    errorsEncountered: number;
    warningsGenerated: number;
  };
}

/**
 * Pipeline execution result
 */
export interface PipelineResult {
  /** Execution success status */
  success: boolean;
  
  /** Execution context */
  context: PipelineContext;
  
  /** Final progress state */
  progress: PipelineProgress;
  
  /** Discovery results */
  discovery?: DiscoveryResult | undefined;
  
  /** Parsing results */
  parsing?: Map<string, ParseResult> | undefined;
  
  /** Dependency analysis results */
  dependencies?: DependencyAnalysisResult | undefined;
  
  /** Component inventory */
  inventory?: ComponentInventory | undefined;
  
  /** Execution metrics */
  metrics: PipelineMetrics;
  
  /** Errors encountered */
  errors: PipelineError[];
  
  /** Warnings generated */
  warnings: string[];
  
  /** Output file paths */
  outputPaths: string[];
}

/**
 * Pipeline execution metrics
 */
export interface PipelineMetrics {
  /** Total execution time */
  totalDuration: number;
  
  /** Phase durations */
  phaseDurations: Record<PipelinePhase, number>;
  
  /** Components processed per minute */
  throughput: number;
  
  /** Memory usage statistics */
  memoryUsage: {
    peak: number;
    average: number;
  };
  
  /** File system operations */
  fileOperations: {
    filesRead: number;
    filesWritten: number;
    bytesProcessed: number;
  };
  
  /** Error statistics */
  errorStats: {
    parseErrors: number;
    analysisErrors: number;
    ioErrors: number;
  };
}

/**
 * Pipeline error with context
 */
export interface PipelineError {
  /** Error message */
  message: string;
  
  /** Error code */
  code: string;
  
  /** Error severity */
  severity: 'warning' | 'error' | 'critical';
  
  /** Phase where error occurred */
  phase: PipelinePhase;
  
  /** Component path if applicable */
  componentPath?: string | undefined;
  
  /** Original error */
  originalError?: Error | undefined;
  
  /** Error timestamp */
  timestamp: Date;
}

/**
 * Pipeline event handler
 */
export interface PipelineEventHandler {
  onPhaseStart?(phase: PipelinePhase, context: PipelineContext): void;
  onPhaseComplete?(phase: PipelinePhase, context: PipelineContext): void;
  onProgress?(progress: PipelineProgress): void;
  onError?(error: PipelineError): void;
  onWarning?(warning: string): void;
  onComponentProcessed?(componentPath: string, result: any): void;
}

/**
 * Main pipeline orchestrator
 */
export class PipelineOrchestrator {
  private readonly logger: Logger;
  private readonly fileSystem: FileSystemManager;
  private readonly eventHandlers: PipelineEventHandler[] = [];
  
  // Analysis engines
  private discoveryEngine?: ComponentDiscoveryEngine;
  private parser?: ComponentParser;
  private dependencyAnalyzer?: DependencyAnalyzer;
  private inventoryGenerator?: ComponentInventoryGenerator;
  
  // Execution state
  private context?: PipelineContext;
  private progress?: PipelineProgress;
  private isRunning = false;
  private shouldCancel = false;

  constructor() {
    this.logger = createSimpleLogger('PipelineOrchestrator');
    this.fileSystem = new FileSystemManager();
  }

  /**
   * Add event handler for pipeline events
   */
  addEventHandler(handler: PipelineEventHandler): void {
    this.eventHandlers.push(handler);
  }

  /**
   * Remove event handler
   */
  removeEventHandler(handler: PipelineEventHandler): void {
    const index = this.eventHandlers.indexOf(handler);
    if (index > -1) {
      this.eventHandlers.splice(index, 1);
    }
  }

  /**
   * Execute the complete pipeline
   */
  async execute(
    config: ExtractionConfig,
    options: Partial<PipelineOptions> = {}
  ): Promise<PipelineResult> {
    if (this.isRunning) {
      throw new Error('Pipeline is already running');
    }

    try {
      this.isRunning = true;
      this.shouldCancel = false;

      // Initialize execution context
      const context = await this.initializeContext(config, options);
      this.context = context;

      this.logger.info('Starting pipeline execution', {
        mode: context.options.mode,
        sourcePath: config.sourcePath,
        outputDir: context.options.outputDir
      });

      // Execute pipeline phases
      const result = await this.executePipeline(context);
      
      this.logger.info('Pipeline execution completed', {
        success: result.success,
        duration: result.metrics.totalDuration,
        componentsProcessed: result.progress.stats.componentsDiscovered
      });

      return result;

    } catch (error) {
      this.logger.error('Pipeline execution failed:', error instanceof Error ? error : undefined);
      
      return this.createErrorResult(
        error instanceof Error ? error : new Error('Unknown pipeline error')
      );
    } finally {
      this.isRunning = false;
      this.shouldCancel = false;
    }
  }

  /**
   * Cancel running pipeline
   */
  cancel(): void {
    if (this.isRunning) {
      this.logger.info('Cancelling pipeline execution...');
      this.shouldCancel = true;
    }
  }

  /**
   * Get current execution progress
   */
  getProgress(): PipelineProgress | null {
    return this.progress || null;
  }

  /**
   * Check if pipeline is currently running
   */
  isExecuting(): boolean {
    return this.isRunning;
  }

  /**
   * Initialize execution context
   */
  private async initializeContext(
    config: ExtractionConfig,
    options: Partial<PipelineOptions>
  ): Promise<PipelineContext> {
    // Basic configuration validation
    if (!config || typeof config !== 'object') {
      throw new Error('Invalid configuration: Configuration must be an object');
    }

    if (!config.sourcePath) {
      throw new Error('Invalid configuration: sourcePath is required');
    }

    // Set default options
    const pipelineOptions: PipelineOptions = {
      mode: 'full-pipeline',
      parallel: true,
      maxWorkers: 4,
      skipErrors: false,
      generateReports: true,
      outputDir: './output',
      saveIntermediateResults: false,
      maxExecutionTime: 60, // 1 hour
      dryRun: false,
      ...options
    };

    // Ensure output directory exists
    if (!pipelineOptions.dryRun) {
      await this.fileSystem.createDirectory(pipelineOptions.outputDir);
    }

    // Create execution context
    const context: PipelineContext = {
      startTime: new Date(),
      currentPhase: 'initialization',
      totalComponents: 0,
      processedComponents: 0,
      options: pipelineOptions,
      config,
      workingDir: resolve(pipelineOptions.outputDir)
    };

    // Initialize progress tracking
    this.progress = {
      phase: 'initialization',
      phaseProgress: 0,
      overallProgress: 0,
      currentOperation: 'Initializing pipeline...',
      stats: {
        componentsDiscovered: 0,
        componentsParsed: 0,
        componentsAnalyzed: 0,
        errorsEncountered: 0,
        warningsGenerated: 0
      }
    };

    return context;
  }

  /**
   * Execute pipeline phases based on mode
   */
  private async executePipeline(context: PipelineContext): Promise<PipelineResult> {
    const startTime = Date.now();
    const errors: PipelineError[] = [];
    const warnings: string[] = [];
    const outputPaths: string[] = [];

    let discovery: DiscoveryResult | undefined;
    let parsing: Map<string, ParseResult> | undefined;
    let dependencies: DependencyAnalysisResult | undefined;
    let inventory: ComponentInventory | undefined;

    try {
      // Phase 1: Component Discovery
      if (this.shouldExecutePhase('discovery', context.options.mode)) {
        discovery = await this.executeDiscoveryPhase(context);
        context.totalComponents = discovery.components.length;
        
        if (this.shouldCancel) {
          throw new Error('Pipeline cancelled by user');
        }
      }

      // Phase 2: Component Parsing
      if (this.shouldExecutePhase('parsing', context.options.mode) && discovery) {
        parsing = await this.executeParsingPhase(context, discovery.components);
        
        if (this.shouldCancel) {
          throw new Error('Pipeline cancelled by user');
        }
      }

      // Phase 3: Dependency Analysis
      if (this.shouldExecutePhase('dependency-analysis', context.options.mode) && discovery) {
        dependencies = await this.executeDependencyAnalysisPhase(context, discovery.components);
        
        if (this.shouldCancel) {
          throw new Error('Pipeline cancelled by user');
        }
      }

      // Phase 4: Inventory Generation
      if (this.shouldExecutePhase('inventory-generation', context.options.mode) && 
          discovery && parsing && dependencies) {
        inventory = await this.executeInventoryGenerationPhase(
          context, discovery, parsing, dependencies
        );
        
        if (context.options.generateReports && !context.options.dryRun) {
          const reportPaths = await this.generateReports(inventory);
          outputPaths.push(...reportPaths);
        }
      }

      // Calculate metrics
      const metrics = this.calculateMetrics(context, startTime);

      // Update final progress
      this.updateProgress({
        phase: 'completed',
        phaseProgress: 100,
        overallProgress: 100,
        currentOperation: 'Pipeline completed successfully'
      });

      return {
        success: true,
        context,
        progress: this.progress!,
        discovery,
        parsing,
        dependencies,
        inventory,
        metrics,
        errors,
        warnings,
        outputPaths
      };

    } catch (error) {
      const pipelineError: PipelineError = {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'PIPELINE_EXECUTION_ERROR',
        severity: 'critical',
        phase: context.currentPhase,
        originalError: error instanceof Error ? error : undefined,
        timestamp: new Date()
      };

      errors.push(pipelineError);
      this.emitError(pipelineError);

      return {
        success: false,
        context,
        progress: this.progress!,
        discovery,
        parsing,
        dependencies,
        inventory,
        metrics: this.calculateMetrics(context, startTime),
        errors,
        warnings,
        outputPaths
      };
    }
  }

  /**
   * Execute component discovery phase
   */
  private async executeDiscoveryPhase(context: PipelineContext): Promise<DiscoveryResult> {
    this.updatePhase('discovery', 'Discovering components...');

    // Initialize discovery engine if needed
    if (!this.discoveryEngine) {
      this.discoveryEngine = new ComponentDiscoveryEngine(
        context.config,
        this.logger,
        {
          parallel: context.options.parallel,
          workers: context.options.maxWorkers
        }
      );
    }

    this.updateProgress({
      phaseProgress: 10,
      currentOperation: 'Scanning source directory...'
    });

    const result = await this.discoveryEngine.discoverComponents();

    this.updateProgress({
      phaseProgress: 100,
      currentOperation: `Discovered ${result.components.length} components`,
      stats: {
        ...this.progress!.stats,
        componentsDiscovered: result.components.length
      }
    });

    this.emitPhaseComplete('discovery');
    return result;
  }

  /**
   * Execute component parsing phase
   */
  private async executeParsingPhase(
    context: PipelineContext,
    components: ComponentDefinition[]
  ): Promise<Map<string, ParseResult>> {
    this.updatePhase('parsing', 'Parsing component structures...');

    // Initialize parser if needed
    if (!this.parser) {
      this.parser = new ComponentParser({
        includePrivateMethods: false,
        extractJSDoc: true,
        analyzeComplexity: true,
        maxFileSize: 1024 * 1024 // 1MB
      });
    }

    const results = new Map<string, ParseResult>();
    let processed = 0;

    for (const component of components) {
      if (this.shouldCancel) break;

      try {
        this.updateProgress({
          phaseProgress: Math.round((processed / components.length) * 100),
          currentOperation: `Parsing ${component.name}...`
        });

        const parseResult = await this.parser.parseComponent(component.sourcePath, component);
        results.set(component.sourcePath, parseResult);

        if (parseResult.success) {
          this.progress!.stats.componentsParsed++;
        } else {
          this.progress!.stats.errorsEncountered++;
          
          if (!context.options.skipErrors) {
            this.emitWarning(`Failed to parse component: ${component.name}`);
          }
        }

        this.emitComponentProcessed(component.sourcePath, parseResult);

      } catch (error) {
        this.progress!.stats.errorsEncountered++;
        
        if (!context.options.skipErrors) {
          throw error;
        } else {
          this.emitWarning(`Skipped component due to error: ${component.name}`);
        }
      }

      processed++;
      context.processedComponents = processed;
    }

    this.updateProgress({
      phaseProgress: 100,
      currentOperation: `Parsed ${this.progress!.stats.componentsParsed} components`
    });

    this.emitPhaseComplete('parsing');
    return results;
  }

  /**
   * Execute dependency analysis phase
   */
  private async executeDependencyAnalysisPhase(
    _context: PipelineContext,
    components: ComponentDefinition[]
  ): Promise<DependencyAnalysisResult> {
    this.updatePhase('dependency-analysis', 'Analyzing dependencies...');

    // Initialize dependency analyzer if needed
    if (!this.dependencyAnalyzer) {
      this.dependencyAnalyzer = new DependencyAnalyzer({
        includeTransitive: true,
        maxDepth: 5,
        detectCycles: true,
        generateClusters: true
      });
    }

    this.updateProgress({
      phaseProgress: 10,
      currentOperation: 'Building dependency graph...'
    });

    const result = await this.dependencyAnalyzer.analyzeDependencies(components);

    this.updateProgress({
      phaseProgress: 100,
      currentOperation: `Analyzed ${result.dependencies.length} dependencies`,
      stats: {
        ...this.progress!.stats,
        componentsAnalyzed: components.length
      }
    });

    this.emitPhaseComplete('dependency-analysis');
    return result;
  }

  /**
   * Execute inventory generation phase
   */
  private async executeInventoryGenerationPhase(
    context: PipelineContext,
    discovery: DiscoveryResult,
    parsing: Map<string, ParseResult>,
    dependencies: DependencyAnalysisResult
  ): Promise<ComponentInventory> {
    this.updatePhase('inventory-generation', 'Generating component inventory...');

    // Initialize inventory generator if needed
    if (!this.inventoryGenerator) {
      this.inventoryGenerator = new ComponentInventoryGenerator({
        outputDir: context.workingDir,
        includeDetailedReports: true,
        generateJson: true,
        generateMarkdown: true,
        readinessThreshold: 75
      });
    }

    this.updateProgress({
      phaseProgress: 50,
      currentOperation: 'Assessing component readiness...'
    });

    const inventory = await this.inventoryGenerator.generateInventory(
      discovery,
      parsing,
      dependencies,
      context.config
    );

    this.updateProgress({
      phaseProgress: 100,
      currentOperation: 'Component inventory generated'
    });

    this.emitPhaseComplete('inventory-generation');
    return inventory;
  }

  /**
   * Generate output reports
   */
  private async generateReports(inventory: ComponentInventory): Promise<string[]> {
    if (!this.inventoryGenerator) {
      throw new Error('Inventory generator not initialized');
    }

    await this.inventoryGenerator.exportInventory(inventory);
    
    // Return paths to generated files
    return [
      join(inventory.metadata.config.sourcePath, 'component-inventory.json'),
      join(inventory.metadata.config.sourcePath, 'component-inventory.md')
    ];
  }

  /**
   * Check if phase should be executed based on mode
   */
  private shouldExecutePhase(phase: string, mode: ExecutionMode): boolean {
    switch (mode) {
      case 'discovery-only':
        return phase === 'discovery';
      case 'analysis-only':
        return ['discovery', 'parsing', 'dependency-analysis'].includes(phase);
      case 'full-pipeline':
        return true;
      case 'incremental':
        // TODO: Implement incremental execution logic
        return true;
      default:
        return false;
    }
  }

  /**
   * Update current phase
   */
  private updatePhase(phase: PipelinePhase, operation: string): void {
    if (this.context) {
      this.context.currentPhase = phase;
    }

    if (this.progress) {
      this.progress.phase = phase;
      this.progress.phaseProgress = 0;
      this.progress.currentOperation = operation;
    }

    this.emitPhaseStart(phase);
  }

  /**
   * Update progress information
   */
  private updateProgress(updates: Partial<PipelineProgress>): void {
    if (this.progress) {
      Object.assign(this.progress, updates);
      
      // Calculate overall progress based on phase
      const phaseWeights = {
        'initialization': 5,
        'discovery': 20,
        'parsing': 30,
        'dependency-analysis': 25,
        'inventory-generation': 15,
        'output-generation': 5,
        'cleanup': 0,
        'completed': 0,
        'failed': 0
      };

      const completedWeight = Object.entries(phaseWeights)
        .filter(([phase]) => this.isPhaseComplete(phase as PipelinePhase))
        .reduce((sum, [, weight]) => sum + weight, 0);

      const currentPhaseWeight = phaseWeights[this.progress.phase] || 0;
      const currentPhaseProgress = (this.progress.phaseProgress / 100) * currentPhaseWeight;

      this.progress.overallProgress = Math.min(100, completedWeight + currentPhaseProgress);

      this.emitProgress(this.progress);
    }
  }

  /**
   * Check if phase is complete
   */
  private isPhaseComplete(phase: PipelinePhase): boolean {
    if (!this.progress) return false;
    
    const phaseOrder: PipelinePhase[] = [
      'initialization', 'discovery', 'parsing', 'dependency-analysis', 
      'inventory-generation', 'output-generation', 'cleanup'
    ];

    const currentIndex = phaseOrder.indexOf(this.progress.phase);
    const checkIndex = phaseOrder.indexOf(phase);

    return checkIndex < currentIndex;
  }

  /**
   * Calculate execution metrics
   */
  private calculateMetrics(context: PipelineContext, startTime: number): PipelineMetrics {
    const totalDuration = Date.now() - startTime;
    const componentsProcessed = context.processedComponents;
    const throughput = componentsProcessed > 0 ? (componentsProcessed / (totalDuration / 60000)) : 0;

    return {
      totalDuration,
      phaseDurations: {}, // TODO: Implement phase timing
      throughput,
      memoryUsage: {
        peak: process.memoryUsage().heapUsed,
        average: process.memoryUsage().heapUsed
      },
      fileOperations: {
        filesRead: componentsProcessed,
        filesWritten: 0, // TODO: Track file writes
        bytesProcessed: 0 // TODO: Track bytes processed
      },
      errorStats: {
        parseErrors: this.progress?.stats.errorsEncountered || 0,
        analysisErrors: 0,
        ioErrors: 0
      }
    } as PipelineMetrics;
  }

  /**
   * Create error result
   */
  private createErrorResult(error: Error): PipelineResult {
    const pipelineError: PipelineError = {
      message: error.message,
      code: 'PIPELINE_ERROR',
      severity: 'critical',
      phase: this.context?.currentPhase || 'initialization',
      timestamp: new Date(),
      originalError: error
    };

    return {
      success: false,
      context: this.context!,
      progress: this.progress!,
      metrics: this.calculateMetrics(this.context!, Date.now()),
      errors: [pipelineError],
      warnings: [],
      outputPaths: []
    };
  }

  /**
   * Event emission methods
   */
  private emitPhaseStart(phase: PipelinePhase): void {
    this.eventHandlers.forEach(handler => {
      if (handler.onPhaseStart && this.context) {
        handler.onPhaseStart(phase, this.context);
      }
    });
  }

  private emitPhaseComplete(phase: PipelinePhase): void {
    this.eventHandlers.forEach(handler => {
      if (handler.onPhaseComplete && this.context) {
        handler.onPhaseComplete(phase, this.context);
      }
    });
  }

  private emitProgress(progress: PipelineProgress): void {
    this.eventHandlers.forEach(handler => {
      if (handler.onProgress) {
        handler.onProgress(progress);
      }
    });
  }

  private emitError(error: PipelineError): void {
    this.eventHandlers.forEach(handler => {
      if (handler.onError) {
        handler.onError(error);
      }
    });
  }

  private emitWarning(warning: string): void {
    this.eventHandlers.forEach(handler => {
      if (handler.onWarning) {
        handler.onWarning(warning);
      }
    });
  }

  private emitComponentProcessed(path: string, result: any): void {
    this.eventHandlers.forEach(handler => {
      if (handler.onComponentProcessed) {
        handler.onComponentProcessed(path, result);
      }
    });
  }
}

export default PipelineOrchestrator;