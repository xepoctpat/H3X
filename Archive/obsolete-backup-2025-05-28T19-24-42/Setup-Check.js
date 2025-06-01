/**
 * Hexperiment Labs SIR Control Interface Setup Verification Script
 * Checks prerequisites and validates different deployment options
 */

const fs = require('fs');
const path = require('path');
const net = require('net');

console.log('🔬 Hexperiment Labs SIR Control Interface - Setup Verification\n');

// Check Node.js version
const nodeVersion = process.version;
const major = parseInt(nodeVersion.split('.')[0].slice(1));
console.log(`✅ Node.js Version: ${nodeVersion} ${major >= 18 ? '(Supported)' : '(⚠️  Requires 18+)'}`);

// Check package.json exists
const packageExists = fs.existsSync('package.json');
console.log(`${packageExists ? '✅' : '❌'} package.json found`);

// Check dependencies installed
const nodeModulesExists = fs.existsSync('node_modules');
console.log(`${nodeModulesExists ? '✅' : '❌'} Dependencies installed (run: npm install)`);

// Check OpenAI API key configuration
const playgroundEnvExists = fs.existsSync('env/.env.playground.user');
console.log(`${playgroundEnvExists ? '✅' : '❌'} Playground environment file exists`);

if (playgroundEnvExists) {
  const envContent = fs.readFileSync('env/.env.playground.user', 'utf8');
  const hasOpenAIKey = envContent.includes('SECRET_OPENAI_API_KEY=') && !envContent.includes('your_openai_api_key_here');
  console.log(`${hasOpenAIKey ? '✅' : '❌'} OpenAI API key configured`);
}

// Simple port check function
function checkPort(port, service) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    
    socket.on('connect', () => {
      console.log(`❌ Port ${port} in use (${service} may already be running)`);
      socket.destroy();
      resolve(false);
    });
    
    socket.on('timeout', () => {
      console.log(`✅ Port ${port} available for ${service}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('error', () => {
      console.log(`✅ Port ${port} available for ${service}`);
      resolve(true);
    });
    
    socket.connect(port, 'localhost');
  });
}

async function checkPorts() {
  console.log('\n🔌 Port Availability:');
  await checkPort(3978, 'Agent Server');
  await checkPort(56150, 'Playground');
  await checkPort(9239, 'Debug Port');
}

// Check VS Code tasks
function checkVSCodeTasks() {
  console.log('\n📋 Available VS Code Tasks:');
  const tasks = [
    'teamsfx: Validate prerequisites (Microsoft 365 Agents Playground)',
    'shell: Start application (Microsoft 365 Agents Playground)',
    'shell: Start Microsoft 365 Agents Playground',
    'teamsfx: Provision',
    'teamsfx: Deploy',
    'teamsfx: Start desktop client'
  ];
  
  tasks.forEach(task => {
    console.log(`   • ${task}`);
  });
}

// Deployment options summary
function showDeploymentOptions() {
  console.log('\n🚀 Deployment Options:');
  console.log('\n1. 🧪 PLAYGROUND TESTING (No MS365 account needed)');
  console.log('   npm run dev:teamsfx:playground');
  console.log('   npm run dev:teamsfx:launch-playground');
  console.log('   → Opens browser at http://localhost:56150');
  
  console.log('\n2. 🤖 MICROSOFT TEAMS INTEGRATION');
  console.log('   Teams Toolkit: Validate prerequisites');
  console.log('   Teams Toolkit: Provision');
  console.log('   Teams Toolkit: Deploy');
  console.log('   Teams Toolkit: Start desktop client');
  
  console.log('\n3. 🌐 STANDALONE EXPRESS SERVER');
  console.log('   npm start');
  console.log('   → Server runs on http://localhost:3978');
  
  console.log('\n4. ☁️  AZURE BOT SERVICE');
  console.log('   Teams Toolkit: Provision');
  console.log('   Teams Toolkit: Deploy');
  console.log('   → Deployed to Azure with public endpoint');
}

// Sample test queries
function showTestQueries() {
  console.log('\n💬 Sample Test Queries:');
  console.log('   • "What is the current status of the SIR system?"');
  console.log('   • "Can you analyze the environment for optimal AI assistant deployment?"');
  console.log('   • "Please run a simulation for office environment conditions"');
  console.log('   • "Generate an AI assistant for customer service environment"');
}

async function main() {
  await checkPorts();
  checkVSCodeTasks();
  showDeploymentOptions();
  showTestQueries();
  
  console.log('\n🎯 Quick Start:');
  console.log('1. Ensure OpenAI API key is set in env/.env.playground.user');
  console.log('2. Run: npm run dev:teamsfx:playground');
  console.log('3. Run: npm run dev:teamsfx:launch-playground');
  console.log('4. Test in browser at http://localhost:56150');
  
  console.log('\n📚 See README.md for detailed setup instructions');
}

main().catch(console.error);
