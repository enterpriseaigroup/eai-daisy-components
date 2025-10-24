/**
 * Performance Profiler
 *
 * Profiles migration performance to ensure the pipeline meets the
 * 10+ components/hour goal with detailed metrics and bottleneck analysis.
 *
 * @fileoverview Performance profiling and optimization
 * @version 1.0.0
 */

import { EventEmitter } from 'events';

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

/**
 * Performance profile result
 */
export interface PerformanceProfile {
  totalDuration: number;
  componentCount: number;
  componentsPerHour: number;
  averageComponentTime: number;
  slowestComponents: Array<{
    name: string;
    duration: number;
  }>;
  bottlenecks: BottleneckAnalysis[];
  meetsGoal: boolean;
}

/**
 * Bottleneck analysis
 */
export interface BottleneckAnalysis {
  phase: string;
  totalTime: number;
  percentage: number;
  suggestions: string[];
}

/**
 * Profiling session
 */
interface ProfilingSession {
  sessionId: string;
  startTime: number;
  metrics: Map<string, PerformanceMetric>;
  componentTimes: Map<string, number>;
}

/**
 * Performance profiler
 */
export class PerformanceProfiler extends EventEmitter {
  private readonly sessions: Map<string, ProfilingSession> = new Map();
  private readonly targetComponentsPerHour: number;

  constructor(targetComponentsPerHour: number = 10) {
    super();
    this.targetComponentsPerHour = targetComponentsPerHour;
  }

  /**
   * Start profiling session
   */
  public startSession(sessionId: string): void {
    this.sessions.set(sessionId, {
      sessionId,
      startTime: Date.now(),
      metrics: new Map(),
      componentTimes: new Map(),
    });

    this.emit('session-started', { sessionId });
  }

  /**
   * End profiling session
   */
  public endSession(sessionId: string): PerformanceProfile | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const totalDuration = Date.now() - session.startTime;
    const componentCount = session.componentTimes.size;
    const componentsPerHour =
      componentCount > 0 ? (componentCount / totalDuration) * 3600000 : 0;

    const averageComponentTime =
      componentCount > 0
        ? Array.from(session.componentTimes.values()).reduce(
            (sum, time) => sum + time,
            0,
          ) / componentCount
        : 0;

    const slowestComponents = Array.from(session.componentTimes.entries())
      .map(([name, duration]) => ({ name, duration }))
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const bottlenecks = this.analyzeBottlenecks(session);
    const meetsGoal = componentsPerHour >= this.targetComponentsPerHour;

    const profile: PerformanceProfile = {
      totalDuration,
      componentCount,
      componentsPerHour,
      averageComponentTime,
      slowestComponents,
      bottlenecks,
      meetsGoal,
    };

    this.emit('session-ended', { sessionId, profile });

    return profile;
  }

  /**
   * Start measuring a metric
   */
  public startMetric(
    sessionId: string,
    metricName: string,
    metadata?: Record<string, unknown>,
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    const metric: PerformanceMetric = {
      name: metricName,
      startTime: Date.now(),
    };

    if (metadata) {
      metric.metadata = metadata;
    }

    session.metrics.set(metricName, metric);
  }

  /**
   * End measuring a metric
   */
  public endMetric(sessionId: string, metricName: string): number | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const metric = session.metrics.get(metricName);
    if (!metric || metric.endTime) {
      return null;
    }

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;

    this.emit('metric-recorded', {
      sessionId,
      metricName,
      duration: metric.duration,
    });

    return metric.duration;
  }

  /**
   * Record component migration time
   */
  public recordComponentTime(
    sessionId: string,
    componentName: string,
    duration: number,
  ): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.componentTimes.set(componentName, duration);

    this.emit('component-profiled', {
      sessionId,
      componentName,
      duration,
    });
  }

  /**
   * Analyze bottlenecks
   */
  private analyzeBottlenecks(session: ProfilingSession): BottleneckAnalysis[] {
    const phaseMetrics = new Map<string, number>();
    const totalTime = Date.now() - session.startTime;

    // Aggregate metrics by phase
    for (const metric of session.metrics.values()) {
      if (metric.duration) {
        const phase = this.extractPhase(metric.name);
        const currentTime = phaseMetrics.get(phase) || 0;
        phaseMetrics.set(phase, currentTime + metric.duration);
      }
    }

    // Create bottleneck analyses
    const bottlenecks: BottleneckAnalysis[] = [];

    for (const [phase, time] of phaseMetrics.entries()) {
      const percentage = (time / totalTime) * 100;

      if (percentage > 20) {
        // Consider a bottleneck if >20% of total time
        bottlenecks.push({
          phase,
          totalTime: time,
          percentage,
          suggestions: this.generateSuggestions(phase, percentage),
        });
      }
    }

    return bottlenecks.sort((a, b) => b.percentage - a.percentage);
  }

  /**
   * Extract phase from metric name
   */
  private extractPhase(metricName: string): string {
    // Extract phase from metric names like "discovery-scan", "parse-component", etc.
    const match = metricName.match(/^([^-]+)/);
    return match && match[1] ? match[1] : 'other';
  }

  /**
   * Generate optimization suggestions for bottleneck
   */
  private generateSuggestions(phase: string, percentage: number): string[] {
    const suggestions: string[] = [];

    switch (phase) {
      case 'discovery':
        suggestions.push('Implement parallel directory scanning');
        suggestions.push('Add file system caching for repeated scans');
        suggestions.push('Optimize glob patterns to exclude unnecessary paths');
        break;

      case 'parse':
      case 'analysis':
        suggestions.push('Use worker threads for parallel AST parsing');
        suggestions.push('Implement incremental parsing with caching');
        suggestions.push('Optimize TypeScript compiler options');
        break;

      case 'transform':
        suggestions.push('Batch transform operations');
        suggestions.push('Parallelize independent transformations');
        suggestions.push('Cache transformation results');
        break;

      case 'validation':
        suggestions.push('Run validations in parallel');
        suggestions.push('Skip redundant validation checks');
        suggestions.push('Implement validation result caching');
        break;

      case 'generation':
        suggestions.push('Stream file writes instead of buffering');
        suggestions.push('Batch file system operations');
        suggestions.push('Parallelize independent file generations');
        break;

      default:
        suggestions.push(
          `Review ${phase} phase for optimization opportunities`,
        );
    }

    if (percentage > 40) {
      suggestions.push(
        `⚠️ ${phase} phase is a critical bottleneck (${percentage.toFixed(1)}% of total time)`,
      );
    }

    return suggestions;
  }

  /**
   * Generate performance report
   */
  public generateReport(profile: PerformanceProfile): string {
    const hoursToMeet = this.calculateHoursToMeetGoal(profile);

    return `# Performance Profile Report

## Summary

- **Total Duration**: ${this.formatDuration(profile.totalDuration)}
- **Components Processed**: ${profile.componentCount}
- **Throughput**: ${profile.componentsPerHour.toFixed(2)} components/hour
- **Target**: ${this.targetComponentsPerHour} components/hour
- **Status**: ${profile.meetsGoal ? '✅ MEETS GOAL' : '❌ BELOW GOAL'}
- **Average Component Time**: ${this.formatDuration(profile.averageComponentTime)}

${!profile.meetsGoal ? `\n⚠️ **Action Required**: Need ${hoursToMeet.toFixed(1)}x speedup to meet goal\n` : ''}

## Slowest Components

| Rank | Component | Duration |
|------|-----------|----------|
${profile.slowestComponents
  .map(
    (c, i) => `| ${i + 1} | ${c.name} | ${this.formatDuration(c.duration)} |`,
  )
  .join('\n')}

## Bottleneck Analysis

${profile.bottlenecks
  .map(
    b => `### ${b.phase.toUpperCase()} (${b.percentage.toFixed(1)}% of total time)

**Time Spent**: ${this.formatDuration(b.totalTime)}

**Optimization Suggestions**:
${b.suggestions.map(s => `- ${s}`).join('\n')}
`,
  )
  .join('\n')}

## Recommendations

${this.generateRecommendations(profile)
  .map(r => `- ${r}`)
  .join('\n')}

---

*Generated: ${new Date().toISOString()}*
`;
  }

  /**
   * Calculate hours needed to meet goal
   */
  private calculateHoursToMeetGoal(profile: PerformanceProfile): number {
    if (profile.componentsPerHour === 0) {
      return Infinity;
    }
    return this.targetComponentsPerHour / profile.componentsPerHour;
  }

  /**
   * Generate overall recommendations
   */
  private generateRecommendations(profile: PerformanceProfile): string[] {
    const recommendations: string[] = [];

    if (!profile.meetsGoal) {
      recommendations.push(
        '🎯 Focus on optimizing the highest percentage bottlenecks first',
      );
      recommendations.push(
        '⚡ Implement parallel processing for independent operations',
      );
      recommendations.push(
        '💾 Add caching for expensive repeated computations',
      );
    }

    if (profile.averageComponentTime > 360000) {
      // 6 minutes
      recommendations.push(
        '🔍 Investigate components taking >6 minutes - may indicate issues',
      );
    }

    if (profile.bottlenecks.length === 0) {
      recommendations.push(
        '✅ No significant bottlenecks detected - performance is well-balanced',
      );
    } else if (
      profile.bottlenecks[0] &&
      profile.bottlenecks[0].percentage > 50
    ) {
      recommendations.push(
        `⚠️ ${profile.bottlenecks[0].phase} phase dominates execution - critical optimization target`,
      );
    }

    recommendations.push(
      '📊 Continue monitoring performance metrics over time',
    );
    recommendations.push(
      '🔬 Profile individual component migrations for deeper insights',
    );

    return recommendations;
  }

  /**
   * Format duration in human-readable format
   */
  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    }

    const seconds = ms / 1000;
    if (seconds < 60) {
      return `${seconds.toFixed(2)}s`;
    }

    const minutes = seconds / 60;
    if (minutes < 60) {
      return `${minutes.toFixed(2)}m`;
    }

    const hours = minutes / 60;
    return `${hours.toFixed(2)}h`;
  }

  /**
   * Get session metrics
   */
  public getSessionMetrics(
    sessionId: string,
  ): Map<string, PerformanceMetric> | null {
    const session = this.sessions.get(sessionId);
    return session ? session.metrics : null;
  }
}

/**
 * Create performance profiler
 */
export function createProfiler(
  targetComponentsPerHour: number = 10,
): PerformanceProfiler {
  return new PerformanceProfiler(targetComponentsPerHour);
}
