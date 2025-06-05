// H3X Performance Monitoring System
// Real-time performance tracking and metrics collection

import { H3XMetrics, H3XSystemStatus, MemoryInfo } from '../types/h3x';

export interface PerformanceMetrics {
  fps: number;
  memory: MemoryInfo;
  renderTime: number;
  apiLatency: number;
  websocketLatency: number;
  systemLoad: number;
  timestamp: number;
}

export interface PerformanceThresholds {
  minFps: number;
  maxMemoryUsage: number;
  maxRenderTime: number;
  maxApiLatency: number;
  maxWebSocketLatency: number;
}

export class H3XPerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private startTime: number;
  private frameCount: number = 0;
  private lastFrameTime: number = 0;
  private isMonitoring: boolean = false;
  private monitoringInterval?: number;
  private callbacks: Map<string, (metrics: PerformanceMetrics) => void> = new Map();

  constructor(thresholds: Partial<PerformanceThresholds> = {}) {
    this.thresholds = {
      minFps: 30,
      maxMemoryUsage: 100 * 1024 * 1024, // 100MB
      maxRenderTime: 16.67, // 60fps target
      maxApiLatency: 1000, // 1 second
      maxWebSocketLatency: 100, // 100ms
      ...thresholds,
    };
    this.startTime = performance.now();
  }

  startMonitoring(interval: number = 1000): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = window.setInterval(() => {
      this.collectMetrics();
    }, interval);

    console.log('[H3X-Performance] Monitoring started');
  }

  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }

    console.log('[H3X-Performance] Monitoring stopped');
  }

  private collectMetrics(): void {
    const now = performance.now();
    const metrics: PerformanceMetrics = {
      fps: this.calculateFPS(),
      memory: this.getMemoryUsage(),
      renderTime: this.getRenderTime(),
      apiLatency: this.getAverageLatency('api'),
      websocketLatency: this.getAverageLatency('websocket'),
      systemLoad: this.getSystemLoad(),
      timestamp: now,
    };

    this.metrics.push(metrics);

    // Keep only last 100 metrics (prevent memory leak)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }

    // Notify callbacks
    this.callbacks.forEach((callback) => callback(metrics));

    // Check thresholds and warn if needed
    this.checkThresholds(metrics);
  }

  private calculateFPS(): number {
    const now = performance.now();
    const deltaTime = now - this.lastFrameTime;
    this.lastFrameTime = now;
    this.frameCount++;

    if (deltaTime === 0) return 60; // Default if no time difference
    return Math.round(1000 / deltaTime);
  }

  private getMemoryUsage(): MemoryInfo {
    if ('memory' in performance) {
      return (performance as any).memory;
    }

    // Fallback for browsers without memory API
    return {
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
    } as MemoryInfo;
  }

  private getRenderTime(): number {
    // This would be set by the renderer
    return this.getAverageMetric('renderTime', 10) || 0;
  }

  private getSystemLoad(): number {
    // Simple system load calculation based on FPS and memory
    const currentMetrics = this.metrics[this.metrics.length - 1];
    if (!currentMetrics) return 0;

    const fpsLoad = Math.max(
      0,
      (this.thresholds.minFps - currentMetrics.fps) / this.thresholds.minFps,
    );
    const memoryLoad = currentMetrics.memory.usedJSHeapSize / this.thresholds.maxMemoryUsage;

    return Math.min(1, Math.max(fpsLoad, memoryLoad));
  }

  private getAverageLatency(type: 'api' | 'websocket'): number {
    // This would be populated by API/WebSocket calls
    return this.getAverageMetric(`${type}Latency`, 5) || 0;
  }

  private getAverageMetric(metricName: keyof PerformanceMetrics, samples: number): number {
    const recentMetrics = this.metrics.slice(-samples);
    if (recentMetrics.length === 0) return 0;

    const sum = recentMetrics.reduce((acc, metric) => {
      const value = metric[metricName];
      return acc + (typeof value === 'number' ? value : 0);
    }, 0);

    return sum / recentMetrics.length;
  }

  private checkThresholds(metrics: PerformanceMetrics): void {
    const warnings: string[] = [];

    if (metrics.fps < this.thresholds.minFps) {
      warnings.push(`Low FPS: ${metrics.fps} (min: ${this.thresholds.minFps})`);
    }

    if (metrics.memory.usedJSHeapSize > this.thresholds.maxMemoryUsage) {
      warnings.push(
        `High memory usage: ${Math.round(metrics.memory.usedJSHeapSize / 1024 / 1024)}MB`,
      );
    }

    if (metrics.renderTime > this.thresholds.maxRenderTime) {
      warnings.push(`Slow render time: ${metrics.renderTime}ms`);
    }

    if (metrics.apiLatency > this.thresholds.maxApiLatency) {
      warnings.push(`High API latency: ${metrics.apiLatency}ms`);
    }

    if (metrics.websocketLatency > this.thresholds.maxWebSocketLatency) {
      warnings.push(`High WebSocket latency: ${metrics.websocketLatency}ms`);
    }

    if (warnings.length > 0) {
      console.warn('[H3X-Performance] Performance warnings:', warnings);
    }
  }

  // Public API methods
  onMetricsUpdate(callback: (metrics: PerformanceMetrics) => void): string {
    const id = Math.random().toString(36).substr(2, 9);
    this.callbacks.set(id, callback);
    return id;
  }

  removeCallback(id: string): void {
    this.callbacks.delete(id);
  }

  recordLatency(type: 'api' | 'websocket', latency: number): void {
    // Store latency for averaging
    const key = `${type}Latency`;
    if (!this.metrics.length) return;

    const lastMetrics = this.metrics[this.metrics.length - 1];
    (lastMetrics as any)[key] = latency;
  }
  recordRenderTime(renderTime: number): void {
    if (!this.metrics.length) return;

    const lastMetrics = this.metrics[this.metrics.length - 1];
    if (lastMetrics) {
      lastMetrics.renderTime = renderTime;
    }
  }

  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics[this.metrics.length - 1] || null;
  }

  getAverageMetrics(samples: number = 10): Partial<PerformanceMetrics> {
    const recentMetrics = this.metrics.slice(-samples);
    if (recentMetrics.length === 0) return {};

    return {
      fps: Math.round(this.getAverageMetric('fps', samples)),
      renderTime: this.getAverageMetric('renderTime', samples),
      apiLatency: this.getAverageMetric('apiLatency', samples),
      websocketLatency: this.getAverageMetric('websocketLatency', samples),
      systemLoad: this.getAverageMetric('systemLoad', samples),
    };
  }

  getPerformanceReport(): {
    current: PerformanceMetrics | null;
    average: Partial<PerformanceMetrics>;
    thresholds: PerformanceThresholds;
    uptime: number;
    totalFrames: number;
  } {
    return {
      current: this.getCurrentMetrics(),
      average: this.getAverageMetrics(),
      thresholds: this.thresholds,
      uptime: performance.now() - this.startTime,
      totalFrames: this.frameCount,
    };
  }

  reset(): void {
    this.metrics = [];
    this.frameCount = 0;
    this.startTime = performance.now();
    console.log('[H3X-Performance] Metrics reset');
  }
}

// Global performance monitor instance
export const performanceMonitor = new H3XPerformanceMonitor();

// Auto-start monitoring in development
if (process.env.NODE_ENV === 'development') {
  performanceMonitor.startMonitoring();
}
