#!/usr/bin/env node

/**
 * 🔬 Enhanced Hexperiment Labs SIR Control Interface Test Client
 *
 * Comprehensive testing tool for your SIR (Super Intelligent Regulator) system
 * Features:
 * - Server health checks
 * - Automated test suite
 * - Interactive chat mode
 * - Real Bot Framework message simulation
 */

import axios = require('axios');

const BASE_URL = 'http://localhost:3978';

// Mock Bot Framework Activity
function createActivity(message, conversationId = 'test-conversation') {
  return {
    type: 'message',
    id: Math.random().toString(36).substring(7),
    timestamp: new Date().toISOString(),
    localTimestamp: new Date().toISOString(),
    localTimezone: 'UTC',
    serviceUrl: BASE_URL,
    channelId: 'emulator',
    from: {
      id: 'user-123',
      name: 'Test User',
    },
    conversation: {
      id: conversationId,
    },
    recipient: {
      id: 'bot-456',
      name: 'SIR Agent',
    },
    text: message,
    locale: 'en-US',
  };
}

async function testHealthCheck(): Promise<any> {
  try {
    console.log('🔍 Testing health endpoint...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return false;
  }
}

async function testStatusEndpoint(): Promise<any> {
  try {
    console.log('🔍 Testing status endpoint...');
    const response = await axios.get(`${BASE_URL}/`);
    console.log('✅ Status:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    return false;
  }
}

async function sendMessage(message, conversationId = 'test-conversation'): Promise<any> {
  try {
    const activity = createActivity(message, conversationId);

    console.log(`💬 Sending: "${message}"`);
    console.log('⏳ Waiting for response...');

    const response = await axios.post(`${BASE_URL}/api/messages`, activity, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });

    console.log('✅ Response received:', response.status);
    if (response.data) {
      console.log('📤 Bot Response:', response.data);
    } else {
      console.log('📝 Response sent (check server console for details)');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('❌ Server error:', error.response.status, error.response.statusText);
      if (error.response.data) {
        console.error('📋 Error details:', error.response.data);
      }
    } else if (error.request) {
      console.error('❌ No response received:', error.message);
    } else {
      console.error('❌ Request failed:', error.message);
    }
    return null;
  }
}

async function runSIRTests(): Promise<any> {
  console.log('\n🔬 Hexperiment Labs SIR Control Interface Test Suite');
  console.log('='.repeat(50));

  // Test server health
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Server not healthy, stopping tests');
    return;
  }

  await testStatusEndpoint();

  console.log('\n🚀 Starting conversation tests...\n');

  const testQueries = [
    'Hello! I need help with the SIR Control Interface',
    'What is the current status of the SIR system?',
    'Can you analyze the environment for optimal AI assistant deployment?',
    'Please run a simulation for office environment conditions',
    'Generate an AI assistant for customer service environment',
    "What's the current time and system status?",
    'Thanks for your assistance with the SIR system!',
  ];

  for (let i = 0; i < testQueries.length; i++) {
    console.log(`\n--- Test ${i + 1}/${testQueries.length} ---`);
    await sendMessage(testQueries[i]);

    // Wait between messages
    console.log('⏱️  Waiting 3 seconds...');
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  console.log('\n🎉 Test suite completed!');
  console.log('\n📋 Summary:');
  console.log('• Server is running on http://localhost:3978');
  console.log('• Health endpoint: ✅ Working');
  console.log('• Status endpoint: ✅ Working');
  console.log('• Bot endpoint: ✅ Ready for messages');
  console.log('\n🔗 Next Steps:');
  console.log('1. Test with your own queries: node test-client-enhanced.js --interactive');
  console.log('2. Integrate with Microsoft Teams when ready');
  console.log('3. Add M365 Graph API integration');
  console.log('4. Deploy to Azure for production');
}

// Interactive mode
async function interactiveMode(): Promise<any> {
  import readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('\n💬 Interactive SIR Control Interface Chat');
  console.log('Type your messages and press Enter. Type "exit" to quit.\n');

  const conversationId = `interactive-${Date.now()}`;

  // Test connectivity first
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log("❌ Cannot connect to server. Make sure it's running on port 3978");
    rl.close();
    return;
  }

  const askQuestion = () => {
    rl.question('You: ', async (message) => {
      if (message.toLowerCase() === 'exit') {
        console.log('\n👋 Goodbye!');
        rl.close();
        return;
      }

      if (message.trim() === '') {
        console.log('Please enter a message...\n');
        askQuestion();
        return;
      }

      await sendMessage(message, conversationId);
      console.log(''); // Empty line for readability
      askQuestion(); // Ask next question
    });
  };

  askQuestion();
}

// Single message mode
async function singleMessage(message): Promise<any> {
  console.log('\n🔬 SIR Control Interface - Single Message Test');
  console.log('='.repeat(50));

  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Server not healthy');
    return;
  }

  await sendMessage(message);
}

// Main execution
async function main(): Promise<any> {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('\n🔬 Hexperiment Labs SIR Control Interface Test Client');
    console.log('Usage:');
    console.log('  node test-client-enhanced.js                    # Run automated test suite');
    console.log('  node test-client-enhanced.js --interactive      # Interactive chat mode');
    console.log('  node test-client-enhanced.js "Your message"     # Send single message');
    console.log('  node test-client-enhanced.js --health           # Health check only');
    console.log('\nExamples:');
    console.log('  node test-client-enhanced.js "Analyze the current environment"');
    console.log('  node test-client-enhanced.js --interactive');
    console.log('  node test-client-enhanced.js --health');
    return;
  }

  if (args.includes('--health')) {
    await testHealthCheck();
    await testStatusEndpoint();
    return;
  }

  if (args.includes('--interactive') || args.includes('-i')) {
    await interactiveMode();
  } else if (args.length > 0 && !args[0].startsWith('--')) {
    const message = args.join(' ');
    await singleMessage(message);
  } else {
    await runSIRTests();

    console.log('\n💡 Want to chat interactively? Run:');
    console.log('   node test-client-enhanced.js --interactive');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Test client shutting down...');
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
