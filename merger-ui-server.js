// merger-ui-server.js
// Enhanced H3Xbase backend with integration to new API server
const express = require('express');
const fs = require('fs');
const H3XService = require('./src/backend/h3x-service.js');
const app = express();
const PORT = 3007;

const CONFIG_FILE = 'H3X-config.json';
const STATE_FILE = 'flup-n-amendments.log';

// Initialize H3X Service
const h3xService = new H3XService();

app.use(express.static('.'));
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'H3X Merger UI',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Legacy endpoints for backward compatibility
app.get('/merger-config.json', (req, res) => {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    res.json(cfg);
  } catch {
    res.status(404).json({});
  }
});

app.post('/merger-config.json', (req, res) => {
  try {
    h3xService.saveConfig(req.body);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/merger-state.json', (req, res) => {
  try {
    const lines = fs.readFileSync(STATE_FILE, 'utf8').split(/\r?\n/).filter(Boolean);
    const amendments = lines.map(line => JSON.parse(line));
    res.json({ amendments });
  } catch {
    res.json({ amendments: [] });
  }
});

// Enhanced API endpoints using H3XService
app.get('/api/system/status', async (req, res) => {
  try {
    const status = await h3xService.getSystemStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/metrics', (req, res) => {
  try {
    const metrics = h3xService.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/loops/cflup/instances', async (req, res) => {
  try {
    const instances = await h3xService.listCFlupInstances();
    res.json(instances);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/loops/cflup/create', async (req, res) => {
  try {
    const result = await h3xService.createCFlupInstance();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/amendments', (req, res) => {
  try {
    res.json({ amendments: h3xService.state.amendments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/amendments', (req, res) => {
  try {
    const { type, instanceId, summary, data } = req.body;
    const amendment = h3xService.logAmendment(type, instanceId, summary, data);
    res.json({ success: true, amendment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/archives', (req, res) => {
  try {
    const archives = h3xService.listArchives();
    res.json({ archives });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/archives/export', async (req, res) => {
  try {
    const { loopType, filename } = req.body;
    const result = await h3xService.exportLoopArchive(loopType, filename);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/checkpoint', async (req, res) => {
  try {
    const result = await h3xService.createCheckpoint();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/realtime/activity', (req, res) => {
  try {
    const activity = h3xService.getRealtimeActivity();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down H3X UI server...');
  h3xService.destroy();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`H3Xbase Merger UI server running at http://localhost:${PORT}/merger-ui.html`);
  console.log(`Enhanced API available at http://localhost:${PORT}/api/`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
