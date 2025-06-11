#!/usr/bin/env node
/**
 * H3X Dependabot Automation Validation Script
 * Simple CommonJS validation script for checking Dependabot automation setup
 */

const fs = require('fs').promises;
const path = require('path');

async function validateDependabotAutomation() {
  console.log('🔍 Starting H3X Dependabot Automation Validation...\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  function pass(message) {
    results.passed++;
    console.log(`✅ ${message}`);
  }

  function fail(message) {
    results.failed++;
    console.log(`❌ ${message}`);
  }

  function warn(message) {
    results.warnings++;
    console.log(`⚠️ ${message}`);
  }

  const projectRoot = process.cwd();

  // Validate file structure
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
    const filePath = path.join(projectRoot, file);
    try {
      await fs.access(filePath);
      pass(`${file} exists`);
    } catch {
      fail(`${file} is missing`);
    }
  }

  console.log('');

  // Validate Dependabot configuration
  console.log('⚙️ Validating Dependabot configuration...');

  try {
    const configPath = path.join(projectRoot, '.github/dependabot.yml');
    const content = await fs.readFile(configPath, 'utf8');

    if (content.includes('version: 2')) {
      pass('Dependabot config has correct version');
    } else {
      fail('Dependabot config missing version 2');
    }

    if (content.includes('package-ecosystem:')) {
      pass('Package ecosystems are configured');
    } else {
      fail('No package ecosystems configured');
    }

    if (content.includes('groups:')) {
      pass('Package grouping is configured');
    } else {
      warn('Package grouping not configured');
    }

    if (content.includes('schedule:')) {
      pass('Update schedule is configured');
    } else {
      fail('No update schedule configured');
    }
  } catch (error) {
    fail(`Failed to validate Dependabot config: ${error.message}`);
  }

  console.log('');

  // Validate automation configuration
  console.log('🤖 Validating automation configuration...');

  try {
    const configPath = path.join(projectRoot, 'config/dependabot-automation.json');
    const content = await fs.readFile(configPath, 'utf8');
    const config = JSON.parse(content);

    if (config.autoMerge) {
      pass('Auto-merge configuration present');
    } else {
      fail('Auto-merge configuration missing');
    }

    if (config.security) {
      pass('Security configuration present');
    } else {
      fail('Security configuration missing');
    }
  } catch (error) {
    fail(`Failed to validate automation config: ${error.message}`);
  }

  console.log('');

  // Validate package.json
  console.log('📦 Validating package.json...');

  try {
    const packagePath = path.join(projectRoot, 'package.json');
    const content = await fs.readFile(packagePath, 'utf8');
    const packageJson = JSON.parse(content);

    if (packageJson.type === 'module') {
      pass('ES modules enabled');
    } else {
      warn('CommonJS modules detected');
    }
  } catch (error) {
    fail(`Failed to validate package.json: ${error.message}`);
  }

  console.log('');

  // Print results
  console.log('='.repeat(60));
  console.log('📊 VALIDATION RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`📈 Total: ${results.passed + results.failed + results.warnings}`);
  console.log('='.repeat(60));

  if (results.failed === 0) {
    console.log(
      '🎉 All critical validations passed! Dependabot automation is properly configured.',
    );
    if (results.warnings > 0) {
      console.log('⚠️  Some warnings detected - review them for optimal configuration.');
    }
  } else {
    console.log('⚠️  Some validations failed. Please review and fix issues before deployment.');
    process.exit(1);
  }
}

// Run validation
validateDependabotAutomation().catch((error) => {
  console.error('❌ Validation failed:', error.message);
  process.exit(1);
});
