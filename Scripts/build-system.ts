#!/usr/bin/env npx tsx
/**
 * H3X Build Automation Script
 * Comprehensive TypeScript build system with multiple targets
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BuildConfig {
  target: 'development' | 'production' | 'testing' | 'scripts';
  clean?: boolean;
  watch?: boolean;
  sourceMaps?: boolean;
  minify?: boolean;
  typeCheck?: boolean;
}

class H3XBuildSystem {
  private readonly projectRoot: string;
  private readonly distDir: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.distDir = path.join(this.projectRoot, 'dist');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔧',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async cleanDist(): Promise<void> {
    this.log('Cleaning distribution directory...');
    try {
      if (fs.existsSync(this.distDir)) {
        await execAsync('rimraf dist');
        this.log('Distribution directory cleaned', 'success');
      } else {
        this.log('Distribution directory does not exist', 'info');
      }
    } catch (error: any) {
      this.log(`Failed to clean dist: ${error.message}`, 'error');
      throw error;
    }
  }

  async typeCheck(): Promise<void> {
    this.log('Running TypeScript type checking...');
    try {
      await execAsync('npx tsc --noEmit');
      this.log('Type checking passed', 'success');
    } catch (error: any) {
      this.log(`Type checking failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async buildTarget(config: BuildConfig): Promise<void> {
    const { target, clean = false, watch = false, typeCheck = true } = config;
    
    this.log(`Starting ${target} build...`);

    if (clean) {
      await this.cleanDist();
    }

    if (typeCheck) {
      await this.typeCheck();
    }

    let tsconfigFile: string;
    let outputDir: string;

    switch (target) {
      case 'production':
        tsconfigFile = 'tsconfig.build.json';
        outputDir = 'dist';
        break;
      case 'scripts':
        tsconfigFile = 'tsconfig.scripts.json';
        outputDir = 'dist/scripts';
        break;
      case 'development':
      case 'testing':
      default:
        tsconfigFile = 'tsconfig.json';
        outputDir = 'dist';
        break;
    }

    try {
      const watchFlag = watch ? ' --watch' : '';
      const command = `npx tsc --project ${tsconfigFile}${watchFlag}`;
      
      this.log(`Compiling with: ${command}`);
      
      if (watch) {
        this.log('Starting watch mode...', 'info');
        const childProcess = exec(command);
        
        childProcess.stdout?.on('data', (data) => {
          console.log(data.toString().trim());
        });
        
        childProcess.stderr?.on('data', (data) => {
          console.error(data.toString().trim());
        });
        
        return new Promise((resolve, reject) => {
          childProcess.on('exit', (code) => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error(`Build failed with exit code ${code}`));
            }
          });
        });
      } else {
        await execAsync(command);
        this.log(`${target} build completed successfully`, 'success');
      }
    } catch (error: any) {
      this.log(`Build failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async runLinting(): Promise<void> {
    this.log('Running ESLint...');
    try {
      await execAsync('npm run lint:check');
      this.log('Linting passed', 'success');
    } catch (error: any) {
      this.log('Linting issues found, attempting to fix...', 'warning');
      try {
        await execAsync('npm run lint');
        this.log('Linting issues fixed', 'success');
      } catch (fixError: any) {
        this.log(`Failed to fix linting issues: ${fixError.message}`, 'error');
        throw fixError;
      }
    }
  }

  async runTests(): Promise<void> {
    this.log('Running test suite...');
    try {
      await execAsync('npm run test:ts');
      this.log('Tests passed', 'success');
    } catch (error: any) {
      this.log(`Tests failed: ${error.message}`, 'error');
      throw error;
    }
  }

  async fullBuildPipeline(target: 'development' | 'production' = 'development'): Promise<void> {
    this.log(`Starting full build pipeline for ${target}...`);

    try {
      // 1. Clean build
      await this.cleanDist();

      // 2. Type checking
      await this.typeCheck();

      // 3. Linting
      await this.runLinting();

      // 4. Build main application
      await this.buildTarget({ target, clean: false, typeCheck: false });

      // 5. Build scripts
      await this.buildTarget({ target: 'scripts', clean: false, typeCheck: false });

      // 6. Run tests (only for development builds)
      if (target === 'development') {
        await this.runTests();
      }

      this.log('Full build pipeline completed successfully', 'success');
    } catch (error: any) {
      this.log(`Build pipeline failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async generateBuildInfo(): Promise<void> {
    const buildInfo = {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      gitCommit: await this.getGitCommit(),
      buildTarget: process.env.BUILD_TARGET || 'development',
    };

    const buildInfoPath = path.join(this.distDir, 'build-info.json');
    fs.writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
    this.log('Build info generated', 'success');
  }

  private async getGitCommit(): Promise<string> {
    try {
      const { stdout } = await execAsync('git rev-parse HEAD');
      return stdout.trim();
    } catch {
      return 'unknown';
    }
  }
}

// CLI Interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'development';
  const buildSystem = new H3XBuildSystem();

  switch (command) {
    case 'clean':
      await buildSystem.cleanDist();
      break;
    
    case 'typecheck':
      await buildSystem.typeCheck();
      break;
    
    case 'lint':
      await buildSystem.runLinting();
      break;
    
    case 'test':
      await buildSystem.runTests();
      break;
    
    case 'scripts':
      await buildSystem.buildTarget({ target: 'scripts' });
      break;
    
    case 'watch':
      await buildSystem.buildTarget({ target: 'development', watch: true });
      break;
    
    case 'production':
      await buildSystem.fullBuildPipeline('production');
      await buildSystem.generateBuildInfo();
      break;
    
    case 'development':
    default:
      await buildSystem.fullBuildPipeline('development');
      await buildSystem.generateBuildInfo();
      break;
  }
}

// Check if script is run directly
const isMainModule = process.argv[1] && process.argv[1].includes('build-system');

if (isMainModule) {
  main().catch((error) => {
    console.error('❌ Build failed:', error);
    process.exit(1);
  });
}

export default H3XBuildSystem;
