#!/usr/bin/env node
// H3X Unified System - CI/CD Automation Pipeline
// Comprehensive automation for build, test, and deployment

import { exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface CICDOptions {
  environment?: string;
  skipTests?: boolean;
  forceBuild?: boolean;
  deployTarget?: string;
  logLevel?: string;
}

class H3XUnifiedCICD {
  public environment: string;
  public skipTests: boolean;
  public forceBuild: boolean;
  public deployTarget: string;
  public logLevel: string;

  constructor(options: CICDOptions = {}) {
    this.environment = options.environment || 'development';
    this.skipTests = options.skipTests || false;
    this.forceBuild = options.forceBuild || false;
    this.deployTarget = options.deployTarget || 'local';
    this.logLevel = options.logLevel || 'info';
  }

  log(message: string, type: string = 'info'): void {
    const colors: Record<string, string> = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      build: '\x1b[35m',
      deploy: '\x1b[34m',
      reset: '\x1b[0m',
    };
    const timestamp = new Date().toISOString();
    console.log(`${colors[type]}[CI/CD ${timestamp}] ${message}${colors.reset}`);
  }

  async executeCommand(
    command: string,
    description: string,
  ): Promise<{ success: boolean; output?: string; error?: string }> {
    this.log(`${description}...`, 'build');
    try {
      const { stdout, stderr } = await execAsync(command);
      if (stderr && this.logLevel === 'debug') {
        this.log(`Warning: ${stderr}`, 'warning');
      }
      this.log(`✓ ${description} completed`, 'success');
      return { success: true, output: stdout };
    } catch (error: any) {
      this.log(`✗ ${description} failed: ${error.message}`, 'error');
      return { success: false, error: error.message };
    }
  }

  // Pre-flight checks
  async preflightChecks() {
    this.log('Running pre-flight checks...', 'info');

    const checks = [
      { command: 'docker --version', description: 'Docker availability' },
      {
        command: 'docker-compose --version',
        description: 'Docker Compose availability',
      },
      { command: 'node --version', description: 'Node.js availability' },
      { command: 'npm --version', description: 'NPM availability' },
    ];

    let allPassed = true;
    for (const check of checks) {
      const result = await this.executeCommand(check.command, check.description);
      if (!result.success) {
        allPassed = false;
      }
    }

    if (!allPassed) {
      throw new Error('Pre-flight checks failed. Please ensure all dependencies are installed.');
    }

    return true;
  }

  // Install dependencies
  async installDependencies() {
    this.log('Installing dependencies...', 'build');

    const commands = [
      { command: 'npm ci', description: 'Install Node.js dependencies' },
      { command: 'npm audit fix', description: 'Fix security vulnerabilities' },
    ];

    for (const cmd of commands) {
      const result = await this.executeCommand(cmd.command, cmd.description);
      if (!result.success && cmd.command.includes('audit')) {
        this.log('Audit fixes failed - continuing anyway', 'warning');
      } else if (!result.success) {
        throw new Error(`Dependency installation failed: ${result.error}`);
      }
    }

    return true;
  }

  // Build system
  async buildSystem() {
    this.log('Building H3X Unified System...', 'build');

    // Ensure network exists
    await this.executeCommand('npm run network:create', 'Create Docker network');

    // Build Docker images
    const buildCommand = this.forceBuild
      ? 'docker-compose -f docker-compose.unified.yml build --no-cache'
      : 'docker-compose -f docker-compose.unified.yml build';

    const result = await this.executeCommand(buildCommand, 'Build Docker images');
    if (!result.success) {
      throw new Error(`Build failed: ${result.error}`);
    }

    return true;
  }

  // Run tests
  async runTests() {
    if (this.skipTests) {
      this.log('Skipping tests (--skip-tests flag)', 'warning');
      return true;
    }

    this.log('Running test suite...', 'build');

    const tests = [
      { command: 'npm run test:health', description: 'Health checks' },
      { command: 'npm run test:quick', description: 'Quick validation tests' },
    ];

    // Start system for testing
    await this.executeCommand('npm run unified:start', 'Start system for testing');

    // Wait for system to stabilize
    this.log('Waiting for system to stabilize...', 'info');
    await new Promise((resolve) => setTimeout(resolve, 30000));

    let allTestsPassed = true;
    for (const test of tests) {
      const result = await this.executeCommand(test.command, test.description);
      if (!result.success) {
        allTestsPassed = false;
      }
    }

    // Run comprehensive integration tests
    const integrationResult = await this.executeCommand(
      'npm run test:unified',
      'Comprehensive integration tests',
    );

    if (!integrationResult.success) {
      allTestsPassed = false;
    }

    if (!allTestsPassed) {
      this.log('Some tests failed - check logs for details', 'error');
      return false;
    }

    this.log('All tests passed successfully!', 'success');
    return true;
  }

  // Deploy system
  async deploySystem() {
    this.log(`Deploying to ${this.deployTarget}...`, 'deploy');

    switch (this.deployTarget) {
      case 'local':
        return await this.deployLocal();
      case 'staging':
        return await this.deployStaging();
      case 'production':
        return await this.deployProduction();
      default:
        throw new Error(`Unknown deployment target: ${this.deployTarget}`);
    }
  }

  async deployLocal() {
    this.log('Deploying to local environment...', 'deploy');

    const commands = [
      {
        command: 'npm run unified:stop',
        description: 'Stop existing services',
      },
      { command: 'npm run unified:start', description: 'Start unified system' },
      {
        command: 'npm run init:databases',
        description: 'Initialize databases',
      },
    ];

    for (const cmd of commands) {
      const result = await this.executeCommand(cmd.command, cmd.description);
      if (!result.success && !cmd.command.includes('stop')) {
        throw new Error(`Local deployment failed: ${result.error}`);
      }
    }

    // Wait for services to be ready
    this.log('Waiting for services to be ready...', 'deploy');
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // Verify deployment
    const healthCheck = await this.executeCommand(
      'curl -f http://localhost:80/health',
      'Verify deployment health',
    );

    if (!healthCheck.success) {
      throw new Error('Deployment health check failed');
    }

    this.log('Local deployment completed successfully!', 'success');
    return true;
  }

  async deployStaging() {
    this.log('Staging deployment not implemented yet', 'warning');
    return false;
  }

  async deployProduction() {
    this.log('Production deployment requires manual approval', 'warning');
    return false;
  }

  // Cleanup
  async cleanup() {
    this.log('Running cleanup...', 'info');

    if (this.environment !== 'production') {
      await this.executeCommand('docker system prune -f', 'Clean Docker system');
    }

    return true;
  }

  // Generate deployment report
  async generateReport(success: boolean, duration: number, errors: string[] = []): Promise<any> {
    const report = {
      timestamp: new Date().toISOString(),
      environment: this.environment,
      deployTarget: this.deployTarget,
      duration: duration,
      success: success,
      errors: errors,
      system: {
        name: 'H3X Unified System',
        version: '2.0.0',
      },
    };

    const reportPath = path.join(__dirname, 'deploy-reports', `deploy-${Date.now()}.json`);
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.log(`Deployment report saved: ${reportPath}`, 'info');
    return report;
  }

  // Main pipeline execution
  async run() {
    const startTime = Date.now();
    const errors: string[] = [];
    let success = false;

    try {
      this.log('Starting H3X Unified System CI/CD Pipeline', 'info');
      this.log('================================================', 'info');
      this.log(`Environment: ${this.environment}`, 'info');
      this.log(`Deploy Target: ${this.deployTarget}`, 'info');
      this.log(`Skip Tests: ${this.skipTests}`, 'info');

      // Execute pipeline stages
      await this.preflightChecks();
      await this.installDependencies();
      await this.buildSystem();

      const testsSuccess = await this.runTests();
      if (!testsSuccess && !this.skipTests) {
        throw new Error('Tests failed - stopping pipeline');
      }

      await this.deploySystem();
      await this.cleanup();

      success = true;
      this.log('Pipeline completed successfully!', 'success');
    } catch (error: any) {
      errors.push(
        /* In the provided TypeScript code, `error.message` is used to access the error
      message property of an error object. When an error occurs during the execution of
      a function that may throw an error, the `catch` block captures that error into the
      `error` variable. By using `error.message`, you can retrieve the error message
      string associated with that particular error. */
        error.message,
      );
      this.log(`Pipeline failed: ${error.message}`, 'error');
    }

    const duration = Date.now() - startTime;
    await this.generateReport(success, duration, errors);

    this.log('================================================', 'info');
    this.log(`Pipeline Duration: ${(duration / 1000).toFixed(2)}s`, 'info');
    this.log(`Result: ${success ? 'SUCCESS' : 'FAILURE'}`, success ? 'success' : 'error');

    return success;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const options: CICDOptions = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--environment':
      case '-e':
        options.environment = args[++i];
        break;
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--force-build':
        options.forceBuild = true;
        break;
      case '--deploy-target':
      case '-t':
        options.deployTarget = args[++i];
        break;
      case '--debug':
        options.logLevel = 'debug';
        break;
      case '--help':
      case '-h':
        console.log(`
H3X Unified System CI/CD Pipeline

Usage: node cicd-automation.js [options]

Options:
  -e, --environment <env>     Environment (development, staging, production)
  -t, --deploy-target <target> Deploy target (local, staging, production)
  --skip-tests               Skip test execution
  --force-build              Force rebuild without cache
  --debug                    Enable debug logging
  -h, --help                 Show this help message

Examples:
  node cicd-automation.js                                    # Default local deployment
  node cicd-automation.js -e production -t staging          # Staging deployment
  node cicd-automation.js --skip-tests --force-build        # Fast rebuild
                `);
        process.exit(0);
    }
  }

  const pipeline = new H3XUnifiedCICD(options);

  pipeline
    .run()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error: any) => {
      console.error('Pipeline execution failed:', error);
      process.exit(1);
    });
}

export default H3XUnifiedCICD;
