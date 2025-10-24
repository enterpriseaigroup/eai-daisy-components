/**
 * NPM Publishing Pipeline
 *
 * Automated pipeline for publishing migrated components to NPM registry.
 *
 * @fileoverview NPM publishing automation
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getGlobalLogger } from '@/utils/logging';

const execAsync = promisify(exec);

// ============================================================================
// PUBLISHING TYPES
// ============================================================================

/**
 * Publishing options
 */
export interface PublishOptions {
  /** Package directory */
  readonly packageDir: string;

  /** NPM registry URL */
  readonly registry?: string;

  /** NPM access (public/restricted) */
  readonly access?: 'public' | 'restricted';

  /** NPM tag (latest, beta, etc.) */
  readonly tag?: string;

  /** Dry run (don't actually publish) */
  readonly dryRun?: boolean;

  /** Skip build step */
  readonly skipBuild?: boolean;

  /** OTP code for 2FA */
  readonly otp?: string;
}

/**
 * Publishing result
 */
export interface PublishResult {
  /** Package name */
  readonly packageName: string;

  /** Published version */
  readonly version: string;

  /** Publishing success */
  readonly success: boolean;

  /** NPM registry URL */
  readonly registryUrl: string;

  /** Publish errors */
  readonly errors: string[];

  /** Publish warnings */
  readonly warnings: string[];
}

// ============================================================================
// PUBLISH PIPELINE
// ============================================================================

/**
 * Manages NPM publishing pipeline
 */
export class PublishPipeline {
  private readonly logger = getGlobalLogger('PublishPipeline');

  /**
   * Publish package to NPM
   */
  public async publish(options: PublishOptions): Promise<PublishResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      this.logger.info(`Publishing package from: ${options.packageDir}`);

      // Read package.json
      const packageJson = await this.readPackageJson(options.packageDir);

      // Build package if needed
      if (!options.skipBuild) {
        await this.buildPackage(options.packageDir);
      }

      // Run pre-publish checks
      await this.runPrePublishChecks(options.packageDir);

      // Publish to NPM
      if (!options.dryRun) {
        await this.publishToNPM(options);
      } else {
        this.logger.info('Dry run - skipping actual publish');
      }

      this.logger.info(
        `Package published successfully: ${packageJson.name}@${packageJson.version}`
      );

      return {
        packageName: packageJson.name,
        version: packageJson.version,
        success: true,
        registryUrl: options.registry || 'https://registry.npmjs.org',
        errors,
        warnings,
      };
    } catch (error) {
      this.logger.error('Publishing failed', error as Error);

      return {
        packageName: '',
        version: '',
        success: false,
        registryUrl: options.registry || 'https://registry.npmjs.org',
        errors: [(error as Error).message, ...errors],
        warnings,
      };
    }
  }

  /**
   * Read package.json
   */
  private async readPackageJson(packageDir: string): Promise<any> {
    const packageJsonPath = join(packageDir, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * Build package
   */
  private async buildPackage(packageDir: string): Promise<void> {
    this.logger.info('Building package...');

    try {
      await execAsync('npm run build', { cwd: packageDir });
      this.logger.info('Build completed successfully');
    } catch (error) {
      throw new Error(`Build failed: ${(error as Error).message}`);
    }
  }

  /**
   * Run pre-publish checks
   */
  private async runPrePublishChecks(packageDir: string): Promise<void> {
    this.logger.info('Running pre-publish checks...');

    // Check if package.json exists
    const packageJsonPath = join(packageDir, 'package.json');
    const packageJsonExists = await fs
      .access(packageJsonPath)
      .then(() => true)
      .catch(() => false);

    if (!packageJsonExists) {
      throw new Error('package.json not found');
    }

    // Check if dist directory exists
    const distPath = join(packageDir, 'dist');
    const distExists = await fs
      .access(distPath)
      .then(() => true)
      .catch(() => false);

    if (!distExists) {
      throw new Error('dist/ directory not found - build may have failed');
    }

    this.logger.info('Pre-publish checks passed');
  }

  /**
   * Publish to NPM registry
   */
  private async publishToNPM(options: PublishOptions): Promise<void> {
    const args = ['publish'];

    if (options.access) {
      args.push('--access', options.access);
    }

    if (options.tag) {
      args.push('--tag', options.tag);
    }

    if (options.registry) {
      args.push('--registry', options.registry);
    }

    if (options.otp) {
      args.push('--otp', options.otp);
    }

    const command = `npm ${args.join(' ')}`;

    this.logger.info(`Executing: ${command}`);

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: options.packageDir,
      });

      if (stdout) {
        this.logger.info(stdout);
      }

      if (stderr) {
        this.logger.warn(stderr);
      }
    } catch (error) {
      throw new Error(`Publish command failed: ${(error as Error).message}`);
    }
  }

  /**
   * Publish multiple packages
   */
  public async publishBatch(
    packagesOptions: PublishOptions[]
  ): Promise<PublishResult[]> {
    const results: PublishResult[] = [];

    for (const options of packagesOptions) {
      const result = await this.publish(options);
      results.push(result);

      // Add delay between publishes to avoid rate limiting
      if (!options.dryRun) {
        await this.delay(2000);
      }
    }

    return results;
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Create publish pipeline
 */
export function createPublishPipeline(): PublishPipeline {
  return new PublishPipeline();
}

/**
 * Publish package to NPM
 */
export async function publishPackage(
  options: PublishOptions
): Promise<PublishResult> {
  const pipeline = createPublishPipeline();
  return pipeline.publish(options);
}
