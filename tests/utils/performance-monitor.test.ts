/**
 * Performance Monitor Tests
 */

import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  PerformanceMonitor,
  createPerformanceMonitor,
} from '@/utils/performance-monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('startMonitoring', () => {
    it('should return start timestamp', () => {
      const start = monitor.startMonitoring('test-operation');
      expect(start).toBeGreaterThan(0);
    });

    it('should handle multiple concurrent operations', () => {
      const start1 = monitor.startMonitoring('op1');
      const start2 = monitor.startMonitoring('op2');
      expect(start1).toBeLessThanOrEqual(start2);
    });
  });

  describe('endMonitoring', () => {
    it('should calculate duration', () => {
      const start = monitor.startMonitoring('test');
      const metrics = monitor.endMonitoring('test', start);

      expect(metrics.duration).toBeGreaterThanOrEqual(0);
      expect(metrics.componentName).toBe('test');
    });

    it('should capture memory usage', () => {
      const start = monitor.startMonitoring('test');
      const metrics = monitor.endMonitoring('test', start);

      expect(metrics.memoryUsage).toBeGreaterThan(0);
    });

    it('should warn on long operations', () => {
      const start = Date.now() - 2000000; // 33+ minutes ago
      const metrics = monitor.endMonitoring('slow-operation', start);
      expect(metrics.duration).toBeGreaterThan(1800000);
    });
  });

  describe('getMetrics', () => {
    it('should return all collected metrics', () => {
      const start = monitor.startMonitoring('op1');
      monitor.endMonitoring('op1', start);

      const metrics = monitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].componentName).toBe('op1');
    });

    it('should accumulate metrics over time', () => {
      monitor.endMonitoring('op1', monitor.startMonitoring('op1'));
      monitor.endMonitoring('op2', monitor.startMonitoring('op2'));

      expect(monitor.getMetrics()).toHaveLength(2);
    });
  });

  describe('getAverageDuration', () => {
    it('should return 0 for no metrics', () => {
      expect(monitor.getAverageDuration()).toBe(0);
    });

    it('should calculate average duration', () => {
      const start1 = Date.now() - 100;
      const start2 = Date.now() - 200;

      monitor.endMonitoring('op1', start1);
      monitor.endMonitoring('op2', start2);

      const avg = monitor.getAverageDuration();
      expect(avg).toBeGreaterThan(0);
    });
  });
});

describe('Utility Functions', () => {
  it('should create monitor via factory', () => {
    const monitor = createPerformanceMonitor();
    expect(monitor).toBeInstanceOf(PerformanceMonitor);
  });
});
