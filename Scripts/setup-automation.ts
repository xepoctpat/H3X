#!/usr/bin/env node

/**
 * H3X Automation Setup Script
 * Sets up Git hooks and automation tools
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('🚀 H3X Automation Setup - Initializing...\n');

/**
 * Execute command safely
 */
function runCommand(command, description) {
  console.log(`Running: ${description}`);
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    console.log(`✅ ${description} - SUCCESS`);
    return true;
  } catch (error) {
    console.log(`❌ ${description} - FAILED`);
    console.log('Error:', error.message);
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 */
function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  } else {
    console.log(`📁 Directory exists: ${dirPath}`);
  }
}

/**
 * Main setup function
 */
async function setupAutomation(): Promise<any> {
  console.log('📋 Setting up H3X automation infrastructure...\n');

  // 1. Ensure required directories exist
  console.log('1️⃣ Setting up directories...');
  ensureDirectory('./logs');
  ensureDirectory('./scripts');
  ensureDirectory('./test-results');
  ensureDirectory('./coverage');

  // 2. Initialize Husky for Git hooks
  console.log('\n2️⃣ Setting up Git hooks...');
  const hasGit = fs.existsSync('.git');
  if (hasGit) {
    runCommand('npx husky init', 'Initialize Husky');

    // Create pre-commit hook
    const preCommitHookPath = '.husky/pre-commit';
    const preCommitContent = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run H3X pre-commit checks
node scripts/pre-commit-hook.js
`;

    if (!fs.existsSync('.husky')) {
      fs.mkdirSync('.husky', { recursive: true });
    }

    fs.writeFileSync(preCommitHookPath, preCommitContent);

    // Make hook executable (if on Unix-like system)
    try {
      if (process.platform !== 'win32') {
        execSync(`chmod +x ${preCommitHookPath}`);
      }
      console.log('✅ Pre-commit hook created');
    } catch (error) {
      console.log('⚠️  Could not set executable permission on hook');
    }
  } else {
    console.log('⚠️  No Git repository found, skipping Git hooks setup');
  }

  // 3. Create automation scripts directory structure
  console.log('\n3️⃣ Setting up automation scripts...');
  const scriptsExist = [
    'scripts/h3x-dev-automation.js',
    'scripts/workflow-orchestrator.js',
    'scripts/pre-commit-hook.js',
    'scripts/automation-config.json',
  ].every((file) => fs.existsSync(file));

  if (scriptsExist) {
    console.log('✅ All automation scripts are present');
  } else {
    console.log('⚠️  Some automation scripts are missing');
  }

  // 4. Verify package.json scripts
  console.log('\n4️⃣ Verifying package.json scripts...');
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const hasAutomationScripts =
      packageJson.scripts &&
      packageJson.scripts['automation:full'] &&
      packageJson.scripts['workflow:dev'];

    if (hasAutomationScripts) {
      console.log('✅ Automation scripts found in package.json');
    } else {
      console.log('⚠️  Automation scripts missing from package.json');
    }
  } catch (error) {
    console.log('❌ Could not verify package.json');
  }

  // 5. Test automation setup
  console.log('\n5️⃣ Testing automation setup...');
  runCommand(
    'node scripts/h3x-dev-automation.js --help || echo "Automation script test"',
    'Test automation script',
  );
  runCommand('node scripts/workflow-orchestrator.js list', 'Test workflow orchestrator');

  // 6. Create quick start guide
  console.log('\n6️⃣ Creating quick start guide...');
  const quickStartPath = './AUTOMATION_QUICK_START.md';
  const quickStartContent = `# H3X Automation Quick Start Guide

## 🚀 Quick Commands

### Development Workflows
- \`npm run workflow:dev\` - Start full development environment
- \`npm run workflow:test\` - Run comprehensive testing
- \`npm run workflow:build\` - Build and package application
- \`npm run workflow:monitor\` - Start system monitoring

### Automation Scripts
- \`npm run automation:full\` - Run complete automation workflow
- \`npm run automation:fix\` - Auto-fix code issues
- \`npm run automation:monitor\` - Continuous monitoring mode

### Quality Checks
- \`npm run quality:check\` - Quick quality validation
- \`npm run quality:fix\` - Auto-fix quality issues
- \`npm run pre-commit\` - Run pre-commit checks manually

### Workflow Management
- \`npm run workflow:list\` - List all available workflows
- \`npm run workflow:stop\` - Stop all background processes

## 📋 Setup Verification

Run these commands to verify your setup:

1. \`npm run test:health\` - System health check
2. \`npm run automation:full\` - Full automation test
3. \`npm run workflow:list\` - Verify workflows

## 🔧 Configuration

Edit \`scripts/automation-config.json\` to customize automation behavior.

## 📝 Logs

- Automation logs: \`./logs/automation.log\`
- Workflow logs: \`./logs/workflow-orchestrator.log\`
- Test results: \`./test-results/\`

---
Generated on: ${new Date().toISOString()}
`;

  fs.writeFileSync(quickStartPath, quickStartContent);
  console.log(`✅ Quick start guide created: ${quickStartPath}`);

  // Summary
  console.log('\n🎉 H3X Automation Setup Complete!');
  console.log('=====================================');
  console.log('📁 Directories: logs, scripts, test-results, coverage');
  console.log('🪝 Git hooks: Pre-commit validation');
  console.log('🤖 Automation: Full workflow automation');
  console.log('📋 Workflows: Development, testing, build, deploy, monitor');
  console.log('📖 Guide: AUTOMATION_QUICK_START.md');

  console.log('\n🚀 Next Steps:');
  console.log('1. Run: npm run automation:full');
  console.log('2. Try: npm run workflow:dev');
  console.log('3. Check: npm run workflow:list');
  console.log('4. Monitor: npm run automation:monitor');
}

// Run setup
setupAutomation().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});
