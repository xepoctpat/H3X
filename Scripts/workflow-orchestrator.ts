#!/usr/bin/env node

/**
 * H3X Workflow Orchestrator (TypeScript)
 * Advanced workflow management and parallel execution
 */

import { exec, spawn, ChildProcess } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import * as path from 'path';
import { WorkflowConfig, WorkflowStep, AutomationResult, ProcessInfo } from './types';

const execAsync = promisify(exec);

interface WorkflowContext {
  variables: Record<string, any>;
  artifacts: string[];
  startTime: Date;
  metadata: Record<string, any>;
}

class H3XWorkflowOrchestrator {
  private projectRoot: string;
  private workflows: Map<string, WorkflowConfig>;
  private runningWorkflows: Map<string, ProcessInfo>;
  private context: WorkflowContext;

  constructor() {
    this.projectRoot = process.cwd();
    this.workflows = new Map();
    this.runningWorkflows = new Map();
    this.context = {
      variables: {},
      artifacts: [],
      startTime: new Date(),
      metadata: {},
    };

    this.initializeWorkflows();
  }

  private initializeWorkflows(): void {
    // Define built-in workflows
    const workflows: WorkflowConfig[] = [
      {
        name: 'development',
        description: 'Complete development workflow with TypeScript focus',
        parallel: false,
        continueOnError: false,
        steps: [
          {
            name: 'Environment Check',
            command: 'node --version && npm --version && npx tsc --version',
            description: 'Verify development environment',
            required: true,
            timeout: 10000,
            retries: 1,
          },
          {
            name: 'Dependencies Check',
            command: 'npm audit --audit-level moderate',
            description: 'Check dependency vulnerabilities',
            required: false,
            timeout: 30000,
            retries: 2,
          },
          {
            name: 'TypeScript Compilation',
            command: 'npx tsc --noEmit --project scripts/tsconfig.json',
            description: 'TypeScript type checking',
            required: true,
            timeout: 60000,
            retries: 1,
          },
          {
            name: 'ESLint Analysis',
            command: 'npx eslint . --ext .ts,.js --fix',
            description: 'Code quality and formatting',
            required: false,
            timeout: 45000,
            retries: 2,
          },
          {
            name: 'Test Suite',
            command: 'npx vitest run --coverage',
            description: 'Run all tests with coverage',
            required: false,
            timeout: 120000,
            retries: 1,
          },
          {
            name: 'Build Assets',
            command: 'npx vite build',
            description: 'Build production assets',
            required: false,
            timeout: 180000,
            retries: 1,
          },
        ],
      },
      {
        name: 'ci-pipeline',
        description: 'Continuous Integration pipeline',
        parallel: false,
        continueOnError: false,
        steps: [
          {
            name: 'Clean Environment',
            command: 'npm ci && rm -rf dist coverage',
            description: 'Clean install and remove artifacts',
            required: true,
            timeout: 120000,
            retries: 2,
          },
          {
            name: 'TypeScript Build',
            command: 'npx tsc --build',
            description: 'Full TypeScript compilation',
            required: true,
            timeout: 120000,
            retries: 1,
          },
          {
            name: 'Lint Enforcement',
            command: 'npx eslint . --ext .ts,.js --max-warnings 0',
            description: 'Strict linting with no warnings',
            required: true,
            timeout: 60000,
            retries: 0,
          },
          {
            name: 'Test Coverage',
            command: 'npx vitest run --coverage --coverage.thresholds.lines=80',
            description: 'Tests with 80% coverage requirement',
            required: true,
            timeout: 180000,
            retries: 0,
          },
          {
            name: 'Security Audit',
            command: 'npm audit --audit-level high',
            description: 'High-severity vulnerability check',
            required: true,
            timeout: 45000,
            retries: 1,
          },
          {
            name: 'Production Build',
            command: 'npx vite build --mode production',
            description: 'Optimized production build',
            required: true,
            timeout: 300000,
            retries: 1,
          },
        ],
      },
      {
        name: 'quick-check',
        description: 'Fast development checks',
        parallel: true,
        continueOnError: true,
        steps: [
          {
            name: 'TypeScript Check',
            command: 'npx tsc --noEmit --skipLibCheck',
            description: 'Quick type checking',
            required: false,
            timeout: 30000,
            retries: 0,
          },
          {
            name: 'ESLint Quick',
            command: 'npx eslint . --ext .ts --quiet',
            description: 'Quick lint check (errors only)',
            required: false,
            timeout: 20000,
            retries: 0,
          },
          {
            name: 'Unit Tests',
            command: 'npx vitest run --reporter=basic',
            description: 'Fast unit tests',
            required: false,
            timeout: 60000,
            retries: 0,
          },
        ],
      },
      {
        name: 'docker-workflow',
        description: 'Docker-based development workflow',
        parallel: false,
        continueOnError: false,
        steps: [
          {
            name: 'Docker Health',
            command: 'docker --version && docker-compose --version',
            description: 'Verify Docker environment',
            required: true,
            timeout: 10000,
            retries: 1,
          },
          {
            name: 'Services Up',
            command: 'npm run env:dev',
            description: 'Start development services',
            required: true,
            timeout: 120000,
            retries: 2,
          },
          {
            name: 'Wait for Services',
            command: 'sleep 30',
            description: 'Allow services to initialize',
            required: true,
            timeout: 35000,
            retries: 0,
          },
          {
            name: 'Health Check',
            command: 'npm run test:health',
            description: 'Verify service health',
            required: true,
            timeout: 30000,
            retries: 3,
          },
          {
            name: 'Integration Tests',
            command: 'npm run test:integration',
            description: 'Run integration test suite',
            required: false,
            timeout: 180000,
            retries: 1,
          },
        ],
      },
    ];

    workflows.forEach((workflow) => {
      this.workflows.set(workflow.name, workflow);
    });
  }

  async executeWorkflow(
    workflowName: string,
    options: {
      parallel?: boolean;
      continueOnError?: boolean;
      variables?: Record<string, any>;
    } = {},
  ): Promise<AutomationResult> {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      return {
        success: false,
        message: `Workflow '${workflowName}' not found`,
        duration: 0,
        errors: [`Available workflows: ${Array.from(this.workflows.keys()).join(', ')}`],
      };
    }

    const startTime = Date.now();
    this.log(`🚀 Starting workflow: ${workflow.name}`, 'info');
    this.log(`📋 Description: ${workflow.description}`, 'info');

    // Update context
    this.context.variables = { ...this.context.variables, ...options.variables };
    this.context.startTime = new Date();

    const useParallel = options.parallel ?? workflow.parallel;
    const continueOnError = options.continueOnError ?? workflow.continueOnError;

    try {
      let results: AutomationResult[];

      if (useParallel) {
        results = await this.executeStepsParallel(workflow.steps, continueOnError);
      } else {
        results = await this.executeStepsSequential(workflow.steps, continueOnError);
      }

      const duration = Date.now() - startTime;
      const successCount = results.filter((r) => r.success).length;
      const totalSteps = results.length;

      const overallSuccess =
        results.every((r) => r.success) || (continueOnError && successCount > 0);

      return {
        success: overallSuccess,
        message: `Workflow '${workflowName}' completed: ${successCount}/${totalSteps} steps successful`,
        duration,
        details: {
          workflow: workflow.name,
          steps: results,
          context: this.context,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        message: `Workflow '${workflowName}' failed: ${error}`,
        duration,
        errors: [String(error)],
      };
    }
  }

  private async executeStepsSequential(
    steps: WorkflowStep[],
    continueOnError: boolean,
  ): Promise<AutomationResult[]> {
    const results: AutomationResult[] = [];

    for (const [index, step] of steps.entries()) {
      this.log(`📝 Step ${index + 1}/${steps.length}: ${step.name}`, 'info');

      const result = await this.executeStep(step);
      results.push(result);

      if (!result.success) {
        if (!continueOnError && step.required) {
          this.log(`❌ Required step failed: ${step.name}. Stopping workflow.`, 'error');
          break;
        } else {
          this.log(`⚠️ Step failed but continuing: ${step.name}`, 'warn');
        }
      } else {
        this.log(`✅ Step completed: ${step.name}`, 'info');
      }
    }

    return results;
  }

  private async executeStepsParallel(
    steps: WorkflowStep[],
    continueOnError: boolean,
  ): Promise<AutomationResult[]> {
    this.log(`🔄 Executing ${steps.length} steps in parallel`, 'info');

    const promises = steps.map((step) => this.executeStep(step));
    const results = await Promise.allSettled(promises);

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          success: false,
          message: `Step '${steps[index].name}' rejected: ${result.reason}`,
          duration: 0,
          errors: [String(result.reason)],
        };
      }
    });
  }

  private async executeStep(step: WorkflowStep): Promise<AutomationResult> {
    const startTime = Date.now();
    let attempt = 0;
    let lastError: any;

    while (attempt <= step.retries) {
      try {
        if (attempt > 0) {
          this.log(`🔄 Retry ${attempt}/${step.retries} for: ${step.name}`, 'warn');
          await this.sleep(1000 * attempt); // Progressive backoff
        }

        const command = this.interpolateCommand(step.command);
        const { stdout, stderr } = await execAsync(command, {
          cwd: this.projectRoot,
          timeout: step.timeout,
        });

        if (stderr && !stderr.includes('warning') && !stderr.includes('deprecated')) {
          this.log(`⚠️ Command stderr: ${stderr}`, 'warn');
        }

        const duration = Date.now() - startTime;

        // Store output as artifact
        if (stdout.trim()) {
          this.context.artifacts.push(`${step.name}_output.txt`);
          await this.saveArtifact(`${step.name}_output.txt`, stdout);
        }

        return {
          success: true,
          message: `Step '${step.name}' completed successfully`,
          duration,
          details: { stdout: stdout.trim(), stderr: stderr.trim() },
        };
      } catch (error: any) {
        lastError = error;
        attempt++;

        if (attempt <= step.retries) {
          this.log(`❌ Step '${step.name}' failed (attempt ${attempt}): ${error.message}`, 'warn');
        }
      }
    }

    const duration = Date.now() - startTime;
    return {
      success: false,
      message: `Step '${step.name}' failed after ${step.retries + 1} attempts`,
      duration,
      errors: [String(lastError)],
    };
  }

  private interpolateCommand(command: string): string {
    let result = command;

    // Replace variables: ${VAR_NAME}
    const variableRegex = /\$\{([^}]+)\}/g;
    result = result.replace(variableRegex, (match, varName) => {
      return this.context.variables[varName] || process.env[varName] || match;
    });

    return result;
  }

  private async saveArtifact(filename: string, content: string): Promise<void> {
    const artifactsDir = path.join(this.projectRoot, 'workflow-artifacts');
    await fs.mkdir(artifactsDir, { recursive: true });

    const filepath = path.join(artifactsDir, filename);
    await fs.writeFile(filepath, content);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m', // Cyan
      warn: '\x1b[33m', // Yellow
      error: '\x1b[31m', // Red
    };
    const resetColor = '\x1b[0m';

    console.log(`${colors[level]}[${timestamp}] ${message}${resetColor}`);
  }

  async listWorkflows(): Promise<WorkflowConfig[]> {
    return Array.from(this.workflows.values());
  }

  async addCustomWorkflow(workflow: WorkflowConfig): Promise<void> {
    this.workflows.set(workflow.name, workflow);
    this.log(`Added custom workflow: ${workflow.name}`, 'info');
  }

  async generateWorkflowReport(): Promise<string> {
    const reportPath = path.join(this.projectRoot, 'workflow-report.md');
    const workflows = await this.listWorkflows();

    const report = `# H3X Workflow Orchestrator Report

Generated: ${new Date().toISOString()}

## Available Workflows

${workflows
  .map(
    (wf) => `
### ${wf.name}
**Description:** ${wf.description}  
**Parallel Execution:** ${wf.parallel ? '✅' : '❌'}  
**Continue on Error:** ${wf.continueOnError ? '✅' : '❌'}  
**Steps:** ${wf.steps.length}

${wf.steps
  .map(
    (step, i) => `
${i + 1}. **${step.name}** ${step.required ? '(Required)' : '(Optional)'}
   - Command: \`${step.command}\`
   - Timeout: ${step.timeout}ms
   - Retries: ${step.retries}
   - Description: ${step.description}
`,
  )
  .join('')}
`,
  )
  .join('')}

## Context
- Variables: ${Object.keys(this.context.variables).length}
- Artifacts: ${this.context.artifacts.length}
- Last Run: ${this.context.startTime.toISOString()}

---
*Generated by H3X Workflow Orchestrator*
`;

    await fs.writeFile(reportPath, report);
    return reportPath;
  }
}

// CLI interface
async function main(): Promise<void> {
  const orchestrator = new H3XWorkflowOrchestrator();
  const args = process.argv.slice(2);
  const command = args[0];
  const workflowName = args[1];

  try {
    switch (command) {
      case 'run':
        if (!workflowName) {
          console.error('❌ Usage: npm run workflow run <workflow-name>');
          process.exit(1);
        }

        const result = await orchestrator.executeWorkflow(workflowName, {
          variables: { NODE_ENV: process.env.NODE_ENV || 'development' },
        });

        if (result.success) {
          console.log(`✅ ${result.message}`);
          process.exit(0);
        } else {
          console.error(`❌ ${result.message}`);
          if (result.errors) {
            result.errors.forEach((error) => console.error(`  - ${error}`));
          }
          process.exit(1);
        }
        break;

      case 'list':
        const workflows = await orchestrator.listWorkflows();
        console.log('\n📋 Available Workflows:\n');
        workflows.forEach((wf) => {
          console.log(`• ${wf.name} - ${wf.description}`);
          console.log(
            `  Steps: ${wf.steps.length}, Parallel: ${wf.parallel}, Continue on Error: ${wf.continueOnError}\n`,
          );
        });
        break;

      case 'report':
        const reportPath = await orchestrator.generateWorkflowReport();
        console.log(`📊 Workflow report generated: ${reportPath}`);
        break;

      case 'help':
      default:
        console.log(`
H3X Workflow Orchestrator (TypeScript)

Usage: npm run workflow <command> [options]

Commands:
  run <workflow>    Execute a specific workflow
  list              List all available workflows
  report            Generate workflow documentation
  help              Show this help

Available Workflows:
  - development     Complete development workflow
  - ci-pipeline     Continuous integration pipeline
  - quick-check     Fast development checks
  - docker-workflow Docker-based workflow

Examples:
  npm run workflow run development
  npm run workflow run quick-check
  npm run workflow list
        `);
        break;
    }
  } catch (error) {
    console.error(`❌ Workflow orchestrator failed: ${error}`);
    process.exit(1);
  }
}

// Run if called directly
main();

export { H3XWorkflowOrchestrator };
