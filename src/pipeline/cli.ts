/**
 * CLI Interface for DAISY v1 Component Extraction Pipeline
 *
 * Simplified command-line interface providing access to the component
 * extraction pipeline with essential functionality and progress tracking.
 *
 * @version 1.0.0
 * @author DAISY Component Extraction Pipeline
 */

import { Command } from 'commander';
import { basename, resolve } from 'path';
import { existsSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import chalk from 'chalk';

// Pipeline imports
import { PipelineOrchestrator } from './orchestrator.js';
import type {
  ExecutionMode,
  PipelineEventHandler,
  PipelineOptions,
  PipelineProgress,
  PipelineResult,
} from './orchestrator.js';
import type { ExtractionConfig } from '@/types';

/**
 * CLI configuration options
 */
export interface CLIOptions {
  /** Source directory to analyze */
  source: string;

  /** Output directory for results */
  output: string;

  /** Execution mode */
  mode: ExecutionMode;

  /** Configuration file path */
  config?: string;

  /** Enable verbose logging */
  verbose: boolean;

  /** Enable quiet mode (minimal output) */
  quiet: boolean;

  /** Generate JSON output */
  json: boolean;

  /** Enable parallel processing */
  parallel: boolean;

  /** Maximum worker threads */
  maxWorkers: number;

  /** Skip components with errors */
  skipErrors: boolean;

  /** Dry run mode */
  dryRun: boolean;

  /** Force overwrite existing files */
  force: boolean;
}

/**
 * Simple console output formatter
 */
export class ConsoleFormatter {
  constructor(
    private readonly verbose: boolean = false,
    private readonly quiet: boolean = false,
  ) {}

  success(message: string): void {
    if (!this.quiet) {
      console.log(chalk.green('✓'), chalk.green(message));
    }
  }

  error(message: string): void {
    console.error(chalk.red('✗'), chalk.red(message));
  }

  warning(message: string): void {
    if (!this.quiet) {
      console.warn(chalk.yellow('⚠'), chalk.yellow(message));
    }
  }

  info(message: string): void {
    if (!this.quiet) {
      console.log(chalk.blue('ℹ'), message);
    }
  }

  debug(message: string): void {
    if (this.verbose && !this.quiet) {
      console.log(chalk.gray('🔍'), chalk.gray(message));
    }
  }

  table(headers: string[], rows: string[][]): void {
    if (this.quiet) {
return;
}

    // Simple table formatting without external dependencies
    const maxWidths = headers.map((header, i) =>
      Math.max(header.length, ...rows.map(row => (row[i] || '').length)),
    );

    // Print header
    const headerRow = headers
      .map((header, i) => header.padEnd(maxWidths[i] || 0))
      .join(' | ');
    console.log(chalk.cyan(headerRow));
    console.log(chalk.gray('-'.repeat(headerRow.length)));

    // Print rows
    rows.forEach(row => {
      const rowStr = row
        .map((cell, i) => (cell || '').padEnd(maxWidths[i] || 0))
        .join(' | ');
      console.log(rowStr);
    });
    console.log('');
  }

  progress(progress: PipelineProgress): void {
    if (this.quiet) {
return;
}

    const phaseColor = this.getPhaseColor(progress.phase);
    const progressBar = this.createProgressBar(progress.overallProgress);

    console.log(
      `${phaseColor(progress.phase.toUpperCase())} ${progressBar} ${progress.overallProgress.toFixed(1)}%`,
    );
    console.log(chalk.gray(`  ${progress.currentOperation}`));
  }

  results(result: PipelineResult): void {
    if (this.quiet && result.success) {
return;
}

    const duration = (result.metrics.totalDuration / 1000).toFixed(2);

    if (result.success) {
      this.success(`Pipeline completed successfully in ${duration}s`);

      if (result.progress.stats.componentsDiscovered > 0) {
        this.table(
          ['Metric', 'Count'],
          [
            [
              'Components Discovered',
              result.progress.stats.componentsDiscovered.toString(),
            ],
            [
              'Components Parsed',
              result.progress.stats.componentsParsed.toString(),
            ],
            [
              'Components Analyzed',
              result.progress.stats.componentsAnalyzed.toString(),
            ],
            [
              'Errors Encountered',
              result.progress.stats.errorsEncountered.toString(),
            ],
            [
              'Warnings Generated',
              result.progress.stats.warningsGenerated.toString(),
            ],
          ],
        );
      }

      if (result.outputPaths.length > 0) {
        this.info('Generated files:');
        result.outputPaths.forEach(path => {
          console.log(chalk.gray(`  ${path}`));
        });
      }
    } else {
      this.error(`Pipeline failed after ${duration}s`);

      if (result.errors.length > 0) {
        this.error('Errors encountered:');
        result.errors.forEach(error => {
          console.log(chalk.red(`  • ${error.message}`));
        });
      }
    }
  }

  private getPhaseColor(phase: string): (text: string) => string {
    switch (phase) {
      case 'discovery':
        return chalk.blue;
      case 'parsing':
        return chalk.yellow;
      case 'dependency-analysis':
        return chalk.magenta;
      case 'inventory-generation':
        return chalk.cyan;
      case 'completed':
        return chalk.green;
      case 'failed':
        return chalk.red;
      default:
        return chalk.white;
    }
  }

  private createProgressBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(empty));
  }
}

/**
 * Main CLI application
 */
export class CLIApplication {
  private readonly program: Command;
  private formatter: ConsoleFormatter;

  constructor() {
    this.program = new Command();
    this.formatter = new ConsoleFormatter();
    this.setupCommands();
  }

  /**
   * Run the CLI application
   */
  async run(argv: string[]): Promise<void> {
    try {
      await this.program.parseAsync(argv);
    } catch (error) {
      this.formatter.error(
        error instanceof Error ? error.message : 'Unknown error occurred',
      );
      process.exit(1);
    }
  }

  /**
   * Setup CLI commands and options
   */
  private setupCommands(): void {
    this.program
      .name('daisy-extract')
      .description('DAISY v1 Component Extraction Pipeline')
      .version('1.0.0');

    // Main extract command
    this.program
      .command('extract')
      .description('Extract and analyze DAISY v1 components')
      .argument('<source>', 'Source directory containing DAISY components')
      .option('-o, --output <dir>', 'Output directory for results', './output')
      .option('-m, --mode <mode>', 'Execution mode', 'full-pipeline')
      .option('-c, --config <file>', 'Configuration file path')
      .option('-v, --verbose', 'Enable verbose logging', false)
      .option('-q, --quiet', 'Quiet mode (minimal output)', false)
      .option('--json', 'Generate JSON output', true)
      .option('--parallel', 'Enable parallel processing', true)
      .option('--max-workers <count>', 'Maximum worker threads', parseInt, 4)
      .option('--skip-errors', 'Skip components with errors', false)
      .option('--dry-run', 'Dry run mode (no file writes)', false)
      .option('--force', 'Force overwrite existing files', false)
      .action(this.handleExtractCommand.bind(this));

    // Configuration commands
    this.program
      .command('config')
      .description('Show current configuration')
      .option('-c, --config <file>', 'Configuration file path')
      .action(this.handleConfigCommand.bind(this));

    this.program
      .command('init')
      .description('Initialize configuration in current directory')
      .option('-f, --force', 'Force overwrite existing configuration', false)
      .action(this.handleInitCommand.bind(this));

    // Info commands
    this.program
      .command('info')
      .description('Show system information')
      .action(this.handleInfoCommand.bind(this));

    this.program
      .command('validate')
      .description('Validate configuration and source directory')
      .argument('<source>', 'Source directory to validate')
      .option('-c, --config <file>', 'Configuration file path')
      .action(this.handleValidateCommand.bind(this));
  }

  /**
   * Handle extract command
   */
  private async handleExtractCommand(
    source: string,
    options: Partial<CLIOptions>,
  ): Promise<void> {
    // Setup formatter based on options
    this.formatter = new ConsoleFormatter(options.verbose, options.quiet);

    // Show banner if not quiet
    if (!options.quiet) {
      this.showBanner();
    }

    // Validate source directory
    const sourcePath = resolve(source);
    if (!existsSync(sourcePath)) {
      this.formatter.error(`Source directory does not exist: ${sourcePath}`);
      process.exit(1);
    }

    this.formatter.info(`Analyzing components in: ${sourcePath}`);

    try {
      // Load configuration
      const config = await this.loadConfiguration(options.config, sourcePath);

      // Convert CLI options to pipeline options
      const pipelineOptions = this.convertToPipelineOptions(options);

      // Run pipeline
      const result = await this.runPipeline(config, pipelineOptions);

      // Handle output
      await this.handleOutput(result, options);

      // Exit with appropriate code
      process.exit(result.success ? 0 : 1);
    } catch (error) {
      this.formatter.error(
        error instanceof Error ? error.message : 'Pipeline execution failed',
      );
      process.exit(1);
    }
  }

  /**
   * Handle config command
   */
  private async handleConfigCommand(options: {
    config?: string;
  }): Promise<void> {
    this.formatter.info('Configuration Management');

    try {
      const config = await this.loadConfiguration(options.config);
      console.log(JSON.stringify(config, null, 2));
    } catch (error) {
      this.formatter.error('Failed to load configuration');
      this.formatter.error(
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }

  /**
   * Handle init command
   */
  private async handleInitCommand(options: { force?: boolean }): Promise<void> {
    this.formatter.info('Initializing DAISY extraction configuration...');

    const configPath = resolve('./daisy-extract.config.json');

    if (existsSync(configPath) && !options.force) {
      this.formatter.error('Configuration file already exists');
      this.formatter.info('Use --force to overwrite');
      process.exit(1);
    }

    try {
      const defaultConfig: ExtractionConfig = {
        sourcePath: './src',
        outputPath: './output',
        preserveBaseline: true,
        processing: {
          mode: 'parallel',
          concurrency: 4,
          continueOnError: false,
          retry: {
            maxAttempts: 3,
            delay: 1000,
            backoffMultiplier: 2,
            retryableOperations: ['file-read', 'ast-parsing'],
          },
          filters: {
            include: ['**/*.{ts,tsx,js,jsx}'],
            exclude: [
              '**/node_modules/**',
              '**/dist/**',
              '**/build/**',
              '**/*.test.*',
              '**/*.spec.*',
            ],
            types: ['functional', 'class'],
            complexity: ['simple', 'moderate', 'complex'],
            custom: [],
          },
        },
        performance: {
          memoryLimit: 1024,
          timeoutPerComponent: 30000,
          maxBundleSizeIncrease: 20,
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
          format: 'simple',
          timestamps: true,
          stackTraces: true,
        },
      };

      await writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
      this.formatter.success(`Configuration created: ${configPath}`);
    } catch (error) {
      this.formatter.error('Failed to create configuration file');
      process.exit(1);
    }
  }

  /**
   * Handle info command
   */
  private handleInfoCommand(): Promise<void> {
    this.formatter.info('DAISY Component Extraction Pipeline');
    return Promise.resolve().then(() => {

    const info = [
      ['Version', '1.0.0'],
      ['Node.js', process.version],
      ['Platform', process.platform],
      ['Architecture', process.arch],
      ['Working Directory', process.cwd()],
    ];

    this.formatter.table(['Property', 'Value'], info);
    });
  }

  /**
   * Handle validate command
   */
  private async handleValidateCommand(
    source: string,
    options: { config?: string },
  ): Promise<void> {
    this.formatter.info('Validating configuration and source directory...');

    const sourcePath = resolve(source);

    // Check source directory
    if (!existsSync(sourcePath)) {
      this.formatter.error(`Source directory does not exist: ${sourcePath}`);
      process.exit(1);
    }

    this.formatter.success(`Source directory exists: ${sourcePath}`);

    // Validate configuration
    try {
      const config = await this.loadConfiguration(options.config, sourcePath);
      this.formatter.success('Configuration is valid');

      // Show configuration summary
      this.formatter.table(
        ['Setting', 'Value'],
        [
          ['Source Path', config.sourcePath],
          ['Output Path', config.outputPath],
          ['Preserve Baseline', config.preserveBaseline.toString()],
          ['Processing Mode', config.processing.mode],
          ['Memory Limit', `${config.performance.memoryLimit}MB`],
        ],
      );
    } catch (error) {
      this.formatter.error('Configuration validation failed');
      this.formatter.error(
        error instanceof Error ? error.message : 'Unknown error',
      );
      process.exit(1);
    }
  }

  /**
   * Load configuration from file or create default
   */
  private async loadConfiguration(
    configPath?: string,
    sourcePath?: string,
  ): Promise<ExtractionConfig> {
    if (configPath) {
      if (!existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
      }

      const configContent = await readFile(configPath, 'utf-8');
      return JSON.parse(configContent) as ExtractionConfig;
    }

    // Try to find configuration in common locations
    const commonPaths = ['daisy-extract.config.json', '.daisy-extract.json'];

    for (const path of commonPaths) {
      if (existsSync(path)) {
        try {
          const configContent = await readFile(path, 'utf-8');
          const config = JSON.parse(configContent) as ExtractionConfig;

          this.formatter.debug(`Loaded configuration from: ${path}`);
          return config;
        } catch {
          // Continue to next file
        }
      }
    }

    // Create default configuration
    this.formatter.debug('Using default configuration');
    return {
      sourcePath: sourcePath || './src',
      outputPath: './output',
      preserveBaseline: true,
      processing: {
        mode: 'parallel',
        concurrency: 4,
        continueOnError: false,
        retry: {
          maxAttempts: 3,
          delay: 1000,
          backoffMultiplier: 2,
          retryableOperations: ['file-read', 'ast-parsing'],
        },
        filters: {
          include: ['**/*.{ts,tsx,js,jsx}'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/build/**',
            '**/*.test.*',
            '**/*.spec.*',
          ],
          types: ['functional', 'class'],
          complexity: ['simple', 'moderate', 'complex'],
          custom: [],
        },
      },
      performance: {
        memoryLimit: 1024,
        timeoutPerComponent: 30000,
        maxBundleSizeIncrease: 20,
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
        format: 'simple',
        timestamps: true,
        stackTraces: true,
      },
    };
  }

  /**
   * Convert CLI options to pipeline options
   */
  private convertToPipelineOptions(
    options: Partial<CLIOptions>,
  ): PipelineOptions {
    return {
      mode: (options.mode) || 'full-pipeline',
      parallel: options.parallel ?? true,
      maxWorkers: options.maxWorkers || 4,
      skipErrors: options.skipErrors || false,
      generateReports: options.json !== false,
      outputDir: options.output || './output',
      saveIntermediateResults: false,
      maxExecutionTime: 60,
      dryRun: options.dryRun || false,
    };
  }

  /**
   * Run the pipeline with progress tracking
   */
  private async runPipeline(
    config: ExtractionConfig,
    options: PipelineOptions,
  ): Promise<PipelineResult> {
    const orchestrator = new PipelineOrchestrator();

    // Setup event handlers for progress tracking
    const eventHandler: PipelineEventHandler = {
      onPhaseStart: phase => {
        this.formatter.info(`Starting phase: ${phase}`);
      },

      onPhaseComplete: phase => {
        this.formatter.debug(`Completed phase: ${phase}`);
      },

      onProgress: progress => {
        this.formatter.progress(progress);
      },

      onError: error => {
        this.formatter.error(`${error.phase}: ${error.message}`);
      },

      onWarning: warning => {
        this.formatter.warning(warning);
      },

      onComponentProcessed: (path, result) => {
        this.formatter.debug(
          `Processed: ${basename(path)} - ${result.success ? 'Success' : 'Failed'}`,
        );
      },
    };

    orchestrator.addEventHandler(eventHandler);

    return await orchestrator.execute(config, options);
  }

  /**
   * Handle output generation
   */
  private async handleOutput(
    result: PipelineResult,
    options: Partial<CLIOptions>,
  ): Promise<void> {
    // Display results
    this.formatter.results(result);

    // Generate JSON output if requested
    if (options.json !== false && result.success) {
      const jsonPath = resolve(
        options.output || './output',
        'pipeline-result.json',
      );
      await writeFile(jsonPath, JSON.stringify(result, null, 2));
      this.formatter.debug(`JSON results saved to: ${jsonPath}`);
    }
  }

  /**
   * Show application banner
   */
  private showBanner(): void {
    console.log('');
    console.log(
      chalk.cyan('╔══════════════════════════════════════════════════════════╗'),
    );
    console.log(
      chalk.cyan('║') +
        chalk.white('                 DAISY EXTRACT                        ') +
        chalk.cyan('║'),
    );
    console.log(
      chalk.cyan('║') +
        chalk.gray('         Component Extraction Pipeline                ') +
        chalk.cyan('║'),
    );
    console.log(
      chalk.cyan('║') +
        chalk.gray('       Transform DAISY v1 to Configurator v2         ') +
        chalk.cyan('║'),
    );
    console.log(
      chalk.cyan('╚══════════════════════════════════════════════════════════╝'),
    );
    console.log('');
  }
}

/**
 * Main CLI entry point
 */
export async function runCLI(argv: string[] = process.argv): Promise<void> {
  const cli = new CLIApplication();
  await cli.run(argv);
}

export default CLIApplication;
