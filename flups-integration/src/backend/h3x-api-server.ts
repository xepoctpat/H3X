// H3X Enhanced API Server
// Comprehensive backend integration for H3X system with WebSocket support

import express = require('express');
import http = require('http');
import WebSocket = require('ws');
import fs = require('fs');
import path = require('path');
import { spawn } from 'child_process';
import chokidar = require('chokidar');

class H3XAPIServer {
  constructor(port = 3008) {
    this.port = port;
    this.app = express();
    this.server = http.createServer(this.app);
    this.wss = new WebSocket.Server({ server: this.server });
    this.clients = new Set();
    this.metrics = {
      startTime: Date.now(),
      requestCount: 0,
      activeConnections: 0,
      lastActivity: Date.now(),
    };

    this.setupMiddleware();
    this.setupRoutes();
    this.setupWebSocket();
    this.setupFileWatchers();
  }

  setupMiddleware() {
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.static('.'));
    this.app.use(this.requestLogger.bind(this));
    this.app.use(this.corsHandler.bind(this));
  }

  requestLogger(req, res, next) {
    this.metrics.requestCount++;
    this.metrics.lastActivity = Date.now();
    console.log(`[H3X-API] ${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  }

  corsHandler(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  }

  setupRoutes() {
    // Health and Status
    this.app.get('/health', this.getHealth.bind(this));
    this.app.get('/status', this.getSystemStatus.bind(this));
    this.app.get('/metrics', this.getMetrics.bind(this));

    // Configuration Management
    this.app.get('/api/config', this.getConfig.bind(this));
    this.app.post('/api/config', this.updateConfig.bind(this));
    this.app.put('/api/config/reset', this.resetConfig.bind(this));

    // Loop Management
    this.app.get('/api/loops/:type', this.getLoopData.bind(this));
    this.app.post('/api/loops/:type/create', this.createLoop.bind(this));
    this.app.get('/api/loops/:type/instances', this.getLoopInstances.bind(this));
    this.app.delete('/api/loops/:type/:instanceId', this.deleteLoopInstance.bind(this));

    // Amendment Logging
    this.app.get('/api/amendments', this.getAmendments.bind(this));
    this.app.post('/api/amendments', this.createAmendment.bind(this));
    this.app.get('/api/amendments/:type', this.getAmendmentsByType.bind(this));

    // Archive Management
    this.app.get('/api/archives', this.listArchives.bind(this));
    this.app.post('/api/archives/export', this.exportArchive.bind(this));
    this.app.post('/api/archives/import', this.importArchive.bind(this));
    this.app.delete('/api/archives/:filename', this.deleteArchive.bind(this));

    // System Operations
    this.app.post('/api/system/checkpoint', this.createCheckpoint.bind(this));
    this.app.post('/api/system/backup', this.createBackup.bind(this));
    this.app.get('/api/system/logs', this.getSystemLogs.bind(this));
    this.app.post('/api/system/restart', this.restartSystem.bind(this));

    // Real-time Data
    this.app.get('/api/realtime/activity', this.getRealtimeActivity.bind(this));
    this.app.get('/api/realtime/stats', this.getRealtimeStats.bind(this));
  }

  setupWebSocket() {
    this.wss.on('connection', (ws, req) => {
      this.metrics.activeConnections++;
      this.clients.add(ws);

      console.log(`[H3X-WS] Client connected from ${req.socket.remoteAddress}`);

      // Send initial system state
      this.sendToClient(ws, {
        type: 'system_status',
        data: this.getSystemStatusData(),
      });

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleWebSocketMessage(ws, data);
        } catch (error) {
          this.sendToClient(ws, {
            type: 'error',
            data: { message: 'Invalid JSON message' },
          });
        }
      });

      ws.on('close', () => {
        this.metrics.activeConnections--;
        this.clients.delete(ws);
        console.log('[H3X-WS] Client disconnected');
      });

      ws.on('error', (error) => {
        console.error('[H3X-WS] WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  setupFileWatchers() {
    const watchFiles = [
      'H3X-config.json',
      'flup-n-amendments.log',
      'cFLup-instances.log',
      'fLup-out.log',
      'fLup-recurse.log',
      'H3X-instances.log',
    ];

    watchFiles.forEach((file) => {
      if (fs.existsSync(file)) {
        chokidar.watch(file).on('change', () => {
          this.broadcastFileChange(file);
        });
      }
    });
  }

  // API Route Handlers
  async getHealth(req, res) {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.metrics.startTime,
    });
  }

  async getSystemStatus(req, res) {
    try {
      const status = this.getSystemStatusData();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMetrics(req, res) {
    const metrics = {
      ...this.metrics,
      uptime: Date.now() - this.metrics.startTime,
      memoryUsage: process.memoryUsage(),
      activeWebSocketConnections: this.clients.size,
    };
    res.json(metrics);
  }

  async getConfig(req, res) {
    try {
      const config = this.readConfigFile();
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read config' });
    }
  }

  async updateConfig(req, res) {
    try {
      const newConfig = { ...this.readConfigFile(), ...req.body };
      fs.writeFileSync('H3X-config.json', JSON.stringify(newConfig, null, 2));

      this.broadcast({
        type: 'config_updated',
        data: newConfig,
      });

      res.json({ success: true, config: newConfig });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async resetConfig(req, res) {
    try {
      const defaultConfig = {
        timeAggregation: true,
        logDiffs: false,
        proofSync: true,
        verbose: true,
        enableSwapping: true,
        hexLatticeMode: true,
        triadPerfection: true,
      };

      fs.writeFileSync('H3X-config.json', JSON.stringify(defaultConfig, null, 2));
      res.json({ success: true, config: defaultConfig });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLoopData(req, res) {
    try {
      const { type } = req.params;
      const data = this.readLoopTypeData(type);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createLoop(req, res) {
    try {
      const { type } = req.params;
      const result = await this.executeH3XCommand(['create-cflup']);

      this.broadcast({
        type: 'loop_created',
        data: { type, result },
      });

      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getLoopInstances(req, res) {
    try {
      const { type } = req.params;
      const instances = this.getLoopInstancesData(type);
      res.json(instances);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAmendments(req, res) {
    try {
      const amendments = this.readAmendmentsLog();
      res.json({ amendments });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createAmendment(req, res) {
    try {
      const amendment = {
        timestamp: new Date().toISOString(),
        ...req.body,
      };

      this.logAmendment(amendment);

      this.broadcast({
        type: 'amendment_created',
        data: amendment,
      });

      res.json({ success: true, amendment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportArchive(req, res) {
    try {
      const { loopType, filename } = req.body;
      const result = await this.executeH3XCommand(['export-loop-archive', loopType, filename]);
      res.json({ success: true, result, filename });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async listArchives(req, res) {
    try {
      const archives = this.getArchiveList();
      res.json({ archives });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Utility Methods
  readConfigFile() {
    if (fs.existsSync('H3X-config.json')) {
      return JSON.parse(fs.readFileSync('H3X-config.json', 'utf8'));
    }
    return {};
  }

  readAmendmentsLog() {
    if (fs.existsSync('flup-n-amendments.log')) {
      const content = fs.readFileSync('flup-n-amendments.log', 'utf8');
      return content
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line));
    }
    return [];
  }

  logAmendment(amendment) {
    const logEntry = JSON.stringify(amendment) + '\n';
    fs.appendFileSync('flup-n-amendments.log', logEntry);
  }

  getSystemStatusData() {
    return {
      merger: fs.existsSync('H3X-merger.js') ? 'online' : 'offline',
      ui: 'online',
      logs: this.checkLogsStatus(),
      config: this.readConfigFile(),
      uptime: Date.now() - this.metrics.startTime,
      connections: this.clients.size,
    };
  }

  checkLogsStatus() {
    const logFiles = ['flup-n-amendments.log', 'cFLup-instances.log'];
    const existingLogs = logFiles.filter((file) => fs.existsSync(file));
    return existingLogs.length > 0 ? 'available' : 'empty';
  }

  async executeH3XCommand(args) {
    return new Promise((resolve, reject) => {
      const child = spawn('node', ['H3X-merger.js', ...args]);
      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(error || `Command failed with code ${code}`));
        }
      });
    });
  }

  // WebSocket Methods
  handleWebSocketMessage(ws, data) {
    switch (data.type) {
      case 'subscribe':
        this.handleSubscription(ws, data.channels);
        break;
      case 'ping':
        this.sendToClient(ws, { type: 'pong', timestamp: Date.now() });
        break;
      case 'get_status':
        this.sendToClient(ws, {
          type: 'status_update',
          data: this.getSystemStatusData(),
        });
        break;
      default:
        this.sendToClient(ws, {
          type: 'error',
          data: { message: `Unknown message type: ${data.type}` },
        });
    }
  }

  sendToClient(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message) {
    this.clients.forEach((client) => {
      this.sendToClient(client, message);
    });
  }

  broadcastFileChange(filename) {
    this.broadcast({
      type: 'file_changed',
      data: { filename, timestamp: Date.now() },
    });
  }

  getArchiveList() {
    return fs
      .readdirSync('.')
      .filter((file) => file.endsWith('.json') && file.includes('archive'))
      .map((file) => ({
        filename: file,
        size: fs.statSync(file).size,
        modified: fs.statSync(file).mtime,
      }));
  }

  start() {
    this.server.listen(this.port, () => {
      console.log(`[H3X-API] Enhanced API Server running on http://localhost:${this.port}`);
      console.log(`[H3X-API] WebSocket endpoint: ws://localhost:${this.port}`);
      console.log(`[H3X-API] Health check: http://localhost:${this.port}/health`);
    });
  }

  stop() {
    this.server.close();
    this.wss.close();
    console.log('[H3X-API] Server stopped');
  }
}

// Export for use as module or run directly
export = H3XAPIServer;

if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new H3XAPIServer();
  server.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n[H3X-API] Shutting down gracefully...');
    server.stop();
    process.exit(0);
  });
}
