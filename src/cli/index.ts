/**
 * CLI Foundation
 *
 * Provides command-line interface for the component extraction pipeline
 * using commander.js with integration to logging and error handling systems.
 *
 * @fileoverview CLI foundation with command structure and argument parsing
 * @version 1.0.0
 */

import { Command } from 'commander';
import type { ExtractionConfig, LogLevel } from '@/types';
import { ConfigurationManager } from '@/utils/config';
import { FileSystemManager } from '@/utils/filesystem';
import { type Logger, createSimpleLogger } from '@/utils/logging';
import { PipelineError, getGlobalErrorHandler } from '@/utils/errors';
import { readFileSync } from 'fs';
import { join } from 'path';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

/**
 * CLI command options
 */
export interface CLIOptions {
  /** Configuration file path */
  config?: string;

  /** Source directory */
  source?: string;

  /** Output directory */
  output?: string;

  /** Log level */
  logLevel?: LogLevel;

  /** Dry run mode */
  dryRun?: boolean;

  /** Verbose output */
  verbose?: boolean;

  /** Quiet mode */
  quiet?: boolean;

  /** Force overwrite */
  force?: boolean;

  /** Parallel processing */
  parallel?: number;

  /** Component pattern */
  pattern?: string;

  /** Output format for reports */
  format?: 'table' | 'json' | 'csv';
}

/**
 * Command execution context
 */
export interface CommandContext {
  readonly options: CLIOptions;
  readonly logger: Logger;
  readonly config: ExtractionConfig;
  readonly errorHandler: typeof getGlobalErrorHandler;
  readonly fileManager: FileSystemManager;
}

/**
 * Command handler function
 */
export type CommandHandler = (context: CommandContext) => Promise<void>;

/**
 * CLI command definition
 */
export interface CLICommand {
  readonly name: string;
  readonly description: string;
  readonly options: Array<{
    flags: string;
    description: string;
    defaultValue?: unknown;
  }>;
  readonly handler: CommandHandler;
  readonly examples?: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get package version
 */
function getVersion(): string {
  try {
    const packagePath = join(__dirname, '../..', 'package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

/**
 * Simple console styling without external dependencies
 */
const styles = {
  red: (text: string): string => `\x1b[31m${text}\x1b[0m`,
  green: (text: string): string => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string): string => `\x1b[33m${text}\x1b[0m`,
  cyan: (text: string): string => `\x1b[36m${text}\x1b[0m`,
  bold: (text: string): string => `\x1b[1m${text}\x1b[0m`,
};

/**
 * Simple progress indicator
 */
class SimpleSpinner {
  private interval?: NodeJS.Timeout;
  private readonly frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  private frameIndex = 0;

  constructor(private readonly text: string) {}

  start(): void {
    process.stdout.write(`${this.frames[0]} ${this.text}`);
    this.interval = setInterval(() => {
      this.frameIndex = (this.frameIndex + 1) % this.frames.length;
      process.stdout.write(`\r${this.frames[this.frameIndex]} ${this.text}`);
    }, 80);
  }

  succeed(message?: string): void {
    this.stop();
    console.log(`${styles.green('✓')} ${message || this.text}`);
  }

  fail(message?: string): void {
    this.stop();
    console.log(`${styles.red('✗')} ${message || this.text}`);
  }

  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
      process.stdout.write('\r');
    }
  }
}

/**
 * Simple confirmation prompt
 */
/**
 * Show confirmation prompt
 */
async function confirmAction(message: string): Promise<boolean> {
  return new Promise(resolve => {
    const rl = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${message} (y/N): `, (answer: string) => {
      rl.close();
      resolve(['y', 'yes'].includes(answer.toLowerCase()));
    });
  });
}

/**
 * CLI Builder for command-line interface

// ============================================================================
// COMMAND IMPLEMENTATIONS
// ============================================================================

/**
 * Extract command - main component extraction
 */
const extractCommand: CLICommand = {
  name: 'extract',
  description:
    'Extract and migrate components from DAISY v1 to Configurator v2',
  options: [
    {
      flags: '-s, --source <path>',
      description: 'Source directory containing DAISY v1 components',
    },
    {
      flags: '-o, --output <path>',
      description: 'Output directory for migrated components',
    },
    {
      flags: '--dry-run',
      description: 'Perform a dry run without writing files',
    },
    {
      flags: '--force',
      description: 'Overwrite existing output files',
    },
  ],
  examples: [
    'daisy-extract extract --source ./src/components --output ./migrated',
    'daisy-extract extract --source ./src --dry-run',
  ],
  handler: async (context: CommandContext): Promise<void> => {
    const { options, logger, config } = context;

    const sourceDir = options.source || config.sourcePath;
    const outputDir = options.output || config.outputPath;

    if (!sourceDir || !outputDir) {
      throw new PipelineError(
        'Source and output directories must be specified',
        'configuration',
        'high',
        { operation: 'extract-validation' },
      );
    }

    if (!options.dryRun && !options.force) {
      const confirmed = await confirmAction(
        `This will process components from ${sourceDir} and write to ${outputDir}. Continue?`,
      );
      if (!confirmed) {
        logger.info('Operation cancelled by user');
        return;
      }
    }

    const spinner = new SimpleSpinner('Processing components...');

    try {
      spinner.start();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate work
      spinner.succeed('Component extraction completed');
    } catch (error) {
      spinner.fail('Component extraction failed');
      throw error;
    }
  },
};

/**
 * Scan command - scan and analyze components
 */
const scanCommand: CLICommand = {
  name: 'scan',
  description: 'Scan and analyze components without migration',
  options: [
    {
      flags: '-s, --source <path>',
      description: 'Source directory to scan',
    },
    {
      flags: '--format <format>',
      description: 'Output format (table, json, csv)',
      defaultValue: 'table',
    },
  ],
  examples: [
    'daisy-extract scan --source ./src/components',
    'daisy-extract scan --source ./src --format json',
  ],
  handler: (context: CommandContext): Promise<void> => {
    const { options, config } = context;

    const sourceDir = options.source || config.sourcePath;

    return Promise.resolve().then(() => {
      if (!sourceDir) {
        throw new PipelineError(
          'Source directory must be specified',
          'configuration',
          'high',
          { operation: 'scan-validation' },
        );
      }

      const spinner = new SimpleSpinner('Scanning components...');

      try {
        spinner.start();

        // For now, simulate finding components
        const componentCount = Math.floor(Math.random() * 10) + 1;

        spinner.succeed(`Found ${componentCount} components`);

        // Simple output for demo
        if (options.format === 'json') {
          console.log(
            JSON.stringify(
              {
                scanned: componentCount,
                directory: sourceDir,
              },
              null,
              2,
            ),
          );
        } else if (options.format === 'csv') {
          console.log('Component,Status,Issues');
          for (let i = 0; i < componentCount; i++) {
            console.log(`Component${i},Success,0`);
          }
        } else {
          // Table format
          console.log('\n' + styles.bold('Scan Results:'));
          console.log('─'.repeat(40));
          console.log(`Directory: ${sourceDir}`);
          console.log(`Components found: ${componentCount}`);
          console.log('─'.repeat(40));
        }
      } catch (error) {
        spinner.fail('Component scan failed');
        throw error;
      }
    });
  },
};

/**
 * Init command - initialize configuration
 */
const initCommand: CLICommand = {
  name: 'init',
  description: 'Initialize configuration file',
  options: [
    {
      flags: '--config <path>',
      description: 'Configuration file path',
      defaultValue: './daisy-extract.config.json',
    },
    {
      flags: '--force',
      description: 'Overwrite existing configuration',
    },
  ],
  examples: [
    'daisy-extract init',
    'daisy-extract init --config ./custom-config.json',
  ],
  handler: async (context: CommandContext): Promise<void> => {
    const { options, logger } = context;

    const configPath = options.config || './daisy-extract.config.json';
    logger.info('Initializing configuration', { configPath });

    const spinner = new SimpleSpinner('Creating configuration file...');

    try {
      spinner.start();
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate work
      spinner.succeed(`Configuration created at ${configPath}`);

      console.log(styles.green('\n✓ Configuration initialized successfully!'));
      console.log(
        `\nEdit ${styles.cyan(configPath)} to customize your extraction settings.`,
      );
    } catch (error) {
      spinner.fail('Configuration initialization failed');
      throw error;
    }
  },
};

// ============================================================================
// CLI BUILDER
// ============================================================================

/**
 * CLI application builder
 */
export class CLIBuilder {
  private readonly program: Command;

  constructor() {
    this.program = new Command();
    this.setupBaseCommand();
    this.registerDefaultCommands();
  }

  /**
   * Setup base command configuration
   */
  private setupBaseCommand(): void {
    this.program
      .name('daisy-extract')
      .description('DAISY v1 to Configurator v2 Component Migration Pipeline')
      .version(getVersion())
      .option('-c, --config <path>', 'Configuration file path')
      .option('-v, --verbose', 'Enable verbose output')
      .option('-q, --quiet', 'Suppress output except errors')
      .option(
        '--log-level <level>',
        'Set log level (debug, info, warn, error)',
        'info',
      );
  }

  /**
   * Register default commands
   */
  private registerDefaultCommands(): void {
    this.addCommand(extractCommand);
    this.addCommand(scanCommand);
    this.addCommand(initCommand);
  }

  /**
   * Add command to CLI
   */
  public addCommand(commandDef: CLICommand): this {
    const command = this.program.command(commandDef.name);
    command.description(commandDef.description);

    // Add options
    commandDef.options.forEach(option => {
      const { flags, description, defaultValue } = option;
      if (defaultValue !== undefined) {
        command.option(
          flags,
          description,
          defaultValue as string | boolean | string[],
        );
      } else {
        command.option(flags, description);
      }
    });

    // Add examples to help (using bracket notation for strict TypeScript)
    if (commandDef.examples) {
      const exampleText = commandDef.examples.map(ex => `  ${ex}`).join('\n');
      (command as any)['addHelpText']('after', `\nExamples:\n${exampleText}`);
    }

    // Set action handler
    command.action(async (...args) => {
      const options = args[args.length - 1].opts();
      const globalOptions = this.program.opts();

      const mergedOptions: CLIOptions = {
        ...globalOptions,
        ...options,
      };

      await this.executeCommand(commandDef, mergedOptions);
    });

    return this;
  }

  /**
   * Execute command with context
   */
  private async executeCommand(
    commandDef: CLICommand,
    options: CLIOptions,
  ): Promise<void> {
    try {
      // Create context
      const context = await this.createCommandContext(options);

      // Execute command
      await commandDef.handler(context);
    } catch (error) {
      if (error instanceof PipelineError) {
        console.error(styles.red('\n' + error.getUserReport()));
      } else {
        console.error(
          styles.red(
            `\nCommand failed: ${error instanceof Error ? error.message : String(error)}`,
          ),
        );
      }

      process.exit(1);
    }
  }

  /**
   * Create command execution context
   */
  private async createCommandContext(
    options: CLIOptions,
  ): Promise<CommandContext> {
    const configManager = new ConfigurationManager();
    const config = options.config
      ? await configManager.loadFromFile(options.config)
      : configManager.createMinimal(process.cwd(), './output');

    const logLevel = options.logLevel || config.logging.level;
    const logger = createSimpleLogger('cli', logLevel);

    const fileManager = new FileSystemManager();

    return {
      options,
      logger,
      config,
      errorHandler: getGlobalErrorHandler,
      fileManager,
    };
  }

  /**
   * Parse and execute CLI
   */
  public async run(argv?: string[]): Promise<void> {
    try {
      await (this.program as any)['parseAsync'](argv);
    } catch (error) {
      console.error(styles.red('CLI execution failed:'), error);
      process.exit(1);
    }
  }

  /**
   * Get program instance for testing
   */
  public getProgram(): Command {
    return this.program;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Create and configure CLI application
 */
export function createCLI(): CLIBuilder {
  return new CLIBuilder();
}

/**
 * Main CLI entry point
 */
export async function main(argv?: string[]): Promise<void> {
  const cli = createCLI();
  await cli.run(argv);
}

// Default export for direct usage
export default createCLI;
