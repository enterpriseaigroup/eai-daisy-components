/**
 * Migration Status Tracker
 *
 * Tracks migration progress, status, and results for individual components
 * and batch migrations.
 *
 * @fileoverview Migration tracking and reporting utilities
 * @version 1.0.0
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import type { ComponentDefinition, MigrationStatus } from '@/types';
import { getGlobalLogger } from './logging';

// ============================================================================
// TRACKER TYPES
// ============================================================================

/**
 * Migration record for a single component
 */
export interface MigrationRecord {
  /** Component ID */
  readonly componentId: string;

  /** Component name */
  readonly componentName: string;

  /** Migration status */
  status: MigrationStatus;

  /** Source component definition */
  readonly sourceComponent: ComponentDefinition;

  /** Target component definition (if migration successful) */
  targetComponent?: ComponentDefinition;

  /** Migration start time */
  readonly startTime: Date;

  /** Migration end time */
  endTime?: Date;

  /** Migration duration in milliseconds */
  duration?: number;

  /** Errors encountered */
  errors: Error[];

  /** Warnings generated */
  warnings: string[];

  /** Validation results */
  validationResults?: ValidationResults;

  /** Equivalency test results */
  equivalencyResults?: EquivalencyResults;

  /** Migration metadata */
  metadata: MigrationMetadata;
}

/**
 * Validation results
 */
export interface ValidationResults {
  /** Overall validation passed */
  readonly passed: boolean;

  /** TypeScript validation passed */
  readonly typescriptPassed: boolean;

  /** ESLint validation passed */
  readonly eslintPassed: boolean;

  /** Component structure validation passed */
  readonly structurePassed: boolean;

  /** Business logic preservation validation passed */
  readonly businessLogicPassed: boolean;

  /** Validation errors */
  readonly errors: string[];

  /** Validation warnings */
  readonly warnings: string[];
}

/**
 * Equivalency test results
 */
export interface EquivalencyResults {
  /** Overall equivalency passed */
  readonly passed: boolean;

  /** Equivalency score (0-100) */
  readonly score: number;

  /** Props match */
  readonly propsMatch: boolean;

  /** Behavior match */
  readonly behaviorMatch: boolean;

  /** Render match */
  readonly renderMatch: boolean;

  /** State management match */
  readonly stateMatch: boolean;

  /** Performance acceptable */
  readonly performanceAcceptable: boolean;

  /** Test results */
  readonly testResults: TestResult[];
}

/**
 * Individual test result
 */
export interface TestResult {
  /** Test name */
  readonly name: string;

  /** Test passed */
  readonly passed: boolean;

  /** Error message (if failed) */
  readonly error?: string;

  /** Test duration in milliseconds */
  readonly duration: number;
}

/**
 * Migration metadata
 */
export interface MigrationMetadata {
  /** Component complexity level */
  readonly complexity: string;

  /** Component tier */
  readonly tier: number;

  /** Baseline path */
  readonly baselinePath?: string;

  /** Output path */
  readonly outputPath?: string;

  /** Bundle size (original) in bytes */
  readonly originalBundleSize?: number;

  /** Bundle size (migrated) in bytes */
  readonly migratedBundleSize?: number;

  /** Bundle size increase percentage */
  readonly bundleSizeIncrease?: number;

  /** Memory usage in bytes */
  readonly memoryUsage?: number;

  /** Migration worker/thread ID */
  readonly workerId?: string;

  /** Custom metadata */
  [key: string]: unknown;
}

/**
 * Migration session tracking
 */
export interface MigrationSession {
  /** Session ID */
  readonly id: string;

  /** Session start time */
  readonly startTime: Date;

  /** Session end time */
  endTime?: Date;

  /** Total components */
  totalComponents: number;

  /** Completed components */
  completedComponents: number;

  /** Failed components */
  failedComponents: number;

  /** In-progress components */
  inProgressComponents: number;

  /** Migration records */
  readonly records: Map<string, MigrationRecord>;

  /** Session configuration */
  readonly config: SessionConfig;
}

/**
 * Session configuration
 */
export interface SessionConfig {
  /** Session type */
  readonly type: 'single' | 'batch' | 'tier' | 'full';

  /** Concurrency level */
  readonly concurrency: number;

  /** Continue on error */
  readonly continueOnError: boolean;

  /** Output directory */
  readonly outputDirectory: string;

  /** Report formats */
  readonly reportFormats: Array<'json' | 'markdown' | 'html' | 'csv'>;
}

// ============================================================================
// MIGRATION TRACKER
// ============================================================================

/**
 * Tracks migration status and progress
 */
export class MigrationTracker {
  private readonly sessions: Map<string, MigrationSession> = new Map();
  private currentSessionId: string | null = null;
  private readonly logger = getGlobalLogger('MigrationTracker');

  /**
   * Start a new migration session
   */
  public startSession(config: SessionConfig): string {
    const sessionId = this.generateSessionId();
    const session: MigrationSession = {
      id: sessionId,
      startTime: new Date(),
      totalComponents: 0,
      completedComponents: 0,
      failedComponents: 0,
      inProgressComponents: 0,
      records: new Map(),
      config,
    };

    this.sessions.set(sessionId, session);
    this.currentSessionId = sessionId;

    this.logger.info(`Migration session started: ${sessionId}`, {
      type: config.type,
      concurrency: config.concurrency,
    });

    return sessionId;
  }

  /**
   * End migration session
   */
  public async endSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.endTime = new Date();

    this.logger.info(`Migration session ended: ${sessionId}`, {
      totalComponents: session.totalComponents,
      completed: session.completedComponents,
      failed: session.failedComponents,
      duration: session.endTime.getTime() - session.startTime.getTime(),
    });

    // Generate reports
    await this.generateReports(session);

    if (this.currentSessionId === sessionId) {
      this.currentSessionId = null;
    }
  }

  /**
   * Start tracking component migration
   */
  public startMigration(
    component: ComponentDefinition,
    sessionId?: string,
  ): string {
    const sid = sessionId || this.currentSessionId;
    if (!sid) {
      throw new Error('No active session');
    }

    const session = this.sessions.get(sid);
    if (!session) {
      throw new Error(`Session not found: ${sid}`);
    }

    const record: MigrationRecord = {
      componentId: component.id,
      componentName: component.name,
      status: 'in-progress',
      sourceComponent: component,
      startTime: new Date(),
      errors: [],
      warnings: [],
      metadata: {
        complexity: component.complexity,
        tier: this.determineTier(component.complexity),
      },
    };

    session.records.set(component.id, record);
    session.totalComponents++;
    session.inProgressComponents++;

    this.logger.debug(`Started tracking migration: ${component.name}`, {
      componentId: component.id,
      sessionId: sid,
    });

    return component.id;
  }

  /**
   * Update migration status
   */
  public updateStatus(
    componentId: string,
    status: MigrationStatus,
    sessionId?: string,
  ): void {
    const record = this.getRecord(componentId, sessionId);
    const session = this.getSession(sessionId);

    const oldStatus = record.status;
    record.status = status;

    // Update session counters
    if (oldStatus === 'in-progress') {
      session.inProgressComponents--;
    }

    if (status === 'completed') {
      session.completedComponents++;
      record.endTime = new Date();
      record.duration = record.endTime.getTime() - record.startTime.getTime();
    } else if (status === 'failed') {
      session.failedComponents++;
      record.endTime = new Date();
      record.duration = record.endTime.getTime() - record.startTime.getTime();
    }

    this.logger.debug(`Migration status updated: ${record.componentName}`, {
      componentId,
      status,
      oldStatus,
    });
  }

  /**
   * Record migration error
   */
  public recordError(
    componentId: string,
    error: Error,
    sessionId?: string,
  ): void {
    const record = this.getRecord(componentId, sessionId);
    record.errors.push(error);

    this.logger.error(
      `Migration error recorded: ${record.componentName}`,
      error,
    );
  }

  /**
   * Record migration warning
   */
  public recordWarning(
    componentId: string,
    warning: string,
    sessionId?: string,
  ): void {
    const record = this.getRecord(componentId, sessionId);
    record.warnings.push(warning);

    this.logger.warn(`Migration warning: ${record.componentName}`, { warning });
  }

  /**
   * Set target component after successful migration
   */
  public setTargetComponent(
    componentId: string,
    targetComponent: ComponentDefinition,
    sessionId?: string,
  ): void {
    const record = this.getRecord(componentId, sessionId);
    record.targetComponent = targetComponent;
  }

  /**
   * Set validation results
   */
  public setValidationResults(
    componentId: string,
    results: ValidationResults,
    sessionId?: string,
  ): void {
    const record = this.getRecord(componentId, sessionId);
    record.validationResults = results;

    if (!results.passed) {
      this.updateStatus(componentId, 'failed', sessionId);
    }
  }

  /**
   * Set equivalency results
   */
  public setEquivalencyResults(
    componentId: string,
    results: EquivalencyResults,
    sessionId?: string,
  ): void {
    const record = this.getRecord(componentId, sessionId);
    record.equivalencyResults = results;

    if (!results.passed) {
      this.updateStatus(componentId, 'failed', sessionId);
    }
  }

  /**
   * Update migration metadata
   */
  public updateMetadata(
    componentId: string,
    metadata: Partial<MigrationMetadata>,
    sessionId?: string,
  ): void {
    const record = this.getRecord(componentId, sessionId);
    record.metadata = { ...record.metadata, ...metadata };
  }

  /**
   * Get migration record
   */
  public getRecord(componentId: string, sessionId?: string): MigrationRecord {
    const session = this.getSession(sessionId);
    const record = session.records.get(componentId);

    if (!record) {
      throw new Error(`Migration record not found: ${componentId}`);
    }

    return record;
  }

  /**
   * Get session
   */
  public getSession(sessionId?: string): MigrationSession {
    const sid = sessionId || this.currentSessionId;
    if (!sid) {
      throw new Error('No active session');
    }

    const session = this.sessions.get(sid);
    if (!session) {
      throw new Error(`Session not found: ${sid}`);
    }

    return session;
  }

  /**
   * Get session summary
   */
  public getSessionSummary(sessionId?: string): SessionSummary {
    const session = this.getSession(sessionId);

    const duration = session.endTime
      ? session.endTime.getTime() - session.startTime.getTime()
      : Date.now() - session.startTime.getTime();

    const records = Array.from(session.records.values());

    const summary: SessionSummary = {
      sessionId: session.id,
      startTime: session.startTime,
      duration,
      totalComponents: session.totalComponents,
      completedComponents: session.completedComponents,
      failedComponents: session.failedComponents,
      inProgressComponents: session.inProgressComponents,
      successRate:
        session.totalComponents > 0
          ? (session.completedComponents / session.totalComponents) * 100
          : 0,
      averageDuration: this.calculateAverageDuration(records),
      totalErrors: records.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: records.reduce((sum, r) => sum + r.warnings.length, 0),
      ...(session.endTime ? { endTime: session.endTime } : {}),
    };

    return summary;
  }

  /**
   * Generate migration reports
   */
  private async generateReports(session: MigrationSession): Promise<void> {
    for (const format of session.config.reportFormats) {
      try {
        switch (format) {
          case 'json':
            await this.generateJsonReport(session);
            break;
          case 'markdown':
            await this.generateMarkdownReport(session);
            break;
          case 'csv':
            await this.generateCsvReport(session);
            break;
          case 'html':
            await this.generateHtmlReport(session);
            break;
        }
      } catch (error) {
        this.logger.error(
          `Failed to generate ${format} report`,
          error as Error,
        );
      }
    }
  }

  /**
   * Generate JSON report
   */
  private async generateJsonReport(session: MigrationSession): Promise<void> {
    const report = {
      session: {
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        config: session.config,
      },
      summary: this.getSessionSummary(session.id),
      records: Array.from(session.records.values()).map(r => ({
        ...r,
        sourceComponent: undefined, // Exclude for brevity
        targetComponent: undefined,
      })),
    };

    const reportPath = join(
      session.config.outputDirectory,
      `migration-report-${session.id}.json`,
    );

    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.logger.info(`JSON report generated: ${reportPath}`);
  }

  /**
   * Generate Markdown report
   */
  private async generateMarkdownReport(
    session: MigrationSession,
  ): Promise<void> {
    const summary = this.getSessionSummary(session.id);
    const records = Array.from(session.records.values());

    let markdown = '# Migration Report\n\n';
    markdown += `**Session ID:** ${session.id}\n`;
    markdown += `**Start Time:** ${session.startTime.toISOString()}\n`;
    markdown += `**End Time:** ${session.endTime?.toISOString() || 'In Progress'}\n`;
    markdown += `**Duration:** ${this.formatDuration(summary.duration)}\n\n`;

    markdown += '## Summary\n\n';
    markdown += '| Metric | Value |\n';
    markdown += '|--------|-------|\n';
    markdown += `| Total Components | ${summary.totalComponents} |\n`;
    markdown += `| Completed | ${summary.completedComponents} |\n`;
    markdown += `| Failed | ${summary.failedComponents} |\n`;
    markdown += `| In Progress | ${summary.inProgressComponents} |\n`;
    markdown += `| Success Rate | ${summary.successRate.toFixed(2)}% |\n`;
    markdown += `| Average Duration | ${this.formatDuration(summary.averageDuration)} |\n\n`;

    markdown += '## Component Details\n\n';
    markdown += '| Component | Status | Duration | Errors | Warnings |\n';
    markdown += '|-----------|--------|----------|--------|----------|\n';

    for (const record of records) {
      markdown += `| ${record.componentName} | ${record.status} | ${this.formatDuration(record.duration || 0)} | ${record.errors.length} | ${record.warnings.length} |\n`;
    }

    const reportPath = join(
      session.config.outputDirectory,
      `migration-report-${session.id}.md`,
    );

    await fs.writeFile(reportPath, markdown);

    this.logger.info(`Markdown report generated: ${reportPath}`);
  }

  /**
   * Generate CSV report
   */
  private async generateCsvReport(session: MigrationSession): Promise<void> {
    const records = Array.from(session.records.values());

    let csv = 'Component,Status,Complexity,Tier,Duration,Errors,Warnings\n';

    for (const record of records) {
      csv += `"${record.componentName}",${record.status},${record.metadata.complexity},${record.metadata.tier},${record.duration || 0},${record.errors.length},${record.warnings.length}\n`;
    }

    const reportPath = join(
      session.config.outputDirectory,
      `migration-report-${session.id}.csv`,
    );

    await fs.writeFile(reportPath, csv);

    this.logger.info(`CSV report generated: ${reportPath}`);
  }

  /**
   * Generate HTML report
   */
  private async generateHtmlReport(session: MigrationSession): Promise<void> {
    const summary = this.getSessionSummary(session.id);
    const records = Array.from(session.records.values());

    let html = `<!DOCTYPE html>
<html>
<head>
  <title>Migration Report - ${session.id}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    .summary { background-color: #f0f0f0; padding: 15px; border-radius: 5px; }
    .success { color: green; }
    .failed { color: red; }
  </style>
</head>
<body>
  <h1>Migration Report</h1>
  <div class="summary">
    <p><strong>Session ID:</strong> ${session.id}</p>
    <p><strong>Duration:</strong> ${this.formatDuration(summary.duration)}</p>
    <p><strong>Success Rate:</strong> ${summary.successRate.toFixed(2)}%</p>
  </div>
  <h2>Component Details</h2>
  <table>
    <tr>
      <th>Component</th>
      <th>Status</th>
      <th>Duration</th>
      <th>Errors</th>
      <th>Warnings</th>
    </tr>`;

    for (const record of records) {
      const statusClass = record.status === 'completed' ? 'success' : 'failed';
      html += `
    <tr>
      <td>${record.componentName}</td>
      <td class="${statusClass}">${record.status}</td>
      <td>${this.formatDuration(record.duration || 0)}</td>
      <td>${record.errors.length}</td>
      <td>${record.warnings.length}</td>
    </tr>`;
    }

    html += `
  </table>
</body>
</html>`;

    const reportPath = join(
      session.config.outputDirectory,
      `migration-report-${session.id}.html`,
    );

    await fs.writeFile(reportPath, html);

    this.logger.info(`HTML report generated: ${reportPath}`);
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Determine tier from complexity
   */
  private determineTier(complexity: string): number {
    switch (complexity) {
      case 'simple':
        return 1;
      case 'moderate':
        return 2;
      case 'complex':
        return 3;
      case 'critical':
        return 4;
      default:
        return 1;
    }
  }

  /**
   * Calculate average duration
   */
  private calculateAverageDuration(records: MigrationRecord[]): number {
    const completed = records.filter(r => r.duration !== undefined);
    if (completed.length === 0) {
      return 0;
    }

    const total = completed.reduce((sum, r) => sum + (r.duration || 0), 0);
    return total / completed.length;
  }

  /**
   * Format duration for display
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    if (ms < 60000) {
      return `${(ms / 1000).toFixed(2)}s`;
    }
    return `${(ms / 60000).toFixed(2)}m`;
  }
}

// ============================================================================
// SESSION SUMMARY
// ============================================================================

/**
 * Session summary statistics
 */
export interface SessionSummary {
  readonly sessionId: string;
  readonly startTime: Date;
  readonly endTime?: Date;
  readonly duration: number;
  readonly totalComponents: number;
  readonly completedComponents: number;
  readonly failedComponents: number;
  readonly inProgressComponents: number;
  readonly successRate: number;
  readonly averageDuration: number;
  readonly totalErrors: number;
  readonly totalWarnings: number;
}

// ============================================================================
// EXPORTS
// ============================================================================

/** Global migration tracker instance */
let globalTracker: MigrationTracker | null = null;

/**
 * Get global migration tracker
 */
export function getGlobalTracker(): MigrationTracker {
  if (!globalTracker) {
    globalTracker = new MigrationTracker();
  }
  return globalTracker;
}

/**
 * Create new migration tracker instance
 */
export function createMigrationTracker(): MigrationTracker {
  return new MigrationTracker();
}
