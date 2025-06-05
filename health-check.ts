#!/usr/bin/env node

/**
 * H3X Project Health Check Script
 * Co      this.log(`${name}: Error - ${(error as any).message}`, 'fail');
      this.results.details.push({
        name,
        status: 'ERROR',
        message: (error as any).message,ensive health monitoring for the Hexperiment Labs system
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface HealthResults {
  passed: number;
  failed: number;
  warnings: number;
  details: any[];
}

class HealthChecker {
  public results: HealthResults;

  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: [],
    };
  }

  log(message: string, type: string = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '🔍',
        pass: '✅',
        fail: '❌',
        warn: '⚠️',
      }[type] || 'ℹ️';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async check(name: string, testFn: () => Promise<any>): Promise<void> {
    try {
      this.log(`Checking ${name}...`);
      const result = await testFn();

      if (result.status === 'pass') {
        this.results.passed++;
        this.log(`${name}: ${result.message}`, 'pass');
      } else if (result.status === 'warn') {
        this.results.warnings++;
        this.log(`${name}: ${result.message}`, 'warn');
      } else {
        this.results.failed++;
        this.log(`${name}: ${result.message}`, 'fail');
      }

      this.results.details.push({ name, ...result });
    } catch (error) {
      this.results.failed++;
      this.log(`${name}: Error - ${error.message}`, 'fail');
      this.results.details.push({
        name,
        status: 'fail',
        message: error.message,
      });
    }
  }

  async checkFileSystem() {
    const criticalFiles = ['Package.json', 'Src/Index.js', 'README.md', 'docker-compose.yml'];

    const criticalDirs = ['Src', 'Public', 'Scripts', 'Apppackage'];

    let missing: string[] = [];

    for (const file of criticalFiles) {
      if (!fs.existsSync(file)) {
        missing.push(file);
      }
    }

    for (const dir of criticalDirs) {
      if (!fs.existsSync(dir)) {
        missing.push(dir);
      }
    }

    if (missing.length === 0) {
      return {
        status: 'pass',
        message: 'All critical files and directories present',
      };
    } else {
      return { status: 'fail', message: `Missing: ${missing.join(', ')}` };
    }
  }

  async checkNodeModules() {
    if (!fs.existsSync('node_modules')) {
      return {
        status: 'fail',
        message: 'node_modules not found. Run npm install.',
      };
    }

    const packageJson = JSON.parse(fs.readFileSync('Package.json', 'utf8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    let missingDeps: string[] = [];
    for (const dep in dependencies) {
      if (!fs.existsSync(path.join('node_modules', dep))) {
        missingDeps.push(dep);
      }
    }

    if (missingDeps.length === 0) {
      return {
        status: 'pass',
        message: `All ${Object.keys(dependencies).length} dependencies installed`,
      };
    } else {
      return {
        status: 'warn',
        message: `Missing dependencies: ${missingDeps.slice(0, 3).join(', ')}${missingDeps.length > 3 ? '...' : ''}`,
      };
    }
  }

  async checkPorts() {
    const requiredPorts = [3978, 9239];
    const portChecks = await Promise.all(requiredPorts.map((port) => this.isPortAvailable(port)));

    const busyPorts = requiredPorts.filter((port, index) => !portChecks[index]);

    if (busyPorts.length === 0) {
      return {
        status: 'pass',
        message: `All required ports (${requiredPorts.join(', ')}) available`,
      };
    } else {
      return {
        status: 'warn',
        message: `Ports in use: ${busyPorts.join(', ')}`,
      };
    }
  }

  async isPortAvailable(port: number): Promise<boolean> {
    try {
      const { stdout } = await execAsync(`netstat -an | findstr :${port}`);
      return !stdout.includes('LISTENING');
    } catch {
      return true; // If netstat fails, assume port is available
    }
  }

  async checkDocker() {
    try {
      await execAsync('docker --version');
      const { stdout } = await execAsync('docker ps');
      return { status: 'pass', message: 'Docker is running and accessible' };
    } catch (error) {
      return { status: 'warn', message: 'Docker not available or not running' };
    }
  }

  async checkGit() {
    try {
      const { stdout } = await execAsync('git status --porcelain');
      const changedFiles = stdout
        .trim()
        .split('\n')
        .filter((line) => line.trim()).length;

      if (changedFiles === 0) {
        return { status: 'pass', message: 'Git repository clean' };
      } else {
        return {
          status: 'warn',
          message: `${changedFiles} files have changes`,
        };
      }
    } catch (error) {
      return {
        status: 'warn',
        message: 'Not a git repository or git not available',
      };
    }
  }

  async checkEnvironment() {
    const envFiles = ['.env', '.env.local', '.localConfigs'];
    const existingEnvFiles = envFiles.filter((file) => fs.existsSync(file));

    if (existingEnvFiles.length > 0) {
      return {
        status: 'pass',
        message: `Environment files found: ${existingEnvFiles.join(', ')}`,
      };
    } else {
      return { status: 'warn', message: 'No environment files found' };
    }
  }

  async checkPublicFiles() {
    if (!fs.existsSync('Public')) {
      return { status: 'fail', message: 'Public directory not found' };
    }

    const htmlFiles = fs.readdirSync('Public').filter((file) => file.endsWith('.html'));

    if (htmlFiles.length > 0) {
      return {
        status: 'pass',
        message: `${htmlFiles.length} HTML files in Public directory`,
      };
    } else {
      return { status: 'warn', message: 'No HTML files in Public directory' };
    }
  }

  async checkScripts() {
    if (!fs.existsSync('Scripts')) {
      return { status: 'warn', message: 'Scripts directory not found' };
    }

    const jsFiles = fs.readdirSync('Scripts').filter((file) => file.endsWith('.js'));

    return {
      status: 'pass',
      message: `${jsFiles.length} script files available`,
    };
  }

  async run(): Promise<void> {
    this.log('🚀 Starting H3X Project Health Check', 'info');
    this.log('='.repeat(50), 'info');

    // Run all health checks
    await this.check('File System', () => this.checkFileSystem());
    await this.check('Node Modules', () => this.checkNodeModules());
    await this.check('Required Ports', () => this.checkPorts());
    await this.check('Docker Status', () => this.checkDocker());
    await this.check('Git Status', () => this.checkGit());
    await this.check('Environment', () => this.checkEnvironment());
    await this.check('Public Files', () => this.checkPublicFiles());
    await this.check('Scripts', () => this.checkScripts());

    // Generate summary
    this.log('='.repeat(50), 'info');
    this.log('🏁 Health Check Summary', 'info');
    this.log(`✅ Passed: ${this.results.passed}`, 'pass');
    this.log(`⚠️  Warnings: ${this.results.warnings}`, 'warn');
    this.log(`❌ Failed: ${this.results.failed}`, 'fail');

    const totalScore =
      (this.results.passed / (this.results.passed + this.results.failed + this.results.warnings)) *
      100;
    this.log(
      `📊 Overall Health Score: ${totalScore.toFixed(1)}%`,
      totalScore > 80 ? 'pass' : totalScore > 60 ? 'warn' : 'fail',
    );

    // Exit with appropriate code
    if (this.results.failed > 0) {
      process.exit(1);
    } else if (this.results.warnings > 3) {
      process.exit(2);
    } else {
      process.exit(0);
    }
  }
}

// Run health check if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const checker = new HealthChecker();
  checker.run().catch(console.error);
}

export default HealthChecker;
