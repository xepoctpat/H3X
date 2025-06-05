
// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

interface ConsoleLog {
  log: (message?: any, ...optionalParams: any[]) => void;
  error: (message?: any, ...optionalParams: any[]) => void;
  warn: (message?: any, ...optionalParams: any[]) => void;
}

#!/usr/bin/env node

/**
 * Hexperiment Labs SIR Control Interface Launcher
 *
 * Launches the SIR system as a standalone Express server
 * with M365 integration capabilities.
 */

import fs = require('fs');
import path = require('path');
import { exec, spawn } from 'child_process';

console.log(
  '🔬 Starting Hexperiment Labs SIR Control Interface in Standalone Mode...\n'
);

// Check if required files exist
const requiredFiles = ['env/.env.standalone', 'src/agent.js', 'package.json'];

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ Required file missing: ${file}`);
    process.exit(1);
  }
}

// Load standalone environment
(process.env as ProcessEnv).TEAMSFX_ENV = 'standalone';

console.log('✅ Configuration validated');

// Start the server
console.log('🚀 Launching SIR Control Interface Server (No OpenAI)...');
console.log('📍 Server will be available at: http://localhost:3978');
console.log('🔍 API endpoints:');
console.log('   • POST /api/messages - Bot Framework endpoint');
console.log('   • GET /health - Health check');
console.log('   • GET / - Status page\n');

// Start with environment variables
const env = {
  ...process.env,
  TEAMSFX_ENV: 'standalone',
  NODE_ENV: 'development',
};

const child = spawn('node', ['src/index.js'], {
  env,
  stdio: 'inherit',
  cwd: __dirname,
});

child.on('error', (err) => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`❌ Server exited with code ${code}`);
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down SIR Control Interface...');
  child.kill('SIGTERM');
});

process.on('SIGTERM', () => {
  child.kill('SIGTERM');
});
