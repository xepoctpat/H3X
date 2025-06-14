#!/usr/bin/env tsx

/**
 * H3X Dynamic Memory Generator
 * 
 * Analyzes the codebase and generates relevant memories for Augment Agent
 * to better understand project structure, conventions, and patterns.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { glob } from 'glob';
import * as yaml from 'js-yaml';

interface Memory {
  category: string;
  content: string;
  confidence: number;
  source: string;
  timestamp: string;
}

interface ProjectAnalysis {
  architecture: string[];
  conventions: string[];
  technologies: string[];
  patterns: string[];
  workflows: string[];
  integrations: string[];
}

class MemoryGenerator {
  private rootDir: string;
  private memories: Memory[] = [];
  private analysis: ProjectAnalysis = {
    architecture: [],
    conventions: [],
    technologies: [],
    patterns: [],
    workflows: [],
    integrations: []
  };

  constructor(rootDir: string = process.cwd()) {
    this.rootDir = rootDir;
  }

  async generateMemories(): Promise<Memory[]> {
    console.log('🧠 Analyzing H3X codebase for memory generation...');
    
    await this.analyzePackageJson();
    await this.analyzeProjectStructure();
    await this.analyzeDockerConfiguration();
    await this.analyzeTypeScriptConfig();
    await this.analyzeTestingSetup();
    await this.analyzeScripts();
    await this.analyzeSourceCode();
    await this.analyzeDocumentation();
    
    this.generateArchitectureMemories();
    this.generateConventionMemories();
    this.generateWorkflowMemories();
    this.generateIntegrationMemories();
    
    return this.memories;
  }

  private addMemory(category: string, content: string, confidence: number, source: string) {
    this.memories.push({
      category,
      content,
      confidence,
      source,
      timestamp: new Date().toISOString()
    });
  }

  private async analyzePackageJson() {
    const packagePath = join(this.rootDir, 'package.json');
    if (!existsSync(packagePath)) return;

    const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
    
    // Technology stack
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    
    if (deps['@langchain/core']) {
      this.analysis.technologies.push('LangChain for local AI integration');
      this.addMemory('technology', 'Project uses LangChain framework for local AI processing (no OpenAI)', 0.9, 'package.json');
    }

    if (deps['@octokit/rest']) {
      this.analysis.technologies.push('GitHub API integration');
      this.addMemory('integration', 'Project integrates with GitHub API for code intelligence and Copilot features', 0.9, 'package.json');
    }

    if (deps['three']) {
      this.analysis.technologies.push('Three.js for 3D graphics');
      this.addMemory('technology', 'Project uses Three.js for 3D geometric processing and visualization', 0.9, 'package.json');
    }
    
    if (deps['typescript']) {
      this.analysis.technologies.push('TypeScript as primary language');
      this.addMemory('convention', 'All new code should be written in TypeScript, not JavaScript', 0.95, 'package.json');
    }
    
    if (deps['vitest']) {
      this.analysis.technologies.push('Vitest for testing');
      this.addMemory('testing', 'Use Vitest for unit and integration tests, not Jest', 0.9, 'package.json');
    }
    
    if (deps['docker'] || pkg.scripts['docker:dev']) {
      this.analysis.technologies.push('Docker containerization');
      this.addMemory('deployment', 'Project is fully containerized - use Docker commands for development and deployment', 0.95, 'package.json');
    }

    // Script patterns
    if (pkg.scripts) {
      const scripts = pkg.scripts;
      
      if (scripts['memory:generate']) {
        this.addMemory('workflow', 'Run `npm run memory:generate` to update Augment Agent memories', 0.9, 'package.json');
      }
      
      if (scripts['git:pr']) {
        this.addMemory('workflow', 'Use `npm run git:pr` for automated PR creation', 0.8, 'package.json');
      }
      
      if (scripts['standalone']) {
        this.addMemory('workflow', 'Use `npm run standalone` to run H3X without OpenAI dependencies', 0.8, 'package.json');
      }
      
      if (scripts['lmstudio']) {
        this.addMemory('integration', 'Project supports LMStudio integration via `npm run lmstudio`', 0.8, 'package.json');
      }
    }
  }

  private async analyzeProjectStructure() {
    const srcExists = existsSync(join(this.rootDir, 'src'));
    const scriptsExists = existsSync(join(this.rootDir, 'scripts'));
    const dockerExists = existsSync(join(this.rootDir, 'docker'));
    const testsExists = existsSync(join(this.rootDir, 'tests'));

    if (srcExists) {
      this.analysis.architecture.push('Source code in /src directory');
      this.addMemory('architecture', 'Main application code is organized in the /src directory', 0.9, 'file structure');
    }

    if (scriptsExists) {
      this.analysis.architecture.push('Automation scripts in /scripts directory');
      this.addMemory('architecture', 'Automation and utility scripts are in /scripts directory', 0.9, 'file structure');
    }

    if (dockerExists) {
      this.analysis.architecture.push('Docker configuration in /docker directory');
      this.addMemory('deployment', 'Docker configurations are organized in /docker directory', 0.9, 'file structure');
    }

    if (testsExists) {
      this.analysis.architecture.push('Tests organized in /tests directory');
      this.addMemory('testing', 'Tests are organized in /tests directory with unit, integration, and e2e subdirectories', 0.9, 'file structure');
    }
  }

  private async analyzeDockerConfiguration() {
    const dockerFiles = await glob('docker-compose*.yml', { cwd: this.rootDir });
    const dockerDir = join(this.rootDir, 'docker');
    
    if (dockerFiles.length > 0) {
      this.addMemory('deployment', `Project has ${dockerFiles.length} Docker Compose configurations for different environments`, 0.8, 'docker files');
    }

    if (existsSync(dockerDir)) {
      const dockerConfigs = readdirSync(dockerDir).filter(f => f.includes('docker-compose'));
      if (dockerConfigs.length > 0) {
        this.addMemory('deployment', 'Multiple Docker environments available: dev, prod, simple, unified', 0.8, 'docker directory');
      }
    }
  }

  private async analyzeTypeScriptConfig() {
    const tsconfigFiles = await glob('tsconfig*.json', { cwd: this.rootDir });
    
    if (tsconfigFiles.length > 1) {
      this.addMemory('convention', 'Project uses multiple TypeScript configurations for different build targets', 0.8, 'tsconfig files');
    }

    const mainTsconfig = join(this.rootDir, 'tsconfig.json');
    if (existsSync(mainTsconfig)) {
      try {
        const config = JSON.parse(readFileSync(mainTsconfig, 'utf8'));
        if (config.compilerOptions?.strict) {
          this.addMemory('convention', 'TypeScript strict mode is enabled - maintain high type safety standards', 0.9, 'tsconfig.json');
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }
  }

  private async analyzeTestingSetup() {
    const vitestConfig = existsSync(join(this.rootDir, 'vitest.config.ts'));
    const jestConfig = existsSync(join(this.rootDir, 'jest.config.ts'));
    
    if (vitestConfig && jestConfig) {
      this.addMemory('testing', 'Project supports both Vitest and Jest - prefer Vitest for new tests', 0.8, 'test configs');
    } else if (vitestConfig) {
      this.addMemory('testing', 'Use Vitest for all testing - configuration in vitest.config.ts', 0.9, 'vitest.config.ts');
    }
  }

  private async analyzeScripts() {
    const scriptsDir = join(this.rootDir, 'scripts');
    if (!existsSync(scriptsDir)) return;

    const scriptFiles = readdirSync(scriptsDir).filter(f => f.endsWith('.ts') || f.endsWith('.js'));
    
    const automationScripts = scriptFiles.filter(f => f.includes('automation'));
    if (automationScripts.length > 0) {
      this.addMemory('workflow', 'Project has extensive automation scripts for CI/CD, git operations, and development workflows', 0.8, 'scripts directory');
    }

    const gitScripts = scriptFiles.filter(f => f.includes('git'));
    if (gitScripts.length > 0) {
      this.addMemory('workflow', 'Git operations are automated via scripts - use npm run git:* commands', 0.8, 'scripts directory');
    }
  }

  private async analyzeSourceCode() {
    const srcDir = join(this.rootDir, 'src');
    if (!existsSync(srcDir)) return;

    // Check for agent files
    const agentFiles = await glob('**/agent*.ts', { cwd: srcDir });
    if (agentFiles.length > 0) {
      this.addMemory('architecture', 'Project implements AI agents - main agent logic in agent*.ts files', 0.9, 'src structure');
    }

    // Check for framework structure
    const frameworkDir = join(srcDir, 'framework');
    if (existsSync(frameworkDir)) {
      this.addMemory('architecture', 'Custom framework components are in src/framework directory', 0.8, 'src/framework');
    }

    // Check for protocol implementation
    const protocolDir = join(srcDir, 'protocol');
    if (existsSync(protocolDir)) {
      this.addMemory('architecture', 'Hexperiment System Protocol implementation in src/protocol directory', 0.8, 'src/protocol');
    }
  }

  private async analyzeDocumentation() {
    const readmeFiles = await glob('**/README*.md', { cwd: this.rootDir });
    const docFiles = await glob('docs/**/*.md', { cwd: this.rootDir });
    
    if (docFiles.length > 10) {
      this.addMemory('documentation', 'Extensive documentation available in /docs directory', 0.7, 'docs directory');
    }

    // Check for specific documentation patterns
    const deploymentDocs = [...readmeFiles, ...docFiles].filter(f => 
      f.toLowerCase().includes('deploy') || f.toLowerCase().includes('docker')
    );
    
    if (deploymentDocs.length > 0) {
      this.addMemory('deployment', 'Deployment documentation available - check Docker and deployment guides', 0.8, 'documentation');
    }
  }

  private generateArchitectureMemories() {
    if (this.analysis.architecture.length > 0) {
      const summary = this.analysis.architecture.join(', ');
      this.addMemory('architecture', `H3X follows modular architecture: ${summary}`, 0.8, 'analysis');
    }
  }

  private generateConventionMemories() {
    // Add common conventions based on analysis
    this.addMemory('convention', 'Use camelCase for variables and functions, PascalCase for classes and types', 0.7, 'TypeScript standards');
    this.addMemory('convention', 'Prefer explicit types over any, use interfaces for object shapes', 0.8, 'TypeScript standards');
    this.addMemory('convention', 'Use async/await over Promises.then() for better readability', 0.7, 'JavaScript standards');
  }

  private generateWorkflowMemories() {
    this.addMemory('workflow', 'Always run tests before committing: npm run test', 0.9, 'development workflow');
    this.addMemory('workflow', 'Use npm run lint:fix to automatically fix linting issues', 0.8, 'development workflow');
    this.addMemory('workflow', 'Build production version with npm run build:prod', 0.8, 'development workflow');
  }

  private generateIntegrationMemories() {
    this.addMemory('integration', 'Project supports multiple AI backends: OpenAI, LMStudio, and standalone mode', 0.9, 'AI integration');
    this.addMemory('integration', 'Database support includes MongoDB, Redis, and PostgreSQL', 0.8, 'database integration');
  }

  async saveMemories(outputPath?: string): Promise<void> {
    const defaultPath = join(this.rootDir, '.augment-memories.json');
    const filePath = outputPath || defaultPath;
    
    const output = {
      generated: new Date().toISOString(),
      project: 'H3X Hexperiment System',
      version: '2.0.0',
      memories: this.memories.sort((a, b) => b.confidence - a.confidence)
    };
    
    writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`💾 Generated ${this.memories.length} memories saved to ${filePath}`);
    
    // Also create a human-readable summary
    const summaryPath = filePath.replace('.json', '-summary.md');
    this.generateSummaryMarkdown(summaryPath);
  }

  private generateSummaryMarkdown(filePath: string): void {
    const categories = [...new Set(this.memories.map(m => m.category))];
    
    let markdown = '# H3X Project Memories\n\n';
    markdown += `Generated: ${new Date().toISOString()}\n\n`;
    
    categories.forEach(category => {
      const categoryMemories = this.memories.filter(m => m.category === category);
      markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
      
      categoryMemories.forEach(memory => {
        markdown += `- **${memory.content}** _(confidence: ${memory.confidence}, source: ${memory.source})_\n`;
      });
      markdown += '\n';
    });
    
    writeFileSync(filePath, markdown);
    console.log(`📝 Human-readable summary saved to ${filePath}`);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const isUpdate = args.includes('--update');

  const generator = new MemoryGenerator();

  try {
    const memories = await generator.generateMemories();
    await generator.saveMemories();

    console.log('\n✅ Memory generation complete!');
    console.log(`📊 Generated ${memories.length} memories across ${[...new Set(memories.map(m => m.category))].length} categories`);

    if (isUpdate) {
      console.log('\n💡 Tip: Share the generated .augment-memories-summary.md with Augment Agent');
      console.log('   You can say: "Please review and remember the contents of .augment-memories-summary.md"');
    }

  } catch (error) {
    console.error('❌ Error generating memories:', error);
    process.exit(1);
  }
}

// Auto-run when executed directly
console.log('🚀 Starting memory generation...');
main().catch(console.error);

export { MemoryGenerator, type Memory, type ProjectAnalysis };
