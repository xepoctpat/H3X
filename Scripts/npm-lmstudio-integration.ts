// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

interface ConsoleLog {
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

// NPM Script Integration for LM Studio Response.Output
// Integrates with existing H3X Docker and automation systems

import { spawn, exec } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

import { LMStudioResponseHandler } from './lmstudio-response-handler.js';

interface NPMIntegrationOptions {
  maxTokens?: number;
  dockerMode?: boolean;
  [key: string]: any;
}

interface NPMResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
}

interface CombinedResult {
  scriptName: string;
  lmStudioResponse?: string;
  npmOutput?: string;
  npmSuccess?: boolean;
  timestamp: string;
  metadata?: any;
  error?: string;
  success?: boolean;
}

class H3XLMStudioNPMIntegration {
  public projectRoot: string;
  public handler: InstanceType<typeof LMStudioResponseHandler>;
  public results: CombinedResult[];

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.handler = new LMStudioResponseHandler({
      verbose: true,
      dockerMode: (process.env as ProcessEnv).DOCKER_MODE === 'true',
      lmStudioUrl: (process.env as ProcessEnv).LMSTUDIO_URL || 'http://localhost:1234',
    });
    this.results = [];
  }

  log(message: string, type: string = 'info'): void {
    const colors: { [key: string]: string } = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m',
    };
    console.log(`${colors[type] || colors.info}[H3X-NPM] ${message}${colors.reset}`);
  }

  // Run npm script and get LM Studio response
  async runNpmWithLMStudio(
    scriptName: string,
    prompt: string,
    options: NPMIntegrationOptions = {},
  ): Promise<CombinedResult> {
    try {
      this.log(`Running npm script: ${scriptName} with LM Studio integration`, 'info');

      // Get LM Studio response first
      const lmResponse = await this.handler.getResponseOutput(prompt, {
        systemPrompt: `You are H3X SIR Control Interface. The user is running npm script "${scriptName}". Provide helpful analysis.`,
        maxTokens: options.maxTokens || 300,
        ...options,
      });

      if (!lmResponse.success) {
        throw new Error(`LM Studio response failed: ${lmResponse.error}`);
      }

      // Run the npm script
      const npmResult = await this.executeNpmScript(scriptName);

      // Combine results
      const combinedResult = {
        scriptName,
        lmStudioResponse: lmResponse.output,
        npmOutput: npmResult.output,
        npmSuccess: npmResult.success,
        timestamp: new Date().toISOString(),
        metadata: lmResponse.metadata,
      };

      this.results.push(combinedResult);

      this.log(`Completed ${scriptName} with LM Studio analysis`, 'success');
      return combinedResult;
    } catch (error: any) {
      this.log(`Error in npm + LM Studio integration: ${error.message}`, 'error');
      return {
        scriptName,
        error: error.message,
        success: false,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Execute npm script
  async executeNpmScript(scriptName: string): Promise<NPMResult> {
    return new Promise((resolve, reject) => {
      this.log(`Executing: npm run ${scriptName}`, 'info');

      const npmProcess = spawn('npm', ['run', scriptName], {
        cwd: this.projectRoot,
        env: { ...process.env },
      });

      let output = '';
      let errorOutput = '';

      npmProcess.stdout.on('data', (data: any) => {
        output += data.toString();
      });

      npmProcess.stderr.on('data', (data: any) => {
        errorOutput += data.toString();
      });

      npmProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve({
            success: true,
            output: output,
            exitCode: code,
          });
        } else {
          resolve({
            success: false,
            output: output,
            error: errorOutput,
            exitCode: code,
          });
        }
      });

      npmProcess.on('error', (error: any) => {
        reject(error);
      });
    });
  }

  // Docker-specific integration
  async dockerLMStudioIntegration() {
    this.log('Starting Docker + LM Studio integration workflow', 'info');

    const workflows = [
      {
        script: 'setup-check',
        prompt: 'Analyze system setup and provide recommendations for Docker deployment',
      },
      {
        script: 'test',
        prompt: 'Review test results and suggest improvements for containerized environment',
      },
    ];

    const results = [];

    for (const workflow of workflows) {
      const result = await this.runNpmWithLMStudio(workflow.script, workflow.prompt, {
        dockerMode: true,
      });
      results.push(result);
    }

    return results;
  }

  // H3X specific automation with LM Studio
  async h3xAutomationWithLMStudio() {
    this.log('Running H3X automation with LM Studio analysis', 'info');

    // Check if H3X services are running
    const healthCheck = await this.handler.healthCheck();

    if (!healthCheck.healthy) {
      this.log('LM Studio not healthy, running fallback automation', 'warning');
      return await this.executeNpmScript('standalone');
    }

    const h3xWorkflows = [
      {
        script: 'lmstudio',
        prompt: 'Start H3X SIR Control Interface and analyze system readiness',
        background: true,
      },
      {
        script: 'setup-check',
        prompt: 'Verify all H3X components are properly configured',
      },
    ];

    const results = [];

    for (const workflow of h3xWorkflows) {
      if (workflow.background) {
        // Start background service
        this.startBackgroundService(workflow.script);
        await this.delay(3000); // Wait for service to start

        // Get LM Studio analysis
        const lmResponse = await this.handler.getResponseOutput(workflow.prompt);
        results.push({
          script: workflow.script,
          background: true,
          lmStudioResponse: lmResponse.output,
          status: 'started',
        });
      } else {
        const result = await this.runNpmWithLMStudio(workflow.script, workflow.prompt);
        results.push(result);
      }
    }

    return results;
  }

  // Start background npm service
  startBackgroundService(scriptName: string): number | undefined {
    this.log(`Starting background service: npm run ${scriptName}`, 'info');

    const npmProcess = spawn('npm', ['run', scriptName], {
      cwd: this.projectRoot,
      detached: true,
      stdio: 'ignore',
    });

    npmProcess.unref();
    return npmProcess.pid;
  }

  // Containerized workflow
  async runContainerizedWorkflow() {
    this.log('Starting containerized LM Studio workflow', 'info');

    // Check if docker-compose is available
    const dockerCheck = await this.checkDockerCompose();

    if (!dockerCheck.available) {
      this.log('Docker Compose not available, falling back to local mode', 'warning');
      return await this.h3xAutomationWithLMStudio();
    }

    // Start services with docker-compose
    await this.executeDockerCompose('up -d');

    // Wait for services to be ready
    await this.delay(10000);

    // Update handler for containerized mode
    this.handler = new LMStudioResponseHandler({
      verbose: true,
      dockerMode: true,
      lmStudioUrl: 'http://localhost:1234', // Assuming port mapping
    });

    // Run health check
    const health = await this.handler.healthCheck();

    if (health.healthy) {
      this.log('Containerized LM Studio is healthy', 'success');

      // Run containerized workflows
      const workflows = await this.dockerLMStudioIntegration();

      return {
        mode: 'containerized',
        health: health,
        workflows: workflows,
      };
    } else {
      this.log('Containerized LM Studio health check failed', 'error');
      return {
        mode: 'containerized',
        health: health,
        error: 'Health check failed',
      };
    }
  }

  // Check Docker Compose availability
  async checkDockerCompose(): Promise<{ available: boolean; error: string | null }> {
    return new Promise((resolve) => {
      exec('docker-compose --version', (error) => {
        resolve({
          available: !error,
          error: error ? error.message : null,
        });
      });
    });
  }

  // Execute docker-compose command
  async executeDockerCompose(command: string): Promise<{ success: boolean; output: string }> {
    return new Promise((resolve, reject) => {
      this.log(`Executing: docker-compose ${command}`, 'info');

      const dockerProcess = spawn('docker-compose', command.split(' '), {
        cwd: this.projectRoot,
      });

      let output = '';

      dockerProcess.stdout.on('data', (data: any) => {
        output += data.toString();
      });

      dockerProcess.on('close', (code: number) => {
        if (code === 0) {
          resolve({ success: true, output });
        } else {
          reject(new Error(`docker-compose failed with code ${code}`));
        }
      });
    });
  }

  // Generate comprehensive report
  async generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      projectRoot: this.projectRoot,
      results: this.results,
      summary: {
        totalOperations: this.results.length,
        successful: this.results.filter((r) => r.npmSuccess !== false).length,
        failed: this.results.filter((r) => r.npmSuccess === false).length,
      },
    };

    // Save report to file
    const reportPath = path.join(this.projectRoot, 'Scripts', 'lmstudio-npm-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    this.log(`Report saved to ${reportPath}`, 'success');
    return report;
  }

  // Utility function
  delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// CLI interface
async function main(): Promise<any> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  const integration = new H3XLMStudioNPMIntegration();

  try {
    switch (command) {
      case 'npm':
        const scriptName = args[1];
        const prompt = args[2] || `Analyze the execution of npm script: ${scriptName}`;
        if (!scriptName) {
          console.log('Usage: node npm-integration.js npm <script-name> [prompt]');
          return;
        }
        const result = await integration.runNpmWithLMStudio(scriptName, prompt);
        console.log(JSON.stringify(result, null, 2));
        break;

      case 'docker':
        const dockerResults = await integration.dockerLMStudioIntegration();
        console.log('Docker Integration Results:');
        console.log(JSON.stringify(dockerResults, null, 2));
        break;

      case 'h3x':
        const h3xResults = await integration.h3xAutomationWithLMStudio();
        console.log('H3X Automation Results:');
        console.log(JSON.stringify(h3xResults, null, 2));
        break;

      case 'container':
        const containerResults = await integration.runContainerizedWorkflow();
        console.log('Containerized Workflow Results:');
        console.log(JSON.stringify(containerResults, null, 2));
        break;

      case 'report':
        const report = await integration.generateReport();
        console.log('Generated report:', report);
        break;

      case 'help':
      default:
        console.log(`
H3X LM Studio NPM Integration Commands:

  npm <script> [prompt]    - Run npm script with LM Studio analysis
  docker                   - Run Docker integration workflow  
  h3x                     - Run H3X automation with LM Studio
  container               - Run full containerized workflow
  report                  - Generate comprehensive report
  help                    - Show this help

Examples:
  node npm-integration.js npm setup-check "Analyze system setup"
  node npm-integration.js docker
  node npm-integration.js h3x
  node npm-integration.js container
                `);
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

export { H3XLMStudioNPMIntegration };

// CLI check for direct execution
if (process.argv[1] && process.argv[1].includes('npm-lmstudio-integration')) {
  main();
}
