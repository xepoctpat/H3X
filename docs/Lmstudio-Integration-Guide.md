# H3X SIR Control Interface - LMStudio Integration Guide

## 🔮 Overview

This guide will help you connect your H3X SIR Control Interface to LMStudio for local AI processing
without requiring GitHub API keys.

## 📋 Prerequisites

### 1. LMStudio Setup

1. **Download LMStudio**: Visit [https://lmstudio.ai/](https://lmstudio.ai/) and download LMStudio
   for your platform
2. **Install a Model**:
   - Open LMStudio
   - Go to the "Search" tab
   - Download a model (recommended: Llama 3.1 8B, Mistral 7B, or CodeLlama)
   - Wait for the download to complete

### 2. Start LMStudio Server

1. **Load the Model**:

   - Go to "Chat" tab in LMStudio
   - Select your downloaded model
   - Click "Load Model"

2. **Start Local Server**:
   - Go to "Local Server" tab
   - Click "Start Server"
   - Note the server URL (usually `http://localhost:1234`)
   - Keep LMStudio running

### 3. Install Dependencies

```bash
# Make sure you have the required dependencies
npm install express cors
```

## 🚀 Quick Start

### Option 1: Use Default Configuration

```bash
# Start H3X with LMStudio (uses default localhost:1234)
npm run lmstudio
```

### Option 2: Custom Configuration

```bash
# Set custom LMStudio URL and model
set LMSTUDIO_URL=http://localhost:1234/v1
set LMSTUDIO_MODEL=your-model-name
npm run lmstudio
```

### Option 3: Development Mode

```bash
# Start with auto-reload
npm run lmstudio:dev
```

## 🧪 Testing the Integration

### Method 1: Interactive Test Client

```bash
# Start the interactive test client
npm run lmstudio:test
```

### Method 2: Manual Testing

1. **Health Check**:

   ```bash
   curl http://localhost:3979/health
   ```

2. **Chat Test**:

   ```bash
   curl -X POST http://localhost:3979/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Analyze the current laboratory environment"}'
   ```

3. **SIR Analysis**:
   ```bash
   curl -X POST http://localhost:3979/sir-analysis \
     -H "Content-Type: application/json" \
     -d '{"environment": "laboratory", "analysisType": "environmental_scan"}'
   ```

## 🎯 Available Features

### 1. **Intelligent Message Processing**

- Natural language understanding
- Automatic tool selection
- Context-aware responses

### 2. **SIR Analysis Tools**

- Environmental scanning
- Simulation status monitoring
- AI readiness assessment

### 3. **Environment Simulation**

- Standard simulations
- Stress testing
- Custom scenarios

### 4. **System Monitoring**

- Health checks
- Performance monitoring
- Compliance verification

### 5. **Human Supervision**

- Approval workflows
- Review processes
- Intervention requests

## 🔧 API Endpoints

| Endpoint        | Method | Description            |
| --------------- | ------ | ---------------------- |
| `/health`       | GET    | Health check           |
| `/chat`         | POST   | Main chat interface    |
| `/sir-analysis` | POST   | Direct SIR analysis    |
| `/simulate`     | POST   | Environment simulation |
| `/monitor`      | POST   | System monitoring      |
| `/status`       | GET    | System status          |
| `/api-docs`     | GET    | API documentation      |

## 💡 Example Usage

### Chat Interface

```javascript
// Send a message to SIR
const response = await fetch('http://localhost:3979/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Run a stress test simulation for the industrial environment',
    context: { user: 'researcher', session: 'lab_001' },
  }),
});
```

### Direct Tool Access

```javascript
// Direct SIR analysis
const analysis = await fetch('http://localhost:3979/sir-analysis', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    environment: 'laboratory',
    analysisType: 'ai_readiness',
    parameters: 'comprehensive assessment',
  }),
});
```

## 🔍 Troubleshooting

### LMStudio Connection Issues

1. **Check LMStudio Server**:

   - Ensure LMStudio is running
   - Verify server is started in "Local Server" tab
   - Confirm URL is `http://localhost:1234`

2. **Model Loading**:
   - Make sure a model is loaded in LMStudio
   - Check model compatibility
   - Try reloading the model

### H3X Server Issues

1. **Port Conflicts**:

   - Default port is 3979
   - Change with: `set PORT=3980 && npm run lmstudio`

2. **Dependency Issues**:
   ```bash
   npm install
   npm run lmstudio
   ```

### Common Error Messages

- **"LMStudio request failed"**: LMStudio server not running or wrong URL
- **"Tool execution failed"**: Check tool parameters and framework setup
- **"Cannot connect to server"**: H3X server not started

## 🎮 Interactive Commands

When using the test client (`npm run lmstudio:test`):

- **Chat**: Just type your message
- **status**: Show system status
- **test analysis**: Test SIR analysis tool
- **test simulation**: Test environment simulation
- **test monitoring**: Test monitoring tool
- **help**: Show available commands
- **exit**: Quit the client

## 🔮 Advanced Configuration

### Environment Variables

```bash
# LMStudio configuration
set LMSTUDIO_URL=http://localhost:1234/v1
set LMSTUDIO_MODEL=llama-3.1-8b-instruct

# Server configuration
set PORT=3979
set NODE_ENV=development

# Framework settings
set SIR_MODE=PASSIVE
set FRAMEWORK_DEBUG=true
```

### Custom Model Settings

The system works with any LMStudio-compatible model. Recommended models:

- **Llama 3.1 8B Instruct** - Best overall performance
- **Mistral 7B Instruct** - Fast and efficient
- **CodeLlama 7B** - Good for technical analysis
- **Phi-3 Mini** - Lightweight option

## 🎯 Next Steps

1. **Test the Integration**: Use `npm run lmstudio:test` to verify everything works
2. **Explore SIR Tools**: Try different analysis types and simulations
3. **Custom Workflows**: Build custom analysis workflows using the API
4. **UI Integration**: Connect to the upcoming Phase 1 UI dashboard

## 📚 Related Documentation

- [SIR No-OpenAI Completion Summary](NO-OPENAI-COMPLETION-SUMMARY.md)
- [Standalone Guide](STANDALONE-GUIDE.md)
- [Hexperiment Framework Documentation](src/framework/README.md)

---

🔮 **H3X SIR Control Interface** - Powered by Hexperiment Labs Framework
