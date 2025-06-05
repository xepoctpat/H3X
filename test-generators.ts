// Test script for H3X Generative Scripts
import axios from 'axios';
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const baseURL = 'http://localhost:3979';

async function testGenerativeCapabilities(): Promise<any> {
  console.log(`${colors.bright}${colors.cyan}🔮 Testing H3X Generative Scripts${colors.reset}\n`);

  try {
    // Test 1: Generator Status
    console.log(`${colors.blue}📊 Testing Generator Status...${colors.reset}`);
    const statusResponse = await axios.get(`${baseURL}/generate/status`);
    console.log(`${colors.green}✅ Generator Status:${colors.reset}`);
    console.log(JSON.stringify(statusResponse.data, null, 2));
    console.log('');

    // Test 2: Generate AI Assistant
    console.log(`${colors.blue}🤖 Testing AI Assistant Generation...${colors.reset}`);
    const assistantResponse = await axios.post(`${baseURL}/generate/ai-assistant`, {
      environmentData: {
        temperature: 22.5,
        humidity: 45,
        airQuality: 35,
      },
      requirements: {
        type: 'environmental_monitor',
        capabilities: ['monitoring', 'analysis', 'reporting'],
      },
    });
    console.log(`${colors.green}✅ AI Assistant Generated:${colors.reset}`);
    console.log('Assistant ID:', assistantResponse.data.assistantId);
    console.log('Configuration ready:', assistantResponse.data.configuration?.realLifeStandards);
    console.log('');

    // Test 3: Generate Environment Simulation
    console.log(`${colors.blue}🌍 Testing Environment Simulation Generation...${colors.reset}`);
    const simulationResponse = await axios.post(`${baseURL}/generate/simulation`, {
      simulationType: 'LaboratoryEnvironment',
      parameters: {
        duration: 3600,
        complexity: 'high',
        realLifeStandards: true,
      },
    });
    console.log(`${colors.green}✅ Environment Simulation Generated:${colors.reset}`);
    console.log('Simulation Type:', simulationResponse.data.simulationType);
    console.log('Framework:', simulationResponse.data.framework);
    console.log('');

    // Test 4: Generate SIR Analysis Tool
    console.log(`${colors.blue}🔬 Testing SIR Analysis Tool Generation...${colors.reset}`);
    const analysisToolResponse = await axios.post(`${baseURL}/generate/analysis-tool`, {
      analysisType: 'AdvancedEnvironmentalScan',
      customParameters: {
        includeAirQuality: true,
        includeNoiseLevels: true,
        includeLighting: true,
      },
    });
    console.log(`${colors.green}✅ SIR Analysis Tool Generated:${colors.reset}`);
    console.log(
      'Tool ID:',
      analysisToolResponse.data.toolCode?.includes('TOOL_') ? 'Generated' : 'Error',
    );
    console.log('Analysis Type:', analysisToolResponse.data.analysisType);
    console.log('');

    // Test 5: Generate Server Endpoint
    console.log(`${colors.blue}🚀 Testing Server Endpoint Generation...${colors.reset}`);
    const endpointResponse = await axios.post(`${baseURL}/generate/endpoint`, {
      endpointName: 'EnvironmentalDataProcessor',
      functionality: 'Process and analyze environmental data with real-life standards compliance',
    });
    console.log(`${colors.green}✅ Server Endpoint Generated:${colors.reset}`);
    console.log('Endpoint Name:', endpointResponse.data.endpointName);
    console.log(
      'Integration Code Available:',
      endpointResponse.data.integrationCode ? 'Yes' : 'No',
    );
    console.log('');

    // Test 6: Generate Complete Project
    console.log(`${colors.blue}🏗️ Testing Complete Project Generation...${colors.reset}`);
    const projectResponse = await axios.post(`${baseURL}/generate/project`, {
      projectName: 'H3X Environmental Monitor',
      projectType: 'environmental_ai_system',
    });
    console.log(`${colors.green}✅ Complete Project Generated:${colors.reset}`);
    console.log('Project Name:', projectResponse.data.structure?.projectName);
    console.log(
      'Files Generated:',
      Object.keys(projectResponse.data.structure?.files || {}).length,
    );
    console.log('Framework:', projectResponse.data.structure?.framework);
    console.log('');

    // Test 7: Generate Real-time Data Simulator
    console.log(`${colors.blue}📊 Testing Real-time Data Simulator Generation...${colors.reset}`);
    const simulatorResponse = await axios.post(`${baseURL}/generate/data-simulator`, {
      dataType: 'environmental',
      frequency: 2000,
    });
    console.log(`${colors.green}✅ Real-time Data Simulator Generated:${colors.reset}`);
    console.log('Data Type:', simulatorResponse.data.dataType);
    console.log('Frequency:', simulatorResponse.data.frequency + 'ms');
    console.log('Framework:', simulatorResponse.data.framework);
    console.log('');

    // Summary
    console.log(
      `${colors.bright}${colors.green}🎯 GENERATIVNE SKRIPTE POTPUNO FUNKCIONALNE!${colors.reset}`,
    );
    console.log(`${colors.yellow}📋 Generisani objekti:${colors.reset}`);
    console.log('✅ AI Assistant konfiguracija');
    console.log('✅ Environment simulation skripte');
    console.log('✅ SIR analysis alati');
    console.log('✅ Server endpoints');
    console.log('✅ Kompletna projekt struktura');
    console.log('✅ Real-time data simulatori');
    console.log('');
    console.log(
      `${colors.cyan}🔮 Hexperiment Labs Framework - Code Generation Engine ACTIVE!${colors.reset}`,
    );
  } catch (error) {
    console.error(`${colors.red}❌ Test error:${colors.reset}`, error.message);
    if (error.response) {
      console.error(`${colors.red}Response:${colors.reset}`, error.response.data);
    }
    console.log(`${colors.yellow}💡 Make sure the server is running on ${baseURL}${colors.reset}`);
  }
}

// Interactive test menu
async function interactiveTest(): Promise<any> {
  import readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function askQuestion() {
    console.log(
      `${colors.bright}${colors.cyan}🔮 H3X Generative Scripts Interactive Test${colors.reset}`,
    );
    console.log('1. Test all generators');
    console.log('2. Test AI Assistant generation');
    console.log('3. Test Environment Simulation generation');
    console.log('4. Test SIR Analysis Tool generation');
    console.log('5. Test Server Endpoint generation');
    console.log('6. Test Complete Project generation');
    console.log('7. Test Real-time Data Simulator generation');
    console.log('8. Check generator status');
    console.log('0. Exit');
    console.log('');

    rl.question('Select test (0-8): ', async (answer) => {
      console.log('');

      try {
        switch (answer) {
          case '1':
            await testGenerativeCapabilities();
            break;
          case '2':
            await testSingleGenerator('/generate/ai-assistant', {
              environmentData: { temperature: 23, humidity: 50 },
              requirements: { type: 'test_assistant' },
            });
            break;
          case '3':
            await testSingleGenerator('/generate/simulation', {
              simulationType: 'TestEnvironment',
              parameters: { test: true },
            });
            break;
          case '4':
            await testSingleGenerator('/generate/analysis-tool', {
              analysisType: 'TestAnalysis',
              customParameters: { testMode: true },
            });
            break;
          case '5':
            await testSingleGenerator('/generate/endpoint', {
              endpointName: 'TestEndpoint',
              functionality: 'Test functionality',
            });
            break;
          case '6':
            await testSingleGenerator('/generate/project', {
              projectName: 'Test Project',
              projectType: 'test_project',
            });
            break;
          case '7':
            await testSingleGenerator('/generate/data-simulator', {
              dataType: 'test',
              frequency: 1000,
            });
            break;
          case '8':
            await testGeneratorStatus();
            break;
          case '0':
            console.log(`${colors.green}👋 Goodbye!${colors.reset}`);
            rl.close();
            return;
          default:
            console.log(`${colors.red}❌ Invalid selection${colors.reset}`);
        }
      } catch (error) {
        console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
      }

      console.log('');
      askQuestion();
    });
  }

  askQuestion();
}

async function testSingleGenerator(endpoint, data): Promise<any> {
  try {
    console.log(`${colors.blue}🔄 Testing ${endpoint}...${colors.reset}`);
    const response = await axios.post(`${baseURL}${endpoint}`, data);
    console.log(`${colors.green}✅ Success:${colors.reset}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
  }
}

async function testGeneratorStatus(): Promise<any> {
  try {
    console.log(`${colors.blue}📊 Checking generator status...${colors.reset}`);
    const response = await axios.get(`${baseURL}/generate/status`);
    console.log(`${colors.green}✅ Generator Status:${colors.reset}`);
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(`${colors.red}❌ Error:${colors.reset}`, error.message);
  }
}

// Check if running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.includes('--all')) {
    testGenerativeCapabilities();
  } else if (args.includes('--status')) {
    testGeneratorStatus();
  } else {
    interactiveTest();
  }
}

export { testGenerativeCapabilities, testGeneratorStatus, testSingleGenerator };
