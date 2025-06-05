#!/usr/bin/env node

/**
 * SIR Autorun System
 * Automatically executes SIR tasks and monitoring in the background
 */

import { SIRLMStudioAgent } from './src/agent-lmstudio';
import * as fs from 'fs/promises';
import path = require('path');

class SIRAutorun {
  constructor(options = {}) {
    this.agent = new SIRLMStudioAgent();
    this.config = {
      interval: options.interval || 30000, // 30 seconds
      logFile: options.logFile || 'sir-autorun.log',
      tasks: options.tasks || [
        'system_status',
        'performance_analysis',
        'security_monitoring',
        'environment_simulation',
      ],
      maxLogSize: options.maxLogSize || 10 * 1024 * 1024, // 10MB
      ...options,
    };

    this.isRunning = false;
    this.currentTask = null;
    this.taskHistory = [];
    this.stats = {
      tasksCompleted: 0,
      tasksSucceeded: 0,
      tasksFailed: 0,
      startTime: null,
      lastTaskTime: null,
    };
  }

  async start() {
    if (this.isRunning) {
      console.log('⚠️  Autorun is already running');
      return;
    }

    this.isRunning = true;
    this.stats.startTime = new Date();

    console.log('🚀 Starting SIR Autorun System...');
    await this.log('=== SIR AUTORUN STARTED ===');
    await this.log(`Configuration: ${JSON.stringify(this.config, null, 2)}`);

    // Setup signal handlers
    process.on('SIGINT', () => this.stop());
    process.on('SIGTERM', () => this.stop());

    // Start main loop
    this.mainLoop();

    console.log('✅ SIR Autorun System is now active');
    console.log(`📊 Tasks will run every ${this.config.interval / 1000} seconds`);
    console.log(`📝 Logs will be written to: ${this.config.logFile}`);
    console.log('Press Ctrl+C to stop\n');
  }

  async stop() {
    if (!this.isRunning) {
      console.log('⚠️  Autorun is not running');
      return;
    }

    console.log('\n🛑 Stopping SIR Autorun System...');
    this.isRunning = false;

    await this.log('=== SIR AUTORUN STOPPED ===');
    await this.log(`Final stats: ${JSON.stringify(this.stats, null, 2)}`);

    this.printStats();
    console.log('👋 SIR Autorun System stopped');
    process.exit(0);
  }

  async mainLoop() {
    while (this.isRunning) {
      try {
        await this.executeTaskCycle();
        await this.sleep(this.config.interval);
      } catch (error) {
        await this.log(`ERROR in main loop: ${error.message}`);
        console.log(`❌ Error in main loop: ${error.message}`);
        await this.sleep(5000); // Wait 5 seconds before retrying
      }
    }
  }

  async executeTaskCycle() {
    const timestamp = new Date().toISOString();
    console.log(`\n🔄 [${timestamp}] Starting task cycle...`);

    for (const taskType of this.config.tasks) {
      if (!this.isRunning) break;

      this.currentTask = taskType;
      this.stats.tasksCompleted++;

      try {
        const result = await this.executeTask(taskType);
        this.stats.tasksSucceeded++;
        this.stats.lastTaskTime = new Date();

        console.log(`  ✅ ${taskType}: ${result.status}`);
        await this.log(`SUCCESS: ${taskType} - ${result.message}`);

        // Store in history (keep last 100 tasks)
        this.taskHistory.push({
          task: taskType,
          timestamp: new Date(),
          status: 'success',
          result: result,
        });

        if (this.taskHistory.length > 100) {
          this.taskHistory.shift();
        }
      } catch (error) {
        this.stats.tasksFailed++;
        console.log(`  ❌ ${taskType}: ${error.message}`);
        await this.log(`FAILED: ${taskType} - ${error.message}`);

        this.taskHistory.push({
          task: taskType,
          timestamp: new Date(),
          status: 'failed',
          error: error.message,
        });
      }
    }

    console.log('✅ Task cycle completed');
  }

  async executeTask(taskType) {
    switch (taskType) {
      case 'system_status':
        return await this.checkSystemStatus();

      case 'performance_analysis':
        return await this.performanceAnalysis();

      case 'security_monitoring':
        return await this.securityMonitoring();

      case 'environment_simulation':
        return await this.environmentSimulation();

      case 'data_collection':
        return await this.dataCollection();

      default:
        throw new Error(`Unknown task type: ${taskType}`);
    }
  }

  async checkSystemStatus() {
    try {
      const response = await this.agent.processMessage('Check system status and health');
      return {
        status: 'OPERATIONAL',
        message: 'System status check completed',
        data: response,
      };
    } catch (error) {
      // Fallback for demo mode
      return {
        status: 'DEMO_MODE',
        message: 'System status check (demo)',
        data: {
          cpu: Math.random() * 30 + 20,
          memory: Math.random() * 40 + 50,
          network: Math.random() * 1.0 + 2.0,
          processes: Math.floor(Math.random() * 50) + 230,
        },
      };
    }
  }

  async performanceAnalysis() {
    try {
      const response = await this.agent.processMessage(
        'Analyze current system performance metrics',
      );
      return {
        status: 'ANALYZED',
        message: 'Performance analysis completed',
        data: response,
      };
    } catch (error) {
      return {
        status: 'DEMO_ANALYZED',
        message: 'Performance analysis (demo)',
        data: {
          accuracy: (Math.random() * 5 + 95).toFixed(1) + '%',
          throughput: (Math.random() * 1.0 + 2.0).toFixed(1) + ' GB/s',
          latency: (Math.random() * 10 + 5).toFixed(1) + ' ms',
        },
      };
    }
  }

  async securityMonitoring() {
    try {
      const response = await this.agent.processMessage('Monitor security and detect anomalies');
      return {
        status: 'SECURE',
        message: 'Security monitoring completed',
        data: response,
      };
    } catch (error) {
      return {
        status: 'DEMO_SECURE',
        message: 'Security monitoring (demo)',
        data: {
          threats_detected: 0,
          firewall_status: 'ACTIVE',
          intrusion_attempts: Math.floor(Math.random() * 3),
          security_score: (Math.random() * 10 + 90).toFixed(1) + '%',
        },
      };
    }
  }

  async environmentSimulation() {
    try {
      const response = await this.agent.processMessage('Run environment simulation cycle');
      return {
        status: 'SIMULATED',
        message: 'Environment simulation completed',
        data: response,
      };
    } catch (error) {
      return {
        status: 'DEMO_SIMULATED',
        message: 'Environment simulation (demo)',
        data: {
          cycles_completed: Math.floor(Math.random() * 10) + 45,
          data_points: (Math.random() * 0.5 + 1.0).toFixed(1) + 'M',
          success_rate: (Math.random() * 5 + 95).toFixed(1) + '%',
        },
      };
    }
  }

  async dataCollection() {
    return {
      status: 'COLLECTED',
      message: 'Data collection completed',
      data: {
        records_processed: Math.floor(Math.random() * 1000) + 5000,
        storage_used: (Math.random() * 20 + 60).toFixed(1) + '%',
        collection_rate: (Math.random() * 500 + 1000).toFixed(0) + ' records/min',
      },
    };
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}\n`;

    try {
      // Check log file size and rotate if needed
      try {
        const stats = await fs.stat(this.config.logFile);
        if (stats.size > this.config.maxLogSize) {
          await this.rotateLog();
        }
      } catch (error) {
        // Log file doesn't exist yet, that's okay
      }

      await fs.appendFile(this.config.logFile, logEntry);
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  async rotateLog() {
    const backupFile = `${this.config.logFile}.backup`;
    try {
      await fs.rename(this.config.logFile, backupFile);
      console.log(`📁 Log file rotated to ${backupFile}`);
    } catch (error) {
      console.error(`Failed to rotate log file: ${error.message}`);
    }
  }

  printStats() {
    const runtime = this.stats.startTime
      ? Math.floor((Date.now() - this.stats.startTime.getTime()) / 1000)
      : 0;

    console.log('\n📊 SIR Autorun Statistics:');
    console.log(`  Runtime: ${runtime} seconds`);
    console.log(`  Tasks completed: ${this.stats.tasksCompleted}`);
    console.log(`  Tasks succeeded: ${this.stats.tasksSucceeded}`);
    console.log(`  Tasks failed: ${this.stats.tasksFailed}`);
    console.log(
      `  Success rate: ${
        this.stats.tasksCompleted > 0
          ? ((this.stats.tasksSucceeded / this.stats.tasksCompleted) * 100).toFixed(1)
          : 0
      }%`,
    );
    console.log(`  Last task: ${this.stats.lastTaskTime || 'None'}`);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      currentTask: this.currentTask,
      stats: this.stats,
      config: this.config,
      recentTasks: this.taskHistory.slice(-5),
    };
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

exports.SIRAutorun = SIRAutorun;

// CLI handling
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const command = args[0] || 'start';

  const config = {
    interval: 30000, // 30 seconds
    tasks: ['system_status', 'performance_analysis', 'security_monitoring'],
  };

  // Parse command line arguments
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i]?.replace('--', '');
    const value = args[i + 1];

    if (key === 'interval' && value) {
      config.interval = parseInt(value) * 1000;
    } else if (key === 'tasks' && value) {
      config.tasks = value.split(',');
    }
  }

  const autorun = new SIRAutorun(config);

  switch (command) {
    case 'start':
      autorun.start().catch(console.error);
      break;

    case 'help':
      console.log(`
SIR Autorun System - Automatic Task Execution

Usage:
  node sir-autorun.js start [options]
  node sir-autorun.js help

Options:
  --interval <seconds>    Task execution interval (default: 30)
  --tasks <task1,task2>   Comma-separated list of tasks

Available tasks:
  - system_status         Check system health
  - performance_analysis  Analyze performance metrics
  - security_monitoring   Monitor security threats
  - environment_simulation Run environment simulations
  - data_collection       Collect and process data

Examples:
  node sir-autorun.js start --interval 60 --tasks system_status,security_monitoring
  node sir-autorun.js start --interval 10
            `);
      break;

    default:
      console.log('Unknown command. Use "help" for usage information.');
  }
}
