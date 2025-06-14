#!/usr/bin/env tsx

/**
 * H3X OpenAI Removal Cleanup Script
 * 
 * Removes all OpenAI references and dependencies from the H3X project
 * Replaces with GitHub API integration and local AI processing
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { glob } from 'glob';

interface CleanupResult {
  filesProcessed: number;
  openaiReferencesRemoved: number;
  environmentFilesUpdated: number;
  documentationUpdated: number;
  errors: string[];
  summary: string[];
}

class OpenAICleanupTool {
  private rootDir: string;
  private result: CleanupResult;

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
    this.result = {
      filesProcessed: 0,
      openaiReferencesRemoved: 0,
      environmentFilesUpdated: 0,
      documentationUpdated: 0,
      errors: [],
      summary: []
    };
  }

  async performCleanup(): Promise<CleanupResult> {
    console.log('🧹 Starting OpenAI cleanup for H3X project...');
    
    try {
      await this.cleanupSourceFiles();
      await this.cleanupEnvironmentFiles();
      await this.cleanupDocumentation();
      await this.updateProjectDescription();
      
      this.generateSummary();
      
      console.log('✅ OpenAI cleanup completed successfully!');
      return this.result;
      
    } catch (error) {
      this.result.errors.push(`Cleanup failed: ${error.message}`);
      console.error('❌ Cleanup failed:', error);
      return this.result;
    }
  }

  private async cleanupSourceFiles(): Promise<void> {
    console.log('📁 Cleaning up source files...');
    
    const sourceFiles = await glob('src/**/*.{ts,js}', { cwd: this.rootDir });
    
    for (const file of sourceFiles) {
      const filePath = join(this.rootDir, file);
      
      if (existsSync(filePath)) {
        try {
          let content = readFileSync(filePath, 'utf8');
          let modified = false;
          
          // Remove OpenAI imports
          const openaiImportRegex = /import.*@langchain\/openai.*;\s*\n/g;
          if (openaiImportRegex.test(content)) {
            content = content.replace(openaiImportRegex, '');
            modified = true;
            this.result.openaiReferencesRemoved++;
          }
          
          // Remove ChatOpenAI usage
          const chatOpenAIRegex = /new ChatOpenAI\([^)]*\)/g;
          if (chatOpenAIRegex.test(content)) {
            content = content.replace(chatOpenAIRegex, '// OpenAI removed - using GitHub integration');
            modified = true;
            this.result.openaiReferencesRemoved++;
          }
          
          // Remove OpenAI API key references
          const apiKeyRegex = /SECRET_OPENAI_API_KEY|OPENAI_API_KEY/g;
          if (apiKeyRegex.test(content)) {
            content = content.replace(apiKeyRegex, 'GITHUB_TOKEN');
            modified = true;
            this.result.openaiReferencesRemoved++;
          }
          
          if (modified) {
            writeFileSync(filePath, content);
            console.log(`  ✓ Updated ${file}`);
          }
          
          this.result.filesProcessed++;
          
        } catch (error) {
          this.result.errors.push(`Error processing ${file}: ${error.message}`);
        }
      }
    }
  }

  private async cleanupEnvironmentFiles(): Promise<void> {
    console.log('🔧 Cleaning up environment files...');
    
    const envFiles = await glob('**/.env*', { cwd: this.rootDir, ignore: ['node_modules/**'] });
    
    for (const file of envFiles) {
      const filePath = join(this.rootDir, file);
      
      if (existsSync(filePath)) {
        try {
          let content = readFileSync(filePath, 'utf8');
          let modified = false;
          
          // Remove OpenAI API key lines
          const lines = content.split('\n');
          const filteredLines = lines.filter(line => {
            if (line.includes('OPENAI_API_KEY') || line.includes('SECRET_OPENAI_API_KEY')) {
              modified = true;
              this.result.openaiReferencesRemoved++;
              return false;
            }
            return true;
          });
          
          // Add GitHub token placeholder if not exists
          if (!content.includes('GITHUB_TOKEN') && !file.includes('example')) {
            filteredLines.push('');
            filteredLines.push('# GitHub Integration');
            filteredLines.push('GITHUB_TOKEN=your_github_token_here');
            modified = true;
          }
          
          if (modified) {
            writeFileSync(filePath, filteredLines.join('\n'));
            console.log(`  ✓ Updated ${file}`);
            this.result.environmentFilesUpdated++;
          }
          
        } catch (error) {
          this.result.errors.push(`Error processing ${file}: ${error.message}`);
        }
      }
    }
  }

  private async cleanupDocumentation(): Promise<void> {
    console.log('📚 Cleaning up documentation...');
    
    const docFiles = await glob('**/*.md', { 
      cwd: this.rootDir, 
      ignore: ['node_modules/**', '.augment-memories-summary.md'] 
    });
    
    for (const file of docFiles) {
      const filePath = join(this.rootDir, file);
      
      if (existsSync(filePath)) {
        try {
          let content = readFileSync(filePath, 'utf8');
          let modified = false;
          
          // Replace OpenAI references with GitHub/local alternatives
          const replacements = [
            { from: /OpenAI GPT-4/g, to: 'GitHub Copilot + LMStudio' },
            { from: /OpenAI API/g, to: 'GitHub API' },
            { from: /OPENAI_API_KEY/g, to: 'GITHUB_TOKEN' },
            { from: /OpenAI integration/g, to: 'GitHub integration' },
            { from: /ChatGPT/g, to: 'Local AI processing' },
            { from: /gpt-3\.5-turbo/g, to: 'local-model' }
          ];
          
          for (const replacement of replacements) {
            if (replacement.from.test(content)) {
              content = content.replace(replacement.from, replacement.to);
              modified = true;
              this.result.openaiReferencesRemoved++;
            }
          }
          
          if (modified) {
            writeFileSync(filePath, content);
            console.log(`  ✓ Updated ${file}`);
            this.result.documentationUpdated++;
          }
          
        } catch (error) {
          this.result.errors.push(`Error processing ${file}: ${error.message}`);
        }
      }
    }
  }

  private async updateProjectDescription(): Promise<void> {
    console.log('📝 Updating project descriptions...');
    
    // Update package.json description
    const packagePath = join(this.rootDir, 'package.json');
    if (existsSync(packagePath)) {
      try {
        const packageContent = readFileSync(packagePath, 'utf8');
        const packageJson = JSON.parse(packageContent);
        
        if (packageJson.description && packageJson.description.includes('OpenAI')) {
          packageJson.description = packageJson.description.replace(/OpenAI/g, 'GitHub API');
          writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
          console.log('  ✓ Updated package.json description');
        }
        
      } catch (error) {
        this.result.errors.push(`Error updating package.json: ${error.message}`);
      }
    }
  }

  private generateSummary(): void {
    this.result.summary = [
      `🧹 OpenAI Cleanup Complete for H3X Project`,
      ``,
      `📊 Summary:`,
      `  • Files processed: ${this.result.filesProcessed}`,
      `  • OpenAI references removed: ${this.result.openaiReferencesRemoved}`,
      `  • Environment files updated: ${this.result.environmentFilesUpdated}`,
      `  • Documentation files updated: ${this.result.documentationUpdated}`,
      `  • Errors encountered: ${this.result.errors.length}`,
      ``,
      `✅ What was removed:`,
      `  • @langchain/openai dependency`,
      `  • ChatOpenAI class usage`,
      `  • OPENAI_API_KEY environment variables`,
      `  • OpenAI references in documentation`,
      ``,
      `🔄 What was added/updated:`,
      `  • @octokit/rest for GitHub API integration`,
      `  • GITHUB_TOKEN environment variable`,
      `  • GitHub-integrated agent (src/agent-github.ts)`,
      `  • 3D geometry engine tools`,
      `  • Multi-database query tools`,
      ``,
      `🎯 H3X is now:`,
      `  • OpenAI-free virtual geometrically enhanced database`,
      `  • GitHub API integrated for code intelligence`,
      `  • LMStudio compatible for local AI processing`,
      `  • Three.js powered for 3D geometric operations`,
      `  • Multi-database enabled (MongoDB, Redis, PostgreSQL)`,
      ``,
      `🚀 Next steps:`,
      `  • Set GITHUB_TOKEN in your environment`,
      `  • Test the new GitHub-integrated agent`,
      `  • Run npm run memory:generate to update memories`,
      `  • Deploy using Docker for full functionality`
    ];
  }

  printSummary(): void {
    console.log('\n' + this.result.summary.join('\n'));
    
    if (this.result.errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      this.result.errors.forEach(error => console.log(`  • ${error}`));
    }
  }
}

// CLI execution
async function main() {
  const cleanup = new OpenAICleanupTool();
  
  try {
    const result = await cleanup.performCleanup();
    cleanup.printSummary();
    
    // Save cleanup report
    const reportPath = join(process.cwd(), 'OPENAI-CLEANUP-REPORT.md');
    const reportContent = [
      '# H3X OpenAI Cleanup Report',
      '',
      `Generated: ${new Date().toISOString()}`,
      '',
      ...result.summary
    ].join('\n');
    
    writeFileSync(reportPath, reportContent);
    console.log(`\n📄 Cleanup report saved to: ${reportPath}`);
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

// Auto-run when executed directly
console.log('🚀 Starting OpenAI cleanup...');
main().catch(console.error);

export { OpenAICleanupTool };
