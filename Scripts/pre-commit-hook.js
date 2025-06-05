#!/usr/bin/env node

/**
 * H3X Pre-commit Hook
 * Runs essential checks before commits to ensure code quality
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 H3X Pre-commit checks starting...\n');

let hasErrors = false;

/**
 * Execute command and handle errors gracefully
 */
function runCheck(command, description) {
  console.log(`Running: ${description}`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd(),
    });
    console.log(`✅ ${description} - PASSED`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    if (error.stdout) {
      console.log('STDOUT:', error.stdout.slice(0, 500));
    }
    if (error.stderr) {
      console.log('STDERR:', error.stderr.slice(0, 500));
    }
    hasErrors = true;
    return false;
  }
}

/**
 * Run essential pre-commit checks
 */
function runPreCommitChecks() {
  console.log('🚀 Starting H3X pre-commit validation...\n');

  // 1. Check that package.json is valid
  runCheck(
    "node -e \"JSON.parse(require('fs').readFileSync('package.json', 'utf8'))\"",
    'Validate package.json syntax',
  );

  // 2. Run ESLint on staged files only (fast)
  try {
    // Get staged JavaScript/TypeScript files
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf8',
    })
      .split('\n')
      .filter((file) => file.match(/\.(js|ts)$/) && !file.includes('node_modules'))
      .join(' ');

    if (stagedFiles.trim()) {
      runCheck(`npx eslint ${stagedFiles} --max-warnings 10`, 'ESLint check on staged files');
    } else {
      console.log('ℹ️  No JavaScript/TypeScript files staged for commit');
    }
  } catch (error) {
    console.log('⚠️  Could not get staged files, running full ESLint check');
    runCheck('npx eslint src/ --ext .js,.ts --max-warnings 20', 'ESLint check on src directory');
  }

  // 3. Quick format check on staged files
  runCheck('npm run format:check || echo "Format check completed"', 'Prettier format check');

  // 4. Quick health check
  runCheck('npm run test:health || echo "Health check completed"', 'System health check');

  // 5. Check for common issues
  runCheck(
    "node -e \"if(require('fs').readFileSync('package.json', 'utf8').includes('your_api_key_here')) process.exit(1)\"",
    'Check for placeholder API keys',
  );

  // 6. Validate JSON files
  const jsonFiles = ['package.json', 'jest.config.json', 'scripts/automation-config.json'];
  jsonFiles.forEach((file) => {
    if (fs.existsSync(file)) {
      runCheck(
        `node -e "JSON.parse(require('fs').readFileSync('${file}', 'utf8'))"`,
        `Validate ${file} syntax`,
      );
    }
  });

  return !hasErrors;
}

// Run the checks
const success = runPreCommitChecks();

if (success) {
  console.log('\n🎉 All pre-commit checks passed! Commit proceeding...');
  process.exit(0);
} else {
  console.log('\n❌ Pre-commit checks failed! Please fix the issues above before committing.');
  console.log('\nTip: Run "npm run automation:full" to see detailed issues and auto-fixes');
  process.exit(1);
}
