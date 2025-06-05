#!/usr/bin/env node

/**
 * Run Modular SIR Dashboard
 * This script starts both the backend server and opens the dashboard in the browser
 */
import { spawn } from 'child_process';
import path = require('path');
import open = require('open');
import fs = require('fs');

console.log('🔮 Starting H3X SIR Control Interface with Modular Dashboard');

// Get the base directory
const baseDir = __dirname;

// Define paths
const backendScript = path.join(baseDir, 'Start-Lmstudio.js');
const frontendPath = `file://${path.join(baseDir, 'index.html')}`;

// Check if Start-Lmstudio.js exists
if (!fs.existsSync(backendScript)) {
  console.error('❌ Backend script not found:', backendScript);
  process.exit(1);
}

// Start the backend server
console.log('📡 Starting backend server...');
const backend = spawn('node', [backendScript], {
  stdio: 'inherit',
  shell: true,
});

// Handle backend server events
backend.on('error', (err) => {
  console.error('❌ Failed to start backend server:', err);
  process.exit(1);
});

// Wait for the server to start (could be improved with actual health check)
setTimeout(async () => {
  console.log('🌐 Opening SIR Control Interface in browser...');

  try {
    // Open the dashboard in the default browser
    await open(frontendPath);
    console.log('✅ SIR Control Interface started successfully');
    console.log('🔮 Backend running on http://localhost:3979');
    console.log('🔍 Press Ctrl+C to stop the servers');
  } catch (err) {
    console.error('❌ Failed to open browser:', err);
  }
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping SIR Control Interface...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Stopping SIR Control Interface...');
  backend.kill();
  process.exit(0);
});
