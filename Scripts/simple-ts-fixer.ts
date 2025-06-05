#!/usr/bin/env tsx

/**
 * TypeScript Error Fixing Tool - Simple Version
 * Fixes common TypeScript conversion errors in the H3X project
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { execSync } from 'child_process';

class SimpleTypeScriptFixer {
  private fixCount = 0;

  async fixFile(filePath: string): Promise<number> {
    try {
      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;
      let localFixes = 0;

      // Fix 1: Duplicate async function declarations (most common issue)
      const duplicateFunctionRegex =
        /async function (\w+)\(async function \1\(([^)]*)\) \{\)\: Promise<any> \{/g;
      const matches = content.match(duplicateFunctionRegex);
      if (matches) {
        content = content.replace(duplicateFunctionRegex, 'async function $1($2): Promise<any> {');
        localFixes++;
        console.log(`  Fixed duplicate function declaration in ${path.basename(filePath)}`);
      }

      // Fix 2: Simple async function without parameters
      const simpleFunctionRegex =
        /async function (\w+)\(async function \1\(\) \{\)\: Promise<any> \{/g;
      if (simpleFunctionRegex.test(content)) {
        content = content.replace(simpleFunctionRegex, 'async function $1(): Promise<any> {');
        localFixes++;
        console.log(`  Fixed simple function declaration in ${path.basename(filePath)}`);
      }

      // Fix 3: Import fs statements
      const fsImportRegex = /import fs = require\('fs'\)\.promises;/g;
      if (fsImportRegex.test(content)) {
        content = content.replace(fsImportRegex, "import * as fs from 'fs/promises';");
        localFixes++;
        console.log(`  Fixed fs import in ${path.basename(filePath)}`);
      }

      // Fix 4: Console type assertions
      const consoleRegex = /\(console as ConsoleLog\)/g;
      if (consoleRegex.test(content)) {
        content = content.replace(consoleRegex, 'console');
        localFixes++;
        console.log(`  Fixed console assertions in ${path.basename(filePath)}`);
      }

      // Fix 5: require.main === module check
      const requireMainRegex = /if \(require\.main === module\) \{/g;
      if (requireMainRegex.test(content)) {
        content = content.replace(
          requireMainRegex,
          'if (import.meta.url === `file://${process.argv[1]}`) {',
        );
        localFixes++;
        console.log(`  Fixed require.main check in ${path.basename(filePath)}`);
      }

      // Write back if changes were made
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf-8');
        this.fixCount += localFixes;
        return localFixes;
      }

      return 0;
    } catch (error) {
      console.log(`❌ Error processing ${filePath}: ${error}`);
      return 0;
    }
  }

  async fixAllFiles(): Promise<void> {
    console.log('🔧 Starting simple TypeScript error fixing...\n');

    try {
      // Get all .ts files (using shell command since glob is having issues)
      const command =
        process.platform === 'win32'
          ? 'Get-ChildItem -Path . -Filter "*.ts" -Recurse | Where-Object { $_.Directory.Name -ne "node_modules" -and $_.Directory.Name -ne "dist" } | ForEach-Object { $_.FullName }'
          : 'find . -name "*.ts" -not -path "./node_modules/*" -not -path "./dist/*"';

      const output = execSync(command, { encoding: 'utf-8', shell: 'pwsh.exe' });
      const files = output
        .trim()
        .split('\n')
        .filter((f) => f.trim() && !f.includes('node_modules'));

      console.log(`Found ${files.length} TypeScript files to process\n`);

      let totalFixes = 0;
      for (const file of files) {
        const filePath = file.trim();
        if (
          filePath &&
          (await fs
            .access(filePath)
            .then(() => true)
            .catch(() => false))
        ) {
          const fixes = await this.fixFile(filePath);
          totalFixes += fixes;
        }
      }

      console.log(`\n📊 Summary: Applied ${totalFixes} fixes across ${files.length} files`);
    } catch (error) {
      console.error('❌ Error during file discovery:', error);
    }
  }

  async fixSpecificFiles(): Promise<void> {
    console.log('🎯 Fixing specific problematic files...\n');

    const problemFiles = [
      'scripts/docker-lmstudio-integration.ts',
      'scripts/h3x-automation.ts',
      'scripts/npm-lmstudio-integration.ts',
      'scripts/health-check.ts',
      'src/tools/humanSupervisionTool.ts',
      'src/tools/monitoringTool.ts',
      'test-generators.ts',
      'test-integration.ts',
    ];

    for (const file of problemFiles) {
      const fullPath = path.resolve(file);
      try {
        await fs.access(fullPath);
        console.log(`Processing: ${file}`);
        const fixes = await this.fixFile(fullPath);
        console.log(`  Applied ${fixes} fixes\n`);
      } catch (error) {
        console.log(`  File not found: ${file}\n`);
      }
    }
  }
}

// Main execution
async function main(): Promise<void> {
  const fixer = new SimpleTypeScriptFixer();

  try {
    await fixer.fixSpecificFiles();
    await fixer.fixAllFiles();

    console.log('\n🎉 Simple TypeScript error fixing completed!');
    console.log('\nRunning type check to see remaining issues...\n');
  } catch (error) {
    console.error('❌ Error during fixing process:', error);
    process.exit(1);
  }
}

main();
