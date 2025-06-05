// git-branch-management.ts - Git branch management automation for H3X

import { spawn } from 'child_process';
import * as readline from 'readline';
import * as path from 'path';

// Interfaces
interface BranchConfig {
  defaultBranch: string;
  developBranch: string;
  featureBranchPrefix: string;
  bugfixBranchPrefix: string;
  hotfixBranchPrefix: string;
  releaseBranchPrefix: string;
}

// Helper class for Git branch management
class GitBranchManager {
  private config: BranchConfig;
  private projectRoot: string;
  private rl: readline.Interface;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    // Default configuration
    this.config = {
      defaultBranch: 'main',
      developBranch: 'develop',
      featureBranchPrefix: 'feature/',
      bugfixBranchPrefix: 'bugfix/',
      hotfixBranchPrefix: 'hotfix/',
      releaseBranchPrefix: 'release/',
    };
  }

  // Helper for executing git commands
  private async execGit(args: string[]): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve) => {
      console.log(`Running: git ${args.join(' ')}`);

      const gitProcess = spawn('git', args, { cwd: this.projectRoot });
      let output = '';
      let errorOutput = '';

      gitProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        errorOutput += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          console.error(`Git command failed: ${errorOutput}`);
          resolve({ success: false, output: errorOutput });
        }
      });
    });
  }

  // Ask user for input
  private async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(`${question} `, (answer) => {
        resolve(answer);
      });
    });
  }

  // Helper to get current branch
  private async getCurrentBranch(): Promise<string> {
    const result = await this.execGit(['branch', '--show-current']);
    return result.output.trim();
  }

  // List all branches
  async listBranches(): Promise<void> {
    console.log('Listing branches...');

    // Local branches
    const localResult = await this.execGit(['branch']);
    console.log('\nLocal branches:');
    console.log(localResult.output);

    // Remote branches
    const remoteResult = await this.execGit(['branch', '-r']);
    console.log('\nRemote branches:');
    console.log(remoteResult.output);

    this.rl.close();
  }

  // Create a new branch
  async createBranch(): Promise<void> {
    console.log('Create a new branch');
    console.log('-------------------');

    // Show branch types
    console.log('Branch types:');
    console.log(`1. Feature branch (${this.config.featureBranchPrefix})`);
    console.log(`2. Bugfix branch (${this.config.bugfixBranchPrefix})`);
    console.log(`3. Hotfix branch (${this.config.hotfixBranchPrefix})`);
    console.log(`4. Release branch (${this.config.releaseBranchPrefix})`);
    console.log('5. Custom branch');

    const typeChoice = await this.prompt('Select branch type (1-5):');

    let prefix = '';
    switch (typeChoice) {
      case '1':
        prefix = this.config.featureBranchPrefix;
        break;
      case '2':
        prefix = this.config.bugfixBranchPrefix;
        break;
      case '3':
        prefix = this.config.hotfixBranchPrefix;
        break;
      case '4':
        prefix = this.config.releaseBranchPrefix;
        break;
      case '5':
        prefix = '';
        break;
      default:
        prefix = this.config.featureBranchPrefix;
        break;
    }

    // Get branch name
    let branchName = await this.prompt('Enter branch name (without prefix):');
    branchName = branchName.replace(/[^a-zA-Z0-9-_]/g, '-').toLowerCase();

    // Full branch name
    const fullBranchName = prefix + branchName;

    // Get base branch
    console.log('\nBase branch options:');
    console.log(`1. ${this.config.developBranch} (default for features and bugfixes)`);
    console.log(`2. ${this.config.defaultBranch} (default for hotfixes)`);
    console.log('3. Other (specify)');

    const baseChoice = await this.prompt('Select base branch (1-3):');

    let baseBranch = '';
    switch (baseChoice) {
      case '1':
        baseBranch = this.config.developBranch;
        break;
      case '2':
        baseBranch = this.config.defaultBranch;
        break;
      case '3':
        baseBranch = await this.prompt('Enter base branch name:');
        break;
      default:
        baseBranch = typeChoice === '3' ? this.config.defaultBranch : this.config.developBranch;
        break;
    }

    // Confirm
    console.log(`\nCreating branch '${fullBranchName}' based on '${baseBranch}'`);
    const confirm = await this.prompt('Proceed? (y/n):');

    if (confirm.toLowerCase() !== 'y') {
      console.log('Branch creation canceled.');
      this.rl.close();
      return;
    }

    // Make sure base branch is up to date
    console.log(`\nUpdating base branch '${baseBranch}'...`);
    await this.execGit(['checkout', baseBranch]);
    await this.execGit(['pull']);

    // Create and checkout new branch
    console.log(`\nCreating and checking out branch '${fullBranchName}'...`);
    const result = await this.execGit(['checkout', '-b', fullBranchName]);

    if (result.success) {
      console.log(`\nSuccessfully created and checked out branch '${fullBranchName}'`);
    } else {
      console.error(`\nFailed to create branch '${fullBranchName}'`);
    }

    this.rl.close();
  }

  // Delete a branch
  async deleteBranch(): Promise<void> {
    console.log('Delete a branch');
    console.log('--------------');

    // List local branches
    const branchesResult = await this.execGit(['branch']);
    console.log('\nLocal branches:');
    console.log(branchesResult.output);

    // Get current branch
    const currentBranch = await this.getCurrentBranch();
    console.log(`\nCurrent branch: ${currentBranch}`);

    // Get branch to delete
    const branchToDelete = await this.prompt('Enter branch name to delete:');

    if (branchToDelete === currentBranch) {
      console.error(`\nCannot delete the current branch '${currentBranch}'`);
      console.log('Please checkout another branch first.');
      this.rl.close();
      return;
    }

    if (
      branchToDelete === this.config.defaultBranch ||
      branchToDelete === this.config.developBranch
    ) {
      console.error(`\nCannot delete the ${branchToDelete} branch.`);
      this.rl.close();
      return;
    }

    // Confirm
    console.log(`\nAbout to delete branch '${branchToDelete}'`);
    const confirm = await this.prompt('Are you sure? (y/n):');

    if (confirm.toLowerCase() !== 'y') {
      console.log('Branch deletion canceled.');
      this.rl.close();
      return;
    }

    // Delete local branch
    console.log(`\nDeleting local branch '${branchToDelete}'...`);
    const localResult = await this.execGit(['branch', '-D', branchToDelete]);

    if (localResult.success) {
      console.log(`Successfully deleted local branch '${branchToDelete}'`);

      // Ask about remote
      const deleteRemote = await this.prompt('Delete remote branch as well? (y/n):');

      if (deleteRemote.toLowerCase() === 'y') {
        console.log(`\nDeleting remote branch 'origin/${branchToDelete}'...`);
        const remoteResult = await this.execGit(['push', 'origin', '--delete', branchToDelete]);

        if (remoteResult.success) {
          console.log(`Successfully deleted remote branch 'origin/${branchToDelete}'`);
        } else {
          console.error(`Failed to delete remote branch 'origin/${branchToDelete}'`);
        }
      }
    } else {
      console.error(`Failed to delete local branch '${branchToDelete}'`);
    }

    this.rl.close();
  }

  // Checkout an existing branch
  async checkoutBranch(): Promise<void> {
    console.log('Checkout a branch');
    console.log('----------------');

    // List local branches
    const localBranchesResult = await this.execGit(['branch']);
    console.log('\nLocal branches:');
    console.log(localBranchesResult.output);

    // List remote branches
    const remoteBranchesResult = await this.execGit(['branch', '-r']);
    console.log('\nRemote branches:');
    console.log(remoteBranchesResult.output);

    // Get current branch
    const currentBranch = await this.getCurrentBranch();
    console.log(`\nCurrent branch: ${currentBranch}`);

    // Get branch to checkout
    const branchToCheckout = await this.prompt('Enter branch name to checkout:');

    if (branchToCheckout === currentBranch) {
      console.log(`\nAlready on branch '${currentBranch}'`);
      this.rl.close();
      return;
    }

    // Check if it's a remote branch that needs to be fetched
    const isRemoteBranch =
      remoteBranchesResult.output.includes(`origin/${branchToCheckout}`) &&
      !localBranchesResult.output.includes(branchToCheckout);

    if (isRemoteBranch) {
      console.log(`\nChecking out remote branch 'origin/${branchToCheckout}'...`);
      const result = await this.execGit([
        'checkout',
        '-b',
        branchToCheckout,
        `origin/${branchToCheckout}`,
      ]);

      if (result.success) {
        console.log(`\nSuccessfully checked out remote branch 'origin/${branchToCheckout}'`);
      } else {
        console.error(`\nFailed to checkout remote branch 'origin/${branchToCheckout}'`);
      }
    } else {
      // Standard checkout
      console.log(`\nChecking out branch '${branchToCheckout}'...`);
      const result = await this.execGit(['checkout', branchToCheckout]);

      if (result.success) {
        console.log(`\nSuccessfully checked out branch '${branchToCheckout}'`);

        // Ask about pulling
        const pullChanges = await this.prompt('Pull latest changes? (y/n):');

        if (pullChanges.toLowerCase() === 'y') {
          console.log('\nPulling latest changes...');
          await this.execGit(['pull']);
        }
      } else {
        console.error(`\nFailed to checkout branch '${branchToCheckout}'`);
      }
    }

    this.rl.close();
  }

  // Interactive mode for branch management
  async interactiveMode(): Promise<void> {
    console.log('H3X Git Branch Manager');
    console.log('---------------------');
    console.log('1. List branches');
    console.log('2. Create new branch');
    console.log('3. Checkout branch');
    console.log('4. Delete branch');
    console.log('5. Exit');

    const choice = await this.prompt('Select an option (1-5):');

    switch (choice) {
      case '1':
        await this.listBranches();
        break;
      case '2':
        await this.createBranch();
        break;
      case '3':
        await this.checkoutBranch();
        break;
      case '4':
        await this.deleteBranch();
        break;
      case '5':
      default:
        console.log('Exiting branch manager');
        this.rl.close();
        break;
    }
  }
}

// Main function
async function main(): Promise<void> {
  const branchManager = new GitBranchManager();
  const command = process.argv[2] || 'interactive';

  switch (command) {
    case 'list':
      await branchManager.listBranches();
      break;
    case 'create':
      await branchManager.createBranch();
      break;
    case 'checkout':
      await branchManager.checkoutBranch();
      break;
    case 'delete':
      await branchManager.deleteBranch();
      break;
    case 'interactive':
    default:
      await branchManager.interactiveMode();
      break;
  }
}

// Run main function
if (require.main === module) {
  main().catch(console.error);
}

export { GitBranchManager };
