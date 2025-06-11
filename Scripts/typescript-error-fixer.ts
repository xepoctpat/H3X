#!/usr/bin/env node
/**
 * H3X TypeScript Error Fix Automation
 * Automatically fixes common TypeScript errors in the codebase
 */

import * as fs from 'fs';
import * as path from 'path';

interface ErrorPattern {
  pattern: RegExp;
  fix: (match: string, filePath: string) => string;
  description: string;
}

class TypeScriptErrorFixer {
  private errorPatterns: ErrorPattern[] = [
    // Unknown error type fix
    {
      pattern: /error\.message/g,
      fix: (match, filePath) => 'error instanceof Error ? error.message : String(error)',
      description: 'Fix unknown error type',
    },
    // Parameter type annotations
    {
      pattern: /function\s+(\w+)\s*\(([^)]*)\)/g,
      fix: (match, filePath) => {
        const funcMatch = match.match(/function\s+(\w+)\s*\(([^)]*)\)/);
        if (!funcMatch) return match;
        
        const [, funcName, params] = funcMatch;
        const typedParams = this.addParameterTypes(params);
        return `function ${funcName}(${typedParams})`;
      },
      description: 'Add parameter type annotations',
    },
    // Nullish coalescing operator fix
    {
      pattern: /(\w+)\s*\|\|\s*([^;]+)/g,
      fix: (match, filePath) => {
        const nullishMatch = match.match(/(\w+)\s*\|\|\s*([^;]+)/);
        if (!nullishMatch) return match;
        
        const [, variable, defaultValue] = nullishMatch;
        return `${variable} ?? ${defaultValue}`;
      },
      description: 'Replace || with ?? operator',
    },
  ];

  private addParameterTypes(params: string): string {
    if (!params.trim()) return params;
    
    return params.split(',').map(param => {
      const trimmedParam = param.trim();
      if (trimmedParam.includes(':')) return trimmedParam; // Already typed
      
      // Common parameter name patterns and their types
      const typeMap: { [key: string]: string } = {
        'message': 'string',
        'text': 'string',
        'name': 'string',
        'path': 'string',
        'filePath': 'string',
        'dirPath': 'string',
        'oldPath': 'string',
        'newPath': 'string',
        'content': 'string',
        'data': 'any',
        'options': 'any',
        'config': 'any',
        'context': 'any',
        'error': 'unknown',
        'result': 'any',
      };
      
      // Extract parameter name (handle default values)
      const paramName = trimmedParam.split('=')[0].trim();
      const defaultPart = trimmedParam.includes('=') ? trimmedParam.split('=')[1] : '';
      
      const inferredType = typeMap[paramName] || 'any';
      return defaultPart ? `${paramName}: ${inferredType} = ${defaultPart}` : `${paramName}: ${inferredType}`;
    }).join(', ');
  }

  async fixFile(filePath: string): Promise<boolean> {
    try {
      console.log(`🔧 Fixing: ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      let modified = false;
      
      for (const errorPattern of this.errorPatterns) {
        const originalContent = content;
        content = content.replace(errorPattern.pattern, (match) => {
          const fixed = errorPattern.fix(match, filePath);
          if (fixed !== match) {
            modified = true;
            console.log(`  ✅ ${errorPattern.description}: ${match} → ${fixed}`);
          }
          return fixed;
        });
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  📝 Updated: ${filePath}`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`❌ Error fixing ${filePath}:`, error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  async fixDirectory(dirPath: string): Promise<void> {
    const files = this.getTypeScriptFiles(dirPath);
    let fixedCount = 0;
    
    console.log(`🔍 Found ${files.length} TypeScript files to check...`);
    
    for (const file of files) {
      const wasFixed = await this.fixFile(file);
      if (wasFixed) fixedCount++;
    }
    
    console.log(`\n✨ Fixed ${fixedCount}/${files.length} files`);
  }

  private getTypeScriptFiles(dirPath: string): string[] {
    const files: string[] = [];
    
    const traverse = (currentPath: string) => {
      const items = fs.readdirSync(currentPath);
      
      for (const item of items) {
        const itemPath = path.join(currentPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
          traverse(itemPath);
        } else if (stat.isFile() && (item.endsWith('.ts') || item.endsWith('.tsx'))) {
          files.push(itemPath);
        }
      }
    };
    
    traverse(dirPath);
    return files;
  }

  private shouldSkipDirectory(dirName: string): boolean {
    return [
      'node_modules',
      'dist',
      'coverage',
      '.git',
      'archive',
    ].includes(dirName);
  }
}

// Main execution
async function main(): Promise<void> {
  console.log('🚀 H3X TypeScript Error Fixer\n');
  
  const fixer = new TypeScriptErrorFixer();
  const targetDirs = ['./src', './scripts', './tests'];
  
  for (const dir of targetDirs) {
    if (fs.existsSync(dir)) {
      console.log(`\n📁 Processing directory: ${dir}`);
      await fixer.fixDirectory(dir);
    }
  }
  
  console.log('\n🎉 TypeScript error fixing complete!');
  console.log('📋 Next steps:');
  console.log('1. Run: npm run type-check');
  console.log('2. Review changes: git diff');
  console.log('3. Test: npm run test:all');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('❌ Script failed:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
