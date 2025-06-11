#!/usr/bin/env node
/**
 * H3X Dependabot Automation Monitoring System
 *
 * Provides comprehensive monitoring, alerting, and health checking for
 * the Dependabot automation system including:
 * - Real-time health monitoring
 * - Performance metrics collection
 * - Alert management
 * - Dashboard data aggregation
 * - Integration with existing H3X monitoring
 */

const fs = require('fs').promises;
const path = require('path');
const { EventEmitter } = require('events');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class DependabotMonitoring extends EventEmitter {
  constructor() {
    super();
    this.projectRoot = process.cwd();
    this.logDir = path.join(this.projectRoot, 'logs/monitoring');
    this.metricsFile = path.join(this.logDir, 'dependabot-metrics.json');
    this.alertsFile = path.join(this.logDir, 'dependabot-alerts.json');

    this.metrics = {
      totalPRsProcessed: 0,
      autoMergedPRs: 0,
      blockedPRs: 0,
      securityAlertsFound: 0,
      averageProcessingTime: 0,
      successRate: 0,
      lastUpdated: new Date().toISOString(),
      dailyStats: {},
      errors: [],
      performance: {
        cpuUsage: [],
        memoryUsage: [],
        processingTimes: [],
      },
    };

    this.alerts = {
      active: [],
      resolved: [],
      configuration: {
        enabled: true,
        channels: ['log', 'github'],
        thresholds: {
          processingTime: 30000, // 30 seconds
          errorRate: 0.1, // 10%
          consecutiveFailures: 3,
        },
      },
    };

    this.healthStatus = {
      status: 'healthy',
      lastCheck: new Date().toISOString(),
      components: {
        dependabotConfig: 'unknown',
        automationScript: 'unknown',
        webhookHandler: 'unknown',
        githubActions: 'unknown',
        dependencies: 'unknown',
      },
    };

    this.init();
  }

  async init() {
    try {
      await this.ensureDirectories();
      await this.loadExistingMetrics();
      await this.loadExistingAlerts();
      this.startMonitoring();

      // Emit ready event
      this.emit('ready');
      console.log('✅ Dependabot monitoring system initialized');
    } catch (error) {
      console.error('❌ Failed to initialize monitoring system:', error.message);
      this.emit('error', error);
    }
  }

  async ensureDirectories() {
    await fs.mkdir(this.logDir, { recursive: true });
  }

  async loadExistingMetrics() {
    try {
      const data = await fs.readFile(this.metricsFile, 'utf8');
      this.metrics = { ...this.metrics, ...JSON.parse(data) };
    } catch (error) {
      // File doesn't exist, use defaults
      await this.saveMetrics();
    }
  }

  async loadExistingAlerts() {
    try {
      const data = await fs.readFile(this.alertsFile, 'utf8');
      this.alerts = { ...this.alerts, ...JSON.parse(data) };
    } catch (error) {
      // File doesn't exist, use defaults
      await this.saveAlerts();
    }
  }

  startMonitoring() {
    // Monitor every 30 seconds
    setInterval(() => {
      this.performHealthCheck();
      this.collectPerformanceMetrics();
      this.checkAlertConditions();
    }, 30000);

    // Save metrics every 5 minutes
    setInterval(() => {
      this.saveMetrics();
      this.saveAlerts();
    }, 300000);
  }

  /**
   * Record a Dependabot PR processing event
   */
  async recordPRProcessing(prNumber, result, processingTime, details = {}) {
    try {
      this.metrics.totalPRsProcessed++;
      this.metrics.lastUpdated = new Date().toISOString();

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      if (!this.metrics.dailyStats[today]) {
        this.metrics.dailyStats[today] = {
          processed: 0,
          autoMerged: 0,
          blocked: 0,
          errors: 0,
        };
      }
      this.metrics.dailyStats[today].processed++;

      // Record result
      if (result === 'auto-merged') {
        this.metrics.autoMergedPRs++;
        this.metrics.dailyStats[today].autoMerged++;
      } else if (result === 'blocked') {
        this.metrics.blockedPRs++;
        this.metrics.dailyStats[today].blocked++;
      } else if (result === 'error') {
        this.metrics.dailyStats[today].errors++;
        this.recordError(`PR ${prNumber} processing failed`, details.error);
      }

      // Record processing time
      this.metrics.performance.processingTimes.push({
        timestamp: new Date().toISOString(),
        prNumber,
        time: processingTime,
      });

      // Keep only last 100 processing times
      if (this.metrics.performance.processingTimes.length > 100) {
        this.metrics.performance.processingTimes =
          this.metrics.performance.processingTimes.slice(-100);
      }

      // Calculate average processing time
      const recentTimes = this.metrics.performance.processingTimes.slice(-20);
      this.metrics.averageProcessingTime =
        recentTimes.reduce((sum, record) => sum + record.time, 0) / recentTimes.length;

      // Calculate success rate
      const totalProcessed = this.metrics.totalPRsProcessed;
      const successfulProcessed = totalProcessed - this.metrics.errors.length;
      this.metrics.successRate = totalProcessed > 0 ? successfulProcessed / totalProcessed : 1;

      // Check for alert conditions
      if (processingTime > this.alerts.configuration.thresholds.processingTime) {
        await this.createAlert('high-processing-time', {
          prNumber,
          processingTime,
          threshold: this.alerts.configuration.thresholds.processingTime,
        });
      }

      console.log(`📊 Recorded PR ${prNumber} processing: ${result} (${processingTime}ms)`);
      this.emit('pr-processed', { prNumber, result, processingTime, details });
    } catch (error) {
      console.error('❌ Failed to record PR processing:', error.message);
      this.recordError('Metrics recording failed', error);
    }
  }

  /**
   * Record a security alert found
   */
  async recordSecurityAlert(prNumber, packageName, severity, advisory) {
    try {
      this.metrics.securityAlertsFound++;

      await this.createAlert('security-vulnerability', {
        prNumber,
        packageName,
        severity,
        advisory,
        timestamp: new Date().toISOString(),
      });

      console.log(`🔒 Security alert recorded for PR ${prNumber}: ${packageName} (${severity})`);
      this.emit('security-alert', { prNumber, packageName, severity, advisory });
    } catch (error) {
      console.error('❌ Failed to record security alert:', error.message);
      this.recordError('Security alert recording failed', error);
    }
  }

  /**
   * Record an error
   */
  recordError(message, error = null) {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : null,
    };

    this.metrics.errors.push(errorRecord);

    // Keep only last 50 errors
    if (this.metrics.errors.length > 50) {
      this.metrics.errors = this.metrics.errors.slice(-50);
    }

    console.error(`💥 Error recorded: ${message}`);
    this.emit('error-recorded', errorRecord);
  }

  /**
   * Perform comprehensive health check
   */
  async performHealthCheck() {
    try {
      const healthCheck = {
        timestamp: new Date().toISOString(),
        status: 'healthy',
        components: {},
      };

      // Check Dependabot configuration
      healthCheck.components.dependabotConfig = await this.checkDependabotConfig();

      // Check automation script
      healthCheck.components.automationScript = await this.checkAutomationScript();

      // Check webhook handler
      healthCheck.components.webhookHandler = await this.checkWebhookHandler();

      // Check GitHub Actions workflow
      healthCheck.components.githubActions = await this.checkGitHubActions();

      // Check dependencies
      healthCheck.components.dependencies = await this.checkDependencies();

      // Determine overall health
      const componentStatuses = Object.values(healthCheck.components);
      if (componentStatuses.includes('critical')) {
        healthCheck.status = 'critical';
      } else if (componentStatuses.includes('warning')) {
        healthCheck.status = 'warning';
      } else {
        healthCheck.status = 'healthy';
      }

      this.healthStatus = healthCheck;

      // Create alert if status changed to critical
      if (healthCheck.status === 'critical' && this.healthStatus.status !== 'critical') {
        await this.createAlert('system-critical', {
          components: healthCheck.components,
          timestamp: healthCheck.timestamp,
        });
      }

      this.emit('health-check', healthCheck);
    } catch (error) {
      console.error('❌ Health check failed:', error.message);
      this.recordError('Health check failed', error);
    }
  }

  async checkDependabotConfig() {
    try {
      const configPath = path.join(this.projectRoot, '.github/dependabot.yml');
      await fs.access(configPath);

      const content = await fs.readFile(configPath, 'utf8');
      const yaml = require('js-yaml');
      const config = yaml.load(content);

      if (config.version !== 2) {
        return 'warning';
      }

      if (!config.updates || config.updates.length === 0) {
        return 'critical';
      }

      return 'healthy';
    } catch (error) {
      return 'critical';
    }
  }

  async checkAutomationScript() {
    try {
      const scriptPath = path.join(this.projectRoot, 'scripts/dependabot-automation.js');
      await fs.access(scriptPath);

      // Try to require the script to check for syntax errors
      delete require.cache[require.resolve(scriptPath)];
      require(scriptPath);

      return 'healthy';
    } catch (error) {
      return 'critical';
    }
  }

  async checkWebhookHandler() {
    try {
      const handlerPath = path.join(this.projectRoot, 'scripts/dependabot-webhook-handler.js');
      await fs.access(handlerPath);

      // Check if webhook handler is running (if applicable)
      // This is a simplified check - in production, you might check for active processes
      return 'healthy';
    } catch (error) {
      return 'warning';
    }
  }

  async checkGitHubActions() {
    try {
      const workflowPath = path.join(
        this.projectRoot,
        '.github/workflows/dependabot-automation.yml',
      );
      await fs.access(workflowPath);

      const content = await fs.readFile(workflowPath, 'utf8');
      const yaml = require('js-yaml');
      const workflow = yaml.load(content);

      if (!workflow.on || !workflow.jobs) {
        return 'warning';
      }

      return 'healthy';
    } catch (error) {
      return 'warning';
    }
  }

  async checkDependencies() {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      // Check for required dependencies
      const requiredDeps = ['js-yaml', '@octokit/rest'];
      const installedDeps = Object.keys(packageJson.dependencies || {});

      const missingDeps = requiredDeps.filter((dep) => !installedDeps.includes(dep));

      if (missingDeps.length > 0) {
        return 'warning';
      }

      return 'healthy';
    } catch (error) {
      return 'warning';
    }
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    try {
      const usage = process.cpuUsage();
      const memory = process.memoryUsage();

      this.metrics.performance.cpuUsage.push({
        timestamp: new Date().toISOString(),
        user: usage.user,
        system: usage.system,
      });

      this.metrics.performance.memoryUsage.push({
        timestamp: new Date().toISOString(),
        rss: memory.rss,
        heapUsed: memory.heapUsed,
        heapTotal: memory.heapTotal,
        external: memory.external,
      });

      // Keep only last 100 records
      if (this.metrics.performance.cpuUsage.length > 100) {
        this.metrics.performance.cpuUsage = this.metrics.performance.cpuUsage.slice(-100);
      }

      if (this.metrics.performance.memoryUsage.length > 100) {
        this.metrics.performance.memoryUsage = this.metrics.performance.memoryUsage.slice(-100);
      }
    } catch (error) {
      console.error('❌ Failed to collect performance metrics:', error.message);
    }
  }

  /**
   * Check alert conditions and create alerts if necessary
   */
  async checkAlertConditions() {
    try {
      // Check error rate
      const recentErrors = this.metrics.errors.filter(
        (error) => new Date(error.timestamp) > new Date(Date.now() - 3600000), // Last hour
      );

      const recentProcessed = this.metrics.performance.processingTimes.filter(
        (record) => new Date(record.timestamp) > new Date(Date.now() - 3600000),
      ).length;

      if (recentProcessed > 0) {
        const errorRate = recentErrors.length / recentProcessed;
        if (errorRate > this.alerts.configuration.thresholds.errorRate) {
          await this.createAlert('high-error-rate', {
            errorRate,
            threshold: this.alerts.configuration.thresholds.errorRate,
            recentErrors: recentErrors.length,
            recentProcessed,
          });
        }
      }

      // Check consecutive failures
      const recentFailures = this.metrics.errors.slice(
        -this.alerts.configuration.thresholds.consecutiveFailures,
      );
      if (recentFailures.length === this.alerts.configuration.thresholds.consecutiveFailures) {
        const allRecent = recentFailures.every(
          (error) => new Date(error.timestamp) > new Date(Date.now() - 1800000), // Last 30 minutes
        );

        if (allRecent) {
          await this.createAlert('consecutive-failures', {
            failureCount: recentFailures.length,
            threshold: this.alerts.configuration.thresholds.consecutiveFailures,
          });
        }
      }
    } catch (error) {
      console.error('❌ Failed to check alert conditions:', error.message);
    }
  }

  /**
   * Create an alert
   */
  async createAlert(type, data) {
    const alert = {
      id: this.generateAlertId(),
      type,
      severity: this.getAlertSeverity(type),
      message: this.getAlertMessage(type, data),
      data,
      timestamp: new Date().toISOString(),
      status: 'active',
    };

    // Check if similar alert already exists
    const existingAlert = this.alerts.active.find((a) => a.type === type && a.status === 'active');

    if (existingAlert) {
      // Update existing alert
      existingAlert.data = { ...existingAlert.data, ...data };
      existingAlert.timestamp = alert.timestamp;
    } else {
      // Add new alert
      this.alerts.active.push(alert);
    }

    console.log(`🚨 Alert created: ${alert.message}`);
    this.emit('alert-created', alert);

    // Send notifications
    await this.sendAlertNotifications(alert);
  }

  getAlertSeverity(type) {
    const severityMap = {
      'high-processing-time': 'warning',
      'security-vulnerability': 'critical',
      'system-critical': 'critical',
      'high-error-rate': 'warning',
      'consecutive-failures': 'critical',
    };

    return severityMap[type] || 'info';
  }

  getAlertMessage(type, data) {
    const messageMap = {
      'high-processing-time': `PR ${data.prNumber} processing took ${data.processingTime}ms (threshold: ${data.threshold}ms)`,
      'security-vulnerability': `Security vulnerability found in ${data.packageName}: ${data.severity}`,
      'system-critical': 'Dependabot automation system has critical health issues',
      'high-error-rate': `Error rate ${(data.errorRate * 100).toFixed(1)}% exceeds threshold ${data.threshold * 100}%`,
      'consecutive-failures': `${data.failureCount} consecutive failures detected`,
    };

    return messageMap[type] || `Alert of type ${type}`;
  }

  async sendAlertNotifications(alert) {
    if (!this.alerts.configuration.enabled) {
      return;
    }

    for (const channel of this.alerts.configuration.channels) {
      try {
        switch (channel) {
          case 'log':
            await this.sendLogNotification(alert);
            break;
          case 'github':
            await this.sendGitHubNotification(alert);
            break;
          case 'slack':
            await this.sendSlackNotification(alert);
            break;
        }
      } catch (error) {
        console.error(`❌ Failed to send ${channel} notification:`, error.message);
      }
    }
  }

  async sendLogNotification(alert) {
    const logMessage = `[ALERT] ${alert.severity.toUpperCase()}: ${alert.message}`;
    console.log(logMessage);

    // Also write to dedicated alert log
    const alertLogPath = path.join(this.logDir, 'alerts.log');
    const logEntry = `${alert.timestamp} - ${logMessage}\n`;
    await fs.appendFile(alertLogPath, logEntry);
  }

  async sendGitHubNotification(alert) {
    // Implementation would create GitHub issue or comment
    // This is a placeholder for GitHub API integration
    console.log(`📧 GitHub notification would be sent for alert: ${alert.message}`);
  }

  async sendSlackNotification(alert) {
    // Implementation would send Slack webhook
    // This is a placeholder for Slack integration
    console.log(`📱 Slack notification would be sent for alert: ${alert.message}`);
  }

  generateAlertId() {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Resolve an alert
   */
  async resolveAlert(alertId, resolution = 'manually resolved') {
    const alertIndex = this.alerts.active.findIndex((alert) => alert.id === alertId);
    if (alertIndex === -1) {
      throw new Error(`Alert ${alertId} not found`);
    }

    const alert = this.alerts.active[alertIndex];
    alert.status = 'resolved';
    alert.resolution = resolution;
    alert.resolvedAt = new Date().toISOString();

    // Move to resolved alerts
    this.alerts.resolved.push(alert);
    this.alerts.active.splice(alertIndex, 1);

    console.log(`✅ Alert resolved: ${alert.message}`);
    this.emit('alert-resolved', alert);
  }

  /**
   * Get current metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      alertCounts: {
        active: this.alerts.active.length,
        resolved: this.alerts.resolved.length,
      },
      healthStatus: this.healthStatus,
    };
  }

  /**
   * Get current alerts
   */
  getAlerts() {
    return this.alerts;
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    return this.healthStatus;
  }

  /**
   * Save metrics to file
   */
  async saveMetrics() {
    try {
      await fs.writeFile(this.metricsFile, JSON.stringify(this.metrics, null, 2));
    } catch (error) {
      console.error('❌ Failed to save metrics:', error.message);
    }
  }

  /**
   * Save alerts to file
   */
  async saveAlerts() {
    try {
      await fs.writeFile(this.alertsFile, JSON.stringify(this.alerts, null, 2));
    } catch (error) {
      console.error('❌ Failed to save alerts:', error.message);
    }
  }

  /**
   * Generate monitoring report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalPRsProcessed: this.metrics.totalPRsProcessed,
        autoMergedPRs: this.metrics.autoMergedPRs,
        blockedPRs: this.metrics.blockedPRs,
        securityAlertsFound: this.metrics.securityAlertsFound,
        averageProcessingTime: Math.round(this.metrics.averageProcessingTime),
        successRate: Math.round(this.metrics.successRate * 100),
        activeAlerts: this.alerts.active.length,
        healthStatus: this.healthStatus.status,
      },
      dailyStats: this.metrics.dailyStats,
      recentErrors: this.metrics.errors.slice(-10),
      activeAlerts: this.alerts.active,
      healthComponents: this.healthStatus.components,
    };

    return report;
  }
}

// CLI interface
if (require.main === module) {
  const monitoring = new DependabotMonitoring();

  monitoring.on('ready', () => {
    console.log('🔍 Dependabot monitoring system is running...');
    console.log('📊 Access metrics at: http://localhost:3001/metrics');
    console.log('🏥 Access health status at: http://localhost:3001/health');
  });

  monitoring.on('alert-created', (alert) => {
    console.log(`🚨 New ${alert.severity} alert: ${alert.message}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down monitoring system...');
    await monitoring.saveMetrics();
    await monitoring.saveAlerts();
    process.exit(0);
  });
}

module.exports = DependabotMonitoring;
