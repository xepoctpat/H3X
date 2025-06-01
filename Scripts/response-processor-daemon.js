// Response Processor Daemon for Containerized H3X
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
        
        console.log(`📥 Processing request ${id}`);
        
        try {
            // Get response.output from LM Studio
            const result = await this.handler.getResponseOutput(prompt, options);
            
            if (result.success) {
                // Save to file
                const outputFile = path.join(this.outputDir, `${id}.json`);
                await fs.writeFile(outputFile, JSON.stringify(result, null, 2));
                
                // Store in Redis
                await this.redis.setEx(`h3x:response:${id}`, 3600, JSON.stringify(result));
                
                // Publish completion
                await this.redis.publish('h3x:response:completed', JSON.stringify({
                    id,
                    success: true,
                    outputFile,
                    timestamp: new Date().toISOString()
                }));
                
                console.log(`✅ Completed request ${id}`);
            } else {
                throw new Error(`LM Studio failed: ${result.error}`);
            }
            
        } catch (error) {
            console.error(`❌ Request ${id} failed:`, error);
            
            // Store error in Redis
            await this.redis.setEx(`h3x:response:${id}`, 3600, JSON.stringify({
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

daemon.start().catch(console.error);