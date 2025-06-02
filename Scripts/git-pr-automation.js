#!/usr/bin/env node
// filepath: e:\H3X-fLups\scripts\git-pr-automation.js
// Git PR Automation Script - H3X Unified System

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class GitPRAutomation {
  constructor() {
    this.workDir = process.cwd();
    this.defaultBranch = 'main';
  }

  log(message) {
    console.log(`[GitPR] ${new Date().toISOString()}: ${message}`);
  }

  exec(command, options = {}) {
    try {
      const result = execSync(command, { 
        encoding: 'utf8', 
        cwd: this.workDir,
        ...options 
      });
      return result.trim();
    } catch (error) {
      this.log(`Command failed: ${command}`);
      this.log(`Error: ${error.message}`);
      throw error;
    }
  }

  async commit() {
    this.log('Performing automated commit...');
    
    // Check for changes
    const status = this.exec('git status --porcelain');
    if (!status) {
      this.log('No changes to commit');
      return;
    }

    // Add all changes
    this.exec('git add .');
    
    // Generate commit message
    const timestamp = new Date().toISOString().split('T')[0];
    const commitMessage = `chore: automated commit - ${timestamp}`;
    
    this.exec(`git commit -m "${commitMessage}"`);
    this.log(`Committed with message: ${commitMessage}`);
  }

  async quickPr() {
    this.log('Creating quick PR...');
    
    // Get current branch
    const currentBranch = this.exec('git branch --show-current');
    
    if (currentBranch === this.defaultBranch) {
      this.log('Cannot create PR from main branch. Create a feature branch first.');
      return;
    }

    // Push current branch
    this.exec(`git push -u origin ${currentBranch}`);
    
    this.log(`Branch ${currentBranch} pushed. Create PR manually via GitHub/GitLab interface.`);
  }

  async interactive() {
    this.log('Interactive mode - prompting for user input...');
    
    // Basic interactive workflow
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('Enter commit message (or press enter for auto): ', (message) => {
        if (!message) {
          this.commit();
        } else {
          this.exec('git add .');
          this.exec(`git commit -m "${message}"`);
          this.log(`Committed with message: ${message}`);
        }
        rl.close();
        resolve();
      });
    });
  }

  async changelog() {
    this.log('Generating changelog...');
    
    try {
      const commits = this.exec('git log --oneline --since="1 week ago"');
      const changelogPath = path.join(this.workDir, 'CHANGELOG.md');
      
      const changelogContent = `# Changelog\n\n## Recent Changes\n\n${commits.split('\n').map(line => `- ${line}`).join('\n')}\n\nGenerated: ${new Date().toISOString()}\n`;
      
      fs.writeFileSync(changelogPath, changelogContent);
      this.log(`Changelog written to ${changelogPath}`);
    } catch (error) {
      this.log('Failed to generate changelog');
    }
  }

  async pr() {
    this.log('Creating PR workflow...');
    await this.commit();
    await this.quickPr();
  }
}

// Main execution
async function main() {
  const automation = new GitPRAutomation();
  const command = process.argv[2] || 'help';

  try {
    switch (command) {
      case 'commit':
        await automation.commit();
        break;
      case 'quick-pr':
        await automation.quickPr();
        break;
      case 'interactive':
        await automation.interactive();
        break;
      case 'changelog':
        await automation.changelog();
        break;
      case 'pr':
        await automation.pr();
        break;
      default:
        console.log(`
Git PR Automation Script

Usage: node git-pr-automation.js <command>

Commands:
  commit      - Automated commit with timestamp
  quick-pr    - Push current branch and prepare for PR
  interactive - Interactive commit mode
  changelog   - Generate changelog from recent commits
  pr          - Full PR workflow (commit + push)
  help        - Show this help
        `);
    }
  } catch (error) {
    console.error('Automation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = GitPRAutomation;
