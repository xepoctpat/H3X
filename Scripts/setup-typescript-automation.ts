#!/usr/bin/env node

/**
 * H3X TypeScript Automation Setup
 * Configures the complete TypeScript-first development environment
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

class TypeScriptAutomationSetup {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  async setup(): Promise<void> {
    console.log('🚀 Setting up H3X TypeScript Automation Environment...\n');

    try {
      await this.checkPrerequisites();
      await this.createDirectories();
      await this.installDependencies();
      await this.createConfiguration();
      await this.setupGitHooks();
      await this.testAutomation();

      console.log('\n✅ TypeScript automation setup completed successfully!');
      console.log('\n📚 Available Commands:');
      this.displayCommands();
    } catch (error) {
      console.error(`❌ Setup failed: ${error}`);
      process.exit(1);
    }
  }

  private async checkPrerequisites(): Promise<void> {
    console.log('🔍 Checking prerequisites...');

    try {
      const { stdout: nodeVersion } = await execAsync('node --version');
      console.log(`  ✅ Node.js: ${nodeVersion.trim()}`);

      const { stdout: npmVersion } = await execAsync('npm --version');
      console.log(`  ✅ npm: ${npmVersion.trim()}`);

      try {
        const { stdout: tsVersion } = await execAsync('npx tsc --version');
        console.log(`  ✅ TypeScript: ${tsVersion.trim()}`);
      } catch {
        console.log('  ⚠️ TypeScript not found, will install...');
      }

      try {
        await execAsync('npx tsx --version');
        console.log('  ✅ tsx runtime available');
      } catch {
        console.log('  ⚠️ tsx not found, will install...');
      }
    } catch (error) {
      throw new Error(`Prerequisites check failed: ${error}`);
    }
  }

  private async createDirectories(): Promise<void> {
    console.log('📁 Creating directory structure...');

    const directories = [
      'logs',
      'scripts/dist',
      'test-results',
      'coverage',
      'workflow-artifacts',
      'automation-reports',
      '.husky',
    ];

    for (const dir of directories) {
      const fullPath = path.join(this.projectRoot, dir);
      await fs.mkdir(fullPath, { recursive: true });
      console.log(`  ✅ Created: ${dir}`);
    }
  }

  private async installDependencies(): Promise<void> {
    console.log('📦 Installing/updating dependencies...');

    // Check if typescript and tsx are available
    try {
      await execAsync('npm list typescript tsx --depth=0');
      console.log('  ✅ TypeScript dependencies already installed');
    } catch {
      console.log('  📥 Installing TypeScript dependencies...');
      await execAsync('npm install --save-dev typescript tsx @types/node');
    }

    try {
      await execAsync('npm list husky --depth=0');
      console.log('  ✅ Husky already installed');
    } catch {
      console.log('  📥 Installing Husky...');
      await execAsync('npm install --save-dev husky');
    }
  }

  private async createConfiguration(): Promise<void> {
    console.log('⚙️ Creating configuration files...');

    // Ensure TypeScript config exists
    const tsConfigPath = path.join(this.projectRoot, 'scripts', 'tsconfig.json');
    try {
      await fs.access(tsConfigPath);
      console.log('  ✅ TypeScript config exists');
    } catch {
      const tsConfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'CommonJS',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          declaration: false,
          outDir: './dist',
          rootDir: './',
          resolveJsonModule: true,
          allowJs: true,
          noEmit: false,
          incremental: true,
          tsBuildInfoFile: '.tsbuildinfo',
          types: ['node', '@types/node'],
          typeRoots: ['../node_modules/@types'],
          lib: ['ES2022'],
        },
        include: ['**/*.ts', '**/*.js'],
        exclude: ['node_modules', 'dist', '*.d.ts'],
        'ts-node': {
          esm: false,
          experimentalSpecifierResolution: 'node',
        },
      };

      await fs.writeFile(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      console.log('  ✅ Created TypeScript config');
    }

    // Create automation config
    const automationConfigPath = path.join(this.projectRoot, 'scripts', 'automation-config.json');
    const automationConfig = {
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
        threshold: 70,
        timeout: 30000,
      },
      building: {
        enabled: true,
        targets: ['development'],
        typescript: true,
        minify: false,
        watch: false,
      },
      monitoring: {
        enabled: true,
        healthChecks: true,
        performance: true,
        security: true,
      },
    };

    await fs.writeFile(automationConfigPath, JSON.stringify(automationConfig, null, 2));
    console.log('  ✅ Created automation config');
  }

  private async setupGitHooks(): Promise<void> {
    console.log('🪝 Setting up Git hooks...');

    try {
      // Initialize husky
      await execAsync('npx husky install');
      console.log('  ✅ Husky initialized');

      // Create pre-commit hook
      const preCommitPath = path.join(this.projectRoot, '.husky', 'pre-commit');
      await fs.writeFile(preCommitPath, 'npm run pre-commit\\n', { mode: 0o755 });
      console.log('  ✅ Pre-commit hook created');
    } catch (error) {
      console.warn(`  ⚠️ Git hooks setup failed: ${error}`);
    }
  }

  private async testAutomation(): Promise<void> {
    console.log('🧪 Testing automation scripts...');

    try {
      // Test TypeScript compilation
      await execAsync('npx tsc --noEmit --project scripts/tsconfig.json');
      console.log('  ✅ TypeScript compilation successful');

      // Test automation script
      const { stdout } = await execAsync('npx tsx scripts/h3x-dev-automation.ts help');
      if (stdout.includes('H3X Development Automation')) {
        console.log('  ✅ Automation script working');
      }

      // Test workflow orchestrator
      const { stdout: workflowOutput } = await execAsync(
        'npx tsx scripts/workflow-orchestrator.ts list',
      );
      if (workflowOutput.includes('Available Workflows')) {
        console.log('  ✅ Workflow orchestrator working');
      }
    } catch (error) {
      console.warn(`  ⚠️ Some automation tests failed: ${error}`);
    }
  }

  private displayCommands(): void {
    console.log(`
🔧 Development Automation:
  npm run automation:lint       - Run linting checks
  npm run automation:test       - Run test suites
  npm run automation:build      - Build the project
  npm run automation:full       - Run full workflow

🔄 Workflow Management:
  npm run workflow:list         - List available workflows  
  npm run workflow:dev          - Run development workflow
  npx tsx scripts/workflow-orchestrator.ts run quick-check

📝 Quality Control:
  npm run pre-commit           - Run pre-commit checks
  npm run quality:check        - Quick quality check
  npm run quality:fix          - Auto-fix issues

🐳 Docker Operations:
  npm run env:dev              - Start development environment
  npm run env:dev:down         - Stop development environment
  npm run unified:start        - Start unified system

📊 Monitoring:
  npm run test:health          - Health check
  npm run automation:monitor   - Continuous monitoring
    `);
  }
}

// CLI interface
async function main(): Promise<void> {
  const setup = new TypeScriptAutomationSetup();
  await setup.setup();
}

// Run if called directly
main();

export { TypeScriptAutomationSetup };
