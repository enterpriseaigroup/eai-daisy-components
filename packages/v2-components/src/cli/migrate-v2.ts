#!/usr/bin/env node
/**
 * V2 Component Migration CLI
 *
 * Generates V2 components from DAISY v1 baselines.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { parseArgs } from 'node:util';
import { generateV2Component } from '../pipeline/v2-generator.js';
import { validateCompilation, validatePseudoCode } from '../pipeline/validator.js';
import { JSONLogger } from '../utils/logger.js';
import { ConsoleProgressIndicator } from '../utils/console-progress.js';
import {
  createManifest,
  addSuccess,
  saveManifest,
} from '../utils/manifest-manager.js';
import { sanitizeComponentName } from '../utils/path-validator.js';
import type { GenerationOptions, V2Component } from '../types/v2-component.js';
import type { GenerationConfig } from '../types/manifest.js';

// Exit codes per API contract
export const EXIT_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1,
  COMPILATION_ERROR: 2,
  BUSINESS_LOGIC_INCOMPLETE: 3,
  FILESYSTEM_ERROR: 4,
} as const;

export interface CLIOptions {
  component?: string;
  dryRun: boolean;
  output?: string;
  skipTests: boolean;
  verbose: boolean;
}

/**
 * Parses CLI arguments
 */
export function parseCLIArgs(argv: string[]): CLIOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      component: {
        type: 'string',
        short: 'c',
      },
      'dry-run': {
        type: 'boolean',
        default: false,
      },
      output: {
        type: 'string',
        short: 'o',
      },
      'skip-tests': {
        type: 'boolean',
        default: false,
      },
      verbose: {
        type: 'boolean',
        short: 'v',
        default: false,
      },
      help: {
        type: 'boolean',
        short: 'h',
        default: false,
      },
    },
    allowPositionals: false,
  });

  if (values.help) {
    displayHelp();
    process.exit(EXIT_CODES.SUCCESS);
  }

  return {
    ...(values.component ? { component: values.component } : {}),
    dryRun: values['dry-run'] ?? false,
    ...(values.output ? { output: values.output } : {}),
    skipTests: values['skip-tests'] ?? false,
    verbose: values.verbose ?? false,
  };
}

/**
 * Displays CLI help
 */
function displayHelp(): void {
  console.log(`
V2 Component Migration CLI

Usage: npm run migrate:v2 -- [options]

Options:
  -c, --component <name>    Component name to migrate (e.g., GetAddressCard)
  --dry-run                 Preview generated pseudo-code without creating files
  -o, --output <path>       Output directory (default: packages/v2-components/src/components)
  --skip-tests              Skip test scaffolding generation
  -v, --verbose             Enable verbose logging
  -h, --help                Display this help message

Recovery Commands:
  --resume                  Resume failed component generation from manifest
  --rollback                Delete all generated components and manifest
  --cleanup                 Remove orphaned/incomplete component directories
  --regenerate <name>       Regenerate a specific component by name

Exit Codes:
  0  Success
  1  Validation error (invalid input, missing baseline)
  2  Compilation error (generated code doesn't compile)
  3  Business logic incomplete (missing required pseudo-code fields)
  4  Filesystem error (permission denied, disk full)

Examples:
  # Generate GetAddressCard V2 component
  npm run migrate:v2 -- --component=GetAddressCard

  # Preview pseudo-code without generating files
  npm run migrate:v2 -- --component=GetAddressCard --dry-run

  # Resume failed components from previous run
  npm run migrate:v2 -- --resume

  # Clean up incomplete/orphaned directories
  npm run migrate:v2 -- --cleanup

  # Rollback all generated components
  npm run migrate:v2 -- --rollback

  # Regenerate a specific component
  npm run migrate:v2 -- --regenerate GetAddressCard
`);
}

/**
 * Displays dry-run output with syntax highlighting (T059)
 * 
 * Formats and displays generated pseudo-code to console without writing files.
 * Uses ANSI colors for syntax highlighting.
 */
function displayDryRunOutput(component: V2Component): void {
  // ANSI color codes
  const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    gray: '\x1b[90m',
  };

  console.log('\n' + colors.bold + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bold + colors.cyan + 'DRY RUN: Generated Pseudo-Code Preview' + colors.reset);
  console.log(colors.bold + colors.cyan + '='.repeat(80) + colors.reset + '\n');

  // Component summary
  console.log(colors.bold + colors.yellow + '📦 Component: ' + colors.reset + colors.bold + component.name + colors.reset);
  console.log(colors.gray + '   Output path: ' + component.filePath + colors.reset);
  console.log(colors.gray + '   Compilation status: ' + 
    (component.compilationStatus === 'success' ? colors.green + '✅ Success' : colors.yellow + '⚠️  ' + component.compilationStatus) + 
    colors.reset + '\n');

  // Pseudo-code blocks
  if (component.pseudoCodeBlocks.length > 0) {
    console.log(colors.bold + colors.magenta + '📝 Pseudo-Code Blocks:' + colors.reset + '\n');

    component.pseudoCodeBlocks.forEach((block, index) => {
      console.log(colors.bold + colors.blue + `${index + 1}. ${block.functionName}` + colors.reset);
      console.log(colors.dim + '   ' + '─'.repeat(70) + colors.reset);
      
      // WHY EXISTS
      console.log(colors.bold + '   WHY EXISTS:' + colors.reset);
      console.log(colors.gray + '   ' + block.whyExists + colors.reset + '\n');

      // WHAT IT DOES
      console.log(colors.bold + '   WHAT IT DOES:' + colors.reset);
      block.whatItDoes.forEach(step => {
        console.log(colors.green + '   • ' + colors.reset + step);
      });
      console.log();

      // WHAT IT CALLS (if any)
      if (block.whatItCalls && block.whatItCalls.length > 0) {
        console.log(colors.bold + '   WHAT IT CALLS:' + colors.reset);
        block.whatItCalls.forEach(call => {
          console.log(colors.cyan + '   → ' + colors.reset + call);
        });
        console.log();
      }

      // DATA FLOW
      console.log(colors.bold + '   DATA FLOW:' + colors.reset);
      console.log(colors.yellow + '   ' + block.dataFlow + colors.reset + '\n');

      // DEPENDENCIES
      console.log(colors.bold + '   DEPENDENCIES:' + colors.reset);
      block.dependencies.forEach(dep => {
        console.log(colors.magenta + '   • ' + colors.reset + dep);
      });
      console.log();

      // SPECIAL BEHAVIOR (if any)
      if (block.specialBehavior) {
        console.log(colors.bold + '   SPECIAL BEHAVIOR:' + colors.reset);
        console.log(colors.gray + '   ' + block.specialBehavior + colors.reset + '\n');
      }

      console.log();
    });
  } else {
    console.log(colors.yellow + '⚠️  No pseudo-code blocks generated' + colors.reset + '\n');
  }

  // Type interfaces
  console.log(colors.bold + colors.magenta + '🔧 Type Interfaces:' + colors.reset + '\n');
  
  console.log(colors.bold + '   Props Interface:' + colors.reset);
  console.log(colors.gray + component.propsInterface.split('\n').map(line => '   ' + line).join('\n') + colors.reset + '\n');

  if (component.stateInterface) {
    console.log(colors.bold + '   State Interface:' + colors.reset);
    console.log(colors.gray + component.stateInterface.split('\n').map(line => '   ' + line).join('\n') + colors.reset + '\n');
  }

  if (component.apiResponseInterface) {
    console.log(colors.bold + '   API Response Interface:' + colors.reset);
    console.log(colors.gray + component.apiResponseInterface.split('\n').map(line => '   ' + line).join('\n') + colors.reset + '\n');
  }

  // File summary
  console.log(colors.bold + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.bold + colors.green + '✅ Generation Preview Complete' + colors.reset);
  console.log(colors.gray + '\nTo generate files, run without --dry-run flag' + colors.reset);
  console.log(colors.bold + colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

/**
 * Main CLI entry point
 */
async function main(): Promise<void> {
  const startTime = Date.now();
  let logger: JSONLogger | undefined;
  let progress: ConsoleProgressIndicator | undefined;

  try {
    const options = parseCLIArgs(process.argv.slice(2));

    // Validate required options
    if (!options.component) {
      console.error('Error: --component is required');
      displayHelp();
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }

    // Validate component name for security (NFR-013)
    const nameValidation = sanitizeComponentName(options.component);
    if (!nameValidation.valid) {
      console.error(`Error: Invalid component name - ${nameValidation.error}`);
      console.error('Component names must:');
      console.error('  - Be 2-64 characters long');
      console.error('  - Start with a letter');
      console.error('  - Contain only letters, numbers, hyphens, and underscores');
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }

    // Initialize logging
    const logDir = path.join(process.cwd(), '.specify', 'logs');
    await fs.mkdir(logDir, { recursive: true });

    logger = new JSONLogger(options.verbose);
    await logger.initialize();
    progress = new ConsoleProgressIndicator();

    await logger.info(options.component, 'migration-start', 0);

    // Determine baseline path
    const baselinePath = path.join(
      process.cwd(),
      'daisyv1',
      'components',
      'tier1-simple',
      `useRender${options.component}`,
      `${options.component}.tsx`
    );

    // Check if baseline exists
    try {
      await fs.access(baselinePath);
    } catch {
      const error = `Baseline not found: ${baselinePath}`;
      await logger.error(options.component, 'validation-error', 0, error);
      progress.displayError(options.component, error);
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }

    // Prepare generation options
    const outputPath =
      options.output || path.join(process.cwd(), 'packages', 'v2-components', 'src', 'components');

    const generationOptions: GenerationOptions = {
      baselinePath,
      outputPath,
      componentName: options.component,
      dryRun: options.dryRun,
      skipTests: options.skipTests,
      verbose: options.verbose,
    };

    progress.displayProgress({
      current: 1,
      total: 1,
      componentName: options.component,
      successCount: 0,
      failureCount: 0,
      skipCount: 0,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
    });

    // Generate component
    await logger.info(options.component, 'analyze-start', Date.now() - startTime);
    const result = await generateV2Component(generationOptions);

    if (!result.success || !result.component) {
      const errorMsg = result.error || 'Unknown error';
      await logger.error(options.component, 'generation-failed', Date.now() - startTime, errorMsg);
      progress.displayError(options.component, errorMsg);
      process.exit(EXIT_CODES.VALIDATION_ERROR);
    }

    const component = result.component;

    // Validate pseudo-code
    await logger.info(options.component, 'validate-pseudocode', Date.now() - startTime);
    const pseudoValidation = validatePseudoCode(component);

    if (!pseudoValidation.valid) {
      const errorMsg = `Pseudo-code validation failed:\n${pseudoValidation.errors.join('\n')}`;
      await logger.error(options.component, 'business-logic-incomplete', Date.now() - startTime, errorMsg);
      progress.displayError(options.component, errorMsg);
      process.exit(EXIT_CODES.BUSINESS_LOGIC_INCOMPLETE);
    }

    // Validate compilation
    await logger.info(options.component, 'validate-compilation', Date.now() - startTime);
    const validatedComponent = await validateCompilation(component);

    if (validatedComponent.compilationStatus === 'error') {
      const errorMsg = `Compilation failed:\n${validatedComponent.compilationErrors?.join('\n')}`;
      await logger.error(options.component, 'compilation-failed', Date.now() - startTime, errorMsg);
      progress.displayError(options.component, errorMsg);
      process.exit(EXIT_CODES.COMPILATION_ERROR);
    }

    // Write files (unless dry-run)
    if (!options.dryRun) {
      await logger.info(options.component, 'write-files', Date.now() - startTime);

      const componentDir = path.join(outputPath, options.component);
      await fs.mkdir(componentDir, { recursive: true });

      // Write main component file
      await fs.writeFile(validatedComponent.filePath, validatedComponent.sourceCode, 'utf-8');

      // Write README
      const readmePath = path.join(componentDir, 'README.md');
      await fs.writeFile(readmePath, validatedComponent.readme, 'utf-8');

      // Write test scaffold
      if (validatedComponent.testScaffold) {
        const testDir = path.join(componentDir, '__tests__');
        await fs.mkdir(testDir, { recursive: true });
        const testPath = path.join(testDir, `${options.component}.test.tsx`);
        await fs.writeFile(testPath, validatedComponent.testScaffold, 'utf-8');
      }

      // Update manifest
      const config: GenerationConfig = {
        baselinePath: generationOptions.baselinePath,
        outputPath: generationOptions.outputPath,
        dryRun: generationOptions.dryRun || false,
        verbose: generationOptions.verbose || false,
        skipTests: generationOptions.skipTests || false,
      };

      let manifest = createManifest(config);
      manifest = addSuccess(manifest, options.component);
      await saveManifest(manifest);

      progress.displaySuccess(
        options.component,
        Math.round((Date.now() - startTime) / 1000)
      );
    } else {
      // Dry-run: display pseudo-code with syntax highlighting (T059)
      displayDryRunOutput(validatedComponent);
    }

    const duration = Date.now() - startTime;
    await logger.info(
      options.component,
      'migration-complete',
      duration,
      { dryRun: options.dryRun }
    );

    progress.displaySummary(1, 1, 0, 0, Math.round(duration / 1000));

    process.exit(EXIT_CODES.SUCCESS);
  } catch (error) {
    const err = error as Error;
    if (logger) {
      await logger.error('unknown', 'fatal-error', Date.now() - startTime, err.message);
    }
    if (progress) {
      progress.displayError('unknown', err.message);
    }
    console.error('Fatal error:', err);
    process.exit(EXIT_CODES.FILESYSTEM_ERROR);
  } finally {
    if (logger) {
      await logger.close();
    }
  }
}

// Run CLI if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(EXIT_CODES.FILESYSTEM_ERROR);
  });
}
