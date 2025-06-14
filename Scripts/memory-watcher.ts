#!/usr/bin/env tsx

/**
 * H3X Memory Watcher
 * 
 * Watches for significant changes in the codebase and automatically
 * updates Augment Agent memories when needed.
 */

import { watch } from 'chokidar';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { MemoryGenerator } from './generate-memories.js';

interface WatchConfig {
  debounceMs: number;
  watchPaths: string[];
  ignorePaths: string[];
  significantFiles: string[];
}

class MemoryWatcher {
  private config: WatchConfig;
  private updateTimer: NodeJS.Timeout | null = null;
  private lastUpdate: Date = new Date(0);
  private generator: MemoryGenerator;

  constructor(rootDir: string = process.cwd()) {
    this.generator = new MemoryGenerator(rootDir);
    this.config = {
      debounceMs: 5000, // Wait 5 seconds after last change
      watchPaths: [
        'package.json',
        'tsconfig*.json',
        'src/**/*.ts',
        'scripts/**/*.ts',
        'docker/**/*',
        'docs/**/*.md',
        'README*.md',
        '.env.example'
      ],
      ignorePaths: [
        'node_modules/**',
        'dist/**',
        '.git/**',
        '**/*.log',
        'coverage/**',
        '.augment-memories*'
      ],
      significantFiles: [
        'package.json',
        'tsconfig.json',
        'docker-compose.yml',
        'README.md'
      ]
    };
  }

  start(): void {
    console.log('👁️  Starting H3X Memory Watcher...');
    console.log('📁 Watching for changes in:');
    this.config.watchPaths.forEach(path => console.log(`   - ${path}`));
    
    const watcher = watch(this.config.watchPaths, {
      ignored: this.config.ignorePaths,
      persistent: true,
      ignoreInitial: true
    });

    watcher
      .on('add', (path) => this.handleChange('added', path))
      .on('change', (path) => this.handleChange('changed', path))
      .on('unlink', (path) => this.handleChange('removed', path))
      .on('error', (error) => console.error('❌ Watcher error:', error));

    console.log('✅ Memory watcher started. Press Ctrl+C to stop.');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping memory watcher...');
      watcher.close();
      process.exit(0);
    });
  }

  private handleChange(event: string, filePath: string): void {
    console.log(`📝 File ${event}: ${filePath}`);
    
    // Check if this is a significant change
    const isSignificant = this.isSignificantChange(filePath);
    
    if (isSignificant) {
      console.log('🔥 Significant change detected!');
    }
    
    // Debounce updates
    if (this.updateTimer) {
      clearTimeout(this.updateTimer);
    }
    
    this.updateTimer = setTimeout(() => {
      this.updateMemories(isSignificant);
    }, this.config.debounceMs);
  }

  private isSignificantChange(filePath: string): boolean {
    // Check if it's a significant file
    const fileName = filePath.split('/').pop() || '';
    if (this.config.significantFiles.includes(fileName)) {
      return true;
    }
    
    // Check for structural changes
    if (filePath.includes('src/') && filePath.endsWith('.ts')) {
      // New TypeScript files or changes to main source files
      return true;
    }
    
    if (filePath.includes('docker/') || filePath.includes('docker-compose')) {
      // Docker configuration changes
      return true;
    }
    
    if (filePath.includes('scripts/') && filePath.endsWith('.ts')) {
      // New automation scripts
      return true;
    }
    
    return false;
  }

  private async updateMemories(isSignificant: boolean): Promise<void> {
    const now = new Date();
    const timeSinceLastUpdate = now.getTime() - this.lastUpdate.getTime();
    
    // Don't update too frequently
    if (timeSinceLastUpdate < 30000) { // 30 seconds minimum
      console.log('⏳ Skipping update - too soon since last update');
      return;
    }
    
    try {
      console.log('🧠 Updating memories...');
      const memories = await this.generator.generateMemories();
      await this.generator.saveMemories();
      
      this.lastUpdate = now;
      
      console.log(`✅ Updated ${memories.length} memories`);
      
      if (isSignificant) {
        console.log('💡 Tip: Significant changes detected. Consider sharing the updated');
        console.log('   .augment-memories-summary.md with Augment Agent');
      }
      
    } catch (error) {
      console.error('❌ Error updating memories:', error);
    }
  }

  // Manual update method
  async forceUpdate(): Promise<void> {
    console.log('🔄 Force updating memories...');
    await this.updateMemories(true);
  }
}

// CLI execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const watcher = new MemoryWatcher();
  
  if (command === 'watch') {
    watcher.start();
  } else if (command === 'update') {
    await watcher.forceUpdate();
    process.exit(0);
  } else {
    console.log('H3X Memory Watcher');
    console.log('');
    console.log('Usage:');
    console.log('  tsx scripts/memory-watcher.ts watch   # Start watching for changes');
    console.log('  tsx scripts/memory-watcher.ts update  # Force update memories once');
    console.log('');
    console.log('Or use npm scripts:');
    console.log('  npm run memory:watch   # Start watcher');
    console.log('  npm run memory:update  # Force update');
    process.exit(1);
  }
}

// Auto-run when executed directly
console.log('🚀 Starting memory watcher...');
main().catch(console.error);

export { MemoryWatcher };
