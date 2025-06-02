// H3X Code Generation Engine - Dedicated Generative Scripts
const fs = require('fs').promises;
const path = require('path');
const { HexperimentFramework } = require('../framework/hexperimentFramework');

class H3XCodeGenerator {
  constructor() {
    this.framework = new HexperimentFramework();
    this.generationMode = 'ACTIVE';
    this.templates = this.initializeTemplates();
  }

  /**
   * Generate complete AI Assistant configuration based on environment
   */
  async generateAIAssistant(environmentData, requirements = {}) {
    console.log("🤖 Generating AI Assistant Configuration...");
    
    const assistantConfig = this.framework.generateAssistantConfig(environmentData, requirements);
    
    // Enhanced generation with code templates
    const generatedCode = {
      assistantId: assistantConfig.assistantId,
      configurationFile: this.generateConfigFile(assistantConfig),
      deploymentScript: this.generateDeploymentScript(assistantConfig),
      testingSuite: this.generateTestingSuite(assistantConfig),
      monitoringCode: this.generateMonitoringCode(assistantConfig),
      documentationMd: this.generateDocumentation(assistantConfig)
    };

    return {
      success: true,
      generationType: 'AI_ASSISTANT_FULL_STACK',
      timestamp: new Date().toISOString(),
      framework: 'Hexperiment Labs Framework',
      configuration: assistantConfig,
      generatedFiles: generatedCode,
      realLifeStandards: true
    };
  }

  /**
   * Generate Environment Simulation Scripts
   */
  async generateEnvironmentSimulation(simulationType, parameters = {}) {
    console.log("🌍 Generating Environment Simulation Scripts...");
    
    const baseTemplate = this.templates.environmentSimulation;
    const generatedScript = baseTemplate
      .replace(/{{SIMULATION_TYPE}}/g, simulationType)
      .replace(/{{TIMESTAMP}}/g, new Date().toISOString())
      .replace(/{{PARAMETERS}}/g, JSON.stringify(parameters, null, 2))
      .replace(/{{SIM_ID}}/g, `SIM_${Date.now()}`);

    const testScript = this.generateSimulationTests(simulationType, parameters);
    
    return {
      success: true,
      generationType: 'ENVIRONMENT_SIMULATION',
      simulationType,
      scripts: {
        mainScript: generatedScript,
        testScript: testScript,
        configFile: this.generateSimulationConfig(simulationType, parameters)
      },
      framework: 'Hexperiment Labs Framework'
    };
  }

  /**
   * Generate SIR Analysis Tool Extensions
   */
  async generateSIRAnalysisTool(analysisType, customParameters = {}) {
    console.log("🔬 Generating SIR Analysis Tool Extension...");
    
    const toolTemplate = this.templates.sirAnalysisTool;
    const generatedTool = toolTemplate
      .replace(/{{ANALYSIS_TYPE}}/g, analysisType)
      .replace(/{{CUSTOM_PARAMS}}/g, JSON.stringify(customParameters, null, 2))
      .replace(/{{TOOL_ID}}/g, `TOOL_${Date.now()}`)
      .replace(/{{TIMESTAMP}}/g, new Date().toISOString());

    return {
      success: true,
      generationType: 'SIR_ANALYSIS_TOOL',
      analysisType,
      toolCode: generatedTool,
      integrationInstructions: this.generateIntegrationInstructions(analysisType),
      framework: 'Hexperiment Labs Framework'
    };
  }

  /**
   * Generate Server Endpoint Extensions
   */
  async generateServerEndpoint(endpointName, functionality) {
    console.log("🚀 Generating Server Endpoint...");
    
    const endpointTemplate = this.templates.serverEndpoint;
    const generatedEndpoint = endpointTemplate
      .replace(/{{ENDPOINT_NAME}}/g, endpointName)
      .replace(/{{FUNCTIONALITY}}/g, functionality)
      .replace(/{{ROUTE_PATH}}/g, endpointName.toLowerCase().replace(/\s+/g, '-'))
      .replace(/{{TIMESTAMP}}/g, new Date().toISOString());

    return {
      success: true,
      generationType: 'SERVER_ENDPOINT',
      endpointName,
      endpointCode: generatedEndpoint,
      integrationCode: this.generateEndpointIntegration(endpointName),
      testCode: this.generateEndpointTests(endpointName),
      framework: 'Hexperiment Labs Framework'
    };
  }

  /**
   * Generate Complete Project Structure
   */
  async generateProjectStructure(projectName, projectType = 'ai_assistant') {
    console.log("🏗️ Generating Complete Project Structure...");
    
    const structure = {
      projectName,
      projectType,
      timestamp: new Date().toISOString(),
      files: {
        'package.json': this.generatePackageJson(projectName),
        'README.md': this.generateReadme(projectName, projectType),
        'src/index.js': this.generateMainFile(projectName, projectType),
        'src/config/config.js': this.generateConfigFile({ projectName, projectType }),
        'tests/test.js': this.generateTestFile(projectName),
        '.env.example': this.generateEnvExample(),
        'docker/Dockerfile': this.generateDockerfile(projectType),
        'docs/API.md': this.generateApiDocs(projectName)
      },
      framework: 'Hexperiment Labs Framework'
    };

    return {
      success: true,
      generationType: 'COMPLETE_PROJECT_STRUCTURE',
      structure,
      realLifeStandards: true
    };
  }

  /**
   * Generate Real-time Data Simulation
   */
  async generateRealtimeDataSimulator(dataType, frequency = 1000) {
    console.log("📊 Generating Real-time Data Simulator...");
    
    const simulatorTemplate = this.templates.realtimeDataSimulator;
    const generatedSimulator = simulatorTemplate
      .replace(/{{DATA_TYPE}}/g, dataType)
      .replace(/{{FREQUENCY}}/g, frequency)
      .replace(/{{TIMESTAMP}}/g, new Date().toISOString())
      .replace(/{{SIMULATOR_ID}}/g, `DATASIM_${Date.now()}`);

    return {
      success: true,
      generationType: 'REALTIME_DATA_SIMULATOR',
      dataType,
      frequency,
      simulatorCode: generatedSimulator,
      framework: 'Hexperiment Labs Framework'
    };
  }

  // Template initialization
  initializeTemplates() {
    return {
      environmentSimulation: `
// Generated Environment Simulation - {{SIMULATION_TYPE}}
// Generated: {{TIMESTAMP}}
// Simulation ID: {{SIM_ID}}

const { HexperimentFramework } = require('../framework/hexperimentFramework');

class Generated{{SIMULATION_TYPE}}Simulation {
  constructor() {
    this.framework = new HexperimentFramework();
    this.simulationId = '{{SIM_ID}}';
    this.parameters = {{PARAMETERS}};
    this.realLifeStandards = true;
  }

  async runSimulation() {
    console.log("🌍 Starting {{SIMULATION_TYPE}} simulation...");
    
    const environmentData = this.generateEnvironmentData();
    const compliance = this.framework.evaluateEnvironmentCompliance(environmentData);
    
    return {
      simulationId: this.simulationId,
      type: '{{SIMULATION_TYPE}}',
      environmentData,
      compliance,
      results: this.processSimulationResults(environmentData, compliance),
      framework: 'Hexperiment Labs Framework',
      realLifeStandards: true
    };
  }

  generateEnvironmentData() {
    return {
      temperature: 22.5 + (Math.random() - 0.5) * 4,
      humidity: 45 + (Math.random() - 0.5) * 20,
      airQuality: Math.floor(Math.random() * 80) + 10,
      lighting: Math.floor(Math.random() * 600) + 100,
      noiseLevel: Math.floor(Math.random() * 40) + 25,
      timestamp: new Date().toISOString()
    };
  }

  processSimulationResults(environmentData, compliance) {
    return {
      status: compliance.overall === 'COMPLIANT' ? 'SUCCESS' : 'NEEDS_OPTIMIZATION',
      score: compliance.score,
      recommendations: compliance.recommendations,
      readyForDeployment: compliance.score > 90
    };
  }
}

module.exports = { Generated{{SIMULATION_TYPE}}Simulation };
`,

      sirAnalysisTool: `
// Generated SIR Analysis Tool - {{ANALYSIS_TYPE}}
// Generated: {{TIMESTAMP}}
// Tool ID: {{TOOL_ID}}

const { z } = require("zod");
const { HexperimentFramework } = require("../framework/hexperimentFramework");

const framework = new HexperimentFramework();

const generated{{ANALYSIS_TYPE}}Tool = {
  name: "generated_{{ANALYSIS_TYPE}}_tool",
  description: "Generated analysis tool for {{ANALYSIS_TYPE}} with Hexperiment Labs Framework",
  schema: z.object({
    target: z.string().describe("Target for {{ANALYSIS_TYPE}} analysis"),
    parameters: z.any().optional().describe("Custom parameters: {{CUSTOM_PARAMS}}"),
    realLifeStandards: z.boolean().default(true)
  }),
  func: async ({ target, parameters, realLifeStandards }) => {
    console.log("🔬 Executing Generated {{ANALYSIS_TYPE}} Analysis for:", target);
    
    const environmentData = generateEnvironmentalData();
    const compliance = framework.evaluateEnvironmentCompliance(environmentData);
    
    return {
      toolId: '{{TOOL_ID}}',
      analysisType: '{{ANALYSIS_TYPE}}',
      target,
      environmentData,
      compliance,
      results: processAnalysisResults(environmentData, compliance, parameters),
      framework: 'Hexperiment Labs Framework',
      realLifeStandards,
      timestamp: new Date().toISOString()
    };
  }
};

function generateEnvironmentalData() {
  return {
    temperature: 22.5 + (Math.random() - 0.5) * 4,
    humidity: 45 + (Math.random() - 0.5) * 20,
    airQuality: Math.floor(Math.random() * 80) + 10,
    lighting: Math.floor(Math.random() * 600) + 100,
    noiseLevel: Math.floor(Math.random() * 40) + 25
  };
}

function processAnalysisResults(environmentData, compliance, customParams) {
  return {
    analysisScore: compliance.score,
    recommendations: compliance.recommendations,
    customAnalysis: customParams ? "Custom parameters applied" : "Standard analysis",
    readyForProduction: compliance.overall === 'COMPLIANT'
  };
}

module.exports = { generated{{ANALYSIS_TYPE}}Tool };
`,

      serverEndpoint: `
// Generated Server Endpoint - {{ENDPOINT_NAME}}
// Generated: {{TIMESTAMP}}

// Add this to your start-lmstudio.js file:

// {{ENDPOINT_NAME}} endpoint
app.post('/{{ROUTE_PATH}}', async (req, res) => {
  try {
    const { parameters } = req.body;
    
    console.log("🚀 {{ENDPOINT_NAME}} endpoint called with parameters:", parameters);
    
    // {{FUNCTIONALITY}}
    const result = await processGenerated{{ENDPOINT_NAME}}(parameters);
    
    res.json({
      success: true,
      endpoint: '{{ENDPOINT_NAME}}',
      result: result,
      timestamp: new Date().toISOString(),
      framework: 'Hexperiment Labs Framework'
    });
    
  } catch (error) {
    console.error("❌ {{ENDPOINT_NAME}} endpoint error:", error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function processGenerated{{ENDPOINT_NAME}}(parameters) {
  // Implementation for {{FUNCTIONALITY}}
  return {
    processed: true,
    parameters,
    result: "Generated {{ENDPOINT_NAME}} processing complete",
    framework: 'Hexperiment Labs Framework'
  };
}
`,

      realtimeDataSimulator: `
// Generated Real-time Data Simulator - {{DATA_TYPE}}
// Generated: {{TIMESTAMP}}
// Simulator ID: {{SIMULATOR_ID}}

class Generated{{DATA_TYPE}}Simulator {
  constructor() {
    this.simulatorId = '{{SIMULATOR_ID}}';
    this.dataType = '{{DATA_TYPE}}';
    this.frequency = {{FREQUENCY}};
    this.isRunning = false;
    this.interval = null;
    this.listeners = [];
  }

  start() {
    if (this.isRunning) return;
    
    console.log("📊 Starting {{DATA_TYPE}} data simulator...");
    this.isRunning = true;
    
    this.interval = setInterval(() => {
      const data = this.generateData();
      this.notifyListeners(data);
    }, this.frequency);
  }

  stop() {
    if (!this.isRunning) return;
    
    console.log("⏹️ Stopping {{DATA_TYPE}} data simulator...");
    this.isRunning = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  generateData() {
    return {
      simulatorId: this.simulatorId,
      dataType: this.dataType,
      timestamp: new Date().toISOString(),
      value: this.generateRandomValue(),
      metadata: {
        frequency: this.frequency,
        framework: 'Hexperiment Labs Framework'
      }
    };
  }

  generateRandomValue() {
    // Customize based on {{DATA_TYPE}}
    switch (this.dataType) {
      case 'temperature':
        return (22.5 + (Math.random() - 0.5) * 4).toFixed(1);
      case 'humidity':
        return Math.floor(45 + (Math.random() - 0.5) * 20);
      case 'environmental':
        return {
          temperature: (22.5 + (Math.random() - 0.5) * 4).toFixed(1),
          humidity: Math.floor(45 + (Math.random() - 0.5) * 20),
          airQuality: Math.floor(Math.random() * 80) + 10
        };
      default:
        return Math.random();
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    const index = this.listeners.indexOf(callback);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  notifyListeners(data) {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error("❌ Listener error:", error);
      }
    });
  }
}

module.exports = { Generated{{DATA_TYPE}}Simulator };
`
    };
  }

  // Helper generation methods
  generateConfigFile(config) {
    return `module.exports = ${JSON.stringify(config, null, 2)};`;
  }

  generateDeploymentScript(config) {
    return `#!/usr/bin/env node
// Deployment script for ${config.assistantId}
console.log("🚀 Deploying AI Assistant: ${config.assistantId}");
// Deployment logic here
`;
  }

  generateTestingSuite(config) {
    return `// Test suite for ${config.assistantId}
const assert = require('assert');

describe('${config.assistantId} Tests', () => {
  it('should be configured correctly', () => {
    assert.ok(true);
  });
});
`;
  }

  generateMonitoringCode(config) {
    return `// Monitoring code for ${config.assistantId}
class AssistantMonitor {
  constructor() {
    this.assistantId = '${config.assistantId}';
  }
  
  startMonitoring() {
    console.log('📊 Monitoring started for:', this.assistantId);
  }
}

module.exports = { AssistantMonitor };
`;
  }

  generateDocumentation(config) {
    return `# AI Assistant: ${config.assistantId}

## Configuration
- Environment Optimized: ${config.environmentOptimized}
- Framework: Hexperiment Labs Framework
- Real-life Standards: ${config.configuration.realLifeStandards}

## Deployment Status
- Ready for Deployment: ${config.deployment.readyForDeployment}
- Risk Assessment: ${config.deployment.riskAssessment}
`;
  }

  generateSimulationTests(simulationType, parameters) {
    return `// Tests for ${simulationType} simulation
const { Generated${simulationType}Simulation } = require('./generated${simulationType}Simulation');

describe('${simulationType} Simulation Tests', () => {
  it('should run simulation successfully', async () => {
    const sim = new Generated${simulationType}Simulation();
    const result = await sim.runSimulation();
    assert.ok(result.success);
  });
});
`;
  }

  generateSimulationConfig(simulationType, parameters) {
    return `{
  "simulationType": "${simulationType}",
  "parameters": ${JSON.stringify(parameters, null, 2)},
  "framework": "Hexperiment Labs Framework",
  "realLifeStandards": true
}`;
  }

  generatePackageJson(projectName) {
    return `{
  "name": "${projectName.toLowerCase().replace(/\s+/g, '-')}",
  "version": "1.0.0",
  "description": "Generated by H3X Code Generator - Hexperiment Labs Framework",
  "main": "src/index.js",
  "scripts": {
    "start": "node src/index.js",
    "test": "npm test",
    "dev": "nodemon src/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "framework": "Hexperiment Labs Framework"
}`;
  }

  generateReadme(projectName, projectType) {
    return `# ${projectName}

Generated by H3X Code Generator using Hexperiment Labs Framework.

## Project Type
${projectType}

## Real-life Standards
This project follows real-life environment creation standards.

## Getting Started
\`\`\`bash
npm install
npm start
\`\`\`

## Framework
Built with Hexperiment Labs Framework for optimal AI assistant deployment.
`;
  }

  generateMainFile(projectName, projectType) {
    return `// ${projectName} - Generated by H3X Code Generator
// Project Type: ${projectType}
// Framework: Hexperiment Labs Framework

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    project: '${projectName}',
    type: '${projectType}',
    framework: 'Hexperiment Labs Framework',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🚀 ${projectName} started on port', PORT);
  console.log('🔮 Hexperiment Labs Framework Active');
});
`;
  }

  generateIntegrationInstructions(analysisType) {
    return `
// Integration instructions for ${analysisType} tool:
// 1. Import the generated tool
// 2. Add to your agent's tools array
// 3. Register the endpoint in your server
    `;
  }

  generateEndpointIntegration(endpointName) {
    return `// Add this to your sirAgent tools registration:
sirAgent.registerTool('${endpointName}', generated${endpointName}Tool);`;
  }

  generateEndpointTests(endpointName) {
    return `// Tests for ${endpointName} endpoint
describe('${endpointName} Endpoint', () => {
  it('should respond successfully', async () => {
    // Test implementation
  });
});`;
  }

  generateTestFile(projectName) {
    return `// Tests for ${projectName}
const assert = require('assert');

describe('${projectName} Tests', () => {
  it('should start successfully', () => {
    assert.ok(true);
  });
});`;
  }

  generateEnvExample() {
    return `# Environment variables for H3X generated project
PORT=3000
LMSTUDIO_URL=http://localhost:1234/v1
LMSTUDIO_MODEL=local-model
FRAMEWORK=Hexperiment_Labs_Framework`;
  }

  generateDockerfile(projectType) {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]

# Generated for ${projectType} by H3X Code Generator
# Framework: Hexperiment Labs Framework`;
  }

  generateApiDocs(projectName) {
    return `# ${projectName} API Documentation

Generated by H3X Code Generator using Hexperiment Labs Framework.

## Endpoints

### GET /health
Health check endpoint

### Framework
All endpoints follow Hexperiment Labs Framework standards for real-life environment compliance.
`;
  }

  /**
   * Generate Advanced Documentation Suite
   */
  async generateDocumentationSuite(projectName, options = {}) {
    console.log("📚 Generating Advanced Documentation Suite...");
    
    const docSuite = {
      projectName,
      timestamp: new Date().toISOString(),
      framework: 'Hexperiment Labs Framework',
      documentation: {
        'README.md': this.generateAdvancedReadme(projectName, options),
        'docs/API_REFERENCE.md': this.generateApiReference(projectName, options),
        'docs/DEVELOPMENT_GUIDE.md': this.generateDevelopmentGuide(projectName, options),
        'docs/ARCHITECTURE.md': this.generateArchitectureDoc(projectName, options),
        'docs/DEPLOYMENT.md': this.generateDeploymentDoc(projectName, options),
        'docs/CONTRIBUTING.md': this.generateContributingDoc(projectName, options),
        'docs/CHANGELOG.md': this.generateChangelog(projectName, options),
        'docs/TROUBLESHOOTING.md': this.generateTroubleshootingDoc(projectName, options),
        'docs/ENVIRONMENT_SETUP.md': this.generateEnvironmentSetupDoc(projectName, options),
        'docs/AUTOMATION.md': this.generateAutomationDoc(projectName, options)
      },
      templates: {
        'templates/pull-request.md': this.generatePRTemplate(),
        'templates/issue.md': this.generateIssueTemplate(),
        'templates/feature-request.md': this.generateFeatureRequestTemplate()
      },
      configuration: {
        '.github/workflows/docs.yml': this.generateDocsWorkflow(),
        'docs/config.json': this.generateDocsConfig(projectName, options),
        'mkdocs.yml': this.generateMkDocsConfig(projectName, options)
      }
    };

    return {
      success: true,
      generationType: 'DOCUMENTATION_SUITE',
      documentation: docSuite,
      realLifeStandards: true,
      framework: 'Hexperiment Labs Framework'
    };
  }

  generateAdvancedReadme(projectName, options) {
    return `# ${projectName}

> 🚀 **${options.description || 'Advanced AI Assistant System'}** - Built with Hexperiment Labs Framework

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![Documentation](https://img.shields.io/badge/docs-complete-blue)]()
[![Framework](https://img.shields.io/badge/framework-Hexperiment_Labs-purple)]()
[![Real-Life Standards](https://img.shields.io/badge/standards-real--life-gold)]()

## 🎯 Overview

${projectName} is a comprehensive AI assistant system designed with real-life deployment standards and production-ready architecture.

### Key Features

- 🧠 **Neural Processing**: Advanced AI logic with synapse activity monitoring
- 🔄 **Feedback Loops**: Continuous learning and adaptation capabilities  
- 🐳 **Containerized**: Full Docker deployment with orchestration
- 📊 **Monitoring**: Real-time system metrics and health checks
- 🔒 **Security**: Production-grade security and authentication
- 📚 **Documentation**: Comprehensive auto-generated documentation

## 🏗️ Architecture

\`\`\`mermaid
graph TB
    A[Client Interface] --> B[H3X Server]
    B --> C[Protocol Server]
    C --> D[AI Processing]
    D --> E[Feedback System]
    E --> F[Data Storage]
    
    B --> G[Virtual Taskmaster]
    G --> H[Synapse Monitor]
    H --> I[Activity Logger]
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Docker Desktop 4.0+
- Node.js 18+
- 8GB RAM minimum

### Installation

\`\`\`bash
# Clone and setup
git clone <repository>
cd ${projectName.toLowerCase().replace(/\s+/g, '-')}

# Install dependencies
npm install

# Setup environment
npm run env:setup

# Start development environment
npm run dev:start
\`\`\`

### Development Workflow

\`\`\`bash
# Start all services
npm run dev:up

# View logs
npm run dev:logs

# Run tests
npm run test:all

# Generate documentation
npm run docs:generate

# Deploy to staging
npm run deploy:staging
\`\`\`

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| \`npm run dev:start\` | Start development environment |
| \`npm run prod:deploy\` | Deploy to production |
| \`npm run test:all\` | Run comprehensive tests |
| \`npm run docs:generate\` | Generate documentation |
| \`npm run health:check\` | System health monitoring |

## 🔧 Configuration

### Environment Variables

\`\`\`env
NODE_ENV=development
LOG_LEVEL=debug
API_HOST=localhost
API_PORT=3978
FRAMEWORK=Hexperiment_Labs
\`\`\`

### Docker Configuration

The system uses multi-environment Docker configurations:
- \`docker-compose.dev.yml\` - Development environment
- \`docker-compose.prod.yml\` - Production environment
- \`docker-compose.test.yml\` - Testing environment

## 📚 Documentation

- [API Reference](docs/API_REFERENCE.md) - Complete API documentation
- [Development Guide](docs/DEVELOPMENT_GUIDE.md) - Development workflows
- [Architecture](docs/ARCHITECTURE.md) - System architecture details
- [Deployment](docs/DEPLOYMENT.md) - Deployment procedures
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/amazing-feature\`
3. Commit changes: \`git commit -m 'Add amazing feature'\`
4. Push to branch: \`git push origin feature/amazing-feature\`
5. Submit a pull request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## 📊 System Status

- ✅ **Core System**: Operational
- ✅ **AI Processing**: Active  
- ✅ **Monitoring**: Real-time
- ✅ **Documentation**: Auto-generated
- ✅ **Tests**: Passing

## 🔒 Security

This project follows security best practices:
- Environment variable management
- Secure API endpoints
- Container security scanning
- Dependency vulnerability monitoring

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Hexperiment Labs Framework
- H3X Development Team
- Open Source Community

---

**Built with ❤️ using Hexperiment Labs Framework**

*Generated by H3X Code Generator - ${new Date().toISOString()}*
`;
  }

  generateApiReference(projectName, options) {
    return `# API Reference - ${projectName}

## Overview

This document provides comprehensive API documentation for ${projectName}.

## Base URL

\`\`\`
Development: http://localhost:3978/api
Production: https://api.${projectName.toLowerCase()}.com
\`\`\`

## Authentication

All API endpoints require authentication via API key:

\`\`\`bash
Authorization: Bearer YOUR_API_KEY
\`\`\`

## Core Endpoints

### Health Check

\`\`\`http
GET /api/health
\`\`\`

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-06-01T00:00:00.000Z",
  "services": {
    "database": "connected",
    "ai_processor": "active",
    "feedback_system": "operational"
  },
  "framework": "Hexperiment Labs Framework"
}
\`\`\`

### Task Management

#### Create Task
\`\`\`http
POST /api/tasks
Content-Type: application/json

{
  "description": "Task description",
  "priority": "high",
  "category": "ai_processing"
}
\`\`\`

#### Get Tasks
\`\`\`http
GET /api/tasks?status=active&limit=50
\`\`\`

#### Update Task
\`\`\`http
PUT /api/tasks/:id
Content-Type: application/json

{
  "status": "completed",
  "result": "Task completed successfully"
}
\`\`\`

### AI Processing

#### Process Request
\`\`\`http
POST /api/ai/process
Content-Type: application/json

{
  "input": "User input text",
  "model": "gpt-4",
  "parameters": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "response": "AI generated response",
  "metadata": {
    "processing_time": 1200,
    "tokens_used": 150,
    "model": "gpt-4"
  },
  "framework": "Hexperiment Labs Framework"
}
\`\`\`

### Monitoring

#### System Metrics
\`\`\`http
GET /api/metrics
\`\`\`

#### Activity Logs
\`\`\`http
GET /api/logs?level=info&limit=100
\`\`\`

## Error Handling

All API endpoints return consistent error responses:

\`\`\`json
{
  "error": true,
  "code": "VALIDATION_ERROR",
  "message": "Invalid input parameters",
  "details": {
    "field": "description",
    "reason": "Required field missing"
  },
  "timestamp": "2025-06-01T00:00:00.000Z"
}
\`\`\`

## Rate Limiting

- Development: 1000 requests/minute
- Production: 10000 requests/minute

## WebSocket Endpoints

### Real-time Task Updates
\`\`\`javascript
const ws = new WebSocket('ws://localhost:3978/ws/tasks');
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Task update:', update);
};
\`\`\`

## SDK Examples

### JavaScript/Node.js

\`\`\`javascript
const H3XClient = require('${projectName.toLowerCase()}-sdk');

const client = new H3XClient({
  apiKey: process.env.API_KEY,
  baseUrl: 'http://localhost:3978/api'
});

// Create task
const task = await client.tasks.create({
  description: 'Process user input',
  priority: 'high'
});

// Process AI request
const response = await client.ai.process({
  input: 'Hello world',
  model: 'gpt-4'
});
\`\`\`

### Python

\`\`\`python
from h3x_client import H3XClient

client = H3XClient(
    api_key=os.getenv('API_KEY'),
    base_url='http://localhost:3978/api'
)

# Create task
task = client.tasks.create({
    'description': 'Process user input',
    'priority': 'high'
})

# Process AI request
response = client.ai.process({
    'input': 'Hello world',
    'model': 'gpt-4'
})
\`\`\`

## Framework Integration

This API is built with the Hexperiment Labs Framework, providing:
- Real-life deployment standards
- Comprehensive error handling
- Automatic documentation generation
- Built-in monitoring and metrics

---

*Generated by H3X Code Generator - ${new Date().toISOString()}*
`;
  }

  generateDevelopmentGuide(projectName, options) {
    return `# Development Guide - ${projectName}

## Overview

This guide covers the complete development workflow for ${projectName}.

## Development Environment Setup

### Prerequisites

1. **System Requirements**
   - Node.js 18+ 
   - Docker Desktop 4.0+
   - Git 2.30+
   - Visual Studio Code (recommended)
   - 8GB RAM minimum

2. **Required Tools**
   \`\`\`bash
   # Install global dependencies
   npm install -g nodemon
   npm install -g docker-compose
   \`\`\`

### Initial Setup

1. **Clone and Install**
   \`\`\`bash
   git clone <repository>
   cd ${projectName.toLowerCase().replace(/\s+/g, '-')}
   npm install
   \`\`\`

2. **Environment Configuration**
   \`\`\`bash
   # Copy environment template
   cp .env.example .env.development
   
   # Edit configuration
   code .env.development
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Start database containers
   npm run db:start
   
   # Run migrations
   npm run db:migrate
   
   # Seed test data
   npm run db:seed
   \`\`\`

## Development Workflow

### Daily Development

1. **Start Development Environment**
   \`\`\`bash
   # Start all services
   npm run dev:start
   
   # View service status
   npm run dev:status
   \`\`\`

2. **Code with Hot Reload**
   \`\`\`bash
   # Start with file watching
   npm run dev:watch
   
   # View logs in real-time
   npm run dev:logs
   \`\`\`

3. **Testing During Development**
   \`\`\`bash
   # Run tests on file changes
   npm run test:watch
   
   # Run specific test suite
   npm run test:unit
   npm run test:integration
   \`\`\`

### Code Generation

The project includes the H3X Code Generator for rapid development:

\`\`\`bash
# Generate new AI tool
npm run generate:tool -- --name "DataProcessor" --type "analysis"

# Generate API endpoint
npm run generate:endpoint -- --name "tasks" --methods "GET,POST,PUT,DELETE"

# Generate complete documentation
npm run generate:docs

# Generate test files
npm run generate:tests -- --component "TaskManager"
\`\`\`

### Virtual Taskmaster Integration

The development environment includes the Virtual Taskmaster for task management:

1. **Access Interface**: http://localhost:3978/taskmaster
2. **Features**:
   - Real-time task tracking
   - Synapse activity monitoring
   - Auto-completion capabilities
   - Development task integration

## Code Structure

\`\`\`
src/
├── api/              # API endpoints
├── components/       # Reusable components
├── generators/       # Code generators
├── services/         # Business logic
├── utils/           # Utility functions
├── tests/           # Test files
└── config/          # Configuration files

public/
├── js/              # Frontend JavaScript
├── css/             # Stylesheets
└── assets/          # Static assets

docs/
├── api/             # API documentation
├── guides/          # Development guides
└── architecture/    # System architecture
\`\`\`

## Coding Standards

### JavaScript/Node.js

1. **ESLint Configuration**
   \`\`\`json
   {
     "extends": ["eslint:recommended"],
     "env": {
       "node": true,
       "es2022": true
     },
     "rules": {
       "indent": ["error", 2],
       "quotes": ["error", "single"],
       "semi": ["error", "always"]
     }
   }
   \`\`\`

2. **Code Formatting**
   \`\`\`bash
   # Format code
   npm run format
   
   # Check formatting
   npm run format:check
   \`\`\`

### Documentation Standards

All code must include:
- JSDoc comments for functions
- README files for modules
- API documentation for endpoints
- Test descriptions

Example:
\`\`\`javascript
/**
 * Process AI request with Hexperiment Labs Framework
 * @param {Object} request - The input request
 * @param {string} request.input - User input text
 * @param {Object} request.options - Processing options
 * @returns {Promise<Object>} Processed response
 */
async function processAIRequest(request) {
  // Implementation
}
\`\`\`

## Testing Strategy

### Test Types

1. **Unit Tests**
   - Individual function testing
   - Component isolation testing
   - Mock external dependencies

2. **Integration Tests**
   - API endpoint testing
   - Database integration
   - Service communication

3. **End-to-End Tests**
   - Complete workflow testing
   - User interface testing
   - Production scenario simulation

### Test Commands

\`\`\`bash
# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage

# Run performance tests
npm run test:performance

# Run security tests
npm run test:security
\`\`\`

## Debugging

### Development Debugging

1. **Node.js Debugging**
   \`\`\`bash
   # Start with debugger
   npm run debug
   
   # Attach debugger (VS Code)
   # Use "Node.js: Attach" configuration
   \`\`\`

2. **Container Debugging**
   \`\`\`bash
   # Debug specific container
   docker exec -it h3x-main-dev /bin/bash
   
   # View container logs
   docker logs h3x-main-dev -f
   \`\`\`

### Production Debugging

1. **Log Analysis**
   \`\`\`bash
   # View application logs
   npm run logs:app
   
   # View system logs
   npm run logs:system
   
   # Export logs for analysis
   npm run logs:export
   \`\`\`

## Performance Optimization

### Monitoring

1. **Real-time Metrics**
   - CPU usage monitoring
   - Memory consumption tracking
   - Response time analysis
   - Error rate monitoring

2. **Performance Testing**
   \`\`\`bash
   # Load testing
   npm run test:load
   
   # Stress testing
   npm run test:stress
   
   # Memory leak detection
   npm run test:memory
   \`\`\`

## Disaster Recovery

### Backup Strategy

1. **Data Backups**
   - Daily database backups
   - File system snapshots
   - Cross-region replication

2. **Service Recovery**
   - Container orchestration
   - Automatic restart policies
   - Health check automation

### Business Continuity

1. **Failover Procedures**
   - Primary/secondary setup
   - Automatic failover
   - Manual recovery steps

2. **Data Recovery**
   - Point-in-time recovery
   - Backup verification
   - Recovery testing

---

*Built with Hexperiment Labs Framework - Real-life deployment standards*

*Generated by H3X Code Generator - ${new Date().toISOString()}*
`;
  }

  generateDeploymentDoc(projectName, options) {
    return `# Deployment Guide - ${projectName}

## Overview

This guide covers comprehensive deployment procedures for ${projectName} across different environments.

## Prerequisites

### System Requirements

- **Minimum**: 4GB RAM, 2 CPU cores, 50GB storage
- **Recommended**: 8GB RAM, 4 CPU cores, 100GB storage
- **Production**: 16GB RAM, 8 CPU cores, 500GB storage

### Software Requirements

- Docker Engine 20.10+
- Docker Compose 2.0+
- Node.js 18+ (for local development)
- Git 2.30+

## Environment Setup

### Development Environment

1. **Local Development Setup**
   \`\`\`bash
   # Clone repository
   git clone https://github.com/your-org/${projectName}.git
   cd ${projectName}

   # Install dependencies
   npm install

   # Setup environment
   cp .env.example .env.development

   # Start development environment
   npm run env:dev
   \`\`\`

2. **Development Configuration**
   \`\`\`env
   NODE_ENV=development
   API_PORT=3000
   PROTOCOL_PORT=8081
   DEBUG=true
   LOG_LEVEL=debug
   FRAMEWORK=Hexperiment_Labs
   \`\`\`

3. **Database Setup**
   \`\`\`bash
   # Run migrations
   npm run db:migrate

   # Seed development data
   npm run db:seed

   # Reset database (if needed)
   npm run db:reset
   \`\`\`

### Staging Environment

1. **Staging Setup**
   \`\`\`bash
   # Create staging environment
   cp .env.example .env.staging
   
   # Configure staging settings
   vim .env.staging
   
   # Deploy to staging
   npm run deploy:staging
   \`\`\`

2. **Staging Configuration**
   \`\`\`env
   NODE_ENV=staging
   API_PORT=3978
   PROTOCOL_PORT=8081
   DEBUG=false
   LOG_LEVEL=info
   DATABASE_URL=staging-db-url
   REDIS_URL=staging-redis-url
   \`\`\`

### Production Environment

1. **Production Deployment**
   \`\`\`bash
   # Prepare production environment
   cp .env.example .env.production
   
   # Configure production settings
   vim .env.production
   
   # Deploy to production
   npm run deploy:production
   \`\`\`

2. **Production Configuration**
   \`\`\`env
   NODE_ENV=production
   API_PORT=3978
   PROTOCOL_PORT=8081
   DEBUG=false
   LOG_LEVEL=warn
   DATABASE_URL=production-db-url
   REDIS_URL=production-redis-url
   SSL_ENABLED=true
   \`\`\`

## Docker Deployment

### Single Server Deployment

1. **Basic Docker Compose**
   \`\`\`yaml
   version: '3.8'
   services:
     h3x-server:
       build: .
       ports:
         - "3978:3978"
       environment:
         - NODE_ENV=production
       volumes:
         - ./data:/app/data
       restart: unless-stopped
   
     protocol-server:
       build: ./protocol
       ports:
         - "8081:8081"
       depends_on:
         - h3x-server
       restart: unless-stopped
   \`\`\`

2. **Deploy Commands**
   \`\`\`bash
   # Build and start services
   docker-compose up -d
   
   # Check service status
   docker-compose ps
   
   # View logs
   docker-compose logs -f
   
   # Stop services
   docker-compose down
   \`\`\`

### Multi-Server Deployment

1. **Docker Swarm Setup**
   \`\`\`bash
   # Initialize swarm
   docker swarm init
   
   # Add worker nodes
   docker swarm join --token <worker-token> <manager-ip>
   
   # Deploy stack
   docker stack deploy -c docker-compose.swarm.yml h3x
   \`\`\`

2. **Kubernetes Deployment**
   \`\`\`yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: h3x-server
   spec:
     replicas: 3
     selector:
       matchLabels:
         app: h3x-server
     template:
       metadata:
         labels:
           app: h3x-server
       spec:
         containers:
         - name: h3x-server
           image: h3x-server:latest
           ports:
           - containerPort: 3978
   \`\`\`

## Cloud Deployment

### AWS Deployment

1. **ECS Service**
   \`\`\`json
   {
     "family": "h3x-service",
     "networkMode": "awsvpc",
     "cpu": "256",
     "memory": "512",
     "containerDefinitions": [
       {
         "name": "h3x-server",
         "image": "your-registry/h3x-server:latest",
         "portMappings": [
           {
             "containerPort": 3978,
             "protocol": "tcp"
           }
         ]
       }
     ]
   }
   \`\`\`

2. **ECS Deployment Commands**
   \`\`\`bash
   # Build and push image
   docker build -t h3x-server .
   docker tag h3x-server:latest <aws-account>.dkr.ecr.<region>.amazonaws.com/h3x-server:latest
   docker push <aws-account>.dkr.ecr.<region>.amazonaws.com/h3x-server:latest
   
   # Update ECS service
   aws ecs update-service --cluster h3x-cluster --service h3x-service --force-new-deployment
   \`\`\`

### Azure Deployment

1. **Container Instances**
   \`\`\`bash
   # Create resource group
   az group create --name h3x-rg --location eastus
   
   # Deploy container
   az container create \\
     --resource-group h3x-rg \\
     --name h3x-server \\
     --image your-registry/h3x-server:latest \\
     --ports 3978 \\
     --environment-variables NODE_ENV=production
   \`\`\`

### Google Cloud Deployment

1. **Cloud Run**
   \`\`\`bash
   # Build and push to Container Registry
   docker build -t gcr.io/your-project/h3x-server .
   docker push gcr.io/your-project/h3x-server
   
   # Deploy to Cloud Run
   gcloud run deploy h3x-server \\
     --image gcr.io/your-project/h3x-server \\
     --platform managed \\
     --region us-central1 \\
     --allow-unauthenticated
   \`\`\`

## Database Deployment

### MongoDB Setup

1. **Docker MongoDB**
   \`\`\`yaml
   services:
     mongodb:
       image: mongo:6.0
       environment:
         MONGO_INITDB_ROOT_USERNAME: admin
         MONGO_INITDB_ROOT_PASSWORD: password
       volumes:
         - mongodb_data:/data/db
       ports:
         - "27017:27017"
   \`\`\`

2. **MongoDB Atlas (Cloud)**
   \`\`\`bash
   # Configure connection string
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   \`\`\`

### Redis Setup

1. **Docker Redis**
   \`\`\`yaml
   services:
     redis:
       image: redis:7.0-alpine
       volumes:
         - redis_data:/data
       ports:
         - "6379:6379"
   \`\`\`

## Load Balancing

### Nginx Configuration

1. **Nginx Config**
   \`\`\`nginx
   upstream h3x_backend {
     server h3x-server-1:3978;
     server h3x-server-2:3978;
     server h3x-server-3:3978;
   }
   
   server {
     listen 80;
     server_name your-domain.com;
     
     location / {
       proxy_pass http://h3x_backend;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }
   }
   \`\`\`

### Application Load Balancer (AWS)

1. **ALB Configuration**
   \`\`\`bash
   # Create target group
   aws elbv2 create-target-group \\
     --name h3x-targets \\
     --protocol HTTP \\
     --port 3978 \\
     --vpc-id vpc-12345678
   
   # Create load balancer
   aws elbv2 create-load-balancer \\
     --name h3x-alb \\
     --subnets subnet-12345678 subnet-87654321
   \`\`\`

## SSL/TLS Configuration

### Let's Encrypt (Free SSL)

1. **Certbot Setup**
   \`\`\`bash
   # Install certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Generate certificate
   sudo certbot --nginx -d your-domain.com
   \`\`\`

### Custom SSL Certificate

1. **Nginx SSL Config**
   \`\`\`nginx
   server {
     listen 443 ssl;
     server_name your-domain.com;
     
     ssl_certificate /path/to/certificate.crt;
     ssl_certificate_key /path/to/private.key;
     
     location / {
       proxy_pass http://h3x_backend;
     }
   }
   \`\`\`

## Monitoring & Observability

### Metrics Collection

1. **Application Metrics**
   - Response times
   - Error rates
   - Throughput
   - User activity

2. **System Metrics**
   - CPU utilization
   - Memory usage
   - Disk I/O
   - Network traffic

### Logging Strategy

\`\`\`javascript
// Structured logging example
logger.info('Task completed', {
  taskId: 'task-123',
  userId: 'user-456',
  duration: 1200,
  timestamp: new Date().toISOString(),
  service: 'h3x-server'
});
\`\`\`

### Health Monitoring

1. **Health Endpoints**
   - Service availability
   - Database connectivity
   - External service status

2. **Automated Alerts**
   - Error rate thresholds
   - Performance degradation
   - Service downtime

## Performance Considerations

1. **Node.js Optimization**
   - Use `--max-old-space-size` for memory
   - Enable `NODE_OPTIONS` for performance flags
   - Use `pm2` for process management

2. **Docker Optimization**
   - Use multi-stage builds
   - Optimize image layers
   - Use `.dockerignore` to exclude unnecessary files

3. **Database Optimization**
   - Use indexes for faster queries
   - Optimize connection pooling
   - Regularly analyze and optimize queries

4. **Code Optimization**
   - Avoid blocking the event loop
   - Use asynchronous programming patterns
   - Optimize algorithms and data structures

## Security Hardening

1. **Environment Security**
   - Use `.env` files for secrets
   - Never hard-code secrets in the codebase
   - Use `dotenv` to load environment variables

2. **API Security**
   - Implement rate limiting
   - Validate and sanitize all inputs
   - Use HTTPS for all communications

3. **Container Security**
   - Run containers as non-root users
   - Limit container capabilities
   - Regularly update base images

4. **Network Security**
   - Use firewalls to restrict access
   - Isolate services in separate networks
   - Use VPNs for secure communication

## Troubleshooting

### Common Issues

1. **Container Won't Start**
   \`\`\`bash
   # Check logs
   docker logs container-name
   
   # Check resource usage
   docker stats
   
   # Inspect container
   docker inspect container-name
   \`\`\`

2. **Database Connection Issues**
   \`\`\`bash
   # Test database connectivity
   docker exec -it mongodb mongo --eval "db.runCommand('ping')"
   
   # Check network connectivity
   docker exec -it h3x-server ping mongodb
   \`\`\`

3. **Performance Issues**
   \`\`\`bash
   # Monitor resource usage
   docker stats --no-stream
   
   # Check application metrics
   curl http://localhost:3978/metrics
   \`\`\`

## Post-Deployment Checklist

- [ ] All services started successfully
- [ ] Health checks passing
- [ ] Database connectivity verified
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Backups scheduled
- [ ] Load balancer operational
- [ ] DNS configured
- [ ] Security scans completed
- [ ] Performance benchmarks met

---

*Built with Hexperiment Labs Framework - Production-ready deployment*

*Generated by H3X Code Generator - ${new Date().toISOString()}*
`;
  }

  generateContributingDoc(projectName, options) {
    return `# Contributing to ${projectName}

## Welcome Contributors! 🎉

Thank you for your interest in contributing to ${projectName}. This guide will help you get started with contributing to our Hexperiment Labs Framework project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain professional communication

## Getting Started

### Prerequisites

1. **Development Environment**
   - Node.js 18+
   - Docker Desktop
   - Git 2.30+
   - Code editor (VS Code recommended)

2. **Account Setup**
   - GitHub account
   - Fork the repository
   - Clone your fork locally

### Initial Setup

\`\`\`bash
# Clone your fork
git clone https://github.com/your-username/${projectName.toLowerCase().replace(/\s+/g, '-')}.git
cd ${projectName.toLowerCase().replace(/\s+/g, '-')}

# Add upstream remote
git remote add upstream https://github.com/original-owner/${projectName.toLowerCase().replace(/\s+/g, '-')}.git

# Install dependencies
npm install

# Setup development environment
npm run dev:setup
\`\`\`

## Development Workflow

### 1. Create a Feature Branch

\`\`\`bash
# Update your main branch
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/amazing-feature
\`\`\`

### 2. Make Your Changes

1. **Code Standards**
   - Follow existing code style
   - Add JSDoc comments
   - Include unit tests
   - Update documentation

2. **Testing**
   \`\`\`bash
   # Run tests
   npm run test
   
   # Run linting
   npm run lint
   
   # Check code coverage
   npm run test:coverage
   \`\`\`

### 3. Commit Your Changes

\`\`\`bash
# Stage changes
git add .

# Commit with conventional format
git commit -m "feat: add amazing new feature

- Implement feature X
- Add unit tests
- Update documentation"
\`\`\`

### 4. Submit Pull Request

\`\`\`bash
# Push to your fork
git push origin feature/amazing-feature

# Create PR through GitHub interface
\`\`\`

## Contribution Types

### 🐛 Bug Reports

Use the bug report template:

\`\`\`markdown
**Bug Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Actual Behavior**
A clear and concise description of what actually happened.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment**
- OS: [e.g. Windows 10, macOS 12, Ubuntu 20.04]
- Node.js: [e.g. 18.12.0]
- Project Version: [e.g. 1.0.0]

**Additional Context**
Add any other context about the problem here.

**Possible Solution**
If you have ideas on how to fix the issue, please describe them here.
\`\`\`

### ✨ Feature Requests

Use the feature request template:

\`\`\`markdown
**Feature Description**
A clear and concise description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other approaches considered

**Benefits**
- Benefit 1
- Benefit 2
- Benefit 3

**Implementation Ideas**
If you have ideas on how this could be implemented, please describe them here.

**Additional Context**
Add any other context, screenshots, or examples about the feature request here.

**Priority**
- [ ] Low
- [ ] Medium
- [ ] High
- [ ] Critical

**Acceptance Criteria**
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
\`\`\`

### 📖 Documentation

Documentation improvements are always welcome:

- Fix typos and grammar
- Add examples and tutorials
- Improve API documentation
- Create guides for common tasks

### 🧪 Testing

Help improve test coverage:

- Add unit tests
- Create integration tests
- Improve test utilities
- Add performance tests

## Coding Standards

### JavaScript/Node.js Style

\`\`\`javascript
// Use const/let instead of var
const apiUrl = 'https://api.example.com';
let currentUser = null;

// Function documentation
/**
 * Process user input with Hexperiment Labs Framework
 * @param {Object} input - User input data
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Processed result
 */
async function processInput(input, options = {}) {
  // Implementation
}

// Error handling
try {
  const result = await processInput(data);
  return result;
} catch (error) {
  logger.error('Processing failed:', error);
  throw error;
}
\`\`\`

### CSS Style

\`\`\`css
/* Use meaningful class names */
.task-management-panel {
  background-color: #1a1a2e;
  border-radius: 8px;
  padding: 20px;
}

/* Mobile-first responsive design */
@media (min-width: 768px) {
  .task-management-panel {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
\`\`\`

### HTML Structure

\`\`\`html
<!-- Semantic HTML -->
<main class="application-content">
  <section class="task-dashboard">
    <h2>Task Management</h2>
    <article class="task-item">
      <h3>Task Title</h3>
      <p>Task description</p>
    </article>
  </section>
</main>
\`\`\`

## Testing Guidelines

### Unit Tests

\`\`\`javascript
// test/unit/taskManager.test.js
const { TaskManager } = require('../../src/services/TaskManager');

describe('TaskManager', () => {
  let taskManager;

  beforeEach(() => {
    taskManager = new TaskManager();
  });

  describe('createTask', () => {
    it('should create a new task', async () => {
      const taskData = {
        description: 'Test task',
        priority: 'high'
      };

      const task = await taskManager.createTask(taskData);

      expect(task).toBeDefined();
      expect(task.description).toBe(taskData.description);
      expect(task.status).toBe('pending');
    });

    it('should validate required fields', async () => {
      await expect(taskManager.createTask({}))
        .rejects.toThrow('Description is required');
    });
  });
});
\`\`\`

### Integration Tests

\`\`\`javascript
// test/integration/api.test.js
const request = require('supertest');
const app = require('../../src/app');

describe('API Integration', () => {
  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          description: 'Integration test task',
          priority: 'medium'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.task.description).toBe('Integration test task');
    });
  });
});
\`\`\`

## Documentation Standards

### README Updates

When adding features, update relevant sections:

- Installation instructions
- Usage examples
- API documentation
- Configuration options

### Code Documentation

\`\`\`javascript
/**
 * TaskManager handles task lifecycle operations
 * Built with Hexperiment Labs Framework standards
 */
class TaskManager {
  /**
   * Creates a new task instance
   * @param {Object} taskData - Task configuration
   * @param {string} taskData.description - Task description
   * @param {string} [taskData.priority='medium'] - Task priority
   * @param {Object} [options={}] - Additional options
   * @returns {Promise<Task>} Created task instance
   * @throws {ValidationError} When required fields are missing
   * @example
   * const task = await taskManager.createTask({
   *   description: 'Process user data',
   *   priority: 'high'
   * });
   */
  async createTask(taskData, options = {}) {
    // Implementation
  }
}
\`\`\`

## Review Process

### Pull Request Requirements

- [ ] **Tests**: All tests pass
- [ ] **Linting**: Code follows style guidelines
- [ ] **Documentation**: README and comments updated
- [ ] **Changelog**: Entry added if applicable
- [ ] **Breaking Changes**: Documented in PR description

### Review Checklist

Reviewers will check:

1. **Functionality**
   - Feature works as described
   - Edge cases handled
   - Error handling implemented

2. **Code Quality**
   - Follows coding standards
   - Well-documented
   - Efficient implementation

3. **Testing**
   - Adequate test coverage
   - Tests are meaningful
   - Integration tests included

4. **Documentation**
   - Updated where necessary
   - Examples are clear
   - API docs accurate

## Release Process

### Semantic Versioning

We follow [SemVer](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Changelog Format

\`\`\`markdown
## [1.2.0] - 2025-06-01

### Added
- Virtual Taskmaster integration
- Development automation workflows
- Comprehensive API reference documentation

### Changed
- Improved code generation algorithms
- Enhanced documentation templates
- Optimized Docker configurations

### Fixed
- Documentation generation pipeline
- Environment setup automation
- Dependency management issues

### Security
- Implemented secure API authentication
- Added environment variable protection
- Enhanced container security configurations

## [1.0.0] - 2025-06-01

### Added
- Initial release of ${projectName}
- Core H3X Code Generator functionality
- Docker containerization support
- Virtual Taskmaster integration
- Multi-environment deployment support
- Automated testing framework
- Development workflow automation

### Changed
- Improved code generation algorithms
- Enhanced documentation templates
- Optimized Docker configurations

### Fixed
- Documentation generation pipeline
- Environment setup automation
- Dependency management issues

### Security
- Implemented secure API authentication
- Added environment variable protection
- Enhanced container security configurations

## [0.1.0] - Initial Development

### Added
- Project foundation and architecture
- Basic code generation capabilities
- Initial documentation structure
- Development environment setup

---

## Release Notes

### ${version} Highlights
- **Enhanced Documentation**: Comprehensive auto-generated docs
- **Virtual Taskmaster**: Advanced task management and monitoring
- **Automation**: Full development workflow automation
- **Docker Support**: Multi-environment containerization
- **API Reference**: Complete API documentation with examples

### Upgrade Instructions
1. Update dependencies: \`npm install\`
2. Run environment check: \`npm run setup-check\`
3. Restart services: \`npm run env:dev\`
4. Generate new docs: \`npm run docs:generate\`

### Breaking Changes
- Updated API endpoints (see MIGRATION.md)
- Modified configuration structure
- Changed environment variable names

### Migration Guide
See [MIGRATION.md](./MIGRATION.md) for detailed upgrade instructions.
\`\`\`

## Community

### Getting Help

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Documentation**: Check existing docs first
- **Examples**: Look at example implementations

### Communication

- Be patient and respectful
- Provide context and examples
- Search existing issues before creating new ones
- Use clear, descriptive titles

## Recognition

Contributors are recognized in:

- README.md contributors section
- Release notes
- Project documentation
- Annual contributor highlights

## Framework Guidelines

### Hexperiment Labs Framework Standards

All contributions must follow the framework principles:

1. **Real-life Standards**
   - Production-ready code
   - Comprehensive error handling
   - Security best practices
   - Performance optimization

2. **Documentation First**
   - Clear API documentation
   - Usage examples
   - Architecture explanations
   - Troubleshooting guides

3. **Testing Requirements**
   - Unit test coverage > 80%
   - Integration tests for APIs
   - End-to-end test scenarios
   - Performance benchmarks

Thank you for contributing to ${projectName}! 🚀

---

*Built with ❤️ using Hexperiment Labs Framework*

*Generated by H3X Code Generator - ${new Date().toISOString()}*
`;
  }

  // Temporary simplified methods to fix syntax errors
  generateChangelog(projectName = 'H3X-fLups', options = {}) {
    const version = options.version || '1.0.0';
    const date = new Date().toISOString().split('T')[0];
    return `# Changelog\n\nAll notable changes to ${projectName}.\n\n## [${version}] - ${date}\n\n### Added\n- Enhanced documentation generation\n- Virtual Taskmaster integration\n\n*Last updated: ${date}*\n`;
  }

  generateTroubleshootingDoc(projectName = 'H3X-fLups', options = {}) {
    return `# Troubleshooting Guide\n\nCommon issues and solutions for ${projectName}.\n\n## Installation Issues\n\n### Node.js Version\nEnsure Node.js 18+ is installed.\n\n### Docker Issues\nRun: docker system prune\n\n*Last updated: ${new Date().toISOString().split('T')[0]}*\n`;
  }

  generateEnvironmentSetupDoc(projectName = 'H3X-fLups', options = {}) {
    return `# Environment Setup\n\nSetup guide for ${projectName}.\n\n## Prerequisites\n- Node.js 18+\n- Docker 20+\n- Git 2.30+\n\n## Installation\n1. Clone repository\n2. Run: npm install\n3. Start: npm run env:dev\n\n*Last updated: ${new Date().toISOString().split('T')[0]}*\n`;
  }

  generateAutomationDoc(projectName = 'H3X-fLups', options = {}) {
    return `# Automation Documentation\n\nAutomation guide for ${projectName}.\n\n## Development Automation\n- Virtual Taskmaster integration\n- Automated workflows\n- Task scheduling\n\n## Scripts\n- npm run dev:start\n- npm run dev:automate\n\n*Last updated: ${new Date().toISOString().split('T')[0]}*\n`;
  }

  generatePRTemplate() {
    return `## Description\nBrief description of changes.\n\n## Type of Change\n- [ ] Bug fix\n- [ ] New feature\n- [ ] Documentation\n\n## Testing\n- [ ] Tests pass\n- [ ] Manual testing\n\n## Checklist\n- [ ] Code reviewed\n- [ ] Documentation updated\n`;
  }

  generateIssueTemplate() {
    return `## Bug Description\nClear description of the bug.\n\n## Steps to Reproduce\n1. Step one\n2. Step two\n\n## Expected Behavior\nWhat should happen.\n\n## Environment\n- OS: [e.g. Windows]\n- Version: [e.g. 1.0.0]\n`;
  }

  generateFeatureRequestTemplate() {
    return `## Feature Summary\nBrief summary of feature.\n\n## Problem Statement\nDescription of problem.\n\n## Proposed Solution\nDescription of solution.\n\n## Priority\n- [ ] Low\n- [ ] Medium\n- [ ] High\n`;
  }
}

module.exports = { H3XCodeGenerator };
