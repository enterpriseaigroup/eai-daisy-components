/**
 * Console Progress Indicator
 *
 * Displays real-time progress feedback with ANSI color codes per NFR-007.
 */

import type { ProgressInfo } from '../types/logging.js';

// ANSI color codes
const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
} as const;

export class ConsoleProgressIndicator {
  private lastUpdateTime: number = 0;
  private readonly updateThrottleMs: number = 100; // Update max once per 100ms

  /**
   * Displays progress for the current component
   */
  displayProgress(info: ProgressInfo): void {
    // Throttle updates to avoid console spam
    const now = Date.now();
    if (now - this.lastUpdateTime < this.updateThrottleMs) {
      return;
    }
    this.lastUpdateTime = now;

    const {
      current,
      total,
      componentName,
      elapsedMs,
      estimatedRemainingMs,
      successCount,
      failureCount,
      skipCount,
    } = info;

    const progress = Math.floor((current / total) * 100);
    const progressBar = this.createProgressBar(progress);
    const elapsed = this.formatDuration(elapsedMs);
    const remaining = estimatedRemainingMs
      ? this.formatDuration(estimatedRemainingMs)
      : '?';

    // Clear line and move cursor to beginning
    process.stdout.write('\r\x1b[K');

    // Build progress line
    const line = [
      `${COLORS.cyan}[${current}/${total}]${COLORS.reset}`,
      progressBar,
      `${COLORS.blue}${componentName}${COLORS.reset}`,
      `${COLORS.gray}(${elapsed} elapsed, ${remaining} remaining)${COLORS.reset}`,
      this.formatCounts(successCount, failureCount, skipCount),
    ].join(' ');

    process.stdout.write(line);
  }

  /**
   * Displays a success message
   */
  displaySuccess(componentName: string, duration: number): void {
    const formatted = this.formatDuration(duration);
    console.log(
      `\n${COLORS.green}✓${COLORS.reset} ${componentName} ${COLORS.gray}(${formatted})${COLORS.reset}`
    );
  }

  /**
   * Displays an error message
   */
  displayError(componentName: string, error: string): void {
    console.log(
      `\n${COLORS.red}✗${COLORS.reset} ${componentName} ${COLORS.gray}- ${error}${COLORS.reset}`
    );
  }

  /**
   * Displays a warning message
   */
  displayWarning(componentName: string, warning: string): void {
    console.log(
      `\n${COLORS.yellow}⚠${COLORS.reset} ${componentName} ${COLORS.gray}- ${warning}${COLORS.reset}`
    );
  }

  /**
   * Displays a skip message
   */
  displaySkip(componentName: string, reason: string): void {
    console.log(
      `\n${COLORS.gray}○${COLORS.reset} ${componentName} ${COLORS.gray}- ${reason}${COLORS.reset}`
    );
  }

  /**
   * Displays final summary
   */
  displaySummary(
    total: number,
    successCount: number,
    failureCount: number,
    skipCount: number,
    totalDuration: number
  ): void {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log(`${COLORS.cyan}Generation Summary${COLORS.reset}`);
    console.log('─'.repeat(60));
    console.log(`Total Components: ${total}`);
    console.log(
      `${COLORS.green}✓ Successful: ${successCount}${COLORS.reset}`
    );
    console.log(`${COLORS.red}✗ Failed: ${failureCount}${COLORS.reset}`);
    console.log(`${COLORS.gray}○ Skipped: ${skipCount}${COLORS.reset}`);
    console.log(
      `${COLORS.gray}Duration: ${this.formatDuration(totalDuration)}${COLORS.reset}`
    );
    console.log('═'.repeat(60));
  }

  /**
   * Creates a text-based progress bar
   */
  private createProgressBar(percent: number): string {
    const barLength = 20;
    const filled = Math.floor((percent / 100) * barLength);
    const empty = barLength - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    return `[${bar}] ${percent}%`;
  }

  /**
   * Formats success/failure/skip counts
   */
  private formatCounts(
    success: number,
    failure: number,
    skip: number
  ): string {
    const parts: string[] = [];

    if (success > 0) {
      parts.push(`${COLORS.green}${success}✓${COLORS.reset}`);
    }
    if (failure > 0) {
      parts.push(`${COLORS.red}${failure}✗${COLORS.reset}`);
    }
    if (skip > 0) {
      parts.push(`${COLORS.gray}${skip}○${COLORS.reset}`);
    }

    return parts.length > 0 ? `[${parts.join(' ')}]` : '';
  }

  /**
   * Formats duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }

    const seconds = Math.floor(ms / 1000);
    if (seconds < 60) {
      return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }

  /**
   * Clears the current progress line
   */
  clearLine(): void {
    process.stdout.write('\r\x1b[K');
  }
}
