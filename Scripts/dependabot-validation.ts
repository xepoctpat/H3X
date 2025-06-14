#!/usr/bin/env node
/**
 * H3X Dependabot Automation Validation Script
 *
 * Simple validation script that checks if all components are properly configured
 * without requiring complex imports or module resolution
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DependabotValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: [],
    };
  }

  async validateAll() {
    console.log('🔍 Starting H3X Dependabot Automation Validation...\n');

    try {
      await this.validateFileStructure();
      await this.validateDependabotConfig();
      await this.validateAutomationConfig();
      await this.validateGitHubActions();
      await this.validatePackageJson();
      await this.validateDocumentation();

      this.printResults();
    } catch (error) {
      console.error('❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  async validateFileStructure() {
    console.log('📁 Validating file structure...');

    const requiredFiles = [
      '.github/dependabot.yml',
      '.github/workflows/dependabot-automation.yml',
      'config/dependabot-automation.json',
      'scripts/dependabot-automation.js',
      'scripts/dependabot-monitoring.js',
      'scripts/dependabot-dashboard.js',
      'scripts/dependabot-webhook-handler.js',
      'docs/dependabot-automation.md',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      try {
        await fs.access(filePath);
        this.pass(`✅ ${file} exists`);
      } catch {
        this.fail(`❌ ${file} is missing`);
      }
    }

    console.log('');
  }

  async validateDependabotConfig() {
    console.log('⚙️ Validating Dependabot configuration...');

    try {
      const configPath = path.join(this.projectRoot, '.github/dependabot.yml');
      const content = await fs.readFile(configPath, 'utf8');

      // Basic YAML structure validation
      if (!content.includes('version: 2')) {
        this.fail('❌ Dependabot config missing version 2');
      } else {
        this.pass('✅ Dependabot config has correct version');
      }

      if (!content.includes('package-ecosystem:')) {
        this.fail('❌ No package ecosystems configured');
      } else {
        this.pass('✅ Package ecosystems are configured');
      }

      if (content.includes('groups:')) {
        this.pass('✅ Package grouping is configured');
      } else {
        this.warn('⚠️ Package grouping not configured');
      }

      if (content.includes('schedule:')) {
        this.pass('✅ Update schedule is configured');
      } else {
        this.fail('❌ No update schedule configured');
      }
    } catch (error) {
      this.fail(`❌ Failed to validate Dependabot config: ${error.message}`);
    }

    console.log('');
  }

  async validateAutomationConfig() {
    console.log('🤖 Validating automation configuration...');

    try {
      const configPath = path.join(this.projectRoot, 'config/dependabot-automation.json');
      const content = await fs.readFile(configPath, 'utf8');
      const config = JSON.parse(content);

      if (config.autoMerge) {
        this.pass('✅ Auto-merge configuration present');

        if (config.autoMerge.enabled !== undefined) {
          this.pass('✅ Auto-merge enabled setting configured');
        }

        if (config.autoMerge.allowedUpdateTypes) {
          this.pass('✅ Allowed update types configured');
        }
      } else {
        this.fail('❌ Auto-merge configuration missing');
      }

      if (config.security) {
        this.pass('✅ Security configuration present');
      } else {
        this.fail('❌ Security configuration missing');
      }

      if (config.notifications) {
        this.pass('✅ Notification configuration present');
      } else {
        this.warn('⚠️ Notification configuration missing');
      }
    } catch (error) {
      this.fail(`❌ Failed to validate automation config: ${error.message}`);
    }

    console.log('');
  }

  async validateGitHubActions() {
    console.log('⚡ Validating GitHub Actions workflow...');

    try {
      const workflowPath = path.join(
        this.projectRoot,
        '.github/workflows/dependabot-automation.yml',
      );
      const content = await fs.readFile(workflowPath, 'utf8');

      if (content.includes('name:')) {
        this.pass('✅ Workflow has a name');
      }

      if (content.includes('on:')) {
        this.pass('✅ Workflow triggers are configured');
      }

      if (content.includes('pull_request')) {
        this.pass('✅ Pull request trigger configured');
      }

      if (content.includes('dependabot')) {
        this.pass('✅ Workflow references Dependabot');
      }

      if (content.includes('jobs:')) {
        this.pass('✅ Workflow jobs are defined');
      }
    } catch (error) {
      this.fail(`❌ Failed to validate GitHub Actions workflow: ${error.message}`);
    }

    console.log('');
  }

  async validatePackageJson() {
    console.log('📦 Validating package.json dependencies...');

    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      const content = await fs.readFile(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      if (dependencies['js-yaml']) {
        this.pass('✅ js-yaml dependency available');
      } else {
        this.warn('⚠️ js-yaml dependency missing (may be needed for YAML parsing)');
      }

      if (dependencies['@octokit/rest'] || dependencies['@octokit/core']) {
        this.pass('✅ GitHub API client available');
      } else {
        this.warn('⚠️ GitHub API client missing (may be needed for GitHub integration)');
      }

      if (packageJson.type === 'module') {
        this.pass('✅ ES modules enabled');
      } else {
        this.warn('⚠️ CommonJS modules detected');
      }
    } catch (error) {
      this.fail(`❌ Failed to validate package.json: ${error.message}`);
    }

    console.log('');
  }

  async validateDocumentation() {
    console.log('📚 Validating documentation...');

    try {
      const docPath = path.join(this.projectRoot, 'docs/dependabot-automation.md');
      const content = await fs.readFile(docPath, 'utf8');

      if (content.includes('# H3X Dependabot Automation Documentation')) {
        this.pass('✅ Documentation has proper title');
      }

      if (content.includes('## Setup and Installation')) {
        this.pass('✅ Setup instructions present');
      }

      if (content.includes('## Usage')) {
        this.pass('✅ Usage instructions present');
      }

      if (content.includes('## Configuration')) {
        this.pass('✅ Configuration documentation present');
      }

      if (content.includes('## Troubleshooting')) {
        this.pass('✅ Troubleshooting section present');
      }
    } catch (error) {
      this.fail(`❌ Failed to validate documentation: ${error.message}`);
    }

    console.log('');
  }

  pass(message) {
    this.results.passed++;
    this.results.details.push({ status: 'PASS', message });
    console.log(message);
  }

  fail(message) {
    this.results.failed++;
    this.results.details.push({ status: 'FAIL', message });
    console.log(message);
  }

  warn(message) {
    this.results.warnings++;
    this.results.details.push({ status: 'WARN', message });
    console.log(message);
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 VALIDATION RESULTS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    console.log(`📈 Total: ${this.results.passed + this.results.failed + this.results.warnings}`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED VALIDATIONS:');
      this.results.details
        .filter((detail) => detail.status === 'FAIL')
        .forEach((detail) => console.log(`   - ${detail.message}`));
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️ WARNINGS:');
      this.results.details
        .filter((detail) => detail.status === 'WARN')
        .forEach((detail) => console.log(`   - ${detail.message}`));
    }

    console.log('\n' + '='.repeat(60));

    if (this.results.failed === 0) {
      console.log(
        '🎉 All critical validations passed! Dependabot automation is properly configured.',
      );
      if (this.results.warnings > 0) {
        console.log('⚠️  Some warnings detected - review them for optimal configuration.');
      }
    } else {
      console.log('⚠️  Some validations failed. Please review and fix issues before deployment.');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (import.meta.url === `file://${__filename}`) {
  console.log('🔍 Starting validation...');
  const validator = new DependabotValidator();
  validator.validateAll().catch((error) => {
    console.error('Validation failed:', error);
    process.exit(1);
  });
}

export default DependabotValidator;
