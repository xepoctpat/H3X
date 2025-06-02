#!/usr/bin/env node
// filepath: e:\H3X-fLups\scripts\auto-commit-pr.js
// Customized Auto Commit and PR Script for H3X Unified System

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class AutoCommitPR {
  constructor() {
    this.workDir = process.cwd();
    this.defaultBranch = 'main';
  }

  log(message) {
    console.log(`[AutoPR] ${new Date().toISOString()}: ${message}`);
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
      return null; // Return null instead of throwing to continue execution
    }
  }

  async commitChanges() {
    this.log('Performing automated commit...');
    
    // Check for changes
    const status = this.exec('git status --porcelain');
    if (!status) {
      this.log('No changes to commit');
      return false;
    }

    // Add all changes
    this.exec('git add .');
    
    // Generate commit message
    const timestamp = new Date().toISOString().split('T')[0];
    const commitMessage = `chore: automated commit - ${timestamp} - babillon PR`;
    
    const result = this.exec(`git commit -m "${commitMessage}"`);
    if (result !== null) {
      this.log(`Committed with message: ${commitMessage}`);
      return true;
    }
    return false;
  }

  async createPR() {
    this.log('Creating PR...');
    
    // Get current branch
    const currentBranch = this.exec('git branch --show-current');
    if (!currentBranch) {
      this.log('Could not determine current branch');
      return false;
    }
    
    this.log(`Current branch: ${currentBranch}`);

    // Push current branch
    const pushResult = this.exec(`git push origin ${currentBranch}`);
    if (pushResult !== null) {
      this.log(`Branch ${currentBranch} pushed successfully.`);
      
      // For GitHub CLI users
      if (this.exec('gh --version')) {
        const prTitle = `[Automated] Babillon Updates - ${new Date().toISOString().split('T')[0]}`;
        const prBody = "Automated PR created with the latest Babillon updates.";
        
        const prResult = this.exec(`gh pr create --title "${prTitle}" --body "${prBody}" --base main --head ${currentBranch}`);
        if (prResult !== null) {
          this.log(`PR created successfully: ${prResult}`);
          return true;
        } else {
          this.log('PR creation with GitHub CLI failed. Please create PR manually via web interface.');
        }
      } else {
        this.log('GitHub CLI not available. Please create PR manually via web interface.');
      }
      
      return true;
    }
    
    this.log('Failed to push branch. PR could not be created.');
    return false;
  }

  async run() {
    this.log('Starting auto commit and PR process...');
    const commitSuccess = await this.commitChanges();
    
    if (commitSuccess) {
      await this.createPR();
    } else {
      this.log('Skipping PR creation as commit was not successful.');
    }
  }
}

// Main execution
async function main() {
  const automation = new AutoCommitPR();
  await automation.run();
}

main().catch(error => {
  console.error('Automation failed:', error.message);
  process.exit(1);
});
