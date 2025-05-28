// Test Client for H3X SIR Control Interface with LMStudio
const readline = require('readline');

const SERVER_URL = 'http://localhost:3979';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

console.log(`${colors.cyan}🔮 H3X SIR Control Interface - LMStudio Test Client${colors.reset}`);
console.log(`${colors.yellow}🎯 Hexperiment Labs Framework Integration${colors.reset}`);
console.log("");

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test server connectivity
async function testConnection() {
  try {
    console.log(`${colors.blue}📡 Testing connection to server...${colors.reset}`);
    
    const response = await fetch(`${SERVER_URL}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✅ Server is healthy${colors.reset}`);
      console.log(`   Service: ${data.service}`);
      console.log(`   Integration: ${data.integration}`);
      console.log(`   Framework: ${data.framework}`);
      console.log(`   Mode: ${data.mode}`);
      return true;
    } else {
      console.log(`${colors.red}❌ Server health check failed${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Cannot connect to server: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}💡 Make sure to start the server first: npm run lmstudio${colors.reset}`);
    return false;
  }
}

// Send message to SIR system
async function sendMessage(message, context = {}) {
  try {
    const response = await fetch(`${SERVER_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, context })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`${colors.green}🔮 SIR Response:${colors.reset}`);
      console.log(data.message);
      
      if (data.toolResults && data.toolResults.length > 0) {
        console.log(`${colors.cyan}\n🔧 Tool Results:${colors.reset}`);
        data.toolResults.forEach((result, index) => {
          if (result.success) {
            console.log(`${colors.green}  ✅ ${result.tool}${colors.reset}`);
            if (result.result.status) {
              console.log(`     Status: ${result.result.status}`);
            }
            if (result.result.analysisType) {
              console.log(`     Analysis: ${result.result.analysisType}`);
            }
            if (result.result.compliance) {
              console.log(`     Compliance: ${result.result.compliance.overall}`);
            }
          } else {
            console.log(`${colors.red}  ❌ ${result.tool}: ${result.error}${colors.reset}`);
          }
        });
      }
      
      return data;
    } else {
      console.log(`${colors.red}❌ Error: ${data.error || 'Unknown error'}${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Request failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Direct tool testing
async function testTool(endpoint, payload) {
  try {
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`${colors.green}✅ Tool Test Success:${colors.reset}`);
      console.log(`   Tool: ${data.tool}`);
      console.log(`   Result: ${JSON.stringify(data.result, null, 2)}`);
      return data;
    } else {
      console.log(`${colors.red}❌ Tool Test Failed: ${data.error}${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Tool Test Error: ${error.message}${colors.reset}`);
    return null;
  }
}

// Show system status
async function showStatus() {
  try {
    const response = await fetch(`${SERVER_URL}/status`);
    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.cyan}📊 System Status:${colors.reset}`);
      console.log(`   Framework: ${data.framework}`);
      console.log(`   Integration: ${data.integration}`);
      console.log(`   Mode: ${data.systemState.mode}`);
      console.log(`   Monitoring Active: ${data.systemState.monitoringActive}`);
      console.log(`   Supervision Required: ${data.systemState.supervisionRequired}`);
      console.log(`   LMStudio Endpoint: ${data.lmstudioEndpoint}`);
      console.log(`   Available Tools: ${data.availableTools.join(', ')}`);
      return data;
    } else {
      console.log(`${colors.red}❌ Failed to get status${colors.reset}`);
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}❌ Status request failed: ${error.message}${colors.reset}`);
    return null;
  }
}

// Show available commands
function showHelp() {
  console.log(`${colors.yellow}📋 Available Commands:${colors.reset}`);
  console.log("  🔮 Chat with SIR system - Just type your message");
  console.log("  📊 'status' - Show system status");
  console.log("  🧪 'test analysis' - Test SIR analysis tool");
  console.log("  🌍 'test simulation' - Test environment simulation tool");
  console.log("  📈 'test monitoring' - Test monitoring tool");
  console.log("  ❓ 'help' - Show this help");
  console.log("  🚪 'exit' or 'quit' - Exit the client");
  console.log("");
  console.log(`${colors.cyan}💡 Example messages:${colors.reset}`);
  console.log("  'Analyze the current laboratory environment'");
  console.log("  'Run a stress test simulation for 10 minutes'");
  console.log("  'Check system health and monitoring status'");
  console.log("  'Perform AI readiness assessment'");
  console.log("");
}

// Main interactive loop
async function main() {
  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    console.log(`${colors.red}❌ Cannot proceed without server connection${colors.reset}`);
    process.exit(1);
  }
  
  console.log("");
  showHelp();
  
  const askQuestion = () => {
    rl.question(`${colors.magenta}🎯 SIR> ${colors.reset}`, async (input) => {
      const command = input.trim().toLowerCase();
      
      if (command === 'exit' || command === 'quit') {
        console.log(`${colors.cyan}👋 Goodbye! SIR Control Interface session ended.${colors.reset}`);
        rl.close();
        return;
      }
      
      if (command === 'help') {
        showHelp();
        askQuestion();
        return;
      }
      
      if (command === 'status') {
        await showStatus();
        console.log("");
        askQuestion();
        return;
      }
      
      if (command === 'test analysis') {
        await testTool('/sir-analysis', {
          environment: 'laboratory',
          analysisType: 'environmental_scan',
          parameters: 'test analysis with compliance check'
        });
        console.log("");
        askQuestion();
        return;
      }
      
      if (command === 'test simulation') {
        await testTool('/simulate', {
          simulationType: 'standard',
          environment: 'laboratory',
          duration: 300,
          parameters: 'test simulation scenario'
        });
        console.log("");
        askQuestion();
        return;
      }
      
      if (command === 'test monitoring') {
        await testTool('/monitor', {
          systemComponent: 'all_systems',
          parameters: 'comprehensive system check'
        });
        console.log("");
        askQuestion();
        return;
      }
      
      if (input.trim()) {
        console.log(`${colors.blue}🔄 Processing...${colors.reset}`);
        await sendMessage(input.trim(), { user: 'test_client', timestamp: new Date().toISOString() });
        console.log("");
      }
      
      askQuestion();
    });
  };
  
  askQuestion();
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.cyan}👋 SIR Control Interface client shutting down...${colors.reset}`);
  rl.close();
  process.exit(0);
});

// Start the client
main().catch(error => {
  console.error(`${colors.red}❌ Client error: ${error.message}${colors.reset}`);
  process.exit(1);
});
