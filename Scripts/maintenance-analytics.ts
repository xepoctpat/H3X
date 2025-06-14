#!/usr/bin/env node
/**
 * H3X Maintenance Analytics Engine
 * 
 * Advanced analytics and reporting for the Remote Maintenance Agent
 * Provides insights, trends, and predictive maintenance capabilities
 */

import { promises as fs } from 'fs';
import * as path from 'path';

interface MaintenanceMetrics {
  timestamp: number;
  operation: string;
  success: boolean;
  duration: number;
  details: Record<string, any>;
}

interface AnalyticsReport {
  period: string;
  totalOperations: number;
  successRate: number;
  averageDuration: number;
  operationBreakdown: Record<string, number>;
  trends: {
    conflictsResolved: number;
    prsAutoMerged: number;
    branchesCleaned: number;
    securityPatchesApplied: number;
    dependenciesUpdated: number;
  };
  recommendations: string[];
  healthScore: number;
}

interface PredictiveInsights {
  riskFactors: Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    probability: number;
    recommendation: string;
  }>;
  maintenanceSchedule: Array<{
    task: string;
    recommendedTime: string;
    priority: number;
  }>;
  resourceUsage: {
    apiCallsPerHour: number;
    storageUsed: string;
    processingTime: number;
  };
}

export class MaintenanceAnalytics {
  private metricsFile: string;
  private reportsDir: string;

  constructor() {
    this.metricsFile = path.join(process.cwd(), 'logs/maintenance-metrics.json');
    this.reportsDir = path.join(process.cwd(), 'logs/reports');
  }

  // Record maintenance operation metrics
  async recordMetric(operation: string, success: boolean, duration: number, details: Record<string, any> = {}): Promise<void> {
    const metric: MaintenanceMetrics = {
      timestamp: Date.now(),
      operation,
      success,
      duration,
      details
    };

    try {
      await fs.mkdir(path.dirname(this.metricsFile), { recursive: true });
      
      let metrics: MaintenanceMetrics[] = [];
      try {
        const existing = await fs.readFile(this.metricsFile, 'utf-8');
        metrics = JSON.parse(existing);
      } catch {
        // File doesn't exist yet
      }

      metrics.push(metric);
      
      // Keep only last 10,000 metrics to prevent file from growing too large
      if (metrics.length > 10000) {
        metrics = metrics.slice(-10000);
      }

      await fs.writeFile(this.metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  // Generate comprehensive analytics report
  async generateReport(periodDays: number = 7): Promise<AnalyticsReport> {
    try {
      const metrics = await this.loadMetrics();
      const cutoffTime = Date.now() - (periodDays * 24 * 60 * 60 * 1000);
      const periodMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

      const totalOperations = periodMetrics.length;
      const successfulOps = periodMetrics.filter(m => m.success).length;
      const successRate = totalOperations > 0 ? (successfulOps / totalOperations) * 100 : 0;
      
      const totalDuration = periodMetrics.reduce((sum, m) => sum + m.duration, 0);
      const averageDuration = totalOperations > 0 ? totalDuration / totalOperations : 0;

      // Operation breakdown
      const operationBreakdown: Record<string, number> = {};
      periodMetrics.forEach(m => {
        operationBreakdown[m.operation] = (operationBreakdown[m.operation] || 0) + 1;
      });

      // Trends analysis
      const trends = {
        conflictsResolved: this.countOperations(periodMetrics, 'conflict-resolution'),
        prsAutoMerged: this.countOperations(periodMetrics, 'pr-auto-merge'),
        branchesCleaned: this.countOperations(periodMetrics, 'branch-cleanup'),
        securityPatchesApplied: this.countOperations(periodMetrics, 'security-patch'),
        dependenciesUpdated: this.countOperations(periodMetrics, 'dependency-update')
      };

      // Generate recommendations
      const recommendations = this.generateRecommendations(periodMetrics, successRate);

      // Calculate health score
      const healthScore = this.calculateHealthScore(successRate, trends, periodMetrics);

      const report: AnalyticsReport = {
        period: `${periodDays} days`,
        totalOperations,
        successRate: Math.round(successRate * 100) / 100,
        averageDuration: Math.round(averageDuration * 100) / 100,
        operationBreakdown,
        trends,
        recommendations,
        healthScore
      };

      // Save report
      await this.saveReport(report);
      
      return report;
    } catch (error) {
      console.error('Failed to generate analytics report:', error);
      throw error;
    }
  }

  // Generate predictive insights
  async generatePredictiveInsights(): Promise<PredictiveInsights> {
    const metrics = await this.loadMetrics();
    const recentMetrics = metrics.slice(-1000); // Last 1000 operations

    // Analyze risk factors
    const riskFactors = this.analyzeRiskFactors(recentMetrics);
    
    // Generate maintenance schedule
    const maintenanceSchedule = this.generateMaintenanceSchedule(recentMetrics);
    
    // Calculate resource usage
    const resourceUsage = this.calculateResourceUsage(recentMetrics);

    return {
      riskFactors,
      maintenanceSchedule,
      resourceUsage
    };
  }

  // Performance trend analysis
  async analyzePerformanceTrends(days: number = 30): Promise<{
    dailyStats: Array<{
      date: string;
      operations: number;
      successRate: number;
      avgDuration: number;
    }>;
    weeklyTrend: 'improving' | 'stable' | 'declining';
    bottlenecks: string[];
  }> {
    const metrics = await this.loadMetrics();
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    const periodMetrics = metrics.filter(m => m.timestamp >= cutoffTime);

    // Group by day
    const dailyGroups: Record<string, MaintenanceMetrics[]> = {};
    periodMetrics.forEach(metric => {
      const date = new Date(metric.timestamp).toISOString().split('T')[0];
      if (!dailyGroups[date]) dailyGroups[date] = [];
      dailyGroups[date].push(metric);
    });

    // Calculate daily stats
    const dailyStats = Object.entries(dailyGroups).map(([date, dayMetrics]) => {
      const operations = dayMetrics.length;
      const successful = dayMetrics.filter(m => m.success).length;
      const successRate = operations > 0 ? (successful / operations) * 100 : 0;
      const totalDuration = dayMetrics.reduce((sum, m) => sum + m.duration, 0);
      const avgDuration = operations > 0 ? totalDuration / operations : 0;

      return {
        date,
        operations,
        successRate: Math.round(successRate * 100) / 100,
        avgDuration: Math.round(avgDuration * 100) / 100
      };
    }).sort((a, b) => a.date.localeCompare(b.date));

    // Determine weekly trend
    const weeklyTrend = this.determineWeeklyTrend(dailyStats);
    
    // Identify bottlenecks
    const bottlenecks = this.identifyBottlenecks(periodMetrics);

    return {
      dailyStats,
      weeklyTrend,
      bottlenecks
    };
  }

  // Generate maintenance dashboard data
  async generateDashboardData(): Promise<{
    summary: {
      totalOperations: number;
      successRate: number;
      lastRun: string;
      nextScheduled: string;
    };
    recentActivity: Array<{
      timestamp: string;
      operation: string;
      status: 'success' | 'failure';
      duration: number;
    }>;
    systemHealth: {
      score: number;
      status: 'excellent' | 'good' | 'fair' | 'poor';
      issues: string[];
    };
    upcomingTasks: Array<{
      task: string;
      scheduledTime: string;
      priority: 'low' | 'medium' | 'high';
    }>;
  }> {
    const metrics = await this.loadMetrics();
    const recentMetrics = metrics.slice(-100);
    
    // Summary stats
    const totalOperations = metrics.length;
    const recentSuccessful = recentMetrics.filter(m => m.success).length;
    const successRate = recentMetrics.length > 0 ? (recentSuccessful / recentMetrics.length) * 100 : 0;
    const lastRun = recentMetrics.length > 0 ? new Date(recentMetrics[recentMetrics.length - 1].timestamp).toISOString() : 'Never';
    const nextScheduled = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // Next 4 hours

    // Recent activity
    const recentActivity = recentMetrics.slice(-10).map(metric => ({
      timestamp: new Date(metric.timestamp).toISOString(),
      operation: metric.operation,
      status: metric.success ? 'success' as const : 'failure' as const,
      duration: metric.duration
    }));

    // System health
    const healthScore = this.calculateHealthScore(successRate, {
      conflictsResolved: 0,
      prsAutoMerged: 0,
      branchesCleaned: 0,
      securityPatchesApplied: 0,
      dependenciesUpdated: 0
    }, recentMetrics);

    let healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
    if (healthScore >= 90) healthStatus = 'excellent';
    else if (healthScore >= 75) healthStatus = 'good';
    else if (healthScore >= 60) healthStatus = 'fair';
    else healthStatus = 'poor';

    const issues = this.identifySystemIssues(recentMetrics);

    // Upcoming tasks (mock data - would be based on actual scheduling)
    const upcomingTasks = [
      { task: 'Dependency Check', scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), priority: 'medium' as const },
      { task: 'Security Scan', scheduledTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), priority: 'high' as const },
      { task: 'Branch Cleanup', scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), priority: 'low' as const }
    ];

    return {
      summary: {
        totalOperations,
        successRate: Math.round(successRate * 100) / 100,
        lastRun,
        nextScheduled
      },
      recentActivity,
      systemHealth: {
        score: healthScore,
        status: healthStatus,
        issues
      },
      upcomingTasks
    };
  }

  // Private helper methods
  private async loadMetrics(): Promise<MaintenanceMetrics[]> {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  private countOperations(metrics: MaintenanceMetrics[], operation: string): number {
    return metrics.filter(m => m.operation === operation && m.success).length;
  }

  private generateRecommendations(metrics: MaintenanceMetrics[], successRate: number): string[] {
    const recommendations: string[] = [];

    if (successRate < 80) {
      recommendations.push('Success rate is below 80% - review failed operations and improve error handling');
    }

    const failedOps = metrics.filter(m => !m.success);
    if (failedOps.length > 0) {
      const commonFailures = this.getMostCommonFailures(failedOps);
      recommendations.push(`Most common failures: ${commonFailures.join(', ')} - consider targeted improvements`);
    }

    const longRunningOps = metrics.filter(m => m.duration > 30000); // > 30 seconds
    if (longRunningOps.length > metrics.length * 0.1) {
      recommendations.push('More than 10% of operations are taking longer than 30 seconds - optimize performance');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is performing well - continue current maintenance practices');
    }

    return recommendations;
  }

  private calculateHealthScore(successRate: number, trends: any, metrics: MaintenanceMetrics[]): number {
    let score = successRate; // Base score from success rate

    // Bonus points for proactive maintenance
    if (trends.securityPatchesApplied > 0) score += 5;
    if (trends.dependenciesUpdated > 0) score += 3;
    if (trends.branchesCleaned > 0) score += 2;

    // Penalty for failures
    const recentFailures = metrics.filter(m => !m.success && Date.now() - m.timestamp < 24 * 60 * 60 * 1000);
    score -= recentFailures.length * 2;

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private async saveReport(report: AnalyticsReport): Promise<void> {
    try {
      await fs.mkdir(this.reportsDir, { recursive: true });
      const filename = `maintenance-report-${new Date().toISOString().split('T')[0]}.json`;
      const filepath = path.join(this.reportsDir, filename);
      await fs.writeFile(filepath, JSON.stringify(report, null, 2));
    } catch (error) {
      console.error('Failed to save report:', error);
    }
  }

  private analyzeRiskFactors(metrics: MaintenanceMetrics[]): Array<{
    factor: string;
    severity: 'low' | 'medium' | 'high';
    probability: number;
    recommendation: string;
  }> {
    const riskFactors = [];

    // High failure rate risk
    const failureRate = metrics.filter(m => !m.success).length / metrics.length;
    if (failureRate > 0.2) {
      riskFactors.push({
        factor: 'High Failure Rate',
        severity: 'high' as const,
        probability: failureRate,
        recommendation: 'Review and improve error handling mechanisms'
      });
    }

    // Performance degradation risk
    const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
    if (avgDuration > 20000) {
      riskFactors.push({
        factor: 'Performance Degradation',
        severity: 'medium' as const,
        probability: 0.7,
        recommendation: 'Optimize slow operations and consider resource scaling'
      });
    }

    return riskFactors;
  }

  private generateMaintenanceSchedule(metrics: MaintenanceMetrics[]): Array<{
    task: string;
    recommendedTime: string;
    priority: number;
  }> {
    // This would be more sophisticated in a real implementation
    return [
      {
        task: 'System Health Check',
        recommendedTime: 'Every 4 hours',
        priority: 1
      },
      {
        task: 'Security Vulnerability Scan',
        recommendedTime: 'Every 12 hours',
        priority: 2
      },
      {
        task: 'Dependency Updates',
        recommendedTime: 'Daily',
        priority: 3
      }
    ];
  }

  private calculateResourceUsage(metrics: MaintenanceMetrics[]): {
    apiCallsPerHour: number;
    storageUsed: string;
    processingTime: number;
  } {
    const hourlyMetrics = metrics.filter(m => Date.now() - m.timestamp < 60 * 60 * 1000);
    const apiCallsPerHour = hourlyMetrics.length * 5; // Estimate 5 API calls per operation
    const totalProcessingTime = metrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      apiCallsPerHour,
      storageUsed: '2.5 MB', // Estimated
      processingTime: totalProcessingTime
    };
  }

  private getMostCommonFailures(failedOps: MaintenanceMetrics[]): string[] {
    const failures: Record<string, number> = {};
    failedOps.forEach(op => {
      failures[op.operation] = (failures[op.operation] || 0) + 1;
    });

    return Object.entries(failures)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([op]) => op);
  }

  private determineWeeklyTrend(dailyStats: any[]): 'improving' | 'stable' | 'declining' {
    if (dailyStats.length < 7) return 'stable';

    const firstWeek = dailyStats.slice(0, 7);
    const lastWeek = dailyStats.slice(-7);

    const firstWeekAvg = firstWeek.reduce((sum, day) => sum + day.successRate, 0) / firstWeek.length;
    const lastWeekAvg = lastWeek.reduce((sum, day) => sum + day.successRate, 0) / lastWeek.length;

    const difference = lastWeekAvg - firstWeekAvg;

    if (difference > 5) return 'improving';
    if (difference < -5) return 'declining';
    return 'stable';
  }

  private identifyBottlenecks(metrics: MaintenanceMetrics[]): string[] {
    const bottlenecks: string[] = [];
    
    // Find operations that consistently take longer
    const operationDurations: Record<string, number[]> = {};
    metrics.forEach(m => {
      if (!operationDurations[m.operation]) operationDurations[m.operation] = [];
      operationDurations[m.operation].push(m.duration);
    });

    Object.entries(operationDurations).forEach(([operation, durations]) => {
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      if (avgDuration > 15000) { // > 15 seconds
        bottlenecks.push(`${operation} (avg: ${Math.round(avgDuration/1000)}s)`);
      }
    });

    return bottlenecks;
  }

  private identifySystemIssues(metrics: MaintenanceMetrics[]): string[] {
    const issues: string[] = [];
    
    const recentFailures = metrics.filter(m => !m.success);
    if (recentFailures.length > metrics.length * 0.2) {
      issues.push('High failure rate detected');
    }

    const longRunning = metrics.filter(m => m.duration > 30000);
    if (longRunning.length > 0) {
      issues.push('Some operations are running slowly');
    }

    return issues;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const analytics = new MaintenanceAnalytics();
  const command = process.argv[2] || 'report';

  switch (command) {
    case 'report':
      analytics.generateReport().then(report => {
        console.log('📊 Maintenance Analytics Report');
        console.log('================================');
        console.log(JSON.stringify(report, null, 2));
      });
      break;
    case 'insights':
      analytics.generatePredictiveInsights().then(insights => {
        console.log('🔮 Predictive Insights');
        console.log('======================');
        console.log(JSON.stringify(insights, null, 2));
      });
      break;
    case 'dashboard':
      analytics.generateDashboardData().then(data => {
        console.log('📈 Dashboard Data');
        console.log('=================');
        console.log(JSON.stringify(data, null, 2));
      });
      break;
    default:
      console.log('Usage: node maintenance-analytics.js [report|insights|dashboard]');
  }
}
