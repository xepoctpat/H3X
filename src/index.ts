// Auto-generated interfaces
interface ProcessEnv {
  [key: string]: string | undefined;
}

// Import required packages
import * as path from 'path';

import express from 'express';

// This bot's main dialog.
import { sirAgent } from './agent-no-openai';

// Import H3X Proof System
import { H3XProofSystemModule } from './proof/proof-integration';

// Create express application.
const server = express();
server.use(express.json());

// Initialize H3X Proof System
const proofSystemModule = new H3XProofSystemModule();
let proofSystemInitialized = false;

// Initialize proof system on startup
async function initializeProofSystem() {
  try {
    console.log('[H3X-Main] Initializing proof system...');
    await proofSystemModule.initialize();
    proofSystemInitialized = true;
    console.log('[H3X-Main] Proof system initialized successfully');
  } catch (error) {
    console.error('[H3X-Main] Proof system initialization failed:', error);
  }
}

// Start proof system initialization
initializeProofSystem();

// Serve static files from Public directory for neural interfaces
server.use(express.static(path.join(__dirname, '../Public')));

// Health check endpoint (no auth required)
server.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Hexperiment Labs SIR Control Interface',
    timestamp: new Date().toISOString(),
    port: (process.env as ProcessEnv).port || (process.env as ProcessEnv).PORT || 4978,
    mode: 'LOCAL_CONTAINERIZED',
  });
});

// API health check endpoint (Docker compatibility)
server.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Hexperiment Labs SIR Control Interface',
    timestamp: new Date().toISOString(),
    port: (process.env as ProcessEnv).port || (process.env as ProcessEnv).PORT || 4978,
    mode: 'LOCAL_CONTAINERIZED',
    endpoint: '/api/health',
  });
});

// Status endpoint (no auth required)
server.get('/', (req, res) => {
  res.json({
    service: 'Hexperiment Labs SIR Control Interface',
    version: '2.0.0',
    status: 'running',
    environment: 'local_container',
    endpoints: {
      'POST /api/messages': 'Local bot endpoint for conversations',
      'GET /health': 'Health check endpoint',
      'GET /': 'Service status',
      'GET /api/sir-status': 'SIR agent status',
    },
    features: [
      'Local containerized deployment',
      'Environmental analysis with real-life standards',
      'Simulation control',
      'AI assistant generation',
      'Human-supervised confirmation scenarios',
      'Monitoring system implementation',
      'PDF framework integration ready',
    ],
    mode: 'LOCAL_ACTIVE',
    description:
      'Super Intelligent Regulator for AI assistant generation and environment analysis - Containerized Local Deployment',
    framework: 'Local Express Server',
    aiDependency: 'None - Pure local processing',
    azureDependency: 'None - Full local deployment',
    realLifeStandards: true,
    timestamp: new Date().toISOString(),
  });
});

// SIR agent status endpoint
server.get('/api/sir-status', (req, res) => {
  res.json({
    status: 'operational',
    agent: 'SIR Control Interface',
    mode: 'local_containerized',
    capabilities: [
      'Environmental monitoring',
      'Simulation control',
      'Human-supervised AI generation',
      'Real-life standards compliance',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Local bot messages endpoint (simplified without Azure auth)
server.post('/api/messages', async (req, res) => {
  try {
    // Simple local processing without Azure Bot Framework
    const message = req.body;

    // Basic response structure
    const response = {
      type: 'message',
      text: 'SIR Control Interface is operational in local containerized mode. Environmental analysis and simulation control ready.',
      timestamp: new Date().toISOString(),
      source: 'H3X_SIR_LOCAL',
    };

    res.json(response);
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
});

// H3X Proof System endpoints
server.get('/api/proof/status', async (req, res) => {
  try {
    const proofModule = new H3XProofSystemModule();
    const metrics = proofModule.getProofSystemMetrics();
    res.json({
      status: 'operational',
      proof_system: metrics.proof_system,
      lattice_data: proofModule.getLatticeVisualizationData(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: 'Proof system unavailable',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

server.post('/api/proof/triangle', async (req, res) => {
  try {
    const proofModule = new H3XProofSystemModule();
    await proofModule.initialize();
    const result = proofModule.createTriangleProof(req.body);
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

server.post('/api/proof/flup', async (req, res) => {
  try {
    const { data, x, y } = req.body;
    const proofModule = new H3XProofSystemModule();
    await proofModule.initialize();
    const result = proofModule.createFlupWithData(data, { x, y });
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

server.post('/api/proof/benchmark', async (req, res) => {
  try {
    const proofModule = new H3XProofSystemModule();
    await proofModule.initialize();
    const result = await proofModule.runFullBenchmark();
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
});

const port = (process.env as ProcessEnv).port || (process.env as ProcessEnv).PORT || 4978;
server.listen(port, () => {
  console.log('\n🔴 H3X SIR Control Interface Server Started');
  console.log(`🌐 Server listening on port ${port}`);
  console.log('🐳 Mode: Local Containerized Deployment');
  console.log('🚀 Status: Ready for environmental analysis and simulation control');
  console.log(`🔗 Health Check: http://localhost:${port}/health`);
  console.log(`📊 Status API: http://localhost:${port}/`);
  console.log(`🤖 SIR Status: http://localhost:${port}/api/sir-status`);
  console.log('📝 No Azure dependencies - Pure local processing\n');
});
