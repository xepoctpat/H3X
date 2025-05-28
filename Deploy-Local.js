#!/usr/bin/env node

/**
 * SIR No-OpenAI Deployment Script
 * 
 * This script deploys the Hexperiment Labs SIR Control Interface
 * without OpenAI dependency, using only Microsoft SDK Agents.
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');

console.log('🔬 Deploying Hexperiment Labs SIR Control Interface (No OpenAI Version)...\n');

// Check if required files exist
const requiredFiles = [
    'src/agent-no-openai.js',
    'src/tools/monitoringTool.js',
    'src/tools/humanSupervisionTool.js',
    'src/framework/hexperimentFramework.js'
];

for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(__dirname, file))) {
        console.error(`❌ Required file missing: ${file}`);
        process.exit(1);
    }
}

// Set environment
process.env.TEAMSFX_ENV = 'standalone';
process.env.USE_OPENAI = 'false';

console.log('✅ Configuration validated');

// Update package.json to add no-openai scripts
const packageJsonPath = path.join(__dirname, 'package.json');
let packageJson;

try {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Add no-openai specific scripts
    packageJson.scripts = {
        ...packageJson.scripts,
        "no-openai": "node -r dotenv/config ./src/index.js dotenv_config_path=./env/.env.standalone",
        "no-openai:dev": "nodemon --inspect=9239 --signal SIGINT -r dotenv/config ./src/index.js dotenv_config_path=./env/.env.standalone",
        "no-openai:test": "node test-client-no-openai.js"
    };
    
    // Write back the updated package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 4));
    console.log('✅ package.json updated with no-openai scripts');
} catch (error) {
    console.error('❌ Error updating package.json:', error.message);
}

// Start the server
console.log('🚀 Launching SIR Control Interface (No OpenAI Version)...');
console.log('📍 Server will be available at: http://localhost:3978');
console.log('🔍 API endpoints:');
console.log('   • POST /api/messages - Bot Framework endpoint');
console.log('   • GET /health - Health check endpoint');
console.log('   • GET / - Service status information');
console.log('\n📋 Available commands:');
console.log('   • "npm run no-openai" - Start the no-OpenAI version');
console.log('   • "npm run no-openai:dev" - Start with hot-reload');
console.log('   • "npm run no-openai:test" - Run the no-OpenAI test client');

// Create the server process
console.log('\n🔄 Starting server...');
const server = spawn('node', ['src/index.js'], {
    env: {
        ...process.env,
        USE_OPENAI: 'false'
    },
    stdio: 'inherit'
});

server.on('error', (error) => {
    console.error('❌ Error starting server:', error.message);
});

// Listen for termination signals
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping server...');
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Stopping server...');
    server.kill('SIGTERM');
    process.exit(0);
});
