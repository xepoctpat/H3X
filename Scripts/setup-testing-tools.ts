#!/usr/bin/env node

/**
 * H3X Testing Tools Setup Script
 * Automated installation and configuration of testing tools
 */

import { exec } from 'child_process';
import * as fs from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

class TestingToolsSetup {
  tools: Array<{ name: string; package: string; version: string }>;
  configFiles: Array<{ name: string; exists: boolean }>;

  constructor() {
    this.tools = [
      { name: 'HTMLHint', package: 'htmlhint', version: '^1.1.4' },
      { name: 'JSHint', package: 'jshint', version: '^2.13.6' },
      { name: 'MarkdownLint', package: 'markdownlint-cli', version: '^0.37.0' },
    ];

    this.configFiles = [
      { name: '.htmlhintrc', exists: false },
      { name: '.jshintrc', exists: false },
      { name: '.markdownlint.json', exists: false },
    ];  }
  log(message: string, type = 'info'): void {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '🔧',
        success: '✅',
        warning: '⚠️',
        error: '❌',
      }[type] ?? 'ℹ️';

    console.log(`[${timestamp}] ${prefix} ${message}`);
  }
  async checkExistingInstallations(): Promise<void> {
    this.log('Checking existing installations...');
    let packageJson;
    try {
      packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    } catch {
      this.log('package.json not found. Please run `npm init -y` first.', 'error');
      process.exit(1);
    }
    const devDeps = packageJson.devDependencies ?? {};
    for (const tool of this.tools) {
      if (devDeps[tool.package]) {
        this.log(`${tool.name} already listed in devDependencies`, 'success');
      } else {
        this.log(`${tool.name} needs to be installed`, 'info');
      }
    }
  }

  async checkConfigFiles(): Promise<void> {
    this.log('Checking configuration files...');
    for (const config of this.configFiles) {
      config.exists = fs.existsSync(config.name);
      if (config.exists) {
        this.log(`${config.name} already exists`, 'success');
      } else {
        this.log(`${config.name} will be created`, 'info');
      }
    }
  }

  async createHTMLHintConfig(): Promise<void> {
    if (fs.existsSync('.htmlhintrc')) {
      this.log('HTMLHint config already exists', 'info');
      return;
    }

    const htmlhintConfig = {
      'tagname-lowercase': true,
      'attr-lowercase': true,
      'attr-value-double-quotes': true,
      'doctype-first': true,
      'tag-pair': true,
      'spec-char-escape': true,
      'id-unique': true,
      'src-not-empty': true,
      'attr-no-duplication': true,
      'title-require': true,
      'alt-require': true,
      'doctype-html5': true,
      'id-class-value': 'dash',
      'style-disabled': false,
      'inline-style-disabled': true,
      'inline-script-disabled': false,
      'space-tab-mixed-disabled': 'space',
      'id-class-ad-disabled': true,
      'href-abs-or-rel': false,
      'attr-unsafe-chars': true,
    };

    fs.writeFileSync('.htmlhintrc', JSON.stringify(htmlhintConfig, null, 2));
    this.log('Created .htmlhintrc configuration', 'success');
  }

  async createJSHintConfig(): Promise<void> {
    if (fs.existsSync('.jshintrc')) {
      this.log('JSHint config already exists', 'info');
      return;
    }

    const jshintConfig = {
      esversion: 8,
      node: true,
      browser: true,
      jquery: true,
      strict: false,
      globalstrict: false,
      undef: true,
      unused: true,
      eqeqeq: true,
      indent: 4,
      quotmark: 'single',
      maxlen: 120,
      trailing: true,
      curly: true,
      nonew: true,
      freeze: true,
      typed: true,
      globals: {
        require: false,
        module: false,
        exports: false,
        console: false,
        process: false,
        __dirname: false,
        __filename: false,
      },
    };

    fs.writeFileSync('.jshintrc', JSON.stringify(jshintConfig, null, 2));
    this.log('Created .jshintrc configuration', 'success');
  }

  async createMarkdownLintConfig(): Promise<void> {
    if (fs.existsSync('.markdownlint.json')) {
      this.log('MarkdownLint config already exists', 'info');
      return;
    }

    const markdownConfig = {
      default: true,
      MD013: { line_length: 120 },
      MD033: false,
      MD041: false,
    };

    fs.writeFileSync('.markdownlint.json', JSON.stringify(markdownConfig, null, 2));
    this.log('Created .markdownlint.json configuration', 'success');
  }
  async installDependencies(): Promise<void> {
    this.log('Installing testing dependencies...');

    try {
      const { stderr } = await execAsync(
        'npm install --save-dev htmlhint@^1.1.4 jshint@^2.13.6 markdownlint-cli@^0.37.0',
      );
      if (stderr && !stderr.includes('WARN')) {
        this.log(`Installation warnings: ${stderr}`, 'warning');
      }
      this.log('Dependencies installed successfully', 'success');
    } catch (error) {
      this.log(`Failed to install dependencies: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      throw error;
    }
  }
  async verifyInstallations(): Promise<void> {
    this.log('Verifying tool installations...');

    const verificationCommands = [
      { name: 'HTMLHint', command: 'npx htmlhint --version' },
      { name: 'JSHint', command: 'npx jshint --version' },
      { name: 'MarkdownLint', command: 'npx markdownlint --version' },
    ];

    for (const { name, command } of verificationCommands) {
      try {
        const { stdout } = await execAsync(command);
        this.log(`${name}: ${stdout.trim()}`, 'success');
      } catch {
        this.log(`${name}: Installation may have issues`, 'warning');
      }
    }
  }

  async createHealthCheckScript(): Promise<void> {
    if (fs.existsSync('scripts/health-check.js')) {
      this.log('health-check.js already exists', 'info');
      return;
    }
    if (!fs.existsSync('scripts')) {
      fs.mkdirSync('scripts');
    }
    const healthCheckScript = `import http = require('http');

const endpoints = [
    { name: 'H3X Dashboard', url: 'http://localhost:3978/api/health' },
    { name: 'H3X Protocol Server', url: 'http://localhost:8081/health' },
    { name: 'LMStudio Integration', url: 'http://localhost:1234/v1/models' }
];

async function checkEndpoint(endpoint): Promise<any> {
    return new Promise((resolve) => {
        const req = http.get(endpoint.url, (res) => {
            console.log(\`✅ \${endpoint.name}: Status \${res.statusCode}\`);
            resolve({ name: endpoint.name, status: res.statusCode, healthy: res.statusCode < 400 });
        });

        req.on('error', (err) => {
            console.log(\`❌ \${endpoint.name}: \${err.message}\`);
            resolve({ name: endpoint.name, status: 'ERROR', healthy: false, error: err.message });
        });

        req.setTimeout(5000, () => {
            req.destroy();
            console.log(\`⏰ \${endpoint.name}: Timeout\`);
            resolve({ name: endpoint.name, status: 'TIMEOUT', healthy: false });
        });
    });
}

async function runHealthCheck(): Promise<any> {
    console.log('🔬 H3X Protocol Health Check...\\n');
    
    const results = await Promise.all(endpoints.map(checkEndpoint));
    
    console.log('\\n📊 H3X System Status:');
    results.forEach(result => {
        const status = result.healthy ? '🟢 OPERATIONAL' : '🔴 DOWN';
        console.log(\`  \${result.name}: \${status}\`);
    });
    
    const allHealthy = results.every(r => r.healthy);
    console.log('\\n🎯 H3X Protocol Status: ' + (allHealthy ? '🟢 ALL SYSTEMS GO' : '🔴 SYSTEM ISSUES DETECTED'));
    
    process.exit(allHealthy ? 0 : 1);
}

runHealthCheck();`;
    fs.writeFileSync('scripts/health-check.js', healthCheckScript);
    this.log('Created scripts/health-check.js', 'success');
  }
  async updatePackageJsonScripts(): Promise<void> {
    this.log('Updating package.json scripts...');
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      packageJson.scripts = packageJson.scripts ?? {};
      const newScripts = {
        'test:all': 'npm run test:html && npm run test:js && npm run test:md',
        'test:html': 'htmlhint ./Public/**/*.html',
        'test:js': 'jshint ./Public/js/**/*.js ./Src/**/*.js',
        'test:md': 'markdownlint **/*.md --ignore node_modules',
        'test:health': 'node scripts/health-check.js',
        'test:quick': 'npm run test:health && npm run test:html',
        'daily:check': 'npm run test:health && npm run test:quick',
        'daily:full': 'npm run test:all && npm run test:health',
      };
      packageJson.scripts = { ...packageJson.scripts, ...newScripts };
      fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));      this.log('Updated package.json with test scripts', 'success');
    } catch (error) {
      this.log(`Failed to update package.json: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  }

  async displayUsageInstructions(): Promise<void> {
    console.log('\\n🎉 Setup Complete! Here are your new testing commands:\\n');

    const commands = [
      { cmd: 'npm run test:all', desc: 'Run all tests (HTML, JS, Markdown)' },
      { cmd: 'npm run test:html', desc: 'Test HTML files with HTMLHint' },
      { cmd: 'npm run test:js', desc: 'Test JavaScript files with JSHint' },
      { cmd: 'npm run test:md', desc: 'Test Markdown files with MarkdownLint' },
      { cmd: 'npm run test:health', desc: 'Run system health check' },
      { cmd: 'npm run test:quick', desc: 'Quick health and HTML tests' },
      { cmd: 'npm run daily:check', desc: 'Daily maintenance checks' },
      { cmd: 'npm run daily:full', desc: 'Complete daily testing suite' },
    ];

    commands.forEach(({ cmd, desc }) => {
      console.log(`  ${cmd.padEnd(35)} - ${desc}`);
    });

    console.log('\\n📋 Configuration files created:');
    console.log('  .htmlhintrc      - HTMLHint rules');
    console.log('  .jshintrc        - JSHint rules');
    console.log('  .markdownlint.json - MarkdownLint rules');
    console.log('  scripts/health-check.js - Health monitoring script');

    console.log('\\n🚀 Quick start:');
    console.log('  npm run daily:check     # For daily health monitoring');
    console.log('  npm run test:all        # For comprehensive testing');
  }
  async run(): Promise<void> {
    this.log('🚀 Starting H3X Testing Tools Setup');
    console.log('='.repeat(60));

    try {
      await this.checkExistingInstallations();
      await this.checkConfigFiles();
      await this.createHTMLHintConfig();
      await this.createJSHintConfig();
      await this.createMarkdownLintConfig();
      await this.installDependencies();
      await this.verifyInstallations();
      await this.createHealthCheckScript();
      await this.updatePackageJsonScripts();
      await this.displayUsageInstructions();

      this.log('🎉 Testing tools setup completed successfully!', 'success');
    } catch (error) {
      this.log(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      process.exit(1);
    }
  }
}

// Run setup if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new TestingToolsSetup();
  setup.run().catch(console.error);
}

export default TestingToolsSetup;
