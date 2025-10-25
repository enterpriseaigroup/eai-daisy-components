/**
 * Generation Manifest Manager
 *
 * Manages persistence and updates of generation manifests for recovery operations.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  GenerationManifest,
  GenerationConfig,
  FailedComponent,
} from '../types/manifest.js';

const MANIFEST_VERSION = '1.0.0';
const DEFAULT_MANIFEST_PATH = '.specify/logs/generation-manifest.json';

/**
 * Creates a new generation manifest
 */
export function createManifest(config: GenerationConfig): GenerationManifest {
  return {
    successful: [],
    failed: [],
    config,
    startTime: new Date().toISOString(),
    version: MANIFEST_VERSION,
  };
}

/**
 * Adds a successful component to the manifest
 */
export function addSuccess(
  manifest: GenerationManifest,
  componentName: string
): GenerationManifest {
  return {
    ...manifest,
    successful: [...manifest.successful, componentName],
  };
}

/**
 * Adds a failed component to the manifest
 */
export function addFailure(
  manifest: GenerationManifest,
  component: string,
  error: Error
): GenerationManifest {
  const failedComponent: FailedComponent = {
    component,
    error: error.message,
    timestamp: new Date().toISOString(),
    ...(error.stack ? { stack: error.stack } : {}),
  };

  return {
    ...manifest,
    failed: [...manifest.failed, failedComponent],
  };
}

/**
 * Loads manifest from disk
 */
export async function loadManifest(
  manifestPath: string = DEFAULT_MANIFEST_PATH
): Promise<GenerationManifest | null> {
  try {
    const content = await fs.readFile(manifestPath, 'utf-8');
    return JSON.parse(content) as GenerationManifest;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/**
 * Saves manifest to disk
 */
export async function saveManifest(
  manifest: GenerationManifest,
  manifestPath: string = DEFAULT_MANIFEST_PATH
): Promise<void> {
  // Update end time and duration
  const now = new Date();
  const updatedManifest: GenerationManifest = {
    ...manifest,
    endTime: now.toISOString(),
    duration: now.getTime() - new Date(manifest.startTime).getTime(),
  };

  // Ensure directory exists
  const dir = path.dirname(manifestPath);
  await fs.mkdir(dir, { recursive: true });

  // Write manifest
  await fs.writeFile(
    manifestPath,
    JSON.stringify(updatedManifest, null, 2),
    'utf-8'
  );
}

/**
 * Gets the default manifest path
 */
export function getDefaultManifestPath(): string {
  return DEFAULT_MANIFEST_PATH;
}
