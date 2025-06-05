#!/usr/bin/env node

/**
 * H3X Development Workflow Orchestrator
 * Manages and coordinates all development workflows
 */

const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');

const execAsync = promisify(exec);

class H3XWorkflowOrchestrator {
  constructor() {
    this.workflows = new Map();
    this.activeProcesses = new Map();
    this.logFile = path.join(process.cwd(), 'logs', 'workflow-orchestrator.log');
  }

  /**
   * Initialize the orchestrator
   */
  async initialize() {
    await this.log('🎭 H3X Workflow Orchestrator - Initializing...', 'info');

    // Define available workflows
    this.defineWorkflows();

    // Ensure log directory exists
    await this.ensureDirectories();

    await this.log('✅ Workflow orchestrator ready!', 'success');
  }

  /**
   * Define all available workflows
   */
  defineWorkflows() {
    this.workflows.set('development', {
      name: 'Development Environment',
      description: 'Start full development environment with hot reload',
      commands: [
        {
          command: 'npm run env:dev',
          background: true,
          description: 'Start Docker development environment',
        },
        { command: 'sleep 10', description: 'Wait for services to start' },
        {
          command: 'npm run lmstudio:dev',
          background: true,
          description: 'Start LMStudio integration',
        },
        {
          command: 'npm run flups:dev',
          background: true,
          description: 'Start fLups development server',
        },
      ],
    });

    this.workflows.set('testing', {
      name: 'Comprehensive Testing',
      description: 'Run all tests and quality checks',
      commands: [
        { command: 'npm run test:health', description: 'System health check' },
        { command: 'npm run lint:check', description: 'Code linting' },
        { command: 'npm run test:all', description: 'All validation tests' },
        { command: 'npm run test', description: 'Unit tests' },
        {
          command: 'npm run test:integration',
          description: 'Integration tests',
        },
      ],
    });

    this.workflows.set('build', {
      name: 'Build and Package',
      description: 'Build and package the application',
      commands: [
        { command: 'npm run lint:check', description: 'Pre-build linting' },
        { command: 'npm run test:quick', description: 'Quick tests' },
        {
          command: 'npm run flups:build',
          description: 'Build fLups integration',
        },
        {
          command: 'npm run unified:build',
          description: 'Build Docker images',
        },
      ],
    });

    this.workflows.set('deployment', {
      name: 'Deployment Pipeline',
      description: 'Deploy to specified environment',
      commands: [
        {
          command: 'npm run pipeline:full',
          description: 'Full CI/CD pipeline',
        },
      ],
    });

    this.workflows.set('monitoring', {
      name: 'System Monitoring',
      description: 'Start continuous system monitoring',
      commands: [
        {
          command: 'npm run unified:status',
          description: 'Check container status',
        },
        { command: 'npm run test:health', description: 'Health check' },
        {
          command: 'node scripts/h3x-dev-automation.js --continuous',
          background: true,
          description: 'Start continuous monitoring',
        },
      ],
    });

    this.workflows.set('maintenance', {
      name: 'System Maintenance',
      description: 'Run maintenance tasks',
      commands: [
        {
          command: 'npm run unused:deps',
          description: 'Check unused dependencies',
        },
        {
          command: 'npm run docker:prune',
          description: 'Clean Docker resources',
        },
        { command: 'npm run format', description: 'Format code' },
        { command: 'npm run daily:full', description: 'Full daily checks' },
      ],
    });
  }

  /**
   * Ensure required directories exist
   */
  async ensureDirectories() {
    const dirs = ['logs', 'scripts', 'test-results'];
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true });
      } catch (error) {
        // Directory exists
      }
    }
  }

  /**
   * Enhanced logging
   */
  async log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        info: '🎭',
        success: '✅',
        warning: '⚠️',
        error: '❌',
        workflow: '🔄',
      }[type] || 'ℹ️';

    const logMessage = `[${timestamp}] ${prefix} ${message}`;
    console.log(logMessage);

    try {
      await fs.appendFile(this.logFile, logMessage + '\n');
    } catch (error) {
      // Continue if log write fails
    }
  }

  /**
   * Execute a command with proper handling
   */
  async executeCommand(cmd, description, isBackground = false) {
    await this.log(`Executing: ${description}`, 'workflow');

    return new Promise((resolve) => {
      if (isBackground) {
        // Start background process
        const process = spawn('npx', cmd.split(' ').slice(1), {
          stdio: ['pipe', 'pipe', 'pipe'],
          shell: true,
          detached: false,
        });

        const processId = `bg_${Date.now()}`;
        this.activeProcesses.set(processId, process);

        process.stdout.on('data', (data) => {
          if (data.toString().trim()) {
            console.log(`[${description}] ${data.toString().trim()}`);
          }
        });

        process.stderr.on('data', (data) => {
          if (data.toString().trim()) {
            console.log(`[${description}] ERROR: ${data.toString().trim()}`);
          }
        });

        setTimeout(() => {
          resolve({ success: true, background: true, processId });
        }, 2000); // Give background process time to start
      } else {
        // Run synchronous command
        exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
          if (error) {
            this.log(`Failed: ${description} - ${error.message}`, 'error');
            resolve({ success: false, error: error.message, stdout, stderr });
          } else {
            this.log(`Completed: ${description}`, 'success');
            resolve({
              success: true,
              stdout: stdout.trim(),
              stderr: stderr.trim(),
            });
          }
        });
      }
    });
  }

  /**
   * Run a specific workflow
   */
  async runWorkflow(workflowName, options = {}) {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    await this.log(`Starting workflow: ${workflow.name}`, 'workflow');
    await this.log(`Description: ${workflow.description}`, 'info');

    const results = [];
    let allSuccessful = true;

    for (const step of workflow.commands) {
      const result = await this.executeCommand(
        step.command,
        step.description,
        step.background || false,
      );

      results.push({
        step: step.description,
        ...result,
      });

      if (!result.success && !step.background) {
        allSuccessful = false;
        if (!options.continueOnError) {
          await this.log(`Workflow stopped due to failure: ${step.description}`, 'error');
          break;
        }
      }

      // Add delay between steps if specified
      if (step.delay) {
        await new Promise((resolve) => setTimeout(resolve, step.delay));
      }
    }

    await this.log(
      `Workflow '${workflow.name}' ${allSuccessful ? 'completed successfully' : 'completed with errors'}`,
      allSuccessful ? 'success' : 'warning',
    );

    return {
      workflow: workflowName,
      success: allSuccessful,
      results,
    };
  }

  /**
   * List all available workflows
   */
  listWorkflows() {
    console.log('\n🎭 Available H3X Workflows:\n');

    for (const [key, workflow] of this.workflows) {
      console.log(`📋 ${key.toUpperCase()}`);
      console.log(`   Name: ${workflow.name}`);
      console.log(`   Description: ${workflow.description}`);
      console.log(`   Steps: ${workflow.commands.length}`);
      console.log('');
    }
  }

  /**
   * Stop all active background processes
   */
  async stopAllProcesses() {
    await this.log('Stopping all active background processes...', 'warning');

    for (const [processId, process] of this.activeProcesses) {
      try {
        process.kill('SIGTERM');
        await this.log(`Stopped process: ${processId}`, 'info');
      } catch (error) {
        await this.log(`Failed to stop process ${processId}: ${error.message}`, 'error');
      }
    }

    this.activeProcesses.clear();
  }

  /**
   * Interactive workflow selection
   */
  async interactiveMode() {
    console.log('\n🎭 H3X Interactive Workflow Mode\n');

    this.listWorkflows();

    // Simple interactive mode for demo
    const workflowKeys = Array.from(this.workflows.keys());
    console.log('Available workflows:', workflowKeys.join(', '));
    console.log('\nTo run a workflow, use: node scripts/workflow-orchestrator.js <workflow-name>');
    console.log('Example: node scripts/workflow-orchestrator.js development');
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const orchestrator = new H3XWorkflowOrchestrator();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down workflow orchestrator...');
    await orchestrator.stopAllProcesses();
    process.exit(0);
  });

  orchestrator
    .initialize()
    .then(async () => {
      if (args.length === 0) {
        await orchestrator.interactiveMode();
      } else {
        const workflowName = args[0];
        const options = {
          continueOnError: args.includes('--continue-on-error'),
          verbose: args.includes('--verbose'),
        };

        if (workflowName === 'list') {
          orchestrator.listWorkflows();
        } else if (workflowName === 'stop') {
          await orchestrator.stopAllProcesses();
        } else {
          try {
            const result = await orchestrator.runWorkflow(workflowName, options);
            process.exit(result.success ? 0 : 1);
          } catch (error) {
            console.error(`❌ Workflow error: ${error.message}`);
            process.exit(1);
          }
        }
      }
    })
    .catch((error) => {
      console.error(`❌ Orchestrator initialization failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = H3XWorkflowOrchestrator;
