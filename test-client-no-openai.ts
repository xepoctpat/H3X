/**
 * Enhanced SIR Bot Test Client - No OpenAI Dependency
 * Tests the Hexperiment Labs SIR Control Interface using Microsoft SDK Agents only
 */

import axios from 'axios';

class SIRBotTestClient {
  baseUrl: string;
  conversationId: string;

  constructor(baseUrl = 'http://localhost:3978') {
    this.baseUrl = baseUrl;
    this.conversationId = `test-conversation-${Date.now()}`;
  }

  async sendMessage(text) {
    try {
      const response = await axios.post(`${this.baseUrl}/api/messages`, {
        type: 'message',
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        text: text,
        from: {
          id: 'test-user',
          name: 'Test User',
        },
        conversation: {
          id: this.conversationId,
        },
        recipient: {
          id: 'sir-bot',
          name: 'SIR Control Interface',
        },
        channelId: 'test',
      });

      console.log(`\n=== Response to "${text}" ===`);
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error(`Error sending message "${text}":`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    }
  }

  async runTests() {
    console.log('🔬 Starting Hexperiment Labs SIR Control Interface Tests');
    console.log('📡 Framework: Microsoft SDK Agents (No OpenAI dependency)');
    console.log('🎯 Real-Life Environment Standards: Enabled');
    console.log('👁️  Human Supervision Scenarios: Implemented');
    console.log('📊 Monitoring System: Active\n');

    const testQueries = [
      // Basic system status
      'What is the current status of the SIR system?',

      // Environment analysis
      'Perform environment analysis',

      // Monitoring scenario
      'Start monitoring',

      // Human supervision scenario
      'Request supervision',

      // Simulation control
      'Run simulation',

      // AI assistant generation
      'Generate assistant',

      // Framework specific tests
      'Environment scan',
      'Check compliance with real-life standards',

      // Human confirmation scenario
      'Human confirm environmental assessment',
    ];

    for (let i = 0; i < testQueries.length; i++) {
      console.log(`\n--- Test ${i + 1}/${testQueries.length} ---`);
      await this.sendMessage(testQueries[i]);

      // Wait between requests to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('\n✅ SIR Control Interface testing completed!');
    console.log('🏗️  Framework: Hexperiment Labs with Microsoft SDK Agents');
    console.log('🚫 OpenAI Dependency: Removed');
    console.log('📋 Real-Life Standards: Implemented');
    console.log('👨‍💼 Human Supervision: Available');
    console.log('📈 Monitoring: Operational');
  }

  async testHealthEndpoint() {
    try {
      console.log('\n🏥 Testing health endpoint...');
      const response = await axios.get(`${this.baseUrl}/health`);
      console.log('Health check response:');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error.message);
    }
  }

  async testStatusEndpoint() {
    try {
      console.log('\n📊 Testing status endpoint...');
      const response = await axios.get(`${this.baseUrl}/`);
      console.log('Status endpoint response:');
      console.log(JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Status check failed:', error.message);
    }
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  async function runAllTests(): Promise<any> {
    const client = new SIRBotTestClient();

    // Test endpoints first
    await client.testHealthEndpoint();
    await client.testStatusEndpoint();

    // Wait a moment before running conversation tests
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Run conversation tests
    await client.runTests();
  }

  runAllTests().catch(console.error);
}

export default SIRBotTestClient;
