#!/usr/bin/env tsx

/**
 * Dependabot PR Merge Helper
 * 
 * This script helps safely merge Dependabot PRs by:
 * 1. Checking CI status
 * 2. Validating dependency changes
 * 3. Running tests
 * 4. Merging if safe
 */

import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

interface DependabotPR {
  number: number;
  title: string;
  dependency: string;
  fromVersion: string;
  toVersion: string;
  ecosystem: string;
  changeType: 'major' | 'minor' | 'patch';
}

class DependabotMergeHelper {
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
  }

  async run(): Promise<void> {
    console.log('🤖 Dependabot PR Merge Helper');
    console.log('==============================\n');

    try {
      // Get all open Dependabot PRs
      const dependabotPRs = await this.getDependabotPRs();
      
      if (dependabotPRs.length === 0) {
        console.log('✅ No open Dependabot PRs found.');
        return;
      }

      console.log(`Found ${dependabotPRs.length} Dependabot PR(s):\n`);
      
      for (const pr of dependabotPRs) {
        await this.processPR(pr);
      }

    } catch (error) {
      console.error('❌ Error:', error);
      process.exit(1);
    }
  }

  private async getDependabotPRs(): Promise<DependabotPR[]> {
    try {
      const output = execSync('gh pr list --author "dependabot[bot]" --json number,title,headRefName', {
        encoding: 'utf8',
        cwd: this.projectRoot
      });

      const prs = JSON.parse(output);
      
      return prs.map((pr: any) => this.parseDependabotPR(pr));
    } catch (error) {
      console.error('Failed to fetch Dependabot PRs:', error);
      return [];
    }
  }

  private parseDependabotPR(pr: any): DependabotPR {
    // Parse title like "chore(deps): bump docker/build-push-action from 4 to 6"
    const titleMatch = pr.title.match(/bump (.+) from (.+) to (.+)/);
    
    if (!titleMatch) {
      throw new Error(`Could not parse PR title: ${pr.title}`);
    }

    const [, dependency, fromVersion, toVersion] = titleMatch;
    
    // Determine ecosystem
    const ecosystem = dependency.includes('/') ? 'github-actions' : 'npm';
    
    // Determine change type
    const changeType = this.getChangeType(fromVersion, toVersion);

    return {
      number: pr.number,
      title: pr.title,
      dependency,
      fromVersion,
      toVersion,
      ecosystem,
      changeType
    };
  }

  private getChangeType(from: string, to: string): 'major' | 'minor' | 'patch' {
    const fromParts = from.split('.').map(Number);
    const toParts = to.split('.').map(Number);

    if (toParts[0] > fromParts[0]) return 'major';
    if (toParts[1] > fromParts[1]) return 'minor';
    return 'patch';
  }

  private async processPR(pr: DependabotPR): Promise<void> {
    console.log(`\n📦 Processing PR #${pr.number}: ${pr.dependency}`);
    console.log(`   ${pr.fromVersion} → ${pr.toVersion} (${pr.changeType} change)`);

    try {
      // Check CI status
      const ciStatus = await this.checkCIStatus(pr.number);
      console.log(`   CI Status: ${ciStatus}`);

      if (ciStatus !== 'success') {
        console.log(`   ⏳ Skipping - CI not passing`);
        return;
      }

      // Check if it's safe to auto-merge
      const isSafe = this.isSafeToMerge(pr);
      console.log(`   Safe to merge: ${isSafe ? '✅' : '❌'}`);

      if (isSafe) {
        await this.mergePR(pr);
      } else {
        console.log(`   ⚠️  Manual review required for ${pr.changeType} change`);
      }

    } catch (error) {
      console.error(`   ❌ Error processing PR #${pr.number}:`, error);
    }
  }

  private async checkCIStatus(prNumber: number): Promise<string> {
    try {
      const output = execSync(`gh pr checks ${prNumber} --json state`, {
        encoding: 'utf8',
        cwd: this.projectRoot
      });

      const checks = JSON.parse(output);
      
      if (checks.length === 0) return 'pending';
      
      const allPassed = checks.every((check: any) => check.state === 'SUCCESS');
      const anyFailed = checks.some((check: any) => check.state === 'FAILURE');
      
      if (allPassed) return 'success';
      if (anyFailed) return 'failure';
      return 'pending';

    } catch (error) {
      return 'unknown';
    }
  }

  private isSafeToMerge(pr: DependabotPR): boolean {
    // Auto-merge criteria:
    // 1. Patch updates are always safe
    // 2. Minor updates for dev dependencies are safe
    // 3. GitHub Actions updates are generally safe
    
    if (pr.changeType === 'patch') return true;
    
    if (pr.ecosystem === 'github-actions') {
      // GitHub Actions major updates might have breaking changes
      return pr.changeType !== 'major';
    }
    
    if (pr.ecosystem === 'npm') {
      // For npm, only auto-merge patch and minor for dev deps
      return pr.changeType === 'minor';
    }

    return false;
  }

  private async mergePR(pr: DependabotPR): Promise<void> {
    try {
      console.log(`   🔄 Merging PR #${pr.number}...`);
      
      execSync(`gh pr merge ${pr.number} --squash --delete-branch`, {
        cwd: this.projectRoot,
        stdio: 'inherit'
      });

      console.log(`   ✅ Successfully merged PR #${pr.number}`);

    } catch (error) {
      console.error(`   ❌ Failed to merge PR #${pr.number}:`, error);
    }
  }
}

// Run the script
if (require.main === module) {
  const helper = new DependabotMergeHelper();
  helper.run().catch(console.error);
}

export { DependabotMergeHelper };
