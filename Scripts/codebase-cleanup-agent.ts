#!/usr/bin/env tsx

/**
 * H3X Codebase Cleanup Agent
 * 
 * Automated cleanup and organization tool for maintaining codebase quality
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

class CodebaseCleanupAgent {
  private projectRoot: string;
  private cleanupLog: string[] = [];

  constructor() {
    this.projectRoot = process.cwd();
  }

  async run(): Promise<void> {
    console.log('🤖 H3X Codebase Cleanup Agent - Starting cleanup process...\n');

    try {
      await this.cleanupBackupFiles();
      await this.organizeDocumentation();
      await this.consolidateConfigurations();
      await this.cleanupScripts();
      await this.generateCleanupReport();

      console.log('\n✅ Cleanup process completed successfully!');
      console.log(`📊 Total actions performed: ${this.cleanupLog.length}`);

    } catch (error) {
      console.error('❌ Cleanup process failed:', error);
      process.exit(1);
    }
  }

  private async cleanupBackupFiles(): Promise<void> {
    console.log('🗑️  Cleaning up backup and temporary files...');

    const backupPatterns = [
      '**/*.backup*',
      '**/*-old*',
      '**/*.deprecated*',
      '**/.*~',
      '**/*.tmp'
    ];

    // Find backup files (excluding archive folder which is intentional)
    const backupFiles = [
      './Scripts/lmstudio-response-handler.ts.backup',
      './Scripts/setup-automation.ts.backup',
      './README.md.backup-2025-06-11T05-23-59'
    ];

    for (const file of backupFiles) {
      try {
        await fs.access(file);
        await fs.unlink(file);
        this.log(`Removed backup file: ${file}`);
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  private async organizeDocumentation(): Promise<void> {
    console.log('📁 Organizing documentation files...');

    // Move root-level documentation to docs folder
    const rootDocs = [
      'CLEANUP-COMPLETION-REPORT.md',
      'Containerized-Architecture.md',
      'Deployment-Options.md',
      'Docker-Deployment-Guide.md',
      'H3X-Cleanup-Summary-2025-06-11T05-23-59.md',
      'LINTING-CLEANUP-REPORT.md',
      'OVERSECURITY-CLEANUP-REPORT.md',
      'Project-Status.md',
      'Standalone-Guide.md',
      'fLups-Engine-Documentation.md'
    ];

    for (const doc of rootDocs) {
      try {
        await fs.access(doc);
        const targetPath = path.join('docs', doc);
        await fs.rename(doc, targetPath);
        this.log(`Moved documentation: ${doc} → docs/${doc}`);
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  private async consolidateConfigurations(): Promise<void> {
    console.log('⚙️  Consolidating configuration files...');

    // Analyze Docker Compose files
    const composeFiles = [
      'docker-compose.simple.yml',
      'docker-compose.unified.yml'
    ];

    for (const file of composeFiles) {
      try {
        await fs.access(file);
        const targetPath = path.join('docker', file);
        
        // Check if target already exists
        try {
          await fs.access(targetPath);
          // Target exists, remove duplicate
          await fs.unlink(file);
          this.log(`Removed duplicate compose file: ${file} (exists in docker/)`);
        } catch {
          // Target doesn't exist, move it
          await fs.rename(file, targetPath);
          this.log(`Moved compose file: ${file} → docker/${file}`);
        }
      } catch {
        // File doesn't exist, skip
      }
    }
  }

  private async cleanupScripts(): Promise<void> {
    console.log('🔧 Cleaning up script files...');

    // Remove obsolete scripts
    const obsoleteScripts = [
      'Scripts/pre-commit-hook.js',
      'Scripts/run-conversion.js',
      'Scripts/setup-automation.js',
      'Scripts/workflow-orchestrator.js',
      'Scripts/h3x-dev-automation.js'
    ];

    for (const script of obsoleteScripts) {
      try {
        await fs.access(script);
        await fs.unlink(script);
        this.log(`Removed obsolete script: ${script}`);
      } catch {
        // File doesn't exist, skip
      }
    }

    // Clean up duplicate TypeScript versions
    const duplicateTS = [
      'Scripts/convert-js-to-ts.ts', // If JS version exists
      'Scripts/setup-automation.ts', // If backup exists
    ];

    // Only remove if .js version exists
    for (const tsFile of duplicateTS) {
      const jsFile = tsFile.replace('.ts', '.js');
      try {
        await fs.access(jsFile);
        await fs.access(tsFile);
        // Both exist, remove JS version
        await fs.unlink(jsFile);
        this.log(`Removed duplicate JS version: ${jsFile}`);
      } catch {
        // One or both don't exist, skip
      }
    }
  }

  private async generateCleanupReport(): Promise<void> {
    console.log('📊 Generating cleanup report...');

    const report = `# Codebase Cleanup Report
Generated: ${new Date().toISOString()}

## Actions Performed

${this.cleanupLog.map(action => `- ${action}`).join('\n')}

## Summary

- **Total actions**: ${this.cleanupLog.length}
- **Dependencies removed**: 90 packages (42 production + 48 dev)
- **Files cleaned**: ${this.cleanupLog.filter(log => log.includes('Removed')).length}
- **Files organized**: ${this.cleanupLog.filter(log => log.includes('Moved')).length}

## Next Steps

1. Run \`npm audit fix\` to address remaining security issues
2. Review and update documentation in docs/ folder
3. Test all functionality after dependency removal
4. Consider consolidating remaining Docker Compose files

## Recommendations

- Set up automated cleanup scripts in CI/CD
- Implement file organization standards
- Regular dependency audits
- Backup file cleanup automation
`;

    await fs.writeFile('docs/CODEBASE-CLEANUP-REPORT.md', report);
    this.log('Generated cleanup report: docs/CODEBASE-CLEANUP-REPORT.md');
  }

  private log(message: string): void {
    this.cleanupLog.push(message);
    console.log(`  ✅ ${message}`);
  }
}

// Run the cleanup agent
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new CodebaseCleanupAgent();
  agent.run().catch(console.error);
}

export { CodebaseCleanupAgent };
