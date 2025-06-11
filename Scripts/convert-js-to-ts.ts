#!/usr/bin/env node

/**
 * H3X JavaScript to TypeScript Conversion Tool
 * Automated conversion of JS files to TS with proper typing
 */

import { exec } from 'child_process';
import { promises as fs } from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ConversionConfig {
  sourceDir: string;
  outputDir: string;
  preserveOriginal: boolean;
  addTypes: boolean;
  updateImports: boolean;
  skipFiles: string[];
}

interface ConversionResult {
  success: boolean;
  convertedFiles: string[];
  errors: string[];
  warnings: string[];
  duration: number;
}

class JSToTSConverter {
  private config: ConversionConfig;
  private projectRoot: string;

  constructor(config: Partial<ConversionConfig> = {}) {
    this.projectRoot = process.cwd();
    this.config = {
      sourceDir: this.projectRoot,
      outputDir: this.projectRoot,
      preserveOriginal: false,
      addTypes: true,
      updateImports: true,
      skipFiles: [
        'node_modules',
        '.git',
        'dist',
        'build',
        'coverage',
        '*.min.js',
        '*.test.js',
        '*.spec.js',
      ],
      ...config,
    };
  }

  async convertProjectToTypeScript(): Promise<ConversionResult> {
    const startTime = Date.now();
    this.log('🔄 Starting JavaScript to TypeScript conversion...', 'info');

    const result: ConversionResult = {
      success: true,
      convertedFiles: [],
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      // Find all JS files
      const jsFiles = await this.findJavaScriptFiles();
      this.log(`Found ${jsFiles.length} JavaScript files to convert`, 'info');

      // Convert files
      for (const jsFile of jsFiles) {
        try {
          const converted = await this.convertFile(jsFile);
          if (converted) {
            result.convertedFiles.push(jsFile);
            this.log(`✅ Converted: ${jsFile}`, 'success');
          }
        } catch (error) {
          result.errors.push(`Failed to convert ${jsFile}: ${error}`);
          this.log(`❌ Failed to convert: ${jsFile} - ${error}`, 'error');
        }
      }

      // Update package.json if needed
      await this.updatePackageJson();

      // Create/update tsconfig.json
      await this.ensureTSConfig();

      // Update imports and references
      if (this.config.updateImports) {
        await this.updateImportsAndReferences();
      }

      result.duration = Date.now() - startTime;

      if (result.errors.length > 0) {
        result.success = false;
      }

      this.log(`🎉 Conversion completed in ${result.duration}ms`, 'success');
      this.log(`✅ Successfully converted: ${result.convertedFiles.length} files`, 'success');

      if (result.errors.length > 0) {
        this.log(`❌ Errors: ${result.errors.length}`, 'error');
      }

      return result;
    } catch (error) {
      result.success = false;
      result.errors.push(error instanceof Error ? error.message : String(error));
      result.duration = Date.now() - startTime;
      this.log(
        `❌ Conversion failed: ${error instanceof Error ? error.message : String(error)}`,
        'error',
      );
      return result;
    }
  }

  private async findJavaScriptFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.projectRoot, fullPath);

        // Skip if in skip list
        if (this.shouldSkipFile(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          // Skip if TypeScript version already exists
          const tsVersion = fullPath.replace(/\.js$/, '.ts');
          try {
            await fs.access(tsVersion);
            this.log(`⏭️ Skipping ${relativePath} - TypeScript version exists`, 'warn');
          } catch {
            files.push(fullPath);
          }
        }
      }
    };

    await scanDirectory(this.config.sourceDir);
    return files;
  }

  private shouldSkipFile(relativePath: string): boolean {
    return this.config.skipFiles.some((pattern) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(relativePath);
      }
      return relativePath.includes(pattern);
    });
  }

  private async convertFile(jsFilePath: string): Promise<boolean> {
    const content = await fs.readFile(jsFilePath, 'utf-8');
    let tsContent = content;

    // Basic conversions
    tsContent = this.addTypeAnnotations(tsContent);
    tsContent = this.updateRequireStatements(tsContent);
    tsContent = this.addInterfaceDefinitions(tsContent);
    tsContent = this.fixCommonPatterns(tsContent);

    // Generate output path
    const tsFilePath = jsFilePath.replace(/\.js$/, '.ts');

    // Write TypeScript file
    await fs.writeFile(tsFilePath, tsContent);

    // Remove original if not preserving
    if (!this.config.preserveOriginal) {
      await fs.unlink(jsFilePath);
    }

    return true;
  }

  private addTypeAnnotations(content: string): string {
    if (!this.config.addTypes) return content;

    // Add basic type annotations
    content = content.replace(/function\s+(\w+)\s*\(/g, 'function $1(');
    content = content.replace(/const\s+(\w+)\s*=\s*require\(/g, 'import $1 = require(');
    content = content.replace(/module\.exports\s*=/g, 'export =');

    // Add return type annotations for common patterns
    content = content.replace(
      /async\s+function\s+(\w+)\s*\([^)]*\)\s*{/g,
      'async function $1($&): Promise<any> {',
    );

    return content;
  }

  private updateRequireStatements(content: string): string {
    // Convert require statements to import statements
    content = content.replace(
      /const\s+(\{[^}]+\})\s*=\s*require\(['"`]([^'"`]+)['"`]\);?/g,
      "import $1 from '$2';",
    );

    content = content.replace(
      /const\s+(\w+)\s*=\s*require\(['"`]([^'"`]+)['"`]\);?/g,
      "import $1 from '$2';",
    );

    return content;
  }

  private addInterfaceDefinitions(content: string): string {
    // Add common interface definitions at the top
    const interfaces = `
// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

interface ConsoleLog {
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

`;

    // Only add if not already present
    if (!content.includes('interface ProcessEnv') && content.includes('process.env')) {
      content = interfaces + content;
    }

    return content;
  }

  private fixCommonPatterns(content: string): string {
    // Fix common JavaScript patterns for TypeScript
    content = content.replace(/console\.log\(/g, 'console.log(');
    content = content.replace(/process\.env\./g, '(process.env as ProcessEnv).');

    // Add type assertions for common patterns
    content = content.replace(/JSON\.parse\(/g, 'JSON.parse(');

    return content;
  }

  private async updatePackageJson(): Promise<void> {
    const packagePath = path.join(this.projectRoot, 'package.json');

    try {
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);

      // Update scripts to use TypeScript
      if (packageJson.scripts) {
        for (const [key, script] of Object.entries(packageJson.scripts)) {
          if (typeof script === 'string' && script.includes('node ') && script.includes('.js')) {
            packageJson.scripts[key] = script.replace(/node\s+([^.]+)\.js/g, 'npx tsx $1.ts');
          }
        }
      }

      // Add TypeScript dependencies if not present
      if (!packageJson.devDependencies) {
        packageJson.devDependencies = {};
      }

      const tsDevDeps = {
        typescript: '^5.3.0',
        tsx: '^4.7.0',
        '@types/node': '^20.11.0',
      };

      for (const [dep, version] of Object.entries(tsDevDeps)) {
        if (!packageJson.devDependencies[dep] && !packageJson.dependencies?.[dep]) {
          packageJson.devDependencies[dep] = version;
        }
      }

      await fs.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
      this.log('📦 Updated package.json with TypeScript configuration', 'info');
    } catch (error) {
      this.log(`⚠️ Could not update package.json: ${error}`, 'warn');
    }
  }

  private async ensureTSConfig(): Promise<void> {
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');

    try {
      await fs.access(tsconfigPath);
      this.log('📄 tsconfig.json already exists', 'info');
    } catch {
      const tsconfig = {
        compilerOptions: {
          target: 'ES2022',
          module: 'ESNext',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          strict: true,
          skipLibCheck: true,
          forceConsistentCasingInFileNames: true,
          resolveJsonModule: true,
          declaration: true,
          outDir: './dist',
          rootDir: './src',
          sourceMap: true,
          incremental: true,
          experimentalDecorators: true,
          emitDecoratorMetadata: true,
          types: ['node'],
        },
        include: ['src/**/*', 'scripts/**/*', '*.ts'],
        exclude: ['node_modules', 'dist', 'coverage', '**/*.test.ts', '**/*.spec.ts'],
      };

      await fs.writeFile(tsconfigPath, JSON.stringify(tsconfig, null, 2));
      this.log('📄 Created tsconfig.json', 'success');
    }
  }

  private async updateImportsAndReferences(): Promise<void> {
    this.log('🔗 Updating import statements and references...', 'info');

    // Find all TypeScript files
    const tsFiles = await this.findTypeScriptFiles();

    for (const tsFile of tsFiles) {
      try {
        let content = await fs.readFile(tsFile, 'utf-8');

        // Update relative imports from .js to .ts
        content = content.replace(/from\s+['"`]([^'"`]+)\.js['"`]/g, "from '$1.ts'");
        content = content.replace(/import\s*\(\s*['"`]([^'"`]+)\.js['"`]\s*\)/g, "import('$1.ts')");

        await fs.writeFile(tsFile, content);
      } catch (error) {
        this.log(`⚠️ Could not update imports in ${tsFile}: ${error}`, 'warn');
      }
    }
  }

  private async findTypeScriptFiles(): Promise<string[]> {
    const files: string[] = [];

    const scanDirectory = async (dir: string): Promise<void> => {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(this.projectRoot, fullPath);

        if (this.shouldSkipFile(relativePath)) {
          continue;
        }

        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    };

    await scanDirectory(this.config.sourceDir);
    return files;
  }

  private log(message: string, level: 'info' | 'warn' | 'error' | 'success' = 'info'): void {
    const colors = {
      info: '\x1b[36m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      success: '\x1b[32m',
    };
    const reset = '\x1b[0m';
    console.log(`${colors[level]}[TS-CONVERT] ${message}${reset}`);
  }
}

// CLI execution
async function main(): Promise<void> {
  const converter = new JSToTSConverter({
    preserveOriginal: process.argv.includes('--preserve'),
    addTypes: !process.argv.includes('--no-types'),
    updateImports: !process.argv.includes('--no-imports'),
  });

  try {
    const result = await converter.convertProjectToTypeScript();

    if (result.success) {
      console.log('\n✅ TypeScript conversion completed successfully!');
      console.log(`📁 Converted ${result.convertedFiles.length} files`);
      console.log(`⏱️ Duration: ${result.duration}ms`);
      process.exit(0);
    } else {
      console.error('\n❌ TypeScript conversion failed!');
      result.errors.forEach((error) => console.error(`  ${error}`));
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Conversion failed: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url.endsWith('convert-js-to-ts.ts')) {
  main();
}

export { JSToTSConverter };
