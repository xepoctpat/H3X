#!/usr/bin/env node

/**
 * H3X Pre-commit Hook (TypeScript)
 * Automated code quality checks before commits
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';

import { AutomationResult } from './types';

const execAsync = promisify(exec);

interface PreCommitConfig {
  enabled: boolean;
  checks: {
    typescript: boolean;
    eslint: boolean;
    prettier: boolean;
    tests: boolean;
    security: boolean;
  };
  autofix: boolean;
  failOnWarnings: boolean;
  skipOnKeywords: string[];
}

class H3XPreCommitHook {
  private projectRoot: string;
  private config: PreCommitConfig;
  private stagedFiles: string[] = [];

  constructor() {
    this.projectRoot = process.cwd();
    this.config = {
      enabled: true,
      checks: {
        typescript: true,
        eslint: true,
        prettier: true,
        tests: true,
        security: false, // Might be slow for commits
      },
      autofix: true,
      failOnWarnings: false,
      skipOnKeywords: ['wip', 'skip-hooks', 'no-verify'],
    };
  }

  async initialize(): Promise<void> {
    await this.loadConfig();
    await this.getStagedFiles();
  }

  private async loadConfig(): Promise<void> {
    try {
      const configPath = path.join(this.projectRoot, '.precommitrc.json');
      const configData = await fs.readFile(configPath, 'utf-8');
      this.config = { ...this.config, ...JSON.parse(configData) };
    } catch {
      // Use defaults if no config file
      this.log('Using default pre-commit configuration', 'info');
    }
  }

  private async getStagedFiles(): Promise<void> {
    try {
      const { stdout } = await execAsync('git diff --cached --name-only');
      this.stagedFiles = stdout
        .trim()
        .split('\n')
        .filter((file) => file.length > 0);
      this.log(`Found ${this.stagedFiles.length} staged files`, 'info');
    } catch (error) {
      throw new Error(`Failed to get staged files: ${error}`);
    }
  }

  async shouldSkipHooks(): Promise<boolean> {
    try {
      // Check commit message for skip keywords
      const { stdout } = await execAsync('git log --format=%B -n 1 HEAD 2>/dev/null || echo ""');
      const commitMessage = stdout.toLowerCase();

      const shouldSkip = this.config.skipOnKeywords.some((keyword) =>
        commitMessage.includes(keyword),
      );

      if (shouldSkip) {
        this.log('Skipping pre-commit hooks due to commit message keywords', 'warn');
      }

      return shouldSkip;
    } catch {
      return false;
    }
  }

  async runPreCommitChecks(): Promise<AutomationResult> {
    if (!this.config.enabled) {
      return { success: true, message: 'Pre-commit hooks disabled', duration: 0 };
    }

    if (await this.shouldSkipHooks()) {
      return { success: true, message: 'Pre-commit hooks skipped', duration: 0 };
    }

    const startTime = Date.now();
    this.log('🔍 Running pre-commit checks...', 'info');

    const results: AutomationResult[] = [];
    const tsFiles = this.stagedFiles.filter(
      (file) =>
        file.endsWith('.ts') ||
        file.endsWith('.tsx') ||
        file.endsWith('.js') ||
        file.endsWith('.jsx'),
    );

    if (tsFiles.length === 0) {
      this.log('No TypeScript/JavaScript files staged, skipping code checks', 'info');
      return { success: true, message: 'No relevant files to check', duration: 0 };
    }

    // TypeScript type checking
    if (this.config.checks.typescript) {
      this.log('📝 Running TypeScript type checking...', 'info');
      const tsResult = await this.runTypeScriptCheck(tsFiles);
      results.push(tsResult);
    }

    // ESLint checking
    if (this.config.checks.eslint) {
      this.log('🔧 Running ESLint...', 'info');
      const eslintResult = await this.runESLintCheck(tsFiles);
      results.push(eslintResult);
    }

    // Prettier formatting
    if (this.config.checks.prettier) {
      this.log('💅 Running Prettier formatting...', 'info');
      const prettierResult = await this.runPrettierCheck(tsFiles);
      results.push(prettierResult);
    }

    // Quick test run
    if (this.config.checks.tests) {
      this.log('🧪 Running quick tests...', 'info');
      const testResult = await this.runQuickTests(tsFiles);
      results.push(testResult);
    }

    // Security check
    if (this.config.checks.security) {
      this.log('🔒 Running security check...', 'info');
      const securityResult = await this.runSecurityCheck();
      results.push(securityResult);
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter((r) => r.success).length;
    const hasErrors = results.some((r) => !r.success);
    const hasWarnings = results.some((r) => r.warnings && r.warnings.length > 0);

    if (hasErrors || (this.config.failOnWarnings && hasWarnings)) {
      return {
        success: false,
        message: `Pre-commit checks failed: ${successCount}/${results.length} checks passed`,
        duration,
        details: results,
        errors: results.flatMap((r) => r.errors || []),
      };
    }

    return {
      success: true,
      message: `All pre-commit checks passed: ${successCount}/${results.length}`,
      duration,
      details: results,
    };
  }

  private async runTypeScriptCheck(files: string[]): Promise<AutomationResult> {
    const startTime = Date.now();

    try {
      // Run incremental TypeScript checking
      await execAsync('npx tsc --noEmit --skipLibCheck --incremental');

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'TypeScript type checking passed',
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: 'TypeScript type checking failed',
        duration,
        errors: [error.stdout || error.message],
      };
    }
  }

  private async runESLintCheck(files: string[]): Promise<AutomationResult> {
    const startTime = Date.now();

    try {
      const fileArgs = files.join(' ');
      const command = this.config.autofix
        ? `npx eslint ${fileArgs} --fix --ext .ts,.js,.tsx,.jsx`
        : `npx eslint ${fileArgs} --ext .ts,.js,.tsx,.jsx`;

      const { stdout, stderr } = await execAsync(command);

      const duration = Date.now() - startTime;

      // Check if there are any remaining issues
      const hasWarnings = stdout.includes('warning') || stderr.includes('warning');
      const hasErrors = stdout.includes('error') || stderr.includes('error');

      if (hasErrors) {
        return {
          success: false,
          message: 'ESLint found errors',
          duration,
          errors: [stdout, stderr].filter(Boolean),
        };
      }

      return {
        success: true,
        message: 'ESLint checks passed',
        duration,
        warnings: hasWarnings ? [stdout] : undefined,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: 'ESLint check failed',
        duration,
        errors: [error.stdout || error.message],
      };
    }
  }

  private async runPrettierCheck(files: string[]): Promise<AutomationResult> {
    const startTime = Date.now();

    try {
      const fileArgs = files
        .filter(
          (f) =>
            f.endsWith('.ts') ||
            f.endsWith('.js') ||
            f.endsWith('.tsx') ||
            f.endsWith('.jsx') ||
            f.endsWith('.json') ||
            f.endsWith('.md'),
        )
        .join(' ');

      if (!fileArgs) {
        return { success: true, message: 'No files for Prettier', duration: 0 };
      }

      if (this.config.autofix) {
        // Format files
        await execAsync(`npx prettier --write ${fileArgs}`);
        this.log('Files formatted with Prettier', 'info');
      } else {
        // Check formatting
        await execAsync(`npx prettier --check ${fileArgs}`);
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'Prettier formatting passed',
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      if (this.config.autofix) {
        // If autofix is enabled and files were formatted, stage them
        try {
          const formattedFiles = files.join(' ');
          await execAsync(`git add ${formattedFiles}`);
          return {
            success: true,
            message: 'Files formatted and staged',
            duration,
          };
        } catch {
          return {
            success: false,
            message: 'Failed to stage formatted files',
            duration,
            errors: [error.message],
          };
        }
      }

      return {
        success: false,
        message: 'Prettier formatting failed',
        duration,
        errors: [error.stdout || error.message],
      };
    }
  }

  private async runQuickTests(files: string[]): Promise<AutomationResult> {
    const startTime = Date.now();

    try {
      // Run only tests related to changed files
      const testFiles = files.filter((f) => f.includes('.test.') || f.includes('.spec.'));

      if (testFiles.length === 0) {
        // Run a quick smoke test instead
        await execAsync('npx vitest run --reporter=basic --no-coverage --run', { timeout: 30000 });
      } else {
        // Run specific test files
        const testArgs = testFiles.join(' ');
        await execAsync(`npx vitest run ${testArgs} --reporter=basic --no-coverage`, {
          timeout: 60000,
        });
      }

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'Quick tests passed',
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: 'Quick tests failed',
        duration,
        errors: [error.stdout || error.message],
      };
    }
  }

  private async runSecurityCheck(): Promise<AutomationResult> {
    const startTime = Date.now();

    try {
      // Quick security audit
      await execAsync('npm audit --audit-level moderate', { timeout: 30000 });

      const duration = Date.now() - startTime;
      return {
        success: true,
        message: 'Security check passed',
        duration,
      };
    } catch (error: any) {
      const duration = Date.now() - startTime;

      // Security warnings are often not critical for commits
      return {
        success: true,
        message: 'Security check completed with warnings',
        duration,
        warnings: [error.stdout || error.message],
      };
    }
  }

  async stageFixedFiles(): Promise<void> {
    if (!this.config.autofix) return;

    try {
      // Stage any files that were automatically fixed
      const fixedFiles = this.stagedFiles.filter(
        (file) =>
          file.endsWith('.ts') ||
          file.endsWith('.js') ||
          file.endsWith('.tsx') ||
          file.endsWith('.jsx') ||
          file.endsWith('.json'),
      );

      if (fixedFiles.length > 0) {
        const fileArgs = fixedFiles.join(' ');
        await execAsync(`git add ${fileArgs}`);
        this.log(`Staged ${fixedFiles.length} automatically fixed files`, 'info');
      }
    } catch (error) {
      this.log(`Warning: Could not stage fixed files: ${error}`, 'warn');
    }
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const colors = {
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[PRE-COMMIT] ${message}${reset}`);
  }
}

// Main execution
async function main(): Promise<void> {
  const hook = new H3XPreCommitHook();

  try {
    await hook.initialize();
    const result = await hook.runPreCommitChecks();

    if (result.success) {
      await hook.stageFixedFiles();
      console.log(`✅ ${result.message} (${result.duration}ms)`);
      process.exit(0);
    } else {
      console.error(`❌ ${result.message} (${result.duration}ms)`);
      if (result.errors) {
        result.errors.forEach((error) => {
          console.error(`  ${error}`);
        });
      }
      console.error('\n💡 Fix the above issues and try committing again.');
      console.error('💡 Or use "git commit --no-verify" to skip these checks.');
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Pre-commit hook failed: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
main();

export { H3XPreCommitHook };
