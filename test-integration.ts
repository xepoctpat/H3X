#!/usr/bin/env node

/**
 * H3X AI Integration System Test Suite
 * Tests all components: H3X Server, Protocol Server, M365 Bot, and WebSocket connections
 */

import * as http from 'http';
import * as WebSocket from 'ws';
import { exec } from 'child_process';

console.log('🧠 H3X AI Integration System Test Suite');
console.log('=======================================\n');

async function testHttpEndpoint(url, description): Promise<any> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    http
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          const elapsed = Date.now() - startTime;
          console.log(`✅ ${description}: HTTP ${res.statusCode} (${elapsed}ms)`);
          resolve({ success: true, status: res.statusCode, data, elapsed });
        });
      })
      .on('error', (err) => {
        const elapsed = Date.now() - startTime;
        console.log(`❌ ${description}: FAILED (${elapsed}ms) - ${err.message}`);
        resolve({ success: false, error: err.message, elapsed });
      });
  });
}

async function testWebSocket(url, description): Promise<any> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    try {
      const ws = new WebSocket(url);

      ws.on('open', () => {
        const elapsed = Date.now() - startTime;
        console.log(`✅ ${description}: WebSocket Connected (${elapsed}ms)`);
        ws.send(JSON.stringify({ type: 'test', message: 'H3X Integration Test' }));
      });

      ws.on('message', (data) => {
        const elapsed = Date.now() - startTime;
        console.log(`✅ ${description}: Message Received (${elapsed}ms)`);
        ws.close();
        resolve({ success: true, elapsed });
      });

      ws.on('error', (err) => {
        const elapsed = Date.now() - startTime;
        console.log(`❌ ${description}: WebSocket Error (${elapsed}ms) - ${err.message}`);
        resolve({ success: false, error: err.message, elapsed });
      });

      // Timeout after 5 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN) {
          ws.close();
          const elapsed = Date.now() - startTime;
          console.log(`⚠️  ${description}: WebSocket Timeout (${elapsed}ms)`);
          resolve({ success: false, error: 'Timeout', elapsed });
        }
      }, 5000);
    } catch (err) {
      const elapsed = Date.now() - startTime;
      console.log(`❌ ${description}: WebSocket Creation Failed (${elapsed}ms) - ${err.message}`);
      resolve({ success: false, error: err.message, elapsed });
    }
  });
}

async function runTests(): Promise<any> {
  console.log('🔍 Testing Core Services...\n');

  // Test H3X Server
  const h3xTest = await testHttpEndpoint('http://localhost:3978', 'H3X Neural Server');

  // Test Protocol Server
  const protocolHealthTest = await testHttpEndpoint(
    'http://localhost:8080/api/health',
    'Protocol Server Health',
  );
  const protocolStatusTest = await testHttpEndpoint(
    'http://localhost:8080/api/status',
    'Protocol Server Status',
  );

  // Test LMStudio Connection
  const lmstudioTest = await testHttpEndpoint('http://localhost:1234/v1/models', 'LMStudio API');

  console.log('\n🔗 Testing WebSocket Connections...\n');

  // Test Protocol WebSocket
  const wsTest = await testWebSocket('ws://localhost:8080/ws', 'Protocol WebSocket');

  console.log('\n📊 Testing Static Resources...\n');

  // Test AI Integration Control Center
  const controlCenterTest = await testHttpEndpoint(
    'http://localhost:3978/ai-integration-control-center.html',
    'AI Integration Control Center',
  );

  // Test System Status Dashboard
  const dashboardTest = await testHttpEndpoint(
    'http://localhost:3978/system-status-dashboard.html',
    'System Status Dashboard',
  );

  // Test Core JavaScript
  const coreJsTest = await testHttpEndpoint(
    'http://localhost:3978/js/ai-integration-control-core.js',
    'Core JavaScript',
  );

  console.log('\n📈 Test Results Summary');
  console.log('=====================\n');

  const results = [
    { name: 'H3X Neural Server', result: h3xTest },
    { name: 'Protocol Server Health', result: protocolHealthTest },
    { name: 'Protocol Server Status', result: protocolStatusTest },
    { name: 'LMStudio API', result: lmstudioTest },
    { name: 'Protocol WebSocket', result: wsTest },
    { name: 'AI Control Center', result: controlCenterTest },
    { name: 'Status Dashboard', result: dashboardTest },
    { name: 'Core JavaScript', result: coreJsTest },
  ];

  let passed = 0;
  let failed = 0;

  results.forEach(({ name, result }) => {
    if (result.success) {
      console.log(`✅ ${name}: PASS`);
      passed++;
    } else {
      console.log(`❌ ${name}: FAIL - ${result.error || 'Unknown error'}`);
      failed++;
    }
  });

  console.log(`\n🎯 Overall Results: ${passed} PASSED, ${failed} FAILED`);
  console.log(`💯 Success Rate: ${Math.round((passed / results.length) * 100)}%\n`);

  if (failed === 0) {
    console.log('🚀 ALL SYSTEMS OPERATIONAL! H3X AI Integration System is ready for deployment.');
  } else {
    console.log('⚠️  Some components need attention before full deployment.');
  }

  console.log('\n🔧 Available Endpoints:');
  console.log('- H3X Neural Server: http://localhost:3978');
  console.log('- AI Control Center: http://localhost:3978/ai-integration-control-center.html');
  console.log('- Status Dashboard: http://localhost:3978/system-status-dashboard.html');
  console.log('- Protocol Server: http://localhost:8080');
  console.log('- Protocol WebSocket: ws://localhost:8080/ws');
  console.log('- M365 Bot Endpoint: http://localhost:3978/api/messages');
  console.log('- LMStudio API: http://localhost:1234 (if running)');
}

// Install WebSocket if not available
try {
  require('ws');
  runTests();
} catch (err) {
  console.log('📦 Installing WebSocket dependency...\n');
  import { exec } from 'child_process';
  exec('npm install ws', (error, stdout, stderr) => {
    if (error) {
      console.log('❌ Failed to install WebSocket dependency. Running basic tests only...\n');
      runTests();
    } else {
      console.log('✅ WebSocket dependency installed. Running full tests...\n');
      delete require.cache[require.resolve('ws')];
      runTests();
    }
  });
}
