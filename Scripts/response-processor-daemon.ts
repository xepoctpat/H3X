// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

// Response Processor Daemon for Containerized H3X
import * as fs from 'fs/promises';
import * as path from 'path';

import * as Redis from 'redis';

import { LMStudioResponseHandler } from '../scripts/lmstudio-response-handler';

class ResponseProcessorDaemon {
  handler: any;
  redis: any;
  outputDir: string;
  isRunning: boolean;

  constructor() {
    this.handler = new LMStudioResponseHandler({
      verbose: true,
      dockerMode: true,
      lmStudioUrl: (process.env as ProcessEnv).LMSTUDIO_URL ?? 'http://h3x-lmstudio:1234',
    });

    this.redis = Redis.createClient({
      url: (process.env as ProcessEnv).REDIS_URL ?? 'redis://h3x-redis:6379',
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
      void this.processLoop();

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
        await this.redis.publish(
          'h3x:response:completed',
          JSON.stringify({
            id,
            success: true,
            outputFile,
            timestamp: new Date().toISOString(),
          }),
        );

        console.log(`✅ Completed request ${id}`);
      } else {
        throw new Error(`LM Studio failed: ${result.error}`);
      }
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Request ${id} failed:`, errMsg);

      // Store error in Redis
      await this.redis.setEx(
        `h3x:response:${id}`,
        3600,
        JSON.stringify({
          success: false,
          error: errMsg,
          timestamp: new Date().toISOString(),
        }),
      );

      // Publish error
      await this.redis.publish(
        'h3x:response:error',
        JSON.stringify({
          id,
          error: errMsg,
          timestamp: new Date().toISOString(),
        }),
      );
    }
  }

  startHealthServer(): void {
    const http = require('http');

    const server = http.createServer((req: any, res: any) => {
      if (req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            isRunning: this.isRunning,
          }),
        );
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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async stop(): Promise<void> {
    this.isRunning = false;
    await this.redis.disconnect();
    console.log('🛑 Response Processor Daemon stopped');
  }
}

// Start daemon
const daemon = new ResponseProcessorDaemon();

process.on('SIGTERM', () => {
  void daemon.stop();
});
process.on('SIGINT', () => {
  void daemon.stop();
});

daemon.start().catch((err) => console.error(err));
