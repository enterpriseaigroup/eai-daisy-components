/**
 * Component Migration CLI
 *
 * Command-line interface for running single component migrations.
 *
 * @fileoverview CLI for component migration
 * @version 1.0.0
 */

import { Command } from 'commander';
import { initializeRepositoryConfig } from '@/config/repository-config';
import { createDefaultPipelineConfig } from '@/config/pipeline-config';
import { createMigrationJob } from '@/pipeline/migration-job';
import { getGlobalLogger, initializeLogging } from '@/utils/logging';
import { initializeErrorHandling } from '@/utils/errors';

export async function runMigrationCLI(): Promise<void> {
  const program = new Command();

  program
    .name('migrate-component')
    .description('Migrate DAISY v1 component to Configurator v2')
    .version('1.0.0')
    .requiredOption('--component <name>', 'Component name to migrate')
    .option('--tier <number>', 'Component tier (1-4)', '1')
    .option('--repository <path>', 'DAISY v1 repository path')
    .option('--output <path>', 'Output directory', process.cwd())
    .option('--dry-run', 'Perform dry run without writing files', false)
    .option('--verbose', 'Enable verbose logging', false);

  program.parse(process.argv);

  const options = program.opts<{
    component: string;
    tier: string;
    repository?: string;
    output: string;
    dryRun: boolean;
    verbose: boolean;
  }>();

  // Initialize infrastructure
  initializeLogging({
    level: options.verbose ? 'debug' : 'info',
    outputs: ['console', 'file'],
    format: 'detailed',
    timestamps: true,
    stackTraces: true,
  });

  initializeErrorHandling();

  const logger = getGlobalLogger('migrate-component');

  try {
    logger.info('Starting component migration', {
      component: options.component,
      tier: options.tier,
      dryRun: options.dryRun,
    });

    await initializeRepositoryConfig(options.repository);

    const config = createDefaultPipelineConfig();
    const modifiedConfig = { ...config, outputPath: options.output };

    const migrationJob = createMigrationJob({
      config: modifiedConfig,
      componentName: options.component,
      dryRun: options.dryRun,
    });

    const result = await migrationJob.execute();

    logger.info('Migration completed', {
      successful: result.summary.successful,
      failed: result.summary.failed,
      duration: result.summary.duration,
    });

    if (result.summary.failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    logger.error('Migration failed', error as Error);
    process.exit(1);
  }
}

if (require.main === module) {
  runMigrationCLI().catch(console.error);
}
