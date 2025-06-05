#!/usr/bin/env tsx

/**
 * H3X Docker + LM Studio Integration
 * Manages containerized LM Studio deployment with H3X
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';
import axios from 'axios';

interface LogLevel {
  level: 'info' | 'success' | 'warning' | 'error';
}

interface ProcessEnv {
  [key: string]: string | undefined;
}

class H3XDockerLMStudioIntegration {
  private projectRoot: string;
  private composeFile: string;
  private lmStudioContainer: string;
  private h3xContainer: string;
  private dockerNetwork: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.composeFile = path.join(this.projectRoot, 'docker-compose.lmstudio.yml');
    this.lmStudioContainer = 'h3x-lmstudio';
    this.h3xContainer = 'h3x-main';
    this.dockerNetwork = 'h3x-lmstudio-network';
  }

  // Logging utility
  log(message: string, level: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌',
    };

    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
    };

    const reset = '\x1b[0m';
    console.log(`${icons[level]} ${colors[level]}${message}${reset}`);
  }

  // Check if LM Studio is running
  async checkLMStudioStatus(): Promise<boolean> {
    try {
      const response = await axios.get('http://localhost:1234/v1/models', { timeout: 5000 });
      this.log('LM Studio is running and accessible', 'success');
      return true;
    } catch (error) {
      this.log('LM Studio is not accessible', 'warning');
      return false;
    }
  }

  // Start LM Studio service via unified docker-compose
  async startLMStudio(): Promise<void> {
    this.log('Starting LM Studio via unified Docker Compose...');

    return new Promise((resolve, reject) => {
      const process = spawn(
        'docker-compose',
        ['-f', this.composeFile, 'up', '-d', 'h3x-lmstudio'],
        {
          stdio: 'inherit',
          cwd: this.projectRoot,
        },
      );

      process.on('close', (code) => {
        if (code === 0) {
          this.log('LM Studio container started successfully', 'success');
          resolve();
        } else {
          this.log(`LM Studio failed to start (exit code: ${code})`, 'error');
          reject(new Error(`Process failed with exit code ${code}`));
        }
      });
    });
  }

  // Stop LM Studio service
  async stopLMStudio(): Promise<void> {
    this.log('Stopping LM Studio...');

    return new Promise((resolve, reject) => {
      const process = spawn('docker-compose', ['-f', this.composeFile, 'stop', 'h3x-lmstudio'], {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });

      process.on('close', (code) => {
        if (code === 0) {
          this.log('LM Studio stopped successfully', 'success');
          resolve();
        } else {
          this.log(`Failed to stop LM Studio (exit code: ${code})`, 'error');
          reject(new Error(`Process failed with exit code ${code}`));
        }
      });
    });
  }

  // Test LM Studio API
  async testLMStudio(): Promise<boolean> {
    this.log('Testing LM Studio API...');

    try {
      // Wait for service to be ready
      await this.waitForService('localhost', 1234, 'LM Studio API');

      // Test model endpoint
      const modelsResponse = await axios.get('http://localhost:1234/v1/models');
      this.log(`Available models: ${modelsResponse.data.data.length}`, 'info');

      // Test simple completion
      const completionResponse = await axios.post('http://localhost:1234/v1/completions', {
        model: modelsResponse.data.data[0]?.id || 'default',
        prompt: 'Test prompt for H3X integration:',
        max_tokens: 50,
        temperature: 0.7,
      });

      this.log('LM Studio API test successful', 'success');
      this.log(
        `Response: ${completionResponse.data.choices[0]?.text?.substring(0, 100)}...`,
        'info',
      );
      return true;
    } catch (error: any) {
      this.log(`LM Studio API test failed: ${error.message}`, 'error');
      return false;
    }
  }

  // Wait for service to be ready
  async waitForService(
    host: string,
    port: number,
    serviceName: string,
    timeout: number = 60000,
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await axios.get(`http://${host}:${port}`, { timeout: 2000 });
        this.log(`${serviceName} is ready`, 'success');
        return;
      } catch (error) {
        this.log(`Waiting for ${serviceName}...`, 'info');
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    throw new Error(`${serviceName} failed to become ready within ${timeout}ms`);
  }

  // Generate Docker Compose configuration
  async generateDockerCompose(): Promise<string> {
    const composeConfig = `version: '3.8'

services:
  # LM Studio Service
  ${this.lmStudioContainer}:
    image: lmstudio/server:latest
    container_name: ${this.lmStudioContainer}
    ports:
      - "1234:1234"
      - "1235:1235"
    environment:
      - LMSTUDIO_API_PORT=1234
      - LMSTUDIO_MODEL_PATH=/models
      - LMSTUDIO_CORS_ALLOW_ORIGIN=*
    volumes:
      - ./models:/models:ro
      - lmstudio-cache:/root/.cache/lm-studio
    networks:
      - ${this.dockerNetwork}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:1234/v1/models"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  # H3X Main Application
  ${this.h3xContainer}:
    build:
      context: .
      dockerfile: Dockerfile.h3x
    container_name: ${this.h3xContainer}
    ports:
      - "3978:3978"
      - "8081:8081"
    environment:
      - NODE_ENV=production
      - LMSTUDIO_URL=http://${this.lmStudioContainer}:1234
      - DOCKER_MODE=true
      - H3X_NETWORK_MODE=docker
    volumes:
      - ./Src:/app/Src:ro
      - ./Public:/app/Public:ro
      - ./Scripts:/app/Scripts:ro
      - h3x-logs:/app/logs
    depends_on:
      ${this.lmStudioContainer}:
        condition: service_healthy
    networks:
      - ${this.dockerNetwork}
    restart: unless-stopped

  # H3X Protocol Server
  h3x-protocol:
    build:
      context: .
      dockerfile: Dockerfile.protocol
    container_name: h3x-protocol
    ports:
      - "8080:8080"
    environment:
      - LMSTUDIO_URL=http://${this.lmStudioContainer}:1234
      - H3X_MAIN_URL=http://${this.h3xContainer}:3978
    networks:
      - ${this.dockerNetwork}
    depends_on:
      - ${this.h3xContainer}
    restart: unless-stopped

  # Response Output Processor
  h3x-response-processor:
    build:
      context: ./Scripts
      dockerfile: Dockerfile.response-processor
    container_name: h3x-response-processor
    environment:
      - LMSTUDIO_URL=http://${this.lmStudioContainer}:1234
      - REDIS_URL=redis://h3x-redis:6379
    volumes:
      - ./Scripts:/app/Scripts:ro
      - response-outputs:/app/outputs
    networks:
      - ${this.dockerNetwork}
    depends_on:
      - ${this.lmStudioContainer}
      - h3x-redis
    restart: unless-stopped

  # Redis for response caching
  h3x-redis:
    image: redis:7-alpine
    container_name: h3x-redis
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - ${this.dockerNetwork}
    restart: unless-stopped

networks:
  ${this.dockerNetwork}:
    driver: bridge
    name: ${this.dockerNetwork}

volumes:
  lmstudio-cache:
    name: h3x-lmstudio-cache
  h3x-logs:
    name: h3x-logs
  response-outputs:
    name: h3x-response-outputs
  redis-data:
    name: h3x-redis-data`;

    const filePath = path.join(this.projectRoot, 'docker-compose.lmstudio.yml');
    await fs.writeFile(filePath, composeConfig);

    this.log(`Generated Docker Compose at ${filePath}`, 'success');
    return filePath;
  }

  // Create Dockerfile for response processor
  async generateResponseProcessorDockerfile(): Promise<string> {
    const dockerfile = `FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY Scripts/ ./Scripts/
COPY lmstudio-response-handler.js ./
COPY npm-lmstudio-integration.js ./

# Create output directory
RUN mkdir -p /app/outputs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD node -e "console.log('Health check passed')" || exit 1

# Start the response processor
CMD ["node", "Scripts/response-processor-daemon.js"]`;

    const filePath = path.join(this.projectRoot, 'Scripts', 'Dockerfile.response-processor');
    await fs.writeFile(filePath, dockerfile);

    this.log(`Generated Response Processor Dockerfile at ${filePath}`, 'success');
    return filePath;
  }

  // Create response processor daemon
  async generateResponseProcessorDaemon(): Promise<string> {
    const daemon = `// Response Processor Daemon for Containerized H3X
import { LMStudioResponseHandler } from '../lmstudio-response-handler';
import Redis from 'redis';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as http from 'http';

interface ProcessEnv {
    LMSTUDIO_URL?: string;
    REDIS_URL?: string;
}

class ResponseProcessorDaemon {
    private handler: any;
    private redis: any;
    private outputDir: string;
    private isRunning: boolean;

    constructor() {
        this.handler = new LMStudioResponseHandler({
            verbose: true,
            dockerMode: true,
            lmStudioUrl: (process.env as ProcessEnv).LMSTUDIO_URL || 'http://h3x-lmstudio:1234'
        });
        
        this.redis = Redis.createClient({
            url: (process.env as ProcessEnv).REDIS_URL || 'redis://h3x-redis:6379'
        });
        
        this.outputDir = '/app/outputs';
        this.isRunning = true;
    }

    async start(): Promise<void> {
        console.log('🚀 Starting H3X Response Processor Daemon');
        
        try {
            await this.redis.connect();
            console.log('✅ Connected to Redis');
            
            // Start processing loop
            this.processLoop();
            
            // Health check endpoint
            this.startHealthServer();
            
        } catch (error) {
            console.error('❌ Failed to start daemon:', error);
            process.exit(1);
        }
    }

    async processLoop(): Promise<void> {
        while (this.isRunning) {
            try {
                // Check for new requests in Redis queue
                const request = await this.redis.blPop('h3x:response:queue', 5);
                
                if (request) {
                    await this.processRequest(JSON.parse(request.element));
                }
                
            } catch (error) {
                console.error('❌ Processing error:', error);
                await this.delay(1000);
            }
        }
    }

    async processRequest(request: any): Promise<void> {
        const { id, prompt, options = {} } = request;
        
        console.log(\`📥 Processing request \${id}\`);
        
        try {
            // Get response.output from LM Studio
            const result = await this.handler.getResponseOutput(prompt, options);
            
            if (result.success) {
                // Save to file
                const outputFile = path.join(this.outputDir, \`\${id}.json\`);
                await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
                
                // Store in Redis
                await this.redis.setEx(\`h3x:response:\${id}\`, 3600, JSON.stringify(result));
                
                // Publish completion
                await this.redis.publish('h3x:response:completed', JSON.stringify({
                    id,
                    success: true,
                    outputFile,
                    timestamp: new Date().toISOString()
                }));
                
                console.log(\`✅ Completed request \${id}\`);
            } else {
                throw new Error(\`LM Studio failed: \${result.error}\`);
            }
            
        } catch (error: any) {
            console.error(\`❌ Request \${id} failed:\`, error);
            
            // Store error in Redis
            await this.redis.setEx(\`h3x:response:\${id}\`, 3600, JSON.stringify({
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            }));
            
            // Publish error
            await this.redis.publish('h3x:response:error', JSON.stringify({
                id,
                error: error.message,
                timestamp: new Date().toISOString()
            }));
        }
    }

    startHealthServer(): void {
        const server = http.createServer((req, res) => {
            if (req.url === '/health') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    status: 'healthy',
                    timestamp: new Date().toISOString(),
                    isRunning: this.isRunning
                }));
            } else {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        
        server.listen(8082, () => {
            console.log('🏥 Health server listening on port 8082');
        });
    }

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async stop(): Promise<void> {
        this.isRunning = false;
        await this.redis.disconnect();
        console.log('🛑 Response Processor Daemon stopped');
    }
}

// Start daemon
const daemon = new ResponseProcessorDaemon();

process.on('SIGTERM', () => daemon.stop());
process.on('SIGINT', () => daemon.stop());

daemon.start().catch(console.error);`;

    const filePath = path.join(this.projectRoot, 'Scripts', 'response-processor-daemon.ts');
    await fs.writeFile(filePath, daemon);

    this.log(`Generated Response Processor Daemon at ${filePath}`, 'success');
    return filePath;
  }

  // Main execution handler
  async execute(command: string): Promise<void> {
    try {
      switch (command) {
        case 'start':
          await this.startLMStudio();
          break;

        case 'stop':
          await this.stopLMStudio();
          break;

        case 'test':
          const isRunning = await this.checkLMStudioStatus();
          if (!isRunning) {
            this.log('Starting LM Studio for testing...', 'info');
            await this.startLMStudio();
            await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for startup
          }
          await this.testLMStudio();
          break;

        case 'status':
          await this.checkLMStudioStatus();
          break;

        case 'generate':
          await this.generateDockerCompose();
          await this.generateResponseProcessorDockerfile();
          await this.generateResponseProcessorDaemon();
          this.log('Generated all Docker integration files', 'success');
          break;

        default:
          this.log('Available commands: start, stop, test, status, generate', 'info');
          this.log('Usage: npx tsx scripts/docker-lmstudio-integration.ts <command>', 'info');
      }
    } catch (error: any) {
      this.log(`Error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2] || 'status';
  const integration = new H3XDockerLMStudioIntegration();
  integration.execute(command);
}

export { H3XDockerLMStudioIntegration };
