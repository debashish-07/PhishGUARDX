/**
 * Performance Monitoring and Optimization
 */

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static marks: Map<string, number> = new Map();

  static startMeasure(name: string): void {
    this.marks.set(name, performance.now());
  }

  static endMeasure(name: string, metadata?: Record<string, any>): PerformanceMetric | null {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No start mark found for: ${name}`);
      return null;
    }

    const duration = performance.now() - startTime;
    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    this.marks.delete(name);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    return metric;
  }

  static getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return [...this.metrics];
  }

  static getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  static clearMetrics(): void {
    this.metrics = [];
    this.marks.clear();
  }

  static getReport(): string {
    const groupedMetrics = new Map<string, number[]>();

    this.metrics.forEach(metric => {
      if (!groupedMetrics.has(metric.name)) {
        groupedMetrics.set(metric.name, []);
      }
      groupedMetrics.get(metric.name)!.push(metric.duration);
    });

    let report = 'Performance Report\n==================\n\n';

    groupedMetrics.forEach((durations, name) => {
      const avg = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const min = Math.min(...durations);
      const max = Math.max(...durations);

      report += `${name}:\n`;
      report += `  Count: ${durations.length}\n`;
      report += `  Average: ${avg.toFixed(2)}ms\n`;
      report += `  Min: ${min.toFixed(2)}ms\n`;
      report += `  Max: ${max.toFixed(2)}ms\n\n`;
    });

    return report;
  }
}

// Decorator for automatic performance measurement
export function measurePerformance(name?: string) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;
    const measureName = name || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      PerformanceMonitor.startMeasure(measureName);
      try {
        const result = await original.apply(this, args);
        PerformanceMonitor.endMeasure(measureName);
        return result;
      } catch (error) {
        PerformanceMonitor.endMeasure(measureName, { error: true });
        throw error;
      }
    };

    return descriptor;
  };
}
