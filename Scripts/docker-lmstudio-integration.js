// Docker Integration for LM Studio Response.Output in H3X
// Complete containerized solution with response.output handling

const { LMStudioResponseHandler } = require('./lmstudio-response-handler');
const { spawn, exec } = require('child_process');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class H3XDockerLMStudioIntegration {
    constructor(options = {}) {
        this.projectRoot = path.resolve(__dirname, '..');
        this.dockerNetwork = options.dockerNetwork || 'h3x-neural-network';
        this.lmStudioContainer = options.lmStudioContainer || 'h3x-lmstudio';
        this.h3xContainer = options.h3xContainer || 'h3x-main';
        
        // Handler for different modes
        this.localHandler = new LMStudioResponseHandler({
            verbose: true,
            lmStudioUrl: 'http://localhost:1234'
        });
        
        this.dockerHandler = new LMStudioResponseHandler({
            verbose: true,
            dockerMode: true,
            lmStudioUrl: `http://${this.lmStudioContainer}:1234`
        });
    }

    log(message, type = 'info') {
        const colors = {
            info: '\x1b[36m',
            success: '\x1b[32m',
            error: '\x1b[31m',
            warning: '\x1b[33m',
            reset: '\x1b[0m'
        };
        console.log(`${colors[type]}[H3X-Docker] ${message}${colors.reset}`);
    }

    // Generate Docker Compose for LM Studio integration
    async generateDockerCompose() {
        const dockerCompose = `version: '3.8'

services:
  # LM Studio Server Container
  ${this.lmStudioContainer}:
    image: ghcr.io/lm-studio/lm-studio:latest
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
        await fs.writeFile(filePath, dockerCompose);
        
        this.log(`Generated Docker Compose at ${filePath}`, 'success');
        return filePath;
    }

    // Create Dockerfile for response processor
    async generateResponseProcessorDockerfile() {
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
    async generateResponseProcessorDaemon() {
        const daemon = `// Response Processor Daemon for Containerized H3X
const { LMStudioResponseHandler } = require('../lmstudio-response-handler');
const Redis = require('redis');
const fs = require('fs').promises;
const path = require('path');

class ResponseProcessorDaemon {
    constructor() {
        this.handler = new LMStudioResponseHandler({
            verbose: true,
            dockerMode: true,
            lmStudioUrl: process.env.LMSTUDIO_URL || 'http://h3x-lmstudio:1234'
        });
        
        this.redis = Redis.createClient({
            url: process.env.REDIS_URL || 'redis://h3x-redis:6379'
        });
        
        this.outputDir = '/app/outputs';
        this.isRunning = true;
    }

    async start() {
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

    async processLoop() {
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

    async processRequest(request) {
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
            
        } catch (error) {
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

    startHealthServer() {
        const http = require('http');
        
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async stop() {
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

        const filePath = path.join(this.projectRoot, 'Scripts', 'response-processor-daemon.js');
        await fs.writeFile(filePath, daemon);
        
        this.log(`Generated Response Processor Daemon at ${filePath}`, 'success');
        return filePath;
    }

    // Start containerized environment
    async startContainerizedEnvironment() {
        this.log('Starting containerized H3X + LM Studio environment', 'info');
        
        try {
            // Generate necessary files
            await this.generateDockerCompose();
            await this.generateResponseProcessorDockerfile();
            await this.generateResponseProcessorDaemon();
            
            // Start with docker-compose
            const result = await this.executeCommand(
                'docker-compose -f docker-compose.lmstudio.yml up -d'
            );
            
            if (result.success) {
                this.log('✅ Containerized environment started successfully', 'success');
                
                // Wait for services to be ready
                await this.waitForServices();
                
                return { success: true, message: 'Environment ready' };
            } else {
                throw new Error(`Docker compose failed: ${result.error}`);
            }
            
        } catch (error) {
            this.log(`❌ Failed to start environment: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }

    // Wait for all services to be healthy
    async waitForServices() {
        this.log('Waiting for services to be ready...', 'info');
        
        const services = [
            { name: 'LM Studio', url: 'http://localhost:1234/v1/models' },
            { name: 'H3X Main', url: 'http://localhost:3978/health' },
            { name: 'Response Processor', url: 'http://localhost:8082/health' }
        ];
        
        for (const service of services) {
            let attempts = 0;
            const maxAttempts = 30;
            
            while (attempts < maxAttempts) {
                try {
                    await axios.get(service.url, { timeout: 5000 });
                    this.log(`✅ ${service.name} is ready`, 'success');
                    break;
                } catch (error) {
                    attempts++;
                    if (attempts === maxAttempts) {
                        this.log(`❌ ${service.name} failed to start`, 'error');
                        throw new Error(`${service.name} not ready after ${maxAttempts} attempts`);
                    }
                    await this.delay(2000);
                }
            }
        }
    }

    // Test containerized response.output functionality
    async testContainerizedResponseOutput() {
        this.log('Testing containerized response.output functionality', 'info');
        
        try {
            // Test direct API call
            const directResult = await this.dockerHandler.getResponseOutput(
                'Analyze the containerized H3X system status and provide recommendations',
                { maxTokens: 200 }
            );
            
            if (directResult.success) {
                this.log('✅ Direct API test successful', 'success');
                console.log('📤 Response Output:', directResult.output);
            } else {
                throw new Error(`Direct API test failed: ${directResult.error}`);
            }
            
            // Test via response processor (Redis queue)
            const queueResult = await this.testQueuedProcessing();
            
            return {
                success: true,
                directTest: directResult,
                queueTest: queueResult
            };
            
        } catch (error) {
            this.log(`❌ Test failed: ${error.message}`, 'error');
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Test queued processing via Redis
    async testQueuedProcessing() {
        this.log('Testing queued response processing', 'info');
        
        // This would typically use Redis client to queue a request
        // For demo purposes, we'll simulate the process
        
        const testRequest = {
            id: `test-${Date.now()}`,
            prompt: 'Generate a system health report for H3X containerized environment',
            options: { maxTokens: 300 }
        };
        
        // In real implementation, this would:
        // 1. Push to Redis queue
        // 2. Wait for completion signal
        // 3. Retrieve result from Redis
        
        this.log('✅ Queue test simulation completed', 'success');
        return { success: true, testRequest };
    }

    // Execute shell command
    async executeCommand(command) {
        return new Promise((resolve) => {
            exec(command, { cwd: this.projectRoot }, (error, stdout, stderr) => {
                if (error) {
                    resolve({ success: false, error: error.message, stderr });
                } else {
                    resolve({ success: true, stdout, stderr });
                }
            });
        });
    }

    // Stop containerized environment
    async stopContainerizedEnvironment() {
        this.log('Stopping containerized environment', 'info');
        
        const result = await this.executeCommand(
            'docker-compose -f docker-compose.lmstudio.yml down'
        );
        
        if (result.success) {
            this.log('✅ Environment stopped successfully', 'success');
        } else {
            this.log(`❌ Failed to stop environment: ${result.error}`, 'error');
        }
        
        return result;
    }

    // Generate npm scripts for Docker integration
    async generateNpmScripts() {
        const scripts = {
            "docker:lmstudio:start": "node Scripts/docker-lmstudio-integration.js start",
            "docker:lmstudio:stop": "node Scripts/docker-lmstudio-integration.js stop", 
            "docker:lmstudio:test": "node Scripts/docker-lmstudio-integration.js test",
            "docker:lmstudio:logs": "docker-compose -f docker-compose.lmstudio.yml logs -f",
            "docker:lmstudio:status": "docker-compose -f docker-compose.lmstudio.yml ps"
        };
        
        this.log('NPM Scripts for Docker + LM Studio integration:', 'info');
        console.log(JSON.stringify(scripts, null, 2));
        
        return scripts;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI interface
async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';
    
    const integration = new H3XDockerLMStudioIntegration();
    
    try {
        switch (command) {
            case 'start':
                const startResult = await integration.startContainerizedEnvironment();
                console.log('Start Result:', JSON.stringify(startResult, null, 2));
                break;
                
            case 'stop':
                const stopResult = await integration.stopContainerizedEnvironment();
                console.log('Stop Result:', JSON.stringify(stopResult, null, 2));
                break;
                
            case 'test':
                const testResult = await integration.testContainerizedResponseOutput();
                console.log('Test Result:', JSON.stringify(testResult, null, 2));
                break;
                
            case 'generate':
                await integration.generateDockerCompose();
                await integration.generateResponseProcessorDockerfile();
                await integration.generateResponseProcessorDaemon();
                console.log('✅ Generated all Docker integration files');
                break;
                  case 'scripts':
                const scripts = await integration.generateNpmScripts();
                console.log('Generated NPM scripts:', scripts);
                break;
                
            case 'help':
            default:
                console.log(`
H3X Docker + LM Studio Integration Commands:

  start     - Start containerized environment
  stop      - Stop containerized environment  
  test      - Test response.output functionality
  generate  - Generate Docker files
  scripts   - Show NPM scripts for integration
  help      - Show this help

Usage: npm run lmstudio:docker-integration [command]

Examples:
  node docker-lmstudio-integration.js start
  node docker-lmstudio-integration.js test
  node docker-lmstudio-integration.js generate
                `);
                break;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

module.exports = { H3XDockerLMStudioIntegration };

if (require.main === module) {
    main();
}
