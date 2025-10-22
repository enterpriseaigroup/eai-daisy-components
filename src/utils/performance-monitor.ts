/**
 * Performance Monitor
 *
 * Monitors migration pipeline performance to ensure 30-minute per component goal.
 *
 * @fileoverview Performance monitoring and optimization
 * @version 1.0.0
 */

import { getGlobalLogger } from './logging';

export interface PerformanceMetrics {
  readonly componentName: string;
  readonly startTime: number;
  readonly endTime: number;
  readonly duration: number;
  readonly memoryUsage: number;
  readonly cpuUsage?: number;
}

export class PerformanceMonitor {
  private readonly logger = getGlobalLogger('PerformanceMonitor');
  private metrics: PerformanceMetrics[] = [];
  private readonly targetDuration = 1800000;

  public startMonitoring(_componentName: string): number {
    return Date.now();
  }

  public endMonitoring(componentName: string, startTime: number): PerformanceMetrics {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const memoryUsage = process.memoryUsage().heapUsed;

    const metrics: PerformanceMetrics = {
      componentName,
      startTime,
      endTime,
      duration,
      memoryUsage,
    };

    this.metrics.push(metrics);

    if (duration > this.targetDuration) {
      this.logger.warn(`Component exceeded target duration: ${componentName}`, {
        duration,
        target: this.targetDuration,
      });
    }

    return metrics;
  }

  public getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  public getAverageDuration(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / this.metrics.length;
  }
}

export function createPerformanceMonitor(): PerformanceMonitor {
  return new PerformanceMonitor();
}
