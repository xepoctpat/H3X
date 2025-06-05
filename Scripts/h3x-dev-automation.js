#!/usr/bin/env node

/**
 * H3X Comprehensive Development Automation
 * Orchestrates linting, testing, building, and monitoring workflows
 */

const { exec, spawn } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

class H3XDevAutomation {
  constructor() {
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'logs', 'automation.log');
    this.runningProcesses = new Map();
    this.config = {
      autofix: true,
      verbose: false,
      parallel: true,
      healthChecks: true,
    };
  }

  /**
   * Initialize automation system
   */
  async initialize() {
    this.log('🚀 H3X Development Automation System - Initializing...', 'info');

    await this.ensureDirectories();
    await this.loadConfiguration();

    this.log('✅ Development automation system ready!', 'success');
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = ['logs', 'scripts', 'test-results', 'coverage', 'docs/generated'];

    for (const dir of dirs) {
      const fullPath = path.join(this.projectRoot, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
      } catch (error) {
        // Directory exists or permission error
      }
    }
  }

  /**
   * Load automation configuration
   */
  async loadConfiguration() {
    const configPath = path.join(this.projectRoot, 'scripts', 'automation-config.json');
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch (error) {
      // Use default config and create file
      await this.createDefaultConfig();
    }
  }

  /**
   * Create default automation configuration
   */
  async createDefaultConfig() {
    const defaultConfig = {
      autofix: true,
      verbose: false,
      parallel: true,
      healthChecks: true,
      linting: {
        autofix: true,
        failOnError: false,
        excludePaths: ['node_modules', 'dist', 'coverage', 'archive'],
      },
      testing: {
        coverage: true,
        threshold: 80,
        parallel: true,
        environments: ['node', 'browser'],
      },
      building: {
        minify: true,
        sourceMaps: true,
        typecheck: true,
      },
      monitoring: {
        healthCheckInterval: 30000,
        performanceTracking: true,
        errorReporting: true,
      },
    };

    const configPath = path.join(this.projectRoot, 'scripts', 'automation-config.json');
    await fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2));
    this.config = defaultConfig;
  }

  /**
   * Enhanced logging with timestamps and file output
   */
  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '🔧',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        build: '🏗️',
        test: '🧪',
        lint: '🔍',
      }[type] || 'ℹ️';

    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    console.log(logMessage);

    // Write to log file
    try {
      await fs.appendFile(this.logFile, logMessage + '\n');
    } catch (error) {
      // Continue if log write fails
    }
  }

  /**
   * Execute command with enhanced error handling and logging
   */
  async executeCommand(command, description, options = {}) {
    await this.log(`Executing: ${description}`, 'info');

    if (this.config.verbose) {
      console.log(`Command: ${command}`);
    }

    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        ...options,
      });

      if (stderr && !stderr.includes('WARN') && !stderr.includes('info')) {
        await this.log(`Warning: ${stderr}`, 'warning');
      }

      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    } catch (error) {
      await this.log(`Failed: ${description} - ${error.message}`, 'error');
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
      };
    }
  }

  /**
   * Run comprehensive linting workflow
   */
  async runLinting() {
    await this.log('Starting comprehensive linting workflow...', 'lint');

    const lintTasks = [
      {
        name: 'ESLint JavaScript/TypeScript',
        command: 'npx eslint . --ext .js,.ts --max-warnings 50 --format stylish',
        autofix: 'npx eslint . --ext .js,.ts --fix',
      },
      {
        name: 'HTMLHint HTML validation',
        command: 'npm run test:html',
      },
      {
        name: 'JSHint JavaScript validation',
        command: 'npm run test:js',
      },
      {
        name: 'MarkdownLint documentation',
        command: 'npm run test:md',
      },
      {
        name: 'Prettier formatting check',
        command: 'npm run format:check',
        autofix: 'npm run format',
      },
    ];

    const results = [];

    if (this.config.parallel) {
      // Run linting tasks in parallel
      const promises = lintTasks.map(async (task) => {
        const result = await this.executeCommand(task.command, task.name);

        if (!result.success && task.autofix && this.config.linting.autofix) {
          await this.log(`Auto-fixing: ${task.name}`, 'lint');
          const fixResult = await this.executeCommand(task.autofix, `Auto-fix ${task.name}`);
          result.autoFixed = fixResult.success;
        }

        return { task: task.name, ...result };
      });

      results.push(...(await Promise.all(promises)));
    } else {
      // Run linting tasks sequentially
      for (const task of lintTasks) {
        const result = await this.executeCommand(task.command, task.name);

        if (!result.success && task.autofix && this.config.linting.autofix) {
          await this.log(`Auto-fixing: ${task.name}`, 'lint');
          const fixResult = await this.executeCommand(task.autofix, `Auto-fix ${task.name}`);
          result.autoFixed = fixResult.success;
        }

        results.push({ task: task.name, ...result });
      }
    }

    // Report linting results
    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;
    const autoFixed = results.filter((r) => r.autoFixed).length;

    await this.log(
      `Linting complete: ${passed} passed, ${failed} failed, ${autoFixed} auto-fixed`,
      failed === 0 ? 'success' : 'warning',
    );

    return {
      success: failed === 0 || !this.config.linting.failOnError,
      results,
      summary: { passed, failed, autoFixed },
    };
  }

  /**
   * Run comprehensive testing workflow
   */
  async runTesting() {
    await this.log('Starting comprehensive testing workflow...', 'test');

    const testTasks = [
      {
        name: 'Health checks',
        command: 'npm run test:health',
      },
      {
        name: 'HTML validation tests',
        command: 'npm run test:html',
      },
      {
        name: 'JavaScript validation tests',
        command: 'npm run test:js',
      },
      {
        name: 'Markdown validation tests',
        command: 'npm run test:md',
      },
      {
        name: 'Unit tests (Jest)',
        command: 'npm test',
      },
      {
        name: 'Integration tests',
        command: 'npm run test:integration',
      },
      {
        name: 'Performance tests',
        command: 'npm run test:performance',
      },
    ];

    const results = [];

    for (const task of testTasks) {
      const result = await this.executeCommand(task.command, task.name);
      results.push({ task: task.name, ...result });

      // Stop on critical test failures
      if (!result.success && (task.name.includes('Health') || task.name.includes('Integration'))) {
        await this.log(`Critical test failure: ${task.name}`, 'error');
        break;
      }
    }

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    await this.log(
      `Testing complete: ${passed} passed, ${failed} failed`,
      failed === 0 ? 'success' : 'warning',
    );

    return {
      success: failed === 0,
      results,
      summary: { passed, failed },
    };
  }

  /**
   * Run build workflow
   */
  async runBuilding() {
    await this.log('Starting build workflow...', 'build');

    const buildTasks = [
      {
        name: 'TypeScript compilation check',
        command: 'npx tsc --noEmit',
      },
      {
        name: 'Vite build (if configured)',
        command: 'test -f vite.config.ts && npm run build || echo "No Vite config found"',
      },
      {
        name: 'Docker image build check',
        command: 'docker build -f dockerfile.h3x -t h3x-test .',
      },
    ];

    const results = [];

    for (const task of buildTasks) {
      const result = await this.executeCommand(task.command, task.name);
      results.push({ task: task.name, ...result });
    }

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    await this.log(
      `Build complete: ${passed} passed, ${failed} failed`,
      failed === 0 ? 'success' : 'warning',
    );

    return {
      success: failed === 0,
      results,
      summary: { passed, failed },
    };
  }

  /**
   * Run system monitoring and health checks
   */
  async runMonitoring() {
    await this.log('Running system monitoring and health checks...', 'test');

    const monitoringTasks = [
      {
        name: 'System health check',
        command: 'npm run test:health',
      },
      {
        name: 'Docker container status',
        command: 'docker ps --format "table {{.Names}}\\t{{.Status}}"',
      },
      {
        name: 'Port availability check',
        command: 'npm run setup-check',
      },
      {
        name: 'Dependency check',
        command: 'npm run unused:deps',
      },
    ];

    const results = [];

    for (const task of monitoringTasks) {
      const result = await this.executeCommand(task.command, task.name);
      results.push({ task: task.name, ...result });
    }

    const passed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    await this.log(
      `Monitoring complete: ${passed} checks passed, ${failed} issues detected`,
      failed === 0 ? 'success' : 'warning',
    );

    return {
      success: true, // Monitoring shouldn't fail the automation
      results,
      summary: { passed, failed },
    };
  }

  /**
   * Generate comprehensive automation report
   */
  async generateReport(lintResults, testResults, buildResults, monitoringResults) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        overall: 'success',
        linting: lintResults.summary,
        testing: testResults.summary,
        building: buildResults.summary,
        monitoring: monitoringResults.summary,
      },
      details: {
        linting: lintResults.results,
        testing: testResults.results,
        building: buildResults.results,
        monitoring: monitoringResults.results,
      },
      recommendations: [],
    };

    // Add recommendations based on results
    if (lintResults.summary.failed > 0) {
      report.recommendations.push('Address linting issues for better code quality');
    }
    if (testResults.summary.failed > 0) {
      report.recommendations.push('Fix failing tests before deploying');
    }
    if (buildResults.summary.failed > 0) {
      report.recommendations.push('Resolve build issues');
      report.summary.overall = 'warning';
    }

    // Write report to file
    const reportPath = path.join(this.projectRoot, 'logs', `automation-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    await this.log(`Automation report generated: ${reportPath}`, 'success');
    return report;
  }

  /**
   * Main automation workflow
   */
  async run(options = {}) {
    const startTime = Date.now();
    await this.initialize();

    try {
      await this.log('🚀 Starting H3X Development Automation Workflow', 'info');

      // Run all automation phases
      const lintResults = await this.runLinting();
      const testResults = await this.runTesting();
      const buildResults = await this.runBuilding();
      const monitoringResults = await this.runMonitoring();

      // Generate comprehensive report
      const report = await this.generateReport(
        lintResults,
        testResults,
        buildResults,
        monitoringResults,
      );

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      await this.log(`🎉 H3X Development Automation completed in ${duration}s`, 'success');

      // Print summary
      console.log('\n📊 AUTOMATION SUMMARY');
      console.log('=====================================');
      console.log(`Overall Status: ${report.summary.overall.toUpperCase()}`);
      console.log(
        `Linting: ${lintResults.summary.passed}✅ ${lintResults.summary.failed}❌ ${lintResults.summary.autoFixed}🔧`,
      );
      console.log(`Testing: ${testResults.summary.passed}✅ ${testResults.summary.failed}❌`);
      console.log(`Building: ${buildResults.summary.passed}✅ ${buildResults.summary.failed}❌`);
      console.log(
        `Monitoring: ${monitoringResults.summary.passed}✅ ${monitoringResults.summary.failed}⚠️`,
      );

      if (report.recommendations.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        report.recommendations.forEach((rec) => console.log(`  • ${rec}`));
      }

      return report;
    } catch (error) {
      await this.log(`Automation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Start continuous monitoring mode
   */
  async startContinuousMode() {
    await this.log('Starting continuous monitoring mode...', 'info');

    const interval = this.config.monitoring.healthCheckInterval || 30000;

    setInterval(async () => {
      await this.log('Running scheduled health check...', 'test');
      const monitoringResults = await this.runMonitoring();

      if (monitoringResults.summary.failed > 0) {
        await this.log('Issues detected during health check!', 'warning');
      }
    }, interval);

    await this.log(`Continuous monitoring started (${interval}ms interval)`, 'success');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const automation = new H3XDevAutomation();

  // Parse command line arguments
  const options = {
    continuous: args.includes('--continuous'),
    verbose: args.includes('--verbose'),
    autofix: args.includes('--autofix'),
    skipTests: args.includes('--skip-tests'),
    skipBuild: args.includes('--skip-build'),
  };

  if (options.continuous) {
    automation.startContinuousMode().catch(console.error);
  } else {
    automation
      .run(options)
      .then((report) => {
        process.exit(report.summary.overall === 'success' ? 0 : 1);
      })
      .catch((error) => {
        console.error('Automation failed:', error.message);
        process.exit(1);
      });
  }
}

module.exports = H3XDevAutomation;
