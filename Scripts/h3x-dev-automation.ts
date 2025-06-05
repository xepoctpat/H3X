#!/usr/bin/env node

/**
 * H3X Comprehensive Development Automation (TypeScript)
 * Orchestrates linting, testing, building, and monitoring workflows
 */

import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  AutomationConfig,
  AutomationResult,
  ProcessInfo,
  LogEntry,
  WorkflowStep,
  HealthCheckResult,
} from './types';

const execAsync = promisify(exec);

class H3XDevAutomation {
  private projectRoot: string;
  private logFile: string;
  private runningProcesses: Map<string, ProcessInfo>;
  private config: AutomationConfig;

  constructor() {
    this.projectRoot = process.cwd();
    this.logFile = path.join(this.projectRoot, 'logs', 'automation.log');
    this.runningProcesses = new Map();
    this.config = {
      linting: {
        enabled: true,
        tools: ['eslint', 'typescript'],
        autofix: true,
        failOnError: false,
        extensions: ['.ts', '.js', '.jsx', '.tsx'],
      },
      testing: {
        enabled: true,
        frameworks: ['vitest', 'jest'],
        coverage: true,
        threshold: 80,
        timeout: 30000,
      },
      building: {
        enabled: true,
        targets: ['development', 'production'],
        minify: true,
        sourcemap: true,
      },
      monitoring: {
        healthCheck: true,
        performance: true,
        security: true,
        interval: 30000,
      },
      git: {
        preCommitHooks: true,
        autoCommit: false,
        commitMessage: 'feat: automated improvements',
        pushAfterCommit: false,
      },
      docker: {
        enabled: true,
        compose: 'docker-compose.unified.yml',
        services: ['h3x-core', 'mongodb', 'redis'],
        healthCheck: true,
      },
    };
  }

  async initialize(): Promise<void> {
    await this.ensureDirectories();
    await this.loadConfig();
    this.log('H3X Development Automation initialized', 'info');
  }

  private async ensureDirectories(): Promise<void> {
    const dirs = ['logs', 'scripts/dist', 'test-results', 'coverage'];

    for (const dir of dirs) {
      const fullPath = path.join(this.projectRoot, dir);
      try {
        await fs.mkdir(fullPath, { recursive: true });
      } catch (error) {
        // Directory might already exist
      }
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      const configPath = path.join(this.projectRoot, 'scripts', 'automation-config.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch (error) {
      this.log('Using default configuration', 'info');
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info'): void {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      module: 'H3XDevAutomation',
    };

    const logLine = `[${timestamp}] ${level.toUpperCase()}: ${message}\n`;

    // Console output with colors
    const colors = {
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
      debug: '\x1b[90m', // Gray
    };
    const resetColor = '\x1b[0m';

    console.log(`${colors[level]}${logLine.trim()}${resetColor}`);

    // Async file logging (non-blocking)
    fs.appendFile(this.logFile, logLine).catch(() => {
      // Silent fail for logging
    });
  }

  async runLinting(): Promise<AutomationResult> {
    if (!this.config.linting.enabled) {
      return { success: true, message: 'Linting disabled', duration: 0 };
    }

    const startTime = Date.now();
    this.log('Running TypeScript and ESLint checks...', 'info');

    try {
      // TypeScript type checking
      await this.executeCommand(
        'npx tsc --noEmit --project scripts/tsconfig.json',
        'TypeScript type checking',
      );

      // ESLint with auto-fix
      const eslintCmd = this.config.linting.autofix
        ? 'npx eslint . --ext .ts,.js,.jsx,.tsx --fix'
        : 'npx eslint . --ext .ts,.js,.jsx,.tsx';

      await this.executeCommand(eslintCmd, 'ESLint analysis');

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'Linting completed successfully',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: `Linting failed: ${error}`,
        duration,
        errors: [String(error)],
      };
    }
  }

  async runTests(): Promise<AutomationResult> {
    if (!this.config.testing.enabled) {
      return { success: true, message: 'Testing disabled', duration: 0 };
    }

    const startTime = Date.now();
    this.log('Running test suites...', 'info');

    try {
      // Vitest tests with coverage
      if (this.config.testing.frameworks.includes('vitest')) {
        await this.executeCommand('npx vitest run --coverage', 'Vitest test suite');
      }

      // Jest tests (if configured)
      if (this.config.testing.frameworks.includes('jest')) {
        await this.executeCommand('npm run test', 'Jest test suite');
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'All tests passed',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: `Tests failed: ${error}`,
        duration,
        errors: [String(error)],
      };
    }
  }

  async runBuild(): Promise<AutomationResult> {
    if (!this.config.building.enabled) {
      return { success: true, message: 'Building disabled', duration: 0 };
    }

    const startTime = Date.now();
    this.log('Building TypeScript and bundling assets...', 'info');

    try {
      // Compile TypeScript
      await this.executeCommand('npx tsc --build scripts/tsconfig.json', 'TypeScript compilation');

      // Vite build
      await this.executeCommand('npx vite build', 'Vite bundle generation');

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'Build completed successfully',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: `Build failed: ${error}`,
        duration,
        errors: [String(error)],
      };
    }
  }

  async runHealthChecks(): Promise<AutomationResult> {
    const startTime = Date.now();
    this.log('Running system health checks...', 'info');

    try {
      const healthResults: HealthCheckResult[] = [];

      // Check Node.js and npm
      const nodeVersion = await this.executeCommand('node --version', 'Node.js version check');
      const npmVersion = await this.executeCommand('npm --version', 'npm version check');

      // Check TypeScript compiler
      await this.executeCommand('npx tsc --version', 'TypeScript compiler check');

      // Check Docker (if enabled)
      if (this.config.docker.enabled) {
        await this.executeCommand('docker --version', 'Docker availability check');
        await this.executeCommand(
          `docker-compose -f ${this.config.docker.compose} ps`,
          'Docker services check',
        );
      }

      // Check project structure
      const requiredFiles = ['package.json', 'tsconfig.json', 'vite.config.ts'];
      for (const file of requiredFiles) {
        try {
          await fs.access(path.join(this.projectRoot, file));
          this.log(`✓ ${file} exists`, 'info');
        } catch {
          throw new Error(`Required file missing: ${file}`);
        }
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'All health checks passed',
        duration,
        details: healthResults,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: `Health check failed: ${error}`,
        duration,
        errors: [String(error)],
      };
    }
  }

  async runSecurityScan(): Promise<AutomationResult> {
    const startTime = Date.now();
    this.log('Running security vulnerability scan...', 'info');

    try {
      // npm audit
      await this.executeCommand('npm audit --audit-level moderate', 'npm security audit');

      // Check for outdated dependencies
      await this.executeCommand('npm outdated', 'Dependency version check');

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'Security scan completed',
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.log(`Security scan warnings: ${error}`, 'warn');
      return {
        success: true,
        message: 'Security scan completed with warnings',
        duration,
        warnings: [String(error)],
      };
    }
  }

  async executeWorkflow(workflowName: string): Promise<AutomationResult> {
    const startTime = Date.now();
    this.log(`Starting ${workflowName} workflow...`, 'info');

    const workflows: Record<string, WorkflowStep[]> = {
      full: [
        {
          name: 'Health Check',
          command: 'health',
          description: 'System health verification',
          required: true,
          timeout: 30000,
          retries: 1,
        },
        {
          name: 'Linting',
          command: 'lint',
          description: 'Code quality checks',
          required: false,
          timeout: 60000,
          retries: 2,
        },
        {
          name: 'Testing',
          command: 'test',
          description: 'Test suite execution',
          required: false,
          timeout: 120000,
          retries: 1,
        },
        {
          name: 'Building',
          command: 'build',
          description: 'TypeScript compilation and bundling',
          required: false,
          timeout: 180000,
          retries: 1,
        },
        {
          name: 'Security',
          command: 'security',
          description: 'Security vulnerability scan',
          required: false,
          timeout: 60000,
          retries: 1,
        },
      ],
      quick: [
        {
          name: 'Health Check',
          command: 'health',
          description: 'System health verification',
          required: true,
          timeout: 30000,
          retries: 1,
        },
        {
          name: 'Quick Lint',
          command: 'lint',
          description: 'TypeScript and ESLint checks',
          required: false,
          timeout: 30000,
          retries: 1,
        },
      ],
      ci: [
        {
          name: 'Health Check',
          command: 'health',
          description: 'System health verification',
          required: true,
          timeout: 30000,
          retries: 1,
        },
        {
          name: 'Linting',
          command: 'lint',
          description: 'Code quality checks',
          required: true,
          timeout: 60000,
          retries: 0,
        },
        {
          name: 'Testing',
          command: 'test',
          description: 'Test suite execution',
          required: true,
          timeout: 120000,
          retries: 0,
        },
        {
          name: 'Building',
          command: 'build',
          description: 'Production build',
          required: true,
          timeout: 180000,
          retries: 0,
        },
      ],
    };

    const steps = workflows[workflowName];
    if (!steps) {
      return {
        success: false,
        message: `Unknown workflow: ${workflowName}`,
        duration: 0,
        errors: [`Workflow '${workflowName}' not found`],
      };
    }

    const results: AutomationResult[] = [];
    let hasErrors = false;

    for (const step of steps) {
      this.log(`Executing step: ${step.name}`, 'info');

      let result: AutomationResult;

      switch (step.command) {
        case 'health':
          result = await this.runHealthChecks();
          break;
        case 'lint':
          result = await this.runLinting();
          break;
        case 'test':
          result = await this.runTests();
          break;
        case 'build':
          result = await this.runBuild();
          break;
        case 'security':
          result = await this.runSecurityScan();
          break;
        default:
          result = { success: false, message: `Unknown command: ${step.command}`, duration: 0 };
      }

      results.push(result);

      if (!result.success) {
        if (step.required) {
          hasErrors = true;
          this.log(`Required step '${step.name}' failed. Stopping workflow.`, 'error');
          break;
        } else {
          this.log(`Optional step '${step.name}' failed. Continuing workflow.`, 'warn');
        }
      }
    }

    const duration = Date.now() - startTime;
    const successfulSteps = results.filter((r) => r.success).length;

    return {
      success: !hasErrors,
      message: `Workflow '${workflowName}' completed: ${successfulSteps}/${results.length} steps successful`,
      duration,
      details: results,
    };
  }

  private async executeCommand(command: string, description: string): Promise<string> {
    try {
      this.log(`Executing: ${description}`, 'debug');
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectRoot,
        timeout: 300000, // 5 minutes
      });

      if (stderr && !stderr.includes('warning')) {
        this.log(`Command warning: ${stderr}`, 'warn');
      }

      return stdout;
    } catch (error: any) {
      this.log(`Command failed: ${description} - ${error.message}`, 'error');
      throw error;
    }
  }

  async generateReport(): Promise<string> {
    const reportPath = path.join(this.projectRoot, 'automation-report.md');
    const timestamp = new Date().toISOString();

    const report = `# H3X Automation Report
Generated: ${timestamp}

## System Information
- Node.js: ${process.version}
- Platform: ${os.platform()} ${os.arch()}
- Working Directory: ${this.projectRoot}

## Configuration
\`\`\`json
${JSON.stringify(this.config, null, 2)}
\`\`\`

## Running Processes
${Array.from(this.runningProcesses.entries())
  .map(
    ([name, info]) =>
      `- ${name}: PID ${info.pid}, Status: ${info.status}, Started: ${info.startTime}`,
  )
  .join('\n')}

---
*Generated by H3X Development Automation*
`;

    await fs.writeFile(reportPath, report);
    this.log(`Report generated: ${reportPath}`, 'info');
    return reportPath;
  }
}

// CLI interface
async function main(): Promise<void> {
  const automation = new H3XDevAutomation();
  await automation.initialize();

  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  try {
    let result: AutomationResult;

    switch (command) {
      case 'lint':
        result = await automation.runLinting();
        break;
      case 'test':
        result = await automation.runTests();
        break;
      case 'build':
        result = await automation.runBuild();
        break;
      case 'health':
        result = await automation.runHealthChecks();
        break;
      case 'security':
        result = await automation.runSecurityScan();
        break;
      case 'workflow':
        const workflowName = args[1] || 'quick';
        result = await automation.executeWorkflow(workflowName);
        break;
      case 'report':
        const reportPath = await automation.generateReport();
        result = { success: true, message: `Report generated: ${reportPath}`, duration: 0 };
        break;
      case 'help':
      default:
        console.log(`
H3X Development Automation (TypeScript)

Usage: npm run automation <command> [options]

Commands:
  lint              Run TypeScript and ESLint checks
  test              Run test suites with coverage
  build             Compile TypeScript and build assets
  health            Run system health checks
  security          Run security vulnerability scan
  workflow <name>   Run predefined workflow (full, quick, ci)
  report            Generate automation report
  help              Show this help message

Examples:
  npm run automation workflow full
  npm run automation lint
  npm run automation health
  npm run automation workflow ci
        `);
        result = { success: true, message: 'Help displayed', duration: 0 };
        break;
    }

    if (result.success) {
      console.log(`✅ ${result.message} (${result.duration}ms)`);
      process.exit(0);
    } else {
      console.error(`❌ ${result.message} (${result.duration}ms)`);
      if (result.errors) {
        result.errors.forEach((error) => console.error(`  - ${error}`));
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Automation failed: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
main();

export { H3XDevAutomation };
