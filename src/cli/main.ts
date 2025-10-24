#!/usr/bin/env node

/**
 * CLI Entry Point
 *
 * Main entry point for the component extraction CLI tool.
 * Provides command-line interface for component scanning, extraction,
 * and migration operations.
 *
 * @fileoverview CLI entry point with error handling
 * @version 1.0.0
 */

import { CLIBuilder } from './index';
import { getGlobalErrorHandler } from '@/utils/errors';

/**
 * Main CLI function
 */
async function main(): Promise<void> {
  try {
    const cli = new CLIBuilder();
    await cli.run(process.argv);
  } catch (error) {
    const errorHandler = getGlobalErrorHandler();
    await errorHandler.handleError(error as Error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run main function (ESM compatible)
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
