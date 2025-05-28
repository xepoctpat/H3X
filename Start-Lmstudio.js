// LMStudio Server for H3X SIR Control Interface
const express = require('express');
const cors = require('cors');
const path = require('path');
const { SIRLMStudioAgent } = require('./src/agent-lmstudio');
const { H3XCodeGenerator } = require('./src/generators/codeGenerator');
const { HSPImaginationEngine } = require('./src/protocol/hspImaginationEngine');
const WebSocket = require('ws');

// Global error handlers
process.on('uncaughtException', (error) => {
  console.error('🚨 Uncaught Exception:', error.message);
  // Don't exit, just log
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 Unhandled Rejection:', reason);
  // Don't exit, just log
});

const app = express();
const PORT = process.env.PORT || 3979;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('❌ JSON Parse Error:', err.message);
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Failed to parse request body'
    });
  }
  next();
});

// Initialize SIR Agent with LMStudio
const sirAgent = new SIRLMStudioAgent({
  baseURL: process.env.LMSTUDIO_URL || 'http://localhost:1234/v1',
  model: process.env.LMSTUDIO_MODEL || 'local-model'
});

// Initialize H3X Code Generator
const codeGenerator = new H3XCodeGenerator();

// Initialize HSP Imagination Engine
const imaginationEngine = new HSPImaginationEngine();

console.log("🚀 Starting H3X SIR Control Interface with LMStudio Integration");
console.log("🔮 Hexperiment Labs Framework Active");
console.log("🎯 H3X Code Generator Initialized");

// Root route - serve the main SIR Control Interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'H3X SIR Control Interface',
    integration: 'LMStudio',
    timestamp: new Date().toISOString(),
    framework: 'Hexperiment Labs',
    mode: sirAgent.systemState.mode
  });
});

// Main chat endpoint
app.post('/chat', async (req, res) => {
  try {
    const { message, context = {} } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required',
        example: { message: "Analyze the current environment" }
      });
    }

    console.log("📨 Incoming message:", message);
    
    const response = await sirAgent.processMessage(message, context);
    
    res.json({
      success: true,
      ...response,
      service: 'H3X SIR Control Interface',
      integration: 'LMStudio'
    });
    
  } catch (error) {
    console.error("❌ Chat endpoint error:", error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process message',
      details: error.message
    });
  }
});

// SIR Analysis endpoint
app.post('/sir-analysis', async (req, res) => {
  try {
    const { environment, analysisType, parameters } = req.body;
    
    const toolResult = await sirAgent.executeTool('SIRAnalysis', {
      environment: environment || 'current_environment',
      analysisType: analysisType || 'environmental_scan',
      parameters: parameters || ''
    });
    
    res.json({
      success: true,
      tool: 'SIRAnalysis',
      result: toolResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ SIR Analysis error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Environment Simulation endpoint
app.post('/simulate', async (req, res) => {
  try {
    const { simulationType, environment, duration, parameters } = req.body;
    
    const toolResult = await sirAgent.executeTool('EnvironmentSimulation', {
      simulationType: simulationType || 'standard',
      environment: environment || 'laboratory',
      duration: duration || 300,
      parameters: parameters || ''
    });
    
    res.json({
      success: true,
      tool: 'EnvironmentSimulation',
      result: toolResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Simulation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Monitoring endpoint
app.post('/monitor', async (req, res) => {
  try {
    const { systemComponent, parameters } = req.body;
    
    const toolResult = await sirAgent.executeTool('Monitoring', {
      systemComponent: systemComponent || 'all_systems',
      parameters: parameters || ''
    });
    
    res.json({
      success: true,
      tool: 'Monitoring',
      result: toolResult,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Monitoring error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Code Generation endpoint
app.post('/generate-code', async (req, res) => {
  try {
    const { prompt, context } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        example: { prompt: "Create a Python function for data analysis" }
      });
    }

    console.log("📨 Code generation request:", prompt);
    
    const codeResponse = await codeGenerator.generateCode(prompt, context);
    
    res.json({
      success: true,
      code: codeResponse,
      service: 'H3X SIR Control Interface',
      integration: 'LMStudio'
    });
    
  } catch (error) {
    console.error("❌ Code generation error:", error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate code',
      details: error.message
    });
  }
});

// AI Assistant endpoint
app.post('/ai-assistant', async (req, res) => {
  try {
    const { task, parameters } = req.body;
    
    if (!task) {
      return res.status(400).json({
        error: 'Task description is required',
        example: { task: "Schedule a meeting with the development team" }
      });
    }

    console.log("📨 AI assistant request:", task);
    
    const assistantResponse = await sirAgent.processMessage(task, parameters);
    
    res.json({
      success: true,
      response: assistantResponse,
      service: 'H3X SIR Control Interface',
      integration: 'LMStudio'
    });
    
  } catch (error) {
    console.error("❌ AI assistant error:", error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to process AI assistant request',
      details: error.message
    });
  }
});

// Project Generation endpoint
app.post('/generate-project', async (req, res) => {
  try {
    const { projectName, template, parameters } = req.body;
    
    if (!projectName || !template) {
      return res.status(400).json({
        error: 'Project name and template are required',
        example: { projectName: "New Web App", template: "basic-node-express" }
      });
    }

    console.log("📨 Project generation request:", projectName, template);
    
    const projectResponse = await codeGenerator.generateProject(projectName, template, parameters);
    
    res.json({
      success: true,
      project: projectResponse,
      service: 'H3X SIR Control Interface',
      integration: 'LMStudio'
    });
    
  } catch (error) {
    console.error("❌ Project generation error:", error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to generate project',
      details: error.message
    });
  }
});

// System status endpoint
app.get('/status', (req, res) => {
  res.json({
    systemState: sirAgent.systemState,
    framework: 'Hexperiment Labs Framework',
    integration: 'LMStudio',
    availableTools: Object.keys(sirAgent.tools),
    timestamp: new Date().toISOString(),
    lmstudioEndpoint: sirAgent.baseURL,
    version: '1.0.0',
    codeGenerator: 'Active'
  });
});

// 🔮 GENERATIVNI ENDPOINTI - H3X Code Generator

// Generate AI Assistant
app.post('/generate/ai-assistant', async (req, res) => {
  try {
    const { environmentData, requirements } = req.body;
    
    console.log("🤖 Generating AI Assistant...");
    
    const result = await codeGenerator.generateAIAssistant(
      environmentData || {}, 
      requirements || {}
    );
    
    res.json({
      success: true,
      generator: 'H3X Code Generator',
      ...result
    });
    
  } catch (error) {
    console.error("❌ AI Assistant generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate Environment Simulation
app.post('/generate/simulation', async (req, res) => {
  try {
    const { simulationType, parameters } = req.body;
    
    console.log("🌍 Generating Environment Simulation...");
    
    const result = await codeGenerator.generateEnvironmentSimulation(
      simulationType || 'standard',
      parameters || {}
    );
    
    res.json({
      success: true,
      generator: 'H3X Code Generator',
      ...result
    });
    
  } catch (error) {
    console.error("❌ Simulation generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate SIR Analysis Tool
app.post('/generate/analysis-tool', async (req, res) => {
  try {
    const { analysisType, customParameters } = req.body;
    
    console.log("🔬 Generating SIR Analysis Tool...");
    
    const result = await codeGenerator.generateSIRAnalysisTool(
      analysisType || 'CustomAnalysis',
      customParameters || {}
    );
    
    res.json({
      success: true,
      generator: 'H3X Code Generator',
      ...result
    });
    
  } catch (error) {
    console.error("❌ Analysis tool generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate Server Endpoint
app.post('/generate/endpoint', async (req, res) => {
  try {
    const { endpointName, functionality } = req.body;
    
    console.log("🚀 Generating Server Endpoint...");
    
    const result = await codeGenerator.generateServerEndpoint(
      endpointName || 'CustomEndpoint',
      functionality || 'Custom functionality implementation'
    );
    
    res.json({
      success: true,
      generator: 'H3X Code Generator',
      ...result
    });
    
  } catch (error) {
    console.error("❌ Endpoint generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate Complete Project
app.post('/generate/project', async (req, res) => {
  try {
    const { projectName, projectType } = req.body;
    
    console.log("🏗️ Generating Complete Project...");
    
    const result = await codeGenerator.generateProjectStructure(
      projectName || 'H3X Generated Project',
      projectType || 'ai_assistant'
    );
    
    res.json({
      success: true,
      generator: 'H3X Code Generator',
      ...result
    });
    
  } catch (error) {
    console.error("❌ Project generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate Real-time Data Simulator
app.post('/generate/data-simulator', async (req, res) => {
  try {
    const { dataType, frequency } = req.body;
    
    console.log("📊 Generating Real-time Data Simulator...");
    
    const result = await codeGenerator.generateRealtimeDataSimulator(
      dataType || 'environmental',
      frequency || 1000
    );
    
    res.json({
      success: true,
      generator: 'H3X Code Generator',
      ...result
    });
    
  } catch (error) {
    console.error("❌ Data simulator generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generator Status and Capabilities
app.get('/generate/status', (req, res) => {
  res.json({
    generator: 'H3X Code Generator',
    status: 'Active',
    framework: 'Hexperiment Labs Framework',
    capabilities: [
      'AI Assistant Generation',
      'Environment Simulation Scripts',
      'SIR Analysis Tools',
      'Server Endpoints',
      'Complete Project Structure',
      'Real-time Data Simulators'
    ],
    availableGenerators: {
      'POST /generate/ai-assistant': 'Generate complete AI assistant configuration',
      'POST /generate/simulation': 'Generate environment simulation scripts',
      'POST /generate/analysis-tool': 'Generate SIR analysis tool extensions',
      'POST /generate/endpoint': 'Generate new server endpoints',
      'POST /generate/project': 'Generate complete project structure',
      'POST /generate/data-simulator': 'Generate real-time data simulators'
    },
    realLifeStandards: true,
    timestamp: new Date().toISOString()
  });
});

// Imagine-to-Create endpoint
app.post('/imagine-to-create', async (req, res) => {
  try {
    const { imagination, generationType, parameters } = req.body;
    if (!imagination) {
      return res.status(400).json({
        error: 'Imagination input is required',
        example: { imagination: "Create an AI assistant for lab automation" }
      });
    }
    console.log("✨ Imagine-to-Create request:", imagination);
    // 1. Process imagination input
    const instructions = imaginationEngine.processImagination(imagination);
    // 2. Ako je interaktivno, vrati UI shemu i akcije
    if (instructions.type === 'interactive') {
      const event = { type: 'interactive', imagination, uiSchema: instructions.uiSchema, actions: instructions.actions, time: new Date().toISOString() };
      broadcastSpectator(event);
      return res.json({
        success: true,
        imagination,
        generationType: 'interactive',
        uiSchema: instructions.uiSchema,
        actions: instructions.actions,
        meta: instructions.meta,
        message: 'Interaktivna imaginacija prepoznata. Prikaži korisniku UI elemente i čekaj akciju.'
      });
    }
    // 2b. Ako je proaktivno, vrati proactiveSuggestions
    if (instructions.type === 'proactive') {
      const event = { type: 'proactive', imagination, suggestions: instructions.proactiveSuggestions, time: new Date().toISOString() };
      broadcastSpectator(event);
      return res.json({
        success: true,
        imagination,
        generationType: 'proactive',
        proactiveSuggestions: instructions.proactiveSuggestions,
        context: instructions.context,
        meta: instructions.meta,
        message: 'Proaktivna imaginacija prepoznata. Prikazani su predlozi sledećih koraka.'
      });
    }
    // 2c. Ako je scenario kretanja, vrati movementInstructions
    if (instructions.type === 'movement') {
      const event = { type: 'movement', imagination, movement: instructions.movementInstructions, time: new Date().toISOString() };
      broadcastSpectator(event);
      return res.json({
        success: true,
        imagination,
        generationType: 'movement',
        movementInstructions: instructions.movementInstructions,
        meta: instructions.meta,
        message: 'Scenario kretanja prepoznat. Prikazani su parametri kretanja.'
      });
    }
    // 3. Route to code generator based on type
    let result;
    switch ((generationType || instructions.type || '').toLowerCase()) {
      case 'ai_assistant':
        console.log("🟪 [GENERATION] Generating AI Assistant with:", JSON.stringify(parameters || {}));
        result = await codeGenerator.generateAIAssistant(parameters || {}, instructions.meta || {});
        break;
      case 'simulation':
        console.log("🟪 [GENERATION] Generating Simulation with:", JSON.stringify(parameters || {}));
        result = await codeGenerator.generateEnvironmentSimulation('standard', parameters || {});
        break;
      case 'analysis_tool':
        console.log("🟪 [GENERATION] Generating SIR Analysis Tool with:", JSON.stringify(parameters || {}));
        result = await codeGenerator.generateSIRAnalysisTool('CustomAnalysis', parameters || {});
        break;
      case 'endpoint':
        console.log("🟪 [GENERATION] Generating Endpoint with:", JSON.stringify(parameters || {}));
        result = await codeGenerator.generateServerEndpoint(parameters?.endpointName || 'CustomEndpoint', parameters?.functionality || 'Custom functionality');
        break;
      case 'project':
        console.log("🟪 [GENERATION] Generating Project with:", JSON.stringify(parameters || {}));
        result = await codeGenerator.generateProjectStructure(parameters?.projectName || 'H3X Generated Project', parameters?.projectType || 'ai_assistant');
        break;
      case 'data_simulator':
        console.log("🟪 [GENERATION] Generating Data Simulator with:", JSON.stringify(parameters || {}));
        result = await codeGenerator.generateRealtimeDataSimulator(parameters?.dataType || 'environmental', parameters?.frequency || 1000);
        break;
      default:
        console.log("🟫 [GENERIC] Generating code for prompt:", instructions.prompt);
        result = await codeGenerator.generateCode(instructions.prompt, parameters || {});
    }
    console.log("✅ [RESPONSE] Generation result:", typeof result === 'string' ? result.slice(0, 200) : JSON.stringify(result).slice(0, 200));
    broadcastSpectator({ type: 'generation', imagination, generationType: generationType || instructions.type, parameters, result, time: new Date().toISOString() });
    res.json({
      success: true,
      imagination,
      generationType: generationType || instructions.type,
      result
    });
  } catch (error) {
    console.error("❌ Imagine-to-Create error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("❌ Unhandled error:", error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// Start server
app.listen(PORT, () => {
  console.log("🎯 H3X SIR Control Interface Server Started");
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`📡 LMStudio endpoint: ${sirAgent.baseURL}`);
  console.log("🔧 Available endpoints:");
  console.log("   GET  /health       - Health check");
  console.log("   POST /chat         - Main chat interface");
  console.log("   POST /sir-analysis - SIR analysis tool");
  console.log("   POST /simulate     - Environment simulation");
  console.log("   POST /monitor      - System monitoring");
  console.log("   POST /generate-code - Code generation");
  console.log("   POST /ai-assistant - AI assistant tasks");
  console.log("   POST /generate-project - Project generation");
  console.log("   GET  /status       - System status");
  console.log("   GET  /api-docs     - API documentation");
  console.log("");
  console.log("🎮 Ready for SIR Control Interface operations!");
  console.log("🔮 Hexperiment Labs Framework initialized and active");
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log("\n🔄 Shutting down H3X SIR Control Interface...");
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log("\n🔄 Shutting down H3X SIR Control Interface...");
  process.exit(0);
});

const spectatorClients = [];

// Pokreni WebSocket server na istom portu + 1 (npr. 3980)
const wsPort = Number(PORT) + 1;
const wss = new WebSocket.Server({ port: wsPort });
wss.on('connection', (ws) => {
  spectatorClients.push(ws);
  ws.send(JSON.stringify({ type: 'info', message: 'Connected to H3X Spectator. Svi događaji će biti prikazani uživo.' }));
  ws.on('close', () => {
    const idx = spectatorClients.indexOf(ws);
    if (idx !== -1) spectatorClients.splice(idx, 1);
  });
});

function broadcastSpectator(event) {
  const msg = typeof event === 'string' ? event : JSON.stringify(event);
  spectatorClients.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}
