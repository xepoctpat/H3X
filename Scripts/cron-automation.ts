#!/usr/bin/env node

/**
 * H3X Cron Job Automation System
 * Scheduled task management for complete process automation
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { AutomationResult } from './types';

const execAsync = promisify(exec);

interface CronJobConfig {
  name: string;
  schedule: string;
  command: string;
  description: string;
  enabled: boolean;
  timeout: number;
  retries: number;
  environment: Record<string, string>;
  logFile: string;
  onSuccess?: string;
  onFailure?: string;
}

interface CronJobResult extends AutomationResult {
  jobName: string;
  scheduledTime: string;
  actualTime: string;
  nextRun?: string;
}

class H3XCronAutomation {
  private projectRoot: string;
  private cronJobs: Map<string, CronJobConfig>;
  private logDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.cronJobs = new Map();
    this.logDir = path.join(this.projectRoot, 'logs', 'cron');
  }

  async initialize(): Promise<void> {
    await this.setupCronEnvironment();
    await this.loadCronConfigurations();
    this.log('🕐 H3X Cron Automation System initialized', 'info');
  }

  private async setupCronEnvironment(): Promise<void> {
    // Create necessary directories
    const directories = ['logs/cron', 'config/cron', 'scripts/cron-jobs', 'reports/cron'];

    for (const dir of directories) {
      const fullPath = path.join(this.projectRoot, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
      } catch (error) {
        // Directory already exists
      }
    }
  }

  private async loadCronConfigurations(): Promise<void> {
    // Define core cron jobs for H3X automation
    const cronJobs: CronJobConfig[] = [
      {
        name: 'daily-health-check',
        schedule: '0 6 * * *', // 6 AM daily
        command: 'npm run test:health && npm run unified:status',
        description: 'Daily system health check and status report',
        enabled: true,
        timeout: 300000, // 5 minutes
        retries: 2,
        environment: { NODE_ENV: 'production' },
        logFile: 'daily-health-check.log',
        onSuccess: 'echo "Health check completed successfully" >> logs/cron/success.log',
        onFailure: 'echo "Health check failed - requires attention" >> logs/cron/alerts.log',
      },
      {
        name: 'typescript-conversion',
        schedule: '0 2 * * 1', // 2 AM every Monday
        command:
          'npx tsx scripts/convert-js-to-ts.ts && git add . && git commit -m "🔄 Automated TypeScript conversion" || echo "No changes to commit"',
        description: 'Weekly TypeScript conversion of new JavaScript files',
        enabled: true,
        timeout: 600000, // 10 minutes
        retries: 3,
        environment: { NODE_ENV: 'development' },
        logFile: 'typescript-conversion.log',
      },
      {
        name: 'pre-commit-validation',
        schedule: '*/30 * * * *', // Every 30 minutes
        command: 'npx tsx scripts/pre-commit-hook.ts',
        description: 'Regular pre-commit validation checks',
        enabled: true,
        timeout: 180000, // 3 minutes
        retries: 1,
        environment: { NODE_ENV: 'development' },
        logFile: 'pre-commit-validation.log',
      },
      {
        name: 'security-audit',
        schedule: '0 0 * * 0', // Midnight every Sunday
        command: 'npm audit --audit-level=moderate && npm run test:security',
        description: 'Weekly security audit and vulnerability scan',
        enabled: true,
        timeout: 900000, // 15 minutes
        retries: 2,
        environment: { NODE_ENV: 'production' },
        logFile: 'security-audit.log',
        onFailure:
          'echo "SECURITY ALERT: Vulnerabilities detected" >> logs/cron/security-alerts.log',
      },
      {
        name: 'dependency-update',
        schedule: '0 3 * * 0', // 3 AM every Sunday
        command: 'npm update && npm audit fix --force',
        description: 'Weekly dependency updates and security fixes',
        enabled: true,
        timeout: 1800000, // 30 minutes
        retries: 2,
        environment: { NODE_ENV: 'maintenance' },
        logFile: 'dependency-update.log',
      },
      {
        name: 'docker-cleanup',
        schedule: '0 1 * * *', // 1 AM daily
        command: 'npm run docker:prune && docker system prune -f',
        description: 'Daily Docker cleanup and optimization',
        enabled: true,
        timeout: 600000, // 10 minutes
        retries: 1,
        environment: { NODE_ENV: 'maintenance' },
        logFile: 'docker-cleanup.log',
      },
      {
        name: 'performance-monitoring',
        schedule: '0 */6 * * *', // Every 6 hours
        command: 'npm run test:performance && npm run workflow:monitor',
        description: 'Regular performance monitoring and metrics collection',
        enabled: true,
        timeout: 480000, // 8 minutes
        retries: 1,
        environment: { NODE_ENV: 'production' },
        logFile: 'performance-monitoring.log',
      },
      {
        name: 'backup-creation',
        schedule: '0 4 * * 0', // 4 AM every Sunday
        command: 'npm run backup:create && npm run backup:verify',
        description: 'Weekly backup creation and verification',
        enabled: true,
        timeout: 1200000, // 20 minutes
        retries: 2,
        environment: { NODE_ENV: 'maintenance' },
        logFile: 'backup-creation.log',
        onFailure:
          'echo "BACKUP FAILED: Manual intervention required" >> logs/cron/critical-alerts.log',
      },
      {
        name: 'workflow-maintenance',
        schedule: '0 5 * * 0', // 5 AM every Sunday
        command: 'npx tsx scripts/workflow-orchestrator.ts run maintenance',
        description: 'Weekly workflow maintenance and optimization',
        enabled: true,
        timeout: 900000, // 15 minutes
        retries: 2,
        environment: { NODE_ENV: 'maintenance' },
        logFile: 'workflow-maintenance.log',
      },
      {
        name: 'git-housekeeping',
        schedule: '0 7 * * 1', // 7 AM every Monday
        command: 'git gc --aggressive && git remote prune origin',
        description: 'Weekly Git repository housekeeping',
        enabled: true,
        timeout: 300000, // 5 minutes
        retries: 1,
        environment: { NODE_ENV: 'maintenance' },
        logFile: 'git-housekeeping.log',
      },
      {
        name: 'log-rotation',
        schedule: '0 0 1 * *', // First day of every month at midnight
        command:
          'find logs/ -name "*.log" -mtime +30 -exec gzip {} \\; && find logs/ -name "*.gz" -mtime +90 -delete',
        description: 'Monthly log rotation and cleanup',
        enabled: true,
        timeout: 180000, // 3 minutes
        retries: 1,
        environment: { NODE_ENV: 'maintenance' },
        logFile: 'log-rotation.log',
      },
      {
        name: 'integration-tests',
        schedule: '0 */4 * * *', // Every 4 hours
        command: 'npm run test:integration && npm run test:unified',
        description: 'Regular integration testing',
        enabled: true,
        timeout: 1200000, // 20 minutes
        retries: 2,
        environment: { NODE_ENV: 'testing' },
        logFile: 'integration-tests.log',
      },
    ];

    // Load jobs into map
    for (const job of cronJobs) {
      this.cronJobs.set(job.name, job);
    }

    this.log(`📋 Loaded ${this.cronJobs.size} cron job configurations`, 'info');
  }

  async setupSystemCron(): Promise<void> {
    this.log('🔧 Setting up system cron jobs...', 'info');

    // Generate crontab entries
    const crontabEntries: string[] = [
      '# H3X Automated Cron Jobs - Generated by H3XCronAutomation',
      '# Do not edit manually - use npm run cron:update instead',
      '',
    ];

    for (const [name, job] of this.cronJobs.entries()) {
      if (job.enabled) {
        const cronEntry = `${job.schedule} cd ${this.projectRoot} && ${job.command} >> ${path.join(this.logDir, job.logFile)} 2>&1`;
        crontabEntries.push(`# ${job.description}`);
        crontabEntries.push(cronEntry);
        crontabEntries.push('');
      }
    }

    // Write crontab file
    const crontabFile = path.join(this.projectRoot, 'config', 'cron', 'h3x-crontab');
    await fs.writeFile(crontabFile, crontabEntries.join('\n'));

    // Installation instructions
    const installScript = `#!/bin/bash
# H3X Cron Installation Script

echo "🔧 Installing H3X Cron Jobs..."

# Backup existing crontab
crontab -l > config/cron/crontab-backup-$(date +%Y%m%d-%H%M%S).txt 2>/dev/null || echo "No existing crontab found"

# Install new crontab
crontab config/cron/h3x-crontab

echo "✅ H3X Cron Jobs installed successfully!"
echo "📋 Run 'crontab -l' to view installed jobs"
echo "📝 Logs will be written to: ${this.logDir}"
`;

    await fs.writeFile(path.join(this.projectRoot, 'scripts', 'install-cron.sh'), installScript);
    await fs.chmod(path.join(this.projectRoot, 'scripts', 'install-cron.sh'), 0o755);

    this.log('✅ Cron setup completed. Run scripts/install-cron.sh to install', 'success');
  }

  async runCronJob(jobName: string): Promise<CronJobResult> {
    const job = this.cronJobs.get(jobName);
    if (!job) {
      throw new Error(`Cron job '${jobName}' not found`);
    }

    const startTime = Date.now();
    const scheduledTime = new Date().toISOString();

    this.log(`🚀 Running cron job: ${jobName}`, 'info');

    const result: CronJobResult = {
      success: false,
      message: `Cron job '${jobName}' execution`,
      duration: 0,
      jobName,
      scheduledTime,
      actualTime: scheduledTime,
    };

    try {
      // Set up environment
      const env = { ...process.env, ...job.environment };

      // Execute job with timeout and retries
      let lastError: Error | null = null;
      let attempt = 0;

      while (attempt <= job.retries) {
        try {
          attempt++;
          this.log(`📝 Attempt ${attempt}/${job.retries + 1} for job: ${jobName}`, 'info');

          const { stdout, stderr } = await execAsync(job.command, {
            env,
            timeout: job.timeout,
            cwd: this.projectRoot,
          });

          // Success
          result.success = true;
          result.message = `Cron job '${jobName}' completed successfully`;
          result.details = { stdout: stdout.trim(), stderr: stderr.trim() };

          // Log success
          await this.logJobResult(jobName, result, attempt);

          // Execute success callback
          if (job.onSuccess) {
            try {
              await execAsync(job.onSuccess, { env, cwd: this.projectRoot });
            } catch (error) {
              this.log(
                `⚠️ Success callback failed for ${jobName}: ${error instanceof Error ? error.message : String(error)}`,
                'warn',
              );
            }
          }

          break;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          this.log(`❌ Attempt ${attempt} failed for ${jobName}: ${lastError.message}`, 'error');

          if (attempt <= job.retries) {
            // Wait before retry (exponential backoff)
            const waitTime = Math.pow(2, attempt - 1) * 1000;
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      // If all attempts failed
      if (!result.success && lastError) {
        result.message = `Cron job '${jobName}' failed after ${attempt} attempts`;
        result.errors = [lastError.message];

        // Log failure
        await this.logJobResult(jobName, result, attempt);

        // Execute failure callback
        if (job.onFailure) {
          try {
            await execAsync(job.onFailure, {
              env: { ...env, ERROR_MESSAGE: lastError.message },
              cwd: this.projectRoot,
            });
          } catch (error) {
            this.log(
              `⚠️ Failure callback failed for ${jobName}: ${error instanceof Error ? error.message : String(error)}`,
              'warn',
            );
          }
        }
      }

      result.duration = Date.now() - startTime;

      // Calculate next run
      result.nextRun = this.calculateNextRun(job.schedule);

      return result;
    } catch (error) {
      result.success = false;
      const errorMessage = error instanceof Error ? error.message : String(error);
      result.message = `Cron job '${jobName}' execution failed: ${errorMessage}`;
      result.errors = [errorMessage];
      result.duration = Date.now() - startTime;

      await this.logJobResult(jobName, result, 1);
      return result;
    }
  }

  private async logJobResult(
    jobName: string,
    result: CronJobResult,
    attempts: number,
  ): Promise<void> {
    const logEntry = {
      timestamp: new Date().toISOString(),
      jobName,
      success: result.success,
      duration: result.duration,
      attempts,
      message: result.message,
      errors: result.errors,
      nextRun: result.nextRun,
    };

    // Write to general cron log
    const generalLogFile = path.join(this.logDir, 'cron-execution.log');
    await fs.appendFile(generalLogFile, JSON.stringify(logEntry) + '\n');

    // Write to job-specific log
    const job = this.cronJobs.get(jobName);
    if (job) {
      const jobLogFile = path.join(this.logDir, job.logFile);
      const jobLogEntry = `[${logEntry.timestamp}] ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message} (${result.duration}ms)`;
      await fs.appendFile(jobLogFile, jobLogEntry + '\n');
    }
  }

  private calculateNextRun(schedule: string): string {
    // Simple next run calculation (for production, use a proper cron parser)
    const now = new Date();
    const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Default to tomorrow
    return nextRun.toISOString();
  }

  async listCronJobs(): Promise<CronJobConfig[]> {
    return Array.from(this.cronJobs.values());
  }

  async enableCronJob(jobName: string): Promise<boolean> {
    const job = this.cronJobs.get(jobName);
    if (job) {
      job.enabled = true;
      this.log(`✅ Cron job '${jobName}' enabled`, 'success');
      return true;
    }
    return false;
  }

  async disableCronJob(jobName: string): Promise<boolean> {
    const job = this.cronJobs.get(jobName);
    if (job) {
      job.enabled = false;
      this.log(`⏸️ Cron job '${jobName}' disabled`, 'warn');
      return true;
    }
    return false;
  }

  async generateMonitoringReport(): Promise<void> {
    this.log('📊 Generating cron monitoring report...', 'info');

    const report = {
      timestamp: new Date().toISOString(),
      totalJobs: this.cronJobs.size,
      enabledJobs: Array.from(this.cronJobs.values()).filter((job) => job.enabled).length,
      jobs: await this.listCronJobs(),
      systemInfo: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        platform: process.platform,
      },
    };

    const reportFile = path.join(
      this.projectRoot,
      'reports',
      'cron',
      `cron-report-${new Date().toISOString().split('T')[0]}.json`,
    );
    await fs.writeFile(reportFile, JSON.stringify(report, null, 2));

    this.log(`📄 Cron report generated: ${reportFile}`, 'success');
  }

  private log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    const colors = {
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      success: '\x1b[32m',
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[CRON] ${message}${reset}`);
  }
}

// CLI Interface
async function main(): Promise<void> {
  const cronSystem = new H3XCronAutomation();
  await cronSystem.initialize();

  const command = process.argv[2];
  const jobName = process.argv[3];

  try {
    switch (command) {
      case 'setup':
        await cronSystem.setupSystemCron();
        break;

      case 'run':
        if (!jobName) {
          console.error('❌ Job name required');
          process.exit(1);
        }
        const result = await cronSystem.runCronJob(jobName);
        console.log(`${result.success ? '✅' : '❌'} ${result.message} (${result.duration}ms)`);
        process.exit(result.success ? 0 : 1);
        break;

      case 'list':
        const jobs = await cronSystem.listCronJobs();
        console.log('📋 Configured Cron Jobs:');
        jobs.forEach((job: CronJobConfig) => {
          const status: string = job.enabled ? '🟢' : '🔴';
          console.log(`  ${status} ${job.name}: ${job.description}`);
          console.log(`    Schedule: ${job.schedule}`);
          console.log(`    Command: ${job.command}`);
          console.log('');
        });
        break;

      case 'enable':
        if (!jobName) {
          console.error('❌ Job name required');
          process.exit(1);
        }
        const enabled = await cronSystem.enableCronJob(jobName);
        if (!enabled) {
          console.error(`❌ Job '${jobName}' not found`);
          process.exit(1);
        }
        break;

      case 'disable':
        if (!jobName) {
          console.error('❌ Job name required');
          process.exit(1);
        }
        const disabled = await cronSystem.disableCronJob(jobName);
        if (!disabled) {
          console.error(`❌ Job '${jobName}' not found`);
          process.exit(1);
        }
        break;

      case 'report':
        await cronSystem.generateMonitoringReport();
        break;

      default:
        console.log(`
🕐 H3X Cron Automation System

Usage:
  npx tsx scripts/cron-automation.ts <command> [options]

Commands:
  setup                    - Set up system cron jobs
  run <job-name>          - Run a specific cron job manually
  list                    - List all configured cron jobs
  enable <job-name>       - Enable a cron job
  disable <job-name>      - Disable a cron job
  report                  - Generate monitoring report

Examples:
  npx tsx scripts/cron-automation.ts setup
  npx tsx scripts/cron-automation.ts run daily-health-check
  npx tsx scripts/cron-automation.ts list
  npx tsx scripts/cron-automation.ts enable typescript-conversion
  npx tsx scripts/cron-automation.ts report

Installation:
  1. Run 'npx tsx scripts/cron-automation.ts setup'
  2. Execute 'scripts/install-cron.sh' to install system cron jobs
  3. Monitor with 'npx tsx scripts/cron-automation.ts report'
`);
        break;
    }
  } catch (error) {
    console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { H3XCronAutomation };
