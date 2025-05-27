/**
 * Standalone Bot Test Client
 * Test your weather agent directly via HTTP API
 */

const axios = require('axios');

const BOT_URL = 'http://localhost:3978/api/messages';

class WeatherBotClient {
  constructor() {
    this.conversationId = `test-conv-${Date.now()}`;
    this.userId = 'test-user-1';
  }

  async sendMessage(text) {
    const message = {
      type: 'message',
      text: text,
      from: {
        id: this.userId,
        name: 'Test User'
      },
      conversation: {
        id: this.conversationId
      },
      channelId: 'emulator',
      timestamp: new Date().toISOString()
    };

    try {
      console.log(`\n🤖 Sending: "${text}"`);
      console.log('⏳ Processing...');
      
      const response = await axios.post(BOT_URL, message, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.status === 200) {
        console.log('✅ Message sent successfully');
        console.log('📨 Response received (check bot console for details)');
      }
      
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Connection refused - Make sure the bot is running on port 3978');
        console.log('💡 Start the bot with: npm run standalone');
      } else {
        console.log('❌ Error:', error.message);
      }
      throw error;
    }
  }

  async testConversation() {
    const testQueries = [
      "Hello, can you help me with weather?",
      "What's the weather like in Seattle tomorrow?",
      "Tell me the forecast for New York on June 15th",
      "What will the temperature be in London next week?"
    ];

    console.log('🌦️  Weather Agent - Standalone Test Client');
    console.log('=' .repeat(50));
    console.log(`📡 Bot URL: ${BOT_URL}`);
    console.log(`🆔 Conversation ID: ${this.conversationId}`);
    console.log(`👤 User ID: ${this.userId}`);

    for (const query of testQueries) {
      try {
        await this.sendMessage(query);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between messages
      } catch (error) {
        console.log('🛑 Test stopped due to error');
        break;
      }
    }

    console.log('\n✨ Test completed!');
    console.log('💡 Check the bot server console for detailed responses');
  }
}

// CLI usage
if (require.main === module) {
  const client = new WeatherBotClient();
  
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🌦️  Weather Agent Test Client\n');
    console.log('Usage:');
    console.log('  node test-client.js "Your message here"');
    console.log('  node test-client.js --test    # Run automated test');
    console.log('\nExamples:');
    console.log('  node test-client.js "What\'s the weather in Paris?"');
    console.log('  node test-client.js --test');
    process.exit(0);
  }
  
  if (args[0] === '--test') {
    client.testConversation();
  } else {
    const message = args.join(' ');
    client.sendMessage(message);
  }
}

module.exports = WeatherBotClient;
