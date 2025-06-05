#!/usr/bin/env tsx

/**
 * TypeScript Error Fixing Tool
 * Fixes common TypeScript conversion errors in the H3X project
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { glob } from 'glob';
import type { IOptions as GlobOptions } from 'glob';

interface FixResult {
  file: string;
  fixesApplied: string[];
  success: boolean;
  error?: string;
}

class TypeScriptErrorFixer {
  private fixCount = 0;
  private processedFiles = 0;

  /**
   * Fix common TypeScript errors in a file
   */
  async fixFile(filePath: string): Promise<FixResult> {
    const result: FixResult = {
      file: filePath,
      fixesApplied: [],
      success: false,
    };

    try {
      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;

      // Fix 1: Duplicate async function declarations
      const duplicateFunctionRegex =
        /async function (\w+)\(async function \1\([^)]*\) \{\)\: Promise<any> \{/g;
      if (duplicateFunctionRegex.test(content)) {
        content = content.replace(duplicateFunctionRegex, 'async function $1($2): Promise<any> {');
        result.fixesApplied.push('Fixed duplicate async function declarations');
      }

      // Fix 2: Import statements with misplaced semicolons
      const importRegex = /import (\w+) = require\('([^']+)'\)\.([^;]+);/g;
      if (importRegex.test(content)) {
        content = content.replace(importRegex, "import $1 from '$2';\nconst $1Promises = $1.$3;");
        result.fixesApplied.push('Fixed import statements');
      }

      // Fix 3: Simple async function declaration fixes
      const simpleAsyncFunctionRegex =
        /async function (\w+)\(async function \1\(\) \{\)\: Promise<any> \{/g;
      if (simpleAsyncFunctionRegex.test(content)) {
        content = content.replace(simpleAsyncFunctionRegex, 'async function $1(): Promise<any> {');
        result.fixesApplied.push('Fixed simple async function declarations');
      }

      // Fix 4: Function parameter issues
      const parameterFunctionRegex =
        /async function (\w+)\(async function \1\(([^)]+)\) \{\)\: Promise<any> \{/g;
      if (parameterFunctionRegex.test(content)) {
        content = content.replace(parameterFunctionRegex, 'async function $1($2): Promise<any> {');
        result.fixesApplied.push('Fixed function parameters');
      }

      // Fix 5: Console type assertion issues
      content = content.replace(/\(console as ConsoleLog\)/g, 'console');
      if (
        content !== originalContent &&
        !result.fixesApplied.includes('Fixed console type assertions')
      ) {
        result.fixesApplied.push('Fixed console type assertions');
      }

      // Fix 6: Switch statement syntax issues
      const switchRegex = /switch \(([^)]+)\)\s*\{\s*\}\s*\{/g;
      if (switchRegex.test(content)) {
        content = content.replace(switchRegex, 'switch ($1) {');
        result.fixesApplied.push('Fixed switch statement syntax');
      }

      // Fix 7: Property assignment issues in objects
      const propertyRegex = /(\w+)\s*:\s*([^,}]+),\s*(\w+)\s*\(/g;
      content = content.replace(propertyRegex, '$1: $2,\n    $3(');

      // Fix 8: Try-catch block fixes
      const tryCatchRegex = /\}\s*catch\s*\(([^)]+)\)\s*\{/g;
      content = content.replace(tryCatchRegex, '} catch ($1) {');

      // Fix 9: Template literal issues in function calls
      const templateLiteralRegex = /`([^`]*)\$\{([^}]+)\}([^`]*)`/g;
      // This one is more complex and might need manual review

      // Fix 10: Return statement fixes
      const returnRegex = /return\s*\{([^}]+)\}\s*;/g;
      content = content.replace(returnRegex, 'return {\n    $1\n  };');

      // Write back if changes were made
      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf-8');
        result.success = true;
        this.fixCount += result.fixesApplied.length;
      } else {
        result.success = true;
      }

      this.processedFiles++;
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  /**
   * Fix specific patterns based on the error analysis
   */
  async fixSpecificPatterns(filePath: string): Promise<FixResult> {
    const result: FixResult = {
      file: filePath,
      fixesApplied: [],
      success: false,
    };

    try {
      let content = await fs.readFile(filePath, 'utf-8');
      const originalContent = content;

      // Pattern 1: Fix the main function declaration issue
      const mainFunctionPattern =
        /async function main\(async function main\(\) \{\)\: Promise<any> \{/g;
      if (mainFunctionPattern.test(content)) {
        content = content.replace(mainFunctionPattern, 'async function main(): Promise<any> {');
        result.fixesApplied.push('Fixed main function declaration');
      }

      // Pattern 2: Fix import fs statements
      const fsImportPattern = /import fs = require\('fs'\)\.promises;/g;
      if (fsImportPattern.test(content)) {
        content = content.replace(fsImportPattern, "import * as fs from 'fs/promises';");
        result.fixesApplied.push('Fixed fs import statement');
      }

      // Pattern 3: Fix require statements
      const requirePattern = /import (\w+) = require\('([^']+)'\);/g;
      if (requirePattern.test(content)) {
        content = content.replace(requirePattern, "import $1 from '$2';");
        result.fixesApplied.push('Fixed require statements');
      }

      // Pattern 4: Fix function with parameters
      const paramFunctionPattern =
        /async function (\w+)\(async function \1\(([^)]*)\) \{\)\: Promise<any> \{/g;
      if (paramFunctionPattern.test(content)) {
        content = content.replace(paramFunctionPattern, 'async function $1($2): Promise<any> {');
        result.fixesApplied.push('Fixed function with parameters');
      }

      // Pattern 5: Fix multi-line template literals that got broken
      const brokenTemplatePattern = /const (\w+) = `([^`]*)\n([^`]*)`(\s*;)?/g;
      content = content.replace(brokenTemplatePattern, 'const $1 = `$2\n$3`$4');

      // Pattern 6: Fix switch cases
      const switchCasePattern = /case\s+'([^']+)'\s*:/g;
      content = content.replace(switchCasePattern, "case '$1':");

      // Pattern 7: Fix broken object literals
      const objectLiteralPattern = /\{\s*([^:]+):\s*([^,}]+),\s*\}/g;
      content = content.replace(objectLiteralPattern, '{ $1: $2 }');

      if (content !== originalContent) {
        await fs.writeFile(filePath, content, 'utf-8');
        result.success = true;
        this.fixCount += result.fixesApplied.length;
      } else {
        result.success = true;
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  /**
   * Process all TypeScript files in the project
   */
  async fixAllFiles(): Promise<void> {
    console.log('🔧 Starting TypeScript error fixing...\n');

    const files = await glob('**/*.ts', {
      cwd: process.cwd(),
      ignore: ['node_modules/**', 'dist/**', '*.d.ts'],
      absolute: false,
    } as GlobOptions);

    // Ensure we have an array of files to iterate
    const fileList = Array.isArray(files) ? files : [await Promise.resolve(files)].flat();
    console.log(`Found ${fileList.length} TypeScript files to process\n`);

    const results: FixResult[] = [];

    for (const file of fileList) {
      const filePath = path.resolve(file);
      console.log(`Processing: ${file}`);

      // Apply specific pattern fixes first
      const specificResult = await this.fixSpecificPatterns(filePath);
      results.push(specificResult);

      // Then apply general fixes
      const generalResult = await this.fixFile(filePath);
      if (generalResult.fixesApplied.length > 0) {
        specificResult.fixesApplied.push(...generalResult.fixesApplied);
      }

      if (specificResult.fixesApplied.length > 0) {
        console.log(`  ✅ Applied ${specificResult.fixesApplied.length} fixes`);
        specificResult.fixesApplied.forEach((fix) => console.log(`     - ${fix}`));
      }

      if (specificResult.error) {
        console.log(`  ❌ Error: ${specificResult.error}`);
      }
    }

    // Summary
    console.log('\n📊 Fix Summary:');
    console.log(`Files processed: ${this.processedFiles}`);
    console.log(`Total fixes applied: ${this.fixCount}`);

    const successfulFiles = results.filter((r) => r.success).length;
    const failedFiles = results.filter((r) => !r.success).length;

    console.log(`Successful: ${successfulFiles}`);
    console.log(`Failed: ${failedFiles}`);

    if (failedFiles > 0) {
      console.log('\n❌ Files with errors:');
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          console.log(`  - ${r.file}: ${r.error}`);
        });
    }
  }

  /**
   * Fix specific files that had the most errors
   */
  async fixHighPriorityFiles(): Promise<void> {
    const highPriorityFiles = [
      'scripts/docker-lmstudio-integration.ts',
      'scripts/h3x-automation.ts',
      'scripts/npm-lmstudio-integration.ts',
      'src/tools/humanSupervisionTool.ts',
      'src/tools/monitoringTool.ts',
      'test-generators.ts',
    ];

    console.log('🎯 Fixing high-priority files with manual corrections...\n');

    for (const file of highPriorityFiles) {
      const filePath = path.resolve(file);
      if (
        await fs
          .access(filePath)
          .then(() => true)
          .catch(() => false)
      ) {
        console.log(`Processing high-priority file: ${file}`);
        await this.fixComplexFile(filePath);
      }
    }
  }

  /**
   * Apply complex fixes for files with severe syntax issues
   */
  async fixComplexFile(filePath: string): Promise<void> {
    try {
      let content = await fs.readFile(filePath, 'utf-8');

      // For files with severe template literal issues, we need more aggressive fixes
      if (filePath.includes('docker-lmstudio-integration.ts')) {
        content = await this.fixDockerIntegrationFile(content);
      }

      await fs.writeFile(filePath, content, 'utf-8');
      console.log(`  ✅ Applied complex fixes to ${path.basename(filePath)}`);
    } catch (error) {
      console.log(`  ❌ Failed to fix ${path.basename(filePath)}: ${error}`);
    }
  }

  /**
   * Fix the docker integration file specifically
   */
  async fixDockerIntegrationFile(content: string): Promise<string> {
    // This file has complex multi-line template literals that got corrupted
    // We need to reconstruct the template literals properly

    // Fix the main function declaration
    content = content.replace(
      /async function main\(async function main\(\) \{\)\: Promise<any> \{/g,
      'async function main(): Promise<any> {',
    );

    // Fix fs import
    content = content.replace(
      /import fs = require\('fs'\)\.promises;/g,
      "import * as fs from 'fs/promises';",
    );

    // More aggressive template literal fixes would go here
    // But this might require manual review for this specific file

    return content;
  }
}

// Main execution
async function main(): Promise<void> {
  const fixer = new TypeScriptErrorFixer();

  try {
    // First, fix all files with general patterns
    await fixer.fixAllFiles();

    // Then, apply specific fixes for high-priority files
    await fixer.fixHighPriorityFiles();

    console.log('\n🎉 TypeScript error fixing completed!');
    console.log('\nNext steps:');
    console.log('1. Run "npm run type-check" to verify fixes');
    console.log('2. Manual review may be needed for complex template literals');
    console.log('3. Test the application to ensure functionality is preserved');
  } catch (error) {
    console.error('❌ Error during fixing process:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { TypeScriptErrorFixer };
