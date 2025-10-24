/**
 * Migration Progress Dashboard
 *
 * Real-time dashboard for monitoring batch migration progress with
 * live updates, statistics, and visual progress indicators.
 *
 * @fileoverview Migration dashboard and reporting
 * @version 1.0.0
 */

import { EventEmitter } from 'events';
import type { MigrationStatus } from '@/types';

/**
 * Dashboard metrics
 */
export interface DashboardMetrics {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
  pending: number;
  successRate: number;
  averageTime: number;
  estimatedTimeRemaining: number;
}

/**
 * Component migration status
 */
export interface ComponentMigrationStatus {
  id: string;
  name: string;
  status: MigrationStatus;
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  equivalencyScore?: number;
  errors?: string[];
}

/**
 * Dashboard update event
 */
export interface DashboardUpdate {
  metrics: DashboardMetrics;
  components: ComponentMigrationStatus[];
  timestamp: Date;
}

/**
 * Migration progress dashboard
 */
export class MigrationDashboard extends EventEmitter {
  private readonly components: Map<string, ComponentMigrationStatus> =
    new Map();
  private updateInterval: NodeJS.Timeout | undefined;

  /**
   * Start dashboard monitoring
   */
  public start(): void {
    // Start time tracking reserved for future analytics
    this.components.clear();

    // Emit updates every second
    this.updateInterval = setInterval(() => {
      this.emitUpdate();
    }, 1000);

    this.emitUpdate();
  }

  /**
   * Stop dashboard monitoring
   */
  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }

    this.emitUpdate();
  }

  /**
   * Update component status
   */
  public updateComponent(status: ComponentMigrationStatus): void {
    this.components.set(status.id, status);
    this.emitUpdate();
  }

  /**
   * Get current metrics
   */
  public getMetrics(): DashboardMetrics {
    const components = Array.from(this.components.values());

    const total = components.length;
    const completed = components.filter(c => c.status === 'completed').length;
    const inProgress = components.filter(
      c => c.status === 'in-progress'
    ).length;
    const failed = components.filter(c => c.status === 'failed').length;
    const pending = components.filter(c => c.status === 'pending').length;

    const successRate =
      total > 0 ? (completed / (completed + failed)) * 100 : 0;

    // Calculate average migration time
    const completedComponents = components.filter(
      c => c.status === 'completed' && c.duration
    );
    const averageTime =
      completedComponents.length > 0
        ? completedComponents.reduce((sum, c) => sum + (c.duration || 0), 0) /
          completedComponents.length
        : 0;

    // Estimate time remaining
    const remaining = pending + inProgress;
    const estimatedTimeRemaining = remaining * averageTime;

    return {
      total,
      completed,
      inProgress,
      failed,
      pending,
      successRate,
      averageTime,
      estimatedTimeRemaining,
    };
  }

  /**
   * Get all component statuses
   */
  public getComponents(): ComponentMigrationStatus[] {
    return Array.from(this.components.values());
  }

  /**
   * Emit dashboard update
   */
  private emitUpdate(): void {
    const update: DashboardUpdate = {
      metrics: this.getMetrics(),
      components: this.getComponents(),
      timestamp: new Date(),
    };

    this.emit('update', update);
  }

  /**
   * Generate HTML dashboard
   */
  public generateHTML(): string {
    const metrics = this.getMetrics();
    const components = this.getComponents();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Migration Dashboard</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; margin-bottom: 30px; }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .metric-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
      margin-bottom: 5px;
    }
    .metric-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .progress-bar {
      width: 100%;
      height: 40px;
      background: #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 30px;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #2563eb, #3b82f6);
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
    }
    .components-table {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }
    .status-completed { background: #dcfce7; color: #166534; }
    .status-in-progress { background: #dbeafe; color: #1e40af; }
    .status-failed { background: #fee2e2; color: #991b1b; }
    .status-pending { background: #f3f4f6; color: #4b5563; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Component Migration Dashboard</h1>
    
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${metrics.total}</div>
        <div class="metric-label">Total Components</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.completed}</div>
        <div class="metric-label">Completed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.failed}</div>
        <div class="metric-label">Failed</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${metrics.successRate.toFixed(1)}%</div>
        <div class="metric-label">Success Rate</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${(metrics.averageTime / 1000).toFixed(1)}s</div>
        <div class="metric-label">Avg Time</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">${Math.ceil(metrics.estimatedTimeRemaining / 60000)}m</div>
        <div class="metric-label">Est. Remaining</div>
      </div>
    </div>

    <div class="progress-bar">
      <div class="progress-fill" style="width: ${(metrics.completed / metrics.total) * 100}%">
        ${metrics.completed} / ${metrics.total}
      </div>
    </div>

    <div class="components-table">
      <table>
        <thead>
          <tr>
            <th>Component</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Equivalency</th>
          </tr>
        </thead>
        <tbody>
          ${components
            .map(
              c => `
            <tr>
              <td>${c.name}</td>
              <td><span class="status-badge status-${c.status}">${c.status}</span></td>
              <td>${c.duration ? (c.duration / 1000).toFixed(2) + 's' : '-'}</td>
              <td>${c.equivalencyScore ? (c.equivalencyScore * 100).toFixed(1) + '%' : '-'}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Generate terminal output
   */
  public generateTerminalOutput(): string {
    const metrics = this.getMetrics();

    const progressBar = this.createProgressBar(
      metrics.completed,
      metrics.total,
      40
    );

    return `
╔══════════════════════════════════════════════════════════════╗
║               COMPONENT MIGRATION DASHBOARD                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Progress: ${progressBar}                           ║
║            ${metrics.completed}/${metrics.total} components (${((metrics.completed / metrics.total) * 100).toFixed(1)}%)              ║
║                                                              ║
║  ✓ Completed:        ${String(metrics.completed).padStart(3)}                                    ║
║  ⚡ In Progress:     ${String(metrics.inProgress).padStart(3)}                                    ║
║  ✗ Failed:           ${String(metrics.failed).padStart(3)}                                    ║
║  ○ Pending:          ${String(metrics.pending).padStart(3)}                                    ║
║                                                              ║
║  Success Rate:       ${metrics.successRate.toFixed(1)}%                                  ║
║  Avg Time:           ${(metrics.averageTime / 1000).toFixed(1)}s                                   ║
║  Est. Remaining:     ${Math.ceil(metrics.estimatedTimeRemaining / 60000)}m                                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`;
  }

  /**
   * Create ASCII progress bar
   */
  private createProgressBar(
    current: number,
    total: number,
    width: number
  ): string {
    const percentage = total > 0 ? current / total : 0;
    const filled = Math.floor(percentage * width);
    const empty = width - filled;

    return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

/**
 * Create a migration dashboard instance
 */
export function createDashboard(): MigrationDashboard {
  return new MigrationDashboard();
}
