#!/usr/bin/env npx tsx
/**
 * H3X Legacy JavaScript Cleanup Script
 * Safely archives JavaScript files that have been converted to TypeScript
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

interface CleanupResult {
  archived: string[];
  skipped: string[];
  errors: string[];
}

class LegacyCleanup {
  private readonly projectRoot: string;
  private readonly archiveDir: string;
  private readonly result: CleanupResult;

  constructor() {
    this.projectRoot = process.cwd();
    this.archiveDir = path.join(this.projectRoot, 'archive', 'legacy-js-files');
    this.result = {
      archived: [],
      skipped: [],
      errors: [],
    };
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: '🔧',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    }[type];

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  async ensureArchiveDirectory(): Promise<void> {
    try {
      await mkdir(this.archiveDir, { recursive: true });
      this.log('Archive directory created', 'success');
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }
  }

  private hasTypeScriptEquivalent(jsFilePath: string): boolean {
    const tsFilePath = jsFilePath.replace(/\.js$/, '.ts');
    return fs.existsSync(tsFilePath);
  }

  private isTestFile(filePath: string): boolean {
    return /\.(test|spec)\.js$/.test(filePath);
  }

  private isConfigFile(filePath: string): boolean {
    const fileName = path.basename(filePath);
    const configPatterns = [
      /^jest\.config\.js$/,
      /^webpack\.config\.js$/,
      /^vite\.config\.js$/,
      /^babel\.config\.js$/,
      /^rollup\.config\.js$/,
      /^tailwind\.config\.js$/,
      /^postcss\.config\.js$/,
    ];

    return configPatterns.some((pattern) => pattern.test(fileName));
  }

  private shouldSkipFile(filePath: string): boolean {
    const fileName = path.basename(filePath);
    const skipPatterns = [/node_modules/, /dist/, /build/, /coverage/, /\.git/, /archive/];

    // Skip if file is in a directory we should ignore
    if (skipPatterns.some((pattern) => pattern.test(filePath))) {
      return true;
    }

    // Skip if it's a config file
    if (this.isConfigFile(filePath)) {
      return true;
    }

    // Skip if it doesn't have a TypeScript equivalent
    if (!this.hasTypeScriptEquivalent(filePath)) {
      return true;
    }

    return false;
  }

  async findJavaScriptFiles(dir: string = this.projectRoot): Promise<string[]> {
    const jsFiles: string[] = [];

    try {
      const entries = await readdir(dir);

      for (const entry of entries) {
        const fullPath = path.join(dir, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          // Skip certain directories
          if (!['node_modules', 'dist', 'build', 'coverage', '.git'].includes(entry)) {
            jsFiles.push(...(await this.findJavaScriptFiles(fullPath)));
          }
        } else if (entry.endsWith('.js') && !this.shouldSkipFile(fullPath)) {
          jsFiles.push(fullPath);
        }
      }
    } catch (error: any) {
      this.log(`Error reading directory ${dir}: ${error.message}`, 'error');
    }

    return jsFiles;
  }

  async archiveFile(jsFilePath: string): Promise<void> {
    try {
      const relativePath = path.relative(this.projectRoot, jsFilePath);
      const archivePath = path.join(this.archiveDir, relativePath);
      const archiveParentDir = path.dirname(archivePath);

      // Ensure the archive directory structure exists
      await mkdir(archiveParentDir, { recursive: true });

      // Copy the file to archive
      await copyFile(jsFilePath, archivePath);

      // Create a metadata file
      const metadataPath = archivePath + '.metadata.json';
      const metadata = {
        originalPath: jsFilePath,
        archivedAt: new Date().toISOString(),
        reason: 'Replaced by TypeScript equivalent',
        typeScriptEquivalent: jsFilePath.replace(/\.js$/, '.ts'),
      };

      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // Remove the original file
      fs.unlinkSync(jsFilePath);

      this.result.archived.push(relativePath);
      this.log(`Archived: ${relativePath}`, 'success');
    } catch (error: any) {
      this.result.errors.push(`${jsFilePath}: ${error.message}`);
      this.log(`Failed to archive ${jsFilePath}: ${error.message}`, 'error');
    }
  }

  async performCleanup(dryRun: boolean = false): Promise<CleanupResult> {
    this.log('Starting legacy JavaScript cleanup...', 'info');

    if (!dryRun) {
      await this.ensureArchiveDirectory();
    }

    const jsFiles = await this.findJavaScriptFiles();
    this.log(`Found ${jsFiles.length} JavaScript files to process`, 'info');

    for (const jsFile of jsFiles) {
      const relativePath = path.relative(this.projectRoot, jsFile);

      if (this.shouldSkipFile(jsFile)) {
        this.result.skipped.push(relativePath);
        this.log(`Skipped: ${relativePath} (no TS equivalent or config file)`, 'warning');
        continue;
      }

      if (dryRun) {
        this.result.archived.push(relativePath);
        this.log(`Would archive: ${relativePath}`, 'info');
      } else {
        await this.archiveFile(jsFile);
      }
    }

    this.generateReport();
    return this.result;
  }

  private generateReport(): void {
    this.log('\\n=== Cleanup Report ===', 'info');
    this.log(`Files archived: ${this.result.archived.length}`, 'success');
    this.log(`Files skipped: ${this.result.skipped.length}`, 'warning');
    this.log(
      `Errors: ${this.result.errors.length}`,
      this.result.errors.length > 0 ? 'error' : 'info',
    );

    if (this.result.archived.length > 0) {
      this.log('\\nArchived files:', 'info');
      this.result.archived.forEach((file) => console.log(`  - ${file}`));
    }

    if (this.result.errors.length > 0) {
      this.log('\\nErrors:', 'error');
      this.result.errors.forEach((error) => console.log(`  - ${error}`));
    }

    // Save detailed report
    const reportPath = path.join(this.projectRoot, 'archive', 'legacy-cleanup-report.json');
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalProcessed: this.result.archived.length + this.result.skipped.length,
        archived: this.result.archived.length,
        skipped: this.result.skipped.length,
        errors: this.result.errors.length,
      },
      details: this.result,
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    this.log(`Detailed report saved to: ${reportPath}`, 'info');
  }
}

// CLI Interface
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run') || args.includes('-n');
  const force = args.includes('--force') || args.includes('-f');

  if (!force && !dryRun) {
    console.log(
      '\\n⚠️  This script will archive JavaScript files that have TypeScript equivalents.',
    );
    console.log('   Run with --dry-run to see what would be archived.');
    console.log('   Run with --force to perform the actual cleanup.');
    console.log('   Example: npx tsx scripts/legacy-cleanup.ts --dry-run\\n');
    process.exit(1);
  }

  const cleanup = new LegacyCleanup();
  const result = await cleanup.performCleanup(dryRun);

  if (dryRun) {
    console.log('\\n🔍 Dry run completed. Use --force to perform actual cleanup.');
  } else {
    console.log('\\n✅ Legacy cleanup completed successfully.');
  }
}

// Check if script is run directly
const isMainModule = process.argv[1] && process.argv[1].includes('legacy-cleanup');

if (isMainModule) {
  main().catch((error) => {
    console.error('❌ Legacy cleanup failed:', error);
    process.exit(1);
  });
}

export default LegacyCleanup;
