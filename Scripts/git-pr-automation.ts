// git-pr-automation.ts - Git and Pull Request automation for H3X

import { spawn } from 'child_process';
import * as readline from 'readline';
import * as fs from 'fs/promises';
import * as path from 'path';

// Interfaces
interface GitConfig {
  defaultBranch: string;
  developBranch: string;
  branches: string[];
  commitTemplate: string;
  prTemplate: string;
  conventionalCommitTypes: string[];
}

interface CommitInfo {
  type: string;
  scope?: string;
  message: string;
  description?: string;
  breaking?: boolean;
  issueRefs?: string[];
}

interface PullRequestInfo {
  title: string;
  body: string;
  base: string;
  assignees?: string[];
  labels?: string[];
  draft?: boolean;
}

// Helper class for Git automation
class GitPRAutomation {
  private config: GitConfig;
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
      branches: ['main', 'develop', 'feature/*', 'bugfix/*', 'hotfix/*', 'release/*'],
      commitTemplate: 'type(scope): message',
      prTemplate: path.join(this.projectRoot, '.github', 'PULL_REQUEST_TEMPLATE.md'),
      conventionalCommitTypes: [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
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

  // Check if working directory is clean
  private async isWorkingDirectoryClean(): Promise<boolean> {
    const status = await this.execGit(['status', '--porcelain']);
    return status.output.trim() === '';
  }

  // Format a commit message based on conventional commit format
  private formatCommitMessage(info: CommitInfo): string {
    let message = `${info.type}`;

    if (info.scope) {
      message += `(${info.scope})`;
    }

    message += `: ${info.message}`;

    if (info.breaking) {
      message += '\n\nBREAKING CHANGE: ';
      message += info.description || 'Breaking changes introduced';
    } else if (info.description) {
      message += `\n\n${info.description}`;
    }

    if (info.issueRefs && info.issueRefs.length > 0) {
      message += `\n\n${info.issueRefs.join('\n')}`;
    }

    return message;
  }

  // Interactive commit creation
  public async createCommit(): Promise<void> {
    if (await this.isWorkingDirectoryClean()) {
      console.log('No changes to commit. Working directory is clean.');
      this.rl.close();
      return;
    }

    // Show status
    await this.execGit(['status']);

    // Ask for commit details
    const typeOptions = this.config.conventionalCommitTypes.join(', ');
    console.log(`Commit types: ${typeOptions}`);

    const type = await this.prompt('Commit type:');
    if (!this.config.conventionalCommitTypes.includes(type)) {
      console.warn(`Warning: '${type}' is not a standard conventional commit type.`);
    }

    const scope = await this.prompt('Scope (optional):');
    const message = await this.prompt('Commit message:');
    const description = await this.prompt('Description (optional, press Enter to skip):');
    const breakingStr = await this.prompt('Is this a breaking change? (y/n):');
    const breaking = breakingStr.toLowerCase() === 'y';
    const issueRefsStr = await this.prompt(
      'Issue references (e.g., "Fixes #123", separated by commas, press Enter to skip):',
    );

    const issueRefs = issueRefsStr
      ? issueRefsStr
          .split(',')
          .map((ref) => ref.trim())
          .filter(Boolean)
      : undefined;

    const commitInfo: CommitInfo = {
      type,
      scope: scope || undefined,
      message,
      description: description || undefined,
      breaking,
      issueRefs,
    };

    const commitMessage = this.formatCommitMessage(commitInfo);
    console.log('\nCommit message:');
    console.log('-----------------------------------');
    console.log(commitMessage);
    console.log('-----------------------------------');

    const confirm = await this.prompt('Commit changes? (y/n):');

    if (confirm.toLowerCase() === 'y') {
      const result = await this.execGit(['commit', '-m', commitMessage]);

      if (result.success) {
        console.log('Changes committed successfully!');
      } else {
        console.error('Failed to commit changes.');
      }
    } else {
      console.log('Commit canceled.');
    }

    this.rl.close();
  }

  // Create a quick commit with just a message
  public async quickCommit(): Promise<void> {
    if (await this.isWorkingDirectoryClean()) {
      console.log('No changes to commit. Working directory is clean.');
      this.rl.close();
      return;
    }

    // Show status
    await this.execGit(['status']);

    const message = await this.prompt('Quick commit message:');
    const type = (await this.prompt('Commit type (default: chore):')) || 'chore';

    const commitMessage = `${type}: ${message}`;

    const result = await this.execGit(['commit', '-m', commitMessage]);

    if (result.success) {
      console.log('Changes committed successfully!');
    } else {
      console.error('Failed to commit changes.');
    }

    this.rl.close();
  }

  // Create a Pull Request
  public async createPR(): Promise<void> {
    // Check if gh CLI is installed
    try {
      await this.execGit(['--version']);
    } catch (error) {
      console.error('Error: git command not found. Please install git.');
      this.rl.close();
      return;
    }

    // Get current branch
    const currentBranch = await this.getCurrentBranch();
    console.log(`Current branch: ${currentBranch}`);

    if (
      currentBranch === this.config.defaultBranch ||
      currentBranch === this.config.developBranch
    ) {
      console.error(
        `Error: Cannot create PR from ${currentBranch} branch. Please checkout a feature/bugfix branch.`,
      );
      this.rl.close();
      return;
    }

    // Push changes if needed
    const pushQuestion = await this.prompt('Push local changes to remote? (y/n):');
    if (pushQuestion.toLowerCase() === 'y') {
      await this.execGit(['push', '--set-upstream', 'origin', currentBranch]);
    }

    // Build PR title from last commit
    const lastCommitResult = await this.execGit(['log', '-1', '--pretty=%s']);
    const suggestedTitle = lastCommitResult.output.trim();

    const title = await this.prompt(`PR title (default: "${suggestedTitle}"):`);
    const prTitle = title || suggestedTitle;

    // Read PR template if exists
    let prBody = '';
    try {
      const templateContent = await fs.readFile(this.config.prTemplate, 'utf8');
      prBody = templateContent;
    } catch (error) {
      console.log('No PR template found, using default template.');
      prBody = `## Changes\n\n- \n\n## Related Issues\n\n- \n\n## Testing\n\n- \n\n## Screenshots\n\n`;
    }

    // Get additional details
    const baseBranch = await this.prompt(
      `Target branch (default: "${this.config.developBranch}"):`,
    );
    const targetBranch = baseBranch || this.config.developBranch;

    // Save to temp file
    const tempFile = path.join(this.projectRoot, '.pr-body-temp.md');
    await fs.writeFile(tempFile, prBody);

    console.log('\nOpening editor for PR body. Save and close the editor when done.');
    await this.execGit(['config', '--local', 'core.editor', 'code --wait']);
    await this.execGit(['config', '--local', 'core.editor', 'notepad']);
    await this.execGit(['config', '--local', '--unset', 'core.editor']);

    // Use system editor
    const editor = process.env.EDITOR || 'notepad';
    const { spawn } = require('child_process');
    await new Promise<void>((resolve) => {
      const editorProcess = spawn(editor, [tempFile], {
        stdio: 'inherit',
        shell: true,
      });
      editorProcess.on('exit', () => resolve());
    });

    // Read the edited content
    const editedBody = await fs.readFile(tempFile, 'utf8');

    // Clean up temp file
    await fs.unlink(tempFile);

    // Confirm creation
    console.log('\nPR Details:');
    console.log('-----------------------------------');
    console.log(`Title: ${prTitle}`);
    console.log(`Source: ${currentBranch}`);
    console.log(`Target: ${targetBranch}`);
    console.log('-----------------------------------');

    const confirm = await this.prompt('Create pull request? (y/n):');

    if (confirm.toLowerCase() === 'y') {
      console.log('Creating pull request...');
      console.log('To create PR via GitHub, visit:');
      console.log(
        `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/compare/${targetBranch}...${currentBranch}?quick_pull=1&title=${encodeURIComponent(prTitle)}`,
      );

      // Write PR details to file
      const prDetailsFile = path.join(this.projectRoot, 'PULL_REQUEST_GENERATED.md');
      const prDetails =
        `# Pull Request: ${prTitle}\n\n` +
        `- Source Branch: ${currentBranch}\n` +
        `- Target Branch: ${targetBranch}\n\n` +
        editedBody;

      await fs.writeFile(prDetailsFile, prDetails);
      console.log(`PR details saved to ${prDetailsFile}`);

      console.log(
        '\nNote: This script prepared the PR information but does not submit it directly to GitHub.',
      );
      console.log('Follow the URL above to create the PR on GitHub.');
    } else {
      console.log('PR creation canceled.');
    }

    this.rl.close();
  }

  // Create a quick PR
  public async quickPR(): Promise<void> {
    // Get current branch
    const currentBranch = await this.getCurrentBranch();
    console.log(`Current branch: ${currentBranch}`);

    if (
      currentBranch === this.config.defaultBranch ||
      currentBranch === this.config.developBranch
    ) {
      console.error(
        `Error: Cannot create PR from ${currentBranch} branch. Please checkout a feature/bugfix branch.`,
      );
      this.rl.close();
      return;
    }

    // Push changes if needed
    const pushQuestion = await this.prompt('Push local changes to remote? (y/n):');
    if (pushQuestion.toLowerCase() === 'y') {
      await this.execGit(['push', '--set-upstream', 'origin', currentBranch]);
    }

    // Build PR title from branch name
    const suggestedTitle = currentBranch.replace(/-/g, ' ').replace(/\//g, ': ');

    const title = await this.prompt(`Quick PR title (default: "${suggestedTitle}"):`);
    const prTitle = title || suggestedTitle;

    const baseBranch = await this.prompt(
      `Target branch (default: "${this.config.developBranch}"):`,
    );
    const targetBranch = baseBranch || this.config.developBranch;

    const description = await this.prompt('Brief description of changes:');

    // Confirm creation
    console.log('\nQuick PR Details:');
    console.log('-----------------------------------');
    console.log(`Title: ${prTitle}`);
    console.log(`Source: ${currentBranch}`);
    console.log(`Target: ${targetBranch}`);
    console.log(`Description: ${description}`);
    console.log('-----------------------------------');

    const confirm = await this.prompt('Create quick pull request? (y/n):');

    if (confirm.toLowerCase() === 'y') {
      console.log('Creating quick pull request...');
      console.log('To create PR via GitHub, visit:');
      console.log(
        `https://github.com/[YOUR_USERNAME]/[YOUR_REPO]/compare/${targetBranch}...${currentBranch}?quick_pull=1&title=${encodeURIComponent(prTitle)}`,
      );

      // Write PR details to file
      const prDetailsFile = path.join(this.projectRoot, 'pull-request-autogen.md');
      const prDetails =
        `# Pull Request: ${prTitle}\n\n` +
        `- Source Branch: ${currentBranch}\n` +
        `- Target Branch: ${targetBranch}\n\n` +
        `## Description\n\n${description}\n\n` +
        `## Changes\n\n- Automatically generated PR from ${currentBranch}\n`;

      await fs.writeFile(prDetailsFile, prDetails);
      console.log(`Quick PR details saved to ${prDetailsFile}`);

      console.log(
        '\nNote: This script prepared the PR information but does not submit it directly to GitHub.',
      );
      console.log('Follow the URL above to create the PR on GitHub.');
    } else {
      console.log('Quick PR creation canceled.');
    }

    this.rl.close();
  }

  // Generate a changelog from git commits
  public async generateChangelog(): Promise<void> {
    const sinceDate = await this.prompt(
      'Generate changelog since date (YYYY-MM-DD, or press Enter for last tag):',
    );
    let gitLogArgs = ['log', '--pretty=format:%h - %s (%an)', '--abbrev-commit'];

    if (sinceDate) {
      gitLogArgs.push(`--since="${sinceDate}"`);
    } else {
      // Get last tag
      const lastTagResult = await this.execGit(['describe', '--tags', '--abbrev=0']);
      if (lastTagResult.success) {
        const lastTag = lastTagResult.output.trim();
        gitLogArgs.push(`${lastTag}..HEAD`);
        console.log(`Generating changelog since tag: ${lastTag}`);
      } else {
        console.log('No previous tag found, generating full changelog');
      }
    }

    const result = await this.execGit(gitLogArgs);
    if (!result.success) {
      console.error('Failed to generate changelog');
      this.rl.close();
      return;
    }

    const commits = result.output.split('\n').filter(Boolean);

    // Group by conventional commit types
    const groupedCommits: Record<string, string[]> = {};

    for (const commit of commits) {
      let type = 'other';

      for (const commitType of this.config.conventionalCommitTypes) {
        if (commit.match(new RegExp(`- ${commitType}(\\(.*\\))?:`))) {
          type = commitType;
          break;
        }
      }

      groupedCommits[type] = groupedCommits[type] || [];
      groupedCommits[type].push(commit);
    }

    // Generate markdown
    let changelog = '# Changelog\n\n';

    // Features first
    if (groupedCommits['feat']) {
      changelog += '## Features\n\n';
      for (const commit of groupedCommits['feat']) {
        changelog += `- ${commit}\n`;
      }
      changelog += '\n';
    }

    // Fixes second
    if (groupedCommits['fix']) {
      changelog += '## Bug Fixes\n\n';
      for (const commit of groupedCommits['fix']) {
        changelog += `- ${commit}\n`;
      }
      changelog += '\n';
    }

    // Other changes
    const otherTypes = Object.keys(groupedCommits).filter(
      (type) => type !== 'feat' && type !== 'fix',
    );

    for (const type of otherTypes) {
      const commits = groupedCommits[type];
      if (commits.length > 0) {
        const title =
          type === 'other' ? 'Other Changes' : type.charAt(0).toUpperCase() + type.slice(1);

        changelog += `## ${title}\n\n`;
        for (const commit of commits) {
          changelog += `- ${commit}\n`;
        }
        changelog += '\n';
      }
    }

    // Save to file
    const filename = 'CHANGELOG.md';
    await fs.writeFile(path.join(this.projectRoot, filename), changelog);
    console.log(`Changelog saved to ${filename}`);

    this.rl.close();
  }

  // Interactive mode for Git operations
  public async interactiveMode(): Promise<void> {
    console.log('H3X Git Interactive Mode');
    console.log('------------------------');
    console.log('1. Commit changes');
    console.log('2. Create pull request');
    console.log('3. Quick pull request');
    console.log('4. Generate changelog');
    console.log('5. Show status');
    console.log('6. Pull from remote');
    console.log('7. Exit');

    const choice = await this.prompt('Select an option (1-7):');

    switch (choice) {
      case '1':
        await this.createCommit();
        break;
      case '2':
        await this.createPR();
        break;
      case '3':
        await this.quickPR();
        break;
      case '4':
        await this.generateChangelog();
        break;
      case '5':
        await this.execGit(['status']);
        this.rl.close();
        break;
      case '6':
        await this.execGit(['pull']);
        this.rl.close();
        break;
      case '7':
      default:
        console.log('Exiting interactive mode');
        this.rl.close();
        break;
    }
  }
}

// Main function
async function main(): Promise<void> {
  const automation = new GitPRAutomation();
  const command = process.argv[2] || 'interactive';

  switch (command) {
    case 'commit':
      await automation.createCommit();
      break;
    case 'pr':
      await automation.createPR();
      break;
    case 'quick-pr':
      await automation.quickPR();
      break;
    case 'changelog':
      await automation.generateChangelog();
      break;
    case 'interactive':
    default:
      await automation.interactiveMode();
      break;
  }
}

// Run main function
if (require.main === module) {
  main().catch(console.error);
}

export { GitPRAutomation };
